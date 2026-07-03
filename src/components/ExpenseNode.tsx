import { AlertTriangle, ChevronDown, ChevronRight, InfoIcon } from "lucide-solid";
import { createEffect, For, Show } from "solid-js";
import type { DisplayNode } from "@/components/ExpenseTab";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/primitives/collapsible";
import { Input } from "@/components/primitives/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/primitives/popover";
import { useIsMobile } from "@/hooks/use-mobile";
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

const ExpenseNode = ({ node, level }: { node: DisplayNode; level: number }) => {
	const currMode = () => mode.get();
	const hasChildren = node.children && node.children.length > 0;

	const isMatch = () => highlightState.code.get() === node.code;
	const highlightLabel = () => (isMatch() ? highlightState.label.get() : "");
	const displayValue = () =>
		hasChildren ? categoryTotals[node.code]?.get() || 0 : detailedExpenses[node.code]?.get()?.value || 0;
	const isOpen = () => expandedNodes[node.code]?.get() ?? (level < 1 || displayValue() > 0);
	const isMissing = () => missingDetailedItems.get().has(node.code);
	const isReady = () => prefetchReady.get();

	const missingStatus = () => isReady() && isMissing();

	let inputRef!: HTMLInputElement;
	let rowRef!: HTMLDivElement;
	let isPointerDown = false;
	const isMobile = useIsMobile();

	createEffect(() => {
		if (isMatch()) {
			rowRef?.scrollIntoView({ behavior: "smooth", block: "center" });
			if (!hasChildren) {
				setTimeout(() => inputRef?.focus(), 500);
			}
		}
	});

	const commitValue = (nextValue: number) => updateExpenseValue(node.code, node.name, nextValue, "detailed");

	const inputLimit = () => (currMode() === "percent" ? 100 : 500000);
	const inputText = () => {
		const limited = getLimitValue(currMode(), displayValue());
		return limited > 0 ? String(limited) : "";
	};

	// Commit on every keystroke — Solid's fine-grained reactivity keeps downstream
	// updates cheap. The DOM keeps in-progress text like "5." because the bound
	// value only writes back when the committed number actually changes.
	const handleInput = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
		const el = e.currentTarget;
		if (el.value === "") {
			commitValue(0);
			return;
		}

		const parsed = Number.parseFloat(el.value);
		if (!Number.isFinite(parsed) || parsed < 0) {
			el.value = inputText();
			return;
		}

		if (parsed > inputLimit()) {
			el.value = String(inputLimit());
			commitValue(inputLimit());
			return;
		}
		commitValue(parsed);
	};

	const handleBlur = (e: FocusEvent & { currentTarget: HTMLInputElement }) => {
		// Normalize leftover partial text ("5.", "007") to the committed value.
		e.currentTarget.value = inputText();
	};

	const handleToggle = (open: boolean) => {
		toggleExpansion(node.code, open);
	};

	const handleFocus = () => {
		if (isPointerDown) {
			isPointerDown = false;
			return;
		}
		setTimeout(() => {
			rowRef?.scrollIntoView({ behavior: "smooth", block: "center" });
		}, 50);
	};

	const handleKeyDown = (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => {
		preventNonNumeric(e);
		if (e.key === "Enter") e.currentTarget.blur();
	};

	return (
		<Collapsible open={isOpen()} onOpenChange={handleToggle} class="w-full">
			<div
				ref={rowRef}
				style={{ "padding-left": `${level * 20 + 12}px` }}
				class={`group flex items-center gap-2 py-2 px-3 border-b transition-all duration-300
					${
						missingStatus()
							? "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-600/50 ring-1 ring-inset ring-red-400/50 dark:ring-red-500/30"
							: isMatch()
								? "bg-yellow-50 dark:bg-amber-950/30 border-yellow-300 dark:border-amber-600/50 ring-1 ring-inset ring-yellow-400/50 dark:ring-amber-500/30"
								: "border-border hover:bg-muted/50"
					}
					${level === 0 ? "bg-muted/50" : ""}
				`.replace(/\s+/g, " ")}
			>
				<Show when={hasChildren}>
					<CollapsibleTrigger asChild>
						<button
							type="button"
							disabled={!hasChildren}
							tabIndex={-1}
							class={`p-0.5 rounded transition-colors ${hasChildren ? "text-primary hover:text-primary hover:bg-primary/20 cursor-pointer" : "text-transparent w-5"}`}
							aria-label={isOpen() ? `Collapse ${node.name}` : `Expand ${node.name}`}
							aria-expanded={isOpen()}
						>
							<Show when={isOpen()} fallback={<ChevronRight class="h-4 w-4" />}>
								<ChevronDown class="h-4 w-4" />
							</Show>
						</button>
					</CollapsibleTrigger>
				</Show>

				<div class="grid grid-cols-5 items-center w-full gap-2">
					<div class="col-span-3">
						<div class="flex items-center gap-2">
							<Show when={SUB_CATEGORY_DESCRIPTIONS[node.code]}>
								<Popover>
									<PopoverTrigger
										tabIndex={-1}
										class="outline-none focus:ring-0 flex items-center justify-center bg-transparent border-0 p-0"
										aria-label={`View description for ${node.name}`}
									>
										<InfoIcon class="h-3.5 w-3.5 shrink-0 text-primary/60 hover:text-primary cursor-pointer transition-colors" />
									</PopoverTrigger>
									<PopoverContent class="w-72 p-3 text-sm">
										{SUB_CATEGORY_DESCRIPTIONS[node.code]}
									</PopoverContent>
								</Popover>
							</Show>
							<p
								class={`text-sm text-wrap text-left ${level === 0 ? "font-bold" : "text-foreground"} ${isMatch() ? "font-extrabold" : ""}`}
							>
								{node.name}
							</p>

							<Show when={isMatch()}>
								<span class="text-xs font-bold text-primary text-wrap animate-in fade-in slide-in-from-left-2">
									← {highlightLabel()} belongs here
								</span>
							</Show>
							<Show when={!isMobile() && missingStatus()}>
								<div class="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 animate-in fade-in">
									<AlertTriangle class="w-3.5 h-3.5" />
									<span>No official CPI data</span>
								</div>
							</Show>
						</div>
					</div>

					<div
						class={`col-span-2 relative rounded-xl ${!hasChildren ? "border-2 border-zinc-100 dark:border-border/50" : ""}`}
					>
						<span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
							{hasChildren ? "=" : currMode() === "percent" ? "%" : "PhP"}
						</span>

						<Show
							when={hasChildren}
							fallback={
								<Input
									ref={inputRef}
									id={node.code}
									name={node.name}
									type="number"
									aria-label={`Expense amount for ${node.name}`}
									class={`commodity-input h-8 pl-6 text-right font-mono text-sm transition-all ${
										missingStatus()
											? "ring-2 ring-destructive border-destructive text-destructive font-semibold opacity-70 cursor-not-allowed"
											: isMatch()
												? "ring-2 ring-yellow-400 dark:ring-amber-500/50 border-yellow-400 dark:border-amber-500/50 bg-card scale-105"
												: displayValue() > 0
													? "bg-primary/5 border-primary/20 font-semibold"
													: "bg-transparent border-transparent hover:border-border hover:bg-card"
									}`.replace(/\s+/g, " ")}
									placeholder="0"
									value={inputText()}
									min={0}
									max={500000}
									disabled={missingStatus()}
									onKeyDown={handleKeyDown}
									onInput={handleInput}
									onBlur={handleBlur}
									onFocus={handleFocus}
									onPointerDown={() => {
										isPointerDown = true;
									}}
								/>
							}
						>
							<div class="h-8 pl-6 pr-3 flex items-center justify-end text-sm font-semibold text-foreground/80 bg-muted/60 rounded-md tabular-nums">
								{displayValue().toLocaleString(undefined, {
									maximumFractionDigits: 2,
								})}
							</div>
						</Show>
					</div>
					<Show when={isMobile() && missingStatus() && !hasChildren}>
						<div class="col-span-5 flex items-center justify-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 animate-in fade-in">
							<AlertTriangle class="w-3.5 h-3.5" />
							<span>No official CPI data</span>
						</div>
					</Show>
				</div>
			</div>

			<Show when={hasChildren}>
				<CollapsibleContent class="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
					<div class="w-full">
						<For each={node.children}>{(child) => <ExpenseNode node={child} level={level + 1} />}</For>
					</div>
				</CollapsibleContent>
			</Show>
		</Collapsible>
	);
};

export default ExpenseNode;
