import GeneralRow from "@/components/GeneralRow";
import { Button } from "@/components/ui/button";
import { majorCategories } from "@/stores/dataStore";
import { clearExpenses } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";
import { Trash2 } from "lucide-react";

export function GeneralTab() {
	const categories = useStore(majorCategories);

	return (
		<div id="general-tab" className="space-y-3">
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-2">
					<h2 className="font-bold text-base text-slate-800">
						General Categories
					</h2>
					<span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
						{categories.length}
					</span>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="cursor-pointer text-muted-foreground hover:text-destructive hover:border-destructive/30 gap-1.5"
					onClick={clearExpenses}
				>
					<Trash2 className="h-3.5 w-3.5" />
					Clear All
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4">
				{categories.map((cat) => (
					<GeneralRow key={cat.code} cat={cat} />
				))}
			</div>
		</div>
	);
}
