import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Settings } from "lucide-react";

export const Header = () => {
	const { toggleSidebar, isMobile } = useSidebar();

	return (
		<header className="w-full border-b bg-primary shadow-sm sticky top-0 z-50">
			<div className="container max-w-5xl mx-auto px-1 md:px-2 py-2 md:py-3">
				<div className="flex items-center gap-4">
					<div className="flex flex-col justify-center">
						<img
							src="/psa_header.png"
							alt="PSA Header"
							width={800}
							height={139}
							fetchPriority="high"
							loading="eager"
							decoding="async"
							className="w-full lg:max-w-md object-cover"
						/>
					</div>

					<div className="flex-1 flex items-center gap-3 justify-end">
						<img
							src="/bagong_pilipinas_logo.svg"
							alt="Bagong Pilipinas Logo"
							width={80}
							height={80}
							fetchPriority="high"
							loading="eager"
							decoding="async"
							className="max-w-10 md:max-w-16 lg:max-w-20 object-cover"
						/>

						<Button
							size={isMobile ? "icon-lg" : "lg"}
							variant="outline"
							className="flex flex-row items-center cursor-pointer"
							onClick={toggleSidebar}
						>
							<Settings className="h-4 w-4" />
							{isMobile ? "" : "Controls"}
						</Button>
					</div>
				</div>
			</div>

			<div className="h-1 w-full bg-white" />

			<div className="h-1 w-full flex">
				<div className="h-full w-1/3 bg-blue-600"></div>
				<div className="h-full w-1/3 bg-red-600"></div>
				<div className="h-full w-1/3 bg-yellow-400"></div>
			</div>
		</header>
	);
};
