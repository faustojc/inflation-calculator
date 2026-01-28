import type { AreaDef } from "@/stores/dataStore";
import { type ExpenseItem } from "@/stores/inflationStore";

export type CompareMode = "area" | "region" | "ncr" | "national";

export interface LocationContext {
	hierarchy: {
		target: AreaDef;
		province?: AreaDef;
		region?: AreaDef;
		national?: AreaDef;
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
	personal: number | null;
	area: number | null;
	region: number | null;
	province?: number | null;
	national: number | null;
}

export interface Comparators {
	areaRate: number;
	regionRate: number;
	nationalRate: number;
	ncrRate: number;
	provinceRate?: number;
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
	const key = `${areaKey}|${year}|${month}|${code}`;
	return dataIndex.get(key) || null;
}

function calcGrowth(current: number, previous: number): number {
	if (previous === 0) return 0;
	return ((current - previous) / previous) * 100;
}

function calculateYoY(dataIndex: Map<string, number>, key: string | undefined, year: number, month: number, code: string = ALL_CODE): number {
	if (!key) return 0;
	const curr = findCpi(dataIndex, key, year, month, code);
	const prev = findCpi(dataIndex, key, year - 1, month, code);
	if (curr && prev && prev > 0) {
		return ((curr - prev) / prev) * 100;
	}
	return 0;
}

function calculatePersonalTrend(
	dataIndex: Map<string, number>,
	targetKey: string,
	itemsWithWeights: { code: string; weight: number }[],
	year: number,
	month: number,
): number {
	let validCount = 0;
	let compCurr = 0;
	let compPrev = 0;

	for (const item of itemsWithWeights) {
		const c1 = findCpi(dataIndex, targetKey, year, month, item.code);
		const c0 = findCpi(dataIndex, targetKey, year - 1, month, item.code);

		if (c1 !== null && c0 !== null) {
			compCurr += c1 * item.weight;
			compPrev += c0 * item.weight;
			validCount++;
		}
	}

	return validCount > 0 && compPrev > 0 ? ((compCurr - compPrev) / compPrev) * 100 : 0;
}

function processTrendMonth(
	year: number,
	month: number,
	dataIndex: Map<string, number>,
	hierarchy: LocationContext["hierarchy"],
	itemsWithWeights: { code: string; weight: number }[],
): TrendPoint | null {
	const personalRate = calculatePersonalTrend(dataIndex, hierarchy.target.key, itemsWithWeights, year, month);
	const areaRate = calculateYoY(dataIndex, hierarchy.target.key, year, month);
	const regionRate = calculateYoY(dataIndex, hierarchy.region?.key, year, month);

	const safeVal = (v: number | null) => (v === null ? null : Number(v.toFixed(1)));

	let provinceRate: number | undefined | null;
	if (hierarchy.province && hierarchy.province.key !== hierarchy.target.key) {
		const pRate = calculateYoY(dataIndex, hierarchy.province.key, year, month);
		provinceRate = pRate === null ? undefined : Number(pRate.toFixed(1));
	}

	const natRate = calculateYoY(dataIndex, hierarchy.national?.key, year, month);

	const dateObj = new Date(year, month - 1);
	return {
		date: dateObj.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
		sortKey: year * 100 + month,
		personal: safeVal(personalRate),
		area: safeVal(areaRate),
		region: safeVal(regionRate),
		province: provinceRate,
		national: safeVal(natRate),
	};
}

function generateTrend(
	expenses: ExpenseItem[],
	hierarchy: LocationContext["hierarchy"],
	dates: DateRange,
	config: CalculationConfig,
	dataIndex: Map<string, number>,
): TrendPoint[] {
	const series: TrendPoint[] = [];
	const totalInput = config.totalInput || 1;
	const itemsWithWeights = expenses.map((item) => ({
		code: item.code,
		weight: config.mode === "amount" ? (item.value / totalInput) * 100 : item.value,
	}));

	for (let year = dates.startYear; year <= dates.endYear; year++) {
		const startM = year === dates.startYear ? dates.startMonth : 1;
		const endM = year === dates.endYear ? dates.endMonth : 12;

		for (let month = startM; month <= endM; month++) {
			const point = processTrendMonth(year, month, dataIndex, hierarchy, itemsWithWeights);
			if (point) {
				series.push(point);
			}
		}
	}
	return series;
}

function generateInterpretation(
	personalRate: number,
	personalCpi: number,
	comps: Comparators,
	meta: { location: { hierarchy: { target: AreaDef; province?: AreaDef; region?: AreaDef; national?: AreaDef } }; dates: DateRange },
): string[] {
	const { location, dates } = meta;
	const monthStr = new Date(dates.endYear, dates.endMonth - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

	const getDir = (val: number) => (val >= 0 ? "increased" : "decreased");
	const getComp = (mine: number, theirs: number) => (mine > theirs ? "higher" : "lower");
	const getAff = (mine: number, theirs: number) => (mine > theirs ? "more" : "less");

	// If CPI is 120, you need 120 pesos today to buy what 100 pesos bought in 2018.
	const purchasingPower = personalCpi.toFixed(1) + "0";
	const percentChange = (personalCpi - 100).toFixed(1);

	const p1 = `Your computed consumer price index is ${personalCpi.toFixed(1)}. Which means that average price of your commonly purchased goods and services have ${getDir(
		personalCpi - 100,
	)} by ${percentChange}% compared with their average prices in 2018. Subsequently, in ${monthStr}, you will need PhP ${purchasingPower} to buy the same set of goods and services worth PhP 100.00 in 2018.`;

	const p2 = `You live in ${location.hierarchy.target.name || "Selected Area"} located in ${location.hierarchy.region!.name}.`;

	const p3 = `Your personal inflation rate of ${personalRate.toFixed(1)}% is ${getComp(personalRate, comps.areaRate)} than the inflation rate of the average households in ${
		location.hierarchy.target.name || "your area"
	} (${comps.areaRate.toFixed(1)}%). This means that you are ${getAff(personalRate, comps.areaRate)} affected by the price increases in ${
		location.hierarchy.target.name || "your area"
	} compared with the average household in the area.`;

	const p4 = `Your personal inflation rate of ${personalRate.toFixed(1)}% is ${getComp(
		personalRate,
		comps.regionRate,
	)} than the inflation rate of the average households in ${location.hierarchy.region!.name} (${comps.regionRate.toFixed(1)}%). This means that you are ${getAff(
		personalRate,
		comps.regionRate,
	)} affected by the price increases in ${location.hierarchy.region!.name} compared to the average household in the region.`;

	const p5 = `Your personal inflation rate of ${personalRate.toFixed(1)}% is ${getComp(
		personalRate,
		comps.nationalRate,
	)} than the inflation rate of the average households in the Philippines (${comps.nationalRate.toFixed(1)}%). This means that you are ${getAff(
		personalRate,
		comps.nationalRate,
	)} affected by the price increases in the country compared with the average household.`;

	return [p2, p1, p3, p4, p5];
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

		const cpiStart = findCpi(dataIndex, location.hierarchy.target.key, dates.startYear, dates.startMonth, item.code);
		const cpiEnd = findCpi(dataIndex, location.hierarchy.target.key, dates.endYear, dates.endMonth, item.code);

		if (cpiStart === null || cpiEnd === null) {
			missingItems.push(item.name);
			continue;
		}

		// STEP 2: WEIGHTED CPI
		// Formula: CPI * Weight
		const weightedCpiStart = cpiStart * weight;
		const weightedCpiEnd = cpiEnd * weight;

		// Item Growth
		const itemInflationRate = calcGrowth(cpiEnd, cpiStart);

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
	const personalRate = calcGrowth(yearlyCpiEnd, yearlyCpiStart);

	// Get need Start/End CPI for "ALL" items to calculate official rates
	const getOfficialRate = (key: string) => {
		const start = findCpi(dataIndex, key, dates.startYear, dates.startMonth, ALL_CODE);
		const end = findCpi(dataIndex, key, dates.endYear, dates.endMonth, ALL_CODE);
		return start && end ? calcGrowth(end, start) : 0;
	};

	const comparators = {
		areaRate: getOfficialRate(location.hierarchy.target.key),
		regionRate: getOfficialRate(location.hierarchy.region!.key),
		nationalRate: getOfficialRate("philippines"),
		ncrRate: getOfficialRate("ncr"),
	};

	const trend = generateTrend(expenses, location.hierarchy, dates, config, dataIndex);
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
