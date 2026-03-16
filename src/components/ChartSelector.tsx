import type { Dispatch, SetStateAction } from "react";

const ChartSelector = ({
	chartType,
	setChartType,
}: {
	chartType: string;
	setChartType: Dispatch<SetStateAction<"table" | "pie">>;
}) => {
	return (
		<div
			id="input-type-control"
			className="flex items-center gap-2 p-[6.5px] border-2 border-primary bg-muted rounded-lg w-full md:w-auto transition-all"
		>
			<button
				onClick={() => setChartType("table")}
				className={`flex-1 ml-1 px-4 py-1 rounded-md text-sm transition-all duration-200 ${
					chartType === "table"
						? "bg-primary shadow text-white font-semibold"
						: "text-muted-foreground hover:text-foreground"
				}`}
			>
				Table
			</button>
			<button
				onClick={() => setChartType("pie")}
				className={`flex-1 px-4 py-1 rounded-md text-sm transition-all duration-200 ${
					chartType === "pie"
						? "bg-primary shadow text-white font-semibold"
						: "text-muted-foreground hover:text-foreground"
				}`}
			>
				Pie
			</button>
		</div>
	);
};

export default ChartSelector;
