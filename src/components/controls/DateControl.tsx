import { useValue } from "@legendapp/state/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { isOnline } from "@/stores/connectionStore";
import { cpiUrl, dataStore } from "@/stores/dataStore";
import { activeTab, settings } from "@/stores/inflationStore";
import { MONTHS } from "@/utils/metadata";
import { isCached } from "@/utils/storage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const DateControl = () => {
	const startDate = useValue(settings.startDate);
	const incomeClass = useValue(settings.incomeClass);
	const area = useValue(settings.area);
	const currentManifest = useValue(dataStore.currentManifest);
	const currentTab = useValue(activeTab);

	const dataType = currentTab === "general" ? "official" : "personal";
	const month = MONTHS[startDate.getMonth()];

	const [openYear, setOpenYear] = useState(false);

	const areaAvailableYears = useValue(() => {
		const manifest = dataStore.currentManifest.get();
		const tab = activeTab.get();
		const type = tab === "general" ? "official" : "personal";
		const selectedIncomeClass = settings.incomeClass.get();
		if (!manifest?.dates) return new Set<number>();

		const datesForType = manifest.dates[type]?.[selectedIncomeClass];
		if (!datesForType) return new Set<number>();

		const years = Object.keys(datesForType).map(Number);
		if (years.length === 0) return new Set<number>();

		// Exclude rangeMin because inflation needs year-1 data which doesn't exist for the first year
		const metaYearRange = dataStore.metaYearRange.get();
		const rangeMin = metaYearRange?.[type]?.min ?? Math.min(...years);
		const rangeMax = metaYearRange?.[type]?.max ?? Math.max(...years);

		const filtered = years.filter((y) => y >= rangeMin && y <= rangeMax);
		if (filtered.length === 0) return new Set<number>();

		const minYear = Math.min(...filtered);
		const maxYear = Math.max(...filtered);

		const set = new Set<number>();
		for (let year = maxYear; year >= minYear; year--) {
			set.add(year);
		}

		return set;
	});

	const maxMonthForYear = useValue(() => {
		const date = settings.startDate.get();
		const manifest = dataStore.currentManifest.get();
		const tab = activeTab.get();
		const type = tab === "general" ? "official" : "personal";
		const selectedIncomeClass = settings.incomeClass.get();
		const year = date.getFullYear();
		if (!manifest?.dates) return 12;
		return manifest.dates[type]?.[selectedIncomeClass]?.[year] ?? 12;
	});

	const checkYearCached = async (year: number): Promise<boolean> => {
		const areaKey = area?.key;
		if (!areaKey) return false;
		const [current, prev] = await Promise.all([
			isCached(cpiUrl(`data/${areaKey}/${year}.json`)),
			isCached(cpiUrl(`data/${areaKey}/${year - 1}.json`)),
		]);
		return current && prev;
	};

	const handleMonthChange = (m: string) => {
		const newDate = new Date(startDate);
		newDate.setMonth(MONTHS.indexOf(m));
		settings.startDate.set(newDate);
	};

	const handleYearChange = async (yearStr: string) => {
		const yearNum = Number.parseInt(yearStr, 10);

		if (!isOnline.peek()) {
			const cached = await checkYearCached(yearNum);
			if (!cached) {
				toast.warning("You're offline. Cannot fetch data for this year.");
				setOpenYear(false);
				return;
			}
		}

		if (areaAvailableYears.size === 0 || areaAvailableYears.has(yearNum)) {
			const newDate = new Date(startDate);
			newDate.setFullYear(yearNum);

			// Validate month for new year
			const maxMonth = currentManifest?.dates?.[dataType]?.[incomeClass]?.[yearNum] ?? 12;
			if (newDate.getMonth() + 1 > maxMonth) {
				newDate.setMonth(maxMonth - 1);
			}

			startTransition(() => {
				settings.startDate.set(newDate);
			});
		}
		setOpenYear(false);
	};

	// Clamp selected date when manifest, tab, or available years change and
	// batch year + month clamp into a single state update to avoid cascading re-renders
	useEffect(() => {
		if (!currentManifest?.dates) return;

		const year = startDate.getFullYear();
		const yearsArr = Array.from(areaAvailableYears);
		const minYear = yearsArr.length > 0 ? yearsArr[yearsArr.length - 1]! : null;

		let targetYear = year;
		let needsUpdate = false;

		// Clamp year if it's outside the available range or equals the disabled base year
		const needsClamp = areaAvailableYears.size > 0 && (!areaAvailableYears.has(year) || year === minYear);
		if (needsClamp && yearsArr.length > 0) {
			targetYear = yearsArr[0]!;
			needsUpdate = true;
		}

		// Clamp month for the (possibly adjusted) year
		const maxMonthCount = currentManifest.dates[dataType]?.[incomeClass]?.[targetYear] ?? 12;
		let targetMonth = startDate.getMonth();

		if (targetMonth + 1 > maxMonthCount) {
			targetMonth = maxMonthCount - 1;
			needsUpdate = true;
		}

		if (needsUpdate) {
			const newDate = new Date(startDate);
			newDate.setFullYear(targetYear);
			newDate.setMonth(targetMonth);
			settings.startDate.set(newDate);
		}
	}, [currentManifest, startDate, incomeClass, dataType, areaAvailableYears]);

	return (
		<div className="flex gap-4">
			<div className="w-full">
				<Select value={month} onValueChange={handleMonthChange} name="Month selection">
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
							{startDate.getFullYear()}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-35 p-0" align="start">
						<Command>
							<CommandInput placeholder="Year..." name="Year selection" />
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
														startDate.getFullYear() === year ? "opacity-100" : "opacity-0",
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
