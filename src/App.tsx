import { GlobalControls } from "@/components/GlobalControls";
import { Button } from "@/components/ui/button";
import { useStore } from "@nanostores/react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useEffect } from "react";

import ExpenseList from "@/components/ExpenseList";
import Footer from "@/components/Footer";
import { GeneralTab } from "@/components/GeneralTab";
import { Header } from "@/components/Header";
import { ResultsDrawer } from "@/components/ResultsDrawer";
import { SmartSearch } from "@/components/SmartSearch";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { dataStore, initializeApp } from "@/stores/dataStore";
import { buildSearchIndex, clearExpenses, initializeExpenses, setActiveTab, settings } from "@/stores/inflationStore";
import { Toaster } from "sonner";

export default function App() {
	const { isReady, isLoading, error, commodities } = useStore(dataStore);

	const isMobile = useIsMobile();

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

	if (error) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-4">
				<AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
				<h2 className="text-xl font-bold">Service Unavailable</h2>
				<p className="text-muted-foreground mt-2">{error}</p>
				<Button onClick={() => initializeApp()} className="mt-6">
					Retry
				</Button>
			</div>
		);
	}

	return (
		<>
			<SidebarProvider>
				<Toaster position="top-center" closeButton />
				{!isMobile && <GlobalControls />}

				<div className="min-h-screen w-full font-sans">
					<Header />

					<div className="max-w-2xl mx-auto font-sans pb-52">
						<main className="relative mx-auto p-4 space-y-6 mt-4">
							<h1 className="text-base lg:text-3xl text-center font-bold mt-1 uppercase tracking-widest">Personal Inflation Calculator</h1>
							<div className="mb-2">
								<h2 className="font-bold text-lg">Find and Input Expenses</h2>
								<p>Search for specific items (e.g. "Rice", "Electricity") to locate them in the commodity list.</p>
							</div>
							<SmartSearch />

							<Tabs defaultValue="general" onValueChange={handleTabChange}>
								<TabsList className="w-full mb-6">
									<TabsTrigger value="general" className="text-md" onClick={clearExpenses}>
										General
									</TabsTrigger>
									<TabsTrigger value="detailed" className="text-md" onClick={clearExpenses}>
										Detailed
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
					</div>

					{isMobile && <Footer />}
				</div>

				{isMobile && <GlobalControls isMobile />}
			</SidebarProvider>

			<ResultsDrawer />
		</>
	);
}
