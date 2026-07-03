import { Select } from "@/components/Select";
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

	const options = () => props.comparisons.map((opt) => ({ value: opt.factorName, label: opt.areaName }));

	return (
		<div class="flex items-center gap-2">
			<p class="text-foreground text-sm whitespace-nowrap">Compare to:</p>
			<Select
				value={props.selectedComparison?.factorName ?? ""}
				onValueChange={setCompare}
				placeholder="Select area..."
				options={options()}
				class="w-44 h-8 text-foreground border-foreground"
			/>
		</div>
	);
};

export default CompareSelector;
