import { activeSlice, sliceId } from "@/stores/graphStore";
import { useStore } from "@nanostores/react";
import { useCallback } from "react";

export interface LegendItem {
	code: string;
	name: string;
	color: string;
	value: number;
}

const CustomPieLegend = ({ props, patternPrefix }: { props: readonly LegendItem[]; patternPrefix?: string }) => {
	const currSlice = useStore(activeSlice);
	const chartPrefix = patternPrefix?.charAt(0) || "";

	const setActiveSlice = useCallback(
		(code: string, value: number) => {
			if (value === 0) return;
			const id = sliceId(code, value);
			activeSlice.set(chartPrefix + id);
		},
		[chartPrefix],
	);
	const onMouseLeave = useCallback(() => activeSlice.set(null), []);

	return (
		<ul className="flex flex-col text-sm text-muted-foreground">
			{props.map((entry) => {
				const id = sliceId(entry.code, entry.value);
				const fullId = chartPrefix + id;
				const isActive = fullId === currSlice && entry.value !== 0;
				const isAnyInThisChartSelected = currSlice?.startsWith(chartPrefix);

				return (
					<li
						key={entry.code}
						className="flex items-center gap-2 py-1 transition-opacity duration-200"
						style={{ opacity: isAnyInThisChartSelected && !isActive ? 0.3 : 1 }}
						onClick={() => setActiveSlice(entry.code, entry.value)}
						onMouseOver={() => setActiveSlice(entry.code, entry.value)}
						onMouseLeave={onMouseLeave}
					>
						<span className={`text-xs text-muted-foreground w-5 shrink-0 ${isActive ? "font-bold" : ""}`}>
							{entry.code}
						</span>
						<span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
						<span className={`text-wrap ${isActive ? "font-bold" : ""}`}>
							{entry.name}
							<strong className={`ml-1 text-nowrap ${entry.value < 0 ? "text-destructive" : "text-primary"}`}>
								{entry.value.toFixed(1)}%
							</strong>
						</span>
					</li>
				);
			})}
		</ul>
	);
};

export default CustomPieLegend;
