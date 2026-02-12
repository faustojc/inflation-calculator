import { clearExpenses } from "@/stores/inflationStore";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";

const ClearButton = () => {
	return (
		<Button
			variant="outline"
			size="sm"
			className="cursor-pointer text-destructive border-destructive/50 hover:text-white hover:bg-destructive gap-1.5"
			onClick={clearExpenses}
		>
			<Trash2 className="h-3.5 w-3.5" />
			Clear All
		</Button>
	);
};

export default ClearButton;
