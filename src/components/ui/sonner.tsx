import { AlertTriangleIcon, CircleXIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const TOAST_DURATION_MS = 5000;

type ToastType = "error" | "warning";

type ToastOptions = {
	classNames?: unknown;
	description?: string;
	duration?: number;
};

type ToastItem = ToastOptions & {
	id: number;
	title: string;
	type: ToastType;
};

type ToasterProps = {
	closeButton?: boolean;
	position?: "top-center";
};

let nextToastId = 0;
let toasts: ToastItem[] = [];
const listeners = new Set<(items: ToastItem[]) => void>();

function notify() {
	for (const listener of listeners) listener(toasts);
}

function dismiss(id: number) {
	toasts = toasts.filter((toast) => toast.id !== id);
	notify();
}

function pushToast(type: ToastType, title: string, options: ToastOptions = {}) {
	const id = ++nextToastId;
	toasts = [...toasts, { id, type, title, description: options.description }].slice(-4);
	notify();
	window.setTimeout(() => dismiss(id), options.duration ?? TOAST_DURATION_MS);
}

const toast = {
	error: (title: string, options?: ToastOptions) => pushToast("error", title, options),
	warning: (title: string, options?: ToastOptions) => pushToast("warning", title, options),
};

const toastStyles: Record<ToastType, string> = {
	error: "border-destructive/40 bg-destructive/10 text-destructive",
	warning: "border-secondary/60 bg-secondary/15 text-foreground",
};

const toastIcons: Record<ToastType, typeof AlertTriangleIcon> = {
	error: CircleXIcon,
	warning: AlertTriangleIcon,
};

function Toaster({ closeButton = false }: ToasterProps) {
	const [items, setItems] = useState(toasts);

	useEffect(() => {
		listeners.add(setItems);
		return () => {
			listeners.delete(setItems);
		};
	}, []);

	if (items.length === 0) return null;

	return (
		<div className="pointer-events-none fixed left-1/2 top-4 z-50 flex w-[min(92vw,28rem)] -translate-x-1/2 flex-col gap-2">
			{items.map((item) => {
				const Icon = toastIcons[item.type];

				return (
					<div
						key={item.id}
						className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur ${toastStyles[item.type]}`}
						role="status"
					>
						<Icon className="mt-0.5 size-5 shrink-0" />
						<div className="min-w-0 flex-1">
							<div className="text-sm font-semibold leading-5">{item.title}</div>
							{item.description && (
								<div className="mt-1 text-sm leading-5 opacity-80">{item.description}</div>
							)}
						</div>
						{closeButton && (
							<Button
								aria-label="Dismiss notification"
								className="size-7 shrink-0"
								onClick={() => dismiss(item.id)}
								size="icon"
								variant="ghost"
							>
								<XIcon className="size-4" />
							</Button>
						)}
					</div>
				);
			})}
		</div>
	);
}

export { Toaster, toast };
