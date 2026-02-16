import { format } from "date-fns";
import { CalendarDays, Info, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";

import { ContributorTable } from "@/components/ContributorTable";
import { TrendGraph } from "@/components/TrendGraph";
import { Separator } from "@/components/ui/separator";
import { calculationResult } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";

export function ResultsDrawer() {
	const { show, data } = useStore(calculationResult);

	if (!data) return null;

	const { personalRate, yearlyCpiEnd, trend, meta, interpretation, contributors } = data;

	const startDateStr = format(new Date(meta.dates.startYear, meta.dates.startMonth - 1), "MMMM yyyy");
	const endDateStr = format(new Date(meta.dates.endYear, meta.dates.endMonth - 1), "MMMM yyyy");

	return (
		<Drawer direction="bottom" open={show} onOpenChange={(open) => calculationResult.set({ show: open, data })}>
			<DrawerContent className="h-[95vh] rounded-t-4xl flex flex-col font-sans glass-panel border-none">
				<div className="flex items-center justify-center w-full flex-col h-full overflow-hidden transform-gpu border-none shadow-none ring-0">
					{/* Header */}
					<DrawerHeader className="text-center rounded-t-2xl w-full pb-3 bg-psa-gradient shrink-0 shadow-sm z-10">
						<DrawerTitle className="text-xl md:text-2xl font-bold tracking-tight text-white">
							Inflation Report
						</DrawerTitle>
						<DrawerDescription className="flex justify-center items-center gap-3 mt-1.5">
							<span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/80 bg-white/15 px-3 py-1 rounded-full">
								<CalendarDays className="h-3.5 w-3.5" />
								{startDateStr} to {endDateStr}
							</span>
						</DrawerDescription>
					</DrawerHeader>

					{/* Body */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-y-auto p-4 w-full bg-transparent border-none">
						{/* Personal inflation rate card */}
						<div className="col-span-3 md:col-span-1 glass-card p-6 md:p-8 flex flex-col gap-4 sm:gap-8 items-center justify-center text-center">
							<div className="flex flex-col items-center gap-2">
								<span className="text-base lg:text-lg font-semibold uppercase tracking-widest text-foreground">
									Personal Inflation Rate
								</span>
								<p className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter tabular-nums text-primary">
									{personalRate > 0 ? "+" : ""}
									{personalRate.toFixed(1)}%
								</p>
								<div className="flex items-center gap-1 text-sm text-foreground mt-1">
									<TrendingUp className="h-4 w-5" />
									<span>Year-over-year change</span>
								</div>
							</div>

							<Separator className="bg-foreground" />

							<div className="flex flex-col items-center gap-1">
								<span className="text-base lg:text-lg font-semibold uppercase tracking-widest text-foreground">
									Consumer Price Index
								</span>
								<p className="text-xl md:text-2xl lg:text-4xl font-bold text-foreground">
									{yearlyCpiEnd.toFixed(1)}
									<span className="text-base font-normal text-muted-foreground ml-1">(2018=100)</span>
								</p>
							</div>
						</div>

						{/* Trend graph */}
						<div className="col-span-3 md:col-span-2">
							<TrendGraph trend={trend} startDateStr={startDateStr} endDateStr={endDateStr} meta={meta} />
						</div>

						{/* Contributors */}
						<div className="col-span-3">
							<div className="glass-card p-5">
								<h3 className="font-bold uppercase tracking-wide text-sm sm:text-base text-foreground">
									Major Contributors to Inflation
								</h3>
								<p className="text-sm text-foreground mb-3">
									Top 3 items that had the biggest impact on your personal inflation rate and how they compare
									to other areas.
								</p>
								<ContributorTable contributors={contributors} />
							</div>
						</div>

						{/* Analysis */}
						<div className="col-span-3">
							<div className="glass-card p-5">
								<div className="flex items-center gap-2 mb-3">
									<Info className="h-4 w-4 text-primary" />
									<h3 className="font-bold uppercase tracking-wide text-base text-foreground">Analysis</h3>
								</div>
								<ul className="list-disc list-inside space-y-2">
									{interpretation.map((p, i) => (
										<li key={i} className="text-base leading-relaxed text-foreground">
											{p}
										</li>
									))}
								</ul>
							</div>
						</div>

						{/* Notes */}
						<div className="col-span-3 space-y-3">
							{/* ADDITIONAL INFORMATION */}
							<div className="glass-card p-6">
								<div className="flex items-center gap-2 mb-3">
									<Info className="h-4 w-4 text-primary" />
									<h3 className="font-bold uppercase tracking-wide text-base sm:text-2xl">
										Additional Information
									</h3>
								</div>
								<ul className="list-disc list-inside">
									<li className="text-base sm:text-lg text-foreground/80 mb-4 wrap-break-word">
										Monthly CPI and inflation rate releases:
										<br />
										<a
											href="https://psa.gov.ph/price-indices/cpi-ir"
											target="_blank"
											rel="noopener noreferrer"
											className="underline text-primary"
										>
											https://psa.gov.ph/price-indices/cpi-ir
										</a>
									</li>
									<li className="text-base sm:text-lg text-foreground/80 mb-4 wrap-break-word">
										Time-series data:
										<br />
										<a
											href="https://openstat.psa.gov.ph/Database/Prices/Price-Indices"
											target="_blank"
											rel="noopener noreferrer"
											className="underline text-primary"
										>
											https://openstat.psa.gov.ph/Database/Prices/Price-Indices
										</a>
									</li>
									<li className="text-base sm:text-lg text-foreground/80 mb-4 wrap-break-word">
										Frequently asked questions about CPI:
										<br />
										<a
											href="https://psa.gov.ph/price-indices/cpi-ir/faqs"
											target="_blank"
											rel="noopener noreferrer"
											className="underline text-blue-500"
										>
											https://psa.gov.ph/price-indices/cpi-ir/faqs
										</a>
									</li>
								</ul>
							</div>
						</div>
					</div>

					{/* Footer */}
					<DrawerFooter className="shrink-0 w-full py-4 border-t border-primary/10 bg-card/70 z-10">
						<DrawerClose asChild>
							<Button
								size="lg"
								className="text-white w-full text-sm font-bold py-5 bg-psa-gradient hover:opacity-90 shadow-md"
							>
								Close Report
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
