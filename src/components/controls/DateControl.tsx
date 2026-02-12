import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { dataStore } from "@/stores/dataStore";
import { settings } from "@/stores/inflationStore";
import { MONTHS } from "@/utils/metadata";
import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const DateControl = () => {
	const appSettings = settings.get();
	const { areaYearsMap } = dataStore.get();

	const [openYear, setOpenYear] = useState(false);
	const [month, setMonth] = useState(MONTHS[appSettings.startDate.getMonth()]);

	const areaAvailableYears = useMemo(() => {
		const years = areaYearsMap[appSettings.areaKey] || [];
		if (years.length === 0) return new Set<number>();

		const minYear = Math.min(...years.map(Number));
		const maxYear = Math.max(...years.map(Number));

		const set = new Set<number>();
		for (let year = maxYear; year >= minYear; year--) {
			set.add(year);
		}

		return set;
	}, [areaYearsMap, appSettings.areaKey]);

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
			settings.setKey("startDate", newDate);
		}
		setOpenYear(false);
	};

	return (
		<div className="flex gap-4">
			<div className="w-full">
				<Select value={month} onValueChange={handleMonthChange}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Month" />
					</SelectTrigger>
					<SelectContent>
						{MONTHS.map((m) => (
							<SelectItem key={m} value={m}>
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
