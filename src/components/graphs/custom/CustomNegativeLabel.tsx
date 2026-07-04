import { Show } from "solid-js";
import type { PieEntry } from "@/lib/types";
import { activeSlice, sliceId } from "@/stores/graphStore";
import { getSmartLabelLayout } from "@/utils/labelLayoutUtility";
import { getColor } from "@/utils/metadata";

interface Props {
	cx: number;
	cy: number;
	outerRadius: number;
	payload: PieEntry;
	index: number;
	chartId: string;
	basePie: PieEntry[];
	overlayPie: PieEntry[];
}

const CustomNegativeLabel = (props: Props) => {
	const entry = props.payload;

	if (entry.originalShare === 0 || entry.type === "filler") return null;
	if (!props.chartId || !props.basePie || !props.overlayPie) return null;

	const chartPrefix = props.chartId.charAt(0);
	const fullId = chartPrefix + sliceId(entry.code, entry.originalShare);
	const isSelected = () => activeSlice.get() === fullId;
	const isAnyInThisChartSelected = () => activeSlice.get()?.startsWith(chartPrefix);

	const layout = getSmartLabelLayout(
		props.chartId,
		props.basePie,
		props.overlayPie,
		props.cx,
		props.cy,
		props.outerRadius,
	);
	const pos = layout.get(`n_${entry.code}`);

	return (
		<Show when={pos}>
			{(p) => (
				<g
					style={{
						opacity: isAnyInThisChartSelected() && !isSelected() ? 0.2 : 1,
						transition: "opacity 0.2s ease-in-out",
					}}
				>
					<path
						d={`M${p().sx},${p().sy} L${p().ex},${p().ey}`}
						class="stroke-destructive text-destructive"
						stroke="#DC2626"
						fill="none"
					/>
					<Show when={props.overlayPie[props.index]}>
						{(item) => (
							<rect
								x={p().ex - 4}
								y={p().ey - 4}
								width={9}
								height={9}
								fill={getColor(item().code, props.index)}
							/>
						)}
					</Show>
					<text
						x={p().ex + (p().cos >= 0 ? 1 : -1) * 6}
						y={p().ey}
						fill="#f23f1f"
						text-anchor={p().textAnchor}
						dominant-baseline="central"
						class={`text-xs sm:text-sm font-semibold text-destructive ${isSelected() ? "text-base sm:text-lg" : ""}`}
						style={{ transition: "font-size 0.2s ease-in-out" }}
					>
						{`${entry.originalShare.toFixed(1)}%`}
					</text>
				</g>
			)}
		</Show>
	);
};

export default CustomNegativeLabel;
