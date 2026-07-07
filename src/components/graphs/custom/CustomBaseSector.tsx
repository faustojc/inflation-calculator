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

export default function CustomBaseSector(props: Props) {
	const chartPrefix = () => props.patternPrefix.charAt(0);
	const fullId = () => chartPrefix() + sliceId(props.code, props.originalShare);

	const isSelected = () => activeSlice.get() === fullId();
	const isAnyInThisChartSelected = () => activeSlice.get()?.startsWith(chartPrefix());

	return (
		<path
			d={props.path}
			fill={getColor(props.code, props.index)}
			onClick={() => activeSlice.set(fullId())}
			onMouseEnter={() => activeSlice.set(fullId())}
			onMouseLeave={() => activeSlice.set(null)}
			style={{
				"fill-opacity": isAnyInThisChartSelected() && !isSelected() ? 0.1 : 1,
				transition: "fill-opacity 0.2s ease-in-out",
				cursor: "pointer",
			}}
		/>
	);
}
