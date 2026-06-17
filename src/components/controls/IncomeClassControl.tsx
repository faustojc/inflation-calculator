import { use$ } from "@legendapp/state/react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type IncomeClass, settings } from "@/stores/inflationStore";

const IncomeClassControl = () => {
	const appSettings = use$(settings);

	// Format the number into currency without currency symbol
	const formatCurrency = (amount: number) => {
		const currency = Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "PhP",
			currencyDisplay: "code",
			maximumFractionDigits: 2,
		}).formatToParts(amount);

		const filteredParts = currency.filter(
			(part) =>
				part.type !== "currency" &&
				(part.type !== "literal" || part.value.trim().length !== 0),
		);

		return filteredParts.map((part) => part.value).join("");
	};

	return (
		<div className="space-y-1">
			<Select
				name="Income class selection"
				value={appSettings.incomeClass}
				onValueChange={(val) => settings.incomeClass.set(val as IncomeClass)}
			>
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="ALL">All Income Households</SelectItem>
					<SelectItem value="B30">Bottom 30% Income</SelectItem>
				</SelectContent>
			</Select>
			{appSettings.area.annualCapita !== undefined &&
				appSettings.area.annualCapita > 0 &&
				appSettings.area.monthlyCapita !== undefined &&
				appSettings.area.monthlyCapita > 0 &&
				appSettings.incomeClass === "B30" && (
					<span className="text-xs text-foreground space-x-1">
						<div className="space-x-1">
							<span>Annual per Capita:</span>
							<span className="font-bold">PhP</span>
							<span className="font-bold">
								{formatCurrency(appSettings.area.annualCapita)}
							</span>
						</div>
						<div className="space-x-1">
							<span>Monthly per Capita:</span>
							<span className="font-bold">PhP</span>
							<span className="font-bold">
								{formatCurrency(appSettings.area.monthlyCapita)}
							</span>
						</div>
						<span className="text-xs text-muted-foreground">(as of 2018)</span>
					</span>
				)}
		</div>
	);
};

export default IncomeClassControl;
