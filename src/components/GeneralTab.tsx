import { For } from "solid-js";
import GeneralRow from "@/components/GeneralRow";
import { majorCategories } from "@/stores/dataStore";

export function GeneralTab() {
	return (
		<div id="general-tab" class="space-y-3">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4">
				<For each={majorCategories.get()}>{(cat) => <GeneralRow cat={cat} />}</For>
			</div>
		</div>
	);
}
