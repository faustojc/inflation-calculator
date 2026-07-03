import type { ComponentProps, JSX } from "solid-js";
import { createContext, createSignal, Show, splitProps, useContext } from "solid-js";

const CollapsibleContext = createContext<{ open: () => boolean; setOpen: (open: boolean) => void }>();

type CollapsibleProps = ComponentProps<"div"> & {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
};

function Collapsible(props: CollapsibleProps) {
	const [local, rest] = splitProps(props, ["open", "defaultOpen", "onOpenChange"]);
	const [localOpen, setLocalOpen] = createSignal(local.defaultOpen ?? false);
	const open = () => local.open ?? localOpen();
	const setOpen = (next: boolean) => {
		setLocalOpen(next);
		local.onOpenChange?.(next);
	};

	return (
		<CollapsibleContext.Provider value={{ open, setOpen }}>
			<div data-slot="collapsible" {...rest} />
		</CollapsibleContext.Provider>
	);
}

function CollapsibleTrigger(props: ComponentProps<"button"> & { asChild?: boolean }) {
	const context = useContext(CollapsibleContext);
	const [local, rest] = splitProps(props, ["asChild", "onClick", "children"]);
	const toggle = () => context?.setOpen(!context.open());
	const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
		if (typeof local.onClick === "function") local.onClick(event);
		toggle();
	};

	return (
		<Show
			when={local.asChild}
			fallback={
				<button
					type="button"
					data-slot="collapsible-trigger"
					aria-expanded={context?.open()}
					onClick={onClick}
					{...rest}
				>
					{local.children}
				</button>
			}
		>
			<span data-slot="collapsible-trigger" onClick={toggle}>
				{local.children}
			</span>
		</Show>
	);
}

function CollapsibleContent(props: ComponentProps<"div">) {
	const context = useContext(CollapsibleContext);
	return (
		<div
			data-slot="collapsible-content"
			data-state={context?.open() ? "open" : "closed"}
			hidden={!context?.open()}
			{...props}
		/>
	);
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
