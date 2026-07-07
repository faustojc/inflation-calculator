import { mode } from "@/stores/inflationStore";

const InputTypeControl = () => {
	const m = () => mode.get();

	return (
		<div
			id="input-type-control"
			class="flex items-center gap-2 p-1.5 bg-primary/10 rounded-lg w-full md:w-auto transition-all"
		>
			<button
				type="button"
				name="Amount type selection"
				aria-label="Select amount type"
				onClick={() => mode.set("amount")}
				class={`flex-1 ml-1 px-4 py-1 rounded-md text-sm transition-all duration-200 ${
					m() === "amount"
						? "bg-primary shadow text-white font-semibold"
						: "text-foreground hover:text-primary"
				}`.replace(/\s+/g, " ")}
			>
				Amount
			</button>
			<button
				type="button"
				name="Percent type selection"
				aria-label="Select percent type"
				onClick={() => mode.set("percent")}
				class={`flex-1 px-4 py-1 rounded-md text-sm transition-all duration-200 ${
					m() === "percent"
						? "bg-primary shadow text-white font-semibold"
						: "text-foreground hover:text-primary"
				}`.replace(/\s+/g, " ")}
			>
				Percent
			</button>
		</div>
	);
};

export default InputTypeControl;
