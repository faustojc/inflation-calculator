import { Info } from "lucide-react";

export function Notes({ className }: { className?: string }) {
	return (
		<>
			{/* TECHNICAL NOTES */}
			<div className={`bg-card/70 p-6 rounded-2xl border-2 border-primary/10 shadow-lg shadow-primary/5 ${className}`}>
				<div className="flex items-center gap-2 mb-3">
					<Info className="h-4 w-4 text-primary" />
					<h3 className="font-bold uppercase tracking-wide text-base sm:text-2xl">Technical Notes</h3>
				</div>
				<ul className="list-disc list-inside text-justify space-y-4">
					<li className="text-base leading-relaxed text-foreground/80">
						The <strong>CPI</strong> measures the average price change of goods and services commonly consumed by the
						households relative to the reference or base year. The current base year of the CPI is 2018.
					</li>
					<li className="text-base leading-relaxed text-foreground/80">
						Inflation rate is the{" "}
						<i>
							<strong>year-over-year</strong>
						</i>{" "}
						change in the CPI.
					</li>
					<li className="text-base leading-relaxed text-foreground/80">
						The personal inflation calculator requires monthly or annual expenditure data from the User. This
						information is <strong>used as the statistical weight</strong> (expenditure pattern) of the User in
						computing the personal CPI and personal inflation rate.
					</li>
					<li className="text-base leading-relaxed text-foreground/80">
						The <strong>prices of goods and services</strong> used by the application in computing the CPI comes from
						the result of the <strong>Retail Price Survey of Selected Commodities for the Generation of CPI</strong>{" "}
						conducted regularly by the Philippine Statistics Authority. Each province has its own CPI market basket
						both for All Income Households and Bottom 30% Income Households.
					</li>
					<li className="text-base leading-relaxed text-foreground/80">
						The <strong>list of goods and services</strong> included in the price collection of the Philippine
						Statistics Authority are the most commonly purchased or availed of by the{" "}
						<strong>Filipino Households</strong> as determined using the result of the{" "}
						<strong>Survey of Key Informants (SKI) and Commodity and Outlet Survey (COS)</strong>.
					</li>
					<li className="text-base leading-relaxed text-foreground/80">
						Commodity groupings are based on the{" "}
						<strong>2020 Philippine Classification of Individual Consumption According to Purpose (PCOICOP)</strong>.
					</li>
				</ul>
			</div>

			{/* DISCLAMER */}
			<div className={`bg-card/70 p-6 rounded-2xl border-2 border-primary/10 shadow-lg shadow-primary/5 ${className}`}>
				<div className="flex items-center gap-2 mb-3">
					<Info className="h-4 w-4 text-primary" />
					<h3 className="font-bold uppercase tracking-wide text-base sm:text-2xl text-orange-500">Disclaimer</h3>
				</div>
				<ul className="list-disc list-inside text-justify text-base leading-relaxed text-foreground/80 space-y-4">
					<li>
						The personal inflation calculator is an application that allows the User of the application to compute
						their personal inflation rate based on their own <strong>consumption pattern</strong>.
					</li>
					<li>
						The calculator allows the User to compare their <strong>personal inflation rate</strong> with the{" "}
						<strong>official inflation data</strong> by providing information on the commodity groups that contribute
						to the computed inflation.
					</li>
					<li>
						<strong>The computed persona CPI and inflation rate</strong> are not meant to replace the official CPI and
						inflation data released by the Philippine Statistics Authority.
					</li>
					<li>
						The Philippine Statistics Authority does not save or store any information from the User. The information
						entered will automatically be deleted once the application is closed.
					</li>
					<li>
						The reference file used in the Seach option of the application is based on the list of commodities in the
						CPI market basket, and thus, may not include all the products and services consumed by the User.
					</li>
				</ul>
			</div>
		</>
	);
}
