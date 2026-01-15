import { COMMODITY_DISPLAY_CONFIG, type ConfigNode, type UICommodity } from "@/config/commodityDisplay";
import { expenses, type ExpenseItem } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";
import ExpenseNode from "./ExpenseNode";

function mapConfigToNode(config: UICommodity, userExpenses: Record<string, ExpenseItem>): ConfigNode {
	const userItem = userExpenses[config.code];
	const value = userItem ? userItem.value : 0;

	return {
		code: config.code,
		name: config.label || "Unknown Category",
		description: config.description,
		value: value,
		id: config.code,
		children: config.children ? config.children.map((c) => mapConfigToNode(c, userExpenses)) : [],
		depth: config.code.split(".").length,
	};
}

export function ExpenseList() {
	const userExpenses = useStore(expenses);

	return (
		<div className="overflow-hidden shadow-sm rounded-b-xl">
			<div className="bg-slate-50 dark:bg-slate-900 border-b px-4 py-2 flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
				<span>Category</span>
				<span>Expense</span>
			</div>
			<div className="pb-2">
				{COMMODITY_DISPLAY_CONFIG.map((config) => (
					<ExpenseNode key={config.code} node={mapConfigToNode(config, userExpenses)} level={0} />
				))}
			</div>
		</div>
	);
}

export default ExpenseList;
