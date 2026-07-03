import { Show } from "solid-js";
import { Progress } from "@/components/primitives/progress";
import { mode, totalAllocation } from "@/stores/inflationStore";

const CalculationFooter = () => {
	const currentTotal = () => totalAllocation.get();
	const remainingPercent = () => (mode.get() === "percent" ? 100 - currentTotal() : 0);
	const isOverLimit = () => mode.get() === "percent" && currentTotal() > 100;

	return (
		<Show
			when={mode.get() === "percent"}
			fallback={
				<div class="mb-3">
					<div class="flex justify-between items-center">
						<span class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
							Total Monthly Expense
						</span>
						<span class="text-sm font-bold text-primary tabular-nums">
							PhP {currentTotal().toLocaleString(undefined, { maximumFractionDigits: 2 })}
						</span>
					</div>
				</div>
			}
		>
			<div class="mb-3 space-y-1.5">
				<div class="flex justify-between items-center">
					<span class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
						Total Allocation
					</span>
					<span
						class={`text-sm font-bold tabular-nums ${isOverLimit() ? "text-destructive" : "text-primary"}`}
					>
						{currentTotal().toFixed(1)}% / 100%
					</span>
				</div>
				<Progress
					value={Math.min(currentTotal(), 100)}
					class={`h-1.5 ${isOverLimit() ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}`}
				/>
				<Show when={isOverLimit()}>
					<p class="text-destructive text-xs font-medium">Total exceeds 100%. Please reduce some values.</p>
				</Show>
				<Show when={remainingPercent() > 0}>
					<p class="text-muted-foreground text-xs">{remainingPercent().toFixed(1)}% remaining</p>
				</Show>
			</div>
		</Show>
	);
};

export default CalculationFooter;
