import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { CalculationResult } from "@/utils/inflationCompute";
import { format } from "date-fns";
import { ArrowDown, ArrowRight, CheckCircle2, HelpCircle, MapPin, TrendingUp } from "lucide-react";

interface ResultsDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: CalculationResult | null;
	dates: { start: Date; end: Date };
}

const ResultsDrawer = ({ open, onOpenChange, data, dates }: Readonly<ResultsDrawerProps>) => {
	if (!data) return null;

	const isHigh = data.personalInflationRate > 4;
	const difference = data.totalCurrentSpend - data.totalPreviousSpend;

	const fmtMoney = (n: number) => `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	const sortedBreakdown = data.breakdown.sort((a, b) => b.itemInflationRate - a.itemInflationRate);

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="h-[90vh] flex flex-col rounded-t-4xl bg-slate-50 dark:bg-slate-950">
				<div className="mx-auto w-full max-w-lg flex flex-col h-full">
					<DrawerHeader className="shrink-0 border-b text-center rounded-t-4xl">
						<DrawerTitle className="text-xl font-bold">Inflation Report</DrawerTitle>
						<DrawerDescription className="flex justify-center items-center gap-2 mt-1">
							<span className="flex items-center gap-1 text-xs">
								{format(dates.start, "MMM yyyy")} <ArrowRight className="h-3 w-3" /> {format(dates.end, "MMM yyyy")}
							</span>
							<span>•</span>
							<span className="flex items-center gap-1">
								<MapPin className="h-3 w-3" /> {data.meta.location.regionCode}
							</span>
						</DrawerDescription>
					</DrawerHeader>

					<div className="flex-1 overflow-y-auto p-5 space-y-6">
						<div
							className={`
								flex flex-col items-center justify-center p-8 rounded-3xl border shadow-sm
								${isHigh ? "bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/50" : "bg-green-50 border-green-100 dark:bg-green-950/20 dark:border-green-900/50"}
							`}
						>
							<span className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Rate of Change</span>
							<div
								className={`text-7xl font-black tracking-tighter tabular-nums
									${isHigh ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}
								`}
							>
								{data.personalInflationRate.toFixed(1)}%
							</div>
						</div>

						<div className="bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-4">
							<h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wide">Purchasing Power Impact</h3>
							<div className="space-y-1">
								<div className="flex justify-between text-sm text-muted-foreground">
									<span>Value in {format(dates.start, "yyyy")}</span>
									<span>{fmtMoney(data.totalPreviousSpend)}</span>
								</div>
								<div className="flex justify-between items-baseline">
									<span className="font-medium">Cost in {format(dates.end, "yyyy")}</span>
									<span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{fmtMoney(data.totalCurrentSpend)}</span>
								</div>
							</div>

							<div className="relative pt-4">
								<div className="absolute top-0 inset-x-0 flex justify-center">
									<div className="bg-slate-100 dark:bg-slate-800 rounded-full p-1 border">
										<ArrowDown className="h-4 w-4 text-slate-400" />
									</div>
								</div>
								<Separator />
							</div>

							<div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
								<span className="text-sm font-medium text-slate-600 dark:text-slate-400">Added Expense</span>
								<span className="font-mono font-bold text-red-500 text-lg">+{fmtMoney(difference)}</span>
							</div>
						</div>

						<div>
							<h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
								<TrendingUp className="h-4 w-4" /> Category Breakdown
							</h3>
							<div className="space-y-3 pb-4">
								{sortedBreakdown.map((item) => (
									<div
										key={item.id}
										className="group flex flex-col bg-white dark:bg-slate-900 border rounded-xl p-3 shadow-sm hover:border-blue-300 transition-colors"
									>
										<div className="flex justify-between items-start mb-2">
											<div className="max-w-[70%]">
												<span className="font-semibold text-sm block leading-tight">{item.name}</span>
												<div className="flex items-center gap-1.5 mt-1">
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<Badge
																	variant="outline"
																	className={`
																			text-[10px] px-1.5 py-0 h-5 gap-1 font-normal cursor-help
																			${item.status === "exact" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200"}
																		`}
																>
																	{item.status === "exact" ? (
																		<CheckCircle2 className="h-3 w-3" />
																	) : (
																		<HelpCircle className="h-3 w-3" />
																	)}
																	{item.matchQuality}
																</Badge>
															</TooltipTrigger>
															<TooltipContent>
																<p className="text-xs">
																	{item.status === "exact" ? "Exact match" : "Estimate used due to missing specific data"}
																</p>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</div>
											</div>

											<Badge className={`text-sm font-bold ${item.itemInflationRate > 5 ? "bg-red-500" : "bg-slate-600"}`}>
												{item.itemInflationRate > 0 ? "+" : ""}
												{item.itemInflationRate.toFixed(1)}%
											</Badge>
										</div>
										<div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-dashed mt-1">
											<span>Was: {fmtMoney(item.previousSpend)}</span>
											<span>
												Now: <span className="text-slate-900 font-medium">{fmtMoney(item.currentSpend)}</span>
											</span>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					<DrawerFooter className="shrink-0 border-t pt-4 pb-8">
						<DrawerClose asChild>
							<Button variant="outline" className="w-full h-12 text-base font-semibold">
								Close Report
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
};

export default ResultsDrawer;
