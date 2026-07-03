import { Info } from "lucide-solid";
import { Notes } from "@/components/Notes";

const AdditionalInfoTab = () => {
	return (
		<div class="space-y-3">
			<Notes />

			{/* ADDITIONAL INFORMATION */}
			<div class="glass-card p-6">
				<div class="flex items-center gap-2 mb-3">
					<Info class="h-4 w-4 text-primary" />
					<h3 class="font-bold uppercase tracking-wide text-base sm:text-2xl">Additional Information</h3>
				</div>
				<ul class="list-disc list-inside">
					<li class="text-base sm:text-lg text-foreground/80 mb-4 wrap-break-word">
						Monthly CPI and inflation rate releases:
						<br />
						<a
							href="https://psa.gov.ph/price-indices/cpi-ir"
							target="_blank"
							rel="noopener noreferrer"
							class="underline text-primary"
						>
							https://psa.gov.ph/price-indices/cpi-ir
						</a>
					</li>
					<li class="text-base sm:text-lg text-foreground/80 mb-4 wrap-break-word">
						Time-series data:
						<br />
						<a
							href="https://openstat.psa.gov.ph/Database/Prices/Price-Indices"
							target="_blank"
							rel="noopener noreferrer"
							class="underline text-primary"
						>
							https://openstat.psa.gov.ph/Database/Prices/Price-Indices
						</a>
					</li>
					<li class="text-base sm:text-lg text-foreground/80 mb-4 wrap-break-word">
						Frequently asked questions about CPI:
						<br />
						<a
							href="https://psa.gov.ph/price-indices/cpi-ir/faqs"
							target="_blank"
							rel="noopener noreferrer"
							class="underline text-blue-500"
						>
							https://psa.gov.ph/price-indices/cpi-ir/faqs
						</a>
					</li>
				</ul>
			</div>

			<div class="glass-card p-6">
				<div class="flex items-center gap-2 mb-3">
					<Info class="h-4 w-4 text-primary" />
					<h3 class="font-bold uppercase tracking-wide text-base sm:text-2xl">Leave a Feedback</h3>
				</div>

				<p>
					If you have any suggestions, comments, or encounter any issues while using this calculator, please
					fill out the form bellow.
				</p>

				<a
					href="https://forms.gle/A3tL28PdLoqvr8v17"
					target="_blank"
					rel="noopener noreferrer"
					class="underline text-blue-500"
				>
					https://forms.gle/A3tL28PdLoqvr8v17
				</a>
			</div>
		</div>
	);
};

export default AdditionalInfoTab;
