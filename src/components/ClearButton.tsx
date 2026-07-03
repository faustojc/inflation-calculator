import { Trash2 } from "lucide-solid";
import { clearExpenses } from "@/stores/inflationStore";

const ClearButton = () => {
	return (
		<button
			type="button"
			class="btn btn-error btn-outline btn-sm hover:text-white hover:bg-destructive gap-1.5"
			onClick={clearExpenses}
		>
			<Trash2 class="h-3.5 w-3.5" />
			Clear All
		</button>
	);
};

export default ClearButton;
