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
	{ code: "01", name: "Food And Non-Alcoholic Beverages" },
	{ code: "01.1", name: "Food" },
	{ code: "01.2", name: "Non-Alcoholic Beverages" },
	{ code: "02", name: "Alcoholic Beverages, Tobacco And Narcotics" },
	{ code: "02.1", name: "Alcoholic Beverages" },
	{ code: "02.3", name: "Tobacco" },
	{ code: "02.4", name: "Narcotics" },
	{ code: "03", name: "Clothing And Footwear" },
	{ code: "03.1", name: "Clothing" },
	{ code: "03.2", name: "Footwear" },
	{ code: "04", name: "Housing, Water, Electricity, Gas And Other Fuels" },
	{ code: "04.1", name: "Actual Rentals For Housing" },
	{ code: "04.3", name: "Maintenance, Repair And Security Of The Dwelling" },
	{ code: "04.4", name: "Water Supply And Miscellaneous Services Relating To The Dwelling" },
	{ code: "04.5", name: "Electricity, Gas And Other Fuels" },
	{ code: "05", name: "Furnishings, Household Equipment And Routine Household Maintenance" },
	{ code: "05.1", name: "Furniture, Furnishings, And Loose Carpets" },
	{ code: "05.2", name: "Household Textiles" },
	{ code: "05.3", name: "Household Appliances" },
	{ code: "05.4", name: "Glassware, Tableware And Household Utensils" },
	{ code: "05.5", name: "Tools And Equipment For House And Garden" },
	{ code: "05.6", name: "Goods And Services For Routine Household Maintenance" },
	{ code: "06", name: "Health" },
	{ code: "06.1", name: "Medicines And Health Products" },
	{ code: "06.2", name: "Outpatient Care Services" },
	{ code: "06.3", name: "Inpatient Care Services" },
	{ code: "06.4", name: "Other Health Services" },
	{ code: "07", name: "Transport" },
	{ code: "07.1", name: "Purchase Of Vehicles" },
	{ code: "07.2", name: "Operation Of Personal Transport Equipment" },
	{ code: "07.3", name: "Passenger Transport Services" },
	{ code: "07.4", name: "Transport Services Of Goods" },
	{ code: "08", name: "Information And Communication" },
	{ code: "08.1", name: "Information And Communication Equipment" },
	{ code: "08.3", name: "Information And Communication Services" },
	{ code: "09", name: "Recreation, Sport And Culture" },
	{ code: "09.1", name: "Recreational Durables" },
	{ code: "09.2", name: "Other Recreational Goods" },
	{ code: "09.3", name: "Garden Products And Pets" },
	{ code: "09.4", name: "Recreational Services" },
	{ code: "09.5", name: "Cultural Goods" },
	{ code: "09.6", name: "Cultural Services" },
	{ code: "09.7", name: "Newspapers, Books And Stationery" },
	{ code: "09.8", name: "Package Holidays (S)" },
	{ code: "10", name: "Education Services" },
	{ code: "10.1", name: "Early Childhood And Primary Education" },
	{ code: "10.2", name: "Secondary Education  (S)" },
	{ code: "10.4", name: "Tertiary Education (S)" },
	{ code: "10.5", name: "Education Not Defined By Level (S)" },
	{ code: "11", name: "Restaurants And Accommodation Services" },
	{ code: "11.1", name: "Food And Beverage Serving Services" },
	{ code: "11.2", name: "Accommodation Services" },
	{ code: "12", name: "Insurance And Financial Services" },
	{ code: "12.2", name: "Financial Services" },
	{ code: "13", name: "Personal Care, Social Protection And Miscellaneous Goods And Services" },
	{ code: "13.1", name: "Personal Care" },
	{ code: "13.2", name: "Other Personal Effects" },
	{ code: "13.9", name: "Other Services" },
];
