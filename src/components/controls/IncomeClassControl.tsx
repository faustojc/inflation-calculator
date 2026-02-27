import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { settings, type IncomeClass } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";

const IncomeClassControl = () => {
	const appSettings = useStore(settings);

	// Format the number into currency without currency symbol
	const formatCurrency = (amount: number) => {
		const currency = Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "PhP",
			currencyDisplay: "code",
			maximumFractionDigits: 2,
		}).formatToParts(amount);

		const filteredParts = currency.filter(
			(part) => part.type !== "currency" && (part.type !== "literal" || part.value.trim().length !== 0),
		);

		return filteredParts.map((part) => part.value).join("");
	};

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
				<span className="text-xs text-foreground space-x-1">
					<div className="space-x-1">
						<span>Annual per Capita:</span>
						<span className="font-bold">PhP</span>
						<span className="font-bold">{formatCurrency(appSettings.area.capita)}</span>
					</div>
					<span className="text-xs text-muted-foreground">(as of 2018)</span>
				</span>
			)}
		</div>
	);
};

export default IncomeClassControl;
