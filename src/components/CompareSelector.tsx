import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setCompareOfficial } from "@/stores/graphStore";
import type { ContributionFactor } from "@/utils/inflationCompute";

const CompareSelector = ({
	selectedComparison,
	comparisons,
}: {
	selectedComparison?: ContributionFactor;
	comparisons: ContributionFactor[];
}) => {
	const setCompare = (factorName: string) => {
		const official = comparisons.find((f) => f.factorName === factorName);
		if (official) {
			setCompareOfficial(official);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<p className="text-foreground text-sm whitespace-nowrap">Compare to:</p>
			<Select value={selectedComparison?.factorName ?? ""} onValueChange={(v) => setCompare(v)}>
				<SelectTrigger className="w-44 h-8 text-foreground border-foreground">
					<SelectValue placeholder="Select area..." />
				</SelectTrigger>
				<SelectContent>
					{comparisons.map((opt) => (
						<SelectItem key={opt.factorName} value={opt.factorName}>
							{opt.factorName.toLowerCase() === "city/mun" ? opt.areaName : opt.areaName}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};

export default CompareSelector;
