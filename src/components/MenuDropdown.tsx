import { use$ } from "@legendapp/state/react";
import { HelpCircle, Menu, MessageSquare, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { $openFaq } from "@/stores/faqStore";
import { $openMenu, showOnboarding } from "@/stores/onboardingStore";
import { $theme, toggleTheme } from "@/stores/themeStore";

const MenuDropdown = () => {
	const openMenu = use$($openMenu);
	const theme = use$($theme);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!openMenu) return;

		const handlePointerDown = (event: PointerEvent) => {
			if (!menuRef.current?.contains(event.target as Node)) $openMenu.set(false);
		};

		document.addEventListener("pointerdown", handlePointerDown);
		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, [openMenu]);

	const handleOnboarding = () => {
		showOnboarding();
		$openMenu.set(false);
	};

	const handleFaq = () => {
		$openFaq.set(true);
		$openMenu.set(false);
	};

	const handleTheme = () => {
		toggleTheme();
		$openMenu.set(false);
	};

	return (
		<div className="relative" ref={menuRef}>
			<Button
				id="menu"
				size="icon"
				variant="ghost"
				className="text-white/90 hover:bg-white/10 hover:text-white h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
				aria-label="Menu"
				aria-expanded={openMenu}
				aria-haspopup="menu"
				onClick={() => $openMenu.set(!openMenu)}
			>
				{openMenu ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
			</Button>
			{openMenu && (
				<div
					className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
					role="menu"
				>
					<button
						type="button"
						id="onboarding"
						onClick={handleOnboarding}
						className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
						role="menuitem"
					>
						<HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
						<span>Guide</span>
					</button>
					<button
						type="button"
						id="faq"
						onClick={handleFaq}
						className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
						role="menuitem"
					>
						<MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
						<span>FAQ</span>
					</button>
					<button
						type="button"
						id="theme-toggle"
						onClick={handleTheme}
						className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
						role="menuitem"
					>
						{theme === "dark" ? (
							<Sun className="mr-2 h-4 w-4 text-muted-foreground" />
						) : (
							<Moon className="mr-2 h-4 w-4 text-muted-foreground" />
						)}
						<span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
					</button>
				</div>
			)}
		</div>
	);
};

export default MenuDropdown;
