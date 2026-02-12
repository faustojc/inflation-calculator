import ClearButton from "@/components/ClearButton";
import GeneralRow from "@/components/GeneralRow";
import { majorCategories } from "@/stores/dataStore";
import { useStore } from "@nanostores/react";

export function GeneralTab() {
	const categories = useStore(majorCategories);

	return (
		<div id="general-tab" className="space-y-3">
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-2">
					<h2 className="font-bold text-base text-slate-800">General Categories</h2>
					<span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
						{categories.length}
					</span>
				</div>
				<ClearButton />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4">
				{categories.map((cat) => (
					<GeneralRow key={cat.code} cat={cat} />
				))}
			</div>
		</div>
	);
}
