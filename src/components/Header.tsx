import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Calculator, Settings } from "lucide-react";

export function Header() {
	const { toggleSidebar } = useSidebar();

	return (
		<header className="bg-white dark:bg-slate-900 border-b px-4 py-4 sticky top-0 z-20">
			<div className="mx-auto flex justify-between items-center">
				<div className="flex items-center gap-2">
					<div className="bg-blue-600 p-2 rounded-lg text-white">
						<Calculator className="h-5 w-5" />
					</div>
					<div>
						<h1 className="font-bold text-lg leading-tight">Personal Inflation Calculator</h1>
						<p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Personal CPI</p>
					</div>
				</div>
				<Button onClick={toggleSidebar} variant="outline" className="flex flex-row items-center cursor-pointer">
					<Settings className="h-4 w-4" />
					Controls
				</Button>
			</div>
		</header>
	);
}
