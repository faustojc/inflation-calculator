import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	base: "/inflation-calculator/",
	build: {
		target: "esnext",
		minify: true,
		cssMinify: true,
		outDir: "dist",
		rolldownOptions: {
			output: {
				manualChunks: (id) => {
					if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
						return "vendor-react";
					}

					if (id.includes("node_modules/tailwind-merge")) {
						return "vendor-tailwind";
					}

					if (id.includes("node_modules/lucide-react")) {
						return "vendor-icons";
					}

					if (id.includes("node_modules/@radix-ui") || id.includes("node_modules/clsx")) {
						return "vendor-ui";
					}

					if (id.includes("node_modules/nanostores") || id.includes("node_modules/date-fns")) {
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
