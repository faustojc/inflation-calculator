import { activeTab, calculationResult } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";

const TabControl = () => {
	const currTab = useStore(activeTab);

	const handleChangeTab = (tab: "general" | "detailed") => {
		activeTab.set(tab);
		calculationResult.set({ show: false, data: null });
	};

	return (
		<div className="flex items-center gap-2 bg-muted p-1 rounded-xl w-full md:w-auto border border-border">
			<button
				onClick={() => handleChangeTab("general")}
				className={`flex-1 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
					currTab === "general"
						? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
						: "text-foreground hover:text-primary hover:bg-card/50"
				}`}
			>
				General
			</button>
			<button
				onClick={() => handleChangeTab("detailed")}
				className={`flex-1 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
					currTab === "detailed"
						? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
						: "text-foreground hover:text-primary hover:bg-card/50"
				}`}
			>
				Detailed
			</button>
		</div>
	);
};

export default TabControl;
