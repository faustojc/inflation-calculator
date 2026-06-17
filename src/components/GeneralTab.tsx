import GeneralRow from "@/components/GeneralRow";
import { majorCategories } from "@/stores/dataStore";
import { use$ } from "@legendapp/state/react";

export function GeneralTab() {
	const categories = use$(majorCategories);

	return (
		<div id="general-tab" className="space-y-3">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4">
				{categories.map((cat) => (
					<GeneralRow key={cat.code} cat={cat} />
				))}
			</div>
		</div>
	);
}
