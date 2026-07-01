import { observable } from "@legendapp/state";

type Theme = "dark" | "light" | "system";

const STORAGE_KEY = "theme";
const FALLBACK_THEME: Theme = "system";

function isTheme(value: string | null): value is Theme {
	return value === "dark" || value === "light" || value === "system";
}

function getInitialTheme(): Theme {
	const storedTheme = localStorage.getItem(STORAGE_KEY);
	return isTheme(storedTheme) ? storedTheme : FALLBACK_THEME;
}

export const $theme = observable<Theme>(getInitialTheme());

function applyTheme(t: Theme) {
	const root = document.documentElement;
	const theme = isTheme(t) ? t : FALLBACK_THEME;
	const resolved =
		theme === "system"
			? window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light"
			: theme;

	root.classList.remove("dark", "light");
	root.classList.add(resolved);
	localStorage.setItem(STORAGE_KEY, theme);
}

applyTheme($theme.peek());
$theme.onChange(({ value }) => applyTheme(value));

export function toggleTheme() {
	$theme.set($theme.peek() === "dark" ? "light" : "dark");
}
