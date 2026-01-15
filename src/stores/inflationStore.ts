import { COMMODITY_DISPLAY_CONFIG, type UICommodity } from "@/config/commodityDisplay";
import { dataStore } from "@/stores/dataStore";
import { computed, map } from "nanostores";

export type ExpenseItem = {
	id: string;
	code: string;
	name: string;
	value: number;
	example?: string;
};

export type AppSettings = {
	region: string;
	province?: string;
	incomeClass: "all" | "bottom30";
	startDate: Date;
	endDate: Date;
};

export type UIState = {
	mode: "amount" | "percent";
	totalBudget: number;
};

export type HighlightState = {
	code: string;
	label: string;
};

const today = new Date();
const lastYear = new Date();
lastYear.setFullYear(today.getFullYear() - 1);

export const settings = map<AppSettings>({
	region: "NCR",
	province: "Manila, Metro (NCR)",
	incomeClass: "all",
	startDate: lastYear,
	endDate: today,
});

export const uiState = map<UIState>({
	mode: "amount",
	totalBudget: 0,
});

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

export function setMode(mode: "amount" | "percent") {
	uiState.setKey("mode", mode);
}

export function setTotalBudget(amount: number) {
	uiState.setKey("totalBudget", amount);
}

export function locateCategory(searchCode: string, searchName: string) {
	let currentCode = searchCode;

	while (currentCode.length > 0 && !uiParentIndex.has(currentCode)) {
		const lastDot = currentCode.lastIndexOf(".");
		if (lastDot === -1) break; // No more parents
		currentCode = currentCode.substring(0, lastDot);
	}

	if (uiParentIndex.has(currentCode)) {
		const foundCode = currentCode;

		// Backtracking using Parent Map
		// Node -> Parent -> Grandparent
		const path: string[] = [];
		let ptr = uiParentIndex.get(foundCode);

		while (ptr) {
			path.push(ptr);
			ptr = uiParentIndex.get(ptr) || null;
		}

		const updates = { ...expandedNodes.get() };
		path.forEach((code) => {
			updates[code] = true;
		});

		expandedNodes.set(updates);
		highlightState.set({ code: foundCode, label: searchName });

		setTimeout(() => {
			highlightState.set({ code: "", label: "" });
		}, 4000);
	} else {
		console.warn("Item not found in UI Config:", searchName);
	}
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

export const isCalculationDisabled = computed([expenses, uiState, totalAllocation], (items, ui, total) => {
	const hasExpense = Object.values(items).some((i) => i.value > 0);
	if (!hasExpense) return true;

	if (ui.mode === "percent") {
		if (ui.totalBudget <= 0 || Number.isNaN(ui.totalBudget)) return true;
		if (total > 100.01) return true;
	}

	return false;
});

export const totalDisplayLabel = computed([uiState, totalAllocation], (ui, total) => {
	if (ui.mode === "percent") {
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
	const { commodities } = data;

	if (!commodities || commodities.length === 0) return totals;

	// Sort codes by length descending (Leaves first, Roots last)
	const sortedCodes = commodities.map((c) => c.code).sort((a, b) => b.length - a.length);

	for (const code of sortedCodes) {
		const ownValue = items[code]?.value || 0;
		totals[code] = (totals[code] || 0) + ownValue;

		if (code.includes(".")) {
			const parentCode = code.substring(0, code.lastIndexOf("."));
			totals[parentCode] = (totals[parentCode] || 0) + totals[code];
		}
	}

	return totals;
});
