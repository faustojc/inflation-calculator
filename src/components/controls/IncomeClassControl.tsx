import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { settings, type IncomeClass } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";

const IncomeClassControl = () => {
	const appSettings = useStore(settings);

	return (
		<Select value={appSettings.incomeClass} onValueChange={(val) => settings.setKey("incomeClass", val as IncomeClass)}>
			<SelectTrigger className="w-full">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="ALL">All Income Households</SelectItem>
				<SelectItem value="B30">Bottom 30% Income</SelectItem>
			</SelectContent>
		</Select>
	);
};

export default IncomeClassControl;
