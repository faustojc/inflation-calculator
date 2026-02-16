import type { ReactNode } from "react";

const HighlightedText = ({ text, ranges }: { text: string; ranges: [number, number][] }) => {
	if (ranges.length === 0) return <>{text}</>;

	const parts: ReactNode[] = [];
	let lastIdx = 0;

	for (const [start, end] of ranges) {
		if (start > lastIdx) {
			parts.push(<span key={`t-${lastIdx}`}>{text.slice(lastIdx, start)}</span>);
		}
		parts.push(
			<mark key={`m-${start}`} className="bg-primary/20 text-blue-600 dark:text-blue-400 font-semibold rounded-sm px-0.5">
				{text.slice(start, end)}
			</mark>,
		);
		lastIdx = end;
	}

	if (lastIdx < text.length) {
		parts.push(<span key={`t-${lastIdx}`}>{text.slice(lastIdx)}</span>);
	}

	return <>{parts}</>;
};

export default HighlightedText;
