import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ContributionFactor } from "@/utils/inflationCompute";

const CompareSelector = ({
	selectedComparison,
	comparisonOptions,
	setSelectedFactorName,
}: {
	selectedComparison?: ContributionFactor;
	comparisonOptions: { factorName: string; areaName: string }[];
	setSelectedFactorName: (name: string) => void;
}) => {
	return (
		<div className="flex items-center gap-2">
			<p className="text-foreground text-sm whitespace-nowrap">Compare to:</p>
			<Select value={selectedComparison?.factorName ?? ""} onValueChange={(v) => setSelectedFactorName(v)}>
				<SelectTrigger className="w-44 h-8 text-foreground border-foreground">
					<SelectValue placeholder="Select area..." />
				</SelectTrigger>
				<SelectContent>
					{comparisonOptions.map((opt) => (
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
