export interface CategoryDef {
	code: string;
	name: string;
	example?: string;
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
	{ code: "01", name: "Food And Non-Alcoholic Beverages" },
	{ code: "01.1", name: "Food", example: "e.g. rice, pork, chicken, beef, fish, egg, noodles, fruits, flour, vegetables, sugar, condiments" },
	{ code: "01.2", name: "Non-Alcoholic Beverages", example: "e.g. coffee, tea, bottled water, fruit juices, sweetened beverages" },

	{ code: "02", name: "Alcoholic Beverages, Tobacco And Narcotics" },
	{ code: "02.1", name: "Alcoholic Beverages", example: "e.g. beer, rum, gin, vodka" },
	{ code: "02.3", name: "Tobacco", example: "e.g. cigarette, betel nut, e-cigarette refill" },

	{ code: "03", name: "Clothing And Footwear" },
	{ code: "03.1", name: "Clothing", example: "e.g. shirt, pants, underwear, handkerchief, tailoring and dressmaking" },
	{ code: "03.2", name: "Footwear", example: "e.g. slippers, sandals, shoes" },

	{ code: "04", name: "Housing, Water, Electricity, Gas And Other Fuels" },
	{ code: "04.1", name: "Actual Rentals For Housing", example: "e.g. apartment, studio, condominium rental" },
	{
		code: "04.3",
		name: "Maintenance, Repair And Security Of The Dwelling",
		example: "e.g. construction materials, salary of construction workers",
	},
	{ code: "04.4", name: "Water Supply And Miscellaneous Services Relating To The Dwelling", example: "e.g. water supply fee, garbage collection fee" },
	{ code: "04.5", name: "Electricity, Gas And Other Fuels", example: "e.g. electricity fee, LPG, kerosene, firewood" },
	{ code: "05", name: "Furnishings, Household Equipment And Routine Household Maintenance" },
	{ code: "05.1", name: "Furniture, Furnishings, And Loose Carpets", example: "e.g. bed, sofa, table, chair, rug" },
	{ code: "05.2", name: "Household Textiles", example: "e.g. bedsheets, pillow, blanket, towel, curtains" },
	{ code: "05.3", name: "Household Appliances", example: "e.g. refrigerator, washing machine, air conditioner, microwave, stove, TV" },
	{ code: "05.4", name: "Glassware, Tableware And Household Utensils", example: "e.g. plates, bowls, cups, spoons, forks, knives" },
	{ code: "05.5", name: "Tools And Equipment For House And Garden", example: "e.g. hammer, saw, drill, screwdriver, shovel, rake" },
	{
		code: "05.6",
		name: "Goods And Services For Routine Household Maintenance",
		example: "e.g. candles, matches, soap, toothpaste, toothbrush, shampoo, conditioner",
	},

	{ code: "06", name: "Health" },
	{ code: "06.1", name: "Medicines And Health Products", example: "e.g. pain relievers, antibiotics, vitamins, supplements, bandages, syrups, vaccines" },
	{ code: "06.2", name: "Outpatient Care Services", example: "e.g. medical professional fees, laboratory test fee" },
	{ code: "06.3", name: "Inpatient Care Services", example: "e.g. hospitalization fee, operation fee, room rental fee" },
	{ code: "06.4", name: "Other Health Services", example: "e.g. ambulance fee, physiotherapy fee, chiropractic fee" },

	{ code: "07", name: "Transport" },
	{ code: "07.1", name: "Purchase Of Vehicles", example: "e.g. car, motorcycle, bicycle" },
	{ code: "07.2", name: "Operation Of Personal Transport Equipment", example: "e.g. diesel, gasoline, maintenance, repair, parking fee" },
	{ code: "07.3", name: "Passenger Transport Services", example: "e.g. jeepney, taxi, bus, train, airplane" },
	{ code: "07.4", name: "Transport Services Of Goods", example: "e.g. delivery fee for ready-to-eat food, courier fee" },

	{ code: "08", name: "Information And Communication", example: "e.g. computer, cellular phone, mobile phone load, internet access fee" },
	{ code: "08.1", name: "Information And Communication Equipment", example: "e.g. computer, cellular phone, mobile phone, tablet" },
	{ code: "08.3", name: "Information And Communication Services", example: "e.g. internet access fee, mobile phone load, landline phone fee" },

	{ code: "09", name: "Recreation, Sport And Culture" },
	{ code: "09.1", name: "Recreational Durables", example: "e.g. sports equipment, musical instruments, art supplies" },
	{ code: "09.2", name: "Other Recreational Goods", example: "e.g. school supplies, art supplies, entrance fee for theater" },
	{ code: "09.3", name: "Garden Products And Pets", example: "e.g. seeds, fertilizer, pet food, pet supplies" },
	{ code: "09.4", name: "Recreational Services", example: "e.g. gym membership, swimming pool membership, zoo entrance fee" },
	{ code: "09.5", name: "Cultural Goods", example: "e.g. books, magazines, CDs, DVDs, video games" },
	{ code: "09.6", name: "Cultural Services", example: "e.g. movie ticket, concert ticket, museum entrance fee" },
	{ code: "09.7", name: "Newspapers, Books And Stationery", example: "e.g. newspapers, books, stationery" },
	{ code: "09.8", name: "Package Holidays (S)", example: "e.g. package holiday" },

	{ code: "10", name: "Education Services", example: "e.g. tuition fee" },
	{ code: "10.1", name: "Early Childhood And Primary Education" },
	{ code: "10.2", name: "Secondary Education (S)" },
	{ code: "10.4", name: "Tertiary Education (S)" },
	{ code: "10.5", name: "Education Not Defined By Level (S)", example: "e.g. private lessons, tutorial fees" },

	{ code: "11", name: "Restaurants And Accommodation Services" },
	{ code: "11.1", name: "Food And Beverage Serving Services", example: "e.g. take-away food, meals eaten at restaurants" },
	{ code: "11.2", name: "Accommodation Services", example: "e.g. hotel accommodation fee, motel accommodation fee" },

	{ code: "12", name: "Insurance And Financial Services", example: "e.g. ATM withdrawal fee, money transfer fee" },
	{ code: "12.2", name: "Financial Services" },

	{ code: "13", name: "Personal Care, Social Protection And Miscellaneous Goods And Services" },
	{
		code: "13.1",
		name: "Personal Care",
		example: "hair clipper, hair brush, feminine wash, toothbrush, toothpaste, mouthwash, shampoo, conditioner, bath soap, lipstick, baby powder",
	},
	{ code: "13.2", name: "Other Personal Effects", example: "e.g. gifts, wedding, jewelries, wallet, umbrella" },
	{
		code: "13.9",
		name: "Other Services",
		example: "e.g. photocopying services, fee for issuance of civil registry document, power of attorney",
	},
];
