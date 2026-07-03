import DrawerPrimitive from "@corvu/drawer";
import type { ComponentProps, JSX } from "solid-js";
import { Show, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

type DrawerProps = ComponentProps<typeof DrawerPrimitive> & {
	direction?: "top" | "bottom" | "left" | "right";
};

function Drawer(props: DrawerProps) {
	const [local, rest] = splitProps(props, ["direction"]);
	return <DrawerPrimitive data-slot="drawer" side={local.direction ?? rest.side ?? "bottom"} {...rest} />;
}

function DrawerTrigger(props: ComponentProps<typeof DrawerPrimitive.Trigger>) {
	return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal(props: ComponentProps<typeof DrawerPrimitive.Portal>) {
	return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose(props: ComponentProps<"button"> & { asChild?: boolean; children?: JSX.Element }) {
	const context = DrawerPrimitive.useDialogContext();
	const [local, rest] = splitProps(props, ["asChild", "children", "onClick"]);
	const close = (event: MouseEvent) => {
		if (typeof local.onClick === "function")
			local.onClick(event as MouseEvent & { currentTarget: HTMLButtonElement; target: Element });
		context.setOpen(false);
	};

	return (
		<Show
			when={local.asChild}
			fallback={
				<button type="button" data-slot="drawer-close" onClick={close} {...rest}>
					{local.children}
				</button>
			}
		>
			<span data-slot="drawer-close" onClick={close}>
				{local.children}
			</span>
		</Show>
	);
}

function DrawerOverlay(props: ComponentProps<typeof DrawerPrimitive.Overlay>) {
	return (
		<DrawerPrimitive.Overlay
			data-slot="drawer-overlay"
			{...props}
			class={cn("fixed inset-0 z-50 bg-black/50 animate-in fade-in motion-reduce:animate-none", props.class)}
		/>
	);
}

function DrawerContent(props: ComponentProps<typeof DrawerPrimitive.Content>) {
	const [local, rest] = splitProps(props, ["class", "children"]);
	return (
		<DrawerPortal>
			<DrawerOverlay />
			<DrawerPrimitive.Content
				data-slot="drawer-content"
				{...rest}
				class={cn(
					"group/drawer-content bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto max-h-screen flex-col md:max-h-[96vh]",
					"data-transitioning:transition-transform data-transitioning:duration-500 data-transitioning:ease-[cubic-bezier(0.32,0.72,0,1)]",
					"motion-reduce:data-transitioning:transition-none motion-reduce:data-transitioning:duration-0",
					local.class,
				)}
			>
				{local.children}
			</DrawerPrimitive.Content>
		</DrawerPortal>
	);
}

function DrawerHeader(props: ComponentProps<"div">) {
	return (
		<div
			data-slot="drawer-header"
			{...props}
			class={cn("flex flex-col gap-0.5 p-4 md:gap-1.5 md:text-left", props.class)}
		/>
	);
}

function DrawerFooter(props: ComponentProps<"div">) {
	return (
		<div data-slot="drawer-footer" {...props} class={cn("mt-auto flex flex-col gap-2 p-4", props.class)} />
	);
}

function DrawerTitle(props: ComponentProps<typeof DrawerPrimitive.Label>) {
	return (
		<DrawerPrimitive.Label
			data-slot="drawer-title"
			{...props}
			class={cn("text-foreground font-semibold", props.class)}
		/>
	);
}

function DrawerDescription(props: ComponentProps<typeof DrawerPrimitive.Description>) {
	return (
		<DrawerPrimitive.Description
			data-slot="drawer-description"
			{...props}
			class={cn("text-muted-foreground text-sm", props.class)}
		/>
	);
}

export {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	DrawerPortal,
	DrawerTitle,
	DrawerTrigger,
};
