(() => {
	var root = window.document.documentElement;
	var theme = "light";

	try {
		theme = localStorage.getItem("theme");
	} catch (e) {
		console.log(
			"Unable to get theme in localStorage in your browser. Some private browsers block localStorage access.",
		);
		console.error(`ERROR getting theme from localStorage: ${e}`);
	}

	var systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	root.className = theme === "system" ? systemTheme : theme || "light";

	try {
		localStorage.setItem("theme", root.className);
	} catch (e) {
		console.log(
			"Unable to save theme in localStorage in your browser. Some private browsers block localStorage access.",
		);
		console.error(`ERROR saving theme to localStorage: ${e}`);
	}
})();
