import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { $openMenu, showOnboarding } from "@/stores/onboardingStore";
import { useStore } from "@nanostores/react";
import { HelpCircle, Menu, MessageSquare, Moon, Sun, X } from "lucide-react";

export const Header = () => {
	const openMenu = useStore($openMenu);
	const isMobile = useIsMobile();
	const scrollDirection = useScrollDirection({ enabled: isMobile });
	const isHidden = scrollDirection === "down";
	const { theme, setTheme } = useTheme();

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	const setOpenMenu = (value: boolean) => {
		$openMenu.set(value);
	};

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
							width={67.5}
							height={63}
							src="/bagong_pilipinas_logo.svg"
							alt="Bagong Pilipinas"
							fetchPriority="high"
							className="h-10 sm:h-12 md:h-14 w-auto object-contain max-w-21.25 sm:max-w-35 md:max-w-none"
						/>

						<DropdownMenu open={openMenu} onOpenChange={setOpenMenu} modal={false}>
							<DropdownMenuTrigger asChild>
								<Button
									id="menu"
									size="icon"
									variant="ghost"
									className="text-white/90 hover:bg-white/10 hover:text-white h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
									aria-label="Menu"
								>
									{openMenu ? (
										<X className="h-5 w-5 sm:h-6 sm:w-6" />
									) : (
										<Menu className="h-5 w-5 sm:h-6 sm:w-6" />
									)}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-48">
								<DropdownMenuItem id="onboarding" onClick={showOnboarding} className="cursor-pointer">
									<HelpCircle className="mr-2 h-4 w-4" />
									<span>Guide</span>
								</DropdownMenuItem>
								<DropdownMenuItem id="faq" className="cursor-pointer" disabled>
									<MessageSquare className="mr-2 h-4 w-4" />
									<span>FAQ (Coming Soon)</span>
								</DropdownMenuItem>
								<DropdownMenuItem id="theme-toggle" onClick={toggleTheme} className="cursor-pointer">
									{theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
									<span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>
			{/* PSA Gold accent line */}
			<div className="h-1 bg-psa-gold" />
		</header>
	);
};
