import { createSignal } from "solid-js";

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

const [theme, setThemeSignal] = createSignal<Theme>(getInitialTheme());

export { theme };

function applyTheme(t: Theme) {
	const root = document.documentElement;
	const value = isTheme(t) ? t : FALLBACK_THEME;
	const resolved =
		value === "system"
			? window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light"
			: value;

	root.classList.remove("dark", "light");
	root.classList.add(resolved);
	root.setAttribute("data-theme", resolved === "dark" ? "psa-dark" : "psa-light");

	localStorage.setItem(STORAGE_KEY, value);
}

export function setTheme(t: Theme) {
	setThemeSignal(t);
	applyTheme(t);
}

export function toggleTheme() {
	setTheme(theme() === "dark" ? "light" : "dark");
}

// Module-level apply before first paint to prevent dark-mode FOUC.
applyTheme(getInitialTheme());
