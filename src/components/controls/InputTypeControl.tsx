import { mode } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";

const InputTypeControl = () => {
	const m = useStore(mode);

	return (
		<div
			id="input-type-control"
			className="flex items-center gap-2 bg-muted p-1.5 rounded-lg w-full md:w-auto transition-all"
		>
			<button
				onClick={() => mode.set("amount")}
				className={`flex-1 px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
					m === "amount" ? "bg-card shadow text-primary" : "text-muted-foreground hover:text-foreground"
				}`}
			>
				Amount
			</button>
			<button
				onClick={() => mode.set("percent")}
				className={`flex-1 px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
					m === "percent" ? "bg-card shadow text-primary" : "text-muted-foreground hover:text-foreground"
				}`}
			>
				Percent
			</button>
		</div>
	);
};

export default InputTypeControl;
