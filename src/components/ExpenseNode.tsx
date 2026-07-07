import { ArrowLeft, ChevronDown, ChevronRight, Equal, InfoIcon, TriangleAlert } from "lucide-solid";
import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";
import type { DisplayNode } from "@/components/ExpenseTab";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
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

const ExpenseNode = (props: { node: DisplayNode; level: number }) => {
	const currMode = () => mode.get();
	const hasChildren = () => Boolean(props.node.children && props.node.children.length > 0);

	const isMatch = () => highlightState.code.get() === props.node.code;
	const highlightLabel = () => (isMatch() ? highlightState.label.get() : "");
	const displayValue = () =>
		hasChildren()
			? categoryTotals[props.node.code]?.get() || 0
			: detailedExpenses[props.node.code]?.get()?.value || 0;
	const isOpen = () => expandedNodes[props.node.code]?.get() ?? (props.level < 1 || displayValue() > 0);
	const isMissing = () => missingDetailedItems.get().has(props.node.code);
	const isReady = () => prefetchReady.get();

	const missingStatus = () => isReady() && isMissing();

	let inputRef!: HTMLInputElement;
	let rowRef!: HTMLDivElement;
	let isPointerDown = false;
	const isMobile = useIsMobile();

	createEffect(() => {
		if (isMatch()) {
			rowRef?.scrollIntoView({ behavior: "smooth", block: "center" });
			if (!hasChildren()) {
				setTimeout(() => inputRef?.focus(), 500);
			}
		}
	});

	// Keep children mounted briefly after collapse so the collapsible-up keyframe
	// can play before <Show> unmounts them (Solid has no built-in exit transition).
	const [rendering, setRendering] = createSignal(isOpen());
	createEffect(() => {
		if (isOpen()) {
			setRendering(true);
			return;
		}
		const timer = setTimeout(() => setRendering(false), 200);
		onCleanup(() => clearTimeout(timer));
	});

	const commitValue = (nextValue: number) =>
		updateExpenseValue(props.node.code, props.node.name, nextValue, "detailed");

	const inputLimit = () => (currMode() === "percent" ? 100 : 500000);
	const inputText = () => {
		const limited = getLimitValue(currMode(), displayValue());
		return limited > 0 ? String(limited) : "";
	};

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
		e.currentTarget.value = inputText();
	};

	const handleToggle = (open: boolean) => {
		toggleExpansion(props.node.code, open);
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
		<div class="w-full">
			<div
				ref={rowRef}
				style={{ "padding-left": `${props.level * 20 + 12}px` }}
				class={`group flex items-center gap-2 py-2 px-3 border-b transition-all duration-300
					${
						missingStatus()
							? "bg-error/10 border-error/40 ring-inset ring-1 ring-error"
							: isMatch()
								? "bg-warning/10 border-warning/40 ring-inset ring-1 ring-warning"
								: hasChildren()
									? props.level === 0
										? "bg-primary/15 border-primary/30 hover:bg-primary/20"
										: "bg-primary/8 border-primary/20 hover:bg-primary/12"
									: "bg-base-100 border-border hover:bg-base-200"
					}
				`.replace(/\s+/g, " ")}
			>
				<Show when={hasChildren()}>
					<button
						type="button"
						disabled={!hasChildren()}
						tabIndex={-1}
						onClick={() => handleToggle(!isOpen())}
						class={`p-0.5 rounded transition-colors ${hasChildren() ? "text-primary hover:text-primary hover:bg-primary/15 cursor-pointer" : "w-5"}`}
						aria-label={isOpen() ? `Collapse ${props.node.name}` : `Expand ${props.node.name}`}
						aria-expanded={isOpen()}
					>
						<Show when={isOpen()} fallback={<ChevronRight class="h-4 w-4" />}>
							<ChevronDown class="h-4 w-4" />
						</Show>
					</button>
				</Show>

				<div class="grid grid-cols-5 items-center w-full gap-2">
					<div class="col-span-3">
						<div class="flex items-center gap-2">
							<Show when={SUB_CATEGORY_DESCRIPTIONS[props.node.code]}>
								<Popover>
									<PopoverTrigger
										tabIndex={-1}
										class="outline-none focus:ring-0 flex items-center justify-center bg-transparent border-0 p-0"
										aria-label={`View description for ${props.node.name}`}
									>
										<InfoIcon class="h-3.5 w-3.5 shrink-0 text-primary/60 hover:text-primary cursor-pointer transition-colors" />
									</PopoverTrigger>
									<PopoverContent class="w-72 p-3 text-sm">
										{SUB_CATEGORY_DESCRIPTIONS[props.node.code]}
									</PopoverContent>
								</Popover>
							</Show>
							<p
								class={`text-sm text-wrap text-left
								${props.level === 0 ? "font-bold" : "text-foreground"}
								${isMatch() ? "font-extrabold" : ""}`}
							>
								{props.node.name}
							</p>

							<Show when={isMatch()}>
								<span class="text-xs font-bold text-primary text-wrap animate-in fade-in slide-in-from-left-2">
									<ArrowLeft class="w-3.5 h-3.5 inline-block" /> {highlightLabel()} belongs here
								</span>
							</Show>
							<Show when={!isMobile() && missingStatus()}>
								<div class="flex items-center gap-2 text-xs font-bold text-error animate-in fade-in">
									<TriangleAlert class="w-3.5 h-3.5" />
									<span>No CPI data</span>
								</div>
							</Show>
						</div>
					</div>

					<div class="col-span-2 relative rounded-xl">
						<span class="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-xs font-semibold text-base-content/70 pointer-events-none">
							<Show
								when={hasChildren()}
								fallback={
									<Show when={currMode() === "percent"} fallback="PhP">
										%
									</Show>
								}
							>
								<Equal class="w-3.5 h-3.5 inline-block text-primary" />
							</Show>
						</span>

						<Show
							when={hasChildren()}
							fallback={
								<input
									ref={inputRef}
									id={props.node.code}
									name={props.node.name}
									type="number"
									aria-label={`Expense amount for ${props.node.name}`}
									class={`input input-bordered commodity-input w-full h-8 pl-6 text-right font-mono text-sm transition-all ${
										missingStatus()
											? "ring-2 ring-error border-error text-error font-semibold opacity-70 cursor-not-allowed"
											: isMatch()
												? "ring-2 ring-warning border-warning bg-base-100 scale-105"
												: displayValue() > 0
													? "bg-primary/10 border-primary/50 text-foreground font-semibold"
													: "bg-base-200 border-base-300 text-foreground hover:border-primary/50 hover:bg-base-100"
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
							<div class="h-8 pl-6 pr-3 flex items-center justify-end text-sm font-semibold text-foreground bg-base-100 border border-primary/25 rounded-md tabular-nums">
								{displayValue().toLocaleString(undefined, {
									maximumFractionDigits: 2,
								})}
							</div>
						</Show>
					</div>
					<Show when={isMobile() && missingStatus() && !hasChildren()}>
						<div class="col-span-5 flex items-center justify-center gap-2 text-xs font-bold text-error animate-in fade-in">
							<TriangleAlert class="w-3.5 h-3.5" />
							<span>No CPI data</span>
						</div>
					</Show>
				</div>
			</div>

			<Show when={hasChildren() && rendering()}>
				<div
					class={`grid ${isOpen() ? "animate-collapsible-down" : "animate-collapsible-up"}`}
					style={{ "grid-template-rows": isOpen() ? "1fr" : "0fr" }}
				>
					<div class="overflow-hidden min-h-0">
						<div class="w-full">
							<For each={props.node.children}>
								{(child) => <ExpenseNode node={child} level={props.level + 1} />}
							</For>
						</div>
					</div>
				</div>
			</Show>
		</div>
	);
};

export default ExpenseNode;
