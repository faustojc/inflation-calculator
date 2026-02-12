import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { settings } from "@/stores/inflationStore";

const IncomeClassControl = () => {
	const appSettings = settings.get();

	return (
		<Select
			value={appSettings.incomeClass}
			onValueChange={(val) => settings.setKey("incomeClass", val as "all" | "bottom30")}
		>
			<SelectTrigger className="w-full">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="all">All Income Households</SelectItem>
				<SelectItem value="bottom30" disabled>
					Bottom 30% Income
				</SelectItem>
			</SelectContent>
		</Select>
	);
};

export default IncomeClassControl;
