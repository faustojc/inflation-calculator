import { $openMenu, showOnboarding } from "@/stores/onboardingStore";
import { X, HelpCircle, MessageSquare, Sun, Moon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useStore } from "@nanostores/react";
import { $theme, toggleTheme as doToggleTheme } from "@/stores/themeStore";

const MenuDropdown = () => {
	const openMenu = useStore($openMenu);
	const theme = useStore($theme);

	const toggleTheme = () => {
		doToggleTheme();
	};

	const setOpenMenu = (value: boolean) => {
		$openMenu.set(value);
	};

	return (
		<DropdownMenu open={openMenu} onOpenChange={setOpenMenu} modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					id="menu"
					size="icon"
					variant="ghost"
					className="text-white/90 hover:bg-white/10 hover:text-white h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
					aria-label="Menu"
				>
					{openMenu ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
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
	);
};

export default MenuDropdown;
