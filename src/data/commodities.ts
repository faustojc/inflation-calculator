export interface CommodityConfig {
	code: string;
	name: string;
	volatility: number;
	trend: number;
}

export const COMMODITY_TREE: CommodityConfig[] = [
	// --- 01 FOOD AND NON-ALCOHOLIC BEVERAGES ---
	{ code: "01", name: "Food and Non-Alcoholic Beverages", volatility: 1.2, trend: 0.06 },
	{ code: "01.1", name: "Rice", volatility: 2.5, trend: 0.08 },
	{ code: "01.2", name: "Meat (fresh, processed, canned)", volatility: 1.8, trend: 0.07 },
	{ code: "01.3", name: "Fish (fresh, processed, canned)", volatility: 2.2, trend: 0.06 },
	{ code: "01.4", name: "Vegetables (fresh, processed, canned)", volatility: 3.5, trend: 0.08 },
	{ code: "01.5", name: "Egg", volatility: 1.5, trend: 0.05 },
	{ code: "01.6", name: "Milk", volatility: 0.8, trend: 0.04 },
	{ code: "01.7", name: "Cooking oil", volatility: 1.2, trend: 0.05 },
	{ code: "01.8", name: "Noodles (with or without soup, fresh)", volatility: 0.5, trend: 0.04 },
	{ code: "01.9", name: "Sugar (cane/beet sugar, jelly, honey...)", volatility: 1.5, trend: 0.08 },
	{ code: "01.10", name: "Other food items (baby formula, condiments...)", volatility: 0.5, trend: 0.04 },
	{ code: "01.11", name: "Softdrinks / Soda", volatility: 0.6, trend: 0.05 },
	{ code: "01.12", name: "Tea and coffee", volatility: 0.8, trend: 0.03 },

	// --- 02 ALCOHOLIC BEVERAGES AND TOBACCO ---
	{ code: "02", name: "Alcoholic Beverages and Tobacco", volatility: 0.4, trend: 0.08 },
	{ code: "02.1", name: "Beer", volatility: 0.4, trend: 0.06 },
	{ code: "02.2", name: "Gin", volatility: 0.4, trend: 0.06 },
	{ code: "02.3", name: "Wine", volatility: 0.4, trend: 0.06 },
	{ code: "02.4", name: "Other liquors", volatility: 0.4, trend: 0.06 },
	{ code: "02.5", name: "Cigarettes and cigars", volatility: 0.5, trend: 0.1 },
	{ code: "02.6", name: "Other cigarette products", volatility: 0.5, trend: 0.1 },

	// --- 03 CLOTHING AND FOOTWEAR ---
	{ code: "03", name: "Clothing and Footwear", volatility: 0.2, trend: 0.02 },
	{ code: "03.1", name: "Shirts", volatility: 0.2, trend: 0.02 },
	{ code: "03.2", name: "Pants", volatility: 0.2, trend: 0.02 },
	{ code: "03.3", name: "Other clothing items and accessories", volatility: 0.2, trend: 0.02 },
	{ code: "03.4", name: "Payment for tailoring and dressmaking", volatility: 0.3, trend: 0.03 },
	{ code: "03.5", name: "Slippers", volatility: 0.2, trend: 0.02 },
	{ code: "03.6", name: "Shoes", volatility: 0.2, trend: 0.02 },
	{ code: "03.7", name: "Other footwear", volatility: 0.2, trend: 0.02 },
	{ code: "03.8", name: "Repair of footwear", volatility: 0.3, trend: 0.03 },

	// --- 04 HOUSING, WATER, ELECTRICITY, GAS ---
	{ code: "04", name: "Housing, Water, Electricity, Gas and Other Fuels", volatility: 1.5, trend: 0.05 },
	{ code: "04.1", name: "Rental", volatility: 0.1, trend: 0.03 },
	{ code: "04.2", name: "Materials for maintenance and repair", volatility: 0.5, trend: 0.04 },
	{ code: "04.3", name: "Water Supply", volatility: 0.3, trend: 0.03 },
	{ code: "04.4", name: "Electricity", volatility: 3.5, trend: 0.09 },
	{ code: "04.5", name: "Kerosene and other fuels for cooking", volatility: 3, trend: 0.07 },

	// --- 05 FURNISHINGS AND HOUSEHOLD ---
	{ code: "05", name: "Furnishings, Household Equipment...", volatility: 0.3, trend: 0.03 },
	{ code: "05.1", name: "Household furniture", volatility: 0.3, trend: 0.03 },
	{ code: "05.2", name: "Household appliances", volatility: 0.3, trend: 0.03 },
	{ code: "05.3", name: "Kitchenware, cutleries, glassware", volatility: 0.3, trend: 0.03 },
	{ code: "05.4", name: "Household tools", volatility: 0.3, trend: 0.03 },
	{ code: "05.5", name: "Goods for household maintenance", volatility: 0.5, trend: 0.04 },
	{ code: "05.6", name: "Domestic Services", volatility: 0.2, trend: 0.03 },

	// --- 06 HEALTH ---
	{ code: "06", name: "Health", volatility: 0.2, trend: 0.04 },
	{ code: "06.1", name: "Vitamins and minerals", volatility: 0.2, trend: 0.03 },
	{ code: "06.2", name: "Medicines and vaccines", volatility: 0.2, trend: 0.03 },
	{ code: "06.3", name: "Fee for medical consultation", volatility: 0.2, trend: 0.04 },
	{ code: "06.4", name: "Fee for hospital wards", volatility: 0.2, trend: 0.05 },
	{ code: "06.5", name: "Fee for private medical care", volatility: 0.2, trend: 0.05 },

	// --- 07 TRANSPORT ---
	{ code: "07", name: "Transport", volatility: 2, trend: 0.07 },
	{ code: "07.1", name: "Purchase of car, motorcycle, and bicycle", volatility: 1.5, trend: 0.05 },
	{ code: "07.2", name: "Diesel, gasoline, and other fuel products", volatility: 4.5, trend: 0.1 },
	{ code: "07.3", name: "Fare (jeepney, bus, taxi, TNVS)", volatility: 1, trend: 0.06 },
	{ code: "07.4", name: "Airplane fare and ship fare", volatility: 2.5, trend: 0.05 },
	{ code: "07.5", name: "Payment for delivery of goods", volatility: 1, trend: 0.05 },

	// --- 08 INFORMATION AND COMMUNICATION ---
	{ code: "08", name: "Information and Communication", volatility: 0.1, trend: 0.01 },
	{ code: "08.1", name: "Purchase of mobile phone, computer, tablet", volatility: 0.1, trend: 0 },
	{ code: "08.2", name: "Communication expense (load, internet)", volatility: 0.1, trend: 0 },

	// --- 09 RECREATION ---
	{ code: "09", name: "Recreation, Sport and Culture", volatility: 0.4, trend: 0.03 },
	{ code: "09.1", name: "Digital camera", volatility: 0.3, trend: 0.02 },
	{ code: "09.2", name: "Toys and other recreational goods", volatility: 0.3, trend: 0.03 },
	{ code: "09.3", name: "Subscription fee for streaming/movies", volatility: 0.1, trend: 0.03 },
	{ code: "09.4", name: "Books, newspapers, and stationeries", volatility: 0.2, trend: 0.03 },
	{ code: "09.5", name: "Package holidays", volatility: 1, trend: 0.05 },

	// --- 10 EDUCATION ---
	{ code: "10", name: "Education Services", volatility: 0.1, trend: 0.05 },
	{ code: "10.1", name: "Tuition fee (primary to tertiary)", volatility: 0.1, trend: 0.05 },

	// --- 11 RESTAURANTS ---
	{ code: "11", name: "Restaurants and Accommodation Services", volatility: 0.6, trend: 0.05 },
	{ code: "11.1", name: "Take-away food and meals eaten in restaurants", volatility: 0.6, trend: 0.05 },
	{ code: "11.2", name: "Hotel, motel, inn", volatility: 1, trend: 0.06 },

	// --- 12 FINANCIAL ---
	{ code: "12", name: "Financial Services", volatility: 0.1, trend: 0.02 },
	{ code: "12.1", name: "ATM Fee", volatility: 0, trend: 0.01 },
	{ code: "12.2", name: "Money transfer fee", volatility: 0, trend: 0.01 },

	// --- 13 PERSONAL CARE ---
	{ code: "13", name: "Personal Care, Social Protection and Misc", volatility: 0.3, trend: 0.04 },
	{ code: "13.1", name: "Personal care items (hygiene products)", volatility: 0.3, trend: 0.04 },
	{ code: "13.2", name: "Personal items (jewelry, bags, etc)", volatility: 0.5, trend: 0.03 },
	{ code: "13.3", name: "Fee for photocopying, civil registry, notary", volatility: 0.1, trend: 0.02 },
];
