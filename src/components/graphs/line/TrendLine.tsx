import { useValue } from "@legendapp/state/react";
import { TrendingUp } from "lucide-react";
import { TrendLegend } from "@/components/graphs/line/TrendLegend";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTrendChart } from "@/hooks/useTrendChart";
import { type CompareModeType, compareMode, type TrendType, trendType } from "@/stores/graphStore";
import type { DateRange, LocationContext, TrendPoint } from "@/utils/inflationCompute";
import { buildYAxisConfig } from "@/utils/trendChartUtils";
import "uplot/dist/uPlot.min.css";

interface Props {
	inflationTrend: TrendPoint[];
	cpiTrend: TrendPoint[];
	startDateStr: string;
	endDateStr: string;
	meta: {
		location: LocationContext;
		dates: DateRange;
	};
}

const SERIES_ORDER = ["personal", "area", "province", "region", "national"] as const;

export default function TrendLine({
	inflationTrend,
	cpiTrend,
	startDateStr,
	endDateStr,
	meta,
}: Readonly<Props>) {
	const mode = useValue(compareMode);
	const currTrend = useValue(trendType);
	const isMobile = useIsMobile();

	const hierarchy = meta.location;
	const hasProvince = !!hierarchy.province && hierarchy.province.key !== hierarchy.target.key;
	const hasRegion = !!hierarchy.region && hierarchy.region.key !== hierarchy.target.key;

	const trend = currTrend === "inflation" ? inflationTrend : cpiTrend;
	const currName = currTrend === "inflation" ? "My Inflation" : "My CPI";

	const showLine = (key: string): boolean => {
		if (key === "personal") return true;
		if (mode === "all") return true;
		return mode === key;
	};

	const seriesLabels: Record<string, string> = {
		personal: currName,
		area: hierarchy.target.name,
		province: hierarchy.province?.name ?? "",
		region: hierarchy.region?.name ?? "",
		national: "Philippines",
	};

	const seriesVisibility: Record<string, boolean> = {
		personal: true,
		area: showLine("area"),
		province: hasProvince && showLine("province"),
		region: hasRegion && showLine("region"),
		national: showLine("national"),
	};

	const yAxisConfig = buildYAxisConfig(trend, currTrend);

	const { wrapperRef, chartRef, tooltipRef } = useTrendChart({
		trend,
		isMobile,
		seriesOrder: SERIES_ORDER,
		seriesLabels,
		seriesVisibility,
		hasProvince,
		hasRegion,
		yAxisConfig,
	});

	const legendItems = SERIES_ORDER.filter((key) => {
		if (key === "province" && !hasProvince) return false;
		if (key === "region" && !hasRegion) return false;
		return showLine(key);
	});

	return (
		<div className="relative glass-card py-5 m-0 md:rounded-2xl border-y-2 md:border-2 flex flex-col gap-1 min-h-152.5 h-full">
			{/* Selects */}
			<div className="flex flex-col md:flex-row gap-4 items-center shrink-0 px-5">
				<div className="flex items-center justify-evenly lg:justify-start gap-2 w-full lg:w-fit">
					<p className="text-foreground text-sm sm:text-base">Select Trend:</p>
					<Select value={currTrend} onValueChange={(v) => trendType.set(v as TrendType)}>
						<SelectTrigger className="w-40 h-8 text-foreground border-foreground">
							<SelectValue placeholder="Select..." className="text-ellipsis" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="inflation">Inflation</SelectItem>
							<SelectItem value="cpi">CPI</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center justify-evenly lg:justify-start gap-2 w-full lg:w-fit">
					<p className="text-foreground text-sm sm:text-base">Compare to:</p>
					<Select value={mode} onValueChange={(v) => compareMode.set(v as CompareModeType)}>
						<SelectTrigger className="w-40 h-8 text-foreground border-foreground">
							<SelectValue placeholder="Select..." className="text-ellipsis" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							<SelectItem value="area">{hierarchy.target.name}</SelectItem>
							{hasProvince && <SelectItem value="province">{hierarchy.province!.name}</SelectItem>}
							{hasRegion && <SelectItem value="region">{hierarchy.region!.name}</SelectItem>}
							<SelectItem value="national">Philippines</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Title */}
			<div className="flex items-center justify-center gap-2 text-sm sm:text-base shrink-0 px-5">
				<div className="text-primary flex items-center gap-2">
					<TrendingUp className="h-5 w-5" />
					<h3 className="font-bold uppercase tracking-wide">
						{currTrend === "inflation" ? "Inflation" : "CPI"} Trends
					</h3>
				</div>
				<p className="font-semibold uppercase text-foreground text-center md:whitespace-nowrap">
					: {startDateStr} to {endDateStr}
				</p>
			</div>

			{/* Chart — wrapper drives responsive sizing, chartRef fills it absolutely */}
			<div ref={wrapperRef} className="flex-1 w-full relative min-h-80">
				<div ref={chartRef} className="absolute inset-0" />
				<div
					ref={tooltipRef}
					className="max-w-lg pointer-events-none absolute z-10 hidden rounded-xl border px-3 py-2 shadow-lg text-sm"
					style={{
						backgroundColor: "hsl(var(--card))",
						borderColor: "hsl(var(--border))",
					}}
				/>
			</div>

			<TrendLegend legendItems={legendItems} seriesLabels={seriesLabels} isMobile={isMobile} />
		</div>
	);
}
