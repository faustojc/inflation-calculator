import { Info } from "lucide-solid";
import type { JSX } from "solid-js";

const AnalysisTab = ({ interpretation }: { interpretation: JSX.Element[] }) => {
	return (
		<div class="glass-card p-5">
			<div class="flex items-center gap-2 mb-3">
				<Info class="h-4 w-4 text-primary" />
				<h3 class="font-bold uppercase tracking-wide text-base text-foreground">Analysis</h3>
			</div>
			<ul class="list-disc list-inside space-y-2 text-justify">
				{interpretation.map((p) => (
					<li class="text-base leading-relaxed text-foreground">{p}</li>
				))}
			</ul>
		</div>
	);
};

export default AnalysisTab;
