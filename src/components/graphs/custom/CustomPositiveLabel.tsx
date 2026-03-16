import type { PieEntry } from "@/lib/types";
import { activeSlice, sliceId } from "@/stores/graphStore";
import { getSmartLabelLayout } from "@/utils/labelLayoutUtility";
import { useStore } from "@nanostores/react";
import type { PieLabelRenderProps } from "recharts";

export interface CustomLabelProps extends PieLabelRenderProps {
	chartId?: string;
	basePie?: PieEntry[];
	overlayPie?: PieEntry[];
}

const CustomPositiveLabel = (props: CustomLabelProps) => {
	const { cx, cy, outerRadius, payload, chartId, basePie, overlayPie } = props as CustomLabelProps & {
		payload: PieEntry;
	};
	const currSlice = useStore(activeSlice);

	if (payload.originalShare === 0) return null;
	if (!chartId || !basePie || !overlayPie) return null;

	const chartPrefix = chartId.charAt(0);
	const fullId = chartPrefix + sliceId(payload.code, payload.originalShare);
	const isSelected = currSlice === fullId;
	const isAnyInThisChartSelected = currSlice?.startsWith(chartPrefix);

	const layout = getSmartLabelLayout(chartId, basePie, overlayPie, cx as number, cy as number, outerRadius as number);
	const pos = layout.get("p_" + payload.code);
	if (!pos) return null;

	const { sx, sy, ex, ey, cos, textAnchor } = pos;

	return (
		<g
			style={{
				opacity: isAnyInThisChartSelected && !isSelected ? 0.2 : 1,
				transition: "opacity 0.2s ease-in-out",
			}}
		>
			<path d={`M${sx},${sy} L${ex},${ey}`} className="stroke-foreground" fill="none" />
			<text
				x={ex + (cos >= 0 ? 1 : -1) * 12}
				y={ey}
				textAnchor={textAnchor}
				dominantBaseline="central"
				className={`text-xs sm:text-sm font-semibold fill-foreground ${isSelected ? "text-base sm:text-lg" : ""}`}
				style={{ transition: "font-size 0.2s ease-in-out" }}
			>
				{`${payload.originalShare.toFixed(1)}%`}
			</text>
		</g>
	);
};

export default CustomPositiveLabel;
