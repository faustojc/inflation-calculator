import { use$ } from "@legendapp/state/react";
import { activeSlice, sliceId } from "@/stores/graphStore";
import { getColor } from "@/utils/metadata";

interface Props {
	path: string;
	code: string;
	index: number;
	value: number;
	originalShare: number;
	patternPrefix: string;
}

export default function CustomBaseSector({ path, code, index, originalShare, patternPrefix }: Props) {
	const currSlice = use$(activeSlice);
	const chartPrefix = patternPrefix.charAt(0);

	const id = sliceId(code, originalShare);
	const fullId = chartPrefix + id;
	const isSelected = currSlice === fullId;
	const isAnyInThisChartSelected = currSlice?.startsWith(chartPrefix);

	return (
		<path
			d={path}
			fill={getColor(code, index)}
			onClick={() => activeSlice.set(fullId)}
			onMouseEnter={() => activeSlice.set(fullId)}
			onMouseLeave={() => activeSlice.set(null)}
			style={{
				fillOpacity: isAnyInThisChartSelected && !isSelected ? 0.1 : 1,
				transition: "fill-opacity 0.2s ease-in-out",
				cursor: "pointer",
			}}
		/>
	);
}
