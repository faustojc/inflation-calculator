import { computed, map } from "nanostores";
import type {
	AreaDef,
	AreaHierarchy,
	AreaManifest,
	CommodityDef,
	DataIndex,
	DataType,
	SearchOption,
	TreeNode,
	YearlyDataFile,
} from "@/lib/types";
import type { IncomeClass } from "@/stores/inflationStore";
import {
	FETCH_CACHE,
	formatLocationName,
	GLOBAL_INDEX,
	INDEXED_KEYS,
	MANIFEST_CACHE,
} from "@/utils/metadata";
import { fetchWithCache, invalidateIfDataChanged } from "@/utils/storage";

// the API_URL
function cpiUrl(path: string): string {
	return `/api/cpi?key=api/v2/${path}`;
}

interface DataState {
	isLoading: boolean;
	isReady: boolean;
	error: string | null;
	areas: AreaDef[];
	commodities: CommodityDef[];
	availableYears: string[];
	currentManifest: AreaManifest | null;
	searchOptions: SearchOption[];
	flatCodes: string[]; // Sorted by length desc
	parentIndex: Record<string, string>;
	metaYearRange: {
		official: { min: number; max: number };
		personal: { min: number; max: number };
	} | null;
}

interface Metadata {
	generated_at: string;
	year_range: {
		official: { min: number; max: number };
		personal: { min: number; max: number };
	};
	areas: AreaDef[];
}

export const dataStore = map<DataState>({
	isLoading: true,
	isReady: false,
	error: null,
	areas: [],
	commodities: [],
	availableYears: [],
	currentManifest: null,
	searchOptions: [],
	flatCodes: [],
	parentIndex: {},
	metaYearRange: null,
});

export async function initializeApp() {
	if (dataStore.get().commodities.length > 0) return;

	try {
		dataStore.setKey("isLoading", true);

		let [metaRes, commRes] = await Promise.all([
			fetchWithCache(cpiUrl("metadata.json"), "network-first"),
			fetchWithCache(cpiUrl("commodities.json"), "network-first"),
		]);

		if (!metaRes.ok || !commRes.ok) throw new Error("Failed to load data configurations");

		const tempMeta: Metadata = await metaRes.clone().json();
		const wasInvalidated = await invalidateIfDataChanged(tempMeta.generated_at);

		if (wasInvalidated) {
			[metaRes, commRes] = await Promise.all([
				fetchWithCache(cpiUrl("metadata.json"), "network-first"),
				fetchWithCache(cpiUrl("commodities.json"), "network-first"),
			]);

			if (!metaRes.ok || !commRes.ok) throw new Error("Failed to reload data after cache invalidation");
		}

		const meta: Metadata = await metaRes.json();
		let commodities: CommodityDef[] = await commRes.json();
		const years: string[] = [];
		const flatCodes: string[] = [];
		const parentIndex: Record<string, string> = {};

		commodities = commodities.filter((c) => c.code !== "0");
		const traverse = (nodes: CommodityDef[], parentCode: string | null) => {
			for (const node of nodes) {
				flatCodes.push(node.code);

				if (parentCode) {
					parentIndex[node.code] = parentCode;
				}

				if (node.children) {
					traverse(node.children, node.code);
				}
			}
		};

		traverse(commodities, null);
		flatCodes.sort((a, b) => b.length - a.length);

		// Use the widest range (official goes back further)
		const globalMin = Math.min(meta.year_range.official.min, meta.year_range.personal.min);
		const globalMax = Math.max(meta.year_range.official.max, meta.year_range.personal.max);
		for (let y = globalMax; y >= globalMin; y--) {
			years.push(String(y));
		}

		const searchOptions: SearchOption[] = [];
		const seen = new Set<string>();
		const extractKeywords = (nodes: CommodityDef[]) => {
			for (const node of nodes) {
				if (node.keywords) {
					for (const kw of node.keywords) {
						const dedupeKey = `${node.code}|${kw}`;
						if (seen.has(dedupeKey)) continue;
						seen.add(dedupeKey);

						searchOptions.push({
							keyword: kw,
							keywordLower: kw.toLowerCase(),
							code: node.code,
							commodityName: node.name,
						});
					}
				}

				if (node.children) {
					extractKeywords(node.children);
				}
			}
		};

		extractKeywords(commodities);

		meta.areas.forEach((area) => {
			area.name = formatLocationName(area.name);
		});

		await setCurrentArea(meta.areas.at(1)!.key);

		dataStore.set({
			...dataStore.get(),
			areas: meta.areas,
			availableYears: years,
			commodities,
			searchOptions,
			error: null,
			flatCodes,
			parentIndex,
			metaYearRange: meta.year_range,
		});

		return meta;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		console.error(err);
		dataStore.setKey("error", "Could not load application data.");
		dataStore.setKey("isLoading", false);
		dataStore.setKey("isReady", false);
	}
}

export async function getAreaManifest(areaKey: string): Promise<AreaManifest | null> {
	if (MANIFEST_CACHE.has(areaKey)) {
		return MANIFEST_CACHE.get(areaKey)!;
	}

	const manifestPromise = fetchWithCache(cpiUrl(`data/${areaKey}/manifest.json`), "cache-first")
		.then(async (r) => {
			if (r.ok && r.headers.get("content-type")?.includes("application/json")) {
				return r.json();
			}
			return null;
		})
		.catch((error) => {
			console.warn(`Failed to load manifest for ${areaKey}`, error);
			return null;
		});

	MANIFEST_CACHE.set(areaKey, manifestPromise);
	return manifestPromise;
}

