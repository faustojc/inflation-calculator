import { SERIES_COLORS } from "@/utils/trendChartUtils";

interface Props {
	legendItems: string[];
	seriesLabels: Record<string, string>;
	isMobile: boolean;
}

export function TrendLegend({ legendItems, seriesLabels, isMobile }: Props) {
	return (
		<div className="flex flex-wrap justify-center gap-x-5 gap-y-1 px-5 pb-1 text-[18px]">
			{legendItems.map((key) => {
				const color =
					key === "personal"
						? "hsl(var(--primary))"
						: (SERIES_COLORS[key as keyof typeof SERIES_COLORS] ?? "#888");
				const isDashed = key !== "personal";
				return (
					<span key={key} className="flex items-center gap-1.5 mr-2.5 md:mr-7.5">
						<svg width="24" height="10" className="shrink-0">
							<title>{seriesLabels[key] ?? key}</title>
							<line
								x1="0"
								y1="5"
								x2="24"
								y2="5"
								stroke={color}
								strokeWidth={key === "personal" ? 3.5 : 2}
								strokeDasharray={isDashed ? (isMobile ? "4 4" : "8 8") : undefined}
							/>
						</svg>
						<span style={{ color: color }}>{seriesLabels[key] ?? key}</span>
					</span>
				);
			})}
		</div>
	);
}
