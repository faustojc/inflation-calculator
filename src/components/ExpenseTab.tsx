import ExpenseNode from "@/components/ExpenseNode";
import { Button } from "@/components/ui/button";
import type { CommodityDef } from "@/lib/types";
import { dataStore } from "@/stores/dataStore";
import { clearExpenses } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";
import { Trash2 } from "lucide-react";
import { useMemo } from "react";

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
		// description: def.description
	};
}

export function ExpenseTab() {
	const { commodities } = useStore(dataStore);

	const tree = useMemo(() => {
		if (!commodities || commodities.length === 0) return [];
		return commodities.map((c) => mapDataToNode(c, 0, 1));
	}, [commodities]);

	return (
		<div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
			<div className="p-4 gap-2 border-b flex justify-between items-center">
				<div>
					<h2 className="font-bold text-lg">Detailed Commodities</h2>
					<p className="text-muted-foreground text-wrap">Expand commodities to add expenses</p>
				</div>

				<Button className="cursor-pointer" onClick={clearExpenses}>
					<Trash2 className="h-4 w-4" />
					Clear
				</Button>
			</div>
			<div className="overflow-hidden animate-in fade-in slide-in-from-bottom-4 shadow-sm rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-800">
				<div className="pb-2">
					{tree.map((node) => (
						<ExpenseNode key={node.code} node={node} level={0} />
					))}
				</div>
			</div>
		</div>
	);
}

export default ExpenseTab;
