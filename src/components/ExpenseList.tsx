import { commodityTree } from "@/stores/dataStore";
import { useStore } from "@nanostores/react";
import ExpenseNode from "./ExpenseNode";

export function ExpenseList() {
	const tree = useStore(commodityTree);

	if (tree.length === 0) {
		return <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed">Loading categories...</div>;
	}

	return (
		<div className="border rounded-xl bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
			<div className="bg-slate-50 dark:bg-slate-900 border-b px-4 py-2 flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
				<span>Category</span>
				<span>Expense</span>
			</div>
			<div className="pb-2">
				{tree.map((node) => (
					<ExpenseNode key={node.code} node={node} level={0} />
				))}
			</div>
		</div>
	);
}

export default ExpenseList;
