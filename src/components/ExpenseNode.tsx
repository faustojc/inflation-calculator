import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { categoryTotals, highlightState, uiState, updateExpenseValue } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";
import { ChevronDown, ChevronRight, HelpCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TreeNode } from "./ExpenseList";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const ExpenseNode = ({ node, level }: { node: TreeNode; level: number }) => {
	const totals = useStore(categoryTotals);
	const highlight = useStore(highlightState);

	const inputRef = useRef<HTMLInputElement>(null);
	const rowRef = useRef<HTMLDivElement>(null);

	const { mode } = useStore(uiState);

	const hasChildren = node.children.length > 0;
	const isMatch = highlight.code === node.code;
	const displayValue = totals[node.code] || 0;

	const [isOpen, setIsOpen] = useState(() => {
		if (level < 1) return true;
		if (node.value > 0) return true;
		if (highlight.code.startsWith(node.code)) return true;

		const childHasValue = (n: TreeNode): boolean => n.value > 0 || n.children.some(childHasValue);
		return node.children.some(childHasValue);
	});

	useEffect(() => {
		if (isMatch) {
			rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
			setTimeout(() => inputRef.current?.focus(), 500);
		}
	}, [isMatch]);

	return (
		<div className="w-full">
			<div
				ref={rowRef}
				className={`
					group flex items-center gap-2 p-2 rounded-lg border-b border-dashed transition-all duration-500
					${
						isMatch
							? "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700"
							: "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
					}
				`}
				style={{ paddingLeft: `${level * 16 + 8}px` }}
			>
				<button
					onClick={() => setIsOpen(!isOpen)}
					disabled={!hasChildren}
					className={`
						p-1 rounded-md text-slate-400
						${hasChildren ? "hover:text-slate-600 hover:bg-slate-200 cursor-pointer" : "opacity-20 cursor-default"}
					`}
				>
					{isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
				</button>

				<div className="flex-1 flex flex-col justify-center">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="outline" className="font-mono text-[10px] text-muted-foreground h-5 px-1 bg-white dark:bg-slate-950">
							{node.code}
						</Badge>
						{node.example && (
							<Popover>
								<PopoverTrigger asChild>
									<HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600" />
								</PopoverTrigger>
								<PopoverContent>
									<p className="text-xs">{node.example}</p>
								</PopoverContent>
							</Popover>
						)}
						<span className={`text-sm ${level === 0 ? "font-bold" : "font-medium"}`}>{node.name}</span>

						{isMatch && (
							<span className="text-xs font-bold text-blue-600 dark:text-blue-400 animate-in fade-in slide-in-from-left-2">
								← {highlight.label} belongs here
							</span>
						)}
					</div>
				</div>

				<div className="w-32 relative">
					<span className={`absolute left-3 top-2.5 text-xs font-bold ${hasChildren ? "text-slate-400" : "text-muted-foreground"}`}>
						{mode === "percent" ? "%" : "₱"}
					</span>

					{hasChildren ? (
						<div className="h-9 pl-3 pr-3 flex items-center justify-end text-sm font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800/50 rounded-md border border-transparent">
							{displayValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
						</div>
					) : (
						<Input
							ref={inputRef}
							type="number"
							className={`
								h-9 pl-3 text-right font-mono text-sm transition-all
								${
									isMatch
										? "ring-2 ring-blue-500 border-blue-500 bg-white dark:bg-slate-950 scale-105"
										: node.value > 0
										? "bg-blue-50 border-blue-200 dark:bg-blue-900/20"
										: "bg-transparent border-transparent hover:border-slate-200"
								}
							`}
							placeholder="-"
							value={node.value || ""}
							min={0}
							onChange={(e) => updateExpenseValue(node.id, Number.parseFloat(e.target.value) || 0)}
						/>
					)}
				</div>
			</div>

			{isOpen && hasChildren && (
				<div className="w-full">
					{node.children.map((child) => (
						<ExpenseNode key={child.id} node={child} level={level + 1} />
					))}
				</div>
			)}
		</div>
	);
};

export default ExpenseNode;
