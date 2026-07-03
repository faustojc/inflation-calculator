import type { ComponentProps, JSX } from "solid-js";
import { createContext, createSignal, splitProps, useContext } from "solid-js";
import { cn } from "@/lib/utils";

const TabsContext = createContext<{ value: () => string; setValue: (value: string) => void }>();

type TabsProps = ComponentProps<"div"> & {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
};

function Tabs(props: TabsProps) {
	const [local, rest] = splitProps(props, ["value", "defaultValue", "onValueChange", "class"]);
	const [localValue, setLocalValue] = createSignal(local.defaultValue ?? "");
	const value = () => local.value ?? localValue();
	const setValue = (next: string) => {
		setLocalValue(next);
		local.onValueChange?.(next);
	};

	return (
		<TabsContext.Provider value={{ value, setValue }}>
			<div data-slot="tabs" class={cn("flex flex-col gap-2", local.class)} {...rest} />
		</TabsContext.Provider>
	);
}

function TabsList(props: ComponentProps<"div">) {
	return (
		<div
			data-slot="tabs-list"
			role="tablist"
			{...props}
			class={cn(
				"bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
				props.class,
			)}
		/>
	);
}

function TabsTrigger(props: ComponentProps<"button"> & { value: string }) {
	const context = useContext(TabsContext);
	const [local, rest] = splitProps(props, ["value", "class", "onClick"]);
	const active = () => context?.value() === local.value;
	const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
		if (typeof local.onClick === "function") local.onClick(event);
		context?.setValue(local.value);
	};

	return (
		<button
			type="button"
			data-slot="tabs-trigger"
			data-state={active() ? "active" : "inactive"}
			role="tab"
			aria-selected={active()}
			class={cn(
				"data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				local.class,
			)}
			onClick={onClick}
			{...rest}
		/>
	);
}

function TabsContent(props: ComponentProps<"div"> & { value: string }) {
	const context = useContext(TabsContext);
	const [local, rest] = splitProps(props, ["value", "class"]);
	const active = () => context?.value() === local.value;
	return (
		<div
			data-slot="tabs-content"
			data-state={active() ? "active" : "inactive"}
			role="tabpanel"
			hidden={!active()}
			class={cn("flex-1 outline-none", local.class)}
			{...rest}
		/>
	);
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
