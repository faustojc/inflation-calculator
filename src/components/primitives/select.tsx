import { CheckIcon, ChevronDownIcon } from "lucide-solid";
import type { ComponentProps, JSX } from "solid-js";
import { createContext, createEffect, createSignal, onCleanup, splitProps, useContext } from "solid-js";
import { cn } from "@/lib/utils";

const SelectContext = createContext<{
	value: () => string;
	setValue: (value: string) => void;
	open: () => boolean;
	setOpen: (open: boolean) => void;
	labelFor: (value: string) => string | undefined;
	setLabel: (value: string, label: string) => void;
}>();

type SelectProps = {
	children?: JSX.Element;
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	name?: string;
};

function Select(props: SelectProps) {
	const [localValue, setLocalValue] = createSignal(props.defaultValue ?? "");
	const [open, setOpen] = createSignal(false);
	// Reactive label registry: items register on mount (content stays mounted while
	// closed) so the trigger can show the item label before the first open.
	const [labels, setLabels] = createSignal<Map<string, string>>(new Map());
	const value = () => props.value ?? localValue();
	const setValue = (next: string) => {
		setLocalValue(next);
		props.onValueChange?.(next);
		setOpen(false);
	};
	const setLabel = (key: string, label: string) => {
		setLabels((previous) => {
			if (previous.get(key) === label) return previous;
			const next = new Map(previous);
			next.set(key, label);
			return next;
		});
	};

	let rootRef!: HTMLDivElement;

	// Dismiss on outside click / Escape while open.
	createEffect(() => {
		if (!open()) return;

		const onPointerDown = (event: PointerEvent) => {
			if (rootRef.contains(event.target as Node)) return;
			setOpen(false);
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			event.stopPropagation();
			setOpen(false);
			rootRef.querySelector<HTMLElement>('[data-slot="select-trigger"]')?.focus();
		};

		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		onCleanup(() => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		});
	});

	return (
		<SelectContext.Provider
			value={{ value, setValue, open, setOpen, labelFor: (key) => labels().get(key), setLabel }}
		>
			<div ref={rootRef} data-slot="select" class="relative">
				{props.children}
			</div>
		</SelectContext.Provider>
	);
}

function SelectGroup(props: ComponentProps<"div">) {
	return <div data-slot="select-group" {...props} />;
}

function SelectValue(props: ComponentProps<"span"> & { placeholder?: string }) {
	const context = useContext(SelectContext);
	const [local, rest] = splitProps(props, ["class", "placeholder"]);
	const current = () => context?.value() ?? "";
	return (
		<span data-slot="select-value" class={local.class} {...rest}>
			{context?.labelFor(current()) ?? (current() || local.placeholder)}
		</span>
	);
}

function SelectTrigger(props: ComponentProps<"button"> & { size?: "sm" | "default" }) {
	const context = useContext(SelectContext);
	const [local, rest] = splitProps(props, ["class", "size", "children", "onClick"]);
	const size = () => local.size ?? "default";
	const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
		if (typeof local.onClick === "function") local.onClick(event);
		context?.setOpen(!context.open());
	};

	return (
		<button
			type="button"
			data-slot="select-trigger"
			data-size={size()}
			aria-expanded={context?.open()}
			class={cn(
				"border-input data-placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				local.class,
			)}
			onClick={onClick}
			{...rest}
		>
			{local.children}
			<ChevronDownIcon class="size-4 opacity-50" />
		</button>
	);
}

function SelectContent(props: ComponentProps<"div"> & { position?: string; align?: string }) {
	const context = useContext(SelectContext);
	const [local, rest] = splitProps(props, ["class", "children", "position", "align"]);
	// Stays mounted while closed (hidden) so items can register their labels;
	// toggling display re-triggers the enter animation on each open.
	return (
		<div
			data-slot="select-content"
			data-state={context?.open() ? "open" : "closed"}
			{...rest}
			class={cn(
				"bg-popover text-popover-foreground absolute top-full left-0 z-50 mt-1 max-h-72 min-w-full overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md animate-in fade-in slide-in-from-top-2",
				!context?.open() && "hidden",
				local.class,
			)}
		>
			{local.children}
		</div>
	);
}

function SelectLabel(props: ComponentProps<"div">) {
	return (
		<div
			data-slot="select-label"
			{...props}
			class={cn("text-muted-foreground px-2 py-1.5 text-xs", props.class)}
		/>
	);
}

function SelectItem(props: ComponentProps<"button"> & { value: string; defaultValue?: string }) {
	const context = useContext(SelectContext);
	const [local, rest] = splitProps(props, ["class", "children", "value", "defaultValue", "onClick"]);
	const selected = () => context?.value() === local.value;
	const label = () => {
		const child = local.children;
		return typeof child === "string" || typeof child === "number" ? String(child) : local.value;
	};
	context?.setLabel(local.value, label());
	const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
		if (typeof local.onClick === "function") local.onClick(event);
		if (!event.currentTarget.disabled) context?.setValue(local.value);
	};

	return (
		<button
			type="button"
			data-slot="select-item"
			data-state={selected() ? "checked" : "unchecked"}
			class={cn(
				"focus:bg-primary/10 focus:text-foreground hover:bg-primary/10 hover:text-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-left text-sm outline-hidden select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				local.class,
			)}
			onClick={onClick}
			{...rest}
		>
			<span class="absolute right-2 flex size-3.5 items-center justify-center">
				{selected() && <CheckIcon class="size-4" />}
			</span>
			{local.children}
		</button>
	);
}

function SelectSeparator(props: ComponentProps<"div">) {
	return (
		<div
			data-slot="select-separator"
			role="separator"
			{...props}
			class={cn("bg-border pointer-events-none -mx-1 my-1 h-px", props.class)}
		/>
	);
}

function SelectScrollUpButton(props: ComponentProps<"div">) {
	return <div data-slot="select-scroll-up-button" class={cn("hidden", props.class)} {...props} />;
}

function SelectScrollDownButton(props: ComponentProps<"div">) {
	return <div data-slot="select-scroll-down-button" class={cn("hidden", props.class)} {...props} />;
}

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};
