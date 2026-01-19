import { type ExpenseItem } from "@/stores/inflationStore";

export interface LocationContext {
	regionCode: string;
	provinceName?: string;
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
	interpretation: string;
	missingItems: string[];
	meta: {
		location: LocationContext;
		dates: DateRange;
	};
}

const KEY_SEP = "|";
const WILDCARD = "*";

function findCpi(dataIndex: Map<string, number>, region: string, province: string | undefined, year: number, month: number, code: string): number | null {
	// KEY: REGION|AREA|INCOME|YEAR|MONTH|CODE

	// Priority 1: Specific Province (if selected)
	if (province) {
		const key = `${region}${KEY_SEP}${province}${KEY_SEP}${WILDCARD}${KEY_SEP}${year}${KEY_SEP}${month}${KEY_SEP}${code}`;
		if (dataIndex.has(key)) return dataIndex.get(key)!;
	}

	// Priority 2: Region Average
	const regionKey = `${region}${KEY_SEP}${WILDCARD}${KEY_SEP}${WILDCARD}${KEY_SEP}${year}${KEY_SEP}${month}${KEY_SEP}${code}`;
	if (dataIndex.has(regionKey)) return dataIndex.get(regionKey)!;

	// Priority 3: National Average
	const nationalKey = `PH${KEY_SEP}${WILDCARD}${KEY_SEP}${WILDCARD}${KEY_SEP}${year}${KEY_SEP}${month}${KEY_SEP}${code}`;
	if (dataIndex.has(nationalKey)) return dataIndex.get(nationalKey)!;

	return null;
}

function generateInterpretation(rate: number, breakdown: ItemBreakdown[]): string {
	const sorted = [...breakdown].sort((a, b) => b.weightedCpiEnd - b.weightedCpiStart - (a.weightedCpiEnd - a.weightedCpiStart));

	const topDriver = sorted[0];
	const topSaver = sorted.at(-1);

	let text = `Your personal inflation rate is ${rate.toFixed(1)}%. `;

	if (topDriver && topDriver.itemInflationRate > 0) {
		text += `This is mainly driven by ${topDriver.name}, which increased by ${topDriver.itemInflationRate.toFixed(1)}%. `;
	}

	if (topSaver && topSaver.itemInflationRate < 0) {
		text += `However, lower prices in ${topSaver.name} (${topSaver.itemInflationRate.toFixed(1)}%) helped reduce your overall rate.`;
	} else if (rate > 5) {
		text += `Your basket is experiencing significant price pressure compared to the base year.`;
	}

	return text;
}

export function calculatePersonalInflation(
	expenses: ExpenseItem[],
	location: LocationContext,
	dates: DateRange,
	config: CalculationConfig,
	dataIndex?: Map<string, number>,
): CalculationResult | null {
	if (!dataIndex || dataIndex.size === 0 || expenses.length === 0) return null;
	if (config.totalInput === 0 && config.mode === "amount") return null;

	const breakdown: ItemBreakdown[] = [];
	const missingItems: string[] = [];

	let sumWeightedCpiStart = 0;
	let sumWeightedCpiEnd = 0;

	for (const item of expenses) {
		if (item.value <= 0) continue;

		// STEP 1: WEIGHT
		// Formula: (Input / Sum) * 100 or just the value if percent
		const weight = config.mode === "amount" ? (item.value / config.totalInput) * 100 : item.value;

		// FETCH CPI DATA
		const cpiStart = findCpi(dataIndex, location.regionCode, location.provinceName, dates.startYear, dates.startMonth, item.code);
		const cpiEnd = findCpi(dataIndex, location.regionCode, location.provinceName, dates.endYear, dates.endMonth, item.code);

		if (cpiStart === null || cpiEnd === null) {
			missingItems.push(item.name);
			breakdown.push({
				id: item.id,
				name: item.name,
				categoryCode: item.code,
				inputValue: item.value,
				weight,
				cpiStart: 0,
				cpiEnd: 0,
				weightedCpiStart: 0,
				weightedCpiEnd: 0,
				itemInflationRate: 0,
				isMissing: true,
			});
			continue;
		}

		// STEP 2: WEIGHTED CPI
		// Formula: CPI * Weight
		const weightedCpiStart = cpiStart * weight;
		const weightedCpiEnd = cpiEnd * weight;

		// Item Growth
		const itemRate = ((cpiStart - cpiEnd) / cpiStart) * 100;

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
			itemInflationRate: itemRate,
			isMissing: false,
		});
	}

	// If any item is missing data, fail the whole calculation
	if (missingItems.length > 0) {
		return {
			personalRate: 0,
			yearlyCpiStart: 0,
			yearlyCpiEnd: 0,
			totalSpend: 0,
			breakdown,
			interpretation: "",
			missingItems,
			meta: { location, dates },
		};
	}

	// STEP 3: YEARLY CPI
	// Formula: Sum(WeightedCPI) / 100
	const yearlyCpiStart = sumWeightedCpiStart / 100;
	const yearlyCpiEnd = sumWeightedCpiEnd / 100;

	// STEP 4: GROWTH RATE
	// Formula: (Current - Previous) / Previous * 100
	let growthRate = 0;
	if (yearlyCpiStart > 0) {
		growthRate = ((yearlyCpiStart - yearlyCpiEnd) / yearlyCpiEnd) * 100;
	}

	const interpretation = generateInterpretation(growthRate, breakdown);

	return {
		personalRate: growthRate,
		yearlyCpiStart,
		yearlyCpiEnd,
		totalSpend: config.totalInput,
		breakdown,
		interpretation,
		missingItems: [],
		meta: { location, dates },
	};
}
