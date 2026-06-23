import { use$ } from "@legendapp/state/react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "sonner";
import ClearButton from "@/components/ClearButton";
import ExpenseTab from "@/components/ExpenseTab";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import { GeneralTab } from "@/components/GeneralTab";
import { Header } from "@/components/Header";
import { SettingsPanel } from "@/components/SettingsPanel";
import { SmartSearch } from "@/components/SmartSearch";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { dataStore, initializeApp } from "@/stores/dataStore";
import {
	activeTab,
	buildSearchIndex,
	calculationResult,
	initializeExpenses,
	markSettingsReady,
	settings,
} from "@/stores/inflationStore";
import { openOnboarding } from "@/stores/onboardingStore";
import { $openFaq } from "./stores/faqStore";

const LazyOnboarding = lazy(() =>
	import("@/components/Onboarding").then((module) => ({ default: module.Onboarding })),
);
const LazyResultsDrawer = lazy(() =>
	import("@/components/ResultsDrawer").then((module) => ({ default: module.ResultsDrawer })),
);

export default function App() {
	const { isLoading, error, commodities } = use$(dataStore);
	const currTab = use$(activeTab);
	const resultState = use$(calculationResult);
	const isOnboardingOpen = use$(openOnboarding);
	const isMobile = useIsMobile();
	const isFaqOpen = use$($openFaq);

	const [canLoadOnboarding, setCanLoadOnboarding] = useState(false);

	useEffect(() => {
		const loadOnboarding = () => setCanLoadOnboarding(true);

		if ("requestIdleCallback" in window) {
			const idleId = window.requestIdleCallback(loadOnboarding, { timeout: 2500 });
			return () => window.cancelIdleCallback(idleId);
		}

		const timeoutId = setTimeout(loadOnboarding, 1200);
		return () => clearTimeout(timeoutId);
	}, []);

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

				settings.startDate.set(newStartDate);
				settings.endDate.set(newEndDate);
				settings.area.set(meta.areas.at(1)!);
			}

			initializeExpenses();
			buildSearchIndex();
			markSettingsReady();

			dataStore.isLoading.set(false);
			dataStore.isReady.set(true);
		});
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;

			const container = document.getElementById("commodity-inputs");
			if (!container || !container.contains(document.activeElement)) return;

			const inputs = Array.from(container.querySelectorAll<HTMLInputElement>(".commodity-input")).filter(
				(el) => !el.disabled && el.offsetParent !== null,
			);

			if (inputs.length === 0) return;

			const firstInput = inputs[0]!;
			const lastInput = inputs[inputs.length - 1]!;
			const activeElement = document.activeElement as HTMLInputElement;

			if (!e.shiftKey && activeElement === lastInput) {
				e.preventDefault();
				firstInput.focus();
			} else if (e.shiftKey && activeElement === firstInput) {
				e.preventDefault();
				lastInput.focus();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	if (error) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-4 bg-page-pattern">
				<div className="flex flex-col items-center gap-4 p-8 bg-card rounded-2xl shadow-lg border border-border">
					<AlertTriangle className="h-12 w-12 text-destructive" />
					<h2 className="text-xl font-bold">Service Unavailable</h2>
					<p className="text-muted-foreground">{error}</p>
					<Button onClick={() => initializeApp()} className="mt-2 w-full">
						Retry
					</Button>
				</div>
			</div>
		);
	}

	if (isLoading || commodities.length === 0) {
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

	return (
		<>
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
							To navigate, press
							<span className="mx-1 bg-primary px-2 py-0.5 rounded font-mono text-white">Tab</span>
							to <strong>proceed</strong> to the next input field and
							<span className="mx-1 bg-primary px-2 py-0.5 rounded font-mono text-white">Shift+Tab</span>
							to <strong>go back</strong>.
						</div>
					)}

					<div id="commodity-inputs">{currTab === "general" ? <GeneralTab /> : <ExpenseTab />}</div>
				</main>

				<Footer />
			</div>

			{resultState.data && (
				<Suspense fallback={null}>
					<LazyResultsDrawer />
				</Suspense>
			)}
			{(canLoadOnboarding || isOnboardingOpen) && (
				<Suspense fallback={null}>
					<LazyOnboarding />
				</Suspense>
			)}
			{isFaqOpen && <Faq />}
		</>
	);
}
