export const PROVINCE_TO_REGION: Record<string, string> = {
	// NCR
	"Manila, Metro (NCR)": "NCR",

	// CAR
	Abra: "CAR",
	Apayao: "CAR",
	"Benguet (inc. Baguio)": "CAR",
	Ifugao: "CAR",
	Kalinga: "CAR",
	"Mountain Province": "CAR",

	// Region I
	"Ilocos Norte": "I",
	"Ilocos Sur": "I",
	"La Union": "I",
	Pangasinan: "I",

	// Region II
	Batanes: "II",
	Cagayan: "II",
	Isabela: "II",
	"Nueva Vizcaya": "II",
	Quirino: "II",

	// Region III
	Aurora: "III",
	Bataan: "III",
	Bulacan: "III",
	"Nueva Ecija": "III",
	Pampanga: "III",
	Tarlac: "III",
	Zambales: "III",

	// Region IV-A
	Batangas: "IV-A",
	Cavite: "IV-A",
	Laguna: "IV-A",
	Quezon: "IV-A",
	Rizal: "IV-A",

	// Region IV-B
	Marinduque: "IV-B",
	"Occidental Mindoro": "IV-B",
	"Oriental Mindoro": "IV-B",
	Palawan: "IV-B",
	Romblon: "IV-B",

	// Region V
	Albay: "V",
	"Camarines Norte": "V",
	"Camarines Sur": "V",
	Catanduanes: "V",
	Masbate: "V",
	Sorsogon: "V",

	// Region VI
	Aklan: "VI",
	Antique: "VI",
	Capiz: "VI",
	Guimaras: "VI",
	Iloilo: "VI",
	"Negros Occidental": "VI",

	// Region VII
	Bohol: "VII",
	Cebu: "VII",
	"Negros Oriental": "VII",
	Siquijor: "VII",

	// Region VIII
	Biliran: "VIII",
	"Eastern Samar": "VIII",
	Leyte: "VIII",
	"Northern Samar": "VIII",
	"Samar (Western)": "VIII",
	"Southern Leyte": "VIII",

	// Region IX
	"Zamboanga del Norte": "IX",
	"Zamboanga del Sur": "IX",
	"Zamboanga Sibugay": "IX",

	// Region X
	Bukidnon: "X",
	Camiguin: "X",
	"Lanao del Norte": "X",
	"Misamis Occidental": "X",
	"Misamis Oriental": "X",

	// Region XI
	"Davao de Oro": "XI",
	"Davao del Norte": "XI",
	"Davao del Sur": "XI",
	"Davao Occidental": "XI",
	"Davao Oriental": "XI",

	// Region XII
	"Cotabato (North)": "XII",
	Sarangani: "XII",
	"South Cotabato": "XII",
	"Sultan Kudarat": "XII",

	// Region XIII
	"Agusan del Norte": "XIII",
	"Agusan del Sur": "XIII",
	"Dinagat Islands": "XIII",
	"Surigao del Norte": "XIII",
	"Surigao del Sur": "XIII",

	// BARMM
	Basilan: "BARMM",
	"Lanao del Sur": "BARMM",
	Maguindanao: "BARMM",
	Sulu: "BARMM",
	"Tawi-Tawi": "BARMM",
};

export const SORTED_PROVINCES = Object.keys(PROVINCE_TO_REGION).sort();
