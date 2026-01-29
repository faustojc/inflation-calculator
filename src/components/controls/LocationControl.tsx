import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { dataStore } from "@/stores/dataStore";
import { settings } from "@/stores/inflationStore";
import { Check, ChevronsUpDown } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

const LocationControl = () => {
	const { areas, areaYearsMap } = dataStore.get();
	const appSettings = settings.get();

	const [openProvince, setOpenProvince] = useState(false);
	const [selectArea, setSelectArea] = useState<string>(() => {
		if (appSettings.areaKey && areas.length > 0) {
			const match = areas.find((p) => p.key === appSettings.areaKey);
			if (match) {
				return match.name;
			}
		}

		return "National Capital Region (NCR)";
	});

	const groupedAreas = useMemo(() => {
		const grouped: Record<string, { key: string; areaName: string; regionName?: string }[]> = {};
		const filteredArea = areas.filter((a) => a.key !== "aoncr" && a.key !== "philippines" && a.key !== "ncr");

		for (const area of filteredArea) {
			grouped[area.regionId] ??= [];
			if (area.cityId === undefined && area.provinceId === undefined) {
				grouped[area.regionId]!.push({ key: area.key, regionName: area.name, areaName: area.name });
			} else {
				grouped[area.regionId]!.push({ key: area.key, areaName: area.name });
			}
		}

		return grouped;
	}, [areas]);

	const handleAreaSelect = (areaName: string) => {
		const match = areas.find((a) => a.name === areaName);
		if (match) {
			setSelectArea(match.name);
			settings.setKey("areaKey", match.key);

			const newAreaYears = areaYearsMap[match.key] || [];
			const currentYear = appSettings.startDate.getFullYear();
			if (newAreaYears.length > 0 && !newAreaYears.includes(currentYear)) {
				const latestYear = Math.max(...newAreaYears);
				const newDate = new Date(appSettings.startDate);
				newDate.setFullYear(latestYear);
				settings.setKey("startDate", newDate);
			}
		}
		setOpenProvince(false);
	};

	return (
		<Popover open={openProvince} onOpenChange={setOpenProvince}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" aria-expanded={openProvince} className="w-full justify-between font-medium truncate">
					{selectArea || "Select Location..."}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-75 p-0" align="start">
				<Command>
					<CommandInput placeholder="Search province or city..." />
					<CommandList className="max-h-62.5 overflow-y-auto">
						<CommandEmpty>No location found.</CommandEmpty>
						{Object.entries(groupedAreas).map(([region, areas], i) => {
							return (
								<Fragment key={region}>
									<CommandGroup key={region + i} heading={areas.find((a) => a.regionName)?.regionName}>
										{areas
											.filter((a) => a.regionName === undefined)
											.map((a) => (
												<CommandItem key={a.key} value={a.areaName} onSelect={(key) => handleAreaSelect(key)}>
													<Check className={cn("mr-2 h-4 w-4", selectArea === a.areaName ? "opacity-100" : "opacity-0")} />
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
