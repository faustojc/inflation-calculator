import { observable } from "@legendapp/state";

export const $openMenu = observable(false);

export const openOnboarding = observable(false);
export const showOnboarding = () => {
	openOnboarding.set(true);
};

export const startTour = async () => {
	await import("driver.js/dist/driver.css");
	const { driver } = await import("driver.js");

	const driverObj = driver({
		showProgress: true,
		animate: true,
		overlayColor: "rgba(0, 14, 42, 0.50)",
		stagePadding: 12,
		stageRadius: 12,
		popoverOffset: 16,
		nextBtnText: "Next",
		prevBtnText: "Back",
		doneBtnText: "Get Started",
		progressText: "{{current}} of {{total}}",
		steps: [
			{
				element: "#settings-panel",
				popover: {
					title: "Step 1: Set Your Preferences",
					description:
						"Start here! Pick your <strong>location</strong>, your <strong>income level</strong>, and the <strong>month and year</strong> you want to check.",
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
					description: "This is the consumer group to which you want your personal inflation to be compared.",
					side: "bottom",
				},
			},
			{
				element: "#date-control",
				popover: {
					title: "📅 Select Month and Year",
					description:
						"Pick the specific month and year you want to calculate for. It automatically shows the most recent date with available official data.",
					side: "bottom",
				},
			},
			{
				element: "#input-type-section",
				popover: {
					title: "📝 Select the Input Type",
					description:
						"Choose <strong>Amount (PhP)</strong> if you want to input your monthly or annual expenditure for each commodity group. Choose <strong>Percent (%)</strong> if you want to input the only percentage of your monthly expenditure allotted for each commodity group.",
					side: "bottom",
				},
			},
			{
				element: "#tab-control",
				popover: {
					title: "📊 Select the Commodity Group",
					description:
						"If <strong>General</strong> is selected, inputs will be asked for the 13 major commodity groups only. If <strong>Detailed</strong> is selected, inputs will be asked for specific commodity groups. Commodity Grouping is based on the 2020 Philippine Classification of Individual Consumption According to Purpose (PCOICOP).",
					side: "top",
				},
			},
			{
				element: "#smart-search",
				popover: {
					title: "🔍 Find Any Item Quickly",
					description:
						"Search for specific good or service (e.g., <strong>Rice</strong>, <strong>Electricity</strong>) to find commodities that you regularly purchase. The commodity group where the commodity belongs will be highlighted.",
					side: "bottom",
				},
			},
			{
				element: "#commodity-inputs",
				popover: {
					title: "Step 2. Enter Your Monthly Expenses",
					description:
						"Fill in exactly how much you spend in a typical month for each category listed here. <strong>In Detailed tab</strong>, some inputs that are highlighted in red with <strong>'No official CPI data'</strong> are disabled because there is no official CPI data for those commodities.",
					side: "top",
				},
			},
			{
				element: "#calculate-btn",
				popover: {
					title: "Step 3. Calculate Your Rate",
					description:
						"After entering your expenses, press this button to generate your <strong>personal inflation rate</strong> with trends and analysis.",
					side: "top",
				},
			},
			{
				element: "#none",
				popover: {
					title: "What is the output?",
					description:
						"The results will compare your personal inflation to the official data in your area and the whole country. Your inflation rate is <strong>computed</strong> by weighting official price indices against your specific spending patterns, providing an <strong>analysis</strong> of top contributors and shifts in your purchasing power relative to the 2018 base year.",
					side: "bottom",
					align: "start",
					onNextClick: () => {
						$openMenu.set(true);
						driverObj.moveNext();
					},
				},
			},
			{
				element: "#menu",
				popover: {
					title: "Menu",
					description: "Click here to open the menu and access additional features.",
					side: "bottom",
					align: "start",
				},
			},
			{
				element: "#onboarding",
				popover: {
					title: "Replay App Guide",
					description:
						"Don't worry about remembering everything. Click here anytime to reopen this guide and restart the introductory tour.",
					side: "bottom",
					align: "start",
				},
			},
			{
				element: "#faq",
				popover: {
					title: "FAQ",
					description: "Find answers to common questions about the app and its features.",
					side: "bottom",
					align: "start",
				},
			},
			{
				element: "#theme-toggle",
				popover: {
					title: "Theme Toggle",
					description: "Switch between light and dark mode for easier viewing.",
					side: "bottom",
					align: "start",
				},
			},
		],
	});

	driverObj.drive();
};
