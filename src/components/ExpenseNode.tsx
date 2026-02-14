import type { DisplayNode } from "@/components/ExpenseTab";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	categoryTotals,
	detailedExpenses,
	expandedNodes,
	highlightState,
	mode,
	toggleExpansion,
	updateExpenseValue,
} from "@/stores/inflationStore";
import { getLimitValue, preventNonNumeric } from "@/utils/metadata";
import { useStore } from "@nanostores/react";
import { ChevronDown, ChevronRight, InfoIcon } from "lucide-react";
import { memo, useEffect, useRef } from "react";

const ExpenseNode = memo(({ node, level }: { node: DisplayNode; level: number }) => {
	const highlight = useStore(highlightState);
	const currMode = useStore(mode);
	const totals = useStore(categoryTotals);
	const expandedMap = useStore(expandedNodes);
	const allExpenses = useStore(detailedExpenses);

	const inputRef = useRef<HTMLInputElement>(null);
	const rowRef = useRef<HTMLDivElement>(null);

	const hasChildren = node.children && node.children.length > 0;
	const displayValue = hasChildren ? totals[node.code] || 0 : allExpenses[node.code]?.value || 0;
	const isOpen = expandedMap[node.code] ?? (level < 1 || displayValue > 0);
	const isMatch = highlight?.code === node.code;

	useEffect(() => {
		if (isMatch) {
			rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
			if (!hasChildren) {
				setTimeout(() => inputRef.current?.focus(), 500);
			}
		}
	}, [isMatch, hasChildren]);

	return (
		<div className="w-full">
			<div
				ref={rowRef}
				className={`group flex items-center gap-2 py-2 px-3 border-b transition-all duration-300
					${isMatch ? "bg-yellow-50 dark:bg-amber-950/30 border-yellow-300 dark:border-amber-600/50 ring-1 ring-inset ring-yellow-400/50 dark:ring-amber-500/30" : "border-border hover:bg-muted/50"}
					${level === 0 ? "bg-muted/50" : ""}
				`}
				style={{ paddingLeft: `${level * 20 + 12}px` }}
			>
				{hasChildren && (
					<button
						onClick={() => toggleExpansion(node.code)}
						disabled={!hasChildren}
						className={`p-0.5 rounded transition-colors ${hasChildren ? "text-primary/60 hover:text-primary hover:bg-primary/10 cursor-pointer" : "text-transparent w-5"}`}
					>
						{isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
					</button>
				)}

				<div className="grid grid-cols-5 items-center w-full gap-2">
					<div className="col-span-3">
						<div className="flex items-center gap-2">
							{node.description && (
								<Popover>
									<PopoverTrigger asChild>
										<InfoIcon className="h-3.5 w-3.5 shrink-0 text-primary/50 hover:text-primary cursor-pointer transition-colors" />
									</PopoverTrigger>
									<PopoverContent className="w-72 p-3 text-sm">{node.description}</PopoverContent>
								</Popover>
							)}
							<p
								className={`text-sm text-wrap text-left ${level === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}
							>
								{node.name}
							</p>

							{isMatch && (
								<span className="text-[0.65rem] font-bold text-primary animate-in fade-in slide-in-from-left-2 shrink-0">
									← {highlight.label} belongs here
								</span>
							)}
						</div>
					</div>

					<div
						className={`col-span-2 relative rounded-xl ${!hasChildren ? "border-2 border-zinc-100 dark:border-border/50" : ""}`}
					>
						<span
							className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold ${hasChildren ? "text-muted-foreground" : "text-muted-foreground"}`}
						>
							{hasChildren ? "=" : currMode === "percent" ? "%" : "PhP"}
						</span>

						{hasChildren ? (
							<div className="h-8 pl-6 pr-3 flex items-center justify-end text-sm font-semibold text-foreground/80 bg-muted/60 rounded-md tabular-nums">
								{displayValue.toLocaleString(undefined, {
									maximumFractionDigits: 2,
								})}
							</div>
						) : (
							<Input
								ref={inputRef}
								type="number"
								className={`h-8 pl-6 text-right font-mono text-sm transition-all${
									isMatch
										? "ring-2 ring-yellow-400 dark:ring-amber-500/50 border-yellow-400 dark:border-amber-500/50 bg-card scale-105"
										: displayValue > 0
											? "bg-primary/5 border-primary/20 font-semibold"
											: "bg-transparent border-transparent hover:border-border hover:bg-card"
								}`}
								placeholder="-"
								value={displayValue || ""}
								min={0}
								max={500000}
								onKeyDown={preventNonNumeric}
								onChange={(e) => {
									let v = Number.parseFloat(e.target.value);
									if (v < 0 || (currMode === "percent" && v > 100)) return;

									v = Number.isNaN(v) ? 0 : getLimitValue(currMode, v);

									updateExpenseValue(node.code, node.name, Number.isNaN(v) ? 0 : v, "detailed");
								}}
							/>
						)}
					</div>
				</div>
			</div>

			{isOpen && hasChildren && (
				<div className="w-full">
					{node.children.map((child) => (
						<ExpenseNode key={child.code} node={child} level={level + 1} />
					))}
				</div>
			)}
		</div>
	);
});

export default ExpenseNode;
