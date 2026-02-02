import ControlInfo from "@/components/ControlInfo";
import DateControl from "@/components/controls/DateControl";
import IncomeClassControl from "@/components/controls/IncomeClassControl";
import InputTypeControl from "@/components/controls/InputTypeControl";
import LocationControl from "@/components/controls/LocationControl";
import TabControl from "@/components/controls/TabControl";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowRightToLineIcon, Calendar as CalendarIcon, FormIcon, MapPin, Settings2, Users } from "lucide-react";

export function GlobalControls({ isMobile }: Readonly<{ isMobile?: boolean }>) {
	const { toggleSidebar } = useSidebar();

	return (
		<Sidebar variant="sidebar" side={isMobile ? "right" : "left"}>
			<SidebarContent className="p-3 bg-zinc-50">
				<SidebarGroup className="space-y-3">
					<Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<MapPin className="h-3.5 w-3.5" /> Province / City
						{isMobile && <ControlInfo content="Select the province or city where you usually reside and consume household goods and services." />}
					</Label>

					{isMobile ?
						<LocationControl />
					:	<Tooltip>
							<TooltipTrigger>
								<LocationControl />
							</TooltipTrigger>
							<TooltipContent side="right" className="text-base tooltip-content">
								Select the province or city where you usually reside and consume household goods and services.
							</TooltipContent>
						</Tooltip>
					}
				</SidebarGroup>

				<SidebarGroup className="space-y-3">
					<Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<Users className="h-3.5 w-3.5" /> Income Bracket
						{isMobile && <ControlInfo content="Select which consumer group you want your personal inflation to be computed and compared" />}
					</Label>

					{isMobile ?
						<IncomeClassControl />
					:	<Tooltip>
							<TooltipTrigger>
								<IncomeClassControl />
							</TooltipTrigger>
							<TooltipContent side="right" className="text-base tooltip-content">
								Select which consumer group you want your personal inflation to be computed and compared
							</TooltipContent>
						</Tooltip>
					}
				</SidebarGroup>

				<SidebarGroup className="space-y-3">
					<Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<CalendarIcon className="h-3.5 w-3.5" /> Select Period
						{isMobile && (
							<ControlInfo
								content="Select the month and year you want the inflation to be computed (by default, the entry is the latest month and year with
								available official data)"
							/>
						)}
					</Label>

					{isMobile ?
						<DateControl />
					:	<Tooltip>
							<TooltipTrigger>
								<DateControl />
							</TooltipTrigger>
							<TooltipContent side="right" className="text-base tooltip-content">
								Select the month and year you want the inflation to be computed (by default, the entry is the latest month and year with
								available official data)
							</TooltipContent>
						</Tooltip>
					}
				</SidebarGroup>

				<SidebarGroup className="space-y-3">
					<Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<Settings2 className="h-3.5 w-3.5" /> Input Type
						{isMobile && (
							<ControlInfo
								content="Select whether you want to input your monthly expenditure for every commodity group or percentage share of the each commodity
								group to the total expense"
							/>
						)}
					</Label>

					{isMobile ?
						<InputTypeControl />
					:	<Tooltip>
							<TooltipTrigger>
								<InputTypeControl />
							</TooltipTrigger>
							<TooltipContent side="right" className="text-base tooltip-content">
								Select whether you want to input your monthly expenditure for every commodity group or percentage share of the each commodity
								group to the total expense
							</TooltipContent>
						</Tooltip>
					}
				</SidebarGroup>

				<SidebarGroup className="space-y-3">
					<Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
						<FormIcon className="h-3.5 w-3.5" /> Switch Tab
						{isMobile && <ControlInfo content="Switch between the General and Detailed tabs" />}
					</Label>

					{isMobile ?
						<TabControl />
					:	<Tooltip>
							<TooltipTrigger>
								<TabControl />
							</TooltipTrigger>
							<TooltipContent side="right" className="text-base tooltip-content">
								Switch between the General and Detailed tabs
							</TooltipContent>
						</Tooltip>
					}
				</SidebarGroup>
			</SidebarContent>

			{isMobile ?
				<SidebarFooter className="bg-zinc-50">
					<Button onClick={toggleSidebar} className="flex flex-row items-center cursor-pointer">
						<ArrowRightToLineIcon className="h-4 w-4" />
						Close
					</Button>
				</SidebarFooter>
			:	<SidebarFooter className="bg-zinc-50">
					<Footer />
				</SidebarFooter>
			}
		</Sidebar>
	);
}
