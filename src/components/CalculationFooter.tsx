import { Progress } from "@/components/ui/progress";
import { mode, totalAllocation } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";

const CalculationFooter = () => {
	const currentTotal = useStore(totalAllocation);
	const m = useStore(mode);

	const remainingPercent = m === "percent" ? 100 - currentTotal : 0;
	const isOverLimit = m === "percent" && currentTotal > 100;

	if (m === "percent") {
		return (
			<div className="bg-white dark:bg-slate-900 pb-4 border-b mb-4">
				<div className="flex justify-between items-end mb-2">
					<span className="font-medium">Total Allocation</span>
					<span className={`font-bold ${isOverLimit ? "text-red-500" : "text-blue-600"}`}>{currentTotal.toFixed(1)}% / 100%</span>
				</div>
				<Progress value={currentTotal} className={`h-2 ${isOverLimit ? "[&>div]:bg-red-500" : "[&>div]:bg-blue-600"}`} />
				{isOverLimit && <p className="text-red-500 mt-1 font-medium">Total exceeds 100%. Please reduce some values.</p>}
				{remainingPercent > 0 && <p className="text-muted-foreground mt-1">You have {remainingPercent.toFixed(1)}% remaining.</p>}
			</div>
		);
	}

	return (
		<div className="bg-white dark:bg-slate-900 pb-4 border-b mb-4">
			<div className="flex justify-between items-end mb-2">
				<span className="font-medium">Total Monthly Expense</span>
				<span className="font-bold text-blue-600">PhP {currentTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
			</div>
		</div>
	);
};

export default CalculationFooter;
