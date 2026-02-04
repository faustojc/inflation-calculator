import { format } from "date-fns";
import { CalendarDays, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";

import { ContributorTable } from "@/components/ContributorTable";
import { Notes } from "@/components/Notes";
import { TrendGraph } from "@/components/TrendGraph";
import { calculationResult } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";

export function ResultsDrawer() {
	const { show, data } = useStore(calculationResult);

	if (!data) return null;

	const { personalRate, yearlyCpiEnd, trend, meta, interpretation, contributors } = data;

	const startDateStr = format(new Date(meta.dates.startYear, meta.dates.startMonth - 1), "MMMM yyyy");
	const endDateStr = format(new Date(meta.dates.endYear, meta.dates.endMonth - 1), "MMMM yyyy");

	const lcg = (seed: number) => {
		const a = 1664525;
		const c = 1013904223;
		const m = 2 ** 32;
		let state = seed >>> 0;
		state = (a * state + c) % m;
		return state / m;
	};

	return (
		<Drawer direction="bottom" open={show} onOpenChange={(open) => calculationResult.set({ show: open, data })}>
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

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 overflow-y-auto bg-zinc-100">
						<div className="col-span-3 md:col-span-1 border-2 mx-3 mt-3 md:ml-3 p-6 md:p-8 rounded-4xl flex flex-col items-center justify-evenly text-center shadow-lg shadow-blue-300 bg-white border-blue-400">
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

						<div className="col-span-3 md:col-span-2">
							<TrendGraph trend={trend} startDateStr={startDateStr} endDateStr={endDateStr} meta={meta} />
						</div>

						<div className="col-span-3">
							<div className="bg-white p-6 mx-3 mt-3 rounded-2xl border border-zinc-400 shadow">
								<div className="flex items-center gap-2 mb-3">
									<h3 className="font-bold uppercase tracking-wide text-base sm:text-2xl">Major Contributors to Inflation</h3>
								</div>
								<ContributorTable contributors={contributors} />
							</div>
						</div>

						<div className="col-span-3">
							<div className="bg-white p-6 mx-3 mt-3 rounded-2xl border border-zinc-400 shadow">
								<div className="flex items-center gap-2 mb-3">
									<Info className="h-4 w-4" />
									<h3 className="font-bold uppercase tracking-wide text-base sm:text-2xl">Analysis</h3>
								</div>
								<ul className="list-disc list-inside text-justify">
									{interpretation.map((p, i) => (
										<li key={lcg(i)} className="text-base sm:text-lg leading-relaxed text-slate-700 mb-4">
											{p}
										</li>
									))}
								</ul>
							</div>
						</div>

						<div className="col-span-3">
							<Notes />
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
