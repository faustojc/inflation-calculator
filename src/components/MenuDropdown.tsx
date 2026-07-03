import { CircleQuestionMark, Menu, MessageSquare, Moon, Sun, X } from "lucide-solid";
import { onCleanup, onMount, Show } from "solid-js";
import { $openFaq } from "@/stores/faqStore";
import { $openMenu, showOnboarding } from "@/stores/onboardingStore";
import { theme, toggleTheme } from "@/stores/themeStore";

const MenuDropdown = () => {
	let menuRef!: HTMLDivElement;
	const openMenu = () => $openMenu.get();

	onMount(() => {
		const handlePointerDown = (event: PointerEvent) => {
			if (!$openMenu.peek()) return;
			if (!menuRef.contains(event.target as Node)) $openMenu.set(false);
		};

		document.addEventListener("pointerdown", handlePointerDown);
		onCleanup(() => document.removeEventListener("pointerdown", handlePointerDown));
	});

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
		<div class="relative" ref={menuRef}>
			<button
				type="button"
				aria-label="Menu"
				aria-expanded={openMenu()}
				aria-haspopup="menu"
				class="btn btn-ghost btn-accent rounded-full text-accent-foreground"
				onClick={() => $openMenu.set(!$openMenu.peek())}
			>
				<Show when={openMenu()} fallback={<Menu class="h-5 w-5 sm:h-6 sm:w-6" />}>
					<X class="h-5 w-5 sm:h-6 sm:w-6" />
				</Show>
			</button>
			<Show when={openMenu()}>
				<div
					class="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
					role="menu"
				>
					<button
						type="button"
						id="onboarding"
						onClick={handleOnboarding}
						class="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden hover:bg-primary/10 hover:text-foreground focus:bg-primary/10 focus:text-foreground"
						role="menuitem"
					>
						<CircleQuestionMark class="mr-2 h-4 w-4 text-muted-foreground" />
						<span>Guide</span>
					</button>
					<button
						type="button"
						id="faq"
						onClick={handleFaq}
						class="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden hover:bg-primary/10 hover:text-foreground focus:bg-primary/10 focus:text-foreground"
						role="menuitem"
					>
						<MessageSquare class="mr-2 h-4 w-4 text-muted-foreground" />
						<span>FAQ</span>
					</button>
					<button
						type="button"
						id="theme-toggle"
						onClick={handleTheme}
						class="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden hover:bg-primary/10 hover:text-foreground focus:bg-primary/10 focus:text-foreground"
						role="menuitem"
					>
						<Show when={theme() === "dark"} fallback={<Moon class="mr-2 h-4 w-4 text-muted-foreground" />}>
							<Sun class="mr-2 h-4 w-4 text-muted-foreground" />
						</Show>
						<span>{theme() === "dark" ? "Light Mode" : "Dark Mode"}</span>
					</button>
				</div>
			</Show>
		</div>
	);
};

export default MenuDropdown;
