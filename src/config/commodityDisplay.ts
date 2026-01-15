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
			{ code: "01.1", label: "Food", description: "e.g. rice, pork, chicken, beef, fish, egg, noodles, fruits, flour, vegetables, sugar, condiments" },
			{ code: "01.2", label: "Non-Alcoholic Beverages", description: "e.g. coffee, tea, bottled water, fruit juices, sweetened beverages" },
		],
	},
	{
		code: "02",
		label: "Alcoholic Beverages, and Tobacco",
		children: [
			{ code: "02.1", label: "Alcoholic Beverages", description: "e.g. beer, rum, gin, vodka" },
			{ code: "02.3", label: "Tobacco", description: "e.g. cigarette, betel nut, e-cigarette refill" },
		],
	},
	{
		code: "03",
		label: "Clothing and Footwear",
		children: [
			{ code: "03.1", label: "Clothing", description: "e.g. shirt, pants, underwear, handkerchief, tailoring and dressmaking" },
			{ code: "03.2", label: "Footwear", description: "e.g. Shoes, slippers" },
		],
	},
	{
		code: "04",
		label: "Housing, Water, Electricity, Gas and Other Fuels",
		children: [
			{ code: "04.1", label: "Actual Rentals for Housing", description: "e.g. apartment, studio, condominium rental" },
			{
				code: "04.3",
				label: "Maintenance, Repair and Security of the Dwelling",
				description: "e.g. construction materials, salary of construction workers",
			},
			{ code: "04.4", label: "Water Supply and Misc Services", description: "e.g. payment for water supply via pipeline" },
			{ code: "04.5", label: "Electricity, Gas and Other Fuels", description: "e.g. payment for electricity consumption, kerosene, LPG, firewood" },
		],
	},
	{
		code: "05",
		label: "Furnishings, Household Equipment",
		children: [
			{ code: "05.1", label: "Furniture, Furnishings, and Loose Carpets", description: "e.g. Sofa, wall clock, mattress, chair, bed frame" },
			{ code: "05.2", label: "Household Textiles", description: "e.g. blanket, bedsheets, curtain, pillow case, mosquito net" },
			{ code: "05.3", label: "Household Appliances", description: "e.g. rice cooker, refrigerator, electric fan, TV, air conditioner" },
			{ code: "05.4", label: "Glassware, Tableware and Household Utensils", description: "e.g. drinking glass, plate water bottle, spoon, fork" },
			{ code: "05.5", label: "Tools and Equipment for House and Garden", description: "e.g. hammer screwdriver, shovel, garden hose, light bulb" },
			{ code: "05.6", label: "Goods and Services for Routine Maintenance", description: "e.g. dishwasher soap, laundry soap, sponge, broom, battery" },
		],
	},
	{
		code: "06",
		label: "Health",
		children: [
			{ code: "06.1", label: "Medicines and Health Products", description: "e.g. amoxicillin, paracetamol, iodine solution, vitamins" },
			{ code: "06.2", label: "Outpatient Care Services", description: "e.g. private medical services, services of midwife, dentist" },
			{ code: "06.3", label: "Inpatient Care Services", description: "e.g. public hospital payware, private hospital payware" },
			{ code: "06.4", label: "Other Health Services", description: "e.g. laboratory services like CBC, X-ray, consultation" },
		],
	},
	{
		code: "07",
		label: "Transport",
		children: [
			{ code: "07.1", label: "Purchase of Vehicles", description: "e.g. purchase of motor car, motor cycle, and bicycle" },
			{ code: "07.2", label: "Operation of Personal Transport Equipment", description: "e.g. vehicle tire, engine oil, diesel, gasoline, maintenance" },
			{ code: "07.3", label: "Passenger Transport Services", description: "e.g. fare for jeepney, bus, taxi, tricycle, airplane, ship" },
			{ code: "07.4", label: "Transport Services of Goods", description: "e.g. payment for courier services, delivery of good" },
		],
	},
	{
		code: "08",
		label: "Information and Communication",
		children: [
			{ code: "08.1", label: "ICT Equipment", description: "e.g. mobile phone, television, personal computer, tablet" },
			{ code: "08.3", label: "ICT Services", description: "e.g. internet access service, landline, mobile phone load" },
		],
	},
	{
		code: "09",
		label: "Recreation, Sport and Culture",
		children: [
			{ code: "09.1", label: "Recreational Durables", description: "e.g. digital camera, video camera" },
			{ code: "09.2", label: "Other Recreational Goods", description: "e.g. chess set, balls, toys" },
			{ code: "09.3", label: "Garden Products and Pets", description: "e.g. fertilizer, vegetable seeds, pet food" },
			{ code: "09.4", label: "Recreational Services", description: "e.g. gym, swimming pool fee, lotto" },
			{ code: "09.5", label: "Cultural Goods", description: "e.g. guitar, piano, musical instruments" },
			{ code: "09.6", label: "Cultural Services", description: "e.g. cable subscription, cinema fee" },
			{ code: "09.7", label: "Newspapers, Books and Stationery", description: "e.g. textbook, ballpen, notebook" },
			{ code: "09.8", label: "Package Holidays", description: "" },
		],
	},
	{
		code: "10",
		label: "Education Services",
		children: [
			{ code: "10.1", label: "Early Childhood and Primary Education", description: "e.g. tuition fee for primary/grade school" },
			{ code: "10.2", label: "Secondary Education", description: "e.g. tuition fee for high school" },
			{ code: "10.4", label: "Tertiary Education", description: "e.g. tuition fee for college/university" },
			{ code: "10.5", label: "Education Not Defined by Level", description: "e.g. review classes, vocational studies" },
		],
	},
	{
		code: "11",
		label: "Restaurants and Accommodation Services",
		children: [
			{ code: "11.1", label: "Food and Beverage Serving Services", description: "e.g. meals eaten outside, take-away food" },
			{ code: "11.2", label: "Accommodation Services", description: "e.g. hotel, motel, inn" },
		],
	},
	{
		code: "12",
		label: "Financial Services",
		children: [{ code: "12.2", label: "Financial Services", description: "e.g. money transfer fee, ATM withdrawal fee" }],
	},
	{
		code: "13",
		label: "Personal Care and Miscellaneous",
		children: [
			{ code: "13.1", label: "Personal Care", description: "e.g. hygiene products, haircut, parlor services" },
			{ code: "13.2", label: "Other Personal Effects", description: "e.g. wallet, umbrella, jewelry, bags" },
			{ code: "13.9", label: "Other Services", description: "e.g. photocopying, civil registry documents" },
		],
	},
];
