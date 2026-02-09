import { activeTab, calculationResult } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";

const TabControl = () => {
	const currTab = useStore(activeTab);

	const handleChangeTab = (tab: "general" | "detailed") => {
		activeTab.set(tab);
		calculationResult.set({ show: false, data: null });
	};

	return (
		<div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 p-1.5 rounded-lg w-full md:w-auto transition-all">
			<button
				onClick={() => handleChangeTab("general")}
				className={`flex-1 px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
					currTab === "general" ?
						"bg-white dark:bg-slate-700 shadow text-primary"
					:	"text-muted-foreground hover:text-slate-900 dark:hover:text-slate-200"
				}`}
			>
				General
			</button>
			<button
				onClick={() => handleChangeTab("detailed")}
				className={`flex-1 px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
					currTab === "detailed" ?
						"bg-white dark:bg-slate-700 shadow text-primary"
					:	"text-muted-foreground hover:text-slate-900 dark:hover:text-slate-200"
				}`}
			>
				Detailed
			</button>
		</div>
	);
};

export default TabControl;
