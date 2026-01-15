import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { majorCategories } from "@/stores/dataStore";
import { expenses, totalAllocation, uiState, updateExpenseValue } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";
import { Info } from "lucide-react";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
	"01": "e.g. rice, meat, fish, vegetables, fruits, sugar, milk, soft drinks, coffee",
	"02": "e.g. cigarette, liquor, beer, wine, spirits",
	"03": "e.g. t-shirts, pants, underwear, footwear, tailoring services",
	"04": "e.g. rental, electricity, water, LPG, kerosene, home repairs",
	"05": "e.g. furniture, appliances, utensils, detergent, domestic services",
	"06": "e.g. medicines, vitamins, consultation fees, hospital charges",
	"07": "e.g. gasoline, diesel, jeepney/bus/taxi fare, vehicle purchase",
	"08": "e.g. mobile phone load, internet plan, laptop/phone purchase",
	"09": "e.g. school supplies, books, pets, movies, recreational trips",
	"10": "e.g. tuition fees (primary, secondary, tertiary)",
	"11": "e.g. meals in restaurants, fast food, hotels, motels",
	"12": "e.g. ATM withdrawal fees, money transfer charges",
	"13": "e.g. haircut, parlor services, hygiene products, personal effects",
};

export function GeneralTab() {
	const categories = useStore(majorCategories);
	const items = useStore(expenses);
	const currentTotal = useStore(totalAllocation);
	const { mode, totalBudget } = useStore(uiState);

	const isOverLimit = mode === "percent" && currentTotal > 100;

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
			<div className="grid gap-4">
				{categories.map((cat) => {
					const val = items[cat.code]?.value || 0;

					return (
						<div key={cat.code} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-xl bg-card hover:border-blue-300 transition-colors">
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-1">
									<span className="font-mono text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-1.5 rounded">{cat.code}</span>
									<h3 className="font-semibold text-sm">{cat.name}</h3>
								</div>
								<p className="text-xs text-muted-foreground leading-relaxed">
									{CATEGORY_DESCRIPTIONS[cat.code] || "General expenses for this category"}
								</p>
							</div>

							<div className="w-full sm:w-35 shrink-0">
								<div className="relative">
									<span className="absolute left-3 top-2.5 text-muted-foreground text-xs font-bold">{mode === "percent" ? "%" : "₱"}</span>
									<Input
										type="number"
										placeholder="0"
										className={`pl-8 font-mono text-right ${
											mode === "percent" && isOverLimit && val > 0 ? "border-red-300 focus-visible:ring-red-500" : ""
										}`}
										value={val || ""}
										onChange={(e) => {
											const v = Number.parseFloat(e.target.value);
											updateExpenseValue(cat.code, cat.name, Number.isNaN(v) ? 0 : v);
										}}
									/>
								</div>

								{mode === "percent" && totalBudget > 0 && val > 0 && (
									<div className="text-[10px] text-right text-muted-foreground mt-1">
										≈ ₱{((val / 100) * totalBudget).toLocaleString(undefined, { maximumFractionDigits: 0 })}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{mode === "percent" && totalBudget === 0 && (
				<Alert className="bg-amber-50 text-amber-900 border-amber-200">
					<Info className="h-4 w-4" />
					<AlertDescription>
						Please enter a <strong>Total Monthly Expense</strong> above to see the Peso equivalent.
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}
