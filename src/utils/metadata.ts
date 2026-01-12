export interface CategoryDef {
	code: string;
	name: string;
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

export const INITIAL_CATEGORIES: CategoryDef[] = [
	{ code: "01", name: "Food and Non-Alcoholic Beverages" },
	{ code: "01.1", name: "Rice" },
	{ code: "01.2", name: "Meat (fresh, processed, canned)" },
	{ code: "01.3", name: "Fish (fresh, processed, canned)" },
	{ code: "01.4", name: "Vegetables (fresh, processed, canned)" },
	{ code: "01.5", name: "Egg" },
	{ code: "01.6", name: "Milk" },
	{ code: "01.7", name: "Cooking oil" },
	{ code: "01.8", name: "Noodles (with or without soup, fresh)" },
	{ code: "01.9", name: "Sugar (cane/beet sugar, jelly, honey, chocolate, peanut butter)" },
	{ code: "01.10", name: "Other food items (baby formula, condiments, spices, fruits, tofu)" },
	{ code: "01.11", name: "Softdrinks / Soda" },
	{ code: "01.12", name: "Tea and coffee" },

	// 02 - ALCOHOLIC BEVERAGES AND TOBACCO
	{ code: "02", name: "Alcoholic Beverages and Tobacco" },
	{ code: "02.1", name: "Beer" },
	{ code: "02.2", name: "Gin" },
	{ code: "02.3", name: "Wine" },
	{ code: "02.4", name: "Other liquors" },
	{ code: "02.5", name: "Cigarettes and cigars" },
	{ code: "02.6", name: "Other cigarette products" },

	// 03 - CLOTHING AND FOOTWEAR
	{ code: "03", name: "Clothing and Footwear" },
	{ code: "03.1", name: "Shirts" },
	{ code: "03.2", name: "Pants" },
	{ code: "03.3", name: "Other clothing items and accessories (handkerchief, neck tie, hat, socks)" },
	{ code: "03.4", name: "Payment for tailoring and dressmaking" },
	{ code: "03.5", name: "Slippers" },
	{ code: "03.6", name: "Shoes" },
	{ code: "03.7", name: "Other footwear" },
	{ code: "03.8", name: "Repair of footwear" },

	// 04 - HOUSING, WATER, ELECTRICITY, GAS AND OTHER FUELS
	{ code: "04", name: "Housing, Water, Electricity, Gas and Other Fuels" },
	{ code: "04.1", name: "Rental" },
	{ code: "04.2", name: "Materials for maintenance and repair of dwelling" },
	{ code: "04.3", name: "Water Supply" },
	{ code: "04.4", name: "Electricity" },
	{ code: "04.5", name: "Kerosene and other fuels for cooking" },

	// 05 - FURNISHINGS, HOUSEHOLD EQUIPMENT AND ROUTINE MAINTENANCE
	{ code: "05", name: "Furnishings, Household Equipment and Routine Household Maintenance" },
	{ code: "05.1", name: "Household furniture" },
	{ code: "05.2", name: "Household appliances" },
	{ code: "05.3", name: "Kitchenware, cutleries, glassware" },
	{ code: "05.4", name: "Household tools" },
	{ code: "05.5", name: "Goods for household maintenance" },
	{ code: "05.6", name: "Domestic Services" },

	// 06 - HEALTH
	{ code: "06", name: "Health" },
	{ code: "06.1", name: "Vitamins and minerals" },
	{ code: "06.2", name: "Medicines and vaccines" },
	{ code: "06.3", name: "Fee for medical consultation" },
	{ code: "06.4", name: "Fee for hospital wards" },
	{ code: "06.5", name: "Fee for private medical care" },

	// 07 - TRANSPORT
	{ code: "07", name: "Transport" },
	{ code: "07.1", name: "Purchase of car, motorcycle, and bicycle" },
	{ code: "07.2", name: "Diesel, gasoline, and other fuel products for transport" },
	{ code: "07.3", name: "Fare (jeepney, bus, habal-habal, taxi, TNVS)" },
	{ code: "07.4", name: "Airplane fare and ship fare" },
	{ code: "07.5", name: "Payment for delivery of goods and take-away food" },

	// 08 - INFORMATION AND COMMUNICATION
	{ code: "08", name: "Information and Communication" },
	{ code: "08.1", name: "Purchase of mobile phone, personal computer, tablet" },
	{ code: "08.2", name: "Communication expense (mobile load, internet, landline)" },

	// 09 - RECREATION, SPORT AND CULTURE
	{ code: "09", name: "Recreation, Sport and Culture" },
	{ code: "09.1", name: "Digital camera" },
	{ code: "09.2", name: "Toys and other recreational and cultural goods" },
	{ code: "09.3", name: "Subscription fee for streaming services and movie tickets" },
	{ code: "09.4", name: "Books, newspapers, and stationeries" },
	{ code: "09.5", name: "Package holidays" },

	// 10 - EDUCATION SERVICES
	{ code: "10", name: "Education Services" },
	{ code: "10.1", name: "Tuition fee (primary to tertiary)" },

	// 11 - RESTAURANTS AND ACCOMMODATION SERVICES
	{ code: "11", name: "Restaurants and Accommodation Services" },
	{ code: "11.1", name: "Take-away food and meals eaten in restaurants" },
	{ code: "11.2", name: "Hotel, motel, inn" },

	// 12 - FINANCIAL SERVICES
	{ code: "12", name: "Financial Services" },
	{ code: "12.1", name: "ATM Fee" },
	{ code: "12.2", name: "Money transfer fee" },

	// 13 - PERSONAL CARE AND MISCELLANEOUS
	{ code: "13", name: "Personal Care, Social Protection and Miscellaneous" },
	{ code: "13.1", name: "Personal care items (hygiene products)" },
	{ code: "13.2", name: "Personal items (jewelry, bags, etc)" },
	{ code: "13.3", name: "Fee for photocopying, civil registry documents, notary" },
];
