import { useStore } from "@nanostores/react";
import { AlertTriangle, ChevronDown, ChevronRight, InfoIcon } from "lucide-react";
import { computed } from "nanostores";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import type { DisplayNode } from "@/components/ExpenseTab";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBufferedNumericInput } from "@/hooks/useBufferedNumericInput";
import {
	categoryTotals,
	detailedExpenses,
	expandedNodes,
	highlightState,
	missingDetailedItems,
	mode,
	prefetchReady,
	toggleExpansion,
	updateExpenseValue,
} from "@/stores/inflationStore";
import { getLimitValue, preventNonNumeric, SUB_CATEGORY_DESCRIPTIONS } from "@/utils/metadata";

const ExpenseNode = memo(
	({ node, level }: { node: DisplayNode; level: number }) => {
		const currMode = useStore(mode);
		const hasChildren = node.children && node.children.length > 0;

		const isMatchStore = useMemo(() => computed(highlightState, (h) => h?.code === node.code), [node.code]);
		const highlightLabelStore = useMemo(
			() => computed(highlightState, (h) => (h?.code === node.code ? h.label : "")),
			[node.code],
		);
		const displayValueStore = useMemo(
			() =>
				computed([categoryTotals, detailedExpenses], (totals, expenses) => {
					return hasChildren ? totals[node.code] || 0 : expenses[node.code]?.value || 0;
				}),
			[node.code, hasChildren],
		);
		const isOpenStore = useMemo(
			() =>
				computed([expandedNodes, categoryTotals, detailedExpenses], (map, totals, expenses) => {
					const val = hasChildren ? totals[node.code] || 0 : expenses[node.code]?.value || 0;
					return map[node.code] ?? (level < 1 || val > 0);
				}),
			[node.code, level, hasChildren],
		);
		const isMissingStore = useMemo(
			() => computed(missingDetailedItems, (missing) => missing.has(node.code)),
			[node.code],
		);

		const isMatch = useStore(isMatchStore);
		const highlightLabel = useStore(highlightLabelStore);
		const displayValue = useStore(displayValueStore);
		const isOpen = useStore(isOpenStore);
		const isMissing = useStore(isMissingStore);
		const isReady = useStore(prefetchReady);

		const missingStatus = isReady && isMissing;

		const inputRef = useRef<HTMLInputElement>(null);
		const rowRef = useRef<HTMLDivElement>(null);
		const isPointerDown = useRef(false);
		const isMobile = useIsMobile();

		useEffect(() => {
			if (isMatch) {
				rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
				if (!hasChildren) {
					setTimeout(() => inputRef.current?.focus(), 500);
				}
			}
		}, [isMatch, hasChildren]);

		const commitValue = useCallback(
			(nextValue: number) => updateExpenseValue(node.code, node.name, nextValue, "detailed"),
			[node.code, node.name],
		);

		const normalizeValue = useCallback(
			(nextValue: number) => {
				if (nextValue < 0 || (currMode === "percent" && nextValue > 100)) return null;
				return getLimitValue(currMode, nextValue);
			},
			[currMode],
		);

		const {
			draftValue,
			handleBlur,
			handleChange,
			handleEnterKey,
			handleFocus: handleDraftFocus,
		} = useBufferedNumericInput({
			value: displayValue,
			normalize: normalizeValue,
			commit: commitValue,
		});

		const handleToggle = useCallback(
			(open: boolean) => {
				toggleExpansion(node.code, open);
			},
			[node.code],
		);

		const handleFocus = useCallback(() => {
			handleDraftFocus();
			if (isPointerDown.current) {
				isPointerDown.current = false;
				return;
			}
			setTimeout(() => {
				rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
			}, 50);
		}, [handleDraftFocus]);

		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent<HTMLInputElement>) => {
				preventNonNumeric(e);
				handleEnterKey(e);
			},
			[handleEnterKey],
		);

		return (
			<Collapsible open={isOpen} onOpenChange={handleToggle} className="w-full">
				<div
					ref={rowRef}
					style={{ paddingLeft: `${level * 20 + 12}px` }}
					className={`group flex items-center gap-2 py-2 px-3 border-b transition-all duration-300
					${
						missingStatus
							? "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-600/50 ring-1 ring-inset ring-red-400/50 dark:ring-red-500/30"
							: isMatch
								? "bg-yellow-50 dark:bg-amber-950/30 border-yellow-300 dark:border-amber-600/50 ring-1 ring-inset ring-yellow-400/50 dark:ring-amber-500/30"
								: "border-border hover:bg-muted/50"
					}
					${level === 0 ? "bg-muted/50" : ""}
				`.replace(/\s+/g, " ")}
				>
					{hasChildren && (
						<CollapsibleTrigger asChild>
							<button
								type="button"
								disabled={!hasChildren}
								tabIndex={-1}
								className={`p-0.5 rounded transition-colors ${hasChildren ? "text-primary hover:text-primary hover:bg-primary/20 cursor-pointer" : "text-transparent w-5"}`}
								aria-label={isOpen ? `Collapse ${node.name}` : `Expand ${node.name}`}
								aria-expanded={isOpen}
							>
								{isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
							</button>
						</CollapsibleTrigger>
					)}

					<div className="grid grid-cols-5 items-center w-full gap-2">
						<div className="col-span-3">
							<div className="flex items-center gap-2">
								{SUB_CATEGORY_DESCRIPTIONS[node.code] && (
									<Popover>
										<PopoverTrigger
											tabIndex={-1}
											className="outline-none focus:ring-0 flex items-center justify-center bg-transparent border-0 p-0"
											aria-label={`View description for ${node.name}`}
										>
											<InfoIcon className="h-3.5 w-3.5 shrink-0 text-primary/60 hover:text-primary cursor-pointer transition-colors" />
										</PopoverTrigger>
										<PopoverContent className="w-72 p-3 text-sm">
											{SUB_CATEGORY_DESCRIPTIONS[node.code]}
										</PopoverContent>
									</Popover>
								)}
								<p
									className={`text-sm text-wrap text-left ${level === 0 ? "font-bold" : "text-foreground"} ${isMatch && "font-extrabold"}`}
								>
									{node.name}
								</p>

								{isMatch && (
									<span className="text-xs font-bold text-primary text-wrap animate-in fade-in slide-in-from-left-2">
										← {highlightLabel} belongs here
									</span>
								)}
								{!isMobile && missingStatus && (
									<div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 animate-in fade-in">
										<AlertTriangle className="w-3.5 h-3.5" />
										<span>No official CPI data</span>
									</div>
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
									id={node.code}
									name={node.name}
									type="number"
									aria-label={`Expense amount for ${node.name}`}
									className={`commodity-input h-8 pl-6 text-right font-mono text-sm transition-all ${
										missingStatus
											? "ring-2 ring-destructive border-destructive text-destructive font-semibold opacity-70 cursor-not-allowed"
											: isMatch
												? "ring-2 ring-yellow-400 dark:ring-amber-500/50 border-yellow-400 dark:border-amber-500/50 bg-card scale-105"
												: displayValue > 0
													? "bg-primary/5 border-primary/20 font-semibold"
													: "bg-transparent border-transparent hover:border-border hover:bg-card"
									}`.replace(/\s+/g, " ")}
									placeholder="0"
									value={draftValue}
									min={0}
									max={500000}
									disabled={missingStatus}
									onKeyDown={handleKeyDown}
									onChange={handleChange}
									onBlur={handleBlur}
									onFocus={handleFocus}
									onPointerDown={() => {
										isPointerDown.current = true;
									}}
								/>
							)}
						</div>
						{isMobile && missingStatus && !hasChildren && (
							<div className="col-span-5 flex items-center justify-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 animate-in fade-in">
								<AlertTriangle className="w-3.5 h-3.5" />
								<span>No official CPI data</span>
							</div>
						)}
					</div>
				</div>

				{hasChildren && (
					<CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
						<div className="w-full">
							{node.children.map((child) => (
								<ExpenseNode key={child.code} node={child} level={level + 1} />
							))}
						</div>
					</CollapsibleContent>
				)}
			</Collapsible>
		);
	},
	(prevProps, nextProps) => {
		return prevProps.node.code === nextProps.node.code && prevProps.level === nextProps.level;
	},
);

export default ExpenseNode;
