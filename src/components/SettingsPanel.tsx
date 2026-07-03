import { Calendar as CalendarIcon, FormIcon, MapPin, Settings2, Users } from "lucide-solid";
import ControlInfo from "@/components/ControlInfo";
import DateControl from "@/components/controls/DateControl";
import IncomeClassControl from "@/components/controls/IncomeClassControl";
import InputTypeControl from "@/components/controls/InputTypeControl";
import LocationControl from "@/components/controls/LocationControl";
import TabControl from "@/components/controls/TabControl";
import { Label } from "@/components/primitives/label";

export function SettingsPanel() {
	return (
		<div
			id="settings-panel"
			class="bg-card border border-amber-400 shadow-amber-200 dark:shadow-amber-400 shadow-lg rounded-xl p-4 md:p-5 space-y-4"
		>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div id="location-control" class="space-y-1.5">
					<Label class="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<MapPin class="h-3.5 w-3.5 text-primary" />
						Location
						<ControlInfo content="This must be the area where you usually buy or consume household goods and services." />
					</Label>
					<LocationControl />
				</div>

				<div id="income-class-control" class="space-y-1.5">
					<Label class="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<Users class="h-3.5 w-3.5 text-primary" />
						Income Bracket
						<ControlInfo content="This is the consumer group to which you want your personal inflation to be compared." />
					</Label>
					<IncomeClassControl />
				</div>

				<div id="date-control" class="space-y-1.5">
					<Label class="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<CalendarIcon class="h-3.5 w-3.5 text-primary" />
						Select Period
						<ControlInfo content="Pick the specific month and year you want your inflation rate to be calculated. It automatically shows the most recent date with available official data." />
					</Label>
					<DateControl />
				</div>

				<div id="input-type-section" class="space-y-1.5">
					<Label class="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<Settings2 class="h-3.5 w-3.5 text-primary" />
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

			<div id="tab-control" class="space-y-1.5">
				<Label class="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
					<FormIcon class="h-3.5 w-3.5 text-primary" />
					Commodity Group
					<ControlInfo
						content={
							<>
								If <strong>General</strong> is selected, the inputs will be asked for the 13 major commodity
								groups only. If <strong>Detailed</strong> is selected, the inputs will be asked for specific
								commodity groups. Commodity Grouping is based on the 2020 Philippine Classification of
								Individual Consumption According to Purpose (PCOICOP).
							</>
						}
					/>
				</Label>
				<TabControl />
			</div>
		</div>
	);
}
