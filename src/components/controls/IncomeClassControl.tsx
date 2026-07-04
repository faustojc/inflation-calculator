import { Show } from "solid-js";
import { Select } from "@/components/Select";
import { type IncomeClass, settings } from "@/stores/inflationStore";

const IncomeClassControl = () => {
	const appSettings = settings.get();

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
		<div class="space-y-1">
			<Select
				name="Income class selection"
				value={appSettings.incomeClass}
				onValueChange={(val) => settings.incomeClass.set(val as IncomeClass)}
				class="text-sm cursor-pointer"
				options={[
					{ value: "ALL", label: "All Income Households" },
					{ value: "B30", label: "Bottom 30% Income" },
				]}
			/>
			<Show
				when={
					appSettings.area.annualCapita !== undefined &&
					appSettings.area.annualCapita > 0 &&
					appSettings.area.monthlyCapita !== undefined &&
					appSettings.area.monthlyCapita > 0 &&
					appSettings.incomeClass === "B30"
				}
			>
				<span class="text-xs text-foreground space-x-1">
					<div class="space-x-1">
						<span>Annual per Capita:</span>
						<span class="font-bold">PhP</span>
						<span class="font-bold">{formatCurrency(appSettings.area.annualCapita ?? 0)}</span>
					</div>
					<div class="space-x-1">
						<span>Monthly per Capita:</span>
						<span class="font-bold">PhP</span>
						<span class="font-bold">{formatCurrency(appSettings.area.monthlyCapita ?? 0)}</span>
					</div>
					<span class="text-xs text-muted-foreground">(as of 2018)</span>
				</span>
			</Show>
		</div>
	);
};

export default IncomeClassControl;
