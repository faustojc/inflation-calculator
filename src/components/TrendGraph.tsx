import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import type { DateRange, LocationContext, TrendPoint } from "@/utils/inflationCompute";
import { TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type CompareMode = "all" | "area" | "province" | "region" | "national";

interface TrendGraphProps {
	trend: TrendPoint[];
	startDateStr: string;
	endDateStr: string;
	meta: {
		location: LocationContext;
		dates: DateRange;
	};
}

export function TrendGraph({ trend, startDateStr, endDateStr, meta }: Readonly<TrendGraphProps>) {
	const [compareMode, setCompareMode] = useState<CompareMode>("all");
	const isMobile = useIsMobile();

	const hierarchy = meta.location.hierarchy;
	const hasProvince = hierarchy.province && hierarchy.province.key !== hierarchy.target.key;
	const hasRegion = hierarchy.region && hierarchy.region.key !== hierarchy.target.key;

	const yAxisConfig = useMemo(() => {
		const allValues = trend
			.flatMap((d) => [d.personal, d.area, d.region, d.province, d.national])
			.filter((v): v is number => typeof v === "number");

		if (allValues.length === 0) return { domain: [0, 5], ticks: [0, 1, 2, 3, 4, 5] };

		const dataMax = Math.max(...allValues);
		const dataMin = Math.min(...allValues);
		const viewMax = Math.max(dataMax, 0);
		const viewMin = Math.min(dataMin, 0);

		const range = viewMax - viewMin;

		let step: number;
		if (range <= 4) step = 0.5;
		else if (range <= 7) step = 1;
		else if (range <= 14) step = 1.5;
		else if (range <= 30) step = 3.5;
		else step = 5;

		const ticks = new Set<number>([0]);

		// positive ticks
		let current = 0;
		while (current < viewMax) {
			current += step;
			ticks.add(Number.parseFloat(current.toFixed(1)));
		}

		// negative ticks
		current = 0;
		while (current > viewMin) {
			current -= step;
			ticks.add(Number.parseFloat(current.toFixed(1)));
		}

		const sortedTicks = Array.from(ticks).sort((a, b) => a - b);

		return {
			domain: [sortedTicks[0]!, sortedTicks.at(-1)!],
			ticks: sortedTicks,
		};
	}, [trend]);

	const lineDasharray = isMobile ? "4 4" : "8 8";

	const sortItems = (item: string) => {
		const order = ["personal", "area"];
		if (hasProvince) order.push("province");
		if (hasRegion) order.push("region");
		if (hierarchy.national) order.push("national");
		return order.indexOf(item);
	};

	const showLine = (key: string) => {
		if (key === "personal") return true;
		if (compareMode === "all") return true;
		if (compareMode === "area" && key === "area") return true;
		if (compareMode === "province" && key === "province") return true;
		if (compareMode === "region" && key === "region") return true;
		if (compareMode === "national" && key === "national") return true;
		return false;
	};

	return (
		<div className="bg-card/70 p-5 m-0 md:rounded-2xl border-y-2 md:border-2 border-primary/10 shadow-lg shadow-primary/5 space-y-4">
			<div className="flex flex-col sm:flex-row items-center justify-between">
				<div className="flex items-center gap-2 text-primary">
					<TrendingUp className="h-5 w-5" />
					<h3 className="font-bold text-sm uppercase tracking-wide">Inflation Trend</h3>
				</div>

				<div className="flex items-center gap-2">
					<p className="text-foreground">Compare to:</p>
					<Select value={compareMode} onValueChange={(v) => setCompareMode(v as CompareMode)}>
						<SelectTrigger className="w-40 h-8 text-foreground border-foreground">
							<SelectValue placeholder="Select..." />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							<SelectItem value="area">{hierarchy.target.name}</SelectItem>
							{hasProvince && <SelectItem value="province">{hierarchy.province!.name}</SelectItem>}
							{hasRegion && <SelectItem value="region">{hierarchy.region!.name}</SelectItem>}
							<SelectItem value="national">Philippines</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="h-90 w-full mt-4">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={trend} width="100%" height="100%" margin={{ top: 5, right: 12, left: -22, bottom: 0 }}>
						<CartesianGrid vertical={false} stroke="hsl(var(--muted-foreground) / 0.35)" />
						<XAxis
							dataKey="date"
							tick={{ fontSize: 16, fill: "hsl(var(--foreground))" }}
							padding={{ left: 15, right: 15 }}
							tickMargin={15}
							axisLine={false}
							tickLine={false}
							minTickGap={20}
							angle={-40}
						/>
						<YAxis
							domain={yAxisConfig.domain}
							ticks={yAxisConfig.ticks}
							includeHidden={true}
							interval={0}
							tick={{ fontSize: 14, fill: "hsl(var(--foreground))" }}
							axisLine={false}
							tickLine={false}
							type="number"
							tickFormatter={(value) => value.toFixed(1)}
						/>
						<Tooltip
							contentStyle={{
								borderRadius: "12px",
								border: "1px solid hsl(var(--border))",
								boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
								backgroundColor: "hsl(var(--card))",
								color: "hsl(var(--foreground))",
							}}
							itemStyle={{ fontSize: "18px", fontWeight: 400 }}
							itemSorter={(item) => sortItems(item.dataKey as string)}
						/>
						<Legend
							wrapperStyle={{ fontSize: "18px", bottom: "-19px", left: "0px", paddingTop: "5px" }}
							itemSorter={(item) => sortItems(item.dataKey as string)}
							formatter={(value, _, index) => (
								<span key={index} className="mr-2.5">
									{value}
								</span>
							)}
						/>

						<Line
							type="monotone"
							dataKey="personal"
							name="My Inflation"
							stroke="#2563eb"
							strokeWidth={3}
							dot={false}
							activeDot={{ r: 6 }}
						/>

						{showLine("area") && (
							<Line
								type="monotone"
								dataKey="area"
								name={hierarchy.target.name}
								stroke="#ed7c02"
								strokeDasharray={lineDasharray}
								strokeWidth={2}
								dot={false}
							/>
						)}

						{hasProvince && showLine("province") && (
							<Line
								type="monotone"
								dataKey="province"
								name={hierarchy.province!.name}
								stroke="#fc0377"
								strokeDasharray={lineDasharray}
								strokeWidth={2}
								dot={false}
							/>
						)}

						{hasRegion && showLine("region") && (
							<Line
								type="monotone"
								dataKey="region"
								name={hierarchy.region!.name}
								stroke="#169c49"
								strokeDasharray={lineDasharray}
								strokeWidth={2}
								dot={false}
							/>
						)}

						{showLine("national") && (
							<Line
								type="monotone"
								dataKey="national"
								name="Philippines"
								stroke="#7119a8"
								strokeDasharray={lineDasharray}
								strokeWidth={2}
								dot={false}
							/>
						)}
					</LineChart>
				</ResponsiveContainer>
			</div>

			<div className="text-center text-muted-foreground italic pt-2">
				Chart shows movement from {startDateStr} to {endDateStr}.
			</div>
		</div>
	);
}
