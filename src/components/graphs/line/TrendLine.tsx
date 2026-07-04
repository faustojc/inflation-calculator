import { TrendingUp } from "lucide-solid";
import { createMemo } from "solid-js";
import { TrendLegend } from "@/components/graphs/line/TrendLegend";
import { Select } from "@/components/Select";
import { useIsMobile } from "@/hooks/use-mobile";
import { createTrendChart } from "@/hooks/useTrendChart";
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

export default function TrendLine(props: Readonly<Props>) {
	const mode = () => compareMode.get();
	const currTrend = () => trendType.get();
	const isMobile = useIsMobile();

	const hierarchy = () => props.meta.location;
	const hasProvince = () => {
		const h = hierarchy();
		return !!h.province && h.province.key !== h.target.key;
	};
	const hasRegion = () => {
		const h = hierarchy();
		return !!h.region && h.region.key !== h.target.key;
	};

	const trend = () => (currTrend() === "inflation" ? props.inflationTrend : props.cpiTrend);
	const currName = () => (currTrend() === "inflation" ? "My Inflation" : "My CPI");

	const showLine = (key: string): boolean => {
		if (key === "personal") return true;
		if (mode() === "all") return true;
		return mode() === key;
	};

	const seriesLabels = createMemo<Record<string, string>>(() => ({
		personal: currName(),
		area: hierarchy().target.name,
		province: hierarchy().province?.name ?? "",
		region: hierarchy().region?.name ?? "",
		national: "Philippines",
	}));

	const seriesVisibility = createMemo<Record<string, boolean>>(() => ({
		personal: true,
		area: showLine("area"),
		province: hasProvince() && showLine("province"),
		region: hasRegion() && showLine("region"),
		national: showLine("national"),
	}));

	const yAxisConfig = createMemo(() => buildYAxisConfig(trend(), currTrend()));

	const { wrapperRef, chartRef, tooltipRef } = createTrendChart({
		trend,
		isMobile,
		seriesOrder: SERIES_ORDER,
		seriesLabels,
		seriesVisibility,
		hasProvince,
		hasRegion,
		yAxisConfig,
	});

	const legendItems = () =>
		SERIES_ORDER.filter((key) => {
			if (key === "province" && !hasProvince()) return false;
			if (key === "region" && !hasRegion()) return false;
			return showLine(key);
		});

	return (
		<div class="relative glass-card py-5 m-0 md:rounded-2xl border-y-2 md:border-2 flex flex-col gap-1 min-h-152.5 h-full">
			{/* Selects */}
			<div class="flex flex-col md:flex-row gap-4 items-center shrink-0 px-5">
				<div class="flex items-center justify-evenly lg:justify-start gap-2 w-full lg:w-fit">
					<p class="text-foreground text-sm sm:text-base text-nowrap">Select Trend:</p>
					<Select
						value={currTrend()}
						onValueChange={(v) => trendType.set(v as TrendType)}
						placeholder="Select..."
						class="w-40 h-8 text-foreground border-foreground"
						options={[
							{ value: "inflation", label: "Inflation" },
							{ value: "cpi", label: "CPI" },
						]}
					/>
				</div>

				<div class="flex items-center justify-evenly lg:justify-start gap-2 w-full lg:w-fit">
					<p class="text-foreground text-sm sm:text-base text-nowrap">Compare to:</p>
					<Select
						value={mode()}
						onValueChange={(v) => compareMode.set(v as CompareModeType)}
						placeholder="Select..."
						class="w-40 h-8 text-foreground border-foreground"
						options={[
							{ value: "all", label: "All" },
							{ value: "area", label: hierarchy().target.name },
							...(hasProvince()
								? [{ value: "province", label: hierarchy().province?.name ?? "Province" }]
								: []),
							...(hasRegion() ? [{ value: "region", label: hierarchy().region?.name ?? "Region" }] : []),
							{ value: "national", label: "Philippines" },
						]}
					/>
				</div>
			</div>

			{/* Title */}
			<div class="flex items-center justify-center gap-2 text-sm sm:text-base shrink-0 px-5">
				<div class="text-primary flex items-center gap-2">
					<TrendingUp class="h-5 w-5" />
					<h3 class="font-bold uppercase tracking-wide">
						{currTrend() === "inflation" ? "Inflation" : "CPI"} Trends
					</h3>
				</div>
				<p class="font-semibold uppercase text-foreground text-center md:whitespace-nowrap">
					: {props.startDateStr} to {props.endDateStr}
				</p>
			</div>

			{/* Chart — wrapper drives responsive sizing, chartRef fills it absolutely */}
			<div ref={(el) => (wrapperRef.current = el)} class="flex-1 w-full relative min-h-80">
				<div ref={(el) => (chartRef.current = el)} class="absolute inset-0" />
				<div
					ref={(el) => (tooltipRef.current = el)}
					class="max-w-lg pointer-events-none absolute z-10 hidden rounded-xl border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content shadow-lg"
				/>
			</div>

			<TrendLegend legendItems={legendItems()} seriesLabels={seriesLabels()} isMobile={isMobile()} />
		</div>
	);
}
