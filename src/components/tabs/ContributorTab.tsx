import { useStore } from "@nanostores/react";
import { lazy, Suspense, useState } from "react";
import ChartSelector from "@/components/ChartSelector";
import CompareSelector from "@/components/CompareSelector";
import { ContributorTable } from "@/components/ContributorTable";
import { compareOfficial } from "@/stores/graphStore";
import type { ContributionFactor } from "@/utils/inflationCompute";

const ContribInflationPie = lazy(() => import("@/components/graphs/pie/ContribInflationPie"));

const ContributorTab = ({ contributors }: { contributors: ContributionFactor[] }) => {
	const comparison = useStore(compareOfficial);
	const [chartType, setChartType] = useState<"table" | "pie">("table");

	const personal = contributors[0]!;
	const comparisons = contributors.slice(1);

	return (
		<div className="glass-card p-4 space-y-4">
			<div>
				<h3 className="font-bold uppercase tracking-wide text-sm sm:text-base text-foreground">
					Major Contributors to Inflation
				</h3>
				<p className="text-sm text-foreground mb-3">
					Top 3 commodity groups that had the biggest impact on your personal inflation rate and how they
					compare to other areas.
				</p>
			</div>

			<div className="flex flex-wrap items-center justify-between md:justify-start gap-2 md:gap-4">
				<CompareSelector selectedComparison={comparison} comparisons={comparisons} />
				<ChartSelector chartType={chartType} setChartType={setChartType} />
			</div>

			{chartType === "table" ? (
				<ContributorTable personal={personal} official={comparison!} />
			) : (
				<Suspense fallback={<div className="h-80 rounded-lg bg-muted/40 animate-pulse" />}>
					<ContribInflationPie personal={personal} official={comparison!} />
				</Suspense>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-1 border-t border-border pt-3">
				<div className="space-y-1">
					<p className="text-base font-bold text-primary uppercase tracking-wider">% Weight</p>
					<p className="text-sm text-muted-foreground leading-snug">
						The percentage of the commodity group's weight relative to the total weight of all items. ALL
						ITEMS always has a 100% weight.
					</p>
				</div>
				<div className="space-y-1">
					<p className="text-base font-bold text-primary uppercase tracking-wider">Inflation Rate</p>
					<p className="text-sm text-muted-foreground leading-snug">
						The year-on-year price change for the commodity group. A positive rate means prices
						increased; a negative rate means they decreased.
					</p>
				</div>
				<div className="space-y-1">
					<p className="text-base font-bold text-primary uppercase tracking-wider">
						%Share to Inflation
					</p>
					<p className="text-sm text-muted-foreground leading-snug">
						The contribution of the commodity group to the total inflation rate. It shows how much of the
						overall inflation is attributable to this category.
					</p>
				</div>
			</div>
		</div>
	);
};

export default ContributorTab;
