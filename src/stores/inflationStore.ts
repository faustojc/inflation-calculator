import { COMMODITY_DISPLAY_CONFIG, type UICommodity } from "@/config/commodityDisplay";
import { dataStore } from "@/stores/dataStore";
import { atom, computed, map } from "nanostores";

export type ExpenseItem = {
	id: string;
	code: string;
	name: string;
	value: number;
	example?: string;
};

export type AppSettings = {
	areaKey: string;
	incomeClass: "all" | "bottom30";
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
	areaKey: "ncr",
	incomeClass: "all",
	startDate: lastYear,
	endDate: today,
});

export const mode = atom<Mode>("amount");
export const activeTab = atom<"general" | "detailed">("general");
export const highlightState = map<HighlightState>({
	code: "",
	label: "",
});

export const expenses = map<Record<string, ExpenseItem>>({});
export const expandedNodes = map<Record<string, boolean>>({});

// for fast lookup of parent nodes
const uiParentIndex = new Map<string, string | null>();
(() => {
	const stack: { node: UICommodity; parent: string | null }[] = COMMODITY_DISPLAY_CONFIG.map((node) => ({ node, parent: null }));

	while (stack.length > 0) {
		const { node, parent } = stack.pop()!;

		uiParentIndex.set(node.code, parent);

		if (node.children) {
			for (const child of node.children) {
				stack.push({ node: child, parent: node.code });
			}
		}
	}
})();

export function initializeExpenses() {
	const { commodities } = dataStore.get();

	const initialExpenses: Record<string, ExpenseItem> = {};

	commodities.forEach((item) => {
		initialExpenses[item.code] = {
			id: item.code,
			code: item.code,
			name: item.name,
			value: 0,
		};
	});

	expenses.set(initialExpenses);
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
		const path: string[] = [];
		let ptr = uiParentIndex.get(targetCode);
		while (ptr) {
			path.push(ptr);
			ptr = uiParentIndex.get(ptr) || null;
		}
		const updates = { ...expandedNodes.get() };
		path.forEach((code) => {
			updates[code] = true;
		});
		expandedNodes.set(updates);
	}

	highlightState.set({ code: targetCode, label: searchName });

	setTimeout(() => {
		highlightState.set({ code: "", label: "" });
	}, 3000);
}

export function addExpense(item: Omit<ExpenseItem, "id" | "value"> & { amount: number }) {
	const current = expenses.get();
	const existingId = Object.keys(current).find((key) => current[key]?.code === item.code);

	if (existingId) {
		const existing = current[existingId]!;
		expenses.setKey(existingId, { ...existing, value: item.amount });
	} else {
		const id = crypto.randomUUID();
		expenses.setKey(id, {
			id,
			code: item.code,
			name: item.name,
			value: item.amount,
		});
	}
}

export function updateExpenseValue(code: string, name: string, newValue: number) {
	const current = expenses.get();

	if (current[code]) {
		expenses.setKey(code, { ...current[code], value: newValue });
	} else {
		expenses.setKey(code, { id: code, code, name, value: newValue });
	}
}

export function removeExpense(id: string) {
	const current = expenses.get();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { [id]: _, ...rest } = current;
	expenses.set(rest);
}

export function clearExpenses() {
	expenses.set({});
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
