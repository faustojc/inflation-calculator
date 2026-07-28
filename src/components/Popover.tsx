import { cn } from "@/lib/utils";
import type { ComponentProps, JSX } from "solid-js";
import { createContext, createEffect, createSignal, onCleanup, onMount, Show, splitProps, useContext } from "solid-js";
import { Portal } from "solid-js/web";

const PopoverContext = createContext<{
	open: () => boolean;
	setOpen: (open: boolean) => void;
	trigger: () => HTMLElement | undefined;
	setTrigger: (element: HTMLElement) => void;
	modal: () => boolean;
}>();

type PopoverProps = {
	children?: JSX.Element;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	modal?: boolean;
};

export function Popover(props: PopoverProps) {
	const [localOpen, setLocalOpen] = createSignal(props.defaultOpen ?? false);
	const [trigger, setTrigger] = createSignal<HTMLElement>();
	const open = () => props.open ?? localOpen();
	const setOpen = (next: boolean) => {
		setLocalOpen(next);
		props.onOpenChange?.(next);
	};

	return (
		<PopoverContext.Provider value={{ open, setOpen, trigger, setTrigger, modal: () => props.modal ?? false }}>
			{props.children}
		</PopoverContext.Provider>
	);
}

export function PopoverTrigger(props: ComponentProps<"button"> & { asChild?: boolean }) {
	const context = useContext(PopoverContext);
	let ref: HTMLElement | undefined;
	const [local, rest] = splitProps(props, ["asChild", "children", "onClick"]);
	const toggle = () => context?.setOpen(!context.open());
	const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
		if (typeof local.onClick === "function") local.onClick(event);
		toggle();
	};

	onMount(() => {
		if (ref) context?.setTrigger(ref);
	});

	return (
		<Show
			when={local.asChild}
			fallback={
				<button
					ref={(element) => {
						ref = element;
					}}
					type="button"
					aria-expanded={context?.open()}
					onClick={onClick}
					{...rest}
				>
					{local.children}
				</button>
			}
		>
			<span
				ref={(element) => {
					ref = element;
				}}
				class="block w-full"
				onClick={toggle}
			>
				{local.children}
			</span>
		</Show>
	);
}

export function PopoverContent(props: ComponentProps<"div"> & { align?: "start" | "center" | "end"; sideOffset?: number }) {
	const context = useContext(PopoverContext);
	let ref: HTMLDivElement | undefined;
	const [local, rest] = splitProps(props, ["class", "align", "sideOffset"]);

	createEffect(() => {
		if (!context?.open() || !ref) return;
		const el = ref;
		const align = local.align ?? "center";
		const offset = local.sideOffset ?? 4;
		let side: "top" | "bottom" | undefined;
		let frame = 0;

		const position = () => {
			const trigger = context.trigger();
			if (!trigger) return;
			const rect = trigger.getBoundingClientRect();
			el.style.setProperty("--popover-trigger-width", `${rect.width}px`);

			const width = el.offsetWidth;
			let left =
				align === "start" ? rect.left : align === "end" ? rect.right - width : rect.left + rect.width / 2 - width / 2;

			left = Math.min(Math.max(8, left), Math.max(8, window.innerWidth - width - 8));
			el.style.left = `${left}px`;

			const spaceBelow = window.innerHeight - rect.bottom - offset - 8;
			const spaceAbove = rect.top - offset - 8;
			side ??= spaceBelow >= el.offsetHeight || spaceBelow >= spaceAbove ? "bottom" : "top";

			const maxHeight = Math.min(window.innerHeight * 0.7, 512, side === "bottom" ? spaceBelow : spaceAbove);
			el.style.maxHeight = `${Math.max(0, maxHeight)}px`;
			if (side === "bottom") {
				el.style.top = `${rect.bottom + offset}px`;
				el.style.bottom = "auto";
			} else {
				el.style.bottom = `${window.innerHeight - rect.top + offset}px`;
				el.style.top = "auto";
			}
		};

		const schedule = () => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				position();
			});
		};

		position();

		const onDocumentPointerDown = (event: PointerEvent) => {
			const target = event.target as Node;
			if (el.contains(target) || context.trigger()?.contains(target)) return;
			context.setOpen(false);
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			event.stopPropagation();
			context.setOpen(false);
			context.trigger()?.querySelector<HTMLElement>("button, [tabindex]")?.focus();
		};
		const resizeObserver = new ResizeObserver(schedule);
		resizeObserver.observe(el);

		document.addEventListener("pointerdown", onDocumentPointerDown);
		document.addEventListener("keydown", onKeyDown);
		window.addEventListener("resize", schedule);

		let onScroll: ((event: Event) => void) | undefined;
		if (context.modal()) {
			const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
			const prevOverflow = document.body.style.overflow;
			const prevPaddingRight = document.body.style.paddingRight;
			document.body.style.overflow = "hidden";
			if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
			onCleanup(() => {
				document.body.style.overflow = prevOverflow;
				document.body.style.paddingRight = prevPaddingRight;
			});
		} else {
			onScroll = (event: Event) => {
				if (event.target instanceof Node && el.contains(event.target)) return;
				schedule();
			};
			window.addEventListener("scroll", onScroll, true);
		}

		onCleanup(() => {
			cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			document.removeEventListener("pointerdown", onDocumentPointerDown);
			document.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("resize", schedule);
			if (onScroll) window.removeEventListener("scroll", onScroll, true);
		});
	});

	return (
		<Show when={context?.open()}>
			<Portal>
				<div
					ref={(element) => {
						ref = element;
					}}
					{...rest}
					class={cn(
						"popover fixed z-50 flex flex-col overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none",
						local.class,
					)}
				/>
			</Portal>
		</Show>
	);
}
