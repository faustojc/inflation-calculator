import { Show } from "solid-js";
import { activeSlice, sliceId } from "@/stores/graphStore";
import { NEG_STROKE_COLOR } from "@/utils/metadata";

interface Props {
	path: string;
	type: string;
	code: string;
	negIdx: number;
	value: number;
	originalShare: number;
	patternPrefix: string;
}

export default function CustomOverlaySector({
	path,
	type,
	code,
	negIdx,
	originalShare,
	patternPrefix,
}: Props) {
	const chartPrefix = patternPrefix.charAt(0);

	const id = sliceId(code, originalShare);
	const fullId = chartPrefix + id;
	const isSelected = () => activeSlice.get() === fullId;
	const isAnyInThisChartSelected = () => activeSlice.get()?.startsWith(chartPrefix);

	return (
		<Show
			when={type !== "filler"}
			fallback={<path d={path} fill="transparent" stroke="none" style={{ "pointer-events": "none" }} />}
		>
			<path
				d={path}
				fill={`url(#${patternPrefix}-hatch-${negIdx})`}
				stroke={NEG_STROKE_COLOR}
				stroke-width={2}
				stroke-dasharray="6 3"
				onClick={() => activeSlice.set(fullId)}
				onMouseEnter={() => activeSlice.set(fullId)}
				onMouseLeave={() => activeSlice.set(null)}
				style={{
					opacity: isAnyInThisChartSelected() && !isSelected() ? 0.1 : 1,
					transition: "opacity 0.2s ease-in-out",
					cursor: "pointer",
					// overlayFlareIn: red glow that fades out on entry (backwards = revert to inline opacity after done)
					// marchDashes: continuous marching-ants stroke, starts after flare-in settles
					animation: `overlayFlareIn 0.6s ease-out ${negIdx * 0.1}s backwards, marchDashes 0.8s linear ${negIdx * 0.1 + 0.6}s infinite`,
				}}
			/>
		</Show>
	);
}
