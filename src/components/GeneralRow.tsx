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
import { CircleAlert } from "lucide-solid";
import { createEffect, createSignal, lazy, Show, Suspense } from "solid-js";

const ImagePreviewModal = lazy(() => import("@/components/ImagePreviewModal"));

const GeneralRow = (props: Readonly<{ cat: CommodityDef }>) => {
	const m = () => mode.get();
	const [previewOpen, setPreviewOpen] = createSignal(false);

	const value = () => getLimitValue(m(), generalExpenses[props.cat.code]?.get()?.value || 0);
	const isMatch = () => highlightState.code.get() === props.cat.code;
	const highlightLabel = () => (isMatch() ? highlightState.label.get() : "");
	const isMissing = () => missingGeneralItems.get().has(props.cat.code);
	const isReady = () => prefetchReady.get();

	const missingStatus = () => isReady() && isMissing();

	let rowRef!: HTMLDivElement;
	let inputRef!: HTMLInputElement;
	let isPointerDown = false;

	const hasFilled = () => value() > 0;

	createEffect(() => {
		if (isMatch()) {
			rowRef?.scrollIntoView({ behavior: "smooth", block: "center" });
			setTimeout(() => inputRef?.focus(), 300);
		}
	});

	const commitValue = (nextValue: number) => updateExpenseValue(props.cat.code, props.cat.name, nextValue, "general");

	const inputLimit = () => (m() === "percent" ? 100 : 500000);
	const displayValue = () => (value() > 0 ? String(value()) : "");

	const handleInput = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
		const el = e.currentTarget;
		if (el.value === "") {
			commitValue(0);
			return;
		}

		const parsed = Number.parseFloat(el.value);
		if (!Number.isFinite(parsed) || parsed < 0) {
			el.value = displayValue();
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
		e.currentTarget.value = displayValue();
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
		<div
			ref={rowRef}
			class={`
				grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl border transition-all duration-300
				${
					missingStatus()
						? "bg-error/10 border-error/40 ring-2 ring-error/40 shadow-md"
						: isMatch()
							? "bg-warning/10 border-warning/40 ring-2 ring-warning/40 shadow-md"
							: hasFilled()
								? "bg-primary/5 border-primary/20 shadow-sm"
								: "bg-card border-border hover:border-primary/30 hover:shadow-sm"
				}
			`.replace(/\s+/g, " ")}
		>
			<div class="col-span-2 min-w-0">
				<div class="flex items-center gap-2 mb-0.5">
					<button
						type="button"
						tabIndex={-1}
						class="shrink-0 rounded-lg overflow-hidden cursor-zoom-in transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
						aria-label={`View full image for ${props.cat.name}`}
						onClick={() => setPreviewOpen(true)}
					>
						<img
							src={`major/${props.cat.code}.jpg`}
							alt={props.cat.name}
							width={48}
							height={48}
							class="w-12 h-12 block object-cover"
							loading="lazy"
							decoding="async"
						/>
					</button>
					<h3 class={`font-semibold text-base text-wrap ${isMatch() ? "font-extrabold" : ""}`}>{props.cat.name}</h3>
					<Show when={isMatch()}>
						<p class="text-xs font-bold text-primary text-wrap animate-in fade-in">
							← {highlightLabel() || "It"} belongs here
						</p>
					</Show>
				</div>
			</div>

			<div class="col-span-2 md:col-span-1 flex items-center justify-center order-last md:order-0 w-full shrink-0">
				<div class="relative w-full">
					<span class="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-base-content/70 text-xs font-semibold pointer-events-none">
						{m() === "percent" ? "%" : "PhP"}
					</span>
					<input
						ref={inputRef}
						type="number"
						id={props.cat.code}
						name={props.cat.name}
						aria-label={`Expense amount for ${props.cat.name}`}
						min={0}
						max={500000}
						placeholder="0"
						class={`
							input input-bordered commodity-input
							pl-8 font-mono text-right text-sm h-9
							${
								missingStatus()
									? "ring-2 ring-error border-error text-error font-semibold opacity-70 cursor-not-allowed"
									: isMatch()
										? "ring-2 ring-warning border-warning"
										: hasFilled()
											? "border-primary font-semibold"
											: ""
							}
						`.replace(/\s+/g, " ")}
						value={displayValue()}
						disabled={missingStatus()}
						onKeyDown={handleKeyDown}
						onInput={handleInput}
						onBlur={handleBlur}
						onFocus={handleFocus}
						onPointerDown={() => {
							isPointerDown = true;
						}}
					/>
				</div>
			</div>

			<p class="col-span-3 text-sm text-muted-foreground leading-relaxed line-clamp-2">
				{MAJOR_CATEGORY_DESCRIPTIONS[props.cat.code] || "General expenses"}
			</p>
			<Show when={missingStatus()}>
				<div class="col-span-3 flex items-center justify-center gap-1 text-xs font-bold text-error animate-in fade-in">
					<CircleAlert class="w-3.5 h-3.5" />
					<span>No official CPI data</span>
				</div>
			</Show>

			<Show when={previewOpen()}>
				<Suspense fallback={null}>
					<ImagePreviewModal
						src={`major/${props.cat.code}.jpg`}
						alt={props.cat.name}
						title={props.cat.name}
						caption={MAJOR_CATEGORY_DESCRIPTIONS[props.cat.code] || "General expenses"}
						onClose={() => setPreviewOpen(false)}
					/>
				</Suspense>
			</Show>
		</div>
	);
};

export default GeneralRow;
