import { CircleXIcon, TriangleAlertIcon, XIcon } from "lucide-solid";
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { Button } from "@/components/primitives/button";
import { cn } from "@/lib/utils";
import { dismissToast, type ToastType, toast, toastItems } from "@/stores/toastStore";

type ToasterProps = {
	closeButton?: boolean;
	position?: "top-center";
};

const toastStyles: Record<ToastType, string> = {
	error: "border-destructive/40 bg-destructive/10 text-destructive",
	warning: "border-secondary/60 bg-secondary/15 text-foreground",
};

const toastIcons: Record<ToastType, typeof TriangleAlertIcon> = {
	error: CircleXIcon,
	warning: TriangleAlertIcon,
};

function Toaster(props: ToasterProps) {
	const [mounted, setMounted] = createSignal(false);
	onMount(() => setMounted(true));
	onCleanup(() => setMounted(false));

	return (
		<Show when={mounted() && toastItems.get().length > 0}>
			<div class="pointer-events-none fixed left-1/2 top-4 z-50 flex w-[min(92vw,28rem)] -translate-x-1/2 flex-col gap-2">
				<For each={toastItems.get()}>
					{(item) => {
						const Icon = toastIcons[item.type];
						return (
							<div
								class={cn(
									"pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur",
									toastStyles[item.type],
									item.classNames?.toast,
								)}
								role="status"
							>
								<Icon class={cn("mt-0.5 size-5 shrink-0", item.classNames?.icon)} />
								<div class="min-w-0 flex-1">
									<div class={cn("text-sm font-semibold leading-5", item.classNames?.title)}>
										{item.title}
									</div>
									{item.description && (
										<div class={cn("mt-1 text-sm leading-5 opacity-80", item.classNames?.description)}>
											{item.description}
										</div>
									)}
								</div>
								{props.closeButton && (
									<Button
										aria-label="Dismiss notification"
										class="size-7 shrink-0"
										onClick={() => dismissToast(item.id)}
										size="icon"
										variant="ghost"
									>
										<XIcon class="size-4" />
									</Button>
								)}
							</div>
						);
					}}
				</For>
			</div>
		</Show>
	);
}

export { Toaster, toast };
