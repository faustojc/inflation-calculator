import CalculationFooter from "@/components/CalculationFooter";
import { Button } from "@/components/ui/button";
import { dataStore, getAreaHierarchy, getCalculationData, getWeights } from "@/stores/dataStore";
import {
	activeTab,
	calculationResult,
	detailedExpenses,
	generalExpenses,
	isCalculationDisabled,
	mode,
	settings,
	totalAllocation,
} from "@/stores/inflationStore";
import { calculatePersonalInflation } from "@/utils/inflationCompute";
import { useStore } from "@nanostores/react";
import { Calculator, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Footer = () => {
	const [isCalculating, setIsCalculating] = useState(false);

	const isDisabled = useStore(isCalculationDisabled);

	const handleCalculate = async () => {
		setIsCalculating(true);

		try {
			const { area, startDate, incomeClass } = settings.get();
			const currentMode = mode.get();
			const currentTotalAlloc = totalAllocation.get();
			const currentTab = activeTab.get();
			const items = Object.values(currentTab === "general" ? generalExpenses.get() : detailedExpenses.get());

			const targetYear = startDate.getFullYear();
			const targetMonth = startDate.getMonth() + 1;
			const baseYear = targetYear - 1;
			const baseMonth = targetMonth;

			const dates = {
				startYear: baseYear,
				startMonth: baseMonth,
				endYear: targetYear,
				endMonth: targetMonth,
			};

			const activeCodes = items.filter((i) => i.value > 0).map((i) => i.code);
			if (activeCodes.length === 0) throw new Error("No expenses entered.");

			const hierarchy = getAreaHierarchy(area.key);
			const { currentManifest } = dataStore.get();
			const dataType = currentTab === "general" ? "official" : "personal";

			const areaAvailableYears = currentManifest?.dates
				? Object.keys(currentManifest.dates[dataType][incomeClass]).map(Number)
				: [];

			if (areaAvailableYears.length > 0) {
				const missingYears: number[] = [];
				if (!areaAvailableYears.includes(targetYear)) missingYears.push(targetYear);
				if (!areaAvailableYears.includes(baseYear)) missingYears.push(baseYear);

				if (missingYears.length > 0) {
					toast.warning(`No CPI data for ${hierarchy.target.name}`, {
						description: `This area has no recorded data for ${missingYears.join(" and ")}. Please select a different year or area.`,
					});
					return;
				}
			}

			const uniqueKeys = new Set([
				hierarchy.target.key,
				hierarchy.province?.key,
				hierarchy.region?.key,
				hierarchy.national?.key,
			]);
			const keysToFetch = Array.from(uniqueKeys).filter(Boolean) as string[];

			const [batchMap, weightsMap] = await Promise.all([
				getCalculationData(keysToFetch, incomeClass, dates.startYear - 1, dates.endYear),
				getWeights(keysToFetch, incomeClass),
			]);

			const { commodities } = dataStore.get();
			const majorCategoryNames: Record<string, string> = {};
			commodities.forEach((c) => {
				majorCategoryNames[c.code] = c.name;
			});

			const result = calculatePersonalInflation(
				items,
				{ hierarchy },
				dates,
				{ mode: currentMode, totalInput: currentTotalAlloc },
				batchMap,
				weightsMap,
				majorCategoryNames,
				dataType,
			);

			if (result) {
				calculationResult.set({ show: true, data: result });
			} else {
				toast.error("Calculation failed. Please check inputs.");
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			console.error(err);
			toast.error(err.message || "Calculation failed.");
		} finally {
			setIsCalculating(false);
		}
	};

	return (
		<footer className="sticky bottom-0 left-0 right-0 z-50 bg-card/95 border-t border-border">
			<div className="max-w-5xl mx-auto px-4 py-3">
				<CalculationFooter />
				<Button
					size="lg"
					id="calculate-btn"
					onClick={handleCalculate}
					disabled={isCalculating || isDisabled}
					className="text-white w-full text-sm uppercase font-bold h-11 bg-psa-gradient hover:opacity-90 shadow-lg shadow-primary/25 transition-all active:scale-[0.98] cursor-pointer gap-2"
				>
					{isCalculating ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Calculating...
						</>
					) : (
						<>
							<Calculator className="h-4 w-4" />
							Calculate Personal Inflation
						</>
					)}
				</Button>
			</div>
		</footer>
	);
};

export default Footer;
