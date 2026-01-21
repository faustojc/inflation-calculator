import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	base: "/",
	build: {
		target: "esnext",
		minify: true,
		cssMinify: true,
		outDir: "dist",
		rollupOptions: {
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
