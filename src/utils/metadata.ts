import type { YearlyDataFile } from "@/lib/types";
import type { Mode } from "@/stores/inflationStore";
import type { KeyboardEvent } from "react";
export const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

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

	const exceptions = ["de", "del", "la", "las", "los", "y", "and", "of", "in"];
	str = str.replaceAll(
		new RegExp(String.raw`\b(${exceptions.join("|")})\b`, "gi"),
		function (match: string, offset: number) {
			return offset === 0 ? match : match.toLowerCase();
		},
	);

	// Fix Roman numerals (Iii -> III, Iv -> IV)
	str = str.replaceAll(
		/\b(i{1,3}|iv|v|vi{1,3}|vii{1,3}|viii|ix|x|xi{1,2}|xii|xiii)(-[a-z])?\b/gi,
		function (match: string) {
			return match.toUpperCase();
		},
	);

	// Handle parentheses: Uppercase if acronym of name, otherwise keep Title Case
	str = str.replaceAll(/\(([^)]+)\)/g, function (match, inner, offset, fullString) {
		const namePart = fullString.slice(0, offset);
		const words = namePart.split(/[\s-]+/);

		const acronymTarget = inner.toUpperCase();

		const generatedAcronym = words
			.filter((w: string) => {
				const wLower = w.toLowerCase();
				return w && !exceptions.includes(wLower);
			})
			.map((w: string) => w.charAt(0).toUpperCase())
			.join("");

		// If the content is an acronym of the name (e.g. NCR == N(ational)C(apital)R(egion))
		if (generatedAcronym.length > 1 && acronymTarget === generatedAcronym) {
			return "(" + acronymTarget + ")";
		}

		return match;
	});

	return str;
}

export function preventNonNumeric(e: KeyboardEvent<HTMLInputElement>) {
	if (e.key === "e" || e.key === "+" || e.key === "-") {
		e.preventDefault();
	}
}

export const getLimitValue = (m: Mode, v: number) => {
		if (m === "percent") {
			return (v = v > 100 ? 100 : v);
		}

		return (v = v > 500000 ? 500000 : v);
	};
