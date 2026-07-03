import type { ComponentProps, JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const badgeVariants: Record<BadgeVariant, string> = {
	default: "badge-primary",
	secondary: "badge-secondary",
	destructive: "badge-error",
	outline: "badge-outline",
};

type BadgeProps = ComponentProps<"span"> & {
	asChild?: boolean;
	variant?: BadgeVariant;
};

function Badge(props: BadgeProps) {
	const variant = () => props.variant ?? "default";

	return (
		<Dynamic
			component={props.asChild ? "span" : "span"}
			data-slot="badge"
			class={cn(
				"badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium focus-visible:ring-2 focus-visible:ring-ring [&>svg]:size-3 [&>svg]:pointer-events-none",
				badgeVariants[variant()],
				props.class,
			)}
			{...(props as JSX.HTMLAttributes<HTMLElement>)}
		/>
	);
}

export { Badge };
