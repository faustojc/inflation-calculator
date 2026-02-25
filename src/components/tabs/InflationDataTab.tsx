import { TrendGraph } from "@/components/TrendGraph";
import { Separator } from "@/components/ui/separator";
import { TrendingUp } from "lucide-react";

const InflationDataTab = ({ personalRate, yearlyCpiEnd, trend, meta, startDateStr, endDateStr }: any) => {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-y-auto w-full">
			{/* Personal inflation rate card */}
			<div className="col-span-3 md:col-span-1 glass-card p-6 md:p-8 flex flex-col gap-4 sm:gap-8 items-center text-center">
				<h1 className="text-base lg:text-lg font-extrabold uppercase tracking-widest text-foreground">Personal</h1>

				<div className="flex flex-col items-center gap-4 sm:gap-8">
					<div className="flex flex-col items-center gap-2">
						<span className="text-base lg:text-lg font-semibold uppercase tracking-widest text-foreground">
							Inflation Rate
						</span>
						<p className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tight tabular-nums text-primary">
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
						<span className="text-base font-normal text-muted-foreground ml-1">(2018=100)</span>
						<p className="text-xl md:text-3xl lg:text-5xl font-bold text-foreground">{yearlyCpiEnd.toFixed(1)}</p>
					</div>
				</div>
			</div>

			{/* Trend graph */}
			<div className="col-span-3 md:col-span-2">
				<TrendGraph trend={trend} startDateStr={startDateStr} endDateStr={endDateStr} meta={meta} />
			</div>
		</div>
	);
};

export default InflationDataTab;
