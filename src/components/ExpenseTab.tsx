import { createMemo, For } from "solid-js";
import ExpenseNode from "@/components/ExpenseNode";
import type { CommodityDef } from "@/lib/types";
import { dataStore } from "@/stores/dataStore";

export type DisplayNode = {
	code: string;
	name: string;
	id: string;
	children: DisplayNode[];
	depth: number;
	description?: string;
};

function mapDataToNode(def: CommodityDef, currentDepth: number, maxDepth: number): DisplayNode {
	let children: DisplayNode[] = [];

	if (currentDepth < maxDepth && def.children) {
		children = def.children.map((child) => mapDataToNode(child, currentDepth + 1, maxDepth));
	}

	return {
		code: def.code,
		name: def.name,
		id: def.code,
		depth: currentDepth,
		children: children,
		description: def.description,
	};
}

export function ExpenseTab() {
	const tree = createMemo(() => {
		const commodities = dataStore.commodities.get();
		if (!commodities || commodities.length === 0) return [];
		return commodities.map((c) => mapDataToNode(c, 0, 1));
	});

	return (
		<div id="detailed-tab" class="space-y-3">
			<div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
				<div class="pb-1">
					<For each={tree()}>{(node) => <ExpenseNode node={node} level={0} />}</For>
				</div>
			</div>
		</div>
	);
}

export default ExpenseTab;
