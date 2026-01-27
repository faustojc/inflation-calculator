import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { dataStore } from "@/stores/dataStore";
import { mode, settings } from "@/stores/inflationStore";
import { MONTHS } from "@/utils/metadata";
import { useStore } from "@nanostores/react";
import { ArrowRightToLineIcon, Calendar as CalendarIcon, Check, ChevronsUpDown, MapPin, Settings2, Users } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

export function GlobalControls({ isMobile }: Readonly<{ isMobile?: boolean }>) {
	const appSettings = useStore(settings);
	const m = useStore(mode);
	const { areas, availableYears, areaYearsMap } = useStore(dataStore);

	const [openProvince, setOpenProvince] = useState(false);
	const [openYear, setOpenYear] = useState(false);
	const { toggleSidebar } = useSidebar();

	const [selectArea, setSelectArea] = useState<string>(() => {
		if (appSettings.areaKey && areas.length > 0) {
			const match = areas.find((p) => p.key === appSettings.areaKey);
			if (match) {
				return match.name;
			}
		}

		return "National Capital Region (NCR)";
	});

	// grouped the areas by region with its provinces and cities
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
	const areaAvailableYears = new Set(areaYearsMap[appSettings.areaKey] || []);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const updateSetting = (key: keyof typeof appSettings, value: any) => {
		settings.setKey(key, value);
	};

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

	const handleMonthChange = (monthIndex: string) => {
		const newDate = new Date(appSettings.startDate);
		newDate.setMonth(Number.parseInt(monthIndex));
		updateSetting("startDate", newDate);
	};

	const handleYearChange = (yearStr: string) => {
		const yearNum = Number.parseInt(yearStr);
		// Only allow selection if year is available for current area
		if (areaAvailableYears.size === 0 || areaAvailableYears.has(yearNum)) {
			const newDate = new Date(appSettings.startDate);
			newDate.setFullYear(yearNum);
			updateSetting("startDate", newDate);
		}
		setOpenYear(false);
	};

	return (
		<Sidebar variant="floating" side={isMobile ? "right" : "left"}>
			<SidebarContent className="p-3">
				<SidebarGroup className="space-y-3">
					<Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<MapPin className="h-3.5 w-3.5" /> Province / City
					</Label>

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
																<Check
																	className={cn("mr-2 h-4 w-4", selectArea === a.areaName ? "opacity-100" : "opacity-0")}
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
				</SidebarGroup>

				<SidebarGroup className="space-y-3">
					<Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<Users className="h-3.5 w-3.5" /> Income Bracket
					</Label>
					<Select value={appSettings.incomeClass} onValueChange={(val) => updateSetting("incomeClass", val)}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Income Households</SelectItem>
							<SelectItem value="bottom30" disabled>
								Bottom 30% Income
							</SelectItem>
						</SelectContent>
					</Select>
				</SidebarGroup>

				<SidebarGroup className="space-y-3">
					<Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<CalendarIcon className="h-3.5 w-3.5" /> Select Period
					</Label>

					<div className="flex gap-4">
						<div className="space-y-1">
							<span className="text-xs text-muted-foreground">Month</span>
							<Select value={appSettings.startDate.getMonth().toString()} onValueChange={handleMonthChange}>
								<SelectTrigger>
									<SelectValue placeholder="Month" />
								</SelectTrigger>
								<SelectContent>
									{MONTHS.map((m, i) => (
										<SelectItem key={m} value={i.toString()}>
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
				</SidebarGroup>

				<SidebarGroup className="space-y-3">
					<Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<Settings2 className="h-3.5 w-3.5" /> Input Type
					</Label>
					<div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg w-full md:w-auto transition-all">
						<button
							onClick={() => mode.set("amount")}
							className={`flex-1 px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
								m === "amount" ?
									"bg-white dark:bg-slate-700 shadow text-primary"
								:	"text-muted-foreground hover:text-slate-900 dark:hover:text-slate-200"
							}`}
						>
							Amount
						</button>
						<button
							onClick={() => mode.set("percent")}
							className={`flex-1 px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
								m === "percent" ?
									"bg-white dark:bg-slate-700 shadow text-primary"
								:	"text-muted-foreground hover:text-slate-900 dark:hover:text-slate-200"
							}`}
						>
							Percent
						</button>
					</div>
				</SidebarGroup>
			</SidebarContent>
			{isMobile && (
				<SidebarFooter>
					<Button onClick={toggleSidebar} className="flex flex-row items-center cursor-pointer">
						<ArrowRightToLineIcon className="h-4 w-4" />
						Close
					</Button>
				</SidebarFooter>
			)}
		</Sidebar>
	);
}
