import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@nanostores/react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { BarChart3, BookOpen, Calculator, CircleQuestionMark, TrendingUp } from "lucide-react";
import { atom } from "nanostores";
import { useCallback, useEffect } from "react";
import { Notes } from "./Notes";

export const openOnboarding = atom(false);

const startTour = () => {
	const driverObj = driver({
		showProgress: true,
		animate: true,
		overlayColor: "rgba(0, 14, 42, 0.50)",
		stagePadding: 12,
		stageRadius: 12,
		popoverOffset: 16,
		nextBtnText: "Next",
		prevBtnText: "Back",
		doneBtnText: "Get Started ✓",
		progressText: "{{current}} of {{total}}",
		steps: [
			{
				element: "#settings-panel",
				popover: {
					title: "Step 1: Set Your Preferences",
					description:
						"Start here — select your <strong>location</strong> (province/city), <strong>income bracket</strong>, and the <strong>time period</strong> you want to analyze.",
					side: "bottom",
				},
			},
			{
				element: "#location-control",
				popover: {
					title: "📍 Choose your Province/City",
					description: "This must be the area where you usually buy or consume household goods and services.",
					side: "bottom",
				},
			},
			{
				element: "#income-class-control",
				popover: {
					title: "💰 Select Income Bracket",
					description:
						"This is the consumer group which you want your personal inflation to be computed and compared. Currently, <strong>'All Income Households'</strong> is enabled while the <strong>Bottom 30% Income Households</strong> and other income deciles will be available in the future",
					side: "bottom",
				},
			},
			{
				element: "#date-control",
				popover: {
					title: "📅 Select Month and Year",
					description:
						"This is the reference period you prefer the personal inflation rate to be computed. By default, the month and year selected refer to the <strong>latest reference period</strong> with available <strong>official data on CPI and inflation rate</strong>.",
					side: "bottom",
				},
			},
			{
				element: "#input-type-section",
				popover: {
					title: "📝 Select the Input Type",
					description:
						"Choose <strong>Amount</strong> if you want to input your monthly expenditure for each commodity group, and <strong>Percent</strong> if you want to input the percentage of your monthly expenditure allotted for each commodity group.",
					side: "bottom",
				},
			},
			{
				element: "#tab-control",
				popover: {
					title: "📊 Select the Commodity Group",
					description:
						"If <strong>General</strong> is selected, the inputs will be asked for the 13 major commodity groups only. If <strong>Detailed</strong> is selected, the inputs will be asked for specific commodity groups.",
					side: "top",
				},
			},
			{
				element: "#smart-search",
				popover: {
					title: "🔍 Find Any Item Quickly",
					description:
						"Search for specific goods or services (e.g., <strong>'Rice'</strong>, <strong>'Electricity'</strong>) to find items that you regularly purchase and it will be highlighted on which category/commodity it belongs to.",
					side: "bottom",
				},
			},
			{
				element: "#commodity-inputs",
				popover: {
					title: "Step 2. Enter Your Monthly Expenses",
					description: "Enter your <strong>monthly expenses</strong> for each category/commodity.",
					side: "top",
				},
			},
			{
				element: "#calculate-btn",
				popover: {
					title: "Step 3. Calculate Your Rate",
					description:
						"After entering your expenses, press this button to generate your <strong>personal inflation report</strong> with trends and analysis.",
					side: "top",
				},
			},
			{
				element: "#none",
				popover: {
					title: "What is the output?",
					description:
						"The output will provide comparison of your computed personal inflation rate with the official inflation rates of the Province/City, Region, and Philippines.  It will also display the commodity groups that contributed the most to the inflation rate.",
					side: "bottom",
					align: "start",
				},
			},
			{
				element: "#theme-toggle",
				popover: {
					title: "Theme Toggle",
					description:
						"Toggle between light and dark mode.",
					side: "bottom",
					align: "start",
				},
			},
		],
	});

	driverObj.drive();
};

export const showOnboarding = () => {
	openOnboarding.set(true);
};

