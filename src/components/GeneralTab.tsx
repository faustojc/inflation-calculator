import GeneralRow from "@/components/GeneralRow";
import { majorCategories } from "@/stores/dataStore";
import { useStore } from "@nanostores/react";

export function GeneralTab() {
	const categories = useStore(majorCategories);

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
