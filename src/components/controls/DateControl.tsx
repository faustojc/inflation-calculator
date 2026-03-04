import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { dataStore } from "@/stores/dataStore";
import { activeTab, settings } from "@/stores/inflationStore";
import { MONTHS } from "@/utils/metadata";
import { useStore } from "@nanostores/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const DateControl = () => {
	const appSettings = useStore(settings);
	const { currentManifest } = useStore(dataStore);
	const currentTab = useStore(activeTab);

	const dataType = currentTab === "general" ? "official" : "personal";
	const month = MONTHS[appSettings.startDate.getMonth()];

	const [openYear, setOpenYear] = useState(false);

	const areaAvailableYears = useMemo(() => {
		if (!currentManifest?.dates) return new Set<number>();

		const datesForType = currentManifest.dates[dataType]?.[appSettings.incomeClass];
		if (!datesForType) return new Set<number>();

		const years = Object.keys(datesForType).map(Number);
		if (years.length === 0) return new Set<number>();

		// Exclude rangeMin because inflation needs year-1 data which doesn't exist for the first year
		const metaYearRange = dataStore.get().metaYearRange;
		const rangeMin = metaYearRange?.[dataType]?.min ?? Math.min(...years);
		const rangeMax = metaYearRange?.[dataType]?.max ?? Math.max(...years);

		const filtered = years.filter((y) => y >= rangeMin && y <= rangeMax);
		if (filtered.length === 0) return new Set<number>();

		const minYear = Math.min(...filtered);
		const maxYear = Math.max(...filtered);

		const set = new Set<number>();
		for (let year = maxYear; year >= minYear; year--) {
			set.add(year);
		}

		return set;
	}, [currentManifest, appSettings.incomeClass, dataType]);

	const maxMonthForYear = useMemo(() => {
		const year = appSettings.startDate.getFullYear();
		if (!currentManifest?.dates) return 12;
		return currentManifest.dates[dataType]?.[appSettings.incomeClass]?.[year] ?? 12;
	}, [currentManifest, appSettings.startDate, appSettings.incomeClass, dataType]);

	const handleMonthChange = (m: string) => {
		const newDate = new Date(appSettings.startDate);
		newDate.setMonth(MONTHS.indexOf(m));
		settings.setKey("startDate", newDate);
	};

	const handleYearChange = (yearStr: string) => {
		const yearNum = Number.parseInt(yearStr);
		if (areaAvailableYears.size === 0 || areaAvailableYears.has(yearNum)) {
			const newDate = new Date(appSettings.startDate);
			newDate.setFullYear(yearNum);

			// Validate month for new year
			const maxMonth = currentManifest?.dates?.[dataType]?.[appSettings.incomeClass]?.[yearNum] ?? 12;
			if (newDate.getMonth() + 1 > maxMonth) {
				newDate.setMonth(maxMonth - 1);
			}

			settings.setKey("startDate", newDate);
		}
		setOpenYear(false);
	};

	// Clamp selected date when manifest, tab, or available years change
	// Only updates the external store (settings) month is derived, not local state
	useEffect(() => {
		if (!currentManifest?.dates) return;

		const year = appSettings.startDate.getFullYear();

		// Clamp year if it falls outside the available range for the current tab
		if (areaAvailableYears.size > 0 && !areaAvailableYears.has(year)) {
			const years = Array.from(areaAvailableYears);
			const closestYear = years[0]!;
			const newDate = new Date(appSettings.startDate);
			newDate.setFullYear(closestYear);

			const maxMonthCount = currentManifest.dates[dataType]?.[appSettings.incomeClass]?.[closestYear] ?? 12;
			if (newDate.getMonth() + 1 > maxMonthCount) {
				newDate.setMonth(maxMonthCount - 1);
			}

			settings.setKey("startDate", newDate);
			return;
		}

		const maxMonthCount = currentManifest.dates[dataType]?.[appSettings.incomeClass]?.[year] ?? 12;
		const currentMonthIndex = appSettings.startDate.getMonth();

		// If current setting is beyond available data (e.g. selected June but data only up to March)
		if (currentMonthIndex + 1 > maxMonthCount) {
			const newDate = new Date(appSettings.startDate);
			newDate.setMonth(maxMonthCount - 1);
			settings.setKey("startDate", newDate);
		}
	}, [currentManifest, appSettings.startDate, appSettings.incomeClass, dataType, areaAvailableYears]);

	return (
		<div className="flex gap-4">
			<div className="w-full">
				<Select value={month} onValueChange={handleMonthChange}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Month" />
					</SelectTrigger>
					<SelectContent>
						{MONTHS.filter((_, i) => i < maxMonthForYear).map((m, i) => (
							<SelectItem
								key={m}
								defaultValue={maxMonthForYear.toString()}
								value={m}
								disabled={i >= maxMonthForYear}
							>
								{m}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<span className="text-xs text-center text-muted-foreground">Month</span>
			</div>

			<div className="w-full">
				<Popover open={openYear} onOpenChange={setOpenYear}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={openYear}
							className="w-full justify-between font-normal"
						>
							{appSettings.startDate.getFullYear()}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-35 p-0" align="start">
						<Command>
							<CommandInput placeholder="Year..." />
							<CommandList>
								<CommandEmpty>No year found.</CommandEmpty>
								<CommandGroup className="max-h-62.5 overflow-y-auto">
									{Array.from(areaAvailableYears).map((year, i) => {
										const isBaseYear = i === areaAvailableYears.size - 1;
										return (
											<CommandItem
												key={year}
												value={year.toString()}
												disabled={isBaseYear}
												onSelect={handleYearChange}
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4",
														appSettings.startDate.getFullYear() === year
															? "opacity-100"
															: "opacity-0",
													)}
												/>
												{year}
											</CommandItem>
										);
									})}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
				<span className="text-xs text-muted-foreground">Year</span>
			</div>
		</div>
	);
};

export default DateControl;
