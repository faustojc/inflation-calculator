import { use$ } from "@legendapp/state/react";
import { activeTab, calculationResult } from "@/stores/inflationStore";

const TabControl = () => {
	const currTab = use$(activeTab);

	const handleChangeTab = (tab: "general" | "detailed") => {
		activeTab.set(tab);
		calculationResult.set({ show: false, data: null });
	};

	return (
		<div className="flex items-center gap-2 bg-muted p-1 rounded-xl w-full md:w-auto border border-border">
			<button
				type="button"
				name="General Commodity Tab"
				aria-label="Select general commodity tab"
				onClick={() => handleChangeTab("general")}
				className={`flex-1 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
					currTab === "general"
						? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
						: "text-foreground hover:text-primary hover:bg-card/50"
				}`.replace(/\s+/g, " ")}
			>
				General
			</button>
			<button
				type="button"
				name="Detailed Commodity Tab"
				aria-label="Select detailed commodity tab"
				onClick={() => handleChangeTab("detailed")}
				className={`flex-1 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
					currTab === "detailed"
						? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
						: "text-foreground hover:text-primary hover:bg-card/50"
				}`.replace(/\s+/g, " ")}
			>
				Detailed
			</button>
		</div>
	);
};

export default TabControl;
