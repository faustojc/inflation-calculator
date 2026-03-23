import { Input } from "@/components/ui/input";
import type { CommodityDef } from "@/lib/types";
import {
	generalExpenses,
	highlightState,
	missingGeneralItems,
	mode,
	prefetchReady,
	updateExpenseValue,
} from "@/stores/inflationStore";
import { MAJOR_CATEGORY_DESCRIPTIONS, getLimitValue, preventNonNumeric } from "@/utils/metadata";
import { useStore } from "@nanostores/react";
import { AlertCircle } from "lucide-react";
import { computed } from "nanostores";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";

const GeneralRow = memo(({ cat }: Readonly<{ cat: CommodityDef }>) => {
	const m = useStore(mode);

	const valueStore = useMemo(
		() => computed(generalExpenses, (expenses) => getLimitValue(m, expenses[cat.code]?.value || 0)),
		[cat.code, m],
	);
	const isMatchStore = useMemo(() => computed(highlightState, (h) => h?.code === cat.code), [cat.code]);
	const highlightLabelStore = useMemo(() => computed(highlightState, (h) => (h?.code === cat.code ? h.label : "")), [cat.code]);
	const isMissingStore = useMemo(() => computed(missingGeneralItems, (missing) => missing.has(cat.code)), [cat.code]);

	const value = useStore(valueStore);
	const isMatch = useStore(isMatchStore);
	const highlightLabel = useStore(highlightLabelStore);
	const isMissing = useStore(isMissingStore);
	const isReady = useStore(prefetchReady);

	const missingStatus = isReady && isMissing;

	const rowRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const isPointerDown = useRef(false);

	const hasFilled = value > 0;

	useEffect(() => {
		if (isMatch) {
			rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
			setTimeout(() => inputRef.current?.focus(), 300);
		}
	}, [isMatch]);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			let v = Number.parseFloat(e.target.value);
			if (v < 0 || (m === "percent" && v > 100)) return;

			v = Number.isNaN(v) ? 0 : getLimitValue(m, v);
			updateExpenseValue(cat.code, cat.name, Number.isNaN(v) ? 0 : v, "general");
		},
		[cat.code, cat.name, m],
	);

	const handleFocus = useCallback(() => {
		if (isPointerDown.current) {
			isPointerDown.current = false;
			return;
		}
		setTimeout(() => {
			rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
		}, 50);
	}, []);

	return (
		<div
			ref={rowRef}
			className={`
				grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl border transition-all duration-300
				${
					missingStatus
						? "bg-red-50 dark:bg-red-950/20 border-red-400 dark:border-red-600/50 ring-2 ring-red-400/50 dark:ring-red-500/30 shadow-md"
						: isMatch
							? "bg-yellow-50 dark:bg-amber-950/20 border-yellow-400 dark:border-amber-600/50 ring-2 ring-yellow-400/50 dark:ring-amber-500/30 shadow-md"
							: hasFilled
								? "bg-primary/5 border-primary/20 shadow-sm"
								: "bg-card border-border hover:border-primary/30 hover:shadow-sm"
				}
			`.replace(/\s+/g, " ")}
		>
			<div className="col-span-2 min-w-0">
				<div className="flex items-center gap-2 mb-0.5">
					<span
						className={`font-mono text-[0.65rem] text-white px-1.5 py-0.5 rounded font-semibold shrink-0 ${missingStatus ? "bg-red-500/80" : "bg-primary/80"}`}
					>
						{cat.code}
					</span>
					<h3 className={`font-semibold text-base text-wrap ${isMatch && "font-extrabold"}`}>{cat.name}</h3>
					{isMatch && (
						<p className="text-xs font-bold text-primary text-wrap animate-in fade-in">
							← {highlightLabel || "It"} belongs here
						</p>
					)}
				</div>
			</div>

			<div className="col-span-2 md:col-span-1 flex items-center justify-center order-last md:order-0 w-full shrink-0">
				<div className="relative w-full">
					<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-semibold">
						{m === "percent" ? "%" : "PhP"}
					</span>
					<Input
						ref={inputRef}
						type="number"
						id={cat.code}
						name={cat.name}
						aria-label={`Expense amount for ${cat.name}`}
						min={0}
						max={500000}
						placeholder="0"
						className={`
							commodity-input
							pl-8 font-mono text-right text-sm h-9
							${
								missingStatus
									? "ring-2 ring-destructive border-destructive text-destructive font-semibold opacity-70 cursor-not-allowed"
									: isMatch
										? "ring-2 ring-yellow-400 dark:ring-amber-500/50 border-yellow-400 dark:border-amber-500/50"
										: hasFilled
											? "border-primary font-semibold"
											: ""
							}
						`.replace(/\s+/g, " ")}
						value={value || ""}
						disabled={missingStatus}
						onKeyDown={preventNonNumeric}
						onChange={handleChange}
						onFocus={handleFocus}
						onPointerDown={() => {
							isPointerDown.current = true;
						}}
					/>
				</div>
			</div>

			<p className="col-span-3 text-sm text-muted-foreground leading-relaxed line-clamp-2">
				{MAJOR_CATEGORY_DESCRIPTIONS[cat.code] || "General expenses"}
			</p>
			{missingStatus && (
				<div className="col-span-3 flex items-center justify-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 animate-in fade-in">
					<AlertCircle className="w-3.5 h-3.5" />
					<span>No official CPI data</span>
				</div>
			)}
		</div>
	);
});

export default GeneralRow;
