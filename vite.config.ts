import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	plugins: [solid(), tailwindcss()],
	base: "/inflation-calculator/",
	build: {
		target: "esnext",
		minify: true,
		cssMinify: true,
		outDir: "dist",
		rolldownOptions: {
			output: {
				chunkFileNames: (chunkInfo) =>
					chunkInfo.isDynamicEntry ? "assets/[hash].js" : "assets/[name]-[hash].js",
				manualChunks: (id) => {
					if (id.includes("node_modules/solid-js")) {
						return "vendor-solid";
					}
					if (id.includes("node_modules/lucide-solid")) {
						return "vendor-icons";
					}

					if (id.includes("node_modules/date-fns")) {
						return "vendor-utils";
					}

					if (id.includes("node_modules/uplot")) {
						return "vendor-uplot";
					}

					if (id.includes("node_modules/d3-shape") || id.includes("node_modules/d3-path")) {
						return "vendor-d3";
					}

					if (id.includes("src/stores")) {
						return "vendor-states";
					}
				},
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
