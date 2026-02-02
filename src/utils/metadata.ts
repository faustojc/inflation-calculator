import type { YearlyDataFile } from "@/lib/types";
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
	"01": "e.g. rice, meat, fish, vegetables, fruits, sugar, milk, soft drinks, coffee",
	"02": "e.g. cigarette, liquor, beer, wine, spirits",
	"03": "e.g. t-shirts, pants, underwear, footwear, tailoring services",
	"04": "e.g. rental, electricity, water, LPG, kerosene, home repairs",
	"05": "e.g. furniture, appliances, utensils, detergent, domestic services",
	"06": "e.g. medicines, vitamins, consultation fees, hospital charges",
	"07": "e.g. gasoline, diesel, jeepney/bus/taxi fare, vehicle purchase",
	"08": "e.g. mobile phone load, internet plan, laptop/phone purchase",
	"09": "e.g. school supplies, books, pets, movies, recreational trips",
	"10": "e.g. tuition fees (primary, secondary, tertiary)",
	"11": "e.g. meals in restaurants, fast food, hotels, motels",
	"12": "e.g. ATM withdrawal fees, money transfer charges",
	"13": "e.g. haircut, parlor services, hygiene products, personal effects",
};

export const FILE_CACHE = new Map<string, Promise<YearlyDataFile | null>>();
export const WEIGHTS_CACHE = new Map<string, Promise<number[] | null>>();

export function formatLocationName(str: string, locale = "en") {
	str = str.trim();
	str = str.replaceAll(/\p{L}+('\p{L}+)?/gu, function (txt) {
		return txt.charAt(0).toLocaleUpperCase(locale) + txt.slice(1).toLocaleLowerCase(locale);
	});

	str = str.replaceAll(/\(([^)]+)\)/g, function (_, inner) {
		return "(" + inner.toUpperCase() + ")";
	});

	const exceptions = ["de", "del", "la", "las", "los", "y", "and", "of"];
	str = str.replaceAll(new RegExp(String.raw`\b(${exceptions.join("|")})\b`, "gi"), function (match, offset) {
		return offset === 0 ? match : match.toLowerCase();
	});

	str = str.replaceAll(/\b(i{1,3}|iv|v|vi{1,3}|vii{1,3}|viii|ix|x|xi{1,2}|xii|xiii)(-[a-z])?\b/gi, function (match) {
		return match.toUpperCase();
	});

	return str;
}
