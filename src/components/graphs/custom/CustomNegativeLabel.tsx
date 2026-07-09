import type { PieEntry } from "@/lib/types";
import { activeSlice, sliceId } from "@/stores/graphStore";
import { getSmartLabelLayout } from "@/utils/labelLayoutUtility";
import { getColor } from "@/utils/metadata";
import { Show } from "solid-js";

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
	const entry = () => props.payload;

	const chartPrefix = () => props.chartId.charAt(0);
	const fullId = () => chartPrefix() + sliceId(entry().code, entry().originalShare);
	const isSelected = () => activeSlice.get() === fullId();
	const isChartSelected = () => activeSlice.get()?.startsWith(chartPrefix());

	const layout = () =>
		getSmartLabelLayout(props.chartId, props.basePie, props.overlayPie, props.cx, props.cy, props.outerRadius);
	const pos = () => layout().get(`n_${entry().code}`);

	const visible = () =>
		entry().originalShare !== 0 && entry().type !== "filler" && !!props.chartId && !!props.basePie && !!props.overlayPie;

	return (
		<Show when={visible() && pos()}>
			{(p) => (
				<g
					class={`transition-opacity duration-200 ease-in-out ${
						isChartSelected() && !isSelected() ? "opacity-20" : "opacity-100"
					}`.replace(/\s+/g, " ")}
				>
					<path
						d={`M${p().sx},${p().sy} L${p().ex},${p().ey}`}
						class="stroke-destructive text-destructive"
						stroke="#DC2626"
						fill="none"
					/>
					<Show when={props.overlayPie[props.index]}>
						{(item) => (
							<rect x={p().ex - 4} y={p().ey - 4} width={9} height={9} fill={getColor(item().code, props.index)} />
						)}
					</Show>
					<text
						x={p().ex + (p().cos >= 0 ? 1 : -1) * 6}
						y={p().ey}
						fill="#f23f1f"
						text-anchor={p().textAnchor}
						dominant-baseline="central"
						class={`text-xs sm:text-sm font-semibold text-destructive transition-[font-size] duration-200 ease-in-out ${isSelected() ? "text-base sm:text-lg" : ""}`}
					>
						{`${entry().originalShare.toFixed(1)}%`}
					</text>
				</g>
			)}
		</Show>
	);
};

export default CustomNegativeLabel;
