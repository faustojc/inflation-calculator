import { createSignalAtom } from "@/stores/solidAtoms";

export const isOnline = createSignalAtom(typeof navigator === "undefined" ? true : navigator.onLine);

if (typeof window !== "undefined") {
	window.addEventListener("online", () => isOnline.set(true));
	window.addEventListener("offline", () => isOnline.set(false));
}
