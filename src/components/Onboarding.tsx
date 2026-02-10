import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect } from "react";

export const startTour = () => {
	const driverObj = driver({
		showProgress: true,
		steps: [
			{
				element: "header",
				popover: {
					title: "Welcome! 👋",
					description: "This tool calculates your personal inflation rate based on your spending habits, compared to official PSA data.",
					side: "bottom",
					align: "start",
				},
			},
			{
				element: "#settings-panel",
				popover: {
					title: "Step 1: Set Your Preferences",
					description: "Start here — select your location (province/city), income bracket, and the time period you want to analyze.",
					side: "bottom",
				},
			},
			{
				element: "#input-type-section",
				popover: {
					title: "Choose Input Method",
					description: "Enter expenses as exact amounts in PhP, or as percentage shares of your total budget.",
					side: "bottom",
				},
			},
			{
				element: "#tab-control",
				popover: {
					title: "General vs. Detailed",
					description: "'General' has 13 broad categories for quick input. 'Detailed' lets you drill into specific items for more accurate results.",
					side: "top",
				},
			},
			{
				element: "#smart-search",
				popover: {
					title: "Find Any Item Quickly",
					description: "Search for specific goods or services (e.g., 'Rice', 'Electricity') to locate them instantly.",
					side: "bottom",
				},
			},
			{
				element: "#calculate-btn",
				popover: {
					title: "Calculate Your Rate",
					description: "After entering your expenses, press this button to generate your personal inflation report with trends and analysis.",
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