export async function setCurrentArea(areaKey: string) {
	const manifest = await getAreaManifest(areaKey);
	if (manifest) {
		dataStore.setKey("currentManifest", manifest);
	}
}

function fetchYearlyData(area: string, year: number): Promise<YearlyDataFile | null> {
	const cacheKey = `${area}|${year}`;
	let promise = FETCH_CACHE.get(cacheKey);

	if (!promise) {
		promise = fetchWithCache(cpiUrl(`data/${area}/${year}.json`), "cache-first")
			.then((r) => {
				if (r.ok && r.headers.get("content-type")?.includes("application/json")) {
					return r.json();
				}
				return null;
			})
			.catch((error) => {
				console.warn(`Failed to load ${cacheKey}`, error);
				return null;
			});

		FETCH_CACHE.set(cacheKey, promise);
	}

	return promise;
}

function indexFile(file: YearlyDataFile, incomeClass: IncomeClass) {
	const indexKey = `${file.area}|${file.year}|${incomeClass}`;
	if (INDEXED_KEYS.has(indexKey)) return;

	for (const type of Object.keys(file.data)) {
		const dataType = type as DataType;
		const dataTypeBlock = file.data[dataType];
		if (!dataTypeBlock?.[incomeClass]) continue;

		for (const [code, values] of Object.entries(dataTypeBlock[incomeClass])) {
			for (let i = 0; i < values.length; i++) {
				const val = values[i];
				if (val !== null && val !== undefined) {
					GLOBAL_INDEX[file.area] ??= {};
					GLOBAL_INDEX[file.area]![file.year] ??= {};
					GLOBAL_INDEX[file.area]![file.year]![dataType] ??= {};
					GLOBAL_INDEX[file.area]![file.year]![dataType]![i + 1] ??= {};
					GLOBAL_INDEX[file.area]![file.year]![dataType]![i + 1]![code] = val;
				}
			}
		}
	}

	INDEXED_KEYS.add(indexKey);
}

export async function getCalculationData(
	areaKeys: string[],
	incomeClass: IncomeClass,
	startYear: number,
	endYear: number,
): Promise<DataIndex> {
	const pending: Promise<void>[] = [];

	for (const area of areaKeys) {
		for (let y = startYear; y <= endYear; y++) {
			const indexKey = `${area}|${y}|${incomeClass}`;
			if (INDEXED_KEYS.has(indexKey)) continue;

			pending.push(
				fetchYearlyData(area, y).then((file) => {
					if (file?.data) {
						indexFile(file, incomeClass);
					}
				}),
			);
		}
	}

	if (pending.length > 0) {
		await Promise.all(pending);
	}

	return GLOBAL_INDEX;
}

export async function getWeights(
	areaKeys: string[],
	incomeClass: IncomeClass,
): Promise<Record<string, number[]>> {
	const results: Record<string, number[]> = {};
	const pending: Promise<void>[] = [];

	for (const key of areaKeys) {
		pending.push(
			getAreaManifest(key).then((m) => {
				if (m?.weights?.[incomeClass]) results[key] = m.weights?.[incomeClass];
			}),
		);
	}

	await Promise.all(pending);
	return results;
}

export function getAreaHierarchy(selectedKey: string): AreaHierarchy {
	const { areas } = dataStore.get();

	const selectedArea = areas.find((a) => a.key === selectedKey);
	if (!selectedArea) {
		return { target: { key: selectedKey, name: "Selected Area", regionId: 0 } };
	}

	// if the selected are is NCR, return NCR and philippines only
	if (selectedKey.toLowerCase() === "ncr") {
		return {
			target: selectedArea,
			national: areas.find((a) => a.key.toLowerCase() === "philippines"),
			ncr: selectedArea,
		};
	}

	let province: AreaDef | undefined;

	const national = areas.find((a) => a.key === "philippines");
	const ncr = areas.find((a) => a.key === "ncr");
	const region = areas.find((a) => a.regionId === selectedArea.regionId && a.provinceId === undefined);

	if (selectedArea.provinceId !== undefined) {
		if (selectedArea.cityId === undefined) {
			province = selectedArea;
		} else {
			province = areas.find(
				(a) =>
					a.regionId === selectedArea.regionId &&
					a.provinceId === selectedArea.provinceId &&
					a.cityId === undefined,
			);
		}
	}

	return {
		target: selectedArea,
		region,
		national,
		ncr,
		province,
	};
}

export const commodityTree = computed(dataStore, (state) => {
	const { commodities } = state;
	if (commodities.length === 0) return [];

	const nodeMap = new Map<string, TreeNode>();
	const roots: TreeNode[] = [];

	commodities.forEach((c) => {
		nodeMap.set(c.code, {
			code: c.code,
			name: c.name,
			depth: c.code.split(".").length,
			children: [],
		});
	});

	const sortedCodes = commodities.map((c) => c.code).sort((a, b) => a.localeCompare(b));

	sortedCodes.forEach((code) => {
		const node = nodeMap.get(code)!;

		// Logic: "01.1" parent is "01"
		let parentCode = "";
		if (code.includes(".")) {
			const parts = code.split(".");
			parts.pop();
			parentCode = parts.join(".");
		}

		if (parentCode && nodeMap.has(parentCode)) {
			nodeMap.get(parentCode)!.children.push(node);
		} else {
			roots.push(node);
		}
	});

	return roots;
});

export const majorCategories = computed(dataStore, (state) => {
	return state.commodities
		.filter((c) => !c.code.includes("."))
		.sort((a, b) => a.code.localeCompare(b.code));
});
