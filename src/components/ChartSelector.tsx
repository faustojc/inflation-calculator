const ChartSelector = (props: { chartType: string; setChartType: (type: "table" | "pie") => void }) => {
	return (
		<div
			id="input-type-control"
			class="flex items-center gap-2 p-[6.5px] border-2 border-primary bg-muted rounded-lg w-full md:w-auto transition-all"
		>
			<button
				type="button"
				onClick={() => props.setChartType("table")}
				class={`flex-1 ml-1 px-4 py-1 rounded-md text-sm transition-all duration-200 ${
					props.chartType === "table"
						? "bg-primary shadow text-white font-semibold"
						: "text-muted-foreground hover:text-foreground"
				}`}
			>
				Table
			</button>
			<button
				type="button"
				onClick={() => props.setChartType("pie")}
				class={`flex-1 px-4 py-1 rounded-md text-sm transition-all duration-200 ${
					props.chartType === "pie"
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
