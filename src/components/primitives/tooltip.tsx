import type { ComponentProps, JSX } from "solid-js";
import { createContext, createSignal, Show, splitProps, useContext } from "solid-js";
import { cn } from "@/lib/utils";

const TooltipContext = createContext<{ open: () => boolean; setOpen: (open: boolean) => void }>();

function TooltipProvider(props: { children?: JSX.Element; delayDuration?: number }) {
	return <>{props.children}</>;
}

function Tooltip(props: { children?: JSX.Element }) {
	const [open, setOpen] = createSignal(false);
	return <TooltipContext.Provider value={{ open, setOpen }}>{props.children}</TooltipContext.Provider>;
}

function TooltipTrigger(props: ComponentProps<"button"> & { asChild?: boolean }) {
	const context = useContext(TooltipContext);
	const [local, rest] = splitProps(props, ["asChild", "children"]);
	const show = () => context?.setOpen(true);
	const hide = () => context?.setOpen(false);

	return (
		<Show
			when={local.asChild}
			fallback={
				<button
					type="button"
					data-slot="tooltip-trigger"
					onPointerEnter={show}
					onPointerLeave={hide}
					{...rest}
				>
					{local.children}
				</button>
			}
		>
			<span data-slot="tooltip-trigger" onPointerEnter={show} onPointerLeave={hide}>
				{local.children}
			</span>
		</Show>
	);
}

function TooltipContent(props: ComponentProps<"div"> & { sideOffset?: number }) {
	const context = useContext(TooltipContext);
	const [local, rest] = splitProps(props, ["class", "children", "sideOffset"]);
	return (
		<Show when={context?.open()}>
			<div
				data-slot="tooltip-content"
				role="tooltip"
				class={cn(
					"bg-foreground text-background z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance",
					local.class,
				)}
				{...rest}
			>
				{local.children}
			</div>
		</Show>
	);
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
