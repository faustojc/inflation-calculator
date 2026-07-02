import type { Component } from "solid-js";
import { setTheme, theme, toggleTheme } from "@/stores/themeStore";

const App: Component = () => {
	return (
		<div class="min-h-screen bg-base-100 text-base-content flex flex-col items-center justify-center gap-6 p-8">
			<h1 class="text-2xl font-bold text-center">
				inflation-calculator — Solid migration WIP
			</h1>

			<button type="button" class="btn btn-primary">
				DaisyUI primary button
			</button>

			<div class="flex items-center gap-3">
				<span class="text-sm opacity-70">theme: {theme()}</span>
				<button type="button" class="btn btn-outline btn-sm" onClick={() => toggleTheme()}>
					Toggle theme
				</button>
				<button
					type="button"
					class="btn btn-ghost btn-sm"
					onClick={() => setTheme("system")}
				>
					System
				</button>
			</div>
		</div>
	);
};

export default App;
