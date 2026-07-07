import { type Accessor, createEffect, createMemo, createSignal, onCleanup } from "solid-js";

export type ScrollDirection = "up" | "down";

interface UseScrollDirectionOptions {
	threshold?: number;
	enabled?: boolean | Accessor<boolean>;
}

function readEnabled(enabled: boolean | Accessor<boolean>) {
	return typeof enabled === "function" ? enabled() : enabled;
}

export function useScrollDirection({
	threshold = 10,
	enabled = true,
}: UseScrollDirectionOptions = {}): Accessor<ScrollDirection> {
	const [direction, setDirection] = createSignal<ScrollDirection>("up");
	let lastScrollY = 0;
	let ticking = false;

	createEffect(() => {
		if (!readEnabled(enabled)) return;

		lastScrollY = window.scrollY;

		const handleScroll = () => {
			if (ticking) return;

			ticking = true;

			requestAnimationFrame(() => {
				const currentY = window.scrollY;
				const delta = currentY - lastScrollY;

				if (currentY <= 0) {
					setDirection("up");
					lastScrollY = currentY;
				} else if (delta > threshold) {
					setDirection("down");
					lastScrollY = currentY;
				} else if (delta < -threshold) {
					setDirection("up");
					lastScrollY = currentY;
				}

				ticking = false;
			});
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		onCleanup(() => window.removeEventListener("scroll", handleScroll));
	});

	const resolvedDirection = createMemo(() => (readEnabled(enabled) ? direction() : "up"));
	return resolvedDirection;
}
