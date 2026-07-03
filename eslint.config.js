import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import solid from "eslint-plugin-solid/configs/typescript";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
	globalIgnores(["dist"]),
	{
		files: ["**/*.{ts,tsx}"],
		extends: [js.configs.recommended, tseslint.configs.recommended, solid],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		rules: {
			"solid/no-destructure": "warn",
			"solid/prefer-for": "warn",
		},
	},
]);
