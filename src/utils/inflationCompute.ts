import type { ExpenseItem } from "@/stores/inflationStore";

export interface ItemBreakdown {
	id: string;
	name: string;
	categoryCode: string;
	currentAmount: number;
	previousAmount: number;
	itemInflationRate: number;
	status: "exact" | "substituted_region" | "substituted_national" | "estimated" | "missing";
	matchQuality: string;
}

export interface CalculationResult {
	personalRate: number;
	totalCurrentSpend: number;
	totalPreviousSpend: number;
	breakdown: ItemBreakdown[];
	error?: string;
	meta: {
		year: number;
		month: number;
		region: string;
		area?: string;
		income?: string;
	};
	dataIndex: Map<string, number>;
}

/**
 * Tries to find the most specific CPI value available.
 * Order of Preference:
 * 1. Specific Area + Specific Income
 * 2. Specific Area + All Income
 * 3. Region + Specific Income
 * 4. Region + All Income (Matches current generated data)
 * 5. National + Specific Income
 * 6. National + All Income
 */
function getBestMatchCpi(
	region: string,
	area: string | undefined,
	income: string | undefined,
	year: number,
	month: number,
	code: string,
	dataIndex: Map<string, number>
): { value: number; quality: string; isFallback: boolean } | null {
	const r = region;
	const a = area || "*";
	const i = income === "bottom30" ? "BOTTOM30" : "*";
	const y = year;
	const m = month;
	const c = code;

	const makeKey = (_r: string, _a: string, _i: string) => `${_r}|${_a}|${_i}|${y}|${m}|${c}`;

	// Full Specificity (e.g. Bacolod + Bottom 30)
	if (dataIndex.has(makeKey(r, a, i))) return { value: dataIndex.get(makeKey(r, a, i))!, quality: "Area & Income Specific", isFallback: false };

	// Specific Area + Any Income
	if (dataIndex.has(makeKey(r, a, "*"))) return { value: dataIndex.get(makeKey(r, a, "*"))!, quality: "Area Specific", isFallback: false };

	// Region + Specific Income
	if (dataIndex.has(makeKey(r, "*", i))) return { value: dataIndex.get(makeKey(r, "*", i))!, quality: "Region & Income Specific", isFallback: false };

	// Region + Any Income (Target for Current Data)
	if (dataIndex.has(makeKey(r, "*", "*"))) return { value: dataIndex.get(makeKey(r, "*", "*"))!, quality: "Regional Average", isFallback: false };

	// National + Specific Income
	if (dataIndex.has(makeKey("PH", "*", i))) return { value: dataIndex.get(makeKey("PH", "*", i))!, quality: "National (Income Specific)", isFallback: true };

	// National + Any Income
	if (dataIndex.has(makeKey("PH", "*", "*"))) return { value: dataIndex.get(makeKey("PH", "*", "*"))!, quality: "National Average", isFallback: true };

	return null;
}

function getCpiWithRecursion(
	region: string,
	area: string | undefined,
	income: string | undefined,
	year: number,
	month: number,
	code: string,
	dataIndex: Map<string, number>
): { value: number; quality: string; status: ItemBreakdown["status"] } | null {
	const exact = getBestMatchCpi(region, area, income, year, month, code, dataIndex);
	if (exact) {
		return {
			value: exact.value,
			quality: exact.quality,
			status: exact.isFallback ? "substituted_national" : "exact",
		};
	}

	if (code.includes(".")) {
		const parentCode = code.split(".").slice(0, -1).join(".");
		const parent = getCpiWithRecursion(region, area, income, year, month, parentCode, dataIndex);

		if (parent) {
			return {
				value: parent.value,
				quality: `Estimated from ${parentCode}`,
				status: "estimated",
			};
		}
	}

	return null;
}

export function calculatePersonalInflation(
	expenses: ExpenseItem[],
	regionCode: string,
	startYear: number,
	startMonth: number,
	endYear: number,
	endMonth: number,
	mode: "amount" | "percent",
	totalBudget: number = 0,
	areaCode?: string,
	incomeClass?: string,
	dataIndex?: Map<string, number>
): CalculationResult | null {
	if (!dataIndex || dataIndex.size === 0) {
		return null;
	}

	const baseCheck = getCpiWithRecursion(regionCode, areaCode, incomeClass, startYear, startMonth, "01", dataIndex);
	const endCheck = getCpiWithRecursion(regionCode, areaCode, incomeClass, endYear, endMonth, "01", dataIndex);

	if (!baseCheck) {
		return {
			personalRate: 0,
			totalCurrentSpend: 0,
			totalPreviousSpend: 0,
			breakdown: [],
			error: `No CPI data found for ${regionCode} in ${startMonth}/${startYear}.`,
			meta: { year: endYear, month: endMonth, region: regionCode },
			dataIndex,
		};
	}

	if (!endCheck) {
		return {
			personalRate: 0,
			totalCurrentSpend: 0,
			totalPreviousSpend: 0,
			breakdown: [],
			error: `No CPI data found for ${regionCode} in ${endMonth}/${endYear}. Data might not be published yet.`,
			meta: { year: endYear, month: endMonth, region: regionCode },
			dataIndex,
		};
	}

	let totalCurrent = 0;
	let totalPrevious = 0;
	const breakdown: ItemBreakdown[] = [];

	for (const item of expenses) {
		if (item.value <= 0) continue;

		const currentSpend = mode === "amount" ? item.value : totalBudget * (item.value / 100);

		const cpiCurr = getCpiWithRecursion(regionCode, areaCode, incomeClass, endYear, endMonth, item.code, dataIndex);
		const cpiPrev = getCpiWithRecursion(regionCode, areaCode, incomeClass, startYear, startMonth, item.code, dataIndex);

		let previousSpend = currentSpend;
		let itemRate = 0;
		let status: ItemBreakdown["status"] = "exact";
		let matchQuality = "Data Missing";

		if (cpiCurr && cpiPrev && cpiCurr.value > 0 && cpiPrev.value > 0) {
			previousSpend = currentSpend * (cpiPrev.value / cpiCurr.value);
			itemRate = ((cpiCurr.value - cpiPrev.value) / cpiPrev.value) * 100;

			status = cpiCurr.status === "exact" && cpiPrev.status === "exact" ? "exact" : cpiCurr.status;
			matchQuality = cpiCurr.quality;
		} else {
			status = "missing";
		}

		totalCurrent += currentSpend;
		totalPrevious += previousSpend;

		breakdown.push({
			id: item.id,
			name: item.name,
			categoryCode: item.code,
			currentAmount: currentSpend,
			previousAmount: previousSpend,
			itemInflationRate: itemRate,
			status,
			matchQuality,
		});
	}

	const personalRate = totalPrevious > 0 ? ((totalCurrent - totalPrevious) / totalPrevious) * 100 : 0;

	return {
		personalRate,
		totalCurrentSpend: totalCurrent,
		totalPreviousSpend: totalPrevious,
		breakdown,
		meta: { year: endYear, month: endMonth, region: regionCode, area: areaCode, income: incomeClass },
		dataIndex,
	};
}
