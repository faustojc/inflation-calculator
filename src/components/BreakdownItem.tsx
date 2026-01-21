import type { ItemBreakdown } from "@/utils/inflationCompute";
import { ArrowRight } from "lucide-react";
import { Badge } from "./ui/badge";

export function BreakdownItem({ item, totalSpend, formatter }: Readonly<{ item: ItemBreakdown; totalSpend: number; formatter: Intl.NumberFormat }>) {
	// Formula: Amount = (Weight / 100) * TotalSpend
	const currentAmount = (item.weight / 100) * totalSpend;
	// Formula: Previous = Current * (OldCPI / NewCPI)
	const previousAmount = item.cpiEnd > 0 ? currentAmount * (item.cpiStart / item.cpiEnd) : 0;

	const getBadgeColor = (rate: number) => {
		if (rate > 10) return "bg-red-500 hover:bg-red-600";
		if (rate > 4) return "bg-amber-500 hover:bg-amber-600";
		if (rate < 0) return "bg-emerald-500 hover:bg-emerald-600 text-white";
		return "bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
	};

	return (
		<div className="group flex flex-col bg-white dark:bg-slate-900 border rounded-xl p-3 shadow-sm hover:border-blue-300 transition-colors">
			<div className="flex justify-between items-start mb-2">
				<div className="max-w-[65%]">
					<span className="font-semibold text-sm block leading-tight text-slate-800 dark:text-slate-100">{item.name}</span>
					<span className="text-[10px] text-muted-foreground mt-1 block">
						{item.categoryCode} • {item.weight.toFixed(1)}% weight
					</span>
				</div>

				<Badge className={`text-sm font-bold h-7 px-2 ${getBadgeColor(item.itemInflationRate)}`}>
					{item.itemInflationRate > 0 ? "+" : ""}
					{item.itemInflationRate.toFixed(1)}%
				</Badge>
			</div>

			<div className="flex justify-between text-xs pt-2 border-t border-dashed border-slate-100 dark:border-slate-800 mt-1">
				<div className="text-slate-400">{formatter.format(previousAmount)}</div>
				<div className="flex items-center gap-1">
					<ArrowRight className="h-3 w-3 text-slate-300" />
					<span className="text-slate-700 dark:text-slate-200 font-mono font-medium">{formatter.format(currentAmount)}</span>
				</div>
			</div>
		</div>
	);
}
