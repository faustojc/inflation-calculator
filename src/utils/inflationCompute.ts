import type { ExpenseItem } from "@/stores/inflationStore";
export interface LocationContext {
	regionCode: string;
	areaCode?: string;
	incomeClass?: string;
}

export interface DateRange {
	startYear: number;
	startMonth: number;
	endYear: number;
	endMonth: number;
}

export interface CalculationConfig {
	mode: "amount" | "percent";
	totalBudget: number;
}

export interface ItemBreakdown {
	id: string;
	name: string;
	categoryCode: string;
	currentSpend: number;
	previousSpend: number;
	cpiStart: number;
	cpiEnd: number;
	itemInflationRate: number;
	status: "exact" | "substituted_region" | "substituted_national" | "estimated" | "missing";
	matchQuality: string;
}

export interface CalculationResult {
	personalInflationRate: number;
	totalCurrentSpend: number;
	totalPreviousSpend: number;
	breakdown: ItemBreakdown[];
	meta: {
		location: LocationContext;
		dates: DateRange;
	};
	error?: string;
}

const KEY_SEP = "|";
const WILDCARD = "*";

function findBestCpi(
	location: LocationContext,
	year: number,
	month: number,
	code: string,
	dataIndex: Map<string, number>
): { value: number; quality: string; status: ItemBreakdown["status"] } | null {
	const r = location.regionCode;
	const a = location.areaCode || WILDCARD;
	const i = location.incomeClass === "bottom30" ? "BOTTOM30" : WILDCARD;

	const makeKey = (reg: string, area: string, inc: string, c: string) =>
		`${reg}${KEY_SEP}${area}${KEY_SEP}${inc}${KEY_SEP}${year}${KEY_SEP}${month}${KEY_SEP}${c}`;

	let currentCode = code;
	let attempts = 0;
	const MAX_DEPTH = 6;

	while (currentCode.length > 0 && attempts < MAX_DEPTH) {
		// 1. Exact Location + Income
		let key = makeKey(r, a, i, currentCode);
		if (dataIndex.has(key)) return { value: dataIndex.get(key)!, quality: "Exact", status: "exact" };

		// 2. Exact Location + Any Income
		key = makeKey(r, a, WILDCARD, currentCode);
		if (dataIndex.has(key)) return { value: dataIndex.get(key)!, quality: "Area Avg", status: "exact" };

		// 3. Region + Specific Income
		key = makeKey(r, WILDCARD, i, currentCode);
		if (dataIndex.has(key)) return { value: dataIndex.get(key)!, quality: "Region/Income", status: "exact" };

		// 4. Region + Any Income
		key = makeKey(r, WILDCARD, WILDCARD, currentCode);
		if (dataIndex.has(key)) return { value: dataIndex.get(key)!, quality: "Region Avg", status: "substituted_region" };

		// 5. National
		key = makeKey("PH", WILDCARD, WILDCARD, currentCode);
		if (dataIndex.has(key)) return { value: dataIndex.get(key)!, quality: "National Avg", status: "substituted_national" };

		// Move up tree
		const lastDotIndex = currentCode.lastIndexOf(".");
		if (lastDotIndex === -1) break;
		currentCode = currentCode.substring(0, lastDotIndex);
		attempts++;
	}

	return null;
}

export function calculatePersonalInflation(
	expenses: ExpenseItem[],
	location: LocationContext,
	dates: DateRange,
	config: CalculationConfig,
	dataIndex?: Map<string, number>
): CalculationResult | null {
	if (!dataIndex || dataIndex.size === 0 || expenses.length === 0) return null;

	const baseCheck = findBestCpi(location, dates.startYear, dates.startMonth, "01", dataIndex);
	if (!baseCheck) {
		return {
			personalInflationRate: 0,
			totalCurrentSpend: 0,
			totalPreviousSpend: 0,
			breakdown: [],
			meta: { location, dates },
			error: `Data missing for ${location.regionCode} in ${dates.startMonth}/${dates.startYear}`,
		};
	}

	let validTotalCurrent = 0;
	let validTotalPrevious = 0;
	const breakdown: ItemBreakdown[] = [];

	for (const item of expenses) {
		if (item.value <= 0) continue;

		const currentSpend = config.mode === "amount" ? item.value : config.totalBudget * (item.value / 100);
		const startData = findBestCpi(location, dates.startYear, dates.startMonth, item.code, dataIndex);
		const endData = findBestCpi(location, dates.endYear, dates.endMonth, item.code, dataIndex);

		let previousSpend = 0;
		let itemRate = 0;
		let status: ItemBreakdown["status"] = "missing";
		let matchQuality = "Data Missing";
		let cpiStart = 0;
		let cpiEnd = 0;

		if (startData && endData && startData.value > 0 && endData.value > 0) {
			cpiStart = startData.value;
			cpiEnd = endData.value;

			previousSpend = currentSpend * (cpiStart / cpiEnd);
			itemRate = ((cpiEnd - cpiStart) / cpiStart) * 100;

			if (startData.status !== "exact") status = startData.status;
			else if (endData.status === "exact") {
				status = "exact";
			} else {
				status = endData.status;
			}

			matchQuality = endData.quality;
			validTotalCurrent += currentSpend;
			validTotalPrevious += previousSpend;
		}

		breakdown.push({
			id: item.id,
			name: item.name,
			categoryCode: item.code,
			currentSpend,
			previousSpend,
			cpiStart,
			cpiEnd,
			itemInflationRate: itemRate,
			status,
			matchQuality,
		});
	}

	let personalInflationRate = 0;
	if (validTotalPrevious > 0) {
		personalInflationRate = ((validTotalCurrent - validTotalPrevious) / validTotalPrevious) * 100;
	}

	return {
		personalInflationRate,
		totalCurrentSpend: validTotalCurrent,
		totalPreviousSpend: validTotalPrevious,
		breakdown,
		meta: { location, dates },
	};
}
