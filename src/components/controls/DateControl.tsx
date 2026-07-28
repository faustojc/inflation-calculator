import { Check, ChevronsUpDown } from "lucide-solid";
import { createEffect, createMemo, createSignal, Index, Show } from "solid-js";
import { Button } from "@/components/Button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/Command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
import { Select } from "@/components/Select";
import { toast } from "@/components/Toast";
import { cn } from "@/lib/utils";
import { isOnline } from "@/stores/connectionStore";
import { cpiUrl, dataStore } from "@/stores/dataStore";
import { activeTab, settings } from "@/stores/inflationStore";
import { MONTHS } from "@/utils/metadata";
import { isCached } from "@/utils/storage";

const DateControl = () => {
	const startDate = () => settings.startDate.get();
	const incomeClass = () => settings.incomeClass.get();
	const currentManifest = () => dataStore.currentManifest.get();

	const dataType = () => (activeTab.get() === "general" ? "official" : "personal");
	const month = () => MONTHS[startDate().getMonth()];

	const [openYear, setOpenYear] = createSignal(false);

	const areaAvailableYears = createMemo(() => {
		const manifest = dataStore.currentManifest.get();
		const type = dataType();
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

	const maxMonthForYear = createMemo(() => {
		const date = settings.startDate.get();
		const manifest = dataStore.currentManifest.get();
		const type = dataType();
		const selectedIncomeClass = settings.incomeClass.get();
		const year = date.getFullYear();
		if (!manifest?.dates) return 12;
		return manifest.dates[type]?.[selectedIncomeClass]?.[year] ?? 12;
	});

	const checkYearCached = async (year: number): Promise<boolean> => {
		const areaKey = settings.area.peek()?.key;
		if (!areaKey) return false;
		const [current, prev] = await Promise.all([
			isCached(cpiUrl(`data/${areaKey}/${year}.json`)),
			isCached(cpiUrl(`data/${areaKey}/${year - 1}.json`)),
		]);
		return current && prev;
	};

	const handleMonthChange = (m: string) => {
		const newDate = new Date(startDate());
		newDate.setMonth(MONTHS.indexOf(m));
		settings.startDate.set(newDate);
	};

	const handleYearChange = async (yearStr: string) => {
		const yearNum = Number.parseInt(yearStr, 10);

		if (!isOnline.get()) {
			const cached = await checkYearCached(yearNum);
			if (!cached) {
				toast.warning("You're offline. Cannot fetch data for this year.");
				setOpenYear(false);
				return;
			}
		}

		const availableYears = areaAvailableYears();
		if (availableYears.size === 0 || availableYears.has(yearNum)) {
			const newDate = new Date(startDate());
			newDate.setFullYear(yearNum);

			// Validate month for new year
			const maxMonth = currentManifest()?.dates?.[dataType()]?.[incomeClass()]?.[yearNum] ?? 12;
			if (newDate.getMonth() + 1 > maxMonth) {
				newDate.setMonth(maxMonth - 1);
			}

			settings.startDate.set(newDate);
		}
		setOpenYear(false);
	};

	// Clamp selected date when manifest, tab, or available years change
	createEffect(() => {
		const manifest = currentManifest();
		if (!manifest?.dates) return;

		const date = startDate();
		const year = date.getFullYear();
		const availableYears = areaAvailableYears();
		const yearsArr = Array.from(availableYears);
		const minYear = yearsArr.length > 0 ? yearsArr[yearsArr.length - 1]! : null;

		let targetYear = year;
		let needsUpdate = false;

		// Clamp year if it's outside the available range or equals the disabled base year
		const needsClamp = availableYears.size > 0 && (!availableYears.has(year) || year === minYear);
		if (needsClamp && yearsArr.length > 0) {
			targetYear = yearsArr[0]!;
			needsUpdate = true;
		}

		// Clamp month for the (possibly adjusted) year
		const maxMonthCount = manifest.dates[dataType()]?.[incomeClass()]?.[targetYear] ?? 12;
		let targetMonth = date.getMonth();

		if (targetMonth + 1 > maxMonthCount) {
			targetMonth = maxMonthCount - 1;
			needsUpdate = true;
		}

		if (needsUpdate) {
			const newDate = new Date(date);
			newDate.setFullYear(targetYear);
			newDate.setMonth(targetMonth);
			settings.startDate.set(newDate);
		}
	});

	return (
		<div class="flex gap-4">
			<div class="w-full">
				<Select
					value={month()}
					onValueChange={handleMonthChange}
					name="Month selection"
					placeholder="Month"
					class="text-sm cursor-pointer"
					options={MONTHS.filter((_, i) => i < maxMonthForYear()).map((m) => ({ value: m, label: m }))}
				/>
				<span class="text-xs text-center text-muted-foreground">Month</span>
			</div>

			<div class="w-full">
				<Popover open={openYear()} onOpenChange={setOpenYear} modal={true}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={openYear()}
							class="w-full justify-between font-normal"
						>
							{startDate().getFullYear()}
							<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent class="w-55 p-0" align="start">
						<Command>
							<CommandInput placeholder="Year..." name="Year selection" />
							<CommandList>
								<CommandEmpty>No year found.</CommandEmpty>
								<CommandGroup>
									<Index each={Array.from(areaAvailableYears())}>
										{(year, i) => (
											<CommandItem
												value={year().toString()}
												disabled={i === areaAvailableYears().size - 1}
												onSelect={handleYearChange}
												class={cn(
													i === areaAvailableYears().size - 1 &&
														"opacity-50 cursor-not-allowed pointer-events-none",
												)}
											>
												<Show
													when={startDate().getFullYear() === year()}
													fallback={<div class="mr-2 h-4 w-4" />}
												>
													<Check class="mr-2 h-4 w-4" />
												</Show>
												{year()}
											</CommandItem>
										)}
									</Index>
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
				<span class="text-xs text-muted-foreground">Year</span>
			</div>
		</div>
	);
};

export default DateControl;
