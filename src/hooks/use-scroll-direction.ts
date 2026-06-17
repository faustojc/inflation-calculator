import { useEffect, useRef, useState } from "react";

export type ScrollDirection = "up" | "down";

interface UseScrollDirectionOptions {
	threshold?: number;
	enabled?: boolean;
}

/**
 * Tracks the user's scroll direction — "up" or "down".
 *
 * Used for the auto-hide header pattern on mobile.
 * - Returns "down" when the user scrolls toward page bottom → header hides.
 * - Returns "up" when the user scrolls toward page top → header reveals.
 *
 * Uses a dead-zone (`threshold`) so minor touch movements don't toggle the header.
 */
export function useScrollDirection({ threshold = 10, enabled = true }: UseScrollDirectionOptions = {}): ScrollDirection {
	const [direction, setDirection] = useState<ScrollDirection>("up");
	const lastScrollY = useRef(0);
	const ticking = useRef(false);

	useEffect(() => {
		if (!enabled) return;

		lastScrollY.current = window.scrollY;

		const handleScroll = () => {
			if (ticking.current) return;

			ticking.current = true;

			requestAnimationFrame(() => {
				const currentY = window.scrollY;
				const delta = currentY - lastScrollY.current;

				// At the very top of the page, always show the header
				if (currentY <= 0) {
					setDirection("up");
					lastScrollY.current = currentY;
				} else if (delta > threshold) {
					setDirection("down");
					lastScrollY.current = currentY;
				} else if (delta < -threshold) {
					setDirection("up");
					lastScrollY.current = currentY;
				}
				// If |delta| < threshold, don't update lastScrollY —
				// let small deltas accumulate until they cross the threshold.

				ticking.current = false;
			});
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [enabled, threshold]);

	return enabled ? direction : "up";
}
