import { computed, map } from "nanostores";

const API_URL = import.meta.env.PUBLIC_VITE_API_URL || "/api/v1";

export type TreeNode = {
	code: string;
	name: string;
	depth: number;
	children: TreeNode[];
};

export interface CommodityDef {
	code: string;
	name: string;
	children?: CommodityDef[];
	parentName?: string;
	keywords?: string[];
}

export interface AreaDef {
	key: string;
	name: string;
	provinceId?: number;
	regionId: number;
}

export interface AreaHierarchy {
	areaKey: string;
	regionKey: string;
	nationalKey: string;
}

// Structure of data/{key}/{year}.json
export interface YearlyDataFile {
	area: string;
	name: string;
	year: number;
	data: {
		[incomeKey: string]: {
			[code: string]: (number | null)[];
		};
	};
}

export interface SearchOption {
	code: string;
	name: string;
	depth: number;
	keywords: string[];
}

interface DataState {
	isLoading: boolean;
	isReady: boolean;
	error: string | null;
	areas: AreaDef[];
	commodities: CommodityDef[];
	availableYears: string[];
	searchOptions: SearchOption[];
	flatCodes: string[]; // Sorted by length desc
	parentIndex: Record<string, string>;
}

interface Metadata {
	generated_at: string;
	year_range: {
		min: number;
		max: number;
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
	searchOptions: [],
	flatCodes: [],
	parentIndex: {},
});

export async function initializeApp() {
	if (dataStore.get().commodities.length > 0) return;

	try {
		dataStore.setKey("isLoading", true);
		const [metaRes, commRes] = await Promise.all([fetch(`${API_URL}/metadata.json`), fetch(`${API_URL}/commodities.json`)]);

		if (!metaRes.ok || !commRes.ok) throw new Error("Failed to load data configurations");

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

		for (let y = meta.year_range.max; y >= meta.year_range.min; y--) {
			years.push(String(y));
		}

		const searchOptions: SearchOption[] = [];
		const flattenForSearch = (nodes: CommodityDef[], depth: number) => {
			for (const node of nodes) {
				searchOptions.push({
					code: node.code,
					name: node.name,
					depth: depth,
					keywords: node.keywords || [],
				});

				if (node.children) {
					flattenForSearch(node.children, depth + 1);
				}
			}
		};

		flattenForSearch(commodities, 0);
		searchOptions.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

		dataStore.set({
			...dataStore.get(),
			areas: meta.areas,
			availableYears: years,
			commodities,
			searchOptions,
			error: null,
			flatCodes,
			parentIndex,
		});

		return meta;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		console.error(err);
		dataStore.setKey("error", "Could not load application data.");
		dataStore.setKey("isLoading", false);
	}
}

export async function getCalculationData(areaKeys: string[], startYear: number, endYear: number): Promise<Map<string, number>> {
	const promises = [
		...areaKeys.map((key) => fetch(`${API_URL}/data/${key}/${startYear}.json`)),
		...areaKeys.map((key) => fetch(`${API_URL}/data/${key}/${endYear}.json`)),
	];

	const responses = await Promise.all(promises);
	const dataMap = new Map<string, number>();

	for (const res of responses) {
		if (!res.ok) continue;

		const file: YearlyDataFile = await res.json();
		const dataset = file.data["ALL"];

		if (!dataset) continue;

		// Format: "01": [120.1, 120.5, ...]
		for (const [code, values] of Object.entries(dataset)) {
			values.forEach((val, index) => {
				if (val === null) return;
				const month = index + 1;
				const key = `${file.area}|*|${file.year}|${month}|${code}`;

				dataMap.set(key, val);
			});
		}
	}

	return dataMap;
}

export function getAreaHierarchy(selectedKey: string): AreaHierarchy {
	const { areas } = dataStore.get();

	const selectedArea = areas.find((a) => a.key === selectedKey);
	if (!selectedArea) {
		return { areaKey: selectedKey, regionKey: "ncr", nationalKey: "philippines" };
	}

	const nationalKey = "philippines";
	let regionKey = "ncr";

	if (selectedArea.provinceId === undefined) {
		regionKey = selectedArea.key;
	} else {
		const parentRegion = areas.find((a) => a.regionId === selectedArea.regionId && a.provinceId === undefined);
		if (parentRegion) {
			regionKey = parentRegion.key;
		}
	}

	return {
		areaKey: selectedKey,
		regionKey: regionKey,
		nationalKey: nationalKey,
	};
}

export function getDisplayLabel(item: SearchOption): string {
	if (item.depth <= 1) return item.name;
	if (!item.code.includes(".")) return item.name;
	return `\u00A0\u00A0↳ ${item.name}`;
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
	return state.commodities.filter((c) => !c.code.includes(".")).sort((a, b) => a.code.localeCompare(b.code));
});
