import { format } from "date-fns";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, Info, MapPin, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";

import { mode } from "@/stores/inflationStore";
import type { CalculationResult } from "@/utils/inflationCompute";
import { useStore } from "@nanostores/react";
import { TrendGraph } from "./TrendGraph";

interface ResultsDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: CalculationResult | null;
}

export function ResultsDrawer({ open, onOpenChange, data }: Readonly<ResultsDrawerProps>) {
	const currMode = useStore(mode);

	if (!data) return null;

	const { personalRate, yearlyCpiEnd, totalSpend, trend, meta, interpretation } = data;

	const totalPreviousSpend = totalSpend / (1 + personalRate / 100);
	const difference = totalSpend - totalPreviousSpend;
	const isHigh = personalRate > 4;
	const currencyFormatter = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

	const startDateStr = format(new Date(meta.dates.startYear, meta.dates.startMonth - 1), "MMM yyyy");
	const endDateStr = format(new Date(meta.dates.endYear, meta.dates.endMonth - 1), "MMM yyyy");

	// scramble the string
	const generateKey = (value: string) =>
		value
			.split("")
			.sort(() => (Math.random() > 0.5 ? 1 : -1))
			.join("");

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="h-[95vh] flex flex-col rounded-t-[24px] font-sans">
				<div className="mx-auto w-full max-w-7xl flex flex-col h-full overflow-hidden">
					<DrawerHeader className="shrink-0 text-center pb-2 bg-white dark:bg-slate-900 rounded-t-[24px] border-b border-slate-100 dark:border-slate-800">
						<DrawerTitle className="text-2xl font-bold tracking-tight">Inflation Report</DrawerTitle>
						<DrawerDescription className="flex justify-center items-center gap-3 mt-2 text-xs">
							<span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
								<CalendarDays className="h-3 w-3 text-slate-500" />
								{endDateStr} <ArrowRight className="h-3 w-3" /> {startDateStr}
							</span>
							<span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
								<MapPin className="h-3 w-3 text-slate-500" />
								{meta.location.hierarchy.target.name}
							</span>
						</DrawerDescription>
					</DrawerHeader>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 overflow-y-auto p-6">
						<div
							className={`
								p-6 md:p-8 rounded-[2rem] flex flex-col items-center text-center border shadow-lg
								${isHigh ? "border-red-600 border-2 shadow-red-200" : "border-green-600 border-2 shadow-green-200"}
							`}
						>
							<span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Personal Inflation Rate</span>
							<p
								className={`text-5xl md:text-7xl font-black tracking-tighter tabular-nums mb-1
									${isHigh ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}
								`}
							>
								{personalRate.toFixed(1)}%
							</p>

							<Separator className="my-3" />

							<div className="flex flex-col items-center gap-1 md:gap-2 mt-2">
								<p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-50 mb-1 md:mb-2">Consumer Price Index</p>
								<p className="text-lg md:text-xl font-black ">{yearlyCpiEnd.toFixed(1)} (2018=100)</p>
							</div>
						</div>

						<div className="flex flex-col justify-center bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-4">
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
								<span className={`font-mono font-bold ${difference > 0 ? "text-red-500" : "text-green-500"} text-lg flex items-center gap-1`}>
									{difference > 0 ?
										<ArrowUpRight className="h-4 w-4" />
									:	<ArrowDown className="h-4 w-4" />}
									{currMode === "amount" ? currencyFormatter.format(difference) : `${difference.toFixed(1)}%`}
								</span>
							</div>
						</div>

						<div className="sm:col-span-2 space-y-4">
							<TrendGraph trend={trend} startDateStr={startDateStr} endDateStr={endDateStr} meta={meta} />

							<div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
								<div className="flex items-center gap-2 mb-3 text-slate-500">
									<Info className="h-4 w-4" />
									<h3 className="font-bold text-xs uppercase tracking-wide">Analysis</h3>
								</div>
								{interpretation.map((p) => (
									<p key={generateKey(p.substring(0, 10))} className="leading-relaxed text-slate-700 dark:text-slate-300 mb-4">
										{p}
									</p>
								))}
							</div>
						</div>
					</div>

					<DrawerFooter className="shrink-0 pt-4 pb-8 border-t">
						<DrawerClose asChild>
							<Button size="lg" className="w-full text-base font-bold shadow-md">
								Done
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
