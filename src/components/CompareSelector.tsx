import { For } from "solid-js";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/primitives/select";
import { setCompareOfficial } from "@/stores/graphStore";
import type { ContributionFactor } from "@/utils/inflationCompute";

const CompareSelector = (props: {
	selectedComparison?: ContributionFactor;
	comparisons: ContributionFactor[];
}) => {
	const setCompare = (factorName: string) => {
		const official = props.comparisons.find((f) => f.factorName === factorName);
		if (official) {
			setCompareOfficial(official);
		}
	};

	return (
		<div class="flex items-center gap-2">
			<p class="text-foreground text-sm whitespace-nowrap">Compare to:</p>
			<Select value={props.selectedComparison?.factorName ?? ""} onValueChange={(v) => setCompare(v)}>
				<SelectTrigger class="w-44 h-8 text-foreground border-foreground">
					<SelectValue placeholder="Select area..." />
				</SelectTrigger>
				<SelectContent>
					<For each={props.comparisons}>
						{(opt) => <SelectItem value={opt.factorName}>{opt.areaName}</SelectItem>}
					</For>
				</SelectContent>
			</Select>
		</div>
	);
};

export default CompareSelector;
