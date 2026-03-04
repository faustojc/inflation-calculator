import type { AreaDef, CommodityDef } from "@/lib/types";
import { dataStore, getAreaHierarchy, getCalculationData } from "@/stores/dataStore";
import type { CalculationResult } from "@/utils/inflationCompute";
import { atom, computed, map } from "nanostores";
import { toast } from "sonner";

export type IncomeClass = "ALL" | "B30";

export type ExpenseItem = {
	id: string;
	code: string;
	name: string;
	value: number;
	example?: string;
};

export type AppSettings = {
	area: AreaDef;
	incomeClass: IncomeClass;
	startDate: Date;
	endDate: Date;
};

export type Mode = "amount" | "percent";

export type HighlightState = {
	code: string;
	label: string;
};

const today = new Date();
const lastYear = new Date();
lastYear.setFullYear(today.getFullYear() - 1);

export const settings = map<AppSettings>({
	area: {
		key: "abra",
		name: "Abra",
		regionId: 1,
		capita: 0,
	},
	incomeClass: "ALL",
	startDate: lastYear,
	endDate: today,
});

export const mode = atom<Mode>("amount");
export const activeTab = atom<"general" | "detailed">("general");
export const highlightState = map<HighlightState>({
	code: "",
	label: "",
});

export const calculationResult = map<{
	show: boolean;
	data: CalculationResult | null;
}>({
	show: false,
	data: null,
});

export const missingGeneralItems = atom<Set<string>>(new Set());
export const missingDetailedItems = atom<Set<string>>(new Set());
export const missingDataItems = computed([activeTab, missingGeneralItems, missingDetailedItems], (tab, general, detailed) => {
	return tab === "general" ? general : detailed;
});
export const prefetchLoading = atom<boolean>(false);
export const prefetchReady = atom<boolean>(false);

export const generalExpenses = map<Record<string, ExpenseItem>>({});
export const detailedExpenses = map<Record<string, ExpenseItem>>({});
export const expenses = computed([activeTab, generalExpenses, detailedExpenses], (tab, general, detailed) => {
	return tab === "general" ? general : detailed;
});
export const expandedNodes = map<Record<string, boolean>>({});

// for fast lookup of parent nodes
const uiParentIndex = new Map<string, string | null>();
export function buildSearchIndex() {
	const { commodities } = dataStore.get();
	uiParentIndex.clear();

	const traverse = (nodes: CommodityDef[], parentCode: string | null) => {
		for (const node of nodes) {
			uiParentIndex.set(node.code, parentCode);
			if (node.children && node.children.length > 0) {
				traverse(node.children, node.code);
			}
		}
	};

	traverse(commodities, null);
}

export function initializeExpenses() {
	const { commodities } = dataStore.get();

	if (Object.keys(generalExpenses.get()).length > 0 || Object.keys(detailedExpenses.get()).length > 0) return;

	const initialExpenses: Record<string, ExpenseItem> = {};

	const traverse = (nodes: CommodityDef[]) => {
		nodes.forEach((node) => {
			initialExpenses[node.code] = {
				id: node.code,
				code: node.code,
				name: node.name,
				value: 0,
			};
			if (node.children) traverse(node.children);
		});
	};

	traverse(commodities);
	generalExpenses.set({ ...initialExpenses });
	detailedExpenses.set({ ...initialExpenses });
}

