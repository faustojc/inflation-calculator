import type { CommodityDef } from "@/lib/types";
import { dataStore } from "@/stores/dataStore";
import type { CalculationResult } from "@/utils/inflationCompute";
import { atom, computed, map } from "nanostores";

export type IncomeClass = "ALL" | "B30";

export type ExpenseItem = {
	id: string;
	code: string;
	name: string;
	value: number;
	example?: string;
};

export type AppSettings = {
	areaKey: string;
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
	areaKey: "abra",
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
