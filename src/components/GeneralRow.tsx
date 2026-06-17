import { observer, useValue } from "@legendapp/state/react";
import { AlertCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { useBufferedNumericInput } from "@/hooks/useBufferedNumericInput";
import type { CommodityDef } from "@/lib/types";
import {
	generalExpenses,
	highlightState,
	missingGeneralItems,
	mode,
	prefetchReady,
	updateExpenseValue,
} from "@/stores/inflationStore";
import { getLimitValue, MAJOR_CATEGORY_DESCRIPTIONS, preventNonNumeric } from "@/utils/metadata";

const GeneralRow = observer(({ cat }: Readonly<{ cat: CommodityDef }>) => {
	const m = useValue(mode);

	const value = useValue(() => getLimitValue(m, generalExpenses[cat.code]?.get()?.value || 0));
	const isMatch = useValue(() => highlightState.code.get() === cat.code);
	const highlightLabel = useValue(() =>
		highlightState.code.get() === cat.code ? highlightState.label.get() : "",
	);
	const isMissing = useValue(() => missingGeneralItems.get().has(cat.code));
	const isReady = useValue(prefetchReady);

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

	const commitValue = (nextValue: number) => updateExpenseValue(cat.code, cat.name, nextValue, "general");

	const normalizeValue = (nextValue: number) => {
		if (nextValue < 0 || (m === "percent" && nextValue > 100)) return null;
		return getLimitValue(m, nextValue);
	};

	const {
		draftValue,
		handleBlur,
		handleChange,
		handleEnterKey,
		handleFocus: handleDraftFocus,
	} = useBufferedNumericInput({
		value,
		normalize: normalizeValue,
		commit: commitValue,
	});

	const handleFocus = () => {
		handleDraftFocus();
		if (isPointerDown.current) {
			isPointerDown.current = false;
			return;
		}
		setTimeout(() => {
			rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
		}, 50);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		preventNonNumeric(e);
		handleEnterKey(e);
	};

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
					<h3 className={`font-semibold text-base text-wrap ${isMatch && "font-extrabold"}`}>
						{cat.name}
					</h3>
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
						value={draftValue}
						disabled={missingStatus}
						onKeyDown={handleKeyDown}
						onChange={handleChange}
						onBlur={handleBlur}
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
