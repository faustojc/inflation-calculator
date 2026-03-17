import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { compareMode, trendType, type CompareModeType, type TrendType } from "@/stores/graphStore";
import type { DateRange, LocationContext, TrendPoint } from "@/utils/inflationCompute";
import { useStore } from "@nanostores/react";
import { TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
	inflationTrend: TrendPoint[];
	cpiTrend: TrendPoint[];
	startDateStr: string;
	endDateStr: string;
	meta: {
		location: LocationContext;
		dates: DateRange;
	};
}

export default function TrendLine({ inflationTrend, cpiTrend, startDateStr, endDateStr, meta }: Readonly<Props>) {
	const mode = useStore(compareMode);
	const currTrend = useStore(trendType);
	const isMobile = useIsMobile();

	const hierarchy = meta.location.hierarchy;
	const hasProvince = hierarchy.province && hierarchy.province.key !== hierarchy.target.key;
	const hasRegion = hierarchy.region && hierarchy.region.key !== hierarchy.target.key;

	const trend = currTrend === "inflation" ? inflationTrend : cpiTrend;
	const currName = currTrend === "inflation" ? "My Inflation" : "My CPI";

	const yAxisConfig = useMemo(() => {
		const allValues = trend
			.flatMap((d) => [d.personal, d.area, d.region, d.province, d.national])
			.filter((v): v is number => typeof v === "number");

		if (allValues.length === 0) return { domain: [0, 5], ticks: [0, 1, 2, 3, 4, 5] };

		const dataMax = Math.max(...allValues);
		const dataMin = Math.min(...allValues);

		const viewMax = Math.max(dataMax, 0);
		let viewMin = Math.min(dataMin, 0);

		if (currTrend === "cpi") {
			viewMin = Math.floor(dataMin / 5) * 5;
		}

		const range = viewMax - viewMin;

		let step: number;
		if (range <= 4) step = 0.5;
		else if (range <= 7) step = 1;
		else if (range <= 14) step = 1.5;
		else if (range <= 30) step = 3.5;
		else step = 5;

		const ticks = new Set<number>([currTrend === "cpi" ? viewMin : 0]);

		// positive ticks
		let current = currTrend === "cpi" ? viewMin : 0;
		while (current < viewMax) {
			current += step;
			ticks.add(Number.parseFloat(current.toFixed(1)));
		}

		// negative ticks (only relevant if 0 is included, i.e., not CPI)
		current = currTrend === "cpi" ? viewMin : 0;
		while (current > viewMin) {
			current -= step;
			ticks.add(Number.parseFloat(current.toFixed(1)));
		}

		const sortedTicks = Array.from(ticks).sort((a, b) => a - b);

		return {
			domain: [sortedTicks[0]!, sortedTicks.at(-1)!],
			ticks: sortedTicks,
		};
	}, [trend, currTrend]);

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
		if (mode === "all") return true;
		if (mode === "area" && key === "area") return true;
		if (mode === "province" && key === "province") return true;
		if (mode === "region" && key === "region") return true;
		if (mode === "national" && key === "national") return true;
		return false;
	};

	return (
		<div className="relative glass-card py-5 m-0 md:rounded-2xl border-y-2 md:border-2 flex flex-col gap-4 min-h-152.5 h-full">
			<div className="flex flex-col md:flex-row gap-4 items-center shrink-0 px-5">
				<div className="flex items-center justify-evenly lg:justify-start gap-2 w-full lg:w-fit">
					<p className="text-foreground text-sm sm:text-base">Select Trend:</p>
					<Select value={currTrend} onValueChange={(v) => trendType.set(v as TrendType)}>
						<SelectTrigger className="w-40 h-8 text-foreground border-foreground">
							<SelectValue placeholder="Select..." className="text-ellipsis" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="inflation">Inflation</SelectItem>
							<SelectItem value="cpi">CPI</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center justify-evenly lg:justify-start gap-2 w-full lg:w-fit">
					<p className="text-foreground text-sm sm:text-base">Compare to:</p>
					<Select value={mode} onValueChange={(v) => compareMode.set(v as CompareModeType)}>
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

			<div className="flex items-center justify-center gap-2 text-sm sm:text-base shrink-0 px-5">
				<div className="text-primary flex items-center gap-2">
					<TrendingUp className="h-5 w-5" />
					<h3 className="font-bold uppercase tracking-wide">
						{currTrend === "inflation" ? "Inflation" : "CPI"} Trends
					</h3>
				</div>
				<p className="font-semibold uppercase text-foreground text-center md:whitespace-nowrap">
					: {startDateStr} to {endDateStr}
				</p>
			</div>

			<div className="flex-1 w-full h-11/12 lg:min-h-0 px-2">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={trend} width="100%" height="100%" margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
							padding={{ left: 10, right: 10 }}
							tickMargin={4}
							axisLine={false}
							tickLine={false}
							{...(isMobile
								? {
										ticks:
											trend.length > 1
												? [trend[0]!.date, trend[Math.floor(trend.length / 2)]!.date, trend.at(-1)!.date]
												: trend.length === 1
													? [trend[0]!.date]
													: [],
										interval: 0 as const,
									}
								: { minTickGap: 10 })}
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
								boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
								backgroundColor: "hsl(var(--card))",
								color: "hsl(var(--foreground))",
								maxWidth: "350px",
								whiteSpace: "wrap",
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
							name={currName}
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
						TrendLine
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
