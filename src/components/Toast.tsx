import { CircleXIcon, TriangleAlertIcon, XIcon } from "lucide-solid";
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";
import { dismissToast, type ToastType, toast, toastItems } from "@/stores/toastStore";

type ToasterProps = {
	closeButton?: boolean;
	position?: "top-center";
};

const toastStyles: Record<ToastType, string> = {
	error: "alert-error border-error bg-error text-error-content",
	warning: "alert-warning border-warning bg-warning text-warning-content",
};

const toastIcons: Record<ToastType, typeof TriangleAlertIcon> = {
	error: CircleXIcon,
	warning: TriangleAlertIcon,
};

export function Toaster(props: ToasterProps) {
	const [mounted, setMounted] = createSignal(false);
	onMount(() => setMounted(true));
	onCleanup(() => setMounted(false));

	return (
		<Show when={mounted() && toastItems.get().length > 0}>
			<div class="toast toast-top toast-center z-50 w-[min(92vw,28rem)]">
				<For each={toastItems.get()}>
					{(item) => {
						const Icon = toastIcons[item.type];
						return (
							<div
								class={cn(
									"alert pointer-events-auto flex items-start gap-3 border p-4 shadow-lg",
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
									<Show when={item.description}>
										<div class={cn("mt-1 text-sm leading-5 opacity-80", item.classNames?.description)}>
											{item.description}
										</div>
									</Show>
								</div>
								<Show when={props.closeButton}>
									<Button
										aria-label="Dismiss notification"
										class="size-7 shrink-0"
										onClick={() => dismissToast(item.id)}
										size="icon"
										variant="ghost"
									>
										<XIcon class="size-4" />
									</Button>
								</Show>
							</div>
						);
					}}
				</For>
			</div>
		</Show>
	);
}

export { toast };
