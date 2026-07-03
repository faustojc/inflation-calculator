import { XIcon } from "lucide-solid";
import type { ComponentProps, JSX } from "solid-js";
import { createContext, createSignal, onCleanup, Show, splitProps, useContext } from "solid-js";
import { Portal } from "solid-js/web";
import { cn } from "@/lib/utils";

const DialogContext = createContext<{
	open: () => boolean;
	setOpen: (open: boolean) => void;
}>();

type DialogProps = {
	children?: JSX.Element;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
};

function Dialog(props: DialogProps) {
	const [localOpen, setLocalOpen] = createSignal(props.defaultOpen ?? false);
	const open = () => props.open ?? localOpen();
	const setOpen = (next: boolean) => {
		setLocalOpen(next);
		props.onOpenChange?.(next);
	};

	return <DialogContext.Provider value={{ open, setOpen }}>{props.children}</DialogContext.Provider>;
}

function DialogTrigger(props: ComponentProps<"button"> & { asChild?: boolean }) {
	const context = useContext(DialogContext);
	const [local, rest] = splitProps(props, ["asChild", "children", "onClick"]);
	const open = () => context?.setOpen(true);
	const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
		if (typeof local.onClick === "function") local.onClick(event);
		open();
	};

	return (
		<Show
			when={local.asChild}
			fallback={<button type="button" data-slot="dialog-trigger" onClick={onClick} {...rest} />}
		>
			<span data-slot="dialog-trigger" onClick={open}>
				{local.children}
			</span>
		</Show>
	);
}

function DialogPortal(props: { children?: JSX.Element }) {
	return <Portal>{props.children}</Portal>;
}

function DialogClose(props: ComponentProps<"button"> & { asChild?: boolean }) {
	const context = useContext(DialogContext);
	const [local, rest] = splitProps(props, ["asChild", "children", "onClick"]);
	const close = () => context?.setOpen(false);
	const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
		if (typeof local.onClick === "function") local.onClick(event);
		close();
	};

	return (
		<Show
			when={local.asChild}
			fallback={<button type="button" data-slot="dialog-close" onClick={onClick} {...rest} />}
		>
			<span data-slot="dialog-close" onClick={close}>
				{local.children}
			</span>
		</Show>
	);
}

function DialogOverlay(props: ComponentProps<"div">) {
	const context = useContext(DialogContext);
	return (
		<div
			data-slot="dialog-overlay"
			data-state="open"
			onPointerDown={() => context?.setOpen(false)}
			{...props}
			class={cn("fixed inset-0 z-50 bg-black/50", props.class)}
		/>
	);
}

function DialogContent(props: ComponentProps<"div"> & { showCloseButton?: boolean }) {
	const context = useContext(DialogContext);
	const [local, rest] = splitProps(props, ["class", "children", "showCloseButton"]);
	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === "Escape") context?.setOpen(false);
	};
	document.addEventListener("keydown", onKeyDown);
	onCleanup(() => document.removeEventListener("keydown", onKeyDown));

	return (
		<Show when={context?.open()}>
			<DialogPortal>
				<DialogOverlay />
				<div
					data-slot="dialog-content"
					data-state="open"
					role="dialog"
					aria-modal="true"
					class={cn(
						"bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg outline-none sm:max-w-lg",
						local.class,
					)}
					{...rest}
				>
					{local.children}
					<Show when={local.showCloseButton ?? true}>
						<DialogClose class="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
							<XIcon />
							<span class="sr-only">Close</span>
						</DialogClose>
					</Show>
				</div>
			</DialogPortal>
		</Show>
	);
}

function DialogHeader(props: ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-header"
			{...props}
			class={cn("flex flex-col gap-2 text-center sm:text-left", props.class)}
		/>
	);
}

function DialogFooter(props: ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-footer"
			{...props}
			class={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", props.class)}
		/>
	);
}

function DialogTitle(props: ComponentProps<"h2">) {
	return (
		<h2 data-slot="dialog-title" {...props} class={cn("text-lg leading-none font-semibold", props.class)} />
	);
}

function DialogDescription(props: ComponentProps<"p">) {
	return (
		<p data-slot="dialog-description" {...props} class={cn("text-muted-foreground text-sm", props.class)} />
	);
}

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
