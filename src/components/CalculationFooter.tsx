import { useStore } from "@nanostores/react";
import { Progress } from "@/components/ui/progress";
import { mode, totalAllocation } from "@/stores/inflationStore";

const CalculationFooter = () => {
	const currentTotal = useStore(totalAllocation);
	const m = useStore(mode);

	const remainingPercent = m === "percent" ? 100 - currentTotal : 0;
	const isOverLimit = m === "percent" && currentTotal > 100;

	if (m === "percent") {
		return (
			<div className="mb-3 space-y-1.5">
				<div className="flex justify-between items-center">
					<span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
						Total Allocation
					</span>
					<span
						className={`text-sm font-bold tabular-nums ${isOverLimit ? "text-destructive" : "text-primary"}`}
					>
						{currentTotal.toFixed(1)}% / 100%
					</span>
				</div>
				<Progress
					value={Math.min(currentTotal, 100)}
					className={`h-1.5 ${isOverLimit ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}`}
				/>
				{isOverLimit && (
					<p className="text-destructive text-xs font-medium">
						Total exceeds 100%. Please reduce some values.
					</p>
				)}
				{remainingPercent > 0 && (
					<p className="text-muted-foreground text-xs">{remainingPercent.toFixed(1)}% remaining</p>
				)}
			</div>
		);
	}

	return (
		<div className="mb-3">
			<div className="flex justify-between items-center">
				<span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
					Total Monthly Expense
				</span>
				<span className="text-sm font-bold text-primary tabular-nums">
					PhP {currentTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
				</span>
			</div>
		</div>
	);
};

export default CalculationFooter;
