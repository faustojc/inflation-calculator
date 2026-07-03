import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";

const variants: Record<ButtonVariant, string> = {
	default: "btn btn-primary",
	destructive: "btn btn-error text-error-content",
	outline:
		"btn btn-outline border-input bg-background text-foreground hover:border-primary/40 hover:bg-primary/5",
	secondary: "btn btn-secondary",
	ghost: "btn btn-ghost",
	link: "btn btn-link text-primary",
};

const sizes: Record<ButtonSize, string> = {
	default: "h-9 min-h-9 px-4 py-2",
	sm: "h-8 min-h-8 rounded-md px-3",
	lg: "h-10 min-h-10 rounded-md px-6",
	icon: "size-9 min-h-9 p-0",
	"icon-sm": "size-8 min-h-8 p-0",
	"icon-lg": "size-10 min-h-10 p-0",
};

type ButtonProps = ComponentProps<"button"> & {
	asChild?: boolean;
	variant?: ButtonVariant;
	size?: ButtonSize;
};

export function Button(props: ButtonProps) {
	const [local, rest] = splitProps(props, ["class", "variant", "size", "asChild"]);
	const variant = () => local.variant ?? "default";
	const size = () => local.size ?? "default";

	return (
		<Dynamic
			component={local.asChild ? "span" : "button"}
			{...rest}
			class={cn(
				"inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-[background-color,border-color,color,box-shadow,transform] active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				variants[variant()],
				sizes[size()],
				local.class,
			)}
		/>
	);
}
