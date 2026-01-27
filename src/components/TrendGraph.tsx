import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DateRange, LocationContext, TrendPoint } from "@/utils/inflationCompute";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
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

	const hierarchy = meta.location.hierarchy;
	const hasProvince = hierarchy.province && hierarchy.province.key !== hierarchy.target.key;
	const hasRegion = hierarchy.region && hierarchy.region.key !== hierarchy.target.key;

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
		<div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
			<div className="flex flex-col sm:flex-row items-center justify-between">
				<div className="flex items-center gap-2 text-blue-600">
					<TrendingUp className="h-5 w-5" />
					<h3 className="font-bold text-sm uppercase tracking-wide">Inflation Trend</h3>
				</div>

				<div className="flex items-center gap-2">
					<p className="text-muted-foreground">Compare to:</p>
					<Select value={compareMode} onValueChange={(v) => setCompareMode(v as CompareMode)}>
						<SelectTrigger className="w-40 h-8">
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
						<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
						<XAxis
							dataKey="date"
							tick={{ fontSize: 16 }}
							padding={{ left: 15, right: 15 }}
							tickMargin={15}
							axisLine={true}
							tickLine={false}
							minTickGap={20}
							angle={-40}
						/>
						<YAxis
							domain={["dataMin - 0.2", "dataMax + 0.5"]}
							includeHidden={true}
							interval="preserveStartEnd"
							tick={{ fontSize: 14 }}
							tickCount={8}
							axisLine={false}
							tickLine={false}
							tickFormatter={(value) => Number(value).toFixed(1)}
						/>
						<Tooltip
							contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
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

						<Line type="monotone" dataKey="personal" name="My Inflation" stroke="#2563eb" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />

						{showLine("area") && (
							<Line
								type="monotone"
								dataKey="area"
								name={hierarchy.target.name}
								stroke="#f59b00"
								strokeDasharray="9 9"
								strokeWidth={2}
								dot={false}
							/>
						)}

						{hasProvince && showLine("province") && (
							<Line
								type="monotone"
								dataKey="province"
								name={hierarchy.province!.name}
								stroke="#8b5cf6"
								strokeDasharray="9 9"
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
								strokeDasharray="9 9"
								strokeWidth={2}
								dot={false}
							/>
						)}

						{showLine("national") && (
							<Line type="monotone" dataKey="national" name="Philippines" stroke="#7119a8" strokeDasharray="9 9" strokeWidth={2} dot={false} />
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
