import { Info } from "lucide-react";

export function Notes() {
	return (
		<>
			{/* DISCLAMER */}
			<div className="bg-card/70 p-6 rounded-2xl border-2 border-primary/10 shadow-lg shadow-primary/5">
				<div className="flex items-center gap-2 mb-3">
					<Info className="h-4 w-4 text-primary" />
					<h3 className="font-bold uppercase tracking-wide text-base sm:text-2xl text-orange-500">Disclamer</h3>
				</div>
				<ul className="list-disc list-inside text-justify">
					<li className="text-base leading-relaxed text-foreground/80 mb-4">
						The personal inflation calculator is an application that lets the User to compute their inflation rate
						based on their <strong>consumption pattern</strong>.
					</li>
					<li className="text-base leading-relaxed text-foreground/80 mb-4">
						The calculator allows the User to compare their <strong>personal inflation rate</strong> with the{" "}
						<strong>official inflation data</strong> by providing information on the commodity groups that contribute
						to the computed inflation.
					</li>
					<li className="text-base leading-relaxed text-foreground/80 mb-4">
						<strong>However</strong>, it is not meant to replace the original inflation data released by the
						Philippine Statistics Authority.
					</li>
				</ul>
			</div>

			{/* TECHNICAL NOTES */}
			<div className="bg-card/70 p-6 rounded-2xl border-2 border-primary/10 shadow-lg shadow-primary/5">
				<div className="flex items-center gap-2 mb-3">
					<Info className="h-4 w-4 text-primary" />
					<h3 className="font-bold uppercase tracking-wide text-base sm:text-2xl">Technical Notes</h3>
				</div>
				<ul className="list-disc list-inside text-justify">
					<li className="text-base leading-relaxed text-foreground/80 mb-4">
						The Consumer Price Index (CPI) measures the <strong>average price change of goods and services</strong>{" "}
						commonly consumed by the households.
					</li>
					<li className="text-base leading-relaxed text-foreground/80 mb-4">
						Inflation rate is the <strong>year-over-year change in the CPI</strong>.
					</li>
					<li className="text-base leading-relaxed text-foreground/80 mb-4">
						The personal inflation calculator <strong>requires</strong> the User to{" "}
						<strong>input their monthly expenditure</strong>. This information is used as the statistical weight
						(expenditure pattern) of the User in computing the personal CPI and personal inflation rate.
					</li>
					<li className="text-base leading-relaxed text-foreground/80 mb-4">
						The prices of goods and services used by the calculator comes from the result of the{" "}
						<strong>Retail Price Survey of Selected Commodities for the Generation of CPI</strong> conducted regularly
						by the Philippine Statistics Authority .
					</li>
					<li className="text-base leading-relaxed text-foreground/80 mb-4">
						The list of goods and services included in the price collection of the Philippine Statistics Authority are
						the most commonly purchased or availed of by the <strong>Filipino Households</strong> as determined using
						the result of the <strong>Survey of Key Informants</strong>.
					</li>
					<li className="text-base leading-relaxed text-foreground/80 mb-4">
						The official CPI and inflation rates uses <strong>2018</strong> as the reference year.
					</li>
					<li className="text-base leading-relaxed text-foreground/80 mb-4">
						Commodity groupings are based on the{" "}
						<strong>2020 Philippine Classification of Individual Consumption According to Purpose</strong>.
					</li>
				</ul>
			</div>
		</>
	);
}
