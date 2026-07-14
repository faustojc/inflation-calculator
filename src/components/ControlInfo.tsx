import { InfoIcon } from "lucide-solid";
import { createSignal, onCleanup, onMount, type JSX } from "solid-js";

type Placement = "top" | "bottom" | "left" | "right";

// distance from trigger to content (daisyUI --tt-off ≈ 0.5rem + tail)
const GAP = 12;
// minimum space to keep between the content and the viewport edge
const MARGIN = 8;

const ControlInfo = (props: Readonly<{ content: JSX.Element }>) => {
	let wrapperRef!: HTMLDivElement;
	let contentRef!: HTMLDivElement;

	const [placement, setPlacement] = createSignal<Placement>("bottom");
	const [shift, setShift] = createSignal(0);

	const updatePlacement = () => {
		const trigger = wrapperRef.getBoundingClientRect();
		const width = contentRef.offsetWidth;
		const height = contentRef.offsetHeight;
		const vw = document.documentElement.clientWidth;
		const vh = document.documentElement.clientHeight;

		let next: Placement;
		if (trigger.right + GAP + width <= vw - MARGIN) {
			next = "right";
		} else if (trigger.left - GAP - width >= MARGIN) {
			next = "left";
		} else if (trigger.bottom + GAP + height <= vh - MARGIN || trigger.bottom > vh - trigger.top) {
			next = "bottom";
		} else {
			next = "top";
		}

		let offset = 0;
		if (next === "top" || next === "bottom") {
			const start = trigger.left + trigger.width / 2 - width / 2;
			if (start < MARGIN) offset = MARGIN - start;
			else if (start + width > vw - MARGIN) offset = vw - MARGIN - (start + width);
		} else {
			const start = trigger.top + trigger.height / 2 - height / 2;
			if (start < MARGIN) offset = MARGIN - start;
			else if (start + height > vh - MARGIN) offset = vh - MARGIN - (start + height);
		}

		setPlacement(next);
		setShift(offset);
	};

	onMount(() => {
		updatePlacement();
		window.addEventListener("resize", updatePlacement);
		onCleanup(() => window.removeEventListener("resize", updatePlacement));
	});

	return (
		<div
			ref={wrapperRef}
			class="tooltip"
			classList={{
				"tooltip-top": placement() === "top",
				"tooltip-bottom": placement() === "bottom",
				"tooltip-left": placement() === "left",
				"tooltip-right": placement() === "right",
			}}
			onMouseEnter={updatePlacement}
			onFocusIn={updatePlacement}
		>
			<div
				ref={contentRef}
				class="tooltip-content bg-card text-foreground border-2 z-50 w-max max-w-[min(24rem,calc(100vw-1rem))] text-left normal-case font-normal"
				style={{ "--tt-trans": `calc(-50% + ${shift()}px)` }}
			>
				{props.content}
			</div>
			<button type="button" aria-label="More information" class="flex cursor-help">
				<InfoIcon class="h-4 w-4 text-primary" />
			</button>
		</div>
	);
};

export default ControlInfo;
