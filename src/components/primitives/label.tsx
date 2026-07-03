import type { ComponentProps } from "solid-js";
import { cn } from "@/lib/utils";

function Label(props: ComponentProps<"label">) {
	return (
		<label
			data-slot="label"
			{...props}
			class={cn(
				"flex items-center gap-2 text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
				props.class,
			)}
		/>
	);
}

export { Label };
