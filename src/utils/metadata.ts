export interface CommodityDef {
	code: string;
	name: string;
	volatility: number;
	trend: number;
}

const yearsSet = new Set<number>();
const regionsSet = new Set<string>();

export const availableYears = Array.from(yearsSet).sort((a, b) => b - a);
export const availableRegions = Array.from(regionsSet).sort((a, b) => a.localeCompare(b));

export const REGION_NAMES: Record<string, string> = {
	PH: "Philippines (National Average)",
	NCR: "National Capital Region (NCR)",
	CAR: "Cordillera (CAR)",
	I: "Region I (Ilocos Region)",
	II: "Region II (Cagayan Valley)",
	III: "Region III (Central Luzon)",
	"IV-A": "Region IV-A (CALABARZON)",
	"IV-B": "MIMAROPA Region",
	V: "Region V (Bicol Region)",
	VI: "Region VI (Western Visayas)",
	VII: "Region VII (Central Visayas)",
	VIII: "Region VIII (Eastern Visayas)",
	IX: "Region IX (Zamboanga Peninsula)",
	X: "Region X (Northern Mindanao)",
	XI: "Region XI (Davao Region)",
	XII: "Region XII (SOCCSKSARGEN)",
	XIII: "Region XIII (Caraga)",
	BARMM: "Bangsamoro (BARMM)",
};

const currentYear = new Date().getFullYear();

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const AVAILABLE_YEARS = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => (currentYear - i).toString());
export const GENERAL_CATEGORIES = [
	{
		code: "01",
		label: "Food and Non-Alcoholic Beverages",
		desc: "e.g. rice, meat, fish, vegetables, fruits, sugar, condiments, milk, soft drinks, coffee, tea, water, juices",
	},
	{ code: "02", label: "Alcoholic Beverages and Tobacco", desc: "e.g. cigarette, liquor and spirit" },
	{ code: "03", label: "Clothing and Footwear", desc: "e.g. hats, dress, pants, slippers, shoes" },
	{
		code: "04",
		label: "Housing, Water, Electricity, Gas and Other Fuels",
		desc: "e.g. housing rental, electricity fee, water supply fee, LPG, construction materials",
	},
	{ code: "05", label: "Furnishings, Household Equipment", desc: "e.g. candles, match, home appliances, kitchen utensils" },
	{ code: "06", label: "Health", desc: "e.g. medical professional fees, laboratory test fee, medicine, vaccine, vitamin supplements" },
	{ code: "07", label: "Transport", desc: "e.g. diesel, gasoline, transport fare, car, bicycle, motorcycle, delivery fee for ready-to-eat food" },
	{ code: "08", label: "Information and Communication", desc: "e.g. computer, cellular phone, mobile phone load, internet access fee" },
	{ code: "09", label: "Recreation, Sport and Culture", desc: "e.g. sports equipment, school supplies, art supplies, entrance fee for theater" },
	{ code: "10", label: "Education Services", desc: "e.g. tuition fee" },
	{ code: "11", label: "Restaurants and Accommodation Services", desc: "e.g. hotel accommodation fee, take-away food, meals eaten at restaurants" },
	{ code: "12", label: "Financial Services", desc: "e.g. ATM withdrawal fee, money transfer fee" },
	{ code: "13", label: "Personal Care, and Miscellaneous", desc: "e.g. personal hygiene, fee for parlor and barbershop services, jewelries" },
];

