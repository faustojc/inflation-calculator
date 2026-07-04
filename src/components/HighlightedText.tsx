import { type JSX, Show } from "solid-js";

const HighlightedText = (props: { text: string; ranges: [number, number][] }) => {
	const parts = () => {
		const acc: JSX.Element[] = [];
		let lastIdx = 0;

		for (const [start, end] of props.ranges) {
			if (start > lastIdx) {
				acc.push(<span>{props.text.slice(lastIdx, start)}</span>);
			}
			acc.push(
				<mark class="bg-primary/20 text-blue-600 dark:text-blue-400 font-semibold rounded-sm px-0.5">
					{props.text.slice(start, end)}
				</mark>,
			);
			lastIdx = end;
		}

		if (lastIdx < props.text.length) {
			acc.push(<span>{props.text.slice(lastIdx)}</span>);
		}

		return acc;
	};

	return (
		<Show when={props.ranges.length > 0} fallback={<>{props.text}</>}>
			{parts()}
		</Show>
	);
};

export default HighlightedText;
