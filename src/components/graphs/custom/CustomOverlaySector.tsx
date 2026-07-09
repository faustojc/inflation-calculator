import { activeSlice, sliceId } from "@/stores/graphStore";
import { NEG_STROKE_COLOR } from "@/utils/metadata";
import { Show } from "solid-js";

interface Props {
	path: string;
	type: string;
	code: string;
	negIdx: number;
	value: number;
	originalShare: number;
	patternPrefix: string;
}

export default function CustomOverlaySector(props: Props) {
	const chartPrefix = () => props.patternPrefix.charAt(0);
	const fullId = () => chartPrefix() + sliceId(props.code, props.originalShare);
	const isSelected = () => activeSlice.get() === fullId();
	const isChartSelected = () => activeSlice.get()?.startsWith(chartPrefix());

	return (
		<Show
			when={props.type !== "filler"}
			fallback={<path d={props.path} fill="transparent" stroke="none" class="pointer-events-none" />}
		>
			<path
				d={props.path}
				fill={`url(#${props.patternPrefix}-hatch-${props.negIdx})`}
				stroke={NEG_STROKE_COLOR}
				stroke-width={2}
				stroke-dasharray="6 3"
				onClick={() => activeSlice.set(fullId())}
				onMouseEnter={() => activeSlice.set(fullId())}
				onMouseLeave={() => activeSlice.set(null)}
				class={`overlay-sector cursor-pointer transition-opacity duration-200 ease-in-out ${
					isChartSelected() && !isSelected() ? "opacity-10" : "opacity-100"
				}`.replace(/\s+/g, " ")}
			/>
		</Show>
	);
}
