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
		description: def.description,
	};
}

export function ExpenseTab() {
	const { commodities } = useStore(dataStore);

	const tree = useMemo(() => {
		if (!commodities || commodities.length === 0) return [];
		return commodities.map((c) => mapDataToNode(c, 0, 1));
	}, [commodities]);

	return (
		<div id="detailed-tab" className="space-y-3">
			<div className="flex justify-between items-center">
				<div>
					<h2 className="font-bold text-base text-slate-800 flex items-center gap-2">
						Commodity Breakdown
					</h2>
					<p className="text-xs text-muted-foreground">
						Expand categories to input specific expenses
					</p>
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

			<div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
				<div className="pb-1">
					{tree.map((node) => (
						<ExpenseNode key={node.code} node={node} level={0} />
					))}
				</div>
			</div>
		</div>
	);
}

export default ExpenseTab;
