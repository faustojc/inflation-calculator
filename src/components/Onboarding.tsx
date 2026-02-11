import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect } from "react";

export const startTour = () => {
	const driverObj = driver({
		showProgress: true,
		animate: true,
		overlayColor: "rgba(0, 14, 42, 0.55)",
		stagePadding: 12,
		stageRadius: 12,
		popoverOffset: 16,
		nextBtnText: "Next →",
		prevBtnText: "← Back",
		doneBtnText: "Get Started ✓",
		progressText: "{{current}} of {{total}}",
		steps: [
			{
				element: "#none",
				popover: {
					title: "Welcome! 👋",
					description:
						"This tool calculates your <strong>personal inflation rate</strong> based on your spending habits, compared to official PSA data. Let's walk through how it works.",
					side: "bottom",
					align: "start",
				},
			},
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
					title: "📍 Select Location",
					description: "Choose the location where you usually reside and consume/purchase goods and services.",
					side: "bottom",
				},
			},
			{
				element: "#income-class-control",
				popover: {
					title: "💰 Select Income Bracket",
					description:
						"Select which consumer group you want your personal inflation to be computed and compared. Currently, only <strong>'All Income Households'</strong> is available.",
					side: "bottom",
				},
			},
			{
				element: "#date-control",
				popover: {
					title: "📅 Select Date",
					description:
						"Select the month and year for inflation computation. By default, the latest month and year with available data is selected.",
					side: "bottom",
				},
			},
			{
				element: "#input-type-section",
				popover: {
					title: "📝 Choose Input Method",
					description:
						"Enter expenses as <strong>exact amounts in PhP</strong>, or as <strong>percentage shares</strong> of your total budget — whichever is easier for you.",
					side: "bottom",
				},
			},
			{
				element: "#tab-control",
				popover: {
					title: "📊 General vs. Detailed",
					description:
						"<strong>General</strong> has 13 broad categories for quick input. <strong>Detailed</strong> lets you drill into specific items for more accurate results.",
					side: "top",
				},
			},
			{
				element: "#smart-search",
				popover: {
					title: "🔍 Find Any Item Quickly",
					description:
						"Search for specific goods or services (e.g., <strong>'Rice'</strong>, <strong>'Electricity'</strong>) to locate them instantly in the list.",
					side: "bottom",
				},
			},
			{
				element: "#commodity-inputs",
				popover: {
					title: "Step 2. Enter Your Monthly Expenses",
					description:
						"Enter your <strong>monthly expenses</strong> for each category/commodity. You can use the search bar to find items that you regularly purchase and it will be highlighted on which category/commodity it belongs to.",
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
		],
	});

	driverObj.drive();
};

export const Onboarding = () => {
	useEffect(() => {
		const hasSeenTour = localStorage.getItem("has_seen_onboarding");
		if (!hasSeenTour) {
			setTimeout(() => {
				startTour();
				localStorage.setItem("has_seen_onboarding", "true");
			}, 1000);
		}
	}, []);

	return null;
};
