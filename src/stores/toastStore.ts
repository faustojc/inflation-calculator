import { createSignalAtom } from "@/stores/solidAtoms";

const TOAST_DURATION_MS = 5000;

export type ToastType = "error" | "warning";

export type ToastOptions = {
	classNames?: {
		toast?: string;
		title?: string;
		description?: string;
		icon?: string;
	};
	description?: string;
	duration?: number;
};

export type ToastItem = ToastOptions & {
	id: number;
	title: string;
	type: ToastType;
};

let nextToastId = 0;

export const toastItems = createSignalAtom<ToastItem[]>([]);

export function dismissToast(id: number) {
	toastItems.set((items) => items.filter((toast) => toast.id !== id));
}

function pushToast(type: ToastType, title: string, options: ToastOptions = {}) {
	const id = ++nextToastId;
	toastItems.set((items) => [...items, { id, type, title, ...options }].slice(-4));
	window.setTimeout(() => dismissToast(id), options.duration ?? TOAST_DURATION_MS);
}

export const toast = {
	error: (title: string, options?: ToastOptions) => pushToast("error", title, options),
	warning: (title: string, options?: ToastOptions) => pushToast("warning", title, options),
};
