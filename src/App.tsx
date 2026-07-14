import ClearButton from "@/components/ClearButton";
import ExpenseTab from "@/components/ExpenseTab";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import { GeneralTab } from "@/components/GeneralTab";
import { Header } from "@/components/Header";
import { SettingsPanel } from "@/components/SettingsPanel";
import { SmartSearch } from "@/components/SmartSearch";
import { Toaster } from "@/components/Toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { dataStore, initializeApp } from "@/stores/dataStore";
import { $openFaq } from "@/stores/faqStore";
import {
	activeTab,
	buildSearchIndex,
	calculationResult,
	initializeExpenses,
	markSettingsReady,
	settings,
} from "@/stores/inflationStore";
import { openOnboarding } from "@/stores/onboardingStore";
import { Loader, RefreshCw, TriangleAlert } from "lucide-solid";
import { createEffect, createSignal, lazy, onCleanup, onMount, Show, Suspense } from "solid-js";

const LazyOnboarding = lazy(() => import("@/components/Onboarding").then((module) => ({ default: module.Onboarding })));
const LazyResultsDrawer = lazy(() => import("@/components/ResultsDrawer").then((module) => ({ default: module.ResultsDrawer })));

export default function App() {
	const isMobile = useIsMobile();
	const [canLoadOnboarding, setCanLoadOnboarding] = createSignal(false);
	const [generalVisited, setGeneralVisited] = createSignal(false);
	const [detailedVisited, setDetailedVisited] = createSignal(false);

	const isLoading = () => dataStore.isLoading.get() || dataStore.commodities.get().length === 0;
	const error = () => dataStore.error.get();

	createEffect(() => {
		if (activeTab.get() === "general") setGeneralVisited(true);
		else setDetailedVisited(true);
	});

	onMount(() => {
		const loadOnboarding = () => setCanLoadOnboarding(true);

		if ("requestIdleCallback" in window) {
			const idleId = window.requestIdleCallback(loadOnboarding, { timeout: 2500 });
			onCleanup(() => window.cancelIdleCallback(idleId));
			return;
		}

		const timeoutId = setTimeout(loadOnboarding, 1200);
		onCleanup(() => clearTimeout(timeoutId));
	});

	onMount(() => {
		void initializeApp().then((meta) => {
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
	});

	// Focus trap: Tab cycles within .commodity-input fields inside #commodity-inputs
	onMount(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;

			const container = document.getElementById("commodity-inputs");
			if (!container?.contains(document.activeElement)) return;

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
		onCleanup(() => document.removeEventListener("keydown", handleKeyDown));
	});

	return (
		<Show
			when={!error()}
			fallback={
				<div class="min-h-screen flex items-center justify-center bg-page-pattern px-4 py-12 font-sans">
					<div id="none" class="glass-card w-full max-w-lg p-6 sm:p-8">
						<div class="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-error/10 text-error">
							<TriangleAlert class="size-7" />
						</div>
						<div class="space-y-2 text-center">
							<h1 class="text-xl font-bold text-foreground">Unable to Load Calculator</h1>
							<p class="text-sm text-foreground">
								The app could not finish loading the required inflation data. Refresh the page to try again.
							</p>
						</div>
						<div class="mt-6 rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
							{error()}
						</div>
						<div class="mt-6 flex justify-center">
							<button
								type="button"
								class="btn btn-primary inline-flex items-center"
								onClick={() => window.location.reload()}
							>
								<RefreshCw class="size-4" />
								Reload Page
							</button>
						</div>
					</div>
				</div>
			}
		>
			<Show
				when={!isLoading()}
				fallback={
					<div class="min-h-screen flex flex-col items-center justify-center bg-page-pattern font-sans">
						<div class="flex flex-col items-center gap-4 p-8">
							<Loader class="h-10 w-10 animate-spin text-primary" />
							<div class="text-center">
								<h1 class="font-bold text-lg text-foreground">Initializing Calculator</h1>
								<p class="text-sm text-muted-foreground mt-1">Loading and indexing PSA data...</p>
							</div>
						</div>
					</div>
				}
			>
				<Toaster position="top-center" closeButton />

				<div class="min-h-screen w-full font-sans bg-page-pattern">
					<Header />

					<main class="max-w-5xl mx-auto px-4 py-5 pb-44 space-y-4">
						<h1 class="text-center text-xl lg:text-3xl font-bold text-foreground">PERSONAL INFLATION CALCULATOR</h1>

						<SettingsPanel />

						<Show
							when={activeTab.get() === "general"}
							fallback={
								<div class="flex justify-between items-center my-5">
									<div>
										<h2 class="font-bold text-base text-foreground flex items-center gap-2">
											Commodity Breakdown
										</h2>
										<p class="text-xs sm:text-sm text-muted-foreground">
											Expand categories to input specific expenses
										</p>
									</div>
									<ClearButton />
								</div>
							}
						>
							<div class="flex justify-between items-center my-5">
								<h2 class="font-bold text-base text-foreground">General Commodities</h2>
								<ClearButton />
							</div>
						</Show>

						<SmartSearch />

						<Show when={!isMobile()}>
							<div>
								To navigate, press
								<span class="mx-1 bg-primary px-2 py-0.5 rounded font-mono text-white">Tab</span>
								to <strong>proceed</strong> to the next input field and
								<span class="mx-1 bg-primary px-2 py-0.5 rounded font-mono text-white">Shift+Tab</span>
								to <strong>go back</strong>.
							</div>
						</Show>

						<div id="commodity-inputs">
							<Show when={generalVisited()}>
								<div classList={{ hidden: activeTab.get() !== "general" }}>
									<GeneralTab />
								</div>
							</Show>
							<Show when={detailedVisited()}>
								<div classList={{ hidden: activeTab.get() !== "detailed" }}>
									<ExpenseTab />
								</div>
							</Show>
						</div>
					</main>

					<Footer />
				</div>

				<Show when={calculationResult.data.get()}>
					<Suspense fallback={null}>
						<LazyResultsDrawer />
					</Suspense>
				</Show>
				<Show when={canLoadOnboarding() || openOnboarding.get()}>
					<Suspense fallback={null}>
						<LazyOnboarding />
					</Suspense>
				</Show>
				<Show when={$openFaq.get()}>
					<Faq />
				</Show>
			</Show>
		</Show>
	);
}
