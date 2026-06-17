import { use$ } from "@legendapp/state/react";
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

const CustomPositiveLabel = ({
	cx,
	cy,
	outerRadius,
	payload,
	chartId,
	basePie,
	overlayPie,
}: CustomLabelProps) => {
	const currSlice = use$(activeSlice);

	if (payload.originalShare === 0) return null;
	if (!chartId || !basePie || !overlayPie) return null;

	const chartPrefix = chartId.charAt(0);
	const fullId = chartPrefix + sliceId(payload.code, payload.originalShare);
	const isSelected = currSlice === fullId;
	const isAnyInThisChartSelected = currSlice?.startsWith(chartPrefix);

	const layout = getSmartLabelLayout(chartId, basePie, overlayPie, cx, cy, outerRadius);
	const pos = layout.get(`p_${payload.code}`);
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
