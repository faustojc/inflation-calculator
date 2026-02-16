import { ModeToggle } from "@/components/ModeToggle";
import { showOnboarding } from "@/components/Onboarding";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export const Header = () => {
	return (
		<header className="w-full bg-psa-gradient sticky top-0 z-40 shadow-lg shadow-primary/10">
			<div className="max-w-5xl mx-auto px-1 sm:px-4 py-3">
				<div className="flex items-center justify-between gap-1 sm:gap-2 overflow-hidden">
					<img
						src="/psa_header.png"
						alt="PSA Logo"
						className="h-9 sm:h-12 md:h-14 w-auto object-contain  sm:max-w-none"
					/>
					<div className="flex items-center gap-1 sm:gap-2 shrink-0">
						<img
							src="/bagong_pilipinas_logo.svg"
							alt="Bagong Pilipinas"
							className="h-10 sm:h-12 md:h-14 w-auto object-contain max-w-[85px] sm:max-w-[140px] md:max-w-none"
						/>
						<Button
							size="icon"
							variant="ghost"
							className="text-white/90 hover:bg-white/10 hover:text-white sm:w-auto sm:px-4 sm:gap-1.5 h-9 w-9 sm:h-10"
							onClick={() => showOnboarding()}
						>
							<HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
							<span className="hidden sm:inline">Help</span>
						</Button>

						<ModeToggle />
					</div>
				</div>
			</div>
			{/* PSA Gold accent line */}
			<div className="h-1 bg-psa-gold" />
		</header>
	);
};
