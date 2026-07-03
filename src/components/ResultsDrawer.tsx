import { format } from "date-fns";
import { ChartLine, FileText, Info, Users } from "lucide-solid";
import { createSignal, lazy, Match, Show, Suspense, Switch } from "solid-js";
import { Button } from "@/components/primitives/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/primitives/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/primitives/tabs";
import AdditionalInfoTab from "@/components/tabs/AdditionalInfoTab";
import AnalysisTab from "@/components/tabs/AnalysisTab";
import { calculationResult } from "@/stores/inflationStore";

const ContributorTab = lazy(() => import("@/components/tabs/ContributorTab"));
const InflationDataTab = lazy(() => import("@/components/tabs/InflationDataTab"));

type ResultTab = "inflation-data" | "contributor" | "analysis" | "additional-info";

export function ResultsDrawer() {
	const [activeTab, setActiveTab] = createSignal<ResultTab>("inflation-data");

	const startDateStr = (meta: { dates: { startYear: number; startMonth: number } }) =>
		format(new Date(meta.dates.startYear, meta.dates.startMonth - 1), "MMMM yyyy");
	const endDateStr = (meta: { dates: { endYear: number; endMonth: number } }) =>
		format(new Date(meta.dates.endYear, meta.dates.endMonth - 1), "MMMM yyyy");

	return (
		<Show when={calculationResult.get().data}>
			{(data) => (
				<Drawer
					direction="bottom"
					modal={true}
					open={calculationResult.get().show}
					onOpenChange={(open) => calculationResult.set({ show: open, data: data() })}
				>
					<DrawerContent
						aria-describedby="inflation-report"
						aria-description="Inflation report with analysis"
						class="h-[95vh] rounded-t-4xl flex flex-col font-sans glass-panel border-none"
					>
						<div class="flex items-center justify-center w-full flex-col h-full overflow-hidden transform-gpu border-none shadow-none ring-0 p-0 m-0">
							{/* Header */}
							<DrawerHeader class="rounded-t-2xl w-full pb-3 bg-psa-gradient shrink-0 shadow-sm z-10 px-4">
								<DrawerTitle class="text-center text-xl md:text-2xl font-bold tracking-tight text-white mt-2">
									INFLATION REPORT
								</DrawerTitle>
							</DrawerHeader>

							{/* Body */}
							<Tabs
								value={activeTab()}
								onValueChange={(value) => setActiveTab(value as ResultTab)}
								class="flex flex-col flex-1 w-full min-h-0 overflow-hidden"
							>
								{/* Scrollable Content */}
								<div class="flex-1 overflow-y-auto w-full px-4 pt-4 pb-8">
									<Suspense fallback={<div class="rounded-lg bg-primary animate-pulse" />}>
										<Switch>
											<Match when={activeTab() === "inflation-data"}>
												<TabsContent value="inflation-data" class="mt-0 outline-none h-full">
													<InflationDataTab
														personalRate={data().personalRate}
														yearlyCpiEnd={data().yearlyCpiEnd}
														inflationTrend={data().inflationTrend}
														cpiTrend={data().cpiTrend}
														meta={data().meta}
														startDateStr={startDateStr(data().meta)}
														endDateStr={endDateStr(data().meta)}
													/>
												</TabsContent>
											</Match>
											<Match when={activeTab() === "contributor"}>
												<TabsContent value="contributor" class="mt-0 outline-none h-full">
													<ContributorTab contributors={data().contributors} />
												</TabsContent>
											</Match>
											<Match when={activeTab() === "analysis"}>
												<TabsContent value="analysis" class="mt-0 outline-none h-full">
													<AnalysisTab interpretation={data().interpretation} />
												</TabsContent>
											</Match>
											<Match when={activeTab() === "additional-info"}>
												<TabsContent value="additional-info" class="mt-0 outline-none h-full">
													<AdditionalInfoTab />
												</TabsContent>
											</Match>
										</Switch>
									</Suspense>
								</div>

								{/* Tabs Row */}
								<div class="w-full px-2 py-1 shrink-0 z-10 border-b border-primary/10">
									<TabsList class="w-full grid grid-cols-4 h-auto p-1.5 bg-muted/60 rounded-xl gap-1">
										<TabsTrigger
											value="inflation-data"
											class="flex-col h-auto py-1.5 px-1 md:text-xs text-[12px] leading-tight font-medium rounded-lg"
										>
											<ChartLine class="size-4 md:size-5 mb-1.5 text-primary/80" />
											Data
										</TabsTrigger>
										<TabsTrigger
											value="contributor"
											class="flex-col h-auto py-1.5 px-1 md:text-xs text-[12px] leading-tight font-medium rounded-lg"
										>
											<Users class="size-4 md:size-5 mb-1.5 text-primary/80" />
											Contributors
										</TabsTrigger>
										<TabsTrigger
											value="analysis"
											class="flex-col h-auto py-1.5 px-1 md:text-xs text-[12px] leading-tight font-medium rounded-lg"
										>
											<FileText class="size-4 md:size-5 mb-1.5 text-primary/80" />
											Analysis
										</TabsTrigger>
										<TabsTrigger
											value="additional-info"
											class="flex-col h-auto py-1.5 px-1 md:text-xs text-[12px] leading-tight font-medium rounded-lg"
										>
											<Info class="size-4 md:size-5 mb-1.5 text-primary/80" />
											Info
										</TabsTrigger>
									</TabsList>
								</div>
							</Tabs>

							{/* Footer */}
							<DrawerFooter class="shrink-0 w-full px-6 py-4 border-t border-primary/10 bg-card/95 z-10 backdrop-blur-md">
								<DrawerClose asChild>
									<Button
										size="lg"
										class="text-white w-full text-base font-bold py-6 rounded-xl bg-psa-gradient hover:opacity-90 shadow-md transition-all active:scale-[0.98]"
									>
										Close Report
									</Button>
								</DrawerClose>
							</DrawerFooter>
						</div>
					</DrawerContent>
				</Drawer>
			)}
		</Show>
	);
}
