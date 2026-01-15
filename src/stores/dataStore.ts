import { computed, map } from "nanostores";

const API_URL = import.meta.env.VITE_API_URL;

export type TreeNode = {
	code: string;
	name: string;
	depth: number;
	children: TreeNode[];
};

export interface CommodityDef {
	code: string;
	name: string;
	parent_code?: string;
}

export interface GeoLocation {
	name: string;
	region_code: string;
}

export interface CpiRecord {
	y: number; // Year
	m: number; // Month
	r: string; // Region
	c: string; // Commodity Code
	v: number; // Value
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
	regions: { code: string; name: string }[];
	provinces: GeoLocation[];
	commodities: CommodityDef[];
	availableYears: string[];
	searchOptions: SearchOption[];
}

export const dataStore = map<DataState>({
	isLoading: true,
	isReady: false,
	error: null,
	regions: [],
	provinces: [],
	commodities: [],
	availableYears: [],
	searchOptions: [],
});

export async function initializeApp() {
	if (dataStore.get().commodities.length > 0) {
		return;
	}

	try {
		dataStore.setKey("isLoading", true);

		const [metaRes, commRes] = await Promise.all([fetch(`${API_URL}/metadata`), fetch(`${API_URL}/commodities`)]);

		if (!metaRes.ok || !commRes.ok) throw new Error("Connection Failed");

		const meta = await metaRes.json();
		const commodities: CommodityDef[] = await commRes.json();

		const years = [];
		for (let y = meta.yearRange.max_year; y >= meta.yearRange.min_year; y--) {
			years.push(String(y));
		}

		const searchOptions = commodities.map((c) => ({
			code: c.code,
			name: c.name,
			depth: c.code.split(".").length,
		}));

		dataStore.set({
			...dataStore.get(),
			regions: meta.regions,
			provinces: meta.provinces,
			availableYears: years,
			commodities: commodities,
			searchOptions: searchOptions,
			isLoading: false,
			isReady: true,
			error: null,
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		console.error(err);
		dataStore.setKey("error", "Failed to connect to Inflation Database. Please ensure the server is running.");
		dataStore.setKey("isLoading", false);
	}
}

export async function getCalculationData(
	regionCode: string,
	provinceName: string | undefined,
	dates: { startYear: number; startMonth: number; endYear: number; endMonth: number },
	codes: string[]
): Promise<Map<string, number>> {
	const res = await fetch(`${API_URL}/cpi-batch`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ regionCode, provinceName, dates, codes }),
	});

	if (!res.ok) throw new Error("Failed to calculate results");

	const json: CpiRecord[] = await res.json();
	const dataMap = new Map<string, number>();

	// Key: REGION|AREA|INCOME|YEAR|MONTH|CODE
	json.forEach((row) => {
		const r = row.r === provinceName ? regionCode : row.r;
		const area = row.r === provinceName ? provinceName : "*";
		const key = `${r}|${area}|*|${row.y}|${row.m}|${row.c}`;

		dataMap.set(key, row.v);
	});

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
