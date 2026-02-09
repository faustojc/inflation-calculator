import { Input } from "@/components/ui/input";
import type { CommodityDef } from "@/lib/types";
import { generalExpenses, highlightState, mode, updateExpenseValue } from "@/stores/inflationStore";
import { CATEGORY_DESCRIPTIONS } from "@/utils/metadata";
import { useStore } from "@nanostores/react";
import { useEffect, useRef } from "react";

export default function GeneralRow({ cat }: Readonly<{ cat: CommodityDef }>) {
	const items = useStore(generalExpenses);
	const m = useStore(mode);
	const highlight = useStore(highlightState);

	const rowRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const val = items[cat.code]?.value || 0;
	const isMatch = highlight?.code === cat.code;

	useEffect(() => {
		if (isMatch) {
			rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
			setTimeout(() => inputRef.current?.focus(), 500);
		}
	}, [isMatch]);

	return (
		<div
			ref={rowRef}
			className={`
				flex flex-col sm:flex-row gap-4 p-4 border rounded-xl transition-all duration-500
				${isMatch ? "bg-yellow-50 border-yellow-400 ring-1 ring-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-700" : "bg-card hover:border-blue-300"}
			`}
		>
			<div className="flex-1">
				<div className="flex items-center gap-2 mb-1">
					<span className="font-mono text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-1.5 rounded">{cat.code}</span>
					<h3 className="font-semibold">{cat.name}</h3>

					{isMatch && <span className="text-xs font-bold text-blue-600 animate-in fade-in">← Found here</span>}
				</div>
				<p className="text-sm text-muted-foreground leading-relaxed">{CATEGORY_DESCRIPTIONS[cat.code] || "General expenses"}</p>
			</div>

			<div className="w-full sm:w-35 shrink-0">
				<div className="relative">
					<span className="absolute left-3 top-2.5 text-muted-foreground text-xs font-bold">{m === "percent" ? "%" : "PhP"}</span>
					<Input
						ref={inputRef}
						type="number"
						className={`
							pl-8 font-mono text-right
							${isMatch ? "ring-2 ring-yellow-400 border-yellow-400" : ""}
						`}
						value={val || ""}
						onChange={(e) => {
							let v = Number.parseFloat(e.target.value);
							v = Number.isNaN(v) || v < 0 ? 0 : v;

							updateExpenseValue(cat.code, cat.name, Number.isNaN(v) ? 0 : v, "general");
						}}
					/>
				</div>
			</div>
		</div>
	);
}
