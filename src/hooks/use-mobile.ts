import { type Accessor, createSignal, onCleanup, onMount } from "solid-js";

const MOBILE_BREAKPOINT = 768;

function subscribe(callback: () => void) {
	const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
	mql.addEventListener("change", callback);
	return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
	return window.innerWidth < MOBILE_BREAKPOINT;
}

export function useIsMobile(): Accessor<boolean> {
	const [isMobile, setIsMobile] = createSignal(false);

	onMount(() => {
		setIsMobile(getSnapshot());
		const unsubscribe = subscribe(() => setIsMobile(getSnapshot()));
		onCleanup(unsubscribe);
	});

	return isMobile;
}
