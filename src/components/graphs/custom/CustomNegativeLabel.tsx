import type { CustomLabelProps } from "@/components/graphs/custom/CustomPositiveLabel";
import type { PieEntry } from "@/lib/types";
import { activeSlice, sliceId } from "@/stores/graphStore";
import { getSmartLabelLayout } from "@/utils/labelLayoutUtility";
import { getColor } from "@/utils/metadata";
import { useStore } from "@nanostores/react";

const CustomNegativeLabel = (props: CustomLabelProps) => {
	const { cx, cy, outerRadius, payload, chartId, basePie, overlayPie, index } = props;
	const entry = payload as PieEntry;
	const currSlice = useStore(activeSlice);

	if (entry.originalShare === 0 || entry.type === "filler") return null;
	if (!chartId || !basePie || !overlayPie) return null;

	const chartPrefix = chartId.charAt(0);
	const fullId = chartPrefix + sliceId(entry.code, entry.originalShare);
	const isSelected = currSlice === fullId;
	const isAnyInThisChartSelected = currSlice?.startsWith(chartPrefix);

	const layout = getSmartLabelLayout(chartId, basePie, overlayPie, cx as number, cy as number, outerRadius as number);
	const pos = layout.get("n_" + entry.code);
	if (!pos) return null;

	const { sx, sy, ex, ey, cos, textAnchor } = pos;

	return (
		<g
			style={{
				opacity: isAnyInThisChartSelected && !isSelected ? 0.2 : 1,
				transition: "opacity 0.2s ease-in-out",
			}}
		>
			<path d={`M${sx},${sy} L${ex},${ey}`} className="stroke-destructive text-destructive" stroke="#DC2626" fill="none" />
			{overlayPie[index] && (
				<rect x={ex - 4} y={ey - 4} width={9} height={9} fill={getColor(overlayPie[index].code, index)} />
			)}
			<text
				x={ex + (cos >= 0 ? 1 : -1) * 6}
				y={ey}
				fill="#f23f1f"
				textAnchor={textAnchor}
				dominantBaseline="central"
				className={`text-xs sm:text-sm font-semibold text-destructive ${isSelected ? "text-base sm:text-lg" : ""}`}
				style={{ transition: "font-size 0.2s ease-in-out" }}
			>
				{`${entry.originalShare.toFixed(1)}%`}
			</text>
		</g>
	);
};

export default CustomNegativeLabel;
