import { Button } from "@/components/Button";
import AdditionalInfoTab from "@/components/tabs/AdditionalInfoTab";
import AnalysisTab from "@/components/tabs/AnalysisTab";
import { cn } from "@/lib/utils";
import { calculationResult } from "@/stores/inflationStore";
import Drawer from "@corvu/drawer";
import { format } from "date-fns";
import { ChartLine, FileText, Info, Users } from "lucide-solid";
import { createSignal, For, type JSX, lazy, Match, Show, Suspense, Switch } from "solid-js";
import { Dynamic } from "solid-js/web";

const ContributorTab = lazy(() => import("@/components/tabs/ContributorTab"));
const InflationDataTab = lazy(() => import("@/components/tabs/InflationDataTab"));

type ResultTab = "inflation-data" | "contributor" | "analysis" | "additional-info";

// daisyUI `skeleton` already pulses; kill the animation under reduced motion.
const BONE = "skeleton motion-reduce:animate-none";

function LoadingRegion(props: { label: string; children: JSX.Element }) {
	return (
		<output aria-busy="true" aria-label={props.label} class="block w-full h-full animate-in fade-in duration-200">
			{props.children}
			<span class="sr-only">{props.label}</span>
		</output>
	);
}

// Each skeleton mirrors the real tab's layout so resolving the lazy chunk
// swaps content in place instead of reflowing the drawer body.
function DataTabSkeleton() {
	return (
		<LoadingRegion label="Loading inflation data">
			<div class="grid grid-cols-1 sm:grid-cols-8 gap-4 w-full py-3">
				<div class="col-span-8 lg:col-span-2 glass-card p-6 md:p-7 flex flex-col gap-8 items-center border-2 border-primary/20">
					<div class="flex flex-col items-center gap-2 w-full">
						<div class={`${BONE} h-7 w-32 rounded-lg`} />
						<div class={`${BONE} h-4 w-28 rounded`} />
					</div>
					<div class="flex flex-col items-center gap-3 w-full">
						<div class={`${BONE} h-4 w-24 rounded`} />
						<div class={`${BONE} h-16 w-40 rounded-xl`} />
						<div class={`${BONE} h-3 w-32 rounded`} />
					</div>
					<div class="h-px w-full bg-base-content/10" />
					<div class="flex flex-col items-center gap-2 w-full">
						<div class={`${BONE} h-4 w-36 rounded`} />
						<div class={`${BONE} h-10 w-28 rounded-lg`} />
					</div>
					<div class="h-px w-full bg-base-content/10" />
					<div class="flex flex-col items-center gap-2 w-full">
						<div class={`${BONE} h-4 w-32 rounded`} />
						<div class={`${BONE} h-10 w-24 rounded-lg`} />
					</div>
				</div>
				<div class="col-span-8 lg:col-span-6">
					<div class={`${BONE} h-100 w-full rounded-xl`} />
				</div>
			</div>
		</LoadingRegion>
	);
}

function ContributorTabSkeleton() {
	return (
		<LoadingRegion label="Loading contributors">
			<div class="glass-card p-4 space-y-4">
				<div class="space-y-2">
					<div class={`${BONE} h-5 w-64 max-w-full rounded`} />
					<div class={`${BONE} h-4 w-full rounded`} />
					<div class={`${BONE} h-4 w-4/5 rounded`} />
				</div>
				<div class="flex flex-wrap items-center gap-3">
					<div class={`${BONE} h-9 w-48 rounded-lg`} />
					<div class={`${BONE} h-9 w-28 rounded-lg`} />
				</div>
				<div class="space-y-2">
					<div class={`${BONE} h-9 w-full rounded-lg`} />
					<For each={[0, 1, 2, 3]}>{() => <div class={`${BONE} h-11 w-full rounded-lg`} />}</For>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-border pt-3">
					<For each={[0, 1, 2]}>
						{() => (
							<div class="space-y-2">
								<div class={`${BONE} h-4 w-28 rounded`} />
								<div class={`${BONE} h-3 w-full rounded`} />
								<div class={`${BONE} h-3 w-5/6 rounded`} />
							</div>
						)}
					</For>
				</div>
			</div>
		</LoadingRegion>
	);
}

