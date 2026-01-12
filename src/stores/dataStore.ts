import { map } from "nanostores";

export interface SearchOption {
	code: string;
	name: string;
	depth: number;
}

interface DataState {
	isLoading: boolean;
	isReady: boolean;
	error: string | null;
	rawMap: Map<string, number>;
	searchOptions: SearchOption[];
	years: number[];
}

export const dataStore = map<DataState>({
	isLoading: true,
	isReady: false,
	error: null,
	rawMap: new Map(),
	searchOptions: [],
	years: [],
});

export function getDisplayLabel(item: SearchOption): string {
	if (item.depth <= 1) return item.name;

	const indent = "\u00A0\u00A0".repeat((item.depth - 1) * 2);
	return `${indent}↳ ${item.name}`;
}

export function isMajorGroup(item: SearchOption): boolean {
	return item.depth === 1;
}

export async function initializeData() {
	if (dataStore.get().isReady) return;

	try {
		dataStore.setKey("isLoading", true);

		const response = await fetch("/inflation_data.json");
		if (!response.ok) throw new Error("Failed to load inflation data");

		const json = await response.json();

		const rawMap = new Map<string, number>();
		const searchMap = new Map<string, SearchOption>();
		const yearsSet = new Set<number>();

		for (const row of json) {
			// Index: "REGION|AREA|INCOME|YEAR|MONTH|CODE"
			const area = row.a || "*";
			const income = row.i || "*";
			const key = `${row.r}|${area}|${income}|${row.y}|${row.m}|${row.c}`;

			rawMap.set(key, row.v);

			if (row.v > 0 && !searchMap.has(row.c)) {
				searchMap.set(row.c, {
					code: row.c,
					name: row.n,
					depth: row.c.split(".").length,
				});
			}

			yearsSet.add(row.y);
		}

		const sortedSearch = Array.from(searchMap.values()).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
		const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);

		dataStore.set({
			isLoading: false,
			isReady: true,
			error: null,
			rawMap,
			searchOptions: sortedSearch,
			years: sortedYears,
		});
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		console.error(err);
		dataStore.setKey("error", err.message || "Unknown error");
		dataStore.setKey("isLoading", false);
	}
}
