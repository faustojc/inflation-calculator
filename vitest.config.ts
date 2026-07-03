import path from "node:path";
import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
	// hot:false — solid-refresh's HMR banner breaks vitest module resolution
	plugins: [solid({ hot: false })],
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
