import { useStore } from "@nanostores/react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect } from "react";

import ClearButton from "@/components/ClearButton";
import ExpenseTab from "@/components/ExpenseTab";
import Footer from "@/components/Footer";
import { GeneralTab } from "@/components/GeneralTab";
import { Header } from "@/components/Header";
import { Onboarding } from "@/components/Onboarding";
import { ResultsDrawer } from "@/components/ResultsDrawer";
import { SettingsPanel } from "@/components/SettingsPanel";
import { SmartSearch } from "@/components/SmartSearch";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { dataStore, initializeApp } from "@/stores/dataStore";
import { activeTab, buildSearchIndex, initializeExpenses, settings } from "@/stores/inflationStore";
import { Toaster } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

export default function App() {
	const { isReady, isLoading, error, commodities } = useStore(dataStore);
	const currTab = useStore(activeTab);
	const isMobile = useIsMobile();

	useEffect(() => {
		initializeApp().then(async (meta) => {
			if (meta) {
				const now = new Date();
				const maxYear = meta.year_range.official.max;
				const minYear = meta.year_range.official.min;

				const isCurrentYear = maxYear === now.getFullYear();
				const targetMonth = isCurrentYear ? now.getMonth() : 11;

				const newEndDate = new Date(maxYear, targetMonth, 1);
				const newStartDate = new Date(maxYear, targetMonth, 1);

				if (newStartDate.getFullYear() < minYear) {
					newStartDate.setFullYear(minYear);
				}

				settings.setKey("startDate", newStartDate);
				settings.setKey("endDate", newEndDate);
				settings.setKey("area", meta.areas.at(1)!);

				const locationKey = "location_accepted";

				if (localStorage.getItem(locationKey) !== "true") {
					fetch("/api/track", { method: "POST" })
						.then(() => localStorage.setItem(locationKey, "true"))
						.catch(() => {});
				}
			}

			initializeExpenses();
			buildSearchIndex();

			dataStore.setKey("isLoading", false);
			dataStore.setKey("isReady", true);
		});
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Tab") {
				const inputs = Array.from(document.querySelectorAll<HTMLInputElement>(".commodity-input")).filter(
					(el) => !el.disabled && el.offsetParent !== null,
				);

				if (inputs.length === 0) return;

				const firstInput = inputs[0]!;
				const lastInput = inputs[inputs.length - 1]!;
				const activeElement = document.activeElement as HTMLInputElement;

				if (!inputs.includes(activeElement)) {
					e.preventDefault();
					const target = e.shiftKey ? lastInput : firstInput;
					target.focus();
					return;
				}

				if (e.shiftKey) {
					if (activeElement === firstInput) {
						e.preventDefault();
						lastInput.focus();
					}
				} else {
					if (activeElement === lastInput) {
						e.preventDefault();
						firstInput.focus();
					}
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	if (isLoading || !isReady || commodities.length === 0) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-page-pattern font-sans">
				<div className="flex flex-col items-center gap-4 p-8">
					<Loader2 className="h-10 w-10 animate-spin text-primary" />
					<div className="text-center">
						<h1 className="font-bold text-lg text-foreground">Initializing Calculator</h1>
						<p className="text-sm text-muted-foreground mt-1">Loading and indexing PSA data...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-4 bg-page-pattern">
				<div className="flex flex-col items-center gap-4 p-8 bg-card rounded-2xl shadow-lg border border-border">
					<AlertTriangle className="h-12 w-12 text-destructive" />
					<h2 className="text-xl font-bold">Service Unavailable</h2>
					<p className="text-muted-foreground">{error}</p>
					<Button onClick={() => initializeApp()} className="mt-2">
						Retry
					</Button>
				</div>
			</div>
		);
	}

	return (
		<ThemeProvider>
			<Toaster position="top-center" closeButton />

			<div className="min-h-screen w-full font-sans bg-page-pattern">
				<Header />

				<main className="max-w-5xl mx-auto px-4 py-5 pb-44 space-y-4">
					<h1 className="text-center text-xl md:text-2xl lg:text-3xl font-bold text-foreground text-balance">
						PERSONAL INFLATION CALCULATOR
					</h1>

					<SettingsPanel />

					{currTab === "general" ? (
						<div className="flex justify-between items-center my-5">
							<h2 className="font-bold text-base text-foreground">General Commodities</h2>
							<ClearButton />
						</div>
					) : (
						<div className="flex justify-between items-center my-5">
							<div>
								<h2 className="font-bold text-base text-foreground flex items-center gap-2">
									Commodity Breakdown
								</h2>
								<p className="text-xs sm:text-sm text-muted-foreground">
									Expand categories to input specific expenses
								</p>
							</div>
							<ClearButton />
						</div>
					)}

					<SmartSearch />

					{!isMobile && (
						<div>
							Use
							<span className="mx-1 bg-primary px-2 py-0.5 rounded font-mono text-white">Tab</span>
							to navigate <strong>next</strong> and
							<span className="mx-1 bg-primary px-2 py-0.5 rounded font-mono text-white">Shift+Tab</span>
							to navigate <strong>previous</strong> between commodity inputs
						</div>
					)}

					<div id="commodity-inputs">
						<div style={{ display: currTab === "general" ? "block" : "none" }}>
							<GeneralTab />
						</div>

						<div style={{ display: currTab === "detailed" ? "block" : "none" }}>
							<ExpenseTab />
						</div>
					</div>
				</main>

				<Footer />
			</div>

			<ResultsDrawer />
			<Onboarding />
		</ThemeProvider>
	);
}
