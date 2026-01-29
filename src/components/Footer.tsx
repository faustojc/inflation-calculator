import CalculationFooter from "@/components/CalculationFooter";
import { Button } from "@/components/ui/button";
import { dataStore, getAreaHierarchy, getCalculationData } from "@/stores/dataStore";
import { calculationResult, expenses, isCalculationDisabled, mode, settings, totalAllocation } from "@/stores/inflationStore";
import { calculatePersonalInflation } from "@/utils/inflationCompute";
import { useStore } from "@nanostores/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Footer = () => {
	const [isCalculating, setIsCalculating] = useState(false);

	const isDisabled = useStore(isCalculationDisabled);

	const handleCalculate = async () => {
		setIsCalculating(true);

		try {
			const { areaKey, startDate } = settings.get();
			const currentMode = mode.get();
			const currentTotalAlloc = totalAllocation.get();
			const items = Object.values(expenses.get());

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

			const hierarchy = getAreaHierarchy(areaKey);
			const { areaYearsMap } = dataStore.get();
			const areaAvailableYears = areaYearsMap[hierarchy.target.key] || [];

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

			const uniqueKeys = new Set([hierarchy.target.key, hierarchy.province?.key, hierarchy.region?.key, hierarchy.national?.key]);
			const keysToFetch = Array.from(uniqueKeys).filter(Boolean) as string[];
			const batchMap = await getCalculationData(keysToFetch, dates.startYear - 1, dates.endYear);
			const result = calculatePersonalInflation(items, { hierarchy }, dates, { mode: currentMode, totalInput: currentTotalAlloc }, batchMap);

			if (result?.missingItems && result.missingItems.length > 0) {
				calculationResult.set({ show: false, data: null });

				const missingList = result.missingItems.slice(0, 3).join(" | ");
				const suffix = result.missingItems.length > 3 ? "..." : "";

				toast("Cannot calculate", {
					description: `Data missing for ${missingList}${suffix}. Please remove these items or choose a different date.`,
					action: {
						label: "X",
						onClick() {
							toast.dismiss();
						},
					},
				});

				return;
			}

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
		<footer className="sticky bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 transition-all">
			<div className="max-w-3xl mx-auto">
				<CalculationFooter />
				<Button
					size="lg"
					onClick={handleCalculate}
					disabled={isCalculating || isDisabled}
					className="w-full text-base uppercase font-bold h-12 shadow-xl transition-all active:scale-[0.98] bg-blue-500"
				>
					{isCalculating ?
						<>
							<Loader2 className="mr-2 h-5 w-5 animate-spin" />
							Calculating...
						</>
					:	"Calculate"}
				</Button>
			</div>
		</footer>
	);
};

export default Footer;
