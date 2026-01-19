import { computed, map } from "nanostores";
import { env } from "bun";

const API_URL = env.VITE_API_URL;

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
}

export interface AreaDef {
	key: string; // e.g. "ncr", "cebu-province"
	name: string;
}

// Structure of data/{key}/{year}.json
export interface YearlyDataFile {
	area: string;
	name: string;
	year: number;
	data: {
		[incomeKey: string]: {
			[code: string]: number[];
		};
	};
}

export interface SearchOption {
	code: string;
	name: string;
	depth: number;
}

interface DataState {
	isLoading: boolean;
	isReady: boolean;
	error: string | null;
	areas: AreaDef[];
	commodities: CommodityDef[];
	availableYears: string[];
	searchOptions: SearchOption[];
}

export const dataStore = map<DataState>({
	isLoading: true,
	isReady: false,
	error: null,
	areas: [],
	commodities: [],
	availableYears: [],
	searchOptions: [],
});

export async function initializeApp() {
	if (dataStore.get().commodities.length > 0) return;

	try {
		dataStore.setKey("isLoading", true);

		// Fetch Master Definitions
		const [metaRes, commRes] = await Promise.all([fetch(`${API_URL}/metadata.json`), fetch(`${API_URL}/commodities.json`)]);

		if (!metaRes.ok || !commRes.ok) throw new Error("Failed to load data configurations");

		const meta = await metaRes.json();
		const commodities: CommodityDef[] = await commRes.json();
		const years: string[] = [];

		for (let y = meta.year_range.max; y >= meta.year_range.min; y--) {
			years.push(String(y));
		}

		const searchOptions: SearchOption[] = [];
		const stack = commodities.map((c) => ({ node: c, depth: 1, parentName: "" }));

		while (stack.length > 0) {
			const { node, depth, parentName } = stack.pop()!;
			const currentName = node.name.trim();
			const parentNameClean = parentName.trim();
			const isDuplicate = depth > 1 && currentName.toLowerCase() === parentNameClean.toLowerCase();

			if (!isDuplicate) {
				searchOptions.push({
					code: node.code,
					name: node.name,
					depth,
				});
			}

			if (node.children) {
				for (let i = node.children.length - 1; i >= 0; i--) {
					stack.push({
						node: node.children[i]!,
						depth: depth + 1,
						parentName: node.name,
					});
				}
			}
		}
		searchOptions.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

		dataStore.set({
			...dataStore.get(),
			areas: meta.areas,
			availableYears: years,
			commodities,
			searchOptions,
			isLoading: false,
			isReady: true,
			error: null,
		});

		return meta;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		console.error(err);
		dataStore.setKey("error", "Could not load application data.");
		dataStore.setKey("isLoading", false);
	}
}

export async function getCalculationData(areaKey: string, startYear: number, endYear: number): Promise<Map<string, number>> {
	const yearsToFetch = new Set([startYear, endYear]);
	const areasToFetch = new Set([areaKey, "ncr"]);
	const fetchPromises: Promise<Response>[] = [];

	areasToFetch.forEach((area) => {
		yearsToFetch.forEach((year) => {
			fetchPromises.push(fetch(`${API_URL}/data/${area}/${year}.json`));
		});
	});

	const responses = await Promise.all(fetchPromises);
	const dataMap = new Map<string, number>();

	for (const res of responses) {
		if (!res.ok) continue;

		const file: YearlyDataFile = await res.json();
		const dataset = file.data["ALL"];

		if (!dataset) continue;

		// Format: "01": [120.1, 120.5, ...]
		for (const [code, values] of Object.entries(dataset)) {
			values.forEach((val, index) => {
				const month = index + 1;
				// REGION|AREA|INCOME|YEAR|MONTH|CODE
				const key = `${file.area}|${file.name}|*|${file.year}|${month}|${code}`;
				dataMap.set(key, val);
			});
		}
	}

	return dataMap;
}

export function getDisplayLabel(item: SearchOption): string {
	if (item.depth <= 1) return item.name;
	const indent = "\u00A0\u00A0".repeat((item.depth - 1) * 2);
	return `${indent}↳ ${item.name}`;
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
