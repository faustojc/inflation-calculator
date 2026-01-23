import { GlobalControls } from "@/components/GlobalControls";
import { Button } from "@/components/ui/button";
import { useStore } from "@nanostores/react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import CalculationFooter from "@/components/CalculationFooter";
import ExpenseList from "@/components/ExpenseList";
import { GeneralTab } from "@/components/GeneralTab";
import { ResultsDrawer } from "@/components/ResultsDrawer";
import { SmartSearch } from "@/components/SmartSearch";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dataStore, getAreaHierarchy, getCalculationData, initializeApp } from "@/stores/dataStore";
import {
	buildSearchIndex,
	clearExpenses,
	expenses,
	initializeExpenses,
	isCalculationDisabled,
	locateCategory,
	mode,
	setActiveTab,
	settings,
	totalAllocation,
} from "@/stores/inflationStore";
import { calculatePersonalInflation, type CalculationResult } from "@/utils/inflationCompute";
import { Toaster, toast } from "sonner";
import { Header } from "./components/Header";

export default function App() {
	const [isCalculating, setIsCalculating] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [calculationData, setCalculationData] = useState<CalculationResult | null>(null);

	const { isReady, isLoading, error: dataError, commodities } = useStore(dataStore);
	const isDisabled = useStore(isCalculationDisabled);

	useEffect(() => {
		initializeApp().then((meta) => {
			if (meta) {
				const now = new Date();
				const maxYear = meta.year_range.max;
				const minYear = meta.year_range.min;

				const isCurrentYear = maxYear === now.getFullYear();
				const targetMonth = isCurrentYear ? now.getMonth() : 11;

				const newEndDate = new Date(maxYear, targetMonth, 1);
				const newStartDate = new Date(maxYear, targetMonth, 1);

				if (newStartDate.getFullYear() < minYear) {
					newStartDate.setFullYear(minYear);
				}

				settings.setKey("startDate", newStartDate);
				settings.setKey("endDate", newEndDate);
				settings.setKey("areaKey", meta.areas[0]!.key);
			}

			initializeExpenses();
			buildSearchIndex();

			dataStore.setKey("isLoading", false);
			dataStore.setKey("isReady", true);
		});
	}, []);

	const handleCalculate = async () => {
		setIsCalculating(true);

		try {
			const { areaKey, startDate } = settings.get();
			const currentMode = mode.get();
			const currentTotalAlloc = totalAllocation.get();
			const items = Object.values(expenses.get());

			const targetYear = startDate.getFullYear();
			const targetMonth = startDate.getMonth() + 1;
			const baseYear = targetYear - 1;
			const baseMonth = targetMonth;

			const dates = {
				startYear: baseYear,
				startMonth: baseMonth,
				endYear: targetYear,
				endMonth: targetMonth,
			};

			const activeCodes = items.filter((i) => i.value > 0).map((i) => i.code);
			if (activeCodes.length === 0) throw new Error("No expenses entered.");

			const hierarchy = getAreaHierarchy(areaKey);
			const uniqueKeys = new Set([hierarchy.target.key, hierarchy.province?.key, hierarchy.region?.key, hierarchy.national?.key, "aoncr", "ncr"]);
			const keysToFetch = Array.from(uniqueKeys).filter(Boolean) as string[];
			const batchMap = await getCalculationData(keysToFetch, dates.startYear, dates.endYear);
			const result = calculatePersonalInflation(items, { hierarchy }, dates, { mode: currentMode, totalInput: currentTotalAlloc }, batchMap);

			if (result) {
				if (result.missingItems && result.missingItems.length > 0) {
					const missingList = result.missingItems.slice(0, 3).join(", ");
					const suffix = result.missingItems.length > 3 ? "..." : "";

					toast("Cannot calculate", {
						description: `Data missing for ${missingList}${suffix}. Please remove these items or choose a different date.`,
						action: {
							label: "X",
							onClick() {
								toast.dismiss();
							},
						},
					});
				} else {
					setCalculationData(result);
					setShowResults(true);
				}
			} else {
				toast.error("Calculation failed. Please check inputs.");
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			console.error(err);
			toast.error(err.message || "Calculation failed.");
		} finally {
			setIsCalculating(false);
		}
	};

	const handleSearchSelect = (item: { categoryCode: string; name: string }) => {
		locateCategory(item.categoryCode, item.name);
	};

	const handleTabChange = (v: string) => {
		setActiveTab(v as "general" | "detailed");
	};

	if (isLoading || !isReady || commodities.length === 0) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans">
				<Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
				<h1 className="font-bold text-lg text-slate-700 dark:text-slate-300">Initializing Calculator...</h1>
				<p className="text-sm text-slate-500">Loading and indexing PSA Data</p>
			</div>
		);
	}

	if (dataError) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-4">
				<AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
				<h2 className="text-xl font-bold">Service Unavailable</h2>
				<p className="text-muted-foreground mt-2">{dataError}</p>
				<Button onClick={() => initializeApp()} className="mt-6">
					Retry
				</Button>
			</div>
		);
	}

	return (
		<SidebarProvider>
			<Toaster position="top-center" closeButton />
			<div className="max-w-2xl mx-auto min-h-screen font-sans text-slate-900 dark:text-slate-100 pb-52">
				<Header />

				<main className="relative mx-auto p-4 space-y-6 mt-4">
					<div className="mb-2">
						<h2 className="font-bold text-lg">Find and Input Expenses</h2>
						<p>Search for specific items (e.g. "Rice", "Electricity") to locate them in the commodity list.</p>
					</div>
					<SmartSearch onSelect={handleSearchSelect} />

					<Tabs defaultValue="general" className="w-full" onValueChange={handleTabChange}>
						<TabsList className="grid w-full grid-cols-2 mb-6">
							<TabsTrigger value="general" className="text-md" onClick={clearExpenses}>
								General Categories
							</TabsTrigger>
							<TabsTrigger value="detailed" className="text-md" onClick={clearExpenses}>
								Detailed Commodities
							</TabsTrigger>
						</TabsList>

						<TabsContent value="general">
							<div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
								<div className="mb-4 flex justify-between items-center">
									<div>
										<h2 className="font-bold text-lg">General Commodities</h2>
										<p>13 General Commodity Groups</p>
									</div>
									<Button className="cursor-pointer" onClick={clearExpenses}>
										<Trash2 className="h-4 w-4" />
										Clear
									</Button>
								</div>
								<GeneralTab />
							</div>
						</TabsContent>

						<TabsContent value="detailed" className="space-y-6">
							<div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
								<div className="p-4 gap-2 border-b flex justify-between items-center">
									<div>
										<h2 className="font-bold text-lg">Detailed Commodities</h2>
										<p className="text-muted-foreground text-wrap">Expand commodities to add expenses</p>
									</div>

									<Button className="cursor-pointer" onClick={clearExpenses}>
										<Trash2 className="h-4 w-4" />
										Clear
									</Button>
								</div>
								<ExpenseList />
							</div>
						</TabsContent>
					</Tabs>
				</main>

				<div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 transition-all">
					<div className="max-w-3xl mx-auto">
						<CalculationFooter />
						<Button
							size="lg"
							onClick={handleCalculate}
							disabled={isCalculating || isDisabled}
							className="w-full text-base font-bold h-12 shadow-xl transition-all active:scale-[0.98]"
						>
							{isCalculating ?
								<>
									<Loader2 className="mr-2 h-5 w-5 animate-spin" />
									Calculating your inflation rate...
								</>
							:	"Calculate Personal Inflation"}
						</Button>
					</div>
				</div>

				<ResultsDrawer open={showResults} onOpenChange={setShowResults} data={calculationData} />
			</div>

			<GlobalControls />
		</SidebarProvider>
	);
}
