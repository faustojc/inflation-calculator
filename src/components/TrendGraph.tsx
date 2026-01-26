import type { DateRange, LocationContext, TrendPoint } from "@/utils/inflationCompute";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
	const sortItems = (item: string) => {
		const order = ["personal", "area"];

		if (meta.location.hierarchy.province && meta.location.hierarchy.province.key !== meta.location.hierarchy.target.key) {
			order.push("province");
		}

		if (meta.location.hierarchy.region) {
			order.push("region");
		}

		if (meta.location.hierarchy.national) {
			order.push("national");
		}

		order.push("aoncr");
		return order.indexOf(item);
	};

	return (
		<div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
			<div className="flex items-center gap-2 text-blue-600">
				<TrendingUp className="h-5 w-5" />
				<h3 className="font-bold text-sm uppercase tracking-wide">Inflation Trend</h3>
			</div>

			<div className="h-96 w-full mt-4">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={trend} width="100%" height="100%" margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
						<XAxis dataKey="date" tick={{ fontSize: 14 }} tickMargin={10} axisLine={false} tickLine={false} minTickGap={30} />
						<YAxis domain={["auto", "auto"]} tick={{ fontSize: 14 }} axisLine={false} tickLine={false} />
						<Tooltip
							contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
							itemStyle={{ fontSize: "14px", fontWeight: 600 }}
							itemSorter={(item) => sortItems(item.dataKey as string)}
						/>
						<Legend wrapperStyle={{ paddingTop: "10px", fontSize: "14px" }} />

						<Line type="monotone" dataKey="personal" name="My Inflation" stroke="#2563eb" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
						<Line
							type="monotone"
							dataKey="area"
							name={meta.location.hierarchy.target.name}
							stroke="#f59b00"
							strokeDasharray="9 9"
							strokeWidth={2}
							dot={false}
						/>
						{meta.location.hierarchy.province && meta.location.hierarchy.province.key !== meta.location.hierarchy.target.key && (
							<Line
								type="monotone"
								dataKey="province"
								name={meta.location.hierarchy.province.name}
								stroke="#8b5cf6"
								strokeDasharray="9 9"
								strokeWidth={2}
								dot={false}
							/>
						)}
						{meta.location.hierarchy.region && meta.location.hierarchy.region.key !== meta.location.hierarchy.target.key && (
							<Line
								type="monotone"
								dataKey="region"
								name={meta.location.hierarchy.region.name}
								stroke="#169c49"
								strokeDasharray="9 9"
								strokeWidth={2}
								dot={false}
							/>
						)}
						<Line
							type="monotone"
							dataKey="aoncr"
							name="Areas Outside National Capital Region"
							stroke="#f43f5e"
							strokeDasharray="9 9"
							strokeWidth={2}
							dot={false}
						/>
						<Line type="monotone" dataKey="national" name="Philippines" stroke="#7119a8" strokeDasharray="9 9" strokeWidth={2} dot={false} />
					</LineChart>
				</ResponsiveContainer>
			</div>

			<div className="text-sm text-center text-muted-foreground italic">
				Chart shows movement from {startDateStr} to {endDateStr}.
			</div>
		</div>
	);
}
