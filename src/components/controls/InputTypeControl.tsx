import { mode } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";

const InputTypeControl = () => {
	const m = useStore(mode);

	return (
		<div
			id="input-type-control"
			className="flex items-center gap-2 p-[6.5px] bg-muted rounded-lg w-full md:w-auto transition-all"
		>
			<button
				onClick={() => mode.set("amount")}
				className={`flex-1 ml-1 px-4 py-1 rounded-md text-sm transition-all duration-200 ${
					m === "amount" ? "bg-primary shadow text-white font-semibold" : "text-muted-foreground hover:text-foreground"
				}`}
			>
				Amount
			</button>
			<button
				onClick={() => mode.set("percent")}
				className={`flex-1 px-4 py-1 rounded-md text-sm transition-all duration-200 ${
					m === "percent" ? "bg-primary shadow text-white font-semibold" : "text-muted-foreground hover:text-foreground"
				}`}
			>
				Percent
			</button>
		</div>
	);
};

export default InputTypeControl;
