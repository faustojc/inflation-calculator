import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, type Plugin } from "vite";

const deferDepsPlugin = (): Plugin => ({
	name: "defer-css-and-js",
	enforce: "post",
	transformIndexHtml(html) {
		let modifiedHtml = html.replace(
			/<link rel="stylesheet" crossorigin href="([^"]+)">/g,
			'<link rel="preload" as="style" href="$1" />\n\t\t<link rel="stylesheet" crossorigin href="$1" media="print" onload="this.media=\'all\'" />\n\t\t<noscript><link rel="stylesheet" crossorigin href="$1" /></noscript>',
		);

		modifiedHtml = modifiedHtml.replace(
			/<script type="module" crossorigin src="([^"]+)"><\/script>/g,
			'<link rel="modulepreload" crossorigin href="$1" />\n\t\t<script type="module" crossorigin src="$1"></script>',
		);

		return modifiedHtml;
	},
});

export default defineConfig({
	plugins: [react(), tailwindcss(), deferDepsPlugin()],
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
