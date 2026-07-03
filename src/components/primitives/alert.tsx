import type { ComponentProps } from "solid-js";
import { cn } from "@/lib/utils";

type AlertVariant = "default" | "destructive";

const alertVariants: Record<AlertVariant, string> = {
	default: "alert",
	destructive: "alert alert-error",
};

function Alert(props: ComponentProps<"div"> & { variant?: AlertVariant }) {
	const variant = () => props.variant ?? "default";

	return (
		<div
			data-slot="alert"
			role="alert"
			{...props}
			class={cn(
				"relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5",
				alertVariants[variant()],
				props.class,
			)}
		/>
	);
}

function AlertTitle(props: ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-title"
			{...props}
			class={cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", props.class)}
		/>
	);
}

function AlertDescription(props: ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-description"
			{...props}
			class={cn(
				"col-start-2 grid justify-items-start gap-1 text-sm opacity-80 [&_p]:leading-relaxed",
				props.class,
			)}
		/>
	);
}

export { Alert, AlertDescription, AlertTitle };
