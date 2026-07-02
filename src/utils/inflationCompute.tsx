import type { JSX } from "solid-js";
import type { AreaDef, DataIndex, DataType } from "@/lib/types";
import { setCompareOfficial } from "@/stores/graphStore";
import type { ExpenseItem } from "@/stores/inflationStore";

export interface LocationContext {
	target: AreaDef;
	province?: AreaDef;
	region?: AreaDef;
	ncr?: AreaDef;
	national?: AreaDef;
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
	inflationTrend: TrendPoint[];
	cpiTrend: TrendPoint[];
	comparators: Comparators;
	interpretation: JSX.Element[];
	meta: {
		location: LocationContext;
		dates: DateRange;
	};
}

// Moved outside to precreate the function
// Get need Start/End CPI for "ALL" items to calculate official rates
function getOfficialRate(key: string, dataIndex: DataIndex, dates: DateRange) {
	const start = findCpi(dataIndex, key, dates.startYear, dates.startMonth, "0", "official");
	const end = findCpi(dataIndex, key, dates.endYear, dates.endMonth, "0", "official");
	return start && end ? calcGrowth(end, start) : 0;
}

function calculateOfficialContribution(
	dataIndex: DataIndex,
	areaWeights: number[],
	areaKey: string,
	majorCategoryNames: Record<string, string>,
	dates: DateRange,
): { contributions: CommodityContribution[]; allItemsWeights: number } {
	const contributions: CommodityContribution[] = [];
	const codes = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"];
	let totalWeightedChange = 0;
	const tempContribs: { code: string; weightedChange: number; weight: number; itemInflation: number }[] =
		[];

	for (let i = 0; i < codes.length; i++) {
		const code = codes[i]!;
		const weight = areaWeights[i];
		const cpiEnd = findCpi(dataIndex, areaKey, dates.endYear, dates.endMonth, code, "official");
		const cpiStart = findCpi(dataIndex, areaKey, dates.startYear, dates.startMonth, code, "official");

		if (cpiEnd !== null && cpiStart !== null && weight !== undefined) {
			const weightedChange = (cpiEnd - cpiStart) * weight;
			totalWeightedChange += weightedChange;

			// NOTE: THIS OFFICIAL COMMODITY'S INFLATION RATE IS SAME AS PERSONAL'S INFLATION RATE AS THEY USED THE
			// SAME CPI DATA SOURCE BUT DIFFERENT WEIGHT
			const itemInflation = cpiStart > 0 ? calcGrowth(cpiEnd, cpiStart) : 0;
			tempContribs.push({ code, weightedChange, weight, itemInflation });
		}
	}

	// Use actual sum of area weights for ALL ITEMS weight
	const allItemsWeights = areaWeights.reduce((sum, w) => sum + w, 0);

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

	return { contributions, allItemsWeights };
}

function calculateContributors(
	dataIndex: DataIndex,
	breakdown: ItemBreakdown[],
	weightsMap: Record<string, number[]>,
	dates: DateRange,
	majorCategoryNames: Record<string, string>,
	factorName: string,
	areaName: string,
	inflationRate: number,
	areaKey: string | null,
	isPersonal = false,
): ContributionFactor {
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
		const totalWeightedChange = breakdown.reduce(
			(acc, b) => acc + (b.cpiEnd - b.cpiStart) * b.weight,
			0,
		);

		for (const b of breakdown) {
			const weightedChange = (b.cpiEnd - b.cpiStart) * b.weight;
			const percentShare = totalWeightedChange !== 0 ? (weightedChange / totalWeightedChange) * 100 : 0;
			contributions.push({
				code: b.categoryCode,
				name: b.name,
				weight: b.weight,
				inflationRate: b.itemInflationRate,
				percentShare,
			});
		}
	} else if (areaKey && weightsMap[areaKey]) {
		const { contributions: officialContributions, allItemsWeights } = calculateOfficialContribution(
			dataIndex,
			weightsMap[areaKey],
			areaKey,
			majorCategoryNames,
			dates,
		);

		allItems.weight = allItemsWeights;
		contributions.push(...officialContributions);
	}

	contributions.sort((a, b) => b.percentShare - a.percentShare);
	return {
		factorName,
		areaName,
		inflationRate,
		contributors: [allItems, ...contributions],
	};
}

function getValue(
	dataIndex: DataIndex,
	key: string | undefined,
	year: number,
	month: number,
	code: string,
	trendType: "inflation" | "cpi",
): number | null {
	if (!key) return null;
	if (trendType === "cpi") {
		return findCpi(dataIndex, key, year, month, code, "official");
	}

	return calculateYoY(dataIndex, key, year, month, code);
}

function safeVal(v: number | null): number | null {
	return v === null ? null : Number(v.toFixed(1));
}

/**
 * Finds the CPI value for a specific area, year, month, and code.
 *
 * It's impossible to be null since the commonidy input was disabled if it has no official CPI data.
 *
 * @param index The data index.
 * @param areaKey The area key.
 * @param year The year.
 * @param month The month.
 * @param code The code.
 * @param dataType Type of data to use. Either `official` or `personal`.
 * @returns The CPI value or null if not found.
 */
