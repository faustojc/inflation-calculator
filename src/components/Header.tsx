import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { showOnboarding } from "@/stores/onboardingStore";
import { HelpCircle } from "lucide-react";

export const Header = () => {
	const isMobile = useIsMobile();
	const scrollDirection = useScrollDirection({ enabled: isMobile });
	const isHidden = scrollDirection === "down";

	return (
		<header
			className="w-full bg-psa-gradient sticky top-0 z-40 shadow-lg shadow-primary/10 overflow-hidden transition-transform duration-300 ease-in-out motion-reduce:transition-none"
			style={{
				transform: isHidden ? "translateY(-100%)" : "translateY(0)",
			}}
		>
			<div className="max-w-5xl mx-auto px-2 sm:px-4 py-3">
				<div className="flex items-center justify-between gap-1 sm:gap-2 overflow-hidden">
					<img
						src="/psa_header.png"
						alt="PSA Logo"
						fetchPriority="high"
						className="h-9 sm:h-12 md:h-14 object-contain w-45 sm:max-w-none md:w-auto"
					/>
					<div className="flex items-center gap-1 sm:gap-2 shrink-0">
						<img
							src="/bagong_pilipinas_logo.svg"
							alt="Bagong Pilipinas"
							fetchPriority="high"
							className="h-10 sm:h-12 md:h-14 w-auto object-contain max-w-[85px] sm:max-w-[140px] md:max-w-none"
						/>
						<Button
							id="onboarding"
							size="icon"
							variant="ghost"
							className="text-white/90 hover:bg-white/10 hover:text-white sm:w-auto sm:px-4 sm:gap-1.5 h-9 w-9 sm:h-10"
							onClick={showOnboarding}
						>
							<HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
							<span className="hidden sm:inline">Guide</span>
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
