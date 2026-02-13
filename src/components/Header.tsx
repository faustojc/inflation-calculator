import { showOnboarding } from "@/components/Onboarding";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export const Header = () => {
	return (
		<header className="w-full bg-psa-gradient sticky top-0 z-40 shadow-lg shadow-primary/10">
			<div className="max-w-5xl mx-auto px-4 py-3">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<img src="/psa_header.png" alt="PSA Logo" className="h-12 md:h-14 object-contain" />
						{/* <div className="border-l border-white/30 pl-3">
							<h1 className="text-white font-bold text-sm md:text-base leading-tight tracking-wide">
								Philippine Statistics Authority
							</h1>
							<p className="text-white/70 text-[0.65rem] md:text-xs font-medium tracking-wider uppercase">
								Personal Inflation Calculator
							</p>
						</div> */}
					</div>

					<div className="flex items-center gap-2">
						<img
							src="/bagong_pilipinas_logo.svg"
							alt="Bagong Pilipinas"
							className="h-12 md:h-14 w-auto object-contain"
						/>
						<Button
							size="lg"
							variant="ghost"
							className="text-white/90 hover:bg-white/10 hover:text-white gap-1.5 cursor-pointer"
							onClick={() => showOnboarding()}
						>
							<HelpCircle className="h-6 w-6" />
							<span className="hidden sm:inline">Help</span>
						</Button>
					</div>
				</div>
			</div>
			{/* PSA Gold accent line */}
			<div className="h-1 bg-psa-gold" />
		</header>
	);
};
