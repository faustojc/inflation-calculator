import { dataStore } from "@/stores/dataStore";
import { expenses, type ExpenseItem } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";
import { useMemo } from "react";
import ExpenseNode from "./ExpenseNode";
import type { CommodityDef } from "@/lib/types";

export type DisplayNode = {
	code: string;
	name: string;
	value: number;
	id: string;
	children: DisplayNode[];
	depth: number;
	description?: string;
};

function mapDataToNode(def: CommodityDef, userExpenses: Record<string, ExpenseItem>, currentDepth: number, maxDepth: number): DisplayNode {
	const userItem = userExpenses[def.code];
	const value = userItem ? userItem.value : 0;
	let children: DisplayNode[] = [];

	if (currentDepth < maxDepth && def.children) {
		children = def.children.map((child) => mapDataToNode(child, userExpenses, currentDepth + 1, maxDepth));
	}

	return {
		code: def.code,
		name: def.name,
		value: value,
		id: def.code,
		depth: currentDepth,
		children: children,
		// description: def.description
	};
}

export function ExpenseList() {
	const { commodities } = useStore(dataStore);
	const userExpenses = useStore(expenses);

	const tree = useMemo(() => {
		if (!commodities || commodities.length === 0) return [];
		return commodities.map((c) => mapDataToNode(c, userExpenses, 0, 1));
	}, [commodities, userExpenses]);

	if (commodities.length === 0) {
		return <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed">Loading commodities...</div>;
	}

	return (
		<div className="overflow-hidden shadow-sm rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-800">
			<div className="pb-2">
				{tree.map((node) => (
					<ExpenseNode key={node.code} node={node} level={0} />
				))}
			</div>
		</div>
	);
}

export default ExpenseList;
