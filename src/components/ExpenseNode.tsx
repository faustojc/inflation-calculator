import type { DisplayNode } from "@/components/ExpenseTab";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { categoryTotals, expandedNodes, expenses, highlightState, mode, toggleExpansion, updateExpenseValue } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";
import { ChevronDown, ChevronRight, InfoIcon } from "lucide-react";
import { memo, useEffect, useRef } from "react";

const ExpenseNode = memo(({ node, level }: { node: DisplayNode; level: number }) => {
	const highlight = useStore(highlightState);
	const currMode = useStore(mode);
	const totals = useStore(categoryTotals);
	const expandedMap = useStore(expandedNodes);
	const allExpenses = useStore(expenses);

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
				className={`group flex items-center gap-2 p-2 rounded-lg border-b border-dashed transition-all duration-300 ${isMatch ? "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700" : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"}`}
				style={{ paddingLeft: `${level * 16 + 8}px` }}
			>
				<button
					onClick={() => toggleExpansion(node.code)}
					disabled={!hasChildren}
					className={`p-1 rounded-md text-slate-500 ${hasChildren && "bg-slate-100 hover:text-slate-900 hover:bg-slate-300 cursor-pointer"}`}
				>
					{hasChildren && (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4 " />)}
				</button>

				<div className="grid grid-cols-3 items-center w-full">
					<div className="col-span-2">
						<div className="flex items-center gap-2">
							{node.description && (
								<Popover>
									<PopoverTrigger asChild>
										<InfoIcon className="h-4 w-4 shrink-0 text-blue-600 cursor-pointer" />
									</PopoverTrigger>
									<PopoverContent className="w-72 p-2">{node.description}</PopoverContent>
								</Popover>
							)}
							<p className={`text-sm text-wrap text-left ${level === 0 ? "font-bold" : "font-normal"}`}>{node.name}</p>

							{isMatch && (
								<span className="text-xs font-bold text-blue-600 dark:text-blue-400 animate-in fade-in slide-in-from-left-2">
									← {highlight.label} belongs here
								</span>
							)}
						</div>
					</div>

					<div className="relative">
						<span
							className={`absolute left-3 top-2.5 text-xs font-bold ${hasChildren ? "text-slate-900 dark:text-slate-200" : "text-muted-foreground"}`}
						>
							{hasChildren ?
								"="
							: currMode === "percent" ?
								"%"
							:	"PhP"}
						</span>

						{hasChildren ?
							<div className="h-9 pl-3 pr-3 flex items-center justify-end text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800/50 rounded-md border border-transparent">
								{displayValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
							</div>
						:	<Input
								ref={inputRef}
								type="number"
								className={`h-9 pl-3 text-right font-mono text-sm transition-all bg-slate-400 ${
									isMatch ? "ring-2 ring-blue-500 border-blue-500 bg-white dark:bg-slate-950 scale-105"
									: displayValue > 0 ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20"
									: "bg-transparent border-transparent hover:border-slate-200"
								}`}
								placeholder="-"
								value={displayValue || ""}
								min={0}
								onChange={(e) => {
									const v = Number.parseFloat(e.target.value);
									if (v < 0 || (currMode === "percent" && v > 100)) return;

									updateExpenseValue(node.code, node.name, Number.isNaN(v) ? 0 : v);
								}}
							/>
						}
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
