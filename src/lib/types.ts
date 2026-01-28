export type DataIndex = Record<string, Record<number, Record<number, Record<string, number>>>>;

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
}

export interface AreaDef {
	key: string;
	name: string;
	regionId: number;
	provinceId?: number;
	cityId?: number;
}

export interface AreaHierarchy {
	target: AreaDef;
	province?: AreaDef;
	region?: AreaDef;
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
		[incomeKey: string]: {
			[code: string]: (number | null)[];
		};
	};
}

export interface SearchOption {
	code: string;
	name: string;
	depth: number;
	keywords: string[];
}
