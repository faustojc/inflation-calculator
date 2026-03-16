import { TrendLine } from "@/components/graphs/line/TrendLine";
import { Separator } from "@/components/ui/separator";
import type { DateRange, LocationContext, TrendPoint } from "@/utils/inflationCompute";
import { TrendingUp } from "lucide-react";

const InflationDataTab = ({
	personalRate,
	yearlyCpiEnd,
	trend,
	meta,
	startDateStr,
	endDateStr,
}: {
	personalRate: number;
	yearlyCpiEnd: number;
	trend: TrendPoint[];
	meta: {
		location: LocationContext;
		dates: DateRange;
	};
	startDateStr: string;
	endDateStr: string;
}) => {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-8 gap-4 overflow-y-auto w-full">
			{/* Personal inflation rate card */}
			<div className="col-span-8 lg:col-span-2 glass-card p-6 md:p-7 flex flex-col gap-4 sm:gap-8 items-center justify-around text-center">
				<div className="flex flex-col items-center gap-1">
					<h1 className="text-base md:text-2xl lg:text-4xl font-extrabold uppercase tracking-wide text-foreground">
						Personal
					</h1>
					<span className="text-base font-normal text-muted-foreground ml-1">as of {endDateStr}</span>
				</div>

				<div className="flex flex-col items-center gap-4 lg:gap-6 xl:gap-8">
					<div className="flex flex-col items-center gap-2">
						<span className="text-base lg:text-lg font-semibold uppercase tracking-widest text-foreground">
							Inflation Rate
						</span>
						<p className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight tabular-nums text-primary">
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
						<span className="text-sm sm:text-base font-normal text-muted-foreground ml-1">(2018=100)</span>
						<p className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">{yearlyCpiEnd.toFixed(1)}</p>
					</div>
				</div>
			</div>

			{/* Trend graph */}
			<div className="col-span-8 lg:col-span-6">
				<TrendLine trend={trend} startDateStr={startDateStr} endDateStr={endDateStr} meta={meta} />
			</div>
		</div>
	);
};

export default InflationDataTab;
