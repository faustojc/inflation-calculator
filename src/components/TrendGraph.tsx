import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CompareMode, DateRange, LocationContext, TrendPoint } from "@/utils/inflationCompute";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
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
	const [compareMode, setCompareMode] = useState<CompareMode>("area");

	const getCompareLabel = () => {
		switch (compareMode) {
			case "area":
				return meta.location.provinceName || "Local Area";
			case "region":
				return `Region ${meta.location.regionCode}`;
			case "ncr":
				return "Metro Manila (NCR)";
			case "national":
				return "Philippines";
		}
	};

	return (
		<div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
					<TrendingUp className="h-5 w-5" />
					<h3 className="font-bold text-sm uppercase tracking-wide">CPI Trend</h3>
				</div>

				<div className="flex items-center gap-2 w-full sm:w-auto">
					<Label className="text-xs text-muted-foreground whitespace-nowrap">Compare vs:</Label>
					<Select value={compareMode} onValueChange={(v: CompareMode) => setCompareMode(v)}>
						<SelectTrigger className="h-8 text-xs w-full sm:w-45">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="area">{meta.location.provinceName || "Selected Area"}</SelectItem>
							<SelectItem value="region">Region {meta.location.regionCode}</SelectItem>
							<SelectItem value="ncr">Metro Manila (NCR)</SelectItem>
							<SelectItem value="national">Philippines (National)</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="h-62.5 w-full mt-4">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
						<XAxis dataKey="date" tick={{ fontSize: 10 }} tickMargin={10} axisLine={false} tickLine={false} minTickGap={30} />
						<YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
						<Tooltip
							contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
							itemStyle={{ fontSize: "12px", fontWeight: 600 }}
						/>
						<Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />

						<Line type="monotone" dataKey="personal" name="My Inflation" stroke="#2563eb" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
						<Line type="monotone" dataKey={compareMode} name={getCompareLabel()} stroke="#f59b00" strokeWidth={3} dot={false} />
					</LineChart>
				</ResponsiveContainer>
			</div>

			<div className="text-[10px] text-center text-muted-foreground italic">
				Chart shows movement from {startDateStr} to {endDateStr}.
			</div>
		</div>
	);
}
