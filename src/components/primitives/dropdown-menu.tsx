import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-solid";
import type { ComponentProps, JSX } from "solid-js";
import { createContext, createSignal, Show, splitProps, useContext } from "solid-js";
import { cn } from "@/lib/utils";

const MenuContext = createContext<{ open: () => boolean; setOpen: (open: boolean) => void }>();

function DropdownMenu(props: {
	children?: JSX.Element;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	const [localOpen, setLocalOpen] = createSignal(false);
	const open = () => props.open ?? localOpen();
	const setOpen = (next: boolean) => {
		setLocalOpen(next);
		props.onOpenChange?.(next);
	};
	return <MenuContext.Provider value={{ open, setOpen }}>{props.children}</MenuContext.Provider>;
}

function DropdownMenuPortal(props: { children?: JSX.Element }) {
	return <>{props.children}</>;
}

function DropdownMenuTrigger(props: ComponentProps<"button"> & { asChild?: boolean }) {
	const context = useContext(MenuContext);
	const [local, rest] = splitProps(props, ["asChild", "children", "onClick"]);
	const toggle = () => context?.setOpen(!context.open());
	const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
		if (typeof local.onClick === "function") local.onClick(event);
		toggle();
	};

	return (
		<Show
			when={local.asChild}
			fallback={
				<button type="button" data-slot="dropdown-menu-trigger" onClick={onClick} {...rest}>
					{local.children}
				</button>
			}
		>
			<span data-slot="dropdown-menu-trigger" onClick={toggle}>
				{local.children}
			</span>
		</Show>
	);
}

function DropdownMenuContent(props: ComponentProps<"div"> & { sideOffset?: number }) {
	const context = useContext(MenuContext);
	const [local, rest] = splitProps(props, ["class", "sideOffset"]);
	return (
		<Show when={context?.open()}>
			<div
				data-slot="dropdown-menu-content"
				role="menu"
				class={cn(
					"bg-popover text-popover-foreground z-50 max-h-72 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
					local.class,
				)}
				{...rest}
			/>
		</Show>
	);
}

function DropdownMenuGroup(props: ComponentProps<"div">) {
	return <div data-slot="dropdown-menu-group" role="group" {...props} />;
}

function DropdownMenuItem(
	props: ComponentProps<"button"> & { inset?: boolean; variant?: "default" | "destructive" },
) {
	const [local, rest] = splitProps(props, ["class", "inset", "variant", "children"]);
	return (
		<button
			type="button"
			data-slot="dropdown-menu-item"
			data-inset={local.inset}
			data-variant={local.variant ?? "default"}
			class={cn(
				"focus:bg-primary/10 focus:text-foreground hover:bg-primary/10 hover:text-foreground data-[variant=destructive]:text-destructive relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden select-none disabled:pointer-events-none disabled:opacity-50 data-[inset=true]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				local.class,
			)}
			{...rest}
		>
			{local.children}
		</button>
	);
}

function DropdownMenuCheckboxItem(props: ComponentProps<"button"> & { checked?: boolean }) {
	const [local, rest] = splitProps(props, ["class", "children", "checked"]);
	return (
		<DropdownMenuItem class={cn("pl-8", local.class)} {...rest}>
			<span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
				{local.checked && <CheckIcon class="size-4" />}
			</span>
			{local.children}
		</DropdownMenuItem>
	);
}

function DropdownMenuRadioGroup(
	props: ComponentProps<"div"> & { value?: string; onValueChange?: (value: string) => void },
) {
	return <div data-slot="dropdown-menu-radio-group" role="radiogroup" {...props} />;
}

function DropdownMenuRadioItem(props: ComponentProps<"button"> & { checked?: boolean }) {
	const [local, rest] = splitProps(props, ["class", "children", "checked"]);
	return (
		<DropdownMenuItem class={cn("pl-8", local.class)} {...rest}>
			<span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
				{local.checked && <CircleIcon class="size-2 fill-current" />}
			</span>
			{local.children}
		</DropdownMenuItem>
	);
}

function DropdownMenuLabel(props: ComponentProps<"div"> & { inset?: boolean }) {
	const [local, rest] = splitProps(props, ["class", "inset"]);
	return (
		<div
			data-slot="dropdown-menu-label"
			data-inset={local.inset}
			class={cn("px-2 py-1.5 text-sm font-medium data-[inset=true]:pl-8", local.class)}
			{...rest}
		/>
	);
}

function DropdownMenuSeparator(props: ComponentProps<"div">) {
	return (
		<div
			data-slot="dropdown-menu-separator"
			role="separator"
			{...props}
			class={cn("bg-border -mx-1 my-1 h-px", props.class)}
		/>
	);
}

function DropdownMenuShortcut(props: ComponentProps<"span">) {
	return (
		<span
			data-slot="dropdown-menu-shortcut"
			class={cn("text-muted-foreground ml-auto text-xs tracking-widest", props.class)}
			{...props}
		/>
	);
}

function DropdownMenuSub(props: { children?: JSX.Element }) {
	return <>{props.children}</>;
}

function DropdownMenuSubTrigger(props: ComponentProps<"button"> & { inset?: boolean }) {
	const [local, rest] = splitProps(props, ["class", "inset", "children"]);
	return (
		<DropdownMenuItem class={cn(local.inset && "pl-8", local.class)} {...rest}>
			{local.children}
			<ChevronRightIcon class="ml-auto size-4" />
		</DropdownMenuItem>
	);
}

function DropdownMenuSubContent(props: ComponentProps<"div">) {
	return (
		<div
			data-slot="dropdown-menu-sub-content"
			{...props}
			class={cn(
				"bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
				props.class,
			)}
		/>
	);
}

export {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
};
