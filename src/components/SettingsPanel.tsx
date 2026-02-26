import ControlInfo from "@/components/ControlInfo";
import DateControl from "@/components/controls/DateControl";
import IncomeClassControl from "@/components/controls/IncomeClassControl";
import InputTypeControl from "@/components/controls/InputTypeControl";
import LocationControl from "@/components/controls/LocationControl";
import TabControl from "@/components/controls/TabControl";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, FormIcon, MapPin, Settings2, Users } from "lucide-react";

export function SettingsPanel() {
	return (
		<div id="settings-panel" className="bg-card border border-border rounded-xl shadow-sm p-4 md:p-5 space-y-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div id="location-control" className="space-y-1.5">
					<Label className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<MapPin className="h-3.5 w-3.5 text-primary" />
						Location
						<ControlInfo content="This must be the area where you usually buy or consume household goods and services." />
					</Label>
					<LocationControl />
				</div>

				<div id="income-class-control" className="space-y-1.5">
					<Label className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<Users className="h-3.5 w-3.5 text-primary" />
						Income Bracket
						<ControlInfo content="This is the consumer group to which you want your personal inflation to be compared." />
					</Label>
					<IncomeClassControl />
				</div>

				<div id="date-control" className="space-y-1.5">
					<Label className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<CalendarIcon className="h-3.5 w-3.5 text-primary" />
						Select Period
						<ControlInfo content="Pick the specific month and year you want your inflation rate to be calculated. It automatically shows the most recent date with available official data." />
					</Label>
					<DateControl />
				</div>

				<div id="input-type-section" className="space-y-1.5">
					<Label className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<Settings2 className="h-3.5 w-3.5 text-primary" />
						Input Type
						<ControlInfo
							content={
								<>
									Choose <strong>Amount (PhP)</strong> if you want to input your monthly or annual expenditure
									for each commodity group. Choose <strong>Percent (%)</strong> if you want to input only
									percentage of your monthly expenditure allotted for each commodity group.
								</>
							}
						/>
					</Label>
					<InputTypeControl />
				</div>
			</div>

			<div id="tab-control" className="space-y-1.5">
				<Label className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
					<FormIcon className="h-3.5 w-3.5 text-primary" />
					Commodity Group
					<ControlInfo
						content={
							<>
								If <strong>General</strong> is selected, the inputs will be asked for the 13 major commodity
								groups only. If <strong>Detailed</strong> is selected, the inputs will be asked for specific
								commodity groups. Commodity Grouping is based on the 2020 Philippine Classification of Individual
								Consumption According to Purpose (PCOICOP).
							</>
						}
					/>
				</Label>
				<TabControl />
			</div>
		</div>
	);
}
