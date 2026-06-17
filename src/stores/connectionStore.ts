import { observable } from "@legendapp/state";

export const isOnline = observable(navigator.onLine);

if (typeof window !== "undefined") {
	window.addEventListener("online", () => isOnline.set(true));
	window.addEventListener("offline", () => isOnline.set(false));
}
