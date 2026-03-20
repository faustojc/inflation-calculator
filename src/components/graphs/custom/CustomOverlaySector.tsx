import { activeSlice, sliceId } from "@/stores/graphStore";
import { NEG_STROKE_COLOR } from "@/utils/metadata";
import { useStore } from "@nanostores/react";

interface Props {
	path: string;
	type: string;
	code: string;
	negIdx: number;
	value: number;
	originalShare: number;
	patternPrefix: string;
}

export default function CustomOverlaySector({ path, type, code, negIdx, originalShare, patternPrefix }: Props) {
	const currSlice = useStore(activeSlice);
	const chartPrefix = patternPrefix.charAt(0);

	if (type === "filler") {
		return <path d={path} fill="transparent" stroke="none" style={{ pointerEvents: "none" }} />;
	}

	const id = sliceId(code, originalShare);
	const fullId = chartPrefix + id;
	const isSelected = currSlice === fullId;
	const isAnyInThisChartSelected = currSlice?.startsWith(chartPrefix);

	return (
		<path
			d={path}
			fill={`url(#${patternPrefix}-hatch-${negIdx})`}
			stroke={NEG_STROKE_COLOR}
			strokeWidth={2}
			strokeDasharray="6 3"
			onClick={() => activeSlice.set(fullId)}
			onMouseEnter={() => activeSlice.set(fullId)}
			onMouseLeave={() => activeSlice.set(null)}
			style={{
				opacity: isAnyInThisChartSelected && !isSelected ? 0.1 : 1,
				transition: "opacity 0.2s ease-in-out",
				cursor: "pointer",
				// overlayFlareIn: red glow that fades out on entry (backwards = revert to inline opacity after done)
				// marchDashes: continuous marching-ants stroke, starts after flare-in settles
				animation: `overlayFlareIn 0.6s ease-out ${negIdx * 0.1}s backwards, marchDashes 0.8s linear ${negIdx * 0.1 + 0.6}s infinite`,
			}}
		/>
	);
}
