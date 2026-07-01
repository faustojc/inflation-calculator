import { use$ } from "@legendapp/state/react";
import { WifiOff } from "lucide-react";
import MenuDropdown from "@/components/MenuDropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { isOnline } from "@/stores/connectionStore";

export const Header = () => {
	const isMobile = useIsMobile();
	const scrollDirection = useScrollDirection({ enabled: isMobile });
	const isHidden = scrollDirection === "down";
	const online = use$(isOnline);

	return (
		<header
			className={`w-full bg-psa-gradient sticky top-0 z-40 shadow-lg shadow-primary/10 transition-transform duration-300 ease-in-out motion-reduce:transition-none ${isHidden ? "-translate-y-full" : "translate-y-0"}`}
		>
			<div className="max-w-5xl mx-auto px-2 sm:px-4 py-3">
				<div className="flex items-center justify-between gap-1 sm:gap-2">
					<img
						src="/inflation-calculator/psa_header.png"
						alt="PSA Logo"
						fetchPriority="high"
						width={362.587}
						height={63}
						className="h-9 sm:h-12 md:h-14 object-contain w-45 sm:max-w-none md:w-auto"
					/>
					<div className="flex items-center gap-1 sm:gap-2 shrink-0">
						<img
							width={67.55}
							height={63}
							src="/inflation-calculator/bagong_pilipinas_logo.svg"
							alt="Bagong Pilipinas"
							fetchPriority="high"
							className="h-10 sm:h-12 md:h-14 w-auto object-contain max-w-21.25 sm:max-w-35 md:max-w-none"
						/>

						<MenuDropdown />
					</div>
				</div>
			</div>

			{/* Internet status banner */}
			{online ? (
				<div className="h-1 bg-psa-gold" />
			) : (
				<div className="flex items-center justify-center gap-1.5 bg-amber-600 text-white text-xs font-medium py-0.5">
					<WifiOff className="size-3" />
					<span>No internet connection</span>
				</div>
			)}
		</header>
	);
};
