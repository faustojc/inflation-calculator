import { format } from "date-fns";
import { ArrowRight, ArrowUpRight, CalendarDays, Info, MapPin, TrendingUp, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";

import { BreakdownItem } from "@/components/BreakdownItem";
import { mode } from "@/stores/inflationStore";
import type { CalculationResult } from "@/utils/inflationCompute";
import { useStore } from "@nanostores/react";

interface ResultsDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: CalculationResult | null;
}

export function ResultsDrawer({ open, onOpenChange, data }: Readonly<ResultsDrawerProps>) {
	const currMode = useStore(mode);

	if (!data) return null;
	const { personalRate, totalSpend, breakdown, meta, interpretation } = data;

	const totalPreviousSpend = totalSpend / (1 + personalRate / 100);
	const difference = totalSpend - totalPreviousSpend;
	const isHigh = personalRate > 4;
	const currencyFormatter = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

	const startDateStr = format(new Date(meta.dates.startYear, meta.dates.startMonth - 1), "MMM yyyy");
	const endDateStr = format(new Date(meta.dates.endYear, meta.dates.endMonth - 1), "MMM yyyy");

	const sortedBreakdown = [...breakdown].sort((a, b) => b.itemInflationRate - a.itemInflationRate);

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="h-[92vh] flex flex-col rounded-t-4xl bg-slate-50 dark:bg-slate-950 font-sans">
				<div className="mx-auto w-full max-w-lg flex flex-col h-full overflow-hidden">
					<DrawerHeader className="shrink-0 text-center border-b pb-4">
						<DrawerTitle className="text-xl font-bold tracking-tight">Personal Inflation Report</DrawerTitle>
						<DrawerDescription className="flex justify-center items-center gap-3 mt-2 text-xs">
							<span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
								<CalendarDays className="h-3 w-3 text-slate-500" />
								{endDateStr} <ArrowRight className="h-3 w-3" /> {startDateStr}
							</span>
							<span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
								<MapPin className="h-3 w-3 text-slate-500" />
								{meta.location.provinceName || meta.location.regionCode}
							</span>
						</DrawerDescription>
					</DrawerHeader>

					<div className="flex-1 overflow-y-auto p-5 space-y-6">
						<div
							className={`
								relative overflow-hidden p-6 rounded-3xl border shadow-sm flex flex-col items-center text-center
								${
									isHigh ?
										"bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900/50"
									:	"bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50"
								}
							`}
						>
							<span className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Your Personal Rate</span>
							<div
								className={`text-6xl font-black tracking-tighter tabular-nums mb-3
									${isHigh ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}
								`}
							>
								{personalRate.toFixed(1)}%
							</div>

							<div className="flex items-start gap-2 text-sm text-left bg-white/60 dark:bg-black/20 p-3 rounded-xl backdrop-blur-sm">
								<Info className={`h-5 w-5 shrink-0 mt-0.5 ${isHigh ? "text-red-500" : "text-emerald-500"}`} />
								<p className="leading-relaxed text-slate-700 dark:text-slate-300">{interpretation}</p>
							</div>
						</div>

						<div className="bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-4">
							<div className="flex items-center gap-2 mb-2">
								<div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
									<Wallet className="h-4 w-4" />
								</div>
								<h3 className="font-semibold text-sm uppercase tracking-wide text-slate-500">Purchasing Power</h3>
							</div>

							<div className="grid grid-cols-2 gap-4 relative">
								<div className="space-y-1">
									<span className="text-xs text-muted-foreground block">Cost in {meta.dates.startYear}</span>
									<span className="text-lg font-bold text-slate-700 dark:text-slate-300">
										{currMode === "amount" ? currencyFormatter.format(totalPreviousSpend) : `${totalPreviousSpend.toFixed(1)}%`}
									</span>
								</div>
								<div className="space-y-1 text-right">
									<span className="text-xs text-muted-foreground block">Cost Today {currMode === "amount" ? "in PHP" : "as a %"}</span>
									<span className="text-xl font-bold text-slate-900 dark:text-white">
										{currMode === "amount" ? currencyFormatter.format(totalSpend) : `${totalSpend.toFixed(1)}%`}
									</span>
								</div>

								<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-100 dark:bg-slate-800 p-1 rounded-full border">
									<ArrowRight className="h-4 w-4 text-slate-400" />
								</div>
							</div>

							<Separator />

							<div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
								<span className="text-sm font-medium text-slate-600 dark:text-slate-400">Added Expense / Loss</span>
								<span className="font-mono font-bold text-red-500 text-lg flex items-center gap-1">
									<ArrowUpRight className="h-4 w-4" />
									{currencyFormatter.format(difference)}
								</span>
							</div>
						</div>

						<div>
							<div className="flex items-center gap-2 mb-4 px-1">
								<TrendingUp className="h-4 w-4 text-slate-500" />
								<h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wide">Item Breakdown</h3>
							</div>

							<div className="space-y-3 pb-6">
								{sortedBreakdown.map((item) => (
									<BreakdownItem key={item.id} item={item} totalSpend={totalSpend} formatter={currencyFormatter} />
								))}
							</div>
						</div>
					</div>

					<DrawerFooter className="shrink-0 border-t pt-4 pb-8">
						<DrawerClose asChild>
							<Button variant="outline" className="w-full h-12 text-base font-semibold shadow-sm">
								Close Report
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
