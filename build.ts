import { build } from "bun";

await build({
	entrypoints: ["./src/main.tsx"],
	outdir: "./build",
	target: "bun",
	splitting: true,
	minify: {
		whitespace: false,
		identifiers: true,
		syntax: true,
	},
	drop: ["console", "debugger"],
});
