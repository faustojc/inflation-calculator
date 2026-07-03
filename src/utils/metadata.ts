import type { AreaManifest, DataIndex, YearlyDataFile } from "@/lib/types";
import type { Mode } from "@/stores/inflationStore";
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

export const MAJOR_CATEGORY_DESCRIPTIONS: Record<string, string> = {
	"01": "e.g. rice, meat, fish, vegetables, fruits, sugar, condiments, milk, soft drinks, coffee, tea, bottled water, fruit juice",
	"02": "e.g. cigarette, liquor and spirit",
	"03": "e.g. hats, dress, pants, slippers, shoes",
	"04": "e.g. housing rental, electricity fee, water supply fee, LPG, construction materials",
	"05": "e.g. candles, match, home appliances, kitchen utensils",
	"06": "e.g. medical professional fees, laboratory test fee, medicine, vaccine, vitamin supplements",
	"07": "e.g. diesel, gasoline, transport fare, car, bicycle, motorcycle, delivery fee for ready-to-eat food",
	"08": "e.g. computer, cellular phone, mobile phone load, internet access fee",
	"09": "e.g. sports equipment, school supplies, art supplies, entrance fee for theater and concerts",
	"10": "e.g. tuition fees",
	"11": "e.g. hotel accommodation fee, take-away food, meals eaten at restaurants",
	"12": "e.g. ATM withdrawal fee, money transfer charges",
	"13": "e.g. personal hygiene, payment for parlor and barbershop services, jewelry",
};

export const SUB_CATEGORY_DESCRIPTIONS: Record<string, string> = {
	"01.1": "e.g. rice, pork, chicken, beef, fish, egg, noodles, fruits, flour, vegetables, sugar, condiments",
	"01.2": "e.g. coffee, tea, bottled water, fruit juices, sweetened beverages",
	"02.1": "e.g. beer, rhum, gin, vodka",
	"02.3": "e.g. cigarette, betel nut, e-cigarette refill",
	"03.1": "e.g. shirt, pants, underwear, handkerchief, tailoring and dressmaking",
	"03.2": "e.g. shoes, slippers",
	"04.1": "e.g. apartment, studio, condominium rental",
	"04.3": "e.g. construction materials, salary of construction workers",
	"04.4": "e.g. payment for water supply via pipeline",
	"04.5": "e.g. payment for electricity consumption, kerosene, LPG, firewood",
	"05.1": "e.g. sofa, wall clock, mattress, chair, bed frame",
	"05.2": "e.g. blanket, bedsheet, curtain, pillowcase, mosquito net",
	"05.3":
		"e.g. rice cooker, refrigerator, electric fan, TV, air conditioner, gas range, repair of household appliances",
	"05.4": "e.g. drinking glass, plate, water bottle, spoon, fork",
	"05.5": "e.g. hammer, screwdriver, shovel, garden hose, light bulb, fluorescent lamp",
	"05.6": "e.g. dishwashing soap, laundry soap, sponge, broom, battery, domestic help services",
	"06.1": "e.g. amoxicillin, paracetamol, iodine solution, carbocisteine, vitamin supplement",
	"06.2": "e.g. private medical services, services of midwife, services of dentist",
	"06.3": "e.g. public hospital payward, private hospital payward",
	"06.4": "e.g. laboratory services like CBC, X-ray, and consultation by OB-Gyne, pediatrician",
	"07.1": "e.g. purchase of motor car, motorcycle, and bicycle",
	"07.2": "e.g. vehicle tire, engine oil, lubricating oil, diesel, gasoline, maintenance of motor vehicles",
	"07.3": "e.g. transportation fare for jeepney, bus, taxi, tricycle, airplane, ship",
	"07.4": "e.g. payment for courier services, delivery of goods, delivery of food for immediate consumption",
	"08.1":
		"e.g. mobile phone, television, personal computer, tablet computer, hard drive, microphone, rent of videoke machine",
	"08.3":
		"e.g. internet access service, landline telephone service, prepaid and postpaid mobile phone service",
	"09.1": "e.g. digital camera, video camera",
	"09.2":
		"e.g. chess set, scrabble set, playing cards, toy doll, toy gun, ball for basketball and volleyball",
	"09.3": "e.g. fertilizer, flower pot, vegetable seeds, pet food, natural flower",
	"09.4":
		"e.g. admission fee for cockfight arena, payment for lotto, payment for fitness gym, entrance fee for swimming pool",
	"09.5": "e.g. guitar, piano, keyboards, drum set",
	"09.6": "e.g. cable subscription, fee for cinema and theater",
	"09.7": "e.g. textbook, dictionary, ballpen, notebook, newspaper, other school supplies",
	"10.1": "e.g. tuition fee for primary and grade school",
	"10.2": "e.g. tuition fee for high school",
	"10.4": "e.g. tuition fee for undergraduate, graduate, and post graduate studies",
	"10.5": "e.g. tuition fee for review classes and vocational studies",
	"11.1": "e.g. meals eaten outside the home, take-away food",
	"11.2": "e.g. payment for overnight stay in hotel, motel, and inn",
	"12.2": "e.g. money transfer fee, ATM withdrawal fee",
	"13.1":
		"e.g. hair clipper, hairbrush, feminine wash, toothbrush, toothpaste, mouthwash, shampoo, conditioner, bath soap, lipstick, baby powder",
	"13.2": "e.g. wallet, umbrella, fashion jewelry, wristwatch, bags",
	"13.9": "e.g. photocopying services, fee for issuance of civil registry document, power of attorney",
};

