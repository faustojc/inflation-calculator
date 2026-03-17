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
import { dataStore, getAreaManifest, setCurrentArea } from "@/stores/dataStore";
import { activeTab, settings } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

const LocationControl = () => {
	const { areas } = dataStore.get();
	const appSettings = useStore(settings);

	const [openProvince, setOpenProvince] = useState(false);

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

	const groupedAreas: Record<number, { key: string; areaName: string; regionName?: string }[]> = useMemo(() => {
		const grouped: Record<number, { key: string; areaName: string; regionName?: string }[]> = {};
		const filteredArea = areas.filter((a) => a.key !== "aoncr" && a.key !== "philippines");

		for (const area of filteredArea) {
			grouped[area.regionId] ??= [];

			if (area.key === "ncr" && !area.provinceId && !area.cityId) {
				grouped[area.regionId]!.push({
					key: area.key,
					regionName: area.name,
					areaName: area.name,
				});
				grouped[area.regionId]!.push({
					key: area.key,
					areaName: area.name,
				});
				continue;
			}

			if (area.cityId === undefined && area.provinceId === undefined) {
				grouped[area.regionId]!.push({
					key: area.key,
					regionName: area.name,
					areaName: area.name,
				});
			} else {
				grouped[area.regionId]!.push({ key: area.key, areaName: area.name });
			}
		}

		return grouped;
	}, [areas]);

	const handleAreaSelect = async (areaName: string) => {
		const match = areas.find((a) => a.name === areaName);
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
	};

	return (
		<Popover open={openProvince} onOpenChange={setOpenProvince} modal={true}>
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
				<Command>
					<CommandInput placeholder="Search province or city..." name="Location selection" />
					<CommandList className="overflow-y-auto">
						<CommandEmpty>No location found.</CommandEmpty>
						<CommandSeparator />
						{Object.entries(groupedAreas).map(([region, areas], i) => {
							return (
								<Fragment key={region}>
									<CommandGroup key={region + i} heading={areas.find((a) => a.regionName)?.regionName}>
										{areas
											.filter((a) => a.regionName === undefined)
											.map((a, i) => (
												<CommandItem
													key={a.key + i}
													value={a.areaName}
													onSelect={(key) => handleAreaSelect(key)}
												>
													<Check
														className={cn(
															"mr-2 h-4 w-4",
															selectArea === a.areaName ? "opacity-100" : "opacity-0",
														)}
													/>
													{a.areaName}
												</CommandItem>
											))}
									</CommandGroup>
									{i < Object.entries(groupedAreas).length - 1 && <CommandSeparator key={region + i + 2} />}
								</Fragment>
							);
						})}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

export default LocationControl;
