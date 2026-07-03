import { SearchIcon } from "lucide-solid";
import type { ComponentProps, JSX } from "solid-js";
import {
	createContext,
	createMemo,
	createSignal,
	onCleanup,
	onMount,
	Show,
	splitProps,
	useContext,
} from "solid-js";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/primitives/dialog";
import { cn } from "@/lib/utils";

type CommandContextValue = {
	query: () => string;
	setQuery: (value: string) => void;
	shouldFilter: () => boolean;
	registerItem: (text: () => string) => () => void;
	isVisible: (text: string) => boolean;
	hasMatches: () => boolean;
};

const CommandContext = createContext<CommandContextValue>();

type CommandProps = ComponentProps<"div"> & { shouldFilter?: boolean };

function Command(props: CommandProps) {
	const [query, setQuery] = createSignal("");
	const [local, rest] = splitProps(props, ["class", "shouldFilter"]);
	const [items, setItems] = createSignal<(() => string)[]>([]);
	let rootRef!: HTMLDivElement;

	const shouldFilter = () => local.shouldFilter ?? true;
	const normalizedQuery = createMemo(() => query().toLowerCase().trim());

	const isVisible = (text: string) => {
		if (!shouldFilter() || !normalizedQuery() || !text) return true;
		return text.toLowerCase().includes(normalizedQuery());
	};

	const registerItem = (text: () => string) => {
		setItems((prev) => [...prev, text]);
		return () => setItems((prev) => prev.filter((t) => t !== text));
	};

	const hasMatches = createMemo(() => {
		if (!shouldFilter() || !normalizedQuery()) return true;
		return items().some((text) => isVisible(text()));
	});

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

		const visibleItems = Array.from(
			rootRef.querySelectorAll<HTMLButtonElement>('[data-slot="command-item"]:not(:disabled)'),
		).filter((el) => el.offsetParent !== null);
		if (visibleItems.length === 0) return;

		event.preventDefault();

		const active = document.activeElement;
		const currentIndex = active instanceof HTMLButtonElement ? visibleItems.indexOf(active) : -1;
		const input = rootRef.querySelector<HTMLInputElement>('[data-slot="command-input"]');

		if (event.key === "ArrowDown") {
			const next =
				currentIndex < 0
					? visibleItems[0]
					: visibleItems[Math.min(currentIndex + 1, visibleItems.length - 1)];
			next?.focus();
		} else {
			if (currentIndex === 0) {
				input?.focus();
			} else if (currentIndex > 0) {
				visibleItems[currentIndex - 1]?.focus();
			} else {
				visibleItems[visibleItems.length - 1]?.focus();
			}
		}
	};

	return (
		<CommandContext.Provider value={{ query, setQuery, shouldFilter, registerItem, isVisible, hasMatches }}>
			<div
				ref={rootRef}
				data-slot="command"
				onKeyDown={onKeyDown}
				{...rest}
				class={cn(
					"bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
					local.class,
				)}
			/>
		</CommandContext.Provider>
	);
}

type CommandDialogProps = Parameters<typeof Dialog>[0] & {
	title?: string;
	description?: string;
	class?: string;
	showCloseButton?: boolean;
	children?: JSX.Element;
};

function CommandDialog(props: CommandDialogProps) {
	const [local, rest] = splitProps(props, ["title", "description", "children", "class", "showCloseButton"]);

	return (
		<Dialog {...rest}>
			<DialogHeader class="sr-only">
				<DialogTitle>{local.title ?? "Command Palette"}</DialogTitle>
				<DialogDescription>{local.description ?? "Search for a command to run..."}</DialogDescription>
			</DialogHeader>
			<DialogContent
				class={cn("overflow-hidden p-0", local.class)}
				showCloseButton={local.showCloseButton ?? true}
			>
				<Command>{local.children}</Command>
			</DialogContent>
		</Dialog>
	);
}

type CommandInputProps = Omit<ComponentProps<"input">, "onInput"> & {
	onValueChange?: (value: string) => void;
};

function CommandInput(props: CommandInputProps) {
	const context = useContext(CommandContext);
	const [local, rest] = splitProps(props, ["class", "onValueChange", "value"]);
	const onInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (event) => {
		const value = event.currentTarget.value;
		context?.setQuery(value);
		local.onValueChange?.(value);
	};

	return (
		<div
			data-slot="command-input-wrapper"
			class="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3"
		>
			<SearchIcon class="size-4 shrink-0 opacity-50" />
			<input
				ref={(element) => {
					requestAnimationFrame(() => element.focus());
				}}
				data-slot="command-input"
				onInput={onInput}
				{...rest}
				class={cn(
					"placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
					local.class,
				)}
				value={local.value ?? context?.query() ?? ""}
			/>
		</div>
	);
}

function CommandList(props: ComponentProps<"div">) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<div
			data-slot="command-list"
			role="listbox"
			{...rest}
			class={cn("max-h-75 scroll-py-1 overflow-x-hidden overflow-y-auto overscroll-contain", local.class)}
		/>
	);
}

function CommandEmpty(props: ComponentProps<"div">) {
	const context = useContext(CommandContext);
	const [local, rest] = splitProps(props, ["class"]);
	const visible = () => !context || !context.shouldFilter() || !context.hasMatches();
	return (
		<Show when={visible()}>
			<div data-slot="command-empty" {...rest} class={cn("py-6 text-center text-sm", local.class)} />
		</Show>
	);
}

function CommandGroup(props: ComponentProps<"div"> & { heading?: JSX.Element }) {
	const [local, rest] = splitProps(props, ["class", "heading", "children"]);
	return (
		<div data-slot="command-group" {...rest} class={cn("text-foreground overflow-hidden p-1", local.class)}>
			{local.heading && (
				<div class="text-muted-foreground px-2 py-1.5 text-xs font-medium">{local.heading}</div>
			)}
			{local.children}
		</div>
	);
}

function CommandSeparator(props: ComponentProps<"div">) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<div
			data-slot="command-separator"
			role="separator"
			{...rest}
			class={cn("bg-border -mx-1 h-px", local.class)}
		/>
	);
}

function CommandItem(
	props: Omit<ComponentProps<"button">, "onSelect"> & { value?: string; onSelect?: (value: string) => void },
) {
	const context = useContext(CommandContext);
	const [local, rest] = splitProps(props, ["class", "value", "onSelect", "onClick", "children"]);

	onMount(() => {
		if (!context) return;
		const unregister = context.registerItem(() => local.value ?? "");
		onCleanup(unregister);
	});

	const visible = () => !context || !local.value || context.isVisible(local.value);

	const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
		if (typeof local.onClick === "function") local.onClick(event);
		if (!event.currentTarget.disabled)
			local.onSelect?.(local.value ?? event.currentTarget.textContent?.trim() ?? "");
	};

	return (
		<button
			type="button"
			data-slot="command-item"
			role="option"
			onClick={onClick}
			{...rest}
			class={cn(
				"focus:bg-primary/10 focus:text-foreground hover:bg-primary/10 hover:text-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				!visible() && "hidden",
				local.class,
			)}
		>
			{local.children}
		</button>
	);
}

function CommandShortcut(props: ComponentProps<"span">) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<span
			data-slot="command-shortcut"
			{...rest}
			class={cn("text-muted-foreground ml-auto text-xs tracking-widest", local.class)}
		/>
	);
}

export {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
};
