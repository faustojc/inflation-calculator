import { COMMODITY_TREE } from "@/data/commodities";
import { write } from "bun";

interface Region {
	code: string;
	name: string;
}

interface CpiRecord {
	y: number; // Year
	m: number; // Month
	r: string; // Region Code
	c: string; // Commodity Code
	n: string; // Commodity Name
	v: number; // CPI Value
}

const START_YEAR = 2018;
const END_YEAR = 2026;
const CURRENT_MONTH = 1; // Jan 2026

const REGIONS: Region[] = [
	{ code: "PH", name: "Philippines (National)" },
	{ code: "NCR", name: "National Capital Region" },
	{ code: "CAR", name: "Cordillera Administrative Region" },
	{ code: "I", name: "Region I (Ilocos Region)" },
	{ code: "II", name: "Region II (Cagayan Valley)" },
	{ code: "III", name: "Region III (Central Luzon)" },
	{ code: "IV-A", name: "Region IV-A (CALABARZON)" },
	{ code: "IV-B", name: "MIMAROPA Region" },
	{ code: "V", name: "Region V (Bicol Region)" },
	{ code: "VI", name: "Region VI (Western Visayas)" },
	{ code: "VII", name: "Region VII (Central Visayas)" },
	{ code: "VIII", name: "Region VIII (Eastern Visayas)" },
	{ code: "IX", name: "Region IX (Zamboanga Peninsula)" },
	{ code: "X", name: "Region X (Northern Mindanao)" },
	{ code: "XI", name: "Region XI (Davao Region)" },
	{ code: "XII", name: "Region XII (SOCCSKSARGEN)" },
	{ code: "XIII", name: "Region XIII (Caraga)" },
	{ code: "BARMM", name: "Bangsamoro Autonomous Region" },
];

console.log(`Generating Inflation Data for ${COMMODITY_TREE.length} Categories...`);

const dataset: CpiRecord[] = [];

const getBaseCPI = (code: string) => {
	const seed = code.split("").reduce((acc, char) => acc + (char.codePointAt(0) || 0), 0);
	return 100 + (seed % 5);
};

for (const region of REGIONS) {
	const regionBias = region.code === "NCR" ? 1.05 : 1;

	for (const item of COMMODITY_TREE) {
		let currentCPI = getBaseCPI(item.code) * regionBias;

		for (let year = START_YEAR; year <= END_YEAR; year++) {
			for (let month = 1; month <= 12; month++) {
				if (year === END_YEAR && month > CURRENT_MONTH) break;

				const trendFactor = item.trend / 12;
				const noise = (Math.random() - 0.45) * item.volatility;

				// Event Spikes
				let shock = 0;
				if (item.name.toLowerCase().includes("vegetables") && year === 2022 && month > 9) shock = 8;
				if (item.code.startsWith("07.2.2") && year === 2022 && month > 3 && month < 8) shock = 4;

				const change = currentCPI * trendFactor + noise + shock;
				currentCPI += change;

				if (currentCPI < 85) currentCPI = 85;

				dataset.push({
					y: year,
					m: month,
					r: region.code,
					c: item.code,
					n: item.name,
					v: Number.parseFloat(currentCPI.toFixed(4)),
				});
			}
		}
	}
}

const outputPath = "./public/inflation_data.json";
await write(outputPath, JSON.stringify(dataset));

console.log(`Generated ${dataset.length.toLocaleString()} rows.`);
console.log(`Saved to ${outputPath}`);
