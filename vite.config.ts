import tailwindcss from "@tailwindcss/vite";
import { promises as fs } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { defineConfig, type Plugin } from "vite";
import solid from "vite-plugin-solid";

// Precompress dist files to .gz
function gzip(): Plugin {
	const compressible = /\.(js|css|json)$/;
	return {
		name: "gzip-precompress",
		apply: "build",
		async closeBundle() {
			const walk = async (dir: string): Promise<string[]> => {
				const entries = await fs.readdir(dir, { withFileTypes: true });
				const files = await Promise.all(
					entries.map((entry) => {
						const full = path.join(dir, entry.name);
						return entry.isDirectory() ? walk(full) : Promise.resolve([full]);
					}),
				);
				return files.flat();
			};

			const distDir = path.resolve(__dirname, "dist");
			const files = (await walk(distDir)).filter((file) => compressible.test(file));

			await Promise.all(
				files.map(async (file) => {
					const source = await fs.readFile(file);

					await fs.writeFile(`${file}.gz`, gzipSync(source, { level: 9 }));
				}),
			);
		},
	};
}

export default defineConfig({
	plugins: [solid(), tailwindcss(), gzip()],
	base: "/inflation-calculator/",
	build: {
		target: "esnext",
		minify: true,
		cssMinify: true,
		outDir: "dist",
		rolldownOptions: {
			output: {
				chunkFileNames: (chunkInfo) => (chunkInfo.isDynamicEntry ? "assets/[hash].js" : "assets/[name]-[hash].js"),
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
