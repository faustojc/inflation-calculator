import type { IncomeClass } from "@/stores/inflationStore";

// index[area][year][dataType][month][code] = cpi-value
export type DataIndex = Record<
	string,
	Record<number, Partial<Record<DataType, Record<number, Record<string, number | null>>>>>
>;
export type DataType = "official" | "personal";

export type TreeNode = {
	code: string;
	name: string;
	depth: number;
	children: TreeNode[];
};

export interface CommodityDef {
	code: string;
	name: string;
	children?: CommodityDef[];
	parentName?: string;
	keywords?: string[];
	description?: string;
}

export interface AreaDef {
	key: string;
	name: string;
	regionId: number;
	provinceId?: number;
	cityId?: number;
	annualCapita?: number;
	monthlyCapita?: number;
}

export interface AreaHierarchy {
	target: AreaDef;
	province?: AreaDef;
	region?: AreaDef;
	ncr?: AreaDef;
	national?: AreaDef;
}

// Structure of data/{key}/{class-dir}/{start}-{end}.json
export interface ChunkFile {
	v: 3;
	area: string;
	name: string;
	ids: { r: number; p?: number; c?: number };
	class: IncomeClass; // "ALL" | "B30"
	range: [number, number]; // inclusive
	years: {
		[year: string]: {
			official?: { [code: string]: (number | null)[] };
			personal?: { [code: string]: (number | null)[] };
		};
	};
}

export interface SearchOption {
	keyword: string;
	keywordLower: string;
	code: string;
	commodityName: string;
}

export interface AreaManifest {
	v: 3;
	dates: Record<DataType, Record<IncomeClass, Record<number, number>>>;
	weights: Record<IncomeClass, number[]>;
	chunks: Record<IncomeClass, string[]>;
}

export interface PieEntry {
	name: string;
	value: number;
	originalShare: number;
	code: string;
	type: "positive" | "negative" | "filler";
	negIdx?: number;
}
