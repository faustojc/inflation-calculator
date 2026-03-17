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
import { Check, ChevronsUpDown, LocateFixed } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { fuzzyScore } from "@/lib/fuzzySearch";
import type { AreaDef } from "@/lib/types";
import { toast } from "sonner";

const LocationControl = () => {
	const { areas } = dataStore.get();
	const appSettings = useStore(settings);

	const [openProvince, setOpenProvince] = useState(false);
	const [isLocating, setIsLocating] = useState(false);

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

	const handleUseLocation = () => {
		if (!("geolocation" in navigator)) {
			toast.error("Geolocation is not supported by your browser which is used to determine your location.");
			return;
		}

		setIsLocating(true);

		toast.promise(
			new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(
					async (position) => {
						try {
							const lat = position.coords.latitude;
							const lon = position.coords.longitude;
							const apiStr = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;

							const res = await fetch(apiStr);
							const data = await res.json();

							const city = data.locality || data.city || "";
							const region = data.principalSubdivision || "";
							const country = data.countryName || "";

							let bestMatch: AreaDef | undefined = undefined;
							let highestScore = -1;

							if (city) {
								const cityQuery = city.toLowerCase();
								for (const a of areas) {
									const areaName = a.name.toLowerCase();
									const score = fuzzyScore(areaName, cityQuery).score;

									if (score > highestScore) {
										highestScore = score;
										bestMatch = a;
									}
								}
							}

							if ((!bestMatch || highestScore < 100) && region) {
								const regionQuery = region.toLowerCase();
								for (const a of areas) {
									const score = fuzzyScore(a.name.toLowerCase(), regionQuery).score;
									if (score > highestScore) {
										highestScore = score;
										bestMatch = a;
									}
								}
							}

							if (bestMatch && highestScore >= 0) {
								await handleAreaSelect(bestMatch.name);
							}

							const locationKey = "location_saved";
							if (localStorage.getItem(locationKey) !== "true") {
								await fetch("/api/track", {
									method: "POST",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({
										country: country,
										region: region,
										city: city,
									}),
								}).catch(() => {});
								localStorage.setItem(locationKey, "true");
							}

							if (bestMatch) {
								resolve(bestMatch.name);
							} else {
								resolve("Location found but no matching area");
							}
						} catch {
							reject(new Error("Failed to process location"));
						}
					},
					(error) => {
						if (error.code === error.PERMISSION_DENIED) {
							reject(new Error("Location permission denied"));
						} else {
							reject(
								new Error(
									`Failed to get location. Some private-focused browsers block this request by default. To enable, check your browser private settings.`,
								),
							);
						}
					},
					{ timeout: 15000 },
				);
			}),
			{
				loading: "Getting your location...",
				success: (areaName) => `Location set to ${areaName}`,
				error: (err) => err.message,
				finally: () => setIsLocating(false),
				duration: 10000,
			},
		);
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
						<CommandGroup>
							<CommandItem
								onSelect={handleUseLocation}
								disabled={isLocating}
								className="font-medium text-primary cursor-pointer"
							>
								<LocateFixed className="mr-2 h-4 w-4" />
								Use My Location
							</CommandItem>
						</CommandGroup>
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