const COMMODITY_COLORS: Record<string, string> = {
	"01": "#E88D2A", // Amber (avoid red — conflicts with deflation overlay)
	"02": "#3cb44b", // Green
	"03": "#ffe119", // Yellow
	"04": "#4363d8", // Blue
	"05": "#f58231", // Orange
	"06": "#911eb4", // Purple
	"07": "#42d4f4", // Cyan
	"08": "#f032e6", // Magenta
	"09": "#bfef45", // Lime
	"10": "#fabed4", // Pink
	"11": "#469990", // Teal
	"12": "#dcbeff", // Lavender
	"13": "#9a6324", // Brown
};

export const NEG_STRIPE_COLOR = "rgba(220, 38, 38, 0.35)";
export const NEG_STROKE_COLOR = "#DC2626";

// Global indexing for serialized json data
export const GLOBAL_INDEX: DataIndex = {};
export const INDEXED_KEYS = new Set<string>();
export const FETCH_CACHE = new Map<string, Promise<YearlyDataFile | null>>();

export function clearGlobalIndex() {
	for (const key of Object.keys(GLOBAL_INDEX)) {
		delete GLOBAL_INDEX[key];
	}
	INDEXED_KEYS.clear();
	FETCH_CACHE.clear();
}

export const WEIGHTS_CACHE = new Map<string, Promise<number[] | null>>();
export const MANIFEST_CACHE = new Map<string, Promise<AreaManifest | null>>();

export function formatLocationName(str: string, locale = "en") {
	str = str.trim();
	str = str.replaceAll(/\p{L}+('\p{L}+)?/gu, (txt) => {
		if (txt.toLowerCase() === "mimaropa") {
			return "MIMAROPA";
		}

		return txt.charAt(0).toLocaleUpperCase(locale) + txt.slice(1).toLocaleLowerCase(locale);
	});

	const exceptions = ["de", "del", "las", "los", "y", "and", "of", "in"];
	str = str.replaceAll(
		new RegExp(String.raw`\b(${exceptions.join("|")})\b`, "gi"),
		(match: string, offset: number) => (offset === 0 ? match : match.toLowerCase()),
	);

	// Fix Roman numerals (Iii -> III, Iv -> IV)
	str = str.replaceAll(
		/\b(i{1,3}|iv|v|vi{1,3}|vii{1,3}|viii|ix|x|xi{1,2}|xii|xiii)(-[a-z])?\b/gi,
		(match: string) => match.toUpperCase(),
	);

	// Handle parentheses: Uppercase if acronym of name, otherwise keep Title Case
	str = str.replaceAll(/\(([^)]+)\)/g, (match: string, inner: string, offset: number, fullString: string) => {
		const namePart = fullString.slice(0, offset);
		const words = namePart.split(/[\s-]+/);
		const acronymTarget = inner.toUpperCase();

		const generatedAcronym = words
			.filter((w: string) => w && !exceptions.includes(w.toLowerCase()))
			.map((w: string) => w.charAt(0).toUpperCase())
			.join("");

		// If the content is an acronym of the name (e.g. NCR == N(ational)C(apital)R(egion))
		if (
			(generatedAcronym.length > 1 && acronymTarget === generatedAcronym) ||
			acronymTarget === "CALABARZON"
		) {
			return `(${acronymTarget})`;
		}

		return match;
	});

	return str;
}

export function preventNonNumeric(e: KeyboardEvent) {
	if (e.key === "e" || e.key === "+" || e.key === "-") {
		e.preventDefault();
	}
}

export const getLimitValue = (m: Mode, v: number) => {
	if (m === "percent") {
		const val = v > 100 ? 100 : v;
		return val;
	}

	const val = v > 500000 ? 500000 : v;
	return val;
};

export const getColor = (code: string | undefined, index: number) => {
	if (code && COMMODITY_COLORS[code]) {
		return COMMODITY_COLORS[code];
	}
	// Fallback colors if code is missing or unknown
	const fallbackColors = Object.values(COMMODITY_COLORS);
	return fallbackColors[index % fallbackColors.length]!;
};
