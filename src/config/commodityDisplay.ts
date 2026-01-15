import type { TreeNode } from "@/stores/dataStore";

export interface UICommodity {
	code: string;
	label: string;
	description?: string;
	children?: UICommodity[];
}

export type ConfigNode = {
	description?: string;
	value: number;
	id: string;
	children: ConfigNode[];
} & Omit<TreeNode, "children">;

export const COMMODITY_DISPLAY_CONFIG: UICommodity[] = [
	{
		code: "01",
		label: "Food and Non-Alcoholic Beverages",
		children: [
			{ code: "01.1", label: "Rice" },
			{ code: "01.2", label: "Meat", description: "fresh, processed, canned" },
			{ code: "01.3", label: "Fish", description: "fresh, processed, canned" },
			{ code: "01.4", label: "Vegetables", description: "fresh, processed, canned" },
			{ code: "01.5", label: "Egg" },
			{ code: "01.6", label: "Milk" },
			{ code: "01.7", label: "Cooking oil" },
			{ code: "01.8", label: "Noodles", description: "with or without soup, fresh" },
			{ code: "01.9", label: "Sugar", description: "cane/beet sugar, jelly, honey, chocolate" },
			{ code: "01.10", label: "Other food items", description: "baby formula, condiments, spices, fruits, tofu" },
			{ code: "01.11", label: "Softdrinks / Soda" },
			{ code: "01.12", label: "Tea and coffee" },
		],
	},
	{
		code: "02",
		label: "Alcoholic Beverages and Tobacco",
		children: [
			{ code: "02.1", label: "Beer" },
			{ code: "02.2", label: "Gin" },
			{ code: "02.3", label: "Wine" },
			{ code: "02.4", label: "Other liquors" },
			{ code: "02.5", label: "Cigarettes and cigars" },
			{ code: "02.6", label: "Other cigarette products" },
		],
	},
	{
		code: "03",
		label: "Clothing and Footwear",
		children: [
			{ code: "03.1", label: "Shirts" },
			{ code: "03.2", label: "Pants" },
			{ code: "03.3", label: "Other clothing items", description: "handkerchief, neck tie, hat, socks" },
			{ code: "03.4", label: "Tailoring and dressmaking services" },
			{ code: "03.5", label: "Slippers" },
			{ code: "03.6", label: "Shoes" },
			{ code: "03.7", label: "Other footwear" },
			{ code: "03.8", label: "Repair of footwear" },
		],
	},
	{
		code: "04",
		label: "Housing, Water, Electricity, Gas",
		children: [
			{ code: "04.1", label: "Rental" },
			{ code: "04.2", label: "Materials for maintenance/repair" },
			{ code: "04.3", label: "Water Supply" },
			{ code: "04.4", label: "Electricity" },
			{ code: "04.5", label: "Kerosene and other fuels" },
		],
	},
	{
		code: "05",
		label: "Furnishings and Household",
		children: [
			{ code: "05.1", label: "Household furniture" },
			{ code: "05.2", label: "Household appliances" },
			{ code: "05.3", label: "Kitchenware, cutleries, glassware" },
			{ code: "05.4", label: "Household tools" },
			{ code: "05.5", label: "Goods for household maintenance" },
			{ code: "05.6", label: "Domestic Services" },
		],
	},
	{
		code: "06",
		label: "Health",
		children: [
			{ code: "06.1", label: "Vitamins and minerals" },
			{ code: "06.2", label: "Medicines and vaccines" },
			{ code: "06.3", label: "Fee for medical consultation" },
			{ code: "06.4", label: "Fee for hospital wards" },
			{ code: "06.5", label: "Fee for private medical care" },
		],
	},
	{
		code: "07",
		label: "Transport",
		children: [
			{ code: "07.1", label: "Purchase of vehicles", description: "car, motorcycle, bicycle" },
			{ code: "07.2", label: "Fuel", description: "Diesel, gasoline" },
			{ code: "07.3", label: "Fare", description: "jeepney, bus, taxi, TNVS" },
			{ code: "07.4", label: "Airplane/Ship fare" },
			{ code: "07.5", label: "Delivery fees" },
		],
	},
	{
		code: "08",
		label: "Information and Communication",
		children: [
			{ code: "08.1", label: "Gadget Purchase", description: "mobile phone, computer, tablet" },
			{ code: "08.2", label: "Communication expense", description: "mobile load, internet, landline" },
		],
	},
	{
		code: "09",
		label: "Recreation, Sport and Culture",
		children: [
			{ code: "09.1", label: "Digital camera" },
			{ code: "09.2", label: "Toys and recreational goods" },
			{ code: "09.3", label: "Subscriptions", description: "streaming services, movie tickets" },
			{ code: "09.4", label: "Books, newspapers, stationeries" },
			{ code: "09.5", label: "Package holidays" },
		],
	},
	{
		code: "10",
		label: "Education Services",
		children: [{ code: "10.1", label: "Tuition fee", description: "primary to tertiary" }],
	},
	{
		code: "11",
		label: "Restaurants and Accommodation",
		children: [
			{ code: "11.1", label: "Meals eaten out / Take-away" },
			{ code: "11.2", label: "Hotel, motel, inn" },
		],
	},
	{
		code: "12",
		label: "Financial Services",
		children: [
			{ code: "12.1", label: "ATM Fee" },
			{ code: "12.2", label: "Money transfer fee" },
		],
	},
	{
		code: "13",
		label: "Personal Care and Misc",
		children: [
			{ code: "13.1", label: "Personal care items", description: "hygiene products" },
			{ code: "13.2", label: "Personal items", description: "jewelry, bags, etc" },
			{ code: "13.3", label: "Misc Fees", description: "photocopying, civil registry, notary" },
		],
	},
];
