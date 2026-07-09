import { Button } from "@/components/Button";
import { openOnboarding, startTour } from "@/stores/onboardingStore";
import { ArrowRight, BookOpen, Calculator, ChartBar, CircleQuestionMark, TrendingUp } from "lucide-solid";
import { onMount, Show } from "solid-js";

export const Onboarding = () => {
	// First-time visitors: auto-open the welcome modal
	onMount(() => {
		const hasSeenTour = localStorage.getItem("first_time_visit");
		if (!hasSeenTour) {
			setTimeout(() => openOnboarding.set(true), 600);
		}
	});

	const handleClose = () => {
		openOnboarding.set(false);
		localStorage.setItem("first_time_visit", "true");
	};

	return (
		<Show when={openOnboarding.get()}>
			<dialog
				open
				class="modal"
				onCancel={(event) => {
					event.preventDefault();
					handleClose();
				}}
			>
				<div class="modal-box sm:max-w-2xl h-11/12 md:h-[91vh] flex flex-col p-0 gap-0 rounded-2xl overflow-hidden">
					{/* PSA-branded header — sticky top */}
					<div class="shrink-0 bg-psa-gradient rounded-t-2xl px-6 pt-6 pb-5">
						<div>
							<h2 class="text-white text-lg md:text-2xl font-bold tracking-tight leading-snug">
								Determining Your Personal Inflation
							</h2>
						</div>
						<p class="text-white/70 text-xs mt-1 tracking-wide uppercase font-medium">
							Philippine Statistics Authority
						</p>
					</div>

					{/* Content body — scrollable */}
					<div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5">
						{/* What is CPI */}
						<section class="flex gap-3">
							<div class="shrink-0 mt-0.5">
								<div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
									<ChartBar class="h-4 w-4 text-primary" />
								</div>
							</div>
							<div>
								<h3 class="font-bold text-foreground mb-1">Consumer Price Index (CPI)</h3>
								<p class="text-base text-justify text-foreground leading-relaxed">
									The Philippine Statistics Authority (PSA) releases monthly CPI data, an indicator of the
									average change in retail prices of a fixed basket of goods and services commonly purchased by
									Filipino households. It shows how much, on average, prices have changed from a particular base
									year (2018 = 100).
								</p>
							</div>
						</section>

						<div class="h-px w-full bg-border my-1" />

						{/* What is the Inflation rate */}
						<section class="flex gap-3">
							<div class="shrink-0 mt-0.5">
								<div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
									<TrendingUp class="h-4 w-4 text-primary" />
								</div>
							</div>
							<div>
								<h3 class="font-bold text-foreground mb-1">Inflation Rate</h3>
								<p class="text-base text-justify text-foreground leading-relaxed">
									The inflation rate is the year-on-year percent change in the CPI. It measures how fast overall
									prices have increased or decreased compared to the previous year. Because the CPI reflects the
									&quot;typical&quot; household, it may not match your personal spending pattern, especially if
									you spend more on a particular set of goods or services such as food, rent, transport,
									tuition, or utilities.
								</p>
							</div>
						</section>

						<div class="h-px w-full bg-border my-1" />

						{/* What does this tool do */}
						<section class="flex gap-3">
							<div class="shrink-0 mt-0.5">
								<div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
									<CircleQuestionMark class="h-4 w-4 text-primary" />
								</div>
							</div>
							<div>
								<h3 class="font-bold text-foreground mb-1">Why This Calculator?</h3>
								<p class="text-base text-justify text-foreground leading-relaxed">
									The PSA developed this tool so you can estimate your own inflation rate based on your actual
									spending. By entering how you allocate your budget across commodity groups, the calculator
									produces a personal inflation data and compares it with official rates for your selected
									province/city, region, and the Philippines.
								</p>
							</div>
						</section>

						<div class="h-px w-full bg-border my-1" />

						{/* What the output will show */}
						<section class="flex gap-3">
							<div class="shrink-0 mt-0.5">
								<div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
									<BookOpen class="h-4 w-4 text-primary" />
								</div>
							</div>
							<div>
								<h3 class="font-bold text-foreground mb-1">What You'll Get</h3>
								<p class="text-base text-justify text-foreground leading-relaxed">
									The results will show your computed personal inflation rate for the past 13 months alongside
									official inflation rates, and identify the commodity groups that contribute most to your
									personal inflation.
								</p>
							</div>
						</section>

						<div class="h-px w-full bg-border my-1" />

						{/* How to use */}
						<section class="flex gap-3">
							<div class="shrink-0 mt-0.5">
								<div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
									<Calculator class="h-4 w-4 text-primary" />
								</div>
							</div>
							<div>
								<h3 class="font-bold text-foreground mb-1">How to Use the Personal Inflation Calculator</h3>
								<ol class="list-decimal list-inside space-y-3 leading-relaxed text-base text-justify text-foreground">
									<li>
										<strong>Choose your Province/City.</strong>
										<p class="text-foreground">
											This must be the area where you usually buy or consume household goods and services.
										</p>
									</li>
									<li>
										<strong>Select the Income Bracket.</strong>
										<p class="text-foreground">
											This is the consumer group you want to use for computing and comparing your personal
											inflation.
											<br /> <br />
											If “All Income Households” is selected, the personal inflation rate will be computed
											using the average prices of commodities in the market basket of all income households
											of the selected province/city. The personal inflation rate will also be compared with
											the official CPI and inflation rate for All Income Households.
											<br /> <br />
											If Bottom 30% Income Households is selected, the personal inflation rate will be
											computed using the average prices of commodities in the market basket of the bottom
											30% income households of the selected province/city. Each province/city has its own
											income bracket for the bottom 30% income households. The income brackets are based on
											the average annual per capita income by decile from the 2018 Family Income and
											Expenditure Survey.
										</p>
									</li>
									<li>
										<strong>Select the Month and Year.</strong>
										<p class="text-foreground">
											This is the reference period you prefer the personal inflation rate to be computed. By
											default, the month and year selected refer to the latest reference period with
											available official data on CPI and inflation rate.
										</p>
									</li>
									<li>
										<strong>Select Input Type</strong>
										<p class="text-foreground">
											Input type requires monthly or annual expenditure by commodity group.
											<br /> <br />
											Choose “Amount” if you want to input your monthly or annual expenditure for each
											commodity group. As a guide, the total expenditure is computed while the entries are
											being typed. The total amount is shown at the bottom of the page.
											<br /> <br />
											Choose “Percent” if you only want to provide the percentage of your monthly or annual
											expenditure allotted for each commodity group. The total percentage should be equal to
											100%. The total percentage encoded is also shown at the bottom of the page.
											<br /> <br />
											The information on monthly or annual expenditure represents your expenditure pattern.
											This will be used as statistical weight in computing the personal CPI and inflation
											rate.
										</p>
									</li>
									<li>
										<strong>Select the Commodity Group.</strong>
										<p class="text-foreground">
											If “General” is selected, inputs will be asked for the 13 major commodity groups only.
											<br /> <br />
											If “Specific” is selected, inputs will be asked for specific commodity groups.
											<br /> <br />
											The commodity groups are based on the 2020 Philippine Classification of Individual
											Consumption According to Purpose (PCOICOP). Only the Group-level (3-digit PCOICOP
											Codes) are used in this application.
										</p>
									</li>
									<li class="text-foreground">
										Press <strong>Calculate</strong> to compute your personal inflation rate and display the
										analysis.
									</li>
								</ol>
							</div>
						</section>
					</div>

					{/* Footer CTA — sticky bottom */}
					<div class="shrink-0 px-6 py-4 border-t bg-muted/80 rounded-b-2xl">
						<Button
							size="lg"
							class="w-full bg-psa-gradient hover:opacity-90 text-white font-bold py-5 rounded-xl shadow-sm cursor-pointer"
							onClick={() => {
								openOnboarding.set(false);
								setTimeout(() => startTour(), 180);
							}}
						>
							Take the Tour <ArrowRight class="inline" />
						</Button>
					</div>
				</div>
				<form method="dialog" class="modal-backdrop">
					<button type="button" onClick={handleClose}>
						close
					</button>
				</form>
			</dialog>
		</Show>
	);
};
