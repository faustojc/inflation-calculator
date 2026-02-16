import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { dataStore } from "@/stores/dataStore";
import { settings } from "@/stores/inflationStore";
import { MONTHS } from "@/utils/metadata";
import { useStore } from "@nanostores/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const DateControl = () => {
	const appSettings = useStore(settings);
	const { currentManifest } = useStore(dataStore);

	const [openYear, setOpenYear] = useState(false);
	const [month, setMonth] = useState(() => {
		const year = appSettings.startDate.getFullYear();
		const available = currentManifest?.dates?.[year] ?? 12;
		return MONTHS[available - 1];
	});

	const areaAvailableYears = useMemo(() => {
		if (!currentManifest?.dates) return new Set<number>();

		const years = Object.keys(currentManifest.dates).map(Number);
		if (years.length === 0) return new Set<number>();

		const minYear = Math.min(...years);
		const maxYear = Math.max(...years);

		const set = new Set<number>();
		for (let year = maxYear; year >= minYear; year--) {
			set.add(year);
		}

		return set;
	}, [currentManifest]);

	const maxMonthForYear = useMemo(() => {
		const year = appSettings.startDate.getFullYear();
		if (!currentManifest?.dates) return 12;
		return currentManifest.dates[year] ?? 12;
	}, [currentManifest, appSettings.startDate]);

	const handleMonthChange = (m: string) => {
		setMonth(m);
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
			const maxMonth = currentManifest?.dates?.[yearNum] ?? 12;
			if (newDate.getMonth() + 1 > maxMonth) {
				newDate.setMonth(maxMonth - 1);
				setMonth(MONTHS[maxMonth - 1]);
			}

			settings.setKey("startDate", newDate);
		}
		setOpenYear(false);
	};

	// Sync startup/manifest changes with store validation
	useEffect(() => {
		if (!currentManifest?.dates) return;

		const year = appSettings.startDate.getFullYear();
		const maxMonthCount = currentManifest.dates[year] ?? 12;
		const currentMonthIndex = appSettings.startDate.getMonth();

		// If current setting is beyond available data (e.g. selected June but data only up to March)
		if (currentMonthIndex + 1 > maxMonthCount) {
			const newDate = new Date(appSettings.startDate);
			newDate.setMonth(maxMonthCount - 1);
			settings.setKey("startDate", newDate);
			setMonth(MONTHS[maxMonthCount - 1]);
		} else {
			const storeMonthName = MONTHS[currentMonthIndex];
			if (month !== storeMonthName) {
				setMonth(storeMonthName);
			}
		}
	}, [currentManifest, appSettings.startDate]);

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
