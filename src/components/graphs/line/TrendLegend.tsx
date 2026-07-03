import { For } from "solid-js";
import { SERIES_COLORS } from "@/utils/trendChartUtils";

interface Props {
	legendItems: string[];
	seriesLabels: Record<string, string>;
	isMobile: boolean;
}

export function TrendLegend(props: Props) {
	return (
		<div class="flex flex-wrap justify-center gap-x-5 gap-y-1 px-5 pb-1 text-[18px]">
			<For each={props.legendItems}>
				{(key) => {
					const color =
						key === "personal"
							? "var(--color-primary)"
							: (SERIES_COLORS[key as keyof typeof SERIES_COLORS] ?? "#888");
					const isDashed = key !== "personal";
					return (
						<span class="flex items-center gap-1.5 mr-2.5 md:mr-7.5">
							<svg width="24" height="10" class="shrink-0">
								<title>{props.seriesLabels[key] ?? key}</title>
								<line
									x1="0"
									y1="5"
									x2="24"
									y2="5"
									stroke={color}
									stroke-width={key === "personal" ? 3.5 : 2}
									stroke-dasharray={isDashed ? (props.isMobile ? "4 4" : "8 8") : undefined}
								/>
							</svg>
							<span style={{ color: color }}>{props.seriesLabels[key] ?? key}</span>
						</span>
					);
				}}
			</For>
		</div>
	);
}
