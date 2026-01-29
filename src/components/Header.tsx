import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Settings } from "lucide-react";

export const Header = () => {
	const { toggleSidebar, isMobile } = useSidebar();

	return (
		<header className="w-full border-b bg-primary shadow-sm sticky top-0 z-50">
			<div className="container max-w-5xl mx-auto px-4 py-4 md:py-5">
				<div className="flex items-center gap-4">
					{/* <div className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border border-slate-100 shadow-sm shrink-0 overflow-hidden">
						<div className="text-[8px] text-blue-900 font-bold text-center leading-none">
							PSA
							<br />
							LOGO
						</div>
					</div> */}

					<div className="flex flex-col justify-center">
						{/* <h2 className="uppercase text-[10px] md:text-xs tracking-wide text-white font-semibold mb-0.5">Republic of the Philippines</h2>
						<h1 className="text-lg md:text-2xl font-bold text-white tracking-wider leading-none">Philippine Statistics Authority</h1> */}

						<img src="/psa_header.png" alt="PSA Header" className="md:max-w-sm lg:max-w-md object-cover" />
					</div>

					<div className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border border-slate-100 shadow-sm shrink-0 overflow-hidden">
						{/* <img src="/psa-logo.png" alt="Bagong Pilipinas Logo" className="w-full h-full object-cover" /> */}
						<div className="text-[8px] text-blue-900 font-bold text-center leading-none">
							BAGONG
							<br />
							PH
						</div>
					</div>

					<div className="flex-1 flex justify-end">
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

				<p className="text-base lg:text-xl text-white text-center font-medium mt-1">Personal Inflation Calculator</p>
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
