import { describe, expect, it } from "vitest";
import type { AreaDef, DataIndex } from "@/lib/types";
import { compareOfficial } from "@/stores/graphStore";
import type { ExpenseItem } from "@/stores/inflationStore";
import {
	type CalculationConfig,
	calculatePersonalInflation,
	type DateRange,
	type LocationContext,
} from "./inflationCompute";

const MAJOR_CODES = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"];
const ALL_CODES = ["0", ...MAJOR_CODES];

function cpiForYear(year: number): number {
	// 10% YoY growth anchored at 100 in 2022.
	const table: Record<number, number> = { 2021: 90.909, 2022: 100, 2023: 110, 2024: 121 };
	return table[year] ?? 100;
}

function buildIndex(): DataIndex {
	const idx: DataIndex = {};
	for (const area of ["abra", "philippines"]) {
		idx[area] = {};
		for (const year of [2021, 2022, 2023, 2024]) {
			const months: Record<number, Record<string, number | null>> = {};
			for (let month = 1; month <= 12; month++) {
				const codes: Record<string, number | null> = {};
				for (const code of ALL_CODES) {
					codes[code] = cpiForYear(year);
				}
				months[month] = codes;
			}
			idx[area]![year] = { official: months };
		}
	}
	return idx;
}

const TARGET: AreaDef = { key: "abra", name: "Abra", regionId: 1 };

const LOCATION: LocationContext = {
	target: TARGET,
	national: { key: "philippines", name: "Philippines", regionId: 0 },
};

const DATES: DateRange = { startYear: 2023, startMonth: 1, endYear: 2024, endMonth: 1 };

const CONFIG: CalculationConfig = { mode: "amount", totalInput: 100 };

const EXPENSES: ExpenseItem[] = [
	{ id: "1", code: "01", name: "Food", value: 60 },
	{ id: "2", code: "06", name: "Transport", value: 40 },
];

const WEIGHTS_MAP: Record<string, number[]> = {
	abra: MAJOR_CODES.map(() => 1),
	philippines: MAJOR_CODES.map(() => 1),
};

const MAJOR_NAMES: Record<string, string> = Object.fromEntries(MAJOR_CODES.map((c) => [c, `Category ${c}`]));

function run() {
	return calculatePersonalInflation(
		EXPENSES,
		LOCATION,
		DATES,
		CONFIG,
		buildIndex(),
		WEIGHTS_MAP,
		MAJOR_NAMES,
		"official",
	);
}

describe("calculatePersonalInflation", () => {
	it("returns null for empty expenses", () => {
		expect(
			calculatePersonalInflation(
				[],
				LOCATION,
				DATES,
				CONFIG,
				buildIndex(),
				WEIGHTS_MAP,
				MAJOR_NAMES,
				"official",
			),
		).toBeNull();
	});

	it("returns null in amount mode with zero total", () => {
		expect(
			calculatePersonalInflation(
				EXPENSES,
				LOCATION,
				DATES,
				{ mode: "amount", totalInput: 0 },
				buildIndex(),
				WEIGHTS_MAP,
				MAJOR_NAMES,
				"official",
			),
		).toBeNull();
	});

	it("computes a 10% personal rate from uniform 10% YoY CPI growth", () => {
		const result = run();
		expect(result).not.toBeNull();
		expect(result?.personalRate).toBeCloseTo(10, 5);
		expect(result?.yearlyCpiStart).toBeCloseTo(110, 5);
		expect(result?.yearlyCpiEnd).toBeCloseTo(121, 5);
		expect(result?.totalSpend).toBe(100);
	});

	it("builds a weighted breakdown per expense item", () => {
		const result = run()!;
		expect(result.breakdown).toHaveLength(2);
		const food = result.breakdown.find((b) => b.categoryCode === "01")!;
		const transport = result.breakdown.find((b) => b.categoryCode === "06")!;
		expect(food.weight).toBeCloseTo(60, 5);
		expect(transport.weight).toBeCloseTo(40, 5);
		expect(food.cpiStart).toBeCloseTo(110, 5);
		expect(food.cpiEnd).toBeCloseTo(121, 5);
		expect(food.itemInflationRate).toBeCloseTo(10, 5);
		expect(food.isMissing).toBe(false);
	});

	it("derives official comparator rates", () => {
		const result = run()!;
		expect(result.comparators.areaRate).toBeCloseTo(10, 5);
		expect(result.comparators.nationalRate).toBeCloseTo(10, 5);
		expect(result.comparators.regionRate).toBeUndefined();
		expect(result.comparators.provinceRate).toBeUndefined();
	});

	it("produces Personal / City-Mun / National contributor factors led by ALL ITEMS", () => {
		const result = run()!;
		expect(result.contributors.map((c) => c.factorName)).toEqual(["Personal", "City/Mun", "National"]);
		for (const factor of result.contributors) {
			expect(factor.contributors[0]?.name).toBe("ALL ITEMS");
		}
	});

	it("generates inflation and CPI trend series across the date range", () => {
		const result = run()!;
		// 2023-01..2023-12 (12) + 2024-01 (1) = 13 months
		expect(result.inflationTrend).toHaveLength(13);
		expect(result.cpiTrend).toHaveLength(13);

		for (const point of result.inflationTrend) {
			expect(point.personal).toBeCloseTo(10, 5);
			expect(point.area).toBeCloseTo(10, 5);
			expect(point.national).toBeCloseTo(10, 5);
			expect(point.region).toBeNull();
		}

		const lastCpi = result.cpiTrend[result.cpiTrend.length - 1]!;
		expect(lastCpi.personal).toBeCloseTo(121, 5);
		expect(lastCpi.area).toBeCloseTo(121, 5);
	});

	it("produces an interpretation (no region paragraph when region is absent)", () => {
		const result = run()!;
		// p2 (location) + p1 (cpi) + p3 (area) + p5 (national) = 4; region p4 skipped.
		expect(result.interpretation).toHaveLength(4);
	});

	it("publishes the official (City/Mun) contributor to graphStore via setCompareOfficial", () => {
		const result = run()!;
		expect(compareOfficial.get()).toBe(result.contributors[1]);
	});
});