export const COMMODITIES: CommodityDef[] = [
	// 01 - FOOD
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

	// 02 - ALCOHOL
	{ code: "02", name: "Alcoholic Beverages and Tobacco", volatility: 0.4, trend: 0.08 },
	{ code: "02.1", name: "Beer", volatility: 0.4, trend: 0.06 },
	{ code: "02.2", name: "Gin", volatility: 0.4, trend: 0.06 },
	{ code: "02.3", name: "Wine", volatility: 0.4, trend: 0.06 },
	{ code: "02.4", name: "Other liquors", volatility: 0.4, trend: 0.06 },
	{ code: "02.5", name: "Cigarettes and cigars", volatility: 0.5, trend: 0.1 },
	{ code: "02.6", name: "Other cigarette products", volatility: 0.5, trend: 0.1 },

	// 03 - CLOTHING
	{ code: "03", name: "Clothing and Footwear", volatility: 0.2, trend: 0.02 },
	{ code: "03.1", name: "Shirts", volatility: 0.2, trend: 0.02 },
	{ code: "03.2", name: "Pants", volatility: 0.2, trend: 0.02 },
	{ code: "03.3", name: "Other clothing items and accessories", volatility: 0.2, trend: 0.02 },
	{ code: "03.4", name: "Payment for tailoring and dressmaking", volatility: 0.3, trend: 0.03 },
	{ code: "03.5", name: "Slippers", volatility: 0.2, trend: 0.02 },
	{ code: "03.6", name: "Shoes", volatility: 0.2, trend: 0.02 },
	{ code: "03.7", name: "Other footwear", volatility: 0.2, trend: 0.02 },
	{ code: "03.8", name: "Repair of footwear", volatility: 0.3, trend: 0.03 },

	// 04 - HOUSING
	{ code: "04", name: "Housing, Water, Electricity, Gas and Other Fuels", volatility: 1.5, trend: 0.05 },
	{ code: "04.1", name: "Rental", volatility: 0.1, trend: 0.03 },
	{ code: "04.2", name: "Materials for maintenance and repair", volatility: 0.5, trend: 0.04 },
	{ code: "04.3", name: "Water Supply", volatility: 0.3, trend: 0.03 },
	{ code: "04.4", name: "Electricity", volatility: 3.5, trend: 0.09 },
	{ code: "04.5", name: "Kerosene and other fuels for cooking", volatility: 3.0, trend: 0.07 },

	// 05 - FURNISHINGS
	{ code: "05", name: "Furnishings, Household Equipment...", volatility: 0.3, trend: 0.03 },
	{ code: "05.1", name: "Household furniture", volatility: 0.3, trend: 0.03 },
	{ code: "05.2", name: "Household appliances", volatility: 0.3, trend: 0.03 },
	{ code: "05.3", name: "Kitchenware, cutleries, glassware", volatility: 0.3, trend: 0.03 },
	{ code: "05.4", name: "Household tools", volatility: 0.3, trend: 0.03 },
	{ code: "05.5", name: "Goods for household maintenance", volatility: 0.5, trend: 0.04 },
	{ code: "05.6", name: "Domestic Services", volatility: 0.2, trend: 0.03 },

	// 06 - HEALTH
	{ code: "06", name: "Health", volatility: 0.2, trend: 0.04 },
	{ code: "06.1", name: "Vitamins and minerals", volatility: 0.2, trend: 0.03 },
	{ code: "06.2", name: "Medicines and vaccines", volatility: 0.2, trend: 0.03 },
	{ code: "06.3", name: "Fee for medical consultation", volatility: 0.2, trend: 0.04 },
	{ code: "06.4", name: "Fee for hospital wards", volatility: 0.2, trend: 0.05 },
	{ code: "06.5", name: "Fee for private medical care", volatility: 0.2, trend: 0.05 },

	// 07 - TRANSPORT
	{ code: "07", name: "Transport", volatility: 2, trend: 0.07 },
	{ code: "07.1", name: "Purchase of car, motorcycle, and bicycle", volatility: 1.5, trend: 0.05 },
	{ code: "07.2", name: "Diesel, gasoline, and other fuel products", volatility: 4.5, trend: 0.1 },
	{ code: "07.3", name: "Fare (jeepney, bus, taxi, TNVS)", volatility: 1, trend: 0.06 },
	{ code: "07.4", name: "Airplane fare and ship fare", volatility: 2.5, trend: 0.05 },
	{ code: "07.5", name: "Payment for delivery of goods", volatility: 1, trend: 0.05 },

	// 08 - INFO/COMM
	{ code: "08", name: "Information and Communication", volatility: 0.1, trend: 0.01 },
	{ code: "08.1", name: "Purchase of mobile phone, computer, tablet", volatility: 0.1, trend: 0 },
	{ code: "08.2", name: "Communication expense (load, internet)", volatility: 0.1, trend: 0 },

	// 09 - RECREATION
	{ code: "09", name: "Recreation, Sport and Culture", volatility: 0.4, trend: 0.03 },
	{ code: "09.1", name: "Digital camera", volatility: 0.3, trend: 0.02 },
	{ code: "09.2", name: "Toys and other recreational goods", volatility: 0.3, trend: 0.03 },
	{ code: "09.3", name: "Subscription fee for streaming/movies", volatility: 0.1, trend: 0.03 },
	{ code: "09.4", name: "Books, newspapers, and stationeries", volatility: 0.2, trend: 0.03 },
	{ code: "09.5", name: "Package holidays", volatility: 1, trend: 0.05 },

	// 10 - EDUCATION
	{ code: "10", name: "Education Services", volatility: 0.1, trend: 0.05 },
	{ code: "10.1", name: "Tuition fee (primary to tertiary)", volatility: 0.1, trend: 0.05 },

	// 11 - RESTAURANTS
	{ code: "11", name: "Restaurants and Accommodation Services", volatility: 0.6, trend: 0.05 },
	{ code: "11.1", name: "Take-away food and meals eaten in restaurants", volatility: 0.6, trend: 0.05 },
	{ code: "11.2", name: "Hotel, motel, inn", volatility: 1, trend: 0.06 },

	// 12 - FINANCIAL
	{ code: "12", name: "Financial Services", volatility: 0.1, trend: 0.02 },
	{ code: "12.1", name: "ATM Fee", volatility: 0, trend: 0.01 },
	{ code: "12.2", name: "Money transfer fee", volatility: 0, trend: 0.01 },

	// 13 - PERSONAL CARE
	{ code: "13", name: "Personal Care, Social Protection and Misc", volatility: 0.3, trend: 0.04 },
	{ code: "13.1", name: "Personal care items (hygiene products)", volatility: 0.3, trend: 0.04 },
	{ code: "13.2", name: "Personal items (jewelry, bags, etc)", volatility: 0.5, trend: 0.03 },
	{ code: "13.3", name: "Fee for photocopying, civil registry, notary", volatility: 0.1, trend: 0.02 },
];