const TABS: { value: ResultTab; label: string; icon: typeof ChartLine }[] = [
	{ value: "inflation-data", label: "Data", icon: ChartLine },
	{ value: "contributor", label: "Contributors", icon: Users },
	{ value: "analysis", label: "Analysis", icon: FileText },
	{ value: "additional-info", label: "Info", icon: Info },
];

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
					side="bottom"
					modal={true}
					open={calculationResult.get().show}
					onOpenChange={(open) => calculationResult.set({ show: open, data: data() })}
				>
					<Drawer.Portal>
						{/* Reduced motion shortens the transition instead of removing it:
						    corvu waits for `transitionend` on the content to unmount the
						    portal, so a zero/none transition leaves the overlay stuck. */}
						<Drawer.Overlay class="fixed inset-0 z-50 bg-black/50 data-closed:opacity-0 data-transitioning:transition-opacity data-transitioning:duration-500 motion-reduce:data-transitioning:duration-150" />
						<Drawer.Content
							aria-describedby="inflation-report"
							aria-description="Inflation report with analysis"
							class="group/drawer-content fixed inset-x-0 bottom-0 z-50 flex h-[95vh] flex-col rounded-t-4xl font-sans glass-panel border-none data-transitioning:transition-transform data-transitioning:duration-500 data-transitioning:ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:data-transitioning:duration-150"
						>
							<div class="flex items-center justify-center w-full flex-col h-full overflow-hidden transform-gpu border-none shadow-none ring-0 p-0 m-0">
								{/* Header */}
								<div class="rounded-t-2xl w-full pb-3 bg-psa-gradient shrink-0 shadow-sm z-10 px-4">
									<Drawer.Label class="block text-center text-xl md:text-2xl font-bold tracking-tight text-white mt-2">
										INFLATION REPORT
									</Drawer.Label>
								</div>

								{/* Body */}
								<div class="flex flex-col flex-1 w-full min-h-0 overflow-hidden">
									{/* Scrollable Content */}
									<div class="flex-1 overflow-y-auto w-full px-4 pt-4 pb-8">
										{/* One boundary per lazy tab: each gets a layout-matched
										    skeleton, and a suspending tab can't blank out its siblings. */}
										<Switch>
											<Match when={activeTab() === "inflation-data"}>
												<div class="mt-0 outline-none h-full">
													<Suspense fallback={<DataTabSkeleton />}>
														<InflationDataTab
															personalRate={data().personalRate}
															yearlyCpiEnd={data().yearlyCpiEnd}
															inflationTrend={data().inflationTrend}
															cpiTrend={data().cpiTrend}
															meta={data().meta}
															startDateStr={startDateStr(data().meta)}
															endDateStr={endDateStr(data().meta)}
														/>
													</Suspense>
												</div>
											</Match>
											<Match when={activeTab() === "contributor"}>
												<div class="mt-0 outline-none h-full">
													<Suspense fallback={<ContributorTabSkeleton />}>
														<ContributorTab contributors={data().contributors} />
													</Suspense>
												</div>
											</Match>
											<Match when={activeTab() === "analysis"}>
												<div class="mt-0 outline-none h-full">
													<AnalysisTab interpretation={data().interpretation} />
												</div>
											</Match>
											<Match when={activeTab() === "additional-info"}>
												<div class="mt-0 outline-none h-full">
													<AdditionalInfoTab />
												</div>
											</Match>
										</Switch>
									</div>

									{/* Tabs Row */}
									<div class="w-full px-2 py-1 shrink-0 z-10 border-b border-primary/10">
										<div
											role="tablist"
											class="w-full grid grid-cols-4 h-auto p-1.5 bg-muted/60 rounded-xl gap-1"
										>
											<For each={TABS}>
												{(tab) => (
													<button
														type="button"
														role="tab"
														aria-selected={activeTab() === tab.value}
														onClick={() => setActiveTab(tab.value)}
														class={cn(
															"inline-flex flex-col items-center justify-center gap-1.5 h-auto py-1.5 px-1 md:text-xs text-[12px] leading-tight font-medium rounded-lg border border-transparent whitespace-nowrap cursor-pointer text-foreground transition-[color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:pointer-events-none [&_svg]:shrink-0",
															activeTab() === tab.value &&
																"bg-primary text-primary-content shadow-sm",
														)}
													>
														<Dynamic
															component={tab.icon}
															class={`size-5 md:size-7 mb-1.5 ${activeTab() === tab.value ? "text-primary-content" : "text-foreground"}`}
														/>
														{tab.label}
													</button>
												)}
											</For>
										</div>
									</div>
								</div>

								{/* Footer */}
								<div class="mt-auto shrink-0 w-full px-6 py-4 border-t border-primary/10 bg-card/95 z-10 backdrop-blur-md flex flex-col gap-2">
									<Button
										size="lg"
										onClick={() => calculationResult.set({ show: false, data: data() })}
										class="text-white w-full text-base font-bold py-6 rounded-xl bg-psa-gradient hover:opacity-90 shadow-md transition-all active:scale-[0.98]"
									>
										Close Report
									</Button>
								</div>
							</div>
						</Drawer.Content>
					</Drawer.Portal>
				</Drawer>
			)}
		</Show>
	);
}
