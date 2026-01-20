import { majorCategories } from "@/stores/dataStore";
import { useStore } from "@nanostores/react";
import GeneralRow from "./GeneralRow";

export function GeneralTab() {
	const categories = useStore(majorCategories);

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
			<div className="grid gap-4">
				{categories.map((cat) => (
					<GeneralRow key={cat.code} cat={cat} />
				))}
			</div>
		</div>
	);
}