export const Onboarding = () => {
	const open = useStore(openOnboarding);

	// First-time visitors: auto-open the welcome modal
	useEffect(() => {
		const hasSeenTour = localStorage.getItem("first_time_visit");
		if (!hasSeenTour) {
			setTimeout(() => openOnboarding.set(true), 800);
		}
	}, []);

	const handleClose = useCallback(() => {
		openOnboarding.set(false);
		localStorage.setItem("first_time_visit", "true");

		setTimeout(() => startTour(), 180);
	}, []);

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) handleClose();
			}}
		>
			<DialogContent className="sm:max-w-2xl h-[91vh] flex flex-col p-0 gap-0 rounded-2xl overflow-hidden">
				{/* PSA-branded header — sticky top */}
				<div className="shrink-0 bg-psa-gradient rounded-t-2xl px-6 pt-6 pb-5">
					<DialogHeader>
						<DialogTitle className="text-white text-lg md:text-2xl font-bold tracking-tight leading-snug">
							Determining Your Personal Inflation
						</DialogTitle>
					</DialogHeader>
					<p className="text-white/70 text-xs mt-1 tracking-wide uppercase font-medium">
						Philippines Statistics Authority
					</p>
				</div>

				{/* Content body — scrollable */}
				<div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5">
					{/* What is CPI */}
					<section className="flex gap-3">
						<div className="shrink-0 mt-0.5">
							<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
								<BarChart3 className="h-4 w-4 text-primary" />
							</div>
						</div>
						<div>
							<h3 className="font-semibold text-foreground mb-1">Consumer Price Index (CPI)</h3>
							<p className="text-base text-justify text-foreground leading-relaxed">
								The Philippine Statistics Authority (PSA) releases monthly CPI data, an indicator of the average
								change in retail prices of a fixed basket of goods and services commonly purchased by Filipino
								households. It shows how much, on average, prices have changed from a particular base year (2018 =
								100).
							</p>
						</div>
					</section>

					<Separator className="my-1" />

					{/* What is the Inflation rate */}
					<section className="flex gap-3">
						<div className="shrink-0 mt-0.5">
							<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
								<TrendingUp className="h-4 w-4 text-primary" />
							</div>
						</div>
						<div>
							<h3 className="font-semibold text-foreground mb-1">Inflation Rate</h3>
							<p className="text-base text-justify text-muted-foreground leading-relaxed">
								The inflation rate is the year-on-year percent change in the CPI. It measures how fast overall
								prices have increased or decreased compared to the previous year. Because the CPI reflects the
								&quot;typical&quot; household, it may not match your personal spending pattern, especially if you
								spend more on a particular set of goods or services such as food, rent, transport, tuition, or
								utilities.
							</p>
						</div>
					</section>

					<Separator className="my-1" />

					{/* What does this tool do */}
					<section className="flex gap-3">
						<div className="shrink-0 mt-0.5">
							<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
								<CircleQuestionMark className="h-4 w-4 text-primary" />
							</div>
						</div>
						<div>
							<h3 className="font-semibold text-foreground mb-1">Why This Calculator?</h3>
							<p className="text-base text-justify text-muted-foreground leading-relaxed">
								The PSA developed this tool so you can estimate your own inflation rate based on your actual
								spending. By entering how you allocate your budget across commodity groups, the calculator
								produces a personal inflation rate and compares it with official rates for your selected
								province/city, region, and the Philippines.
							</p>
						</div>
					</section>

					<Separator className="my-1" />

					{/* What the output will show */}
					<section className="flex gap-3">
						<div className="shrink-0 mt-0.5">
							<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
								<BookOpen className="h-4 w-4 text-primary" />
							</div>
						</div>
						<div>
							<h3 className="font-semibold text-foreground mb-1">What You'll Get</h3>
							<p className="text-base text-justify text-muted-foreground leading-relaxed">
								The results will show your computed personal inflation rate for the past 13 months alongside
								official inflation rates, and identify the commodity groups that contribute most to your personal
								inflation.
							</p>
						</div>
					</section>

					<Separator className="my-1" />

					{/* How to use */}
					<section className="flex gap-3">
						<div className="shrink-0 mt-0.5">
							<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
								<Calculator className="h-4 w-4 text-primary" />
							</div>
						</div>
						<div>
							<h3 className="font-semibold text-foreground mb-1">How to Use the Personal Inflation Calculator</h3>
							<ol className="list-decimal list-inside space-y-1 leading-relaxed text-base text-justify text-muted-foreground">
								<li>
									<strong>Choose your Province/City.</strong>
									<p className="text-muted-foreground">
										This must be the area where you usually buy or consume household goods and services.
									</p>
								</li>
								<li>
									<strong>Select the Income Bracket.</strong>
									<p className="text-muted-foreground">
										This is the consumer group which you want your personal inflation to be computed and
										compared. Currently, All Income Households is enabled, while the Bottom 30% Income
										Households and other income deciles will be available in the future.
									</p>
								</li>
								<li>
									<strong>Select the Month and Year.</strong>
									<p className="text-muted-foreground">
										This is the reference period you prefer the personal inflation rate to be computed. By
										default, the month and year selected refer to the latest reference period with available
										official data on CPI and inflation rate.
									</p>
								</li>
								<li>
									<strong>Select Input Type</strong>
									<p className="text-muted-foreground">
										Choose “Amount” if you want to input your monthly expenditure for each commodity group,
										and “Percent” if you want to input the percentage of your monthly expenditure allotted for
										each commodity group. This will be used as statistical weight in computing the personal
										CPI and inflation rate.
									</p>
								</li>
								<li>
									<strong>Select the Commodity Group.</strong>
									<p className="text-muted-foreground">
										If “General” is selected, the inputs will be asked for the 13 major commodity groups only.
										If “Specific” is selected, the inputs will be asked for specific commodity groups.
									</p>
								</li>
								<li className="text-muted-foreground">
									Press <strong>Calculate</strong> to compute your personal inflation rate.
								</li>
							</ol>
						</div>
					</section>

					<Separator className="mb-7" />

					<section className="space-y-3">
						<Notes />
					</section>
				</div>

				{/* Footer CTA — sticky bottom */}
				<DialogFooter className="shrink-0 px-6 py-4 border-t bg-muted/80 rounded-b-2xl">
					<Button
						size="lg"
						className="w-full bg-psa-gradient hover:opacity-90 text-white font-bold py-5 rounded-xl shadow-sm cursor-pointer"
						onClick={handleClose}
					>
						Take the Tour →
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
