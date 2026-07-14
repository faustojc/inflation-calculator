import type {
	AreaDef,
	AreaHierarchy,
	AreaManifest,
	ChunkFile,
	CommodityDef,
	DataIndex,
	SearchOption,
	TreeNode,
} from "@/lib/types";
import type { IncomeClass } from "@/stores/inflationStore";
import { createMemoAtom, createStoreAtom } from "@/stores/solidAtoms";
import { CHUNK_EPOCH, CHUNK_YEARS, chunkName, chunkRange, chunksForRange } from "@/utils/chunks";
import { FETCH_CACHE, formatLocationName, GLOBAL_INDEX, INDEXED_KEYS, MANIFEST_CACHE } from "@/utils/metadata";
import { fetchWithCache, invalidateIfDataChanged } from "@/utils/storage";

export function cpiUrl(path: string): string {
	return `api/v3/${path}`;
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
	schema_version: number;
	chunk_years: number;
	chunk_epoch: number;
	generated_at: string;
	year_range: {
		official: { min: number; max: number };
		personal: { min: number; max: number };
	};
	areas: AreaDef[];
}

export const dataStore = createStoreAtom<DataState>({
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
		dataStore.isLoading.set(true);

		let [metaRes, commRes] = await Promise.all([
			fetchWithCache(cpiUrl("metadata.json"), "network-first"),
			fetchWithCache(cpiUrl("commodities.json"), "cache-first"), // cache commodity cuz it won't change
		]);

		if (!metaRes.ok || !commRes.ok) throw new Error("Failed to load data configurations");

		const tempMeta: Metadata = await metaRes.clone().json();
		const wasInvalidated = await invalidateIfDataChanged(tempMeta.generated_at);

		if (wasInvalidated) {
			[metaRes, commRes] = await Promise.all([
				fetchWithCache(cpiUrl("metadata.json"), "network-first"),
				fetchWithCache(cpiUrl("commodities.json"), "cache-first"),
			]);

			if (!metaRes.ok || !commRes.ok) throw new Error("Failed to reload data after cache invalidation");
		}

		const meta: Metadata = await metaRes.json();

		if (meta.schema_version !== 3 || meta.chunk_epoch !== CHUNK_EPOCH || meta.chunk_years !== CHUNK_YEARS) {
			console.error(
				`[Data] Format mismatch: expected schema v3 (epoch ${CHUNK_EPOCH}, span ${CHUNK_YEARS}), ` +
					`got schema v${meta.schema_version} (epoch ${meta.chunk_epoch}, span ${meta.chunk_years}).`,
			);
			dataStore.error.set("Data format mismatch. Please try again later.");
			dataStore.isLoading.set(false);
			dataStore.isReady.set(false);
			return;
		}

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
		void fetchChunk(meta.areas.at(1)!.key, "ALL", chunkName(meta.year_range.official.max));

		dataStore.assign({
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
		dataStore.error.set("Could not load application data.");
		dataStore.isLoading.set(false);
		dataStore.isReady.set(false);
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
			MANIFEST_CACHE.delete(areaKey);
			return null;
		})
		.catch((error) => {
			console.warn(`Failed to load manifest for ${areaKey}`, error);
			MANIFEST_CACHE.delete(areaKey);
			return null;
		});

	MANIFEST_CACHE.set(areaKey, manifestPromise);
	return manifestPromise;
}

export async function setCurrentArea(areaKey: string) {
	const manifest = await getAreaManifest(areaKey);
	if (manifest) {
		dataStore.currentManifest.set(manifest);
	}
}

export function chunkUrl(area: string, incomeClass: IncomeClass, chunk: string): string {
	return cpiUrl(`data/${area}/${incomeClass.toLowerCase()}/${chunk}.json`);
}

async function fetchChunk(area: string, incomeClass: IncomeClass, chunk: string): Promise<ChunkFile | null> {
	const cacheKey = `${area}|${incomeClass}|${chunk}`;
	let promise = FETCH_CACHE.get(cacheKey);

	if (!promise) {
		// skip chunks the generator never published (e.g. b30/1994-2001.json) without a 404 round-trip.
		const manifest = await getAreaManifest(area);
		if (!manifest?.chunks?.[incomeClass]?.includes(chunk)) {
			return null;
		}

		const url = chunkUrl(area, incomeClass, chunk);
		promise = fetchWithCache(url, "cache-first")
			.then((r) => {
				if (r.ok && r.headers.get("content-type")?.includes("application/json")) {
					return r.json();
				}
				FETCH_CACHE.delete(cacheKey);
				return null;
			})
			.catch((error) => {
				console.warn(`Failed to load ${cacheKey}`, error);
				FETCH_CACHE.delete(cacheKey);
				return null;
			});

		FETCH_CACHE.set(cacheKey, promise);
	}

	return promise;
}

function indexChunk(file: ChunkFile, incomeClass: IncomeClass) {
	const tree = GLOBAL_INDEX[incomeClass];

	tree[file.area] ??= {};
	const areaIndex = tree[file.area]!;

	for (const [yearStr, types] of Object.entries(file.years)) {
		const year = Number(yearStr);
		const indexKey = `${file.area}|${year}|${incomeClass}`;

		if (INDEXED_KEYS.has(indexKey)) continue;

		areaIndex[year] ??= {};
		const yearIndex = areaIndex[year]!;

		for (const dataType of ["official", "personal"] as const) {
			const block = types[dataType];
			if (!block) continue;

			yearIndex[dataType] ??= {};
			const months = yearIndex[dataType]!;

			for (const [code, values] of Object.entries(block)) {
				for (let i = 0; i < 12; i++) {
					const val = values[i];

					if (val != null) {
						let month = months[i + 1];
						if (!month) {
							month = {};
							months[i + 1] = month;
						}
						month[code] = val;
					}
				}
			}
		}

		INDEXED_KEYS.add(indexKey);
	}
}

export async function getCalculationData(
	areaKeys: string[],
	incomeClass: IncomeClass,
	startYear: number,
	endYear: number,
): Promise<DataIndex> {
	const manifests = await Promise.all(areaKeys.map((area) => getAreaManifest(area)));
	const pending: Promise<void>[] = [];

	areaKeys.forEach((area, areaIdx) => {
		const available = new Set(manifests[areaIdx]?.chunks?.[incomeClass] ?? []);

		const needed = chunksForRange(startYear, endYear)
			.filter((c) => available.has(c))
			.filter((c) => {
				// Skip chunks whose every requested year is already indexed.
				const [chunkStartYear, chunkEndYear] = chunkRange(c);
				const from = Math.max(startYear, chunkStartYear);
				const to = Math.min(endYear, chunkEndYear);
				for (let y = from; y <= to; y++) {
					if (!INDEXED_KEYS.has(`${area}|${y}|${incomeClass}`)) return true;
				}
				return false;
			});

		for (const chunk of needed) {
			pending.push(
				fetchChunk(area, incomeClass, chunk).then((file) => {
					if (file) indexChunk(file, incomeClass);
				}),
			);
		}
	});

	if (pending.length > 0) {
		await Promise.all(pending);
	}

	return GLOBAL_INDEX[incomeClass];
}

export async function getWeights(areaKeys: string[], incomeClass: IncomeClass): Promise<Record<string, number[]>> {
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
	const clone = (a: AreaDef | undefined): AreaDef | undefined => (a ? { ...a } : undefined);

	const selectedArea = areas.find((a) => a.key === selectedKey);
	if (!selectedArea) {
		return { target: { key: selectedKey, name: "Selected Area", regionId: 0 } };
	}

	// if the selected area is NCR, return NCR and philippines only
	if (selectedKey.toLowerCase() === "ncr") {
		return {
			target: clone(selectedArea)!,
			national: clone(areas.find((a) => a.key.toLowerCase() === "philippines")),
			ncr: clone(selectedArea),
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
				(a) => a.regionId === selectedArea.regionId && a.provinceId === selectedArea.provinceId && a.cityId === undefined,
			);
		}
	}

	return {
		target: clone(selectedArea)!,
		region: clone(region),
		national: clone(national),
		ncr: clone(ncr),
		province: clone(province),
	};
}

export const commodityTree = createMemoAtom<TreeNode[]>(() => {
	const commodities = dataStore.commodities.get();
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
			nodeMap.get(parentCode)?.children.push(node);
		} else {
			roots.push(node);
		}
	});

	return roots;
});

export const majorCategories = createMemoAtom<CommodityDef[]>(() => {
	return dataStore.commodities
		.get()
		.filter((c) => !c.code.includes("."))
		.sort((a, b) => a.code.localeCompare(b.code));
});
