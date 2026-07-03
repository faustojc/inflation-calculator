import { For } from "solid-js";
import { activeSlice, sliceId } from "@/stores/graphStore";

export interface LegendItem {
	code: string;
	name: string;
	color: string;
	value: number;
}

const CustomPieLegend = ({
	props,
	patternPrefix,
}: {
	props: readonly LegendItem[];
	patternPrefix?: string;
}) => {
	const chartPrefix = patternPrefix?.charAt(0) || "";

	const setActiveSlice = (code: string, value: number) => {
		if (value >= 0 && value <= 0.099) return;
		const id = sliceId(code, value);
		activeSlice.set(chartPrefix + id);
	};
	const onMouseLeave = () => activeSlice.set(null);

	return (
		<ul class="flex flex-col text-sm text-muted-foreground">
			<For each={props}>
				{(entry) => {
					const fullId = chartPrefix + sliceId(entry.code, entry.value);
					const isActive = () => fullId === activeSlice.get() && entry.value !== 0;
					const isAnyInThisChartSelected = () => activeSlice.get()?.startsWith(chartPrefix);

					return (
						<li
							class="flex items-center gap-2 py-1 transition-opacity duration-200 cursor-pointer"
							style={{ opacity: isAnyInThisChartSelected() && !isActive() ? 0.3 : 1 }}
							onClick={() => setActiveSlice(entry.code, entry.value)}
							onKeyDown={() => setActiveSlice(entry.code, entry.value)}
							onMouseOver={() => setActiveSlice(entry.code, entry.value)}
							onMouseLeave={onMouseLeave}
							onFocus={() => setActiveSlice(entry.code, entry.value)}
						>
							<span class={`text-xs text-muted-foreground w-5 shrink-0 ${isActive() ? "font-bold" : ""}`}>
								{entry.code}
							</span>
							<span
								class="inline-block w-3 h-3 rounded-full shrink-0"
								style={{ "background-color": entry.color }}
							/>
							<span class={`text-wrap ${isActive() ? "font-bold" : ""}`}>
								{entry.name}
								<strong class={`ml-1 text-nowrap ${entry.value < 0 ? "text-destructive" : "text-primary"}`}>
									{entry.value.toFixed(1)}%
								</strong>
							</span>
						</li>
					);
				}}
			</For>
		</ul>
	);
};

export default CustomPieLegend;
