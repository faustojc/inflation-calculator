import { promises as fs } from "node:fs";
import path from "node:path";
import { brotliCompressSync, constants as zlibConstants } from "node:zlib";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";
import solid from "vite-plugin-solid";

// Precompresses dist files to .br so the server can serve them with
// Content-Encoding: br (needs static host support for precompressed files).
function brotli(): Plugin {
	const compressible = /\.(js|css|html)$/;
	return {
		name: "brotli-precompress",
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
			const apiDir = path.join(distDir, "api");
			const files = (await walk(distDir)).filter((file) => {
				const relativeToApi = path.relative(apiDir, file);
				const isApiFile = relativeToApi && !relativeToApi.startsWith("..") && !path.isAbsolute(relativeToApi);
				return !isApiFile && compressible.test(file);
			});

			await Promise.all(
				files.map(async (file) => {
					const source = await fs.readFile(file);
					if (source.length < 1024) return;
					const compressed = brotliCompressSync(source, {
						params: {
							[zlibConstants.BROTLI_PARAM_QUALITY]: 11,
							[zlibConstants.BROTLI_PARAM_SIZE_HINT]: source.length,
						},
					});
					await fs.writeFile(`${file}.br`, compressed);
				}),
			);
		},
	};
}

export default defineConfig({
	plugins: [solid(), tailwindcss(), brotli()],
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