export async function prefetchConstraints() {
	const currentSettings = settings.get();
	const { area, incomeClass, startDate } = currentSettings;

	const targetYear = startDate.getFullYear();
	const baseYear = targetYear - 1;

	const { commodities } = dataStore.get();
	if (commodities.length === 0) return;

	prefetchLoading.set(true);

	try {
		const hierarchy = getAreaHierarchy(area.key);
		const uniqueKeys = new Set([
			hierarchy.target.key,
			hierarchy.province?.key,
			hierarchy.region?.key,
			hierarchy.national?.key,
		]);
		const keysToFetch = Array.from(uniqueKeys).filter(Boolean) as string[];

		const batchMap = await getCalculationData(keysToFetch, incomeClass, baseYear, targetYear);

		const missingGeneral = new Set<string>();
		const missingPersonal = new Set<string>();
		const targetMonth = startDate.getMonth() + 1;

		commodities.forEach((node) => {
			const checkCode = (code: string) => {
				const key = hierarchy.target.key;

				const officialCurrent = batchMap[key]?.[targetYear]?.["official"]?.[targetMonth]?.[code];
				const officialBase = batchMap[key]?.[baseYear]?.["official"]?.[targetMonth]?.[code];
				if (officialCurrent == null || officialCurrent === 0 || officialBase == null || officialBase === 0) {
					missingGeneral.add(code);
				}

				// Personal dataset only has leaf-level codes (e.g. 01.1), not major categories (01–13)
				if (!code.includes(".")) return;

				const personalCurrent = batchMap[key]?.[targetYear]?.["personal"]?.[targetMonth]?.[code];
				const personalBase = batchMap[key]?.[baseYear]?.["personal"]?.[targetMonth]?.[code];
				if (personalCurrent == null || personalCurrent === 0 || personalBase == null || personalBase === 0) {
					missingPersonal.add(code);
				}
			};

			const traverse = (children: CommodityDef[]) => {
				children.forEach((child) => {
					checkCode(child.code);
					if (child.children) traverse(child.children);
				});
			};

			checkCode(node.code);
			if (node.children) traverse(node.children);
		});

		missingGeneralItems.set(missingGeneral);
		missingDetailedItems.set(missingPersonal);
		prefetchReady.set(true);

		// Clear any previously entered values for newly-missing codes
		if (missingGeneral.size > 0 || missingPersonal.size > 0) {
			const genStore = generalExpenses.get();
			const detStore = detailedExpenses.get();
			const newGenStore = { ...genStore };
			const newDetStore = { ...detStore };
			let genChanged = false;
			let detChanged = false;

			missingGeneral.forEach((code: string) => {
				if (newGenStore[code] && newGenStore[code].value !== 0) {
					newGenStore[code] = { ...newGenStore[code], value: 0 };
					genChanged = true;
				}
			});

			missingPersonal.forEach((code: string) => {
				if (newDetStore[code] && newDetStore[code].value !== 0) {
					newDetStore[code] = { ...newDetStore[code], value: 0 };
					detChanged = true;
				}
			});

			if (genChanged) generalExpenses.set(newGenStore);
			if (detChanged) detailedExpenses.set(newDetStore);
			if (genChanged || detChanged) {
				const whatInputsAreCleared =
					genChanged && detChanged ? "both General and Detailed tabs" : genChanged ? "General tab" : "Detailed tab";
				const title = `Some inputs were cleared in ${whatInputsAreCleared}`;

				toast.warning(title, {
					description:
						"Certain items you entered have NO recorded CPI data for the selected location, income bracket, and period/date. Their values have been reset to prevent calculation errors.",
					duration: 11000,
					classNames: {
						toast: "!border-amber-400 !dark:border-amber-500/60 !bg-amber-50 !dark:bg-amber-950/40 !shadow-lg !shadow-amber-200/30 !dark:shadow-amber-900/20 !px-3 !py-2 !gap-3.5",
						title: "!text-amber-900 !dark:text-amber-200 !text-[0.95rem] !font-bold !tracking-tight",
						description: "!text-amber-800/80 !dark:text-amber-300/80 !text-[0.85rem] !leading-relaxed !mt-1",
						icon: "!text-amber-500 !dark:text-amber-400",
					},
				});
			}
		}
	} catch (err) {
		console.error("Failed to prefetch constraints:", err);
	} finally {
		prefetchLoading.set(false);
	}
}

// Debounced prefetch to avoid rapid-fire during initialization
let prefetchTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedPrefetch() {
	if (prefetchTimer) clearTimeout(prefetchTimer);
	prefetchTimer = setTimeout(() => {
		prefetchConstraints();
	}, 300);
}

// Automatically trigger predictive prefetch when dependent config changes
settings.listen(() => {
	debouncedPrefetch();
});

let initialPrefetchDone = false;
dataStore.listen((state) => {
	if (!initialPrefetchDone && state.commodities.length > 0 && state.areas.length > 0) {
		initialPrefetchDone = true;
		debouncedPrefetch();
	}
});

export function toggleExpansion(code: string, forceState?: boolean) {
	const current = expandedNodes.get();
	const newState = forceState ?? !current[code];

	expandedNodes.setKey(code, newState);
}

export function setActiveTab(tab: "general" | "detailed") {
	activeTab.set(tab);
}

export function locateCategory(searchCode: string, searchName: string) {
	highlightState.set({ code: "", label: "" });

	const currentTab = activeTab.get();
	let targetCode = searchCode;

	if (currentTab === "general" && targetCode.includes(".")) {
		targetCode = targetCode.split(".")[0]!;
	} else {
		let current = searchCode;
		while (current.length > 0 && !uiParentIndex.has(current)) {
			const lastDot = current.lastIndexOf(".");
			if (lastDot === -1) break;
			current = current.substring(0, lastDot);
		}
		if (uiParentIndex.has(current)) {
			targetCode = current;
		}
	}

	if (currentTab === "detailed") {
		const updates = { ...expandedNodes.get() };
		let ptr = uiParentIndex.get(targetCode);

		while (ptr) {
			updates[ptr] = true;
			ptr = uiParentIndex.get(ptr) || null;
		}
		expandedNodes.set(updates);
	}

	highlightState.set({ code: targetCode, label: searchName });

	setTimeout(() => {
		highlightState.set({ code: "", label: "" });
	}, 4500);
}

