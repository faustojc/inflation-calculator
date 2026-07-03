import type { ComponentProps } from "solid-js";
import { cn } from "@/lib/utils";

type SeparatorProps = ComponentProps<"div"> & {
	decorative?: boolean;
	orientation?: "horizontal" | "vertical";
};

function Separator(props: SeparatorProps) {
	const orientation = () => props.orientation ?? "horizontal";

	return (
		<div
			data-slot="separator"
			data-orientation={orientation()}
			role={(props.decorative ?? true) ? "presentation" : "separator"}
			aria-orientation={orientation()}
			{...props}
			class={cn(
				"bg-border shrink-0",
				orientation() === "vertical" ? "h-full w-px" : "h-px w-full",
				props.class,
			)}
		/>
	);
}

export { Separator };
