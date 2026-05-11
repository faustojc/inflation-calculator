import { atom, onMount } from "nanostores";

export const isOnline = atom(navigator.onLine);

onMount(isOnline, () => {
	const goOnline = () => isOnline.set(true);
	const goOffline = () => isOnline.set(false);

	window.addEventListener("online", goOnline);
	window.addEventListener("offline", goOffline);

	return () => {
		window.removeEventListener("online", goOnline);
		window.removeEventListener("offline", goOffline);
	};
});
