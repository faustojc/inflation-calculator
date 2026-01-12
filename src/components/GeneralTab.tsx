import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { expenses, setGeneralExpense, totalAllocation, uiState } from "@/stores/inflationStore";
import { GENERAL_CATEGORIES } from "@/utils/metadata";
import { useStore } from "@nanostores/react";
import { Info } from "lucide-react";

export function GeneralTab() {
	const items = useStore(expenses);
	const currentTotal = useStore(totalAllocation);
	const { mode, totalBudget } = useStore(uiState);

	const remainingPercent = mode === "percent" ? 100 - currentTotal : 0;
	const isOverLimit = mode === "percent" && currentTotal > 100;

	const handleInputChange = (code: string, name: string, newValue: number) => {
		setGeneralExpense(code, name, newValue);
	};

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
			{/* PERCENTAGE STATUS BAR */}
			{mode === "percent" && (
				<div className="sticky top-0 z-10 bg-white dark:bg-slate-900 pb-4 border-b mb-4">
					<div className="flex justify-between items-end mb-2">
						<span className="text-sm font-medium">Allocation Status</span>
						<span className={`text-sm font-bold ${isOverLimit ? "text-red-500" : "text-blue-600"}`}>{currentTotal.toFixed(1)}% / 100%</span>
					</div>
					<Progress value={currentTotal} className={`h-2 ${isOverLimit ? "[&>div]:bg-red-500" : "[&>div]:bg-blue-600"}`} />
					{isOverLimit && <p className="text-xs text-red-500 mt-1 font-medium">Total exceeds 100%. Please reduce some values.</p>}
					{remainingPercent > 0 && <p className="text-xs text-muted-foreground mt-1">You have {remainingPercent.toFixed(1)}% remaining.</p>}
				</div>
			)}

			{/* CATEGORY LIST */}
			<div className="grid gap-4">
				{GENERAL_CATEGORIES.map((cat) => {
					const item = Object.values(items).find((i) => i.code === cat.code);
					const val = item ? item.value : "";

					return (
						<div key={cat.code} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-xl bg-card hover:border-blue-300 transition-colors">
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-1">
									<span className="font-mono text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-1.5 rounded">{cat.code}</span>
									<h3 className="font-semibold text-sm">{cat.label}</h3>
								</div>
								<p className="text-xs text-muted-foreground leading-relaxed">{cat.desc}</p>
							</div>

							<div className="w-full sm:w-35 shrink-0">
								<div className="relative">
									<span className="absolute left-3 top-2.5 text-muted-foreground text-xs font-bold">{mode === "percent" ? "%" : "₱"}</span>
									<Input
										type="number"
										placeholder="0"
										className={`pl-8 font-mono text-right ${
											mode === "percent" && isOverLimit && (val || 0) > 0 ? "border-red-300 focus-visible:ring-red-500" : ""
										}`}
										value={val}
										onChange={(e) => {
											const v = Number.parseFloat(e.target.value);
											handleInputChange(cat.code, cat.label, Number.isNaN(v) ? 0 : v);
										}}
									/>
								</div>
								{mode === "percent" && totalBudget > 0 && (val || 0) > 0 && (
									<div className="text-[10px] text-right text-muted-foreground mt-1">
										≈ ₱{((Number(val) / 100) * totalBudget).toLocaleString()}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{mode === "percent" && totalBudget === 0 && (
				<Alert className="bg-amber-50 text-amber-900 border-amber-200">
					<Info className="h-4 w-4" />
					<AlertDescription>
						Please enter a <strong>Total Monthly Expense</strong> above to see the Peso equivalent.
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}
