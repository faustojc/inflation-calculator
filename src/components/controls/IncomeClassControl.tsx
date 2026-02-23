import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { settings, type IncomeClass } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";

const IncomeClassControl = () => {
	const appSettings = useStore(settings);

	return (
		<div>
			<Select value={appSettings.incomeClass} onValueChange={(val) => settings.setKey("incomeClass", val as IncomeClass)}>
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="ALL">All Income Households</SelectItem>
					<SelectItem value="B30">Bottom 30% Income (as of 2018)</SelectItem>
				</SelectContent>
			</Select>
			{/* {appSettings.area.capita && appSettings.incomeClass === "B30" && (
				<span className="text-xs text-foreground">
					Capita: {Intl.NumberFormat("en-US", { style: "currency", currency: "PHP", maximumFractionDigits: 2 }).format(appSettings.area.capita)}
				</span>
			)} */}
		</div>
	);
};

export default IncomeClassControl;
