import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { settings, type IncomeClass } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";

const IncomeClassControl = () => {
	const appSettings = useStore(settings);

	return (
		<div className="space-y-1">
			<Select value={appSettings.incomeClass} onValueChange={(val) => settings.setKey("incomeClass", val as IncomeClass)}>
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="ALL">All Income Households</SelectItem>
					<SelectItem value="B30">Bottom 30% Income</SelectItem>
				</SelectContent>
			</Select>
			{appSettings.area.capita && appSettings.incomeClass === "B30" && (
				<span className="text-xs text-foreground flex items-center gap-1">
					<span>Capita:</span>
					<span className="font-bold">
						{Intl.NumberFormat("en-US", { style: "currency", currency: "PHP", maximumFractionDigits: 2 }).format(
							appSettings.area.capita,
						)}
					</span>
					<span>(as of 2018)</span>
				</span>
			)}
		</div>
	);
};

export default IncomeClassControl;
