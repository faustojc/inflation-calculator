import { useStore } from "@nanostores/react";
import { Calendar as CalendarIcon, Check, ChevronsUpDown, MapPin, Users, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { setMode, settings, setTotalBudget, uiState } from "@/stores/inflationStore";
import { PROVINCE_TO_REGION, SORTED_PROVINCES } from "@/utils/geoMapping";
import { AVAILABLE_YEARS, MONTHS } from "@/utils/metadata";
import { useState } from "react";

export function GlobalControls() {
	const appSettings = useStore(settings);
	const ui = useStore(uiState);

	const [openProvince, setOpenProvince] = useState(false);
	const [openYear, setOpenYear] = useState(false);
	const [selectedProvince, setSelectedProvince] = useState<string>(() => {
		const match = Object.keys(PROVINCE_TO_REGION).find((key) => PROVINCE_TO_REGION[key] === appSettings.region);
		return match || "Manila, Metro (NCR)";
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const updateSetting = (key: keyof typeof appSettings, value: any) => {
		settings.setKey(key, value);
	};

	const handleProvinceSelect = (currentValue: string) => {
		setSelectedProvince(currentValue);
		const regionCode = PROVINCE_TO_REGION[currentValue];
		if (regionCode) {
			updateSetting("region", regionCode);
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
	};

	const targetDateStr = appSettings.endDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });

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
								{selectedProvince || "Select Province..."}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-75 p-0" align="start">
							<Command>
								<CommandInput placeholder="Search province..." />
								<CommandList>
									<CommandEmpty>No province found.</CommandEmpty>
									<CommandGroup className="max-h-62.5 overflow-y-auto">
										{SORTED_PROVINCES.map((province) => (
											<CommandItem key={province} value={province} onSelect={handleProvinceSelect}>
												<Check className={cn("mr-2 h-4 w-4", selectedProvince === province ? "opacity-100" : "opacity-0")} />
												{province}
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>

					<p className="text-[10px] text-muted-foreground">Mapped to: Region {appSettings.region}</p>
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
						<CalendarIcon className="h-3.5 w-3.5" /> Compare Date Against
					</Label>
					<span className="text-sm font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-600 dark:text-slate-400 flex items-center gap-1">
						To: Current ({targetDateStr})
					</span>
				</div>

				<div className="flex gap-4">
					<div className="space-y-1">
						<span className="text-xs text-muted-foreground">Target Month</span>
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

					{/* Year Select */}
					<div className="space-y-1">
						<span className="text-xs text-muted-foreground">Target Year</span>

						<Popover open={openYear} onOpenChange={setOpenYear}>
							<PopoverTrigger asChild>
								<Button variant="outline" role="combobox" aria-expanded={openYear} className="w-full justify-between font-normal">
									{appSettings.startDate.getFullYear()}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[140px] p-0" align="start">
								<Command>
									<CommandInput placeholder="Year..." />
									<CommandList>
										<CommandEmpty>No year found.</CommandEmpty>
										<CommandGroup className="max-h-[250px] overflow-y-auto">
											{AVAILABLE_YEARS.map((year) => (
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

			<div className="flex flex-col md:flex-row gap-2 items-center justify-between">
				<div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg w-full md:w-auto">
					<button
						onClick={() => setMode("amount")}
						className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
							ui.mode === "amount" ? "bg-white shadow text-primary" : "text-muted-foreground"
						}`}
					>
						Amount
					</button>
					<button
						onClick={() => setMode("percent")}
						className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
							ui.mode === "percent" ? "bg-white shadow text-primary" : "text-muted-foreground"
						}`}
					>
						Percent
					</button>
				</div>

				<div className="flex items-center gap-3 w-full md:w-auto">
					<div className="text-right hidden md:block">
						<Label className="text-xs">Total Monthly Expenses</Label>
						<p className="text-[10px] text-muted-foreground">{ui.mode === "percent" ? "Required for % calc" : "Your total spending"}</p>
					</div>
					<div className="relative w-full md:w-50">
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
			</div>
		</div>
	);
}
