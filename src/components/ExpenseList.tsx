import { type ExpenseItem } from "@/stores/inflationStore";
import { COMMODITIES } from "@/utils/metadata";
import { useMemo } from "react";
import ExpenseNode from "./ExpenseNode";

export type TreeNode = ExpenseItem & {
	children: TreeNode[];
	isCustom: boolean;
};

function buildTree(items: ExpenseItem[]): TreeNode[] {
	const sorted = [...items].sort((a, b) => a.code.localeCompare(b.code));

	const nodeMap = new Map<string, TreeNode>();
	const roots: TreeNode[] = [];
	const staticCodes = new Set(COMMODITIES.map((c) => c.code));

	sorted.forEach((item) => {
		nodeMap.set(item.code, {
			...item,
			children: [],
			isCustom: !staticCodes.has(item.code),
		});
	});

	sorted.forEach((item) => {
		const node = nodeMap.get(item.code)!;

		let parentFound = false;
		let currentCode = item.code;

		while (currentCode.includes(".")) {
			const parts = currentCode.split(".");
			parts.pop();
			currentCode = parts.join(".");

			if (nodeMap.has(currentCode)) {
				nodeMap.get(currentCode)!.children.push(node);
				parentFound = true;
				break;
			}
		}

		if (!parentFound) {
			roots.push(node);
		}
	});

	return roots;
}

export function ExpenseList({ items }: Readonly<{ items: ExpenseItem[] }>) {
	const tree = useMemo(() => buildTree(items), [items]);

	return (
		<div className="border rounded-xl bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
			<div className="bg-slate-50 dark:bg-slate-900 border-b px-4 py-2 flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
				<span>Category</span>
				<span>Expense</span>
			</div>
			<div className="pb-2">
				{tree.map((node) => (
					<ExpenseNode key={node.id} node={node} level={0} />
				))}
			</div>
		</div>
	);
}

export default ExpenseList;
