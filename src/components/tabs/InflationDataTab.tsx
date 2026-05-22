import { TrendingUp } from "lucide-react";
import { lazy, Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import type { DateRange, LocationContext, TrendPoint } from "@/utils/inflationCompute";

const TrendLine = lazy(() => import("@/components/graphs/line/TrendLine"));

const InflationDataTab = ({
	personalRate,
	yearlyCpiEnd,
	inflationTrend,
	cpiTrend,
	meta,
	startDateStr,
	endDateStr,
}: {
	personalRate: number;
	yearlyCpiEnd: number;
	inflationTrend: TrendPoint[];
	cpiTrend: TrendPoint[];
	meta: {
		location: LocationContext;
		dates: DateRange;
	};
	startDateStr: string;
	endDateStr: string;
}) => {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-8 gap-4 overflow-y-auto min-h-112.5 w-full py-3">
			{/* Personal inflation rate card */}
			<div className="col-span-8 lg:col-span-2 glass-card p-6 md:p-7 flex flex-col gap-4 sm:gap-8 items-center justify-around text-center border-primary! border-2! shadow-primary! shadow-md!">
				<div className="flex flex-col items-center gap-1">
					<h1 className="text-base md:text-xl lg:text-2xl xl:text-4xl font-extrabold uppercase tracking-wide text-foreground">
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
							<span>Year-on-year change</span>
						</div>
					</div>

					<Separator className="bg-foreground" />

					<div className="flex flex-col items-center gap-1">
						<span className="text-base lg:text-lg font-semibold uppercase tracking-widest text-foreground">
							Consumer Price Index
						</span>
						<span className="text-sm sm:text-base font-normal text-muted-foreground ml-1">(2018=100)</span>
						<p className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
							{yearlyCpiEnd.toFixed(1)}
						</p>
					</div>

					<Separator className="bg-foreground" />

					{/* Purchasing Power = (1/cpi) */}
					<div className="flex flex-col items-center gap-1">
						<span className="text-base lg:text-lg font-semibold uppercase tracking-widest text-foreground">
							Purchasing Power
						</span>
						<p className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
							{((1 / yearlyCpiEnd) * 100).toFixed(2)}
						</p>
					</div>
				</div>
			</div>

			{/* Trend graph */}
			<div className="col-span-8 lg:col-span-6 lg:min-h-0">
				<Suspense fallback={<div className="h-100 rounded-xl bg-muted/40 animate-pulse" />}>
					<TrendLine
						inflationTrend={inflationTrend}
						cpiTrend={cpiTrend}
						startDateStr={startDateStr}
						endDateStr={endDateStr}
						meta={meta}
					/>
				</Suspense>
			</div>
		</div>
	);
};

export default InflationDataTab;
