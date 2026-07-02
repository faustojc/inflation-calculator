import path from "path";
import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [solid()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
		// Critical: without these, solid-js resolves its server build and
		// reactive effects become no-ops inside tests.
		conditions: ["development", "browser"],
	},
	test: {
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
	},
});
