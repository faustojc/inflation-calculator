import { GlobalControls } from "@/components/GlobalControls";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useStore } from "@nanostores/react";
import { Calculator, Info, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import ExpenseList from "@/components/ExpenseList";
import { GeneralTab } from "@/components/GeneralTab";
import ResultsDrawer from "@/components/ResultsDrawer";
import { SmartSearch } from "@/components/SmartSearch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dataStore, initializeData } from "@/stores/dataStore";
import { expenses, isCalculationDisabled, locateCategory, settings, totalDisplayLabel, uiState } from "@/stores/inflationStore";
import { calculatePersonalInflation, type CalculationResult } from "@/utils/inflationCompute";

export default function App() {
	const [showResults, setShowResults] = useState(false);
	const [calculationData, setCalculationData] = useState<CalculationResult | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const itemsMap = useStore(expenses);
	const items = Object.values(itemsMap);
	const appSettings = useStore(settings);
	const isDisabled = useStore(isCalculationDisabled);
	const totalBadge = useStore(totalDisplayLabel);
	const ui = useStore(uiState);

	const { isLoading, error, rawMap } = useStore(dataStore);

	const handleCalculate = async () => {
		setErrorMsg(null);

		try {
			const startYear = appSettings.startDate.getFullYear();
			const startMonth = appSettings.startDate.getMonth() + 1;
			const endYear = appSettings.endDate.getFullYear();
			const endMonth = appSettings.endDate.getMonth() + 1;

			const result = calculatePersonalInflation(
				items,
				appSettings.region,
				startYear,
				startMonth,
				endYear,
				endMonth,
				ui.mode,
				ui.totalBudget,
				undefined,
				appSettings.incomeClass,
				rawMap
			);

			if (result) {
				setErrorMsg(null);
				setCalculationData(result);
				setShowResults(true);
			} else {
				setErrorMsg("No CPI data found for the selected period. Please try again later.");
			}
		} catch (err: any) {
			setErrorMsg(err.message || "An unexpected error occurred");
		}
	};

	useEffect(() => {
		initializeData();
	}, []);

	if (isLoading) {
		return (
			<div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
				<Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
				<h1 className="font-bold text-lg text-slate-700">Loading PSA Data...</h1>
				<p className="text-sm text-slate-500">Downloading current inflation indices</p>
			</div>
		);
	}

	if (error) {
		return <div className="p-10 text-red-500">Error: {error}</div>;
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
					<div className="text-right hidden sm:block">
						<p className="text-xs text-muted-foreground">Region: {appSettings.region}</p>
						<p className="text-xs text-muted-foreground">
							{new Date(appSettings.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
							{" - "}
							{new Date(appSettings.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
						</p>
					</div>
				</div>
			</header>

			<main className="max-w-3xl mx-auto p-4 space-y-6 mt-4">
				<section>
					<GlobalControls />
				</section>

				{errorMsg && (
					<Alert variant="destructive" className="animate-in fade-in slide-in-from-bottom-2">
						<Info className="h-4 w-4" />
						<AlertTitle>Calculation Error</AlertTitle>
						<AlertDescription>{errorMsg}</AlertDescription>
					</Alert>
				)}

				<Tabs defaultValue="general" className="w-full">
					<TabsList className="grid w-full grid-cols-2 mb-6">
						<TabsTrigger value="general">General Categories</TabsTrigger>
						<TabsTrigger value="detailed">Detailed Search</TabsTrigger>
					</TabsList>

					{/* GENERAL */}
					<TabsContent value="general">
						<div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border">
							<div className="mb-4">
								<h2 className="font-bold text-lg">Standard Expenses</h2>
								<p className="text-sm text-muted-foreground">Fill in your spending for the 13 major groups.</p>
							</div>
							<GeneralTab />
						</div>
					</TabsContent>

					{/* DETAILED */}
					<TabsContent value="detailed">
						<div className="space-y-6">
							<section className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border">
								<div className="mb-4">
									<h2 className="font-bold text-lg">Find & Edit Expenses</h2>
									<p className="text-sm text-muted-foreground">
										Search for items (e.g. "Rice", "Electricity") to find which category they belong to.
									</p>
								</div>
								<SmartSearch onSelect={(item) => locateCategory(item.categoryCode, item.name)} />
							</section>

							<section>
								<div className="flex justify-between items-end px-1 mb-2">
									<h2 className="font-bold text-lg">Expenses</h2>
									<span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${totalBadge.colorClass}`}>{totalBadge.text}</span>
								</div>

								<ExpenseList items={items} />
							</section>
						</div>
					</TabsContent>
				</Tabs>
			</main>

			<div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t z-10">
				<div className="max-w-3xl mx-auto">
					<Button size="lg" onClick={handleCalculate} disabled={isDisabled} className="w-full text-base font-bold h-12 shadow-lg">
						Calculate Personal Rate
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
