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

/** Reactive accessor for the current theme setting ("dark" | "light" | "system"). */
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

	// Keep the `.dark`/`.light` class so existing Tailwind `dark:` variants survive,
	// AND set `data-theme` which DaisyUI reads to select the psa-light/psa-dark theme.
	root.classList.remove("dark", "light");
	root.classList.add(resolved);
	root.setAttribute("data-theme", resolved === "dark" ? "psa-dark" : "psa-light");

	localStorage.setItem(STORAGE_KEY, value);
}

/** Set the theme setting and apply it to the document. */
export function setTheme(t: Theme) {
	setThemeSignal(t);
	applyTheme(t);
}

/** Toggle between explicit dark and light. */
export function toggleTheme() {
	setTheme(theme() === "dark" ? "light" : "dark");
}

// Module-level apply before first paint to prevent dark-mode FOUC.
applyTheme(theme());
