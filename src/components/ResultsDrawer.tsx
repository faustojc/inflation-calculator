import { format } from "date-fns";
import { CalendarDays, FileText, Info, LineChart, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";

import AdditionalInfoTab from "@/components/tabs/AdditionalInfoTab";
import AnalysisTab from "@/components/tabs/AnalysisTab";
import ContributorTab from "@/components/tabs/ContributorTab";
import InflationDataTab from "@/components/tabs/InflationDataTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculationResult } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";

export function ResultsDrawer() {
	const { show, data } = useStore(calculationResult);

	if (!data) return null;

	const { personalRate, yearlyCpiEnd, trend, meta, interpretation, contributors } = data;

	const startDateStr = format(new Date(meta.dates.startYear, meta.dates.startMonth - 1), "MMMM yyyy");
	const endDateStr = format(new Date(meta.dates.endYear, meta.dates.endMonth - 1), "MMMM yyyy");

	return (
		<Drawer direction="bottom" open={show} onOpenChange={(open) => calculationResult.set({ show: open, data })}>
			<DrawerContent className="h-[95vh] rounded-t-4xl flex flex-col font-sans glass-panel border-none">
				<div className="flex items-center justify-center w-full flex-col h-full overflow-hidden transform-gpu border-none shadow-none ring-0 p-0 m-0">
					{/* Header */}
					<DrawerHeader className="text-center rounded-t-2xl w-full pb-3 bg-psa-gradient shrink-0 shadow-sm z-10 px-4">
						<DrawerTitle className="text-xl md:text-2xl font-bold tracking-tight text-white mt-2">
							INFLATION REPORT
						</DrawerTitle>
					</DrawerHeader>

					{/* Body */}
					<Tabs defaultValue="inflation-data" className="flex flex-col flex-1 w-full min-h-0 overflow-hidden">
						{/* Tabs Row */}
						<div className="w-full px-2 py-1 shrink-0 z-10 border-b border-primary/10">
							<TabsList className="w-full grid grid-cols-4 h-auto p-1.5 bg-muted/60 rounded-xl gap-1">
								<TabsTrigger value="inflation-data" className="flex-col h-auto py-1.5 px-1 md:text-xs text-[12px] leading-tight font-medium rounded-lg">
									<LineChart className="size-4 md:size-5 mb-1.5 text-primary/80" />
									Data
								</TabsTrigger>
								<TabsTrigger value="contributor" className="flex-col h-auto py-1.5 px-1 md:text-xs text-[12px] leading-tight font-medium rounded-lg">
									<Users className="size-4 md:size-5 mb-1.5 text-primary/80" />
									Contributors
								</TabsTrigger>
								<TabsTrigger value="analysis" className="flex-col h-auto py-1.5 px-1 md:text-xs text-[12px] leading-tight font-medium rounded-lg">
									<FileText className="size-4 md:size-5 mb-1.5 text-primary/80" />
									Analysis
								</TabsTrigger>
								<TabsTrigger value="additional-info" className="flex-col h-auto py-1.5 px-1 md:text-xs text-[12px] leading-tight font-medium rounded-lg">
									<Info className="size-4 md:size-5 mb-1.5 text-primary/80" />
									Info
								</TabsTrigger>
							</TabsList>
						</div>

						{/* Scrollable Content */}
						<div className="flex-1 overflow-y-auto w-full px-4 pt-4 pb-8">
							<TabsContent value="inflation-data" className="mt-0 outline-none h-full data-[state=inactive]:hidden">
								<InflationDataTab personalRate={personalRate} yearlyCpiEnd={yearlyCpiEnd} trend={trend} meta={meta} startDateStr={startDateStr} endDateStr={endDateStr} />
							</TabsContent>

							<TabsContent value="contributor" className="mt-0 outline-none h-full data-[state=inactive]:hidden">
								<ContributorTab contributors={contributors} />
							</TabsContent>

							<TabsContent value="analysis" className="mt-0 outline-none h-full data-[state=inactive]:hidden">
								<AnalysisTab interpretation={interpretation} />
							</TabsContent>

							<TabsContent value="additional-info" className="mt-0 outline-none h-full data-[state=inactive]:hidden">
								<AdditionalInfoTab />
							</TabsContent>
						</div>
					</Tabs>

					{/* Footer */}
					<DrawerFooter className="shrink-0 w-full px-6 py-4 border-t border-primary/10 bg-card/95 z-10 backdrop-blur-md">
						<DrawerClose asChild>
							<Button
								size="lg"
								className="text-white w-full text-base font-bold py-6 rounded-xl bg-psa-gradient hover:opacity-90 shadow-md transition-all active:scale-[0.98]"
							>
								Close Report
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
