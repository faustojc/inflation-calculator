import { createMemo, For, Show } from "solid-js";
import { cn } from "@/lib/utils";

export type SelectOption = {
	value: string;
	label: string;
	disabled?: boolean;
};

type SelectProps = {
	value?: string;
	onValueChange?: (value: string) => void;
	options: SelectOption[];
	placeholder?: string;
	name?: string;
	class?: string;
};

export function Select(props: SelectProps) {
	const value = () => props.value ?? "";
	const options = createMemo(() => props.options);

	return (
		<select
			name={props.name}
			aria-label={props.name ?? props.placeholder ?? "Select option"}
			value={value()}
			onChange={(event) => props.onValueChange?.(event.currentTarget.value)}
			class={cn(
				"select select-bordered select-sm h-9 min-h-9 w-full bg-background text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40",
				props.class,
			)}
		>
			<Show when={props.placeholder && !value()}>
				<option value="" disabled>
					{props.placeholder}
				</option>
			</Show>
			<For each={options()}>
				{(option) => (
					<option value={option.value} disabled={option.disabled}>
						{option.label}
					</option>
				)}
			</For>
		</select>
	);
}
