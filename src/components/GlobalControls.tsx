import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { dataStore } from "@/stores/dataStore";
import { setMode, settings, setTotalBudget, uiState } from "@/stores/inflationStore";
import { MONTHS } from "@/utils/metadata";
import { useStore } from "@nanostores/react";
import { Calendar as CalendarIcon, Check, ChevronsUpDown, MapPin, Users, Wallet } from "lucide-react";
import { useState } from "react";

export function GlobalControls() {
	const appSettings = useStore(settings);
	const ui = useStore(uiState);
	const { provinces, availableYears } = useStore(dataStore);

	const [openProvince, setOpenProvince] = useState(false);
	const [openYear, setOpenYear] = useState(false);

	const [selectedProvince, setSelectedProvince] = useState<string>(() => {
		if (appSettings.province) return appSettings.province;

		if (appSettings.region && provinces.length > 0) {
			const match = provinces.find((p) => p.region_code === appSettings.region);
			if (match) {
				return match.name;
			}
		}

		return "Manila, Metro (NCR)";
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const updateSetting = (key: keyof typeof appSettings, value: any) => {
		settings.setKey(key, value);
	};

	const handleProvinceSelect = (provName: string) => {
		const match = provinces.find((p) => p.name === provName);
		if (match) {
			setSelectedProvince(provName);

			settings.setKey("region", match.region_code);
			settings.setKey("province", provName);

			// fetchCpiData(match.region_code, provName);
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

	const previousDate = new Date(appSettings.startDate);
	previousDate.setFullYear(appSettings.startDate.getFullYear() - 1);

	const previousDateStr = previousDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });

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
								{selectedProvince || "Select Location..."}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-75 p-0" align="start">
							<Command>
								<CommandInput placeholder="Search province..." />
								<CommandList>
									<CommandEmpty>No location found.</CommandEmpty>
									<CommandGroup className="max-h-62.5 overflow-y-auto">
										{provinces.map((p, i) => (
											<CommandItem key={p.name + i} value={p.name} onSelect={handleProvinceSelect}>
												<Check className={cn("mr-2 h-4 w-4", selectedProvince === p.name ? "opacity-100" : "opacity-0")} />
												{p.name}
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>

					<p className="text-[10px] text-muted-foreground">
						Mapped to Region: <strong>{appSettings.region}</strong>
					</p>
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
							<SelectItem value="bottom30">Bottom 30% Income</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="space-y-2">
				<div className="flex justify-between items-center">
					<Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<CalendarIcon className="h-3.5 w-3.5" /> Select Period
					</Label>
					<Badge>Compare to {previousDateStr}</Badge>
				</div>

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
											{availableYears.map((year) => (
												<CommandItem key={year} value={year} onSelect={handleYearChange}>
													<Check
														className={cn(
															"mr-2 h-4 w-4",
															appSettings.startDate.getFullYear().toString() === year ? "opacity-100" : "opacity-0"
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
						onClick={() => setMode("amount")}
						className={`flex-1 px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
							ui.mode === "amount"
								? "bg-white dark:bg-slate-700 shadow text-primary"
								: "text-muted-foreground hover:text-slate-900 dark:hover:text-slate-200"
						}`}
					>
						Amount
					</button>
					<button
						onClick={() => setMode("percent")}
						className={`flex-1 px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
							ui.mode === "percent"
								? "bg-white dark:bg-slate-700 shadow text-primary"
								: "text-muted-foreground hover:text-slate-900 dark:hover:text-slate-200"
						}`}
					>
						Percent
					</button>
				</div>

				{ui.mode === "percent" && (
					<div className="flex items-center gap-3 w-full md:w-auto animate-in fade-in slide-in-from-right-4 duration-300">
						<div className="text-right hidden md:block">
							<Label className="text-xs">Total Monthly Expenses</Label>
							<p className="text-[10px] text-muted-foreground">Required for % calc</p>
						</div>
						<div className="relative w-full md:w-55">
							<Wallet className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="number"
								className="pl-9 font-mono"
								placeholder="e.g. 25000"
								value={ui.totalBudget || ""}
								onChange={(e) => setTotalBudget(Number.parseFloat(e.target.value))}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
