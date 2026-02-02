import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { dataStore } from "@/stores/dataStore";
import { settings } from "@/stores/inflationStore";
import { MONTHS } from "@/utils/metadata";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const DateControl = () => {
	const appSettings = settings.get();
	const { availableYears, areaYearsMap } = dataStore.get();

	const [openYear, setOpenYear] = useState(false);
	const [month, setMonth] = useState(MONTHS[appSettings.startDate.getMonth()]);

	const areaAvailableYears = new Set(areaYearsMap[appSettings.areaKey] || []);

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
			<div className="space-y-1">
				<span className="text-xs text-muted-foreground">Month</span>
				<Select value={month} onValueChange={handleMonthChange}>
					<SelectTrigger>
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
			</div>

			<div className="space-y-1">
				<span className="text-xs text-muted-foreground">Year</span>
				<Popover open={openYear} onOpenChange={setOpenYear}>
					<PopoverTrigger asChild>
						<Button variant="outline" role="combobox" aria-expanded={openYear} className="w-full justify-between font-normal">
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
									{availableYears.map((year, i) => {
										const yearNum = Number(year);
										const isUnavailable = areaAvailableYears.size > 0 && !areaAvailableYears.has(yearNum);
										const isBaseYear = i === availableYears.length - 1;
										return (
											<CommandItem
												key={year}
												value={year}
												disabled={isUnavailable || isBaseYear}
												onSelect={handleYearChange}
												className={isUnavailable ? "opacity-50" : ""}
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4",
														appSettings.startDate.getFullYear().toString() === year ? "opacity-100" : "opacity-0",
													)}
												/>
												{year}
												{isUnavailable && <span className="ml-auto text-xs text-muted-foreground">No data</span>}
											</CommandItem>
										);
									})}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
};

export default DateControl;
