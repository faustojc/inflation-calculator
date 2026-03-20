import { atom } from "nanostores";

type Theme = "dark" | "light" | "system";

const STORAGE_KEY = "theme";

function getInitialTheme(): Theme {
	return (localStorage.getItem(STORAGE_KEY) as Theme) ?? "system";
}

export const $theme = atom<Theme>(getInitialTheme());

$theme.subscribe((t) => {
	const root = document.documentElement;
	const resolved =
		t === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : t;
	root.className = resolved;
	localStorage.setItem(STORAGE_KEY, t);
});

export function toggleTheme() {
	$theme.set($theme.get() === "dark" ? "light" : "dark");
}
