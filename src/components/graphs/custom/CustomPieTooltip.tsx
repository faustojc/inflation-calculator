import type { TooltipContentProps } from "recharts";

const CustomTooltip = ({ active, payload }: TooltipContentProps<number, string>) => {
	if (active && payload && payload.length) {
		const data = payload[0]!.payload;

		if (data?.type === "filler" || data?.name === "_filler") return null;

		const isNeg = data?.type === "negative";
		const shareValue = data?.originalShare ?? data?.value;

		return (
			<div className="bg-background border border-border p-3 rounded-lg shadow-xl max-w-55 z-1000">
				<p className="font-semibold text-sm mb-1 leading-tight text-foreground">{data?.name}</p>
				<p className="text-sm font-medium text-accent-foreground">
					Inflation Share:{" "}
					<strong className={isNeg ? "text-destructive text-base" : "text-primary text-base"}>
						{shareValue?.toFixed(1)}%
					</strong>
				</p>
			</div>
		);
	}
	return null;
};

export default CustomTooltip;
