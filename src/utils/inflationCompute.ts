import { type ExpenseItem } from "@/stores/inflationStore";

export type CompareMode = "area" | "region" | "ncr" | "national";

export interface LocationContext {
	regionCode: string;
	provinceName?: string;
	keys: {
		area: string;
		region: string;
		national: string;
	};
}

export interface DateRange {
	startYear: number;
	startMonth: number;
	endYear: number;
	endMonth: number;
}

export interface CalculationConfig {
	mode: "amount" | "percent";
	totalInput: number;
}

export interface TrendPoint {
	date: string;
	sortKey: number;
	personal: number;
	area: number;
	region: number;
	ncr: number;
	national: number;
}

export interface Comparators {
	areaRate: number;
	regionRate: number;
	nationalRate: number;
	ncrRate: number;
}

export interface ItemBreakdown {
	id: string;
	name: string;
	categoryCode: string;
	inputValue: number;
	weight: number;
	cpiStart: number;
	cpiEnd: number;
	weightedCpiStart: number;
	weightedCpiEnd: number;
	itemInflationRate: number;
	isMissing: boolean;
}

export interface CalculationResult {
	personalRate: number;
	yearlyCpiStart: number;
	yearlyCpiEnd: number;
	totalSpend: number;
	breakdown: ItemBreakdown[];
	trend: TrendPoint[];
	comparators: Comparators;
	interpretation: string[];
	missingItems: string[];
	meta: {
		location: LocationContext;
		dates: DateRange;
	};
}

const ALL_CODE = "0";

function findCpi(dataIndex: Map<string, number>, areaKey: string, year: number, month: number, code: string): number | null {
	const key = `${areaKey}|*|${year}|${month}|${code}`;
	return dataIndex.get(key) || null;
}

function calcGrowth(current: number, previous: number): number {
	if (previous === 0) return 0;
	return ((current - previous) / previous) * 100;
}

function generateTrend(
	expenses: ExpenseItem[],
	location: LocationContext,
	years: number[],
	config: CalculationConfig,
	dataIndex: Map<string, number>,
): TrendPoint[] {
	const series: TrendPoint[] = [];
	const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

	const totalInput = config.totalInput || 1;
	const itemsWithWeights = expenses.map((item) => ({
		code: item.code,
		weight: config.mode === "amount" ? (item.value / totalInput) * 100 : item.value,
	}));

	const sortedYears = [...years].sort((a, b) => a - b);

	for (const year of sortedYears) {
		for (const month of months) {
			// 1. Personal CPI
			let weightedSum = 0;
			let validCount = 0;

			for (const item of itemsWithWeights) {
				const cpi = findCpi(dataIndex, location.keys.area, year, month, item.code);
				if (cpi !== null) {
					weightedSum += cpi * item.weight;
					validCount++;
				}
			}
			const personalCpi = validCount > 0 ? weightedSum / 100 : 0;

			const areaCpi = findCpi(dataIndex, location.keys.area, year, month, ALL_CODE) || 0;
			const regionCpi = findCpi(dataIndex, location.keys.region, year, month, ALL_CODE) || 0;
			const natCpi = findCpi(dataIndex, "philippines", year, month, ALL_CODE) || 0;
			const ncrCpi = findCpi(dataIndex, "ncr", year, month, ALL_CODE) || 0;

			if (personalCpi > 0 || areaCpi > 0) {
				const dateObj = new Date(year, month - 1);
				series.push({
					date: dateObj.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
					sortKey: year * 100 + month,
					personal: Number(personalCpi.toFixed(1)),
					area: areaCpi,
					region: regionCpi,
					national: natCpi,
					ncr: ncrCpi,
				});
			}
		}
	}
	return series;
}

