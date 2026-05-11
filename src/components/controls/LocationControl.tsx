import { useStore } from "@nanostores/react";
import { Check, ChevronsUpDown, Loader2Icon } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { isOnline } from "@/stores/connectionStore";
import { dataStore, getAreaManifest, setCurrentArea } from "@/stores/dataStore";
import { activeTab, settings } from "@/stores/inflationStore";
import { isCached } from "@/utils/storage";

interface GroupedArea {
	key: string;
	areaName: string;
	regionName?: string;
}

const LocationControl = () => {
	const { areas } = dataStore.get();
	const appSettings = useStore(settings);

	const [openProvince, setOpenProvince] = useState(false);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState({
		key: "",
		isLoading: false,
	});

	const selectArea = useMemo(() => {
		if (appSettings.area && areas.length > 0) {
			const match = areas.find(
				(p) =>
					p.key === appSettings.area.key &&
					p.regionId === appSettings.area.regionId &&
					p.provinceId === appSettings.area.provinceId &&
					p.cityId === appSettings.area.cityId,
			);
			if (match) return match.name;
		}
		return "National Capital Region (NCR)";
	}, [appSettings.area, areas]);

	const groupedAreas = useMemo(() => {
		const grouped: Record<number, GroupedArea[]> = {};
		const filteredArea = areas.filter((a) => a.key !== "aoncr" && a.key !== "philippines");

		for (const area of filteredArea) {
			grouped[area.regionId] ??= [];

			if (area.key === "ncr" && !area.provinceId && !area.cityId) {
				grouped[area.regionId]!.push({ key: area.key, regionName: area.name, areaName: area.name });
				grouped[area.regionId]!.push({ key: area.key, areaName: area.name });
				continue;
			}

			if (area.cityId === undefined && area.provinceId === undefined) {
				grouped[area.regionId]!.push({ key: area.key, regionName: area.name, areaName: area.name });
			} else {
				grouped[area.regionId]!.push({ key: area.key, areaName: area.name });
			}
		}

		return grouped;
	}, [areas]);

	const regionHeadings = useMemo(() => {
		const headings: Record<string, string> = {};
		for (const [region, items] of Object.entries(groupedAreas)) {
			const heading = items.find((a) => a.regionName);
			if (heading) headings[region] = heading.regionName!;
		}
		return headings;
	}, [groupedAreas]);

	const filteredGroups = useMemo(() => {
		const query = search.toLowerCase().trim();
		const entries = Object.entries(groupedAreas);

		if (!query) return entries;

		const result: [string, GroupedArea[]][] = [];

		for (const [region, items] of entries) {
			const regionName = regionHeadings[region]?.toLowerCase() ?? "";
			const regionMatches = regionName.includes(query);

			// If the region name matches, include all its children
			if (regionMatches) {
				result.push([region, items]);
				continue;
			}

			// filter to matching children only
			const matchingItems = items.filter(
				(a) => !a.regionName && a.areaName.toLowerCase().includes(query),
			);

			if (matchingItems.length > 0) {
				result.push([region, matchingItems]);
			}
		}

		return result;
	}, [search, groupedAreas, regionHeadings]);

	const handleAreaSelect = async (areaName: string) => {
		const match = areas.find((a) => a.name === areaName);

		if (!isOnline.get() && match) {
			const year = appSettings.startDate.getFullYear();
			const base = `/api/cpi?key=api/v2/data/${match.key}`;
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
			settings.setKey("area", match);

			if (manifest?.dates) {
				const dataType = activeTab.get() === "general" ? "official" : "personal";
				const datesForType = manifest.dates[dataType]?.[appSettings.incomeClass];

				if (datesForType) {
					const availableYears = Object.keys(datesForType).map(Number);
					const currentYear = appSettings.startDate.getFullYear();

					if (availableYears.length > 0 && !availableYears.includes(currentYear)) {
						const latestYear = Math.max(...availableYears);
						const newDate = new Date(appSettings.startDate);
						newDate.setFullYear(latestYear);

						// Also validate month for the new year
						const maxMonth = datesForType[latestYear] ?? 12;
						if (newDate.getMonth() + 1 > maxMonth) {
							newDate.setMonth(maxMonth - 1);
						}

						settings.setKey("startDate", newDate);
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
			open={openProvince}
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
					aria-expanded={openProvince}
					className="w-full justify-between font-medium truncate"
				>
					{selectArea || "Select Location..."}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-75 p-0" align="start">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder="Search province or city..."
						name="Location selection"
						value={search}
						onValueChange={setSearch}
					/>
					<CommandList className="overflow-y-auto">
						{filteredGroups.length === 0 && <CommandEmpty>No location found.</CommandEmpty>}
						<CommandSeparator />
						{filteredGroups.map(([region, areas], i) => (
							<Fragment key={region}>
								<CommandGroup heading={regionHeadings[region]}>
									{areas
										.filter((a) => a.regionName === undefined)
										.map((a, j) => (
											<CommandItem
												key={a.key + j}
												value={a.areaName}
												onSelect={(key) => handleAreaSelect(key)}
												className="justify-between"
											>
												<div className="flex items-center gap-2">
													<Check
														className={cn(
															"mr-2 h-4 w-4",
															selectArea === a.areaName ? "opacity-100" : "opacity-0",
														)}
													/>
													{a.areaName}
												</div>

												{loading.key === a.key && loading.isLoading && (
													<Loader2Icon className="animate-spin" />
												)}
											</CommandItem>
										))}
								</CommandGroup>
								{i < filteredGroups.length - 1 && <CommandSeparator key={region + i + 2} />}
							</Fragment>
						))}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

export default LocationControl;
