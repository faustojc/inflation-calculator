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

// Structure of data/{key}/{year}.json
export interface YearlyDataFile {
	area: string;
	name: string;
	year: number;
	ids: {
		r: number;
		p?: number;
		c?: number;
	};
	data: {
		[dataset in DataType]:
			| {
					[incomeKey: string]: {
						[code: string]: (number | null)[];
					};
			  }
			| undefined;
	};
}

export interface SearchOption {
	keyword: string;
	keywordLower: string;
	code: string;
	commodityName: string;
}

export interface AreaManifest {
	dates: Record<DataType, Record<IncomeClass, Record<number, number>>>;
	weights: Record<IncomeClass, number[]>;
}

export interface PieEntry {
	name: string;
	value: number;
	originalShare: number;
	code: string;
	type: "positive" | "negative" | "filler";
	negIdx?: number;
}
