import GeneralRow from "@/components/GeneralRow";
import { Button } from "@/components/ui/button";
import { majorCategories } from "@/stores/dataStore";
import { clearExpenses } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";
import { Trash2 } from "lucide-react";

export function GeneralTab() {
	const categories = useStore(majorCategories);

	return (
		<div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
			<div className="mb-4 flex justify-between items-center">
				<div>
					<h2 className="font-bold text-lg">General Commodities</h2>
					<p>13 General Commodity Groups</p>
				</div>
				<Button className="cursor-pointer" onClick={clearExpenses}>
					<Trash2 className="h-4 w-4" />
					Clear
				</Button>
			</div>

			<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
				<div className="grid gap-4">
					{categories.map((cat) => (
						<GeneralRow key={cat.code} cat={cat} />
					))}
				</div>
			</div>
		</div>
	);
}
