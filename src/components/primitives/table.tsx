import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "@/lib/utils";

function Table(props: ComponentProps<"table">) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<div data-slot="table-container" class="relative w-full overflow-x-auto">
			<table data-slot="table" {...rest} class={cn("w-full caption-bottom text-sm", local.class)} />
		</div>
	);
}

function TableHeader(props: ComponentProps<"thead">) {
	const [local, rest] = splitProps(props, ["class"]);
	return <thead data-slot="table-header" {...rest} class={cn("[&_tr]:border-b", local.class)} />;
}

function TableBody(props: ComponentProps<"tbody">) {
	const [local, rest] = splitProps(props, ["class"]);
	return <tbody data-slot="table-body" {...rest} class={cn("[&_tr:last-child]:border-0", local.class)} />;
}

function TableFooter(props: ComponentProps<"tfoot">) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<tfoot
			data-slot="table-footer"
			{...rest}
			class={cn("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", local.class)}
		/>
	);
}

function TableRow(props: ComponentProps<"tr">) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<tr
			data-slot="table-row"
			{...rest}
			class={cn("hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors", local.class)}
		/>
	);
}

function TableHead(props: ComponentProps<"th">) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<th
			data-slot="table-head"
			{...rest}
			class={cn(
				"text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
				local.class,
			)}
		/>
	);
}

function TableCell(props: ComponentProps<"td">) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<td
			data-slot="table-cell"
			{...rest}
			class={cn(
				"p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
				local.class,
			)}
		/>
	);
}

function TableCaption(props: ComponentProps<"caption">) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<caption
			data-slot="table-caption"
			{...rest}
			class={cn("text-muted-foreground mt-4 text-sm", local.class)}
		/>
	);
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
