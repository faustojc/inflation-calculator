import type { ComponentProps, JSX } from "solid-js";
import {
	createContext,
	createEffect,
	createSignal,
	onCleanup,
	onMount,
	Show,
	splitProps,
	useContext,
} from "solid-js";
import { Portal } from "solid-js/web";
import { cn } from "@/lib/utils";

const PopoverContext = createContext<{
	open: () => boolean;
	setOpen: (open: boolean) => void;
	trigger: () => HTMLElement | undefined;
	setTrigger: (element: HTMLElement) => void;
}>();

type PopoverProps = {
	children?: JSX.Element;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	modal?: boolean;
};

function Popover(props: PopoverProps) {
	const [localOpen, setLocalOpen] = createSignal(props.defaultOpen ?? false);
	const [trigger, setTrigger] = createSignal<HTMLElement>();
	const open = () => props.open ?? localOpen();
	const setOpen = (next: boolean) => {
		setLocalOpen(next);
		props.onOpenChange?.(next);
	};

	return (
		<PopoverContext.Provider value={{ open, setOpen, trigger, setTrigger }}>
			{props.children}
		</PopoverContext.Provider>
	);
}

function PopoverTrigger(props: ComponentProps<"button"> & { asChild?: boolean }) {
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
					data-slot="popover-trigger"
					data-state={context?.open() ? "open" : "closed"}
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
				data-slot="popover-trigger"
				data-state={context?.open() ? "open" : "closed"}
				onClick={toggle}
			>
				{local.children}
			</span>
		</Show>
	);
}

function PopoverContent(
	props: ComponentProps<"div"> & { align?: "start" | "center" | "end"; sideOffset?: number },
) {
	const context = useContext(PopoverContext);
	let ref: HTMLDivElement | undefined;
	const [local, rest] = splitProps(props, ["class", "align", "sideOffset"]);
	const align = () => local.align ?? "center";
	const offset = () => local.sideOffset ?? 4;

	const MARGIN = 8;

	const updatePosition = () => {
		const trigger = context?.trigger();
		if (!trigger || !ref) return;
		const rect = trigger.getBoundingClientRect();
		ref.style.setProperty("--popover-trigger-width", `${rect.width}px`);

		const width = ref.offsetWidth;
		const height = ref.offsetHeight;

		let left =
			align() === "start"
				? rect.left
				: align() === "end"
					? rect.right - width
					: rect.left + rect.width / 2 - width / 2;
		left = Math.min(Math.max(MARGIN, left), Math.max(MARGIN, window.innerWidth - width - MARGIN));

		let top = rect.bottom + offset();
		if (top + height > window.innerHeight - MARGIN && rect.top - offset() - height >= MARGIN) {
			top = rect.top - offset() - height;
		}
		top = Math.min(Math.max(MARGIN, top), Math.max(MARGIN, window.innerHeight - height - MARGIN));

		ref.style.setProperty("--popover-left", `${left}px`);
		ref.style.setProperty("--popover-top", `${top}px`);
	};

	createEffect(() => {
		if (!context?.open()) return;

		updatePosition();

		const onDocumentPointerDown = (event: PointerEvent) => {
			const target = event.target as Node;
			if (ref?.contains(target) || context?.trigger()?.contains(target)) return;
			context?.setOpen(false);
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			event.stopPropagation();
			context?.setOpen(false);
			context?.trigger()?.querySelector<HTMLElement>("button, [tabindex]")?.focus();
		};

		document.addEventListener("pointerdown", onDocumentPointerDown);
		document.addEventListener("keydown", onKeyDown);
		window.addEventListener("resize", updatePosition);
		window.addEventListener("scroll", updatePosition, true);

		const resizeObserver =
			typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => updatePosition()) : undefined;
		if (ref) resizeObserver?.observe(ref);

		onCleanup(() => {
			document.removeEventListener("pointerdown", onDocumentPointerDown);
			document.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("resize", updatePosition);
			window.removeEventListener("scroll", updatePosition, true);
			resizeObserver?.disconnect();
		});
	});

	return (
		<Show when={context?.open()}>
			<Portal>
				<div
					ref={(element) => {
						ref = element;
					}}
					data-slot="popover-content"
					data-state="open"
					style={{ left: "var(--popover-left)", top: "var(--popover-top)" }}
					{...rest}
					class={cn(
						"bg-popover text-popover-foreground fixed z-50 flex max-h-[min(70vh,32rem)] flex-col overflow-hidden rounded-md border border-border p-4 shadow-md outline-hidden animate-in fade-in slide-in-from-top-2",
						local.class,
					)}
				/>
			</Portal>
		</Show>
	);
}

function PopoverAnchor(props: ComponentProps<"div">) {
	return <div data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