function generateInterpretation(
	personalRate: number,
	personalCpi: number,
	comps: Comparators,
	meta: { location: LocationContext; dates: DateRange },
): string[] {
	const { location, dates } = meta;
	const monthStr = new Date(dates.endYear, dates.endMonth - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

	const getDir = (val: number) => (val >= 0 ? "increased" : "decreased");
	const getComp = (mine: number, theirs: number) => (mine > theirs ? "higher" : "lower");
	const getAff = (mine: number, theirs: number) => (mine > theirs ? "more" : "less");

	// If CPI is 120, you need 120 pesos today to buy what 100 pesos bought in 2018.
	const purchasingPower = personalCpi.toFixed(2);
	const percentChange = (personalCpi - 100).toFixed(1);

	const p1 = `Your computed consumer price index is ${personalCpi.toFixed(1)}. Which means that average price of your commonly purchased goods and services have ${getDir(
		personalCpi - 100,
	)} by ${percentChange}% compared with their average prices in 2018. Subsequently, you will need PhP ${purchasingPower} to buy the same set of goods and services in ${monthStr}.`;

	const p2 = `You live in ${location.provinceName || "Selected Area"} located in ${location.regionCode}.`;

	const p3 = `Your personal inflation rate of ${personalRate.toFixed(1)}% is ${getComp(personalRate, comps.areaRate)} than the inflation rate of the average households in ${
		location.provinceName || "your area"
	} (${comps.areaRate.toFixed(1)}%). This means that you are ${getAff(personalRate, comps.areaRate)} affected by the price increases in ${
		location.provinceName || "your area"
	} compared with the average household in the area.`;

	const p4 = `Your personal inflation rate of ${personalRate.toFixed(1)}% is ${getComp(
		personalRate,
		comps.regionRate,
	)} than the inflation rate of the average households in ${location.regionCode} (${comps.regionRate.toFixed(1)}%). This means that you are ${getAff(
		personalRate,
		comps.regionRate,
	)} affected by the price increases in ${location.regionCode} compared to the average household in the region.`;

	const p5 = `Your personal inflation rate of ${personalRate.toFixed(1)}% is ${getComp(
		personalRate,
		comps.nationalRate,
	)} than the inflation rate of the average households in the Philippines (${comps.nationalRate.toFixed(1)}%). This means that you are ${getAff(
		personalRate,
		comps.nationalRate,
	)} affected by the price increases in the country compared with the average household.`;

	return [p1, p2, p3, p4, p5];
}

export function calculatePersonalInflation(
	expenses: ExpenseItem[],
	location: LocationContext,
	dates: DateRange,
	config: CalculationConfig,
	dataIndex?: Map<string, number>,
): CalculationResult | null {
	if (!dataIndex || dataIndex.size === 0 || expenses.length === 0) return null;
	if (config.mode === "amount" && config.totalInput === 0) return null;

	const breakdown: ItemBreakdown[] = [];
	const missingItems: string[] = [];

	let sumWeightedCpiStart = 0;
	let sumWeightedCpiEnd = 0;

	for (const item of expenses) {
		if (item.value <= 0) continue;

		// STEP 1: WEIGHT
		// Formula: (Input / Sum) * 100 or just the value if percent
		const weight = config.mode === "amount" ? (item.value / config.totalInput) * 100 : item.value;

		const cpiStart = findCpi(dataIndex, location.keys.area, dates.startYear, dates.startMonth, item.code);
		const cpiEnd = findCpi(dataIndex, location.keys.area, dates.endYear, dates.endMonth, item.code);

		if (cpiStart === null || cpiEnd === null) {
			missingItems.push(item.name);
			continue;
		}

		// STEP 2: WEIGHTED CPI
		// Formula: CPI * Weight
		const weightedCpiStart = cpiStart * weight;
		const weightedCpiEnd = cpiEnd * weight;

		// Item Growth
		const itemInflationRate = calcGrowth(cpiStart, cpiEnd);

		sumWeightedCpiStart += weightedCpiStart;
		sumWeightedCpiEnd += weightedCpiEnd;

		breakdown.push({
			id: item.id,
			name: item.name,
			categoryCode: item.code,
			inputValue: item.value,
			weight,
			cpiStart,
			cpiEnd,
			weightedCpiStart,
			weightedCpiEnd,
			itemInflationRate,
			isMissing: false,
		});
	}

	if (missingItems.length > 0) {
		return {
			personalRate: 0,
			yearlyCpiStart: 0,
			yearlyCpiEnd: 0,
			totalSpend: 0,
			breakdown: [],
			trend: [],
			comparators: { areaRate: 0, regionRate: 0, nationalRate: 0, ncrRate: 0 },
			interpretation: [],
			missingItems,
			meta: { location, dates },
		};
	}

	const yearlyCpiStart = sumWeightedCpiStart / 100;
	const yearlyCpiEnd = sumWeightedCpiEnd / 100;
	const personalRate = calcGrowth(yearlyCpiStart, yearlyCpiEnd);

	// Get need Start/End CPI for "ALL" items to calculate official rates
	const getOfficialRate = (key: string) => {
		const start = findCpi(dataIndex, key, dates.startYear, dates.startMonth, ALL_CODE);
		const end = findCpi(dataIndex, key, dates.endYear, dates.endMonth, ALL_CODE);
		return start && end ? calcGrowth(end, start) : 0;
	};

	const comparators = {
		areaRate: getOfficialRate(location.keys.area),
		regionRate: getOfficialRate(location.keys.region),
		nationalRate: getOfficialRate(location.keys.national),
		ncrRate: getOfficialRate("ncr"),
	};

	const trend = generateTrend(expenses, location, [dates.startYear, dates.endYear], config, dataIndex);
	const interpretation = generateInterpretation(personalRate, yearlyCpiEnd, comparators, { location, dates });

	return {
		personalRate,
		yearlyCpiStart,
		yearlyCpiEnd,
		totalSpend: config.totalInput,
		breakdown,
		trend,
		comparators,
		interpretation,
		missingItems: [],
		meta: { location, dates },
	};
}
