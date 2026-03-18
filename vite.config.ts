import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
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
		watch: {
			buildDelay: 300,
			clearScreen: true,
			exclude: "node_modules/**",
			include: ["src/**", "public/api/**"],
		},
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

					if (id.includes("node_modules/recharts")) {
						return "vendor-charts";
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
