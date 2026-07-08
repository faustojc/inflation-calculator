import { Check, ChevronsUpDown, LoaderCircle } from "lucide-solid";
import { createMemo, createSignal, For, Show } from "solid-js";
import { Button } from "@/components/Button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/Command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
import { toast } from "@/components/Toast";
import { cn } from "@/lib/utils";
import { isOnline } from "@/stores/connectionStore";
import { cpiUrl, dataStore, getAreaManifest, setCurrentArea } from "@/stores/dataStore";
import { activeTab, settings } from "@/stores/inflationStore";
import { isCached } from "@/utils/storage";

interface GroupedArea {
	key: string;
	areaName: string;
	regionName?: string;
}

function groupAreas(areas: ReturnType<typeof dataStore.areas.get>) {
	const grouped: Record<number, GroupedArea[]> = {};
	const filteredArea = areas.filter((a) => a.key !== "aoncr" && a.key !== "philippines");

	for (const area of filteredArea) {
		grouped[area.regionId] ??= [];

		if (area.key === "ncr" && !area.provinceId && !area.cityId) {
			grouped[area.regionId]?.push({ key: area.key, regionName: area.name, areaName: area.name });
			grouped[area.regionId]?.push({ key: area.key, areaName: area.name });
			continue;
		}

		if (area.cityId === undefined && area.provinceId === undefined) {
			grouped[area.regionId]?.push({ key: area.key, regionName: area.name, areaName: area.name });
		} else {
			grouped[area.regionId]?.push({ key: area.key, areaName: area.name });
		}
	}

	return grouped;
}

function getRegionHeadings(groupedAreas: Record<number, GroupedArea[]>) {
	const headings: Record<string, string> = {};
	for (const [region, items] of Object.entries(groupedAreas)) {
		const heading = items.find((a) => a.regionName);
		if (heading) headings[region] = heading.regionName!;
	}
	return headings;
}

const LocationControl = () => {
	const [openProvince, setOpenProvince] = createSignal(false);
	const [search, setSearch] = createSignal("");
	const [loading, setLoading] = createSignal({
		key: "",
		isLoading: false,
	});

	const selectArea = createMemo(() => {
		const currentArea = settings.area.get();
		const currentAreas = dataStore.areas.get();
		if (currentArea && currentAreas.length > 0) {
			const match = currentAreas.find(
				(p) =>
					p.key === currentArea.key &&
					p.regionId === currentArea.regionId &&
					p.provinceId === currentArea.provinceId &&
					p.cityId === currentArea.cityId,
			);
			if (match) return match.name;
		}
		return "National Capital Region (NCR)";
	});

	const groupedAreas = createMemo(() => groupAreas(dataStore.areas.get()));
	const regionHeadings = createMemo(() => getRegionHeadings(groupedAreas()));
	const filteredGroups = createMemo(() => {
		const query = search().toLowerCase().trim();
		const headings = regionHeadings();
		return Object.entries(groupedAreas()).reduce<[string, GroupedArea[]][]>((result, [region, items]) => {
			if (!query) {
				result.push([region, items]);
				return result;
			}

			const regionName = headings[region]?.toLowerCase() ?? "";
			if (regionName.includes(query)) {
				result.push([region, items]);
				return result;
			}

			const matchingItems = items.filter((a) => !a.regionName && a.areaName.toLowerCase().includes(query));
			if (matchingItems.length > 0) result.push([region, matchingItems]);

			return result;
		}, []);
	});

	const handleAreaSelect = async (areaName: string) => {
		const startDate = settings.startDate.peek();
		const match = dataStore.areas.peek().find((a) => a.name === areaName);

		if (!isOnline.get() && match) {
			const year = startDate.getFullYear();
			const base = cpiUrl(`data/${match.key}`);
			const [manifest, current, prev] = await Promise.all([
				isCached(`${base}/manifest.json`),
				isCached(`${base}/${year}.json`),
				isCached(`${base}/${year - 1}.json`),
			]);
			if (!manifest || !current || !prev) {
				toast.warning("You're offline. Cannot load data for this location.");
				setOpenProvince(false);
				return;
			}
		}
		setLoading({
			key: match?.key ?? "",
			isLoading: true,
		});

		if (match) {
			await setCurrentArea(match.key);

			const manifest = await getAreaManifest(match.key);
			settings.area.set(match);

			if (manifest?.dates) {
				const dataType = activeTab.get() === "general" ? "official" : "personal";
				const datesForType = manifest.dates[dataType]?.[settings.incomeClass.peek()];

				if (datesForType) {
					const availableYears = Object.keys(datesForType).map(Number);
					const currentYear = startDate.getFullYear();

					if (availableYears.length > 0 && !availableYears.includes(currentYear)) {
						const latestYear = Math.max(...availableYears);
						const newDate = new Date(startDate);
						newDate.setFullYear(latestYear);

						// Also validate month for the new year
						const maxMonth = datesForType[latestYear] ?? 12;
						if (newDate.getMonth() + 1 > maxMonth) {
							newDate.setMonth(maxMonth - 1);
						}

						settings.startDate.set(newDate);
					}
				}
			}
		}
		setOpenProvince(false);
		setSearch("");
		setLoading({
			key: "",
			isLoading: false,
		});
	};

	return (
		<Popover
			open={openProvince()}
			onOpenChange={(open) => {
				setOpenProvince(open);
				if (!open) setSearch("");
			}}
			modal={true}
		>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={openProvince()}
					class="w-full justify-between"
				>
					<span class="text-sm font-medium truncate">{selectArea() || "Select Location..."}</span>
					<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent class="w-75 p-0" align="start">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder="Search province or city..."
						name="Location selection"
						value={search()}
						onValueChange={setSearch}
					/>
					<CommandList class="overflow-y-auto">
						<Show when={filteredGroups().length === 0}>
							<CommandEmpty>No location found.</CommandEmpty>
						</Show>
						<CommandSeparator />
						<For each={filteredGroups()}>
							{([region, areas], i) => (
								<>
									<CommandGroup heading={regionHeadings()[region]}>
										<For each={areas.filter((a) => a.regionName === undefined)}>
											{(a) => (
												<CommandItem
													value={a.areaName}
													onSelect={(key) => handleAreaSelect(key)}
													class="justify-between"
												>
													<div class="flex items-center gap-2">
														<Check
															class={cn(
																"mr-2 h-4 w-4",
																selectArea() === a.areaName ? "opacity-100" : "opacity-0",
															)}
														/>
														{a.areaName}
													</div>

													<Show when={loading().key === a.key && loading().isLoading}>
														<LoaderCircle class="animate-spin" />
													</Show>
												</CommandItem>
											)}
										</For>
									</CommandGroup>
									<Show when={i() < filteredGroups().length - 1}>
										<CommandSeparator />
									</Show>
								</>
							)}
						</For>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

export default LocationControl;
