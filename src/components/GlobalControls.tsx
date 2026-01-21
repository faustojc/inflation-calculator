import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { dataStore } from "@/stores/dataStore";
import { mode, settings } from "@/stores/inflationStore";
import { MONTHS } from "@/utils/metadata";
import { useStore } from "@nanostores/react";
import { Calendar as CalendarIcon, Check, ChevronsUpDown, MapPin, Users } from "lucide-react";
import { useState } from "react";

export function GlobalControls() {
	const appSettings = useStore(settings);
	const m = useStore(mode);
	const { areas, availableYears } = useStore(dataStore);

	const [openProvince, setOpenProvince] = useState(false);
	const [openYear, setOpenYear] = useState(false);

	const [selectArea, setSelectArea] = useState<string>(() => {
		if (appSettings.areaKey && areas.length > 0) {
			const match = areas.find((p) => p.key === appSettings.areaKey);
			if (match) {
				return match.name;
			}
		}

		return "National Capital Region (NCR)";
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const updateSetting = (key: keyof typeof appSettings, value: any) => {
		settings.setKey(key, value);
	};

	const handleAreaSelect = (areaName: string) => {
		const match = areas.find((a) => a.name === areaName);
		if (match) {
			setSelectArea(match.name);
			settings.setKey("areaKey", match.key);
		}
		setOpenProvince(false);
	};

	const handleMonthChange = (monthIndex: string) => {
		const newDate = new Date(appSettings.startDate);
		newDate.setMonth(Number.parseInt(monthIndex));
		updateSetting("startDate", newDate);
	};

	const handleYearChange = (yearStr: string) => {
		const newDate = new Date(appSettings.startDate);
		newDate.setFullYear(Number.parseInt(yearStr));
		updateSetting("startDate", newDate);
		setOpenYear(false);
	};

	return (
		<div className="grid gap-6 p-5 border rounded-xl bg-card text-card-foreground shadow-sm mb-6">
			<div className="grid md:grid-cols-2 gap-5">
				<div className="space-y-2">
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
								<CommandInput placeholder="Search province..." />
								<CommandList>
									<CommandEmpty>No location found.</CommandEmpty>
									<CommandGroup className="max-h-62.5 overflow-y-auto">
										{areas.map((a) => (
											<CommandItem key={a.key} value={a.name} onSelect={(key) => handleAreaSelect(key)}>
												<Check className={cn("mr-2 h-4 w-4", selectArea === a.name ? "opacity-100" : "opacity-0")} />
												{a.name}
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>

				<div className="space-y-2">
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
				</div>
			</div>

			<div className="space-y-2">
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
											{availableYears.map((year, i) => (
												<CommandItem key={year} value={year} disabled={i === availableYears.length - 1} onSelect={handleYearChange}>
													<Check
														className={cn(
															"mr-2 h-4 w-4",
															appSettings.startDate.getFullYear().toString() === year ? "opacity-100" : "opacity-0",
														)}
													/>
													{year}
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</div>
				</div>
			</div>

			<Separator />

			<div className="flex flex-col md:flex-row gap-6 items-center justify-between">
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
			</div>
		</div>
	);
}
