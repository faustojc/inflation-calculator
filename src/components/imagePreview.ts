import { lazy } from "solid-js";

// One shared lazy instance for every commodity row. Declaring `lazy()` per
// module gives each call site its own load state; sharing it means the first
// preload anywhere warms the chunk for all rows.
export const ImagePreviewModal = lazy(() => import("@/components/ImagePreviewModal"));

let preloaded = false;

/**
 * Warm the modal chunk before the click lands. Wire to pointerenter (mouse)
 * and pointerdown (touch) so the dynamic import overlaps the tap, instead of
 * starting a network round trip on click while the user waits on a null fallback.
 */
export function preloadImagePreview() {
	if (preloaded) return;
	preloaded = true;
	void ImagePreviewModal.preload();
}
