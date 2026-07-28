import { createMemo, Show, splitProps } from "solid-js";
import type { PieEntry } from "@/lib/types";
import { activeSlice, sliceId } from "@/stores/graphStore";
import { getSmartLabelLayout } from "@/utils/labelLayoutUtility";

export interface CustomLabelProps {
	cx: number;
	cy: number;
	outerRadius: number;
	payload: PieEntry;
	chartId: string;
	basePie: PieEntry[];
	overlayPie: PieEntry[];
}

const CustomPositiveLabel = (props: CustomLabelProps) => {
	const [p] = splitProps(props, ["payload", "chartId", "basePie", "overlayPie", "cx", "cy", "outerRadius"]);

	const chartPrefix = createMemo(() => p.chartId.charAt(0));
	const fullId = createMemo(() => chartPrefix() + sliceId(p.payload.code, p.payload.originalShare));

	const isSelected = () => activeSlice.get() === fullId();
	const isAnyInThisChartSelected = () => activeSlice.get()?.startsWith(chartPrefix());
	const layout = createMemo(() =>
		getSmartLabelLayout(p.chartId, p.basePie, p.overlayPie, p.cx, p.cy, p.outerRadius),
	);

	const pos = createMemo(() => layout().get(`p_${p.payload.code}`));
	const shouldShow = createMemo(
		() => p.payload.originalShare > 0 && Boolean(p.chartId) && Boolean(p.basePie) && Boolean(p.overlayPie),
	);

	return (
		<Show when={shouldShow()}>
			<Show when={pos()}>
				{(pos) => (
					<g
						class={`transition-opacity duration-200 ease-in-out ${
							isAnyInThisChartSelected() && !isSelected() ? "opacity-20" : ""
						}`}
					>
						<path
							d={`M${pos().sx},${pos().sy} L${pos().ex},${pos().ey}`}
							class="stroke-foreground"
							fill="none"
						/>

						<text
							x={pos().ex + (pos().cos >= 0 ? 1 : -1) * 12}
							y={pos().ey}
							text-anchor={pos().textAnchor}
							dominant-baseline="central"
							class={`text-xs sm:text-sm font-semibold fill-foreground transition-all duration-200 ease-in-out ${
								isSelected() ? "text-base sm:text-lg" : ""
							}`}
						>
							{`${p.payload.originalShare.toFixed(1)}%`}
						</text>
					</g>
				)}
			</Show>
		</Show>
	);
};

export default CustomPositiveLabel;
