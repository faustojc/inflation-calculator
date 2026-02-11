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
		<div id="settings-panel" className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-5 space-y-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div id="location-control" className="space-y-1.5">
					<Label className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<MapPin className="h-3.5 w-3.5 text-primary" />
						Location
						<ControlInfo content="Select the location where you usually reside and consume goods and services." />
					</Label>
					<LocationControl />
				</div>

				<div id="income-class-control" className="space-y-1.5">
					<Label className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<Users className="h-3.5 w-3.5 text-primary" />
						Income Bracket
						<ControlInfo content="Select which consumer group you want your personal inflation to be computed and compared." />
					</Label>
					<IncomeClassControl />
				</div>

				<div id="date-control" className="space-y-1.5">
					<Label className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<CalendarIcon className="h-3.5 w-3.5 text-primary" />
						Select Period
						<ControlInfo content="Select the month and year you want the inflation to be computed (by default, the latest month and year with available data)." />
					</Label>
					<DateControl />
				</div>

				<div className="space-y-1.5" id="input-type-section">
					<Label className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<Settings2 className="h-3.5 w-3.5 text-primary" />
						Input Type
						<ControlInfo content="Choose whether to input monthly expenditure (PhP) or percentage share of each commodity group." />
					</Label>
					<InputTypeControl />
				</div>
			</div>

			<div className="pt-1">
				<Label className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1.5">
					<FormIcon className="h-3.5 w-3.5 text-primary" />
					Commodity Group
					<ControlInfo content="General shows 13 broad categories. Detailed lets you drill into specific items for more accurate results." />
				</Label>
				<TabControl />
			</div>
		</div>
	);
}
