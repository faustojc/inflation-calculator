export interface CommodityConfig {
	code: string;
	name: string;
	volatility: number;
	trend: number;
}

export const COMMODITY_TREE: CommodityConfig[] = [
	// 01 FOOD
	{ code: "01", name: "Food and Non-Alcoholic Beverages", volatility: 1.2, trend: 0.06 },
	{ code: "01.1", name: "Food", volatility: 1.3, trend: 0.06 },
	{ code: "01.1.1", name: "Cereals and cereal products", volatility: 1, trend: 0.05 },
	{ code: "01.1.1.12", name: "Rice", volatility: 2.5, trend: 0.08 },
	{ code: "01.1.1.16", name: "Corn", volatility: 1.5, trend: 0.05 },
	{ code: "01.1.2", name: "Meat", volatility: 1.8, trend: 0.07 },
	{ code: "01.1.3", name: "Fish and seafood", volatility: 2.2, trend: 0.06 },
	{ code: "01.1.4", name: "Milk, dairy and eggs", volatility: 0.8, trend: 0.04 },
	{ code: "01.1.6", name: "Fruits and nuts", volatility: 2.5, trend: 0.05 },
	{ code: "01.1.7", name: "Vegetables", volatility: 3.5, trend: 0.08 },
	{ code: "01.1.8", name: "Sugar, confectionery", volatility: 1.5, trend: 0.08 },
	{ code: "01.2", name: "Non-Alcoholic Beverages", volatility: 0.5, trend: 0.04 },

	// 02 ALCOHOL
	{ code: "02", name: "Alcoholic Beverages and Tobacco", volatility: 0.4, trend: 0.08 },
	{ code: "02.1", name: "Alcoholic Beverages", volatility: 0.4, trend: 0.06 },
	{ code: "02.3", name: "Tobacco", volatility: 0.5, trend: 0.1 },

	// 03 CLOTHING
	{ code: "03", name: "Clothing and Footwear", volatility: 0.2, trend: 0.02 },
	{ code: "03.1", name: "Clothing", volatility: 0.2, trend: 0.02 },
	{ code: "03.2", name: "Footwear", volatility: 0.2, trend: 0.02 },

	// 04 HOUSING
	{ code: "04", name: "Housing, Water, Electricity, Gas and Other Fuels", volatility: 1.5, trend: 0.05 },
	{ code: "04.1", name: "Actual Rentals for Housing", volatility: 0.1, trend: 0.03 },
	{ code: "04.3", name: "Maintenance and Repair", volatility: 0.5, trend: 0.04 },
	{ code: "04.4", name: "Water Supply", volatility: 0.3, trend: 0.03 },
	{ code: "04.5", name: "Electricity, Gas and Other Fuels", volatility: 3, trend: 0.08 },
	{ code: "04.5.1", name: "Electricity", volatility: 3.5, trend: 0.09 },
	{ code: "04.5.2", name: "Gas (LPG)", volatility: 3, trend: 0.07 },

	// 05 FURNISHINGS
	{ code: "05", name: "Furnishings and Household Maintenance", volatility: 0.3, trend: 0.03 },
	{ code: "05.1", name: "Furniture and Furnishings", volatility: 0.3, trend: 0.03 },
	{ code: "05.3", name: "Household Appliances", volatility: 0.3, trend: 0.03 },

	// 06 HEALTH
	{ code: "06", name: "Health", volatility: 0.2, trend: 0.04 },
	{ code: "06.1", name: "Medicines", volatility: 0.2, trend: 0.03 },
	{ code: "06.2", name: "Outpatient Care", volatility: 0.2, trend: 0.04 },
	{ code: "06.3", name: "Inpatient Care", volatility: 0.2, trend: 0.05 },

	// 07 TRANSPORT
	{ code: "07", name: "Transport", volatility: 2, trend: 0.07 },
	{ code: "07.1", name: "Purchase of Vehicles", volatility: 1.5, trend: 0.05 },
	{ code: "07.2", name: "Operation of Personal Transport", volatility: 3, trend: 0.08 },
	{ code: "07.2.2", name: "Fuels and Lubricants", volatility: 4.5, trend: 0.1 },
	{ code: "07.3", name: "Passenger Transport Services", volatility: 1, trend: 0.06 },

	// 08 INFO/COMM
	{ code: "08", name: "Information and Communication", volatility: 0.1, trend: 0.01 },
	{ code: "08.1", name: "ICT Equipment", volatility: 0.1, trend: 0 },
	{ code: "08.3", name: "ICT Services", volatility: 0.1, trend: 0 },

	// 09 RECREATION
	{ code: "09", name: "Recreation, Sport and Culture", volatility: 0.4, trend: 0.03 },
	{ code: "09.1", name: "Recreational Durables", volatility: 0.3, trend: 0.02 },
	{ code: "09.4", name: "Recreational Services", volatility: 0.4, trend: 0.03 },
	{ code: "09.7", name: "Newspapers, Books", volatility: 0.2, trend: 0.02 },

	// 10 EDUCATION
	{ code: "10", name: "Education Services", volatility: 0.1, trend: 0.05 },
	{ code: "10.1", name: "Primary Education", volatility: 0.1, trend: 0.05 },
	{ code: "10.2", name: "Secondary Education", volatility: 0.1, trend: 0.05 },
	{ code: "10.4", name: "Tertiary Education", volatility: 0.1, trend: 0.06 },

	// 11 RESTAURANTS
	{ code: "11", name: "Restaurants and Accommodation", volatility: 0.6, trend: 0.05 },
	{ code: "11.1", name: "Food Serving Services", volatility: 0.6, trend: 0.05 },

	// 12 FINANCIAL
	{ code: "12", name: "Financial Services", volatility: 0.1, trend: 0.02 },

	// 13 PERSONAL CARE
	{ code: "13", name: "Personal Care and Misc", volatility: 0.3, trend: 0.04 },
	{ code: "13.1", name: "Personal Care", volatility: 0.3, trend: 0.04 },
];
