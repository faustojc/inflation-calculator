import { beforeEach, describe, expect, it } from "vitest";
import { dataStore } from "@/stores/dataStore";
import {
	categoryTotals,
	detailedExpenses,
	expenses,
	generalExpenses,
	isCalculationDisabled,
	missingDetailedItems,
	missingGeneralItems,
	mode,
	setActiveTab,
	totalAllocation,
	totalDisplayLabel,
	updateExpenseValue,
} from "@/stores/inflationStore";

/**
 * Characterization tests for the inflationStore derived state + the detailed
 * category-total cascade.
 *
 * NOTE: When this app migrates to Legend State, the store READ/WRITE lines below
 * (`.get()`, `.set()`, `.setKey()`) must be rewritten to the observable API, but
 * the ASSERTED derived values must stay identical.
 */

function resetStores() {
	setActiveTab("general");
	mode.set("amount");
	generalExpenses.set({});
	detailedExpenses.set({});
	categoryTotals.set({});
	missingGeneralItems.set(new Set());
	missingDetailedItems.set(new Set());
	dataStore.parentIndex.set({});
}

beforeEach(resetStores);

describe("expenses (active-tab selector)", () => {
	it("returns the store matching the active tab", () => {
		generalExpenses.set({ a: { id: "a", code: "a", name: "A", value: 10 } });
		detailedExpenses.set({ b: { id: "b", code: "b", name: "B", value: 20 } });

		expect(expenses.get()).toEqual(generalExpenses.get());
		setActiveTab("detailed");
		expect(expenses.get()).toEqual(detailedExpenses.get());
	});
});

describe("totalAllocation", () => {
	it("sums the active tab's expense values", () => {
		generalExpenses.set({
			a: { id: "a", code: "a", name: "A", value: 10 },
			b: { id: "b", code: "b", name: "B", value: 25 },
		});
		expect(totalAllocation.get()).toBe(35);
	});
});

describe("isCalculationDisabled", () => {
	it("is disabled when no expense has a positive value", () => {
		generalExpenses.set({ a: { id: "a", code: "a", name: "A", value: 0 } });
		expect(isCalculationDisabled.get()).toBe(true);
	});

	it("is enabled in amount mode once any value is positive", () => {
		generalExpenses.set({ a: { id: "a", code: "a", name: "A", value: 5 } });
		expect(isCalculationDisabled.get()).toBe(false);
	});

	it("is disabled in percent mode unless the total is exactly 100", () => {
		mode.set("percent");
		generalExpenses.set({ a: { id: "a", code: "a", name: "A", value: 60 } });
		expect(isCalculationDisabled.get()).toBe(true);

		generalExpenses.set({
			a: { id: "a", code: "a", name: "A", value: 60 },
			b: { id: "b", code: "b", name: "B", value: 40 },
		});
		expect(isCalculationDisabled.get()).toBe(false);
	});
});

describe("totalDisplayLabel", () => {
	it("formats a peso total in amount mode", () => {
		generalExpenses.set({ a: { id: "a", code: "a", name: "A", value: 1000 } });
		const label = totalDisplayLabel.get();
		expect(label.text.startsWith("Total: ₱")).toBe(true);
		expect(label.isOver).toBe(false);
	});

	it("flags over-allocation in percent mode", () => {
		mode.set("percent");
		generalExpenses.set({ a: { id: "a", code: "a", name: "A", value: 150 } });
		const label = totalDisplayLabel.get();
		expect(label.text).toBe("Used: 150.0%");
		expect(label.isOver).toBe(true);
	});
});

describe("detailed category-total cascade", () => {
	beforeEach(() => {
		// 01.1.1 -> 01.1 -> 01 (top)
		dataStore.parentIndex.set({ "01.1.1": "01.1", "01.1": "01" });
		setActiveTab("detailed");
	});

	it("propagates a leaf value up the ancestor path", () => {
		updateExpenseValue("01.1.1", "Rice", 50, "detailed");
		expect(categoryTotals.get()).toEqual({ "01.1.1": 50, "01.1": 50, "01": 50 });
	});

	it("applies deltas, not full recomputes, on subsequent edits", () => {
		updateExpenseValue("01.1.1", "Rice", 50, "detailed");
		updateExpenseValue("01.1.1", "Rice", 30, "detailed");
		expect(categoryTotals.get()).toEqual({ "01.1.1": 30, "01.1": 30, "01": 30 });
	});

	it("removes ancestor entries when the total returns to zero", () => {
		updateExpenseValue("01.1.1", "Rice", 50, "detailed");
		updateExpenseValue("01.1.1", "Rice", 0, "detailed");
		expect(categoryTotals.get()).toEqual({});
	});
});
