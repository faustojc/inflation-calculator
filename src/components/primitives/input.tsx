import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "@/lib/utils";

function Input(props: ComponentProps<"input">) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<input
			data-slot="input"
			{...rest}
			class={cn(
				"border-input flex h-9 min-h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[border-color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring md:text-sm",
				local.class,
			)}
		/>
	);
}

export { Input };
