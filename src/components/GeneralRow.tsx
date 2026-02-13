import { Input } from "@/components/ui/input";
import type { CommodityDef } from "@/lib/types";
import { generalExpenses, highlightState, mode, updateExpenseValue } from "@/stores/inflationStore";
import { CATEGORY_DESCRIPTIONS, getLimitValue, preventNonNumeric } from "@/utils/metadata";
import { useStore } from "@nanostores/react";
import { useEffect, useRef } from "react";

export default function GeneralRow({ cat }: Readonly<{ cat: CommodityDef }>) {
	const items = useStore(generalExpenses);
	const m = useStore(mode);
	const highlight = useStore(highlightState);

	const rowRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const value = getLimitValue(m, items[cat.code]?.value || 0);
	const isMatch = highlight?.code === cat.code;
	const hasFilled = value > 0;

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
				grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl border transition-all duration-300
				${
					isMatch
						? "bg-yellow-50 border-yellow-400 ring-2 ring-yellow-400/50 shadow-md"
						: hasFilled
							? "bg-primary/5 border-primary/20 shadow-sm"
							: "bg-white border-slate-200 hover:border-primary/30 hover:shadow-sm"
				}
			`}
		>
			<div className="col-span-2 min-w-0">
				<div className="flex items-center gap-2 mb-0.5">
					<span className="font-mono text-[0.65rem] text-white bg-primary/80 px-1.5 py-0.5 rounded font-semibold shrink-0">
						{cat.code}
					</span>
					<h3 className="font-semibold text-base text-slate-800 text-wrap">{cat.name}</h3>
					{isMatch && (
						<span className="text-[0.65rem] font-bold text-primary animate-in fade-in shrink-0">
							← {highlight?.label || "It"} belongs here
						</span>
					)}
				</div>
			</div>

			<div className="col-span-2 md:col-span-1 order-last md:order-0 w-full shrink-0">
				<div className="relative">
					<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-semibold">
						{m === "percent" ? "%" : "PhP"}
					</span>
					<Input
						ref={inputRef}
						type="number"
						min={0}
						max={500000}
						placeholder="0"
						className={`
							pl-8 font-mono text-right text-sm h-9 border-2 border-zinc-200
							${isMatch ? "ring-2 ring-yellow-400 border-yellow-400" : ""}
							${hasFilled ? "border-primary font-semibold" : ""}
						`}
						value={value || ""}
						onKeyDown={preventNonNumeric}
						onChange={(e) => {
							let v = Number.parseFloat(e.target.value);
							if (v < 0 || (m === "percent" && v > 100)) return;

							v = Number.isNaN(v) ? 0 : getLimitValue(m, v);

							updateExpenseValue(cat.code, cat.name, Number.isNaN(v) ? 0 : v, "general");
						}}
					/>
				</div>
			</div>

			<p className="col-span-3 text-sm text-muted-foreground leading-relaxed line-clamp-2">
				{CATEGORY_DESCRIPTIONS[cat.code] || "General expenses"}
			</p>
		</div>
	);
}
