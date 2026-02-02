import { mode } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";

const InputTypeControl = () => {
	const m = useStore(mode);

	return (
		<div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 p-1.5 rounded-lg w-full md:w-auto transition-all">
			<button
				onClick={() => mode.set("amount")}
				className={`flex-1 px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
					m === "amount" ? "bg-white dark:bg-slate-700 shadow text-primary" : "text-muted-foreground hover:text-slate-900 dark:hover:text-slate-200"
				}`}
			>
				Amount
			</button>
			<button
				onClick={() => mode.set("percent")}
				className={`flex-1 px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
					m === "percent" ? "bg-white dark:bg-slate-700 shadow text-primary" : "text-muted-foreground hover:text-slate-900 dark:hover:text-slate-200"
				}`}
			>
				Percent
			</button>
		</div>
	);
};

export default InputTypeControl;
