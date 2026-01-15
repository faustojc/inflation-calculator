import { GlobalControls } from "@/components/GlobalControls";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useStore } from "@nanostores/react";
import { AlertTriangle, Calculator, Info, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import ExpenseList from "@/components/ExpenseList";
import { GeneralTab } from "@/components/GeneralTab";
import ResultsDrawer from "@/components/ResultsDrawer";
import { SmartSearch } from "@/components/SmartSearch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dataStore, getCalculationData, initializeApp } from "@/stores/dataStore";
import {
	clearExpenses,
	expenses,
	initializeExpenses,
	isCalculationDisabled,
	locateCategory,
	settings,
	totalDisplayLabel,
	uiState,
} from "@/stores/inflationStore";
import { calculatePersonalInflation, type CalculationResult } from "@/utils/inflationCompute";

export default function App() {
	const [isCalculating, setIsCalculating] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [calculationData, setCalculationData] = useState<CalculationResult | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const { isReady, isLoading, error: dataError, commodities } = useStore(dataStore);
	const appSettings = useStore(settings);
	const ui = useStore(uiState);

	const itemsMap = useStore(expenses);
	const items = Object.values(itemsMap);
	const isDisabled = useStore(isCalculationDisabled);
	const totalBadge = useStore(totalDisplayLabel);

	useEffect(() => {
		initializeApp();
	}, []);

	useEffect(() => {
		if (commodities.length > 0) {
			initializeExpenses();
		}
	}, [commodities]);

	const handleCalculate = async () => {
		setErrorMsg(null);
		setIsCalculating(true);

		try {
			const currentSettings = settings.get();
			const currentUi = uiState.get();
			const activeCodes = items.filter((i) => i.value > 0).map((i) => i.code);

			if (activeCodes.length === 0) throw new Error("No expenses entered.");

			const activeProvince = undefined;

			const dates = {
				startYear: currentSettings.startDate.getFullYear(),
				startMonth: currentSettings.startDate.getMonth() + 1,
				endYear: currentSettings.endDate.getFullYear(),
				endMonth: currentSettings.endDate.getMonth() + 1,
			};

			const batchMap = await getCalculationData(currentSettings.region, activeProvince, dates, activeCodes);
			const result = calculatePersonalInflation(
				items,
				{ regionCode: currentSettings.region, areaCode: activeProvince, incomeClass: currentSettings.incomeClass },
				dates,
				{ mode: currentUi.mode, totalBudget: currentUi.totalBudget },
				batchMap
			);

			if (result?.error) {
				setErrorMsg(result.error);
			} else if (result) {
				setCalculationData(result);
				setShowResults(true);
			} else {
				setErrorMsg("Calculation yielded no results. Please check data availability.");
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			console.error(err);
			setErrorMsg(err.message || "Calculation failed.");
		} finally {
			setIsCalculating(false);
		}
	};

	if (isLoading || !isReady || commodities.length === 0) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans">
				<Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
				<h1 className="font-bold text-lg text-slate-700 dark:text-slate-300">Initializing Calculator...</h1>
				<p className="text-sm text-slate-500">Loading PSA Data</p>
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
		<div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-32">
			<header className="bg-white dark:bg-slate-900 border-b px-4 py-4 sticky top-0 z-20 shadow-sm">
				<div className="max-w-3xl mx-auto flex justify-between items-center">
					<div className="flex items-center gap-2">
						<div className="bg-blue-600 p-2 rounded-lg text-white">
							<Calculator className="h-5 w-5" />
						</div>
						<div>
							<h1 className="font-bold text-lg leading-tight">Philippines Inflation Calculator</h1>
							<p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Personal CPI</p>
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-3xl mx-auto p-4 space-y-6 mt-4">
				<GlobalControls />

				{errorMsg && (
					<Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
						<Info className="h-4 w-4" />
						<AlertTitle>Calculation Issue</AlertTitle>
						<AlertDescription>{errorMsg}</AlertDescription>
					</Alert>
				)}

				<Tabs defaultValue="general" className="w-full">
					<TabsList className="grid w-full grid-cols-2 mb-6">
						<TabsTrigger value="general" onClick={clearExpenses}>
							General Categories
						</TabsTrigger>
						<TabsTrigger value="detailed" onClick={clearExpenses}>
							Detailed Search
						</TabsTrigger>
					</TabsList>

					<TabsContent value="general">
						<div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
							<div className="mb-4 flex justify-between items-center">
								<div>
									<h2 className="font-bold text-lg">General Commodities</h2>
									<p className="text-sm text-muted-foreground">13 General Commodity Groups</p>
								</div>
								{ui.mode === "amount" && (
									<div className={`text-xs font-bold px-3 py-1.5 rounded-full border ${totalBadge.colorClass}`}>{totalBadge.text}</div>
								)}
							</div>
							<GeneralTab />
						</div>
					</TabsContent>

					<TabsContent value="detailed" className="space-y-6">
						<div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
							<div className="mb-2">
								<h2 className="font-bold text-lg">Find and Input Expenses</h2>
								<p className="text-sm text-muted-foreground">
									Search for specific items (e.g. "Rice", "Electricity") to locate them in the commodity list.
								</p>
							</div>
							<SmartSearch
								onSelect={(item) => {
									locateCategory(item.categoryCode, item.name);
								}}
							/>
						</div>

						<div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
							<div className="p-4 border-b flex justify-between items-center">
								<div>
									<h2 className="font-bold text-base">Detailed Commodities</h2>
									<p className="text-xs text-muted-foreground">Expand commodities to add expenses</p>
								</div>
								<div className={`text-xs font-bold px-3 py-1.5 rounded-full border ${totalBadge.colorClass}`}>{totalBadge.text}</div>
							</div>
							<ExpenseList />
						</div>
					</TabsContent>
				</Tabs>
			</main>

			<div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-10 transition-all">
				<div className="max-w-3xl mx-auto">
					<Button
						size="lg"
						onClick={handleCalculate}
						disabled={isCalculating || isDisabled}
						className="w-full text-base font-bold h-12 shadow-xl transition-all active:scale-[0.98]"
					>
						{isCalculating ? (
							<>
								<Loader2 className="mr-2 h-5 w-5 animate-spin" />
								Calculating your inflation rate...
							</>
						) : (
							"Calculate Personal Rate"
						)}
					</Button>
				</div>
			</div>

			<ResultsDrawer
				open={showResults}
				onOpenChange={setShowResults}
				data={calculationData}
				dates={{ start: appSettings.startDate, end: appSettings.endDate }}
			/>
		</div>
	);
}
