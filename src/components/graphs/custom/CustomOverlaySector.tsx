import { activeSlice, sliceId } from "@/stores/graphStore";
import { NEG_STROKE_COLOR } from "@/utils/metadata";
import { useStore } from "@nanostores/react";
import { Sector, type PieSectorShapeProps } from "recharts";

export default function CustomOverlaySector(
	props: PieSectorShapeProps & {
		code?: string;
		type?: string;
		negIdx?: number;
		value?: number;
		patternPrefix?: string;
		originalShare?: number;
	},
) {
	const currSlice = useStore(activeSlice);
	const code = props.code || "";
	const type = props.type || "";
	const value = props.value ?? 0;
	const originalShare = props.originalShare ?? -value;
	const patternPrefix = props.patternPrefix || "";
	const chartPrefix = patternPrefix.charAt(0);

	if (type === "filler") {
		return <Sector {...props} fill="transparent" stroke="none" style={{ pointerEvents: "none" }} />;
	}

	const id = sliceId(code, originalShare);
	const fullId = chartPrefix + id;
	const isSelected = currSlice === fullId;
	const isAnyInThisChartSelected = currSlice?.startsWith(chartPrefix);

	const onSetActiveSlice = () => {
		activeSlice.set(fullId);
	};
	const onMouseLeave = () => {
		activeSlice.set(null);
	};

	return (
		<Sector
			{...props}
			onClick={onSetActiveSlice}
			onMouseEnter={onSetActiveSlice}
			onMouseLeave={onMouseLeave}
			fill={`url(#${patternPrefix}-hatch-${props.negIdx})`}
			stroke={NEG_STROKE_COLOR}
			strokeWidth={2}
			strokeDasharray="6 3"
			style={{
				opacity: isAnyInThisChartSelected && !isSelected ? 0.1 : 1,
				transition: "opacity 0.2s ease-in-out",
				cursor: "pointer",
			}}
		/>
	);
}
