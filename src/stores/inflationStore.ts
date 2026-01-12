import { INITIAL_CATEGORIES } from "@/utils/metadata";
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
	incomeClass: "all",
	startDate: lastYear,
	endDate: today,
});

// ---- UI state

export const uiState = map<UIState>({
	mode: "amount",
	totalBudget: 0,
});

export function setMode(mode: "amount" | "percent") {
	uiState.setKey("mode", mode);
}

export function setTotalBudget(amount: number) {
	uiState.setKey("totalBudget", amount);
}

// ---- Highlight

export const highlightState = map<HighlightState>({
	code: "",
	label: "",
});

export function locateCategory(searchCode: string, searchName: string) {
	let bestMatch = null;
	let maxLen = -1;

	for (const cat of INITIAL_CATEGORIES) {
		if (searchCode.startsWith(cat.code)) {
			if (cat.code.length > maxLen) {
				maxLen = cat.code.length;
				bestMatch = cat;
			}
		}
	}

	if (bestMatch) {
		highlightState.set({ code: bestMatch.code, label: searchName });
		setTimeout(() => {
			highlightState.set({ code: "", label: "" });
		}, 4000);
	} else {
		console.warn("No matching category found for", searchName);
	}
}

// ---- Expenses

const initialExpenses: Record<string, ExpenseItem> = {};

INITIAL_CATEGORIES.forEach((item) => {
	const id = item.code;
	initialExpenses[id] = {
		id,
		code: item.code,
		name: item.name,
		value: 0,
		example: item.example,
	};
});

export const expenses = map<Record<string, ExpenseItem>>(initialExpenses);

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

export function removeExpense(id: string) {
	const current = expenses.get();
	const isInitial = INITIAL_CATEGORIES.some((c) => c.code === current[id]?.code);

	if (isInitial) {
		updateExpenseValue(id, 0);
	} else {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { [id]: _, ...rest } = current;
		expenses.set(rest);
	}
}

export function updateExpenseValue(id: string, newValue: number) {
	const currentItem = expenses.get()[id];
	if (currentItem) {
		expenses.setKey(id, { ...currentItem, value: newValue });
	}
}

export function clearExpenses() {
	if (!hasInputs.get()) return;

	const current = expenses.get();
	const resetExpense = { ...current };

	Object.entries(resetExpense).forEach((key) => {
		const [id, item] = key;
		if (INITIAL_CATEGORIES.some((c) => c.code === item.code)) {
			resetExpense[id] = { ...item, value: 0 };
		} else {
			delete resetExpense[id];
		}
	});

	expenses.set(resetExpense);
}

export function setGeneralExpense(code: string, name: string, value: number) {
	const current = expenses.get();
	const existingId = Object.keys(current).find((id) => current[id]?.code === code);

	if (existingId) {
		if (value === 0) {
			removeExpense(existingId);
		} else {
			expenses.setKey(existingId, { ...current[existingId]!, value });
		}
	} else if (value > 0) {
		const id = crypto.randomUUID();
		expenses.setKey(id, { id, code: code, name, value });
	}
}

export const totalAllocation = computed(expenses, (items) => {
	return Object.values(items).reduce((sum, item) => sum + item.value, 0);
});

export const sortedBasketItems = computed(expenses, (items) => {
	return Object.values(items).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
});

export const isCalculationDisabled = computed([expenses, uiState, totalAllocation], (items, ui, total) => {
	if (ui.totalBudget <= 0 || Number.isNaN(ui.totalBudget)) return true;

	const hasExpense = Object.values(items).some((i) => i.value > 0);
	if (!hasExpense) return true;
	if (ui.mode === "percent" && total > 100) return true;

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

export const categoryTotals = computed(expenses, (items) => {
	const totals: Record<string, number> = {};

	// Sort keys by length DESCENDING (Deepest children first)
	const sortedCodes = Object.keys(items).sort((a, b) => b.length - a.length);

	for (const code of sortedCodes) {
		const itemValue = items[code]?.value || 0;
		totals[code] = (totals[code] || 0) + itemValue;

		if (code.includes(".")) {
			const parentCode = code.substring(0, code.lastIndexOf("."));

			if (items[parentCode]) {
				totals[parentCode] = (totals[parentCode] || 0) + totals[code];
			}
		}
	}

	return totals;
});

export const hasInputs = computed(expenses, (items) => {
	return Object.values(items).some((i) => i.value > 0);
});