function findCpi(
	index: DataIndex,
	areaKey: string,
	year: number,
	month: number,
	code: string,
	dataType: "official" | "personal",
): number {
	return index[areaKey]![year]![dataType]![month]![code]!;
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
 * Calculates the year-on-year growth rate.
 * @param dataIndex The data index.
 * @param key The key.
 * @param year The year.
 * @param month The month.
 * @param code The code.
 * @returns The year-on-year growth rate.
 */
function calculateYoY(
	dataIndex: DataIndex,
	key: string | undefined,
	year: number,
	month: number,
	code: string,
): number {
	if (!key) return 0;
	const curr = findCpi(dataIndex, key, year, month, code, "official");
	const prev = findCpi(dataIndex, key, year - 1, month, code, "official");
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
	dataType: DataType,
	trendType: "inflation" | "cpi",
): number | null {
	const currentMonthData = index[targetKey]?.[year]?.[dataType]?.[month];

	if (!currentMonthData) return null;

	let validCount = 0;
	let compCurr = 0;

	if (trendType === "cpi") {
		for (const item of itemsWithWeights) {
			const c1 = currentMonthData[item.code];
			if (c1 !== undefined && c1 !== null) {
				compCurr += c1 * item.weight;
				validCount++;
			}
		}
		return validCount > 0 ? compCurr / 100 : null;
	}

	const prevMonthData = index[targetKey]?.[year - 1]?.[dataType]?.[month];

	if (!prevMonthData) return null;

	let compPrev = 0;

	for (const item of itemsWithWeights) {
		const c1 = currentMonthData[item.code];
		const c0 = prevMonthData[item.code];

		if (c1 !== undefined && c0 !== undefined && c1 !== null && c0 !== null) {
			compCurr += c1 * item.weight;
			compPrev += c0 * item.weight;
			validCount++;
		}
	}

	return validCount > 0 && compPrev > 0 ? calcGrowth(compCurr, compPrev) : null;
}

function processTrendMonth(
	year: number,
	month: number,
	dataIndex: DataIndex,
	location: LocationContext,
	itemsWithWeights: { code: string; weight: number }[],
	code: string,
	dataType: DataType,
	trendType: "inflation" | "cpi",
): TrendPoint | null {
	const personalRate = calculatePersonalTrend(
		dataIndex,
		location.target.key,
		itemsWithWeights,
		year,
		month,
		dataType,
		trendType,
	);

	const areaRate = getValue(dataIndex, location.target.key, year, month, code, trendType);
	const regionRate = getValue(dataIndex, location.region?.key, year, month, code, trendType);

	let provinceRate: number | undefined | null;
	if (location.province && location.province.key !== location.target.key) {
		const pRate = getValue(dataIndex, location.province.key, year, month, code, trendType);
		provinceRate = pRate === null ? undefined : Number(pRate.toFixed(1));
	}

	const natRate = getValue(dataIndex, location.national?.key, year, month, code, trendType);

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
	hierarchy: LocationContext,
	dates: DateRange,
	config: CalculationConfig,
	dataIndex: DataIndex,
	code: string,
	dataType: DataType,
	trendType: "inflation" | "cpi",
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
			const point = processTrendMonth(
				year,
				month,
				dataIndex,
				hierarchy,
				itemsWithWeights,
				code,
				dataType,
				trendType,
			);
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
		location: { target: AreaDef; province?: AreaDef; region?: AreaDef; national?: AreaDef };
		dates: DateRange;
	},
): JSX.Element[] {
	const { location, dates } = meta;
	const monthStr = new Date(dates.endYear, dates.endMonth - 1).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
	});

	const getDir = (val: number) => (val >= 0 ? "increased" : "decreased");
	const getComp = (mine: number, theirs: number) => (mine > theirs ? "higher" : "lower");
	const getAff = (mine: number, theirs: number) => (mine > theirs ? "more" : "less");

	// If CPI is 120, you need 120 pesos today to buy what 100 pesos bought in 2018.
	const purchasingPower = `${personalCpi.toFixed(1)}0`;
	const percentChange = (personalCpi - 100).toFixed(1);

	const areaName = location.target.name || "Selected Area";
	const regionName = location.region?.name;

	const p1 = (
		<>
			Your computed consumer price index is <strong>{personalCpi.toFixed(1)}</strong>. It means that
			average price of your commonly purchased goods and services have{" "}
			<strong>
				{getDir(personalCpi - 100)} by {percentChange}%
			</strong>{" "}
			compared with their average prices in 2018. Subsequently, in {monthStr}, you will need{" "}
			<strong>PhP {purchasingPower}</strong> to buy the same set of goods and services worth PhP 100.00
			in 2018.
		</>
	);

	const p2 = (
		<>
			You live in <strong>{areaName}</strong>
			{regionName && (
				<>
					{" "}
					located in <strong>{regionName}</strong>
				</>
			)}
			.
		</>
	);

	const p3 = (
		<>
			Your personal inflation rate of{" "}
			<strong>
				{personalRate.toFixed(1)}% is {getComp(personalRate, comps.areaRate)}
			</strong>{" "}
			than the inflation rate of the average households in{" "}
			<strong>
				{areaName} ({comps.areaRate.toFixed(1)}%)
			</strong>
			. This means that you are <strong>{getAff(personalRate, comps.areaRate)} affected</strong> by the
			price increases in <strong>{areaName}</strong> compared with the average household in the area.
		</>
	);

	const interpretation: JSX.Element[] = [p2, p1, p3];

	if (regionName && comps.regionRate !== undefined) {
		const p4 = (
			<>
				Your personal inflation rate of{" "}
				<strong>
					{personalRate.toFixed(1)}% is {getComp(personalRate, comps.regionRate)}{" "}
				</strong>{" "}
				than the inflation rate of the average households in{" "}
				<strong>
					{regionName} ({comps.regionRate.toFixed(1)}%)
				</strong>
				. This means that you are <strong>{getAff(personalRate, comps.regionRate)} affected</strong> by
				the price increases in <strong>{regionName}</strong> compared to the average household in the
				region.
			</>
		);
		interpretation.push(p4);
	}

	const p5 = (
		<>
			Your personal inflation rate of{" "}
			<strong>
				{personalRate.toFixed(1)}% is {getComp(personalRate, comps.nationalRate)}
			</strong>{" "}
			than the inflation rate of the average households in the{" "}
			<strong>Philippines ({comps.nationalRate.toFixed(1)}%)</strong>. This means that you are{" "}
			<strong>{getAff(personalRate, comps.nationalRate)} affected</strong> by the price increases in the
			country compared with the average household.
		</>
	);
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
	dataType: "official" | "personal",
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

		const cpiStart = findCpi(
			dataIndex,
			location.target.key,
			dates.startYear,
			dates.startMonth,
			item.code,
			dataType,
		);
		const cpiEnd = findCpi(
			dataIndex,
			location.target.key,
			dates.endYear,
			dates.endMonth,
			item.code,
			dataType,
		);

		// STEP 2: WEIGHTED CPI
		// Formula: CPI * Weight
		const weightedCpiStart = cpiStart * weight;
		const weightedCpiEnd = cpiEnd * weight;

		// NOTE: IN PERSONAL, EACH COMMODITY'S INFLATION RATE IS SAME AS OFFICIAL'S INFLATION RATE
		// AS THEY USED THE SAME CPI DATA SOURCE BUT DIFFERENT WEIGHT
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

	const comparators = {
		areaRate: getOfficialRate(location.target.key, dataIndex, dates),
		regionRate: location.region ? getOfficialRate(location.region.key, dataIndex, dates) : undefined,
		nationalRate: getOfficialRate("philippines", dataIndex, dates),
		provinceRate: location.province
			? getOfficialRate(location.province.key, dataIndex, dates)
			: undefined,
	};

	const contributors: ContributionFactor[] = [
		calculateContributors(
			dataIndex,
			breakdown,
			weightsMap,
			dates,
			majorCategoryNames,
			"Personal",
			location.target.name,
			personalRate,
			null,
			true,
		),
		calculateContributors(
			dataIndex,
			breakdown,
			weightsMap,
			dates,
			majorCategoryNames,
			"City/Mun",
			location.target.name,
			comparators.areaRate,
			location.target.key,
		),
	];

	if (location.province && location.province.key !== location.target.key) {
		contributors.push(
			calculateContributors(
				dataIndex,
				breakdown,
				weightsMap,
				dates,
				majorCategoryNames,
				"Province",
				location.province.name,
				comparators.provinceRate || 0,
				location.province.key,
			),
		);
	}

	if (location.region && comparators.regionRate) {
		contributors.push(
			calculateContributors(
				dataIndex,
				breakdown,
				weightsMap,
				dates,
				majorCategoryNames,
				"Region",
				location.region.name,
				comparators.regionRate,
				location.region.key,
			),
		);
	}

	contributors.push(
		calculateContributors(
			dataIndex,
			breakdown,
			weightsMap,
			dates,
			majorCategoryNames,
			"National",
			"Philippines",
			comparators.nationalRate,
			"philippines",
		),
	);

	const inflationTrend = generateTrend(
		expenses,
		location,
		dates,
		config,
		dataIndex,
		"0",
		dataType,
		"inflation",
	);
	const cpiTrend = generateTrend(expenses, location, dates, config, dataIndex, "0", dataType, "cpi");

	const interpretation = generateInterpretation(personalRate, yearlyCpiEnd, comparators, {
		location,
		dates,
	});

	setCompareOfficial(contributors[1]);

	return {
		personalRate,
		yearlyCpiStart,
		yearlyCpiEnd,
		totalSpend: config.totalInput,
		breakdown,
		contributors,
		inflationTrend,
		cpiTrend,
		comparators,
		interpretation,
		meta: { location, dates },
	};
}
