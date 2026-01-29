import { format } from "date-fns";
import { CalendarDays, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";

import type { CalculationResult } from "@/utils/inflationCompute";
import { TrendGraph } from "./TrendGraph";

interface ResultsDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: CalculationResult | null;
}

export function ResultsDrawer({ open, onOpenChange, data }: Readonly<ResultsDrawerProps>) {
	// const currMode = useStore(mode);

	if (!data) return null;

	const { personalRate, yearlyCpiEnd, trend, meta, interpretation } = data;

	// const totalPreviousSpend = totalSpend / (1 + personalRate / 100);
	// const difference = totalSpend - totalPreviousSpend;
	// const isHigh = personalRate > 4;
	// const currencyFormatter = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

	const startDateStr = format(new Date(meta.dates.startYear, meta.dates.startMonth - 1), "MMMM yyyy");
	const endDateStr = format(new Date(meta.dates.endYear, meta.dates.endMonth - 1), "MMMM yyyy");

	// scramble the string
	const generateKey = (value: string) =>
		value
			.split("")
			.sort(() => (Math.random() > 0.5 ? 1 : -1))
			.join("");

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="h-[95vh] flex flex-col rounded-t-[24px] font-sans bg-slate-50">
				<div className="flex items-center justify-center w-full flex-col h-full overflow-hidden">
					<DrawerHeader className="text-center w-full pb-2 rounded-t-[24px] border-b border-zinc-300 shadow">
						<DrawerTitle className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">Inflation Report</DrawerTitle>
						<DrawerDescription className="flex justify-center items-center gap-3 mt-2 text-xs">
							<span className="flex items-center gap-1 text-[0.7rem] sm:text-[0.9rem] lg:text-[1.08rem] text-black bg-slate-100 px-2 py-1 rounded-md">
								<CalendarDays className="h-3 w-3" />
								{startDateStr} to {endDateStr}
							</span>
						</DrawerDescription>
					</DrawerHeader>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-6 overflow-y-auto p-6">
						<div className="col-span-3 md:col-span-1 border-2 p-6 md:p-8 rounded-4xl flex flex-col items-center justify-evenly text-center shadow-lg shadow-blue-300 bg-white border-blue-400">
							<div className="flex flex-col items-center gap-1 md:gap-2">
								<span className="text-[0.9rem] md:text-[1rem] lg:text-[1.2rem] font-bold uppercase tracking-widest opacity-50 mb-2">
									Personal Inflation Rate
								</span>
								<p className="text-5xl md:text-6xl lg:text-7xl text-blue-500 font-black tracking-tighter tabular-nums mb-1">
									{personalRate.toFixed(1)}%
								</p>
							</div>

							<Separator className="my-3" />

							<div className="flex flex-col items-center gap-1 md:gap-2 mt-2">
								<p className="text-[0.9rem] md:text-[1rem] lg:text-[1.2rem] font-bold uppercase tracking-widest opacity-50 mb-1 md:mb-2">
									Consumer Price Index
								</p>
								<p className="text-xl md:text-2xl lg:text-4xl font-black ">{yearlyCpiEnd.toFixed(1)} (2018=100)</p>
							</div>
						</div>

						{/* <div className="flex flex-col justify-center bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-4">
							<div className="flex items-center gap-2 mb-2">
								<div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
									<Wallet className="h-4 w-4" />
								</div>
								<h3 className="font-semibold text-lg uppercase tracking-wide text-slate-500">Purchasing Power</h3>
							</div>

							<div className="grid grid-cols-2 gap-4 relative">
								<div className="space-y-1">
									<span className="text-sm text-muted-foreground block">Cost in {meta.dates.startYear}</span>
									<span className="text-xl font-bold text-slate-700 dark:text-slate-300">
										{currMode === "amount" ? currencyFormatter.format(totalPreviousSpend) : `${totalPreviousSpend.toFixed(1)}%`}
									</span>
								</div>
								<div className="space-y-1 text-right">
									<span className="text-sm text-muted-foreground block">Cost Today ({currMode === "amount" ? "PHP" : "as a %"})</span>
									<span className="text-xl font-bold text-slate-900 dark:text-white">
										{currMode === "amount" ? currencyFormatter.format(totalSpend) : `${totalSpend.toFixed(1)}%`}
									</span>
								</div>

								<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-100 dark:bg-slate-800 p-1 rounded-full border">
									<ArrowRight className="h-6 w-6 text-zinc-600" />
								</div>
							</div>

							<Separator />

							<div className="flex flex-col sm:flex-row sm:justify-between gap-3 items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
								<span className="font-medium text-slate-600 dark:text-slate-400">Added Expense / Loss</span>
								<span className={`font-mono font-bold ${difference > 0 ? "text-red-500" : "text-green-500"} text-2xl flex items-center gap-1`}>
									{difference > 0 ?
										<ArrowUp className="h-5 w-5" />
									:	<ArrowDown className="h-5 w-5" />}
									{currMode === "amount" ? currencyFormatter.format(difference) : `${difference.toFixed(1)}%`}
								</span>
							</div>
						</div> */}

						<div className="col-span-3 md:col-span-2">
							<TrendGraph trend={trend} startDateStr={startDateStr} endDateStr={endDateStr} meta={meta} />
						</div>

						<div className="col-span-3 space-y-4">
							<div className="bg-white p-6 rounded-2xl border border-zinc-400 shadow">
								<div className="flex items-center gap-2 mb-3">
									<Info className="h-4 w-4" />
									<h3 className="font-bold uppercase tracking-wide text-base sm:text-2xl">Analysis</h3>
								</div>
								<ul className="list-disc list-inside text-justify">
									{interpretation.map((p) => (
										<li key={generateKey(p.substring(0, 10))} className="text-base sm:text-lg leading-relaxed text-slate-700 mb-4">
											{p}
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>

					<DrawerFooter className="shrink-0 w-full py-6 border-t">
						<DrawerClose asChild>
							<Button size="lg" className="w-full text-base font-bold py-6 shadow-md">
								Close Report
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
