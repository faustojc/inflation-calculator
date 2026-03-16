import { activeSlice, sliceId } from "@/stores/graphStore";
import { getColor } from "@/utils/metadata";
import { useStore } from "@nanostores/react";
import { Sector, type PieSectorShapeProps } from "recharts";

export default function CustomBaseSector(
	props: PieSectorShapeProps & {
		code?: string;
		value?: number;
		index?: number;
		originalShare?: number;
		patternPrefix?: string;
	},
) {
	const currSlice = useStore(activeSlice);
	const code = props.code || "";
	const index = props.index ?? 0;
	const value = props.value ?? 0;
	const originalShare = props.originalShare ?? value;
	const patternPrefix = props.patternPrefix || "";
	const chartPrefix = patternPrefix.charAt(0);

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
			fill={getColor(code, index)}
			style={{
				fillOpacity: isAnyInThisChartSelected && !isSelected ? 0.1 : 1,
				transition: "fill-opacity 0.2s ease-in-out",
				cursor: "pointer",
			}}
		/>
	);
}