export function setMissingItems(codes: string[]) {
	const tab = activeTab.get();
	const targetAtom = tab === "general" ? missingGeneralItems : missingDetailedItems;
	targetAtom.set(new Set(codes));

	if (codes.length > 0 && tab === "detailed") {
		const updates = { ...expandedNodes.get() };

		codes.forEach((code) => {
			let ptr = uiParentIndex.get(code);

			while (ptr) {
				updates[ptr] = true;
				ptr = uiParentIndex.get(ptr) || null;
			}
		});

		expandedNodes.set(updates);
	}
}

export function addExpense(item: Omit<ExpenseItem, "id" | "value"> & { amount: number }) {
	const currentTab = activeTab.get();
	const targetStore = currentTab === "general" ? generalExpenses : detailedExpenses;
	const current = targetStore.get();
	const existingId = Object.keys(current).find((key) => current[key]?.code === item.code);

	if (existingId) {
		const existing = current[existingId]!;
		targetStore.setKey(existingId, { ...existing, value: item.amount });
	} else {
		const id = crypto.randomUUID();
		targetStore.setKey(id, {
			id,
			code: item.code,
			name: item.name,
			value: item.amount,
		});
	}
}

export function updateExpenseValue(code: string, name: string, newValue: number, target?: "general" | "detailed") {
	const currentTab = target || activeTab.get();
	const targetStore = currentTab === "general" ? generalExpenses : detailedExpenses;
	const current = targetStore.get();

	if (current[code]) {
		targetStore.setKey(code, { ...current[code], value: newValue });
	} else {
		targetStore.setKey(code, { id: code, code, name, value: newValue });
	}

	if (newValue === 0) {
		const tab = activeTab.get();
		const targetAtom = tab === "general" ? missingGeneralItems : missingDetailedItems;
		const missing = targetAtom.get();
		if (missing.has(code)) {
			const next = new Set(missing);
			next.delete(code);
			targetAtom.set(next);
		}
	}
}

export function clearMissingExpenses() {
	const genMissing = missingGeneralItems.get();
	const detMissing = missingDetailedItems.get();
	if (genMissing.size === 0 && detMissing.size === 0) return;

	const genStore = generalExpenses.get();
	const detStore = detailedExpenses.get();

	const newGenStore = { ...genStore };
	const newDetStore = { ...detStore };

	let genChanged = false;
	let detChanged = false;

	genMissing.forEach((code) => {
		if (newGenStore[code]) {
			newGenStore[code] = { ...newGenStore[code], value: 0 };
			genChanged = true;
		}
	});

	detMissing.forEach((code) => {
		if (newDetStore[code]) {
			newDetStore[code] = { ...newDetStore[code], value: 0 };
			detChanged = true;
		}
	});

	if (genChanged) generalExpenses.set(newGenStore);
	if (detChanged) detailedExpenses.set(newDetStore);

	missingGeneralItems.set(new Set());
	missingDetailedItems.set(new Set());
}

export function removeExpense(id: string) {
	const currentTab = activeTab.get();
	const targetStore = currentTab === "general" ? generalExpenses : detailedExpenses;
	const current = targetStore.get();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { [id]: _, ...rest } = current;
	targetStore.set(rest);
}

export function clearExpenses() {
	const currentTab = activeTab.get();
	if (currentTab === "general") {
		generalExpenses.set({});
	} else {
		detailedExpenses.set({});
	}
}

export const totalAllocation = computed(expenses, (items) => {
	return Object.values(items).reduce((sum, item) => sum + item.value, 0);
});

export const isCalculationDisabled = computed([expenses, mode, totalAllocation], (items, mode, total) => {
	if (mode === "percent" && total != 100) return true;

	const hasExpense = Object.values(items).some((i) => i.value > 0);
	return !hasExpense;
});

export const totalDisplayLabel = computed([mode, totalAllocation], (m, total) => {
	if (m === "percent") {
		const isOver = total > 100.01;
		return {
			text: `Used: ${total.toFixed(1)}%`,
			colorClass: isOver ? "bg-red-100 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-600 border-emerald-200",
			isOver,
		};
	} else {
		return {
			text: `Total: ₱${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
			colorClass: "bg-blue-50 text-blue-700 border-blue-200",
			isOver: false,
		};
	}
});

export const categoryTotals = computed([expenses, dataStore], (items, data) => {
	const totals: Record<string, number> = {};
	const { flatCodes, parentIndex } = data;

	if (!flatCodes || flatCodes.length === 0) return totals;

	for (const code of flatCodes) {
		if (!items[code] || items[code].value <= 0) continue;

		const ownValue = items[code]?.value || 0;
		const currentTotal = (totals[code] || 0) + ownValue;
		totals[code] = currentTotal;

		const parentCode = parentIndex[code];
		if (parentCode) {
			totals[parentCode] = (totals[parentCode] || 0) + currentTotal;
		}
	}

	return totals;
});
