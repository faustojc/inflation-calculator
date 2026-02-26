import type { AreaDef, DataIndex } from "@/lib/types";
import { type ExpenseItem } from "@/stores/inflationStore";

export interface LocationContext {
	hierarchy: {
		target: AreaDef;
		province?: AreaDef;
		region?: AreaDef;
		ncr?: AreaDef;
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
	regionRate?: number;
	nationalRate: number;
	ncrRate?: number;
	provinceRate?: number;
}

export interface CommodityContribution {
	code: string;
	name: string;
	weight: number;
	inflationRate: number;
	percentShare: number;
}

export interface ContributionFactor {
	factorName: string; // Personal, City, Province, etc.
	areaName: string;
	inflationRate: number;
	contributors: CommodityContribution[];
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
	contributors: ContributionFactor[];
	trend: TrendPoint[];
	comparators: Comparators;
	interpretation: string[];
	meta: {
		location: LocationContext;
		dates: DateRange;
	};
}

/**
 * Finds the CPI value for a specific area, year, month, and code.
 * @param index The data index.
 * @param areaKey The area key.
 * @param year The year.
 * @param month The month.
 * @param code The code.
 * @returns The CPI value or null if not found.
 */
function findCpi(index: DataIndex, areaKey: string, year: number, month: number, code: string): number | null {
	const val = index[areaKey]?.[year]?.[month]?.[code];
	return val ?? null;
}

/**
 * Calculates the growth rate or inflation rate.
 * @param current The current value.
 * @param previous The previous value.
 * @returns The growth rate or inflation rate.
 */
function calcGrowth(current: number, previous: number): number {
	if (previous === 0) return 0;
	return ((current - previous) / previous) * 100;
}

/**
 * Calculates the year-over-year growth rate.
 * @param dataIndex The data index.
 * @param key The key.
 * @param year The year.
 * @param month The month.
 * @param code The code.
 * @returns The year-over-year growth rate.
 */
function calculateYoY(dataIndex: DataIndex, key: string | undefined, year: number, month: number, code: string): number {
	if (!key) return 0;
	const curr = findCpi(dataIndex, key, year, month, code);
	const prev = findCpi(dataIndex, key, year - 1, month, code);
	if (curr && prev && prev > 0) {
		return calcGrowth(curr, prev);
	}
	return 0;
}

/**
 * Calculates the personal trend.
 * @param index The data index.
 * @param targetKey The target key.
 * @param itemsWithWeights The items with weights.
 * @param year The year.
 * @param month The month.
 * @returns The personal trend.
 */
function calculatePersonalTrend(
	index: DataIndex,
	targetKey: string,
	itemsWithWeights: { code: string; weight: number }[],
	year: number,
	month: number,
): number {
	const currentMonthData = index[targetKey]?.[year]?.[month];
	const prevMonthData = index[targetKey]?.[year - 1]?.[month];

	if (!currentMonthData || !prevMonthData) return 0;

	let validCount = 0;
	let compCurr = 0;
	let compPrev = 0;

	for (const item of itemsWithWeights) {
		const c1 = currentMonthData[item.code];
		const c0 = prevMonthData[item.code];

		if (c1 !== undefined && c0 !== undefined) {
			compCurr += c1 * item.weight;
			compPrev += c0 * item.weight;
			validCount++;
		}
	}

	return validCount > 0 && compPrev > 0 ? calcGrowth(compCurr, compPrev) : 0;
}

function processTrendMonth(
	year: number,
	month: number,
	dataIndex: DataIndex,
	hierarchy: LocationContext["hierarchy"],
	itemsWithWeights: { code: string; weight: number }[],
	code: string,
): TrendPoint | null {
	const personalRate = calculatePersonalTrend(dataIndex, hierarchy.target.key, itemsWithWeights, year, month);
	const areaRate = calculateYoY(dataIndex, hierarchy.target.key, year, month, code);
	const regionRate = calculateYoY(dataIndex, hierarchy.region?.key, year, month, code);

	const safeVal = (v: number | null) => (v === null ? null : Number(v.toFixed(1)));

	let provinceRate: number | undefined | null;
	if (hierarchy.province && hierarchy.province.key !== hierarchy.target.key) {
		const pRate = calculateYoY(dataIndex, hierarchy.province.key, year, month, code);
		provinceRate = pRate === null ? undefined : Number(pRate.toFixed(1));
	}

	const natRate = calculateYoY(dataIndex, hierarchy.national?.key, year, month, code);

	const dateObj = new Date(year, month - 1);
	return {
		date: dateObj.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
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
	dataIndex: DataIndex,
	code: string,
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
			const point = processTrendMonth(year, month, dataIndex, hierarchy, itemsWithWeights, code);
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
	meta: {
		location: { hierarchy: { target: AreaDef; province?: AreaDef; region?: AreaDef; national?: AreaDef } };
		dates: DateRange;
	},
): string[] {
	const { location, dates } = meta;
	const monthStr = new Date(dates.endYear, dates.endMonth - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

	const getDir = (val: number) => (val >= 0 ? "increased" : "decreased");
	const getComp = (mine: number, theirs: number) => (mine > theirs ? "higher" : "lower");
	const getAff = (mine: number, theirs: number) => (mine > theirs ? "more" : "less");

	// If CPI is 120, you need 120 pesos today to buy what 100 pesos bought in 2018.
	const purchasingPower = personalCpi.toFixed(1) + "0";
	const percentChange = (personalCpi - 100).toFixed(1);

	const areaName = location.hierarchy.target.name || "Selected Area";
	const regionName = location.hierarchy.region?.name;

	const p1 = `Your computed consumer price index is ${personalCpi.toFixed(1)}. It means that average price of your commonly purchased goods and services have ${getDir(
		personalCpi - 100,
	)} by ${percentChange}% compared with their average prices in 2018. Subsequently, in ${monthStr}, you will need PhP ${purchasingPower} to buy the same set of goods and services worth PhP 100.00 in 2018.`;

	const p2 = `You live in ${areaName}${regionName ? ` located in ${regionName}` : ""}.`;

	const p3 = `Your personal inflation rate of ${personalRate.toFixed(1)}% is ${getComp(personalRate, comps.areaRate)} than the inflation rate of the average households in ${
		areaName
	} (${comps.areaRate.toFixed(1)}%). This means that you are ${getAff(personalRate, comps.areaRate)} affected by the price increases in ${
		areaName
	} compared with the average household in the area.`;

	const interpretation = [p2, p1, p3];

	if (regionName && comps.regionRate !== undefined) {
		const p4 = `Your personal inflation rate of ${personalRate.toFixed(1)}% is ${getComp(
			personalRate,
			comps.regionRate,
		)} than the inflation rate of the average households in ${regionName} (${comps.regionRate.toFixed(1)}%). This means that you are ${getAff(
			personalRate,
			comps.regionRate,
		)} affected by the price increases in ${regionName} compared to the average household in the region.`;
		interpretation.push(p4);
	}

	const p5 = `Your personal inflation rate of ${personalRate.toFixed(1)}% is ${getComp(
		personalRate,
		comps.nationalRate,
	)} than the inflation rate of the average households in the Philippines (${comps.nationalRate.toFixed(1)}%). This means that you are ${getAff(
		personalRate,
		comps.nationalRate,
	)} affected by the price increases in the country compared with the average household.`;
	interpretation.push(p5);

	return interpretation;
}

export function calculatePersonalInflation(
	expenses: ExpenseItem[],
	location: LocationContext,
	dates: DateRange,
	config: CalculationConfig,
	dataIndex: DataIndex,
	weightsMap: Record<string, number[]>,
	majorCategoryNames: Record<string, string>,
): CalculationResult | null {
	if (Object.keys(dataIndex).length === 0 || expenses.length === 0) return null;
	if (config.mode === "amount" && config.totalInput === 0) return null;

	const breakdown: ItemBreakdown[] = [];

	let sumWeightedCpiStart = 0;
	let sumWeightedCpiEnd = 0;

	for (const item of expenses) {
		if (item.value <= 0) continue;

		// STEP 1: WEIGHT
		// Formula: (Input / Sum) * 100 or just the value if percent
		const weight = config.mode === "amount" ? (item.value / config.totalInput) * 100 : item.value;

		const cpiStart = findCpi(dataIndex, location.hierarchy.target.key, dates.startYear, dates.startMonth, item.code)!;
		const cpiEnd = findCpi(dataIndex, location.hierarchy.target.key, dates.endYear, dates.endMonth, item.code)!;

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

	const yearlyCpiStart = sumWeightedCpiStart / 100;
	const yearlyCpiEnd = sumWeightedCpiEnd / 100;
	const personalRate = calcGrowth(yearlyCpiEnd, yearlyCpiStart);

	// Get need Start/End CPI for "ALL" items to calculate official rates
	const getOfficialRate = (key: string) => {
		const start = findCpi(dataIndex, key, dates.startYear, dates.startMonth, "0");
		const end = findCpi(dataIndex, key, dates.endYear, dates.endMonth, "0");
		return start && end ? calcGrowth(end, start) : 0;
	};

	const comparators = {
		areaRate: getOfficialRate(location.hierarchy.target.key),
		regionRate: location.hierarchy.region ? getOfficialRate(location.hierarchy.region.key) : undefined,
		nationalRate: getOfficialRate("philippines"),
		provinceRate: location.hierarchy.province ? getOfficialRate(location.hierarchy.province.key) : undefined,
	};

	const calculateContributors = (
		factorName: string,
		areaName: string,
		inflationRate: number,
		areaKey: string | null,
		isPersonal = false,
	): ContributionFactor => {
		const contributions: CommodityContribution[] = [];

		// "ALL ITEMS" is always rank 0 — top of the commodity hierarchy
		const allItems: CommodityContribution = {
			code: "0",
			name: "ALL ITEMS",
			weight: 100,
			inflationRate,
			percentShare: 100,
		};

		if (isPersonal) {
			// Compute weighted CPI change per item: (CPI_start - CPI_end) * weight
			// where CPI_start = selected date (cpiEnd in code), CPI_end = previous date (cpiStart in code)
			let totalWeightedChange = 0;
			breakdown.forEach((b) => {
				totalWeightedChange += (b.cpiEnd - b.cpiStart) * b.weight;
			});

			breakdown.forEach((b) => {
				const weightedChange = (b.cpiEnd - b.cpiStart) * b.weight;
				const percentShare = totalWeightedChange !== 0 ? (weightedChange / totalWeightedChange) * 100 : 0;
				contributions.push({
					code: b.categoryCode,
					name: b.name,
					weight: b.weight,
					inflationRate: b.itemInflationRate,
					percentShare,
				});
			});
		} else if (areaKey && weightsMap[areaKey]) {
			const areaWeights = weightsMap[areaKey];
			const codes = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"];
			let totalWeightedChange = 0;
			const tempContribs: { code: string; weightedChange: number; weight: number; itemInflation: number }[] = [];

			for (let i = 0; i < codes.length; i++) {
				const code = codes[i]!;
				const weight = areaWeights[i];
				const cpiEnd = findCpi(dataIndex, areaKey, dates.endYear, dates.endMonth, code);
				const cpiStart = findCpi(dataIndex, areaKey, dates.startYear, dates.startMonth, code);

				if (cpiEnd !== null && cpiStart !== null && weight !== undefined) {
					const weightedChange = (cpiEnd - cpiStart) * weight;
					totalWeightedChange += weightedChange;
					const itemInflation = cpiStart > 0 ? calcGrowth(cpiEnd, cpiStart) : 0;
					tempContribs.push({ code, weightedChange, weight, itemInflation });
				}
			}

			// Use actual sum of area weights for ALL ITEMS weight
			allItems.weight = areaWeights.reduce((sum, w) => sum + w, 0);

			for (const c of tempContribs) {
				const percentShare = totalWeightedChange !== 0 ? (c.weightedChange / totalWeightedChange) * 100 : 0;
				contributions.push({
					code: c.code,
					name: majorCategoryNames[c.code] || c.code,
					weight: c.weight,
					inflationRate: c.itemInflation,
					percentShare,
				});
			}
		}

		contributions.sort((a, b) => b.percentShare - a.percentShare);
		return {
			factorName,
			areaName,
			inflationRate,
			contributors: [allItems, ...contributions.slice(0, 3)],
		};
	};

	const contributors: ContributionFactor[] = [
		calculateContributors("Personal", location.hierarchy.target.name, personalRate, null, true),
		calculateContributors("City/Mun", location.hierarchy.target.name, comparators.areaRate, location.hierarchy.target.key),
	];

	if (location.hierarchy.province && location.hierarchy.province.key !== location.hierarchy.target.key) {
		contributors.push(
			calculateContributors(
				"Province",
				location.hierarchy.province.name,
				comparators.provinceRate || 0,
				location.hierarchy.province.key,
			),
		);
	}

	if (location.hierarchy.region && comparators.regionRate) {
		contributors.push(
			calculateContributors(
				"Region",
				location.hierarchy.region.name,
				comparators.regionRate,
				location.hierarchy.region.key,
			),
		);
	}

	contributors.push(calculateContributors("National", "Philippines", comparators.nationalRate, "philippines"));

	const trend = generateTrend(expenses, location.hierarchy, dates, config, dataIndex, "0");
	const interpretation = generateInterpretation(personalRate, yearlyCpiEnd, comparators, { location, dates });

	return {
		personalRate,
		yearlyCpiStart,
		yearlyCpiEnd,
		totalSpend: config.totalInput,
		breakdown,
		contributors,
		trend,
		comparators,
		interpretation,
		meta: { location, dates },
	};
}
