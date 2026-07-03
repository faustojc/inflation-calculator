import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "@/lib/utils";

function Progress(props: ComponentProps<"div"> & { value?: number | null; max?: number }) {
	const [local, rest] = splitProps(props, ["class", "value", "max"]);
	const max = () => local.max ?? 100;
	const value = () => Math.max(0, Math.min(local.value ?? 0, max()));
	const percent = () => (max() === 0 ? 0 : (value() / max()) * 100);

	return (
		<div
			data-slot="progress"
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={max()}
			aria-valuenow={value()}
			{...rest}
			class={cn("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full", local.class)}
		>
			<div
				data-slot="progress-indicator"
				class="bg-primary h-full transition-transform"
				style={{ transform: `translateX(-${100 - percent()}%)` }}
			/>
		</div>
	);
}

export { Progress };
