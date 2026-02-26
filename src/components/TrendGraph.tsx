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
		<div className="glass-card p-5 m-0 md:rounded-2xl border-y-2 md:border-2 space-y-4 h-full">
			<div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
				<div className="flex items-center justify-around sm:justify-between gap-2 text-sm sm:text-base">
					<div className="text-primary flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						<h3 className="font-bold uppercase tracking-wide">Inflation Trends</h3>
					</div>
					<p className="flex-1 font-bold">:</p>
					<p className="font-semibold uppercase text-foreground text-center md:whitespace-nowrap">
						{startDateStr} to {endDateStr}
					</p>
				</div>

				<div className="flex items-center justify-evenly lg:justify-start gap-2 w-full lg:w-fit">
					<p className="text-foreground text-sm sm:text-base">Compare to:</p>
					<Select value={compareMode} onValueChange={(v) => setCompareMode(v as CompareMode)}>
						<SelectTrigger className="w-40 h-8 text-foreground border-foreground">
							<SelectValue placeholder="Select..." className="text-ellipsis" />
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
							tick={({ x, y, payload }) => {
								const [month, year] = (payload.value as string).split(" ");
								return (
									<text x={x} y={y} textAnchor="middle" fill="hsl(var(--foreground))" className="text-sm">
										<tspan x={x} dy="0.8em">
											{month}
										</tspan>
										<tspan x={x} dy="1.2em">
											{year}
										</tspan>
									</text>
								);
							}}
							height={50}
							padding={{ left: 15, right: 15 }}
							tickMargin={4}
							axisLine={false}
							tickLine={false}
							minTickGap={10}
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
							labelStyle={{ color: "hsl(var(--foreground))" }}
							itemStyle={{ fontSize: "18px", fontWeight: 400 }}
							itemSorter={(item) => sortItems(item.dataKey as string)}
						/>
						<Legend
							wrapperStyle={{ fontSize: "18px", left: "0px", paddingTop: "5px" }}
							itemSorter={(item) => sortItems(item.dataKey as string)}
							formatter={(value, _, index) => (
								<span key={index} className="mr-2.5 md:mr-7.5">
									{value}
								</span>
							)}
						/>

						<Line
							type="monotone"
							dataKey="personal"
							name="My Inflation"
							stroke="hsl(var(--primary))"
							strokeWidth={3.5}
							dot={false}
							activeDot={{ r: 6 }}
						/>

						{showLine("area") && (
							<Line
								type="monotone"
								dataKey="area"
								name={hierarchy.target.name}
								stroke="#ff9800"
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
								stroke="#a83fe0"
								strokeDasharray={lineDasharray}
								strokeWidth={2}
								dot={false}
							/>
						)}
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
