import { observable } from "@legendapp/state";

type Theme = "dark" | "light" | "system";

const STORAGE_KEY = "theme";

function getInitialTheme(): Theme {
	return (localStorage.getItem(STORAGE_KEY) as Theme) ?? "system";
}

export const $theme = observable<Theme>(getInitialTheme());

function applyTheme(t: Theme) {
	const root = document.documentElement;
	const resolved =
		t === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : t;
	root.className = resolved;
	localStorage.setItem(STORAGE_KEY, t);
}

// nanostores `.subscribe()` fired immediately with the current value; Legend
// State `.onChange()` only fires on change, so apply the initial value once.
applyTheme($theme.peek());
$theme.onChange(({ value }) => applyTheme(value));

export function toggleTheme() {
	$theme.set($theme.peek() === "dark" ? "light" : "dark");
}
