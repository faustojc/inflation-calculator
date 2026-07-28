import { arc as d3Arc, pie as d3Pie } from "d3-shape";
import { createMemo, For, onCleanup, onMount, Show } from "solid-js";
import CustomBaseSector from "@/components/graphs/custom/CustomBaseSector";
import CustomNegativeLabel from "@/components/graphs/custom/CustomNegativeLabel";
import CustomOverlaySector from "@/components/graphs/custom/CustomOverlaySector";
import CustomPositiveLabel from "@/components/graphs/custom/CustomPositiveLabel";
import type { PieEntry } from "@/lib/types";
import type { CommodityContribution } from "@/utils/inflationCompute";
import { NEG_STRIPE_COLOR } from "@/utils/metadata";

const VIEW_SIZE = 400;
const CX = VIEW_SIZE / 2; // 200
const CY = VIEW_SIZE / 2; // 200
const BASE_OUTER_R = VIEW_SIZE * 0.3; // 120
const OVERLAY_OUTER_R = VIEW_SIZE * 0.295; // 118
// Clip radius must cover the full pie including stroke bleeding
const CLIP_R = VIEW_SIZE * 0.52;

const PIE_DURATION = 700; // ms — rAF sweep

// SVG path string for a clockwise sector from startAngle sweeping `sweep` radians, centered at (cx, cy)
function revealSectorPath(sweep: number): string {
	const startAngle = -Math.PI / 2; // top
	if (sweep >= 2 * Math.PI - 0.001) {
		// Full circle: two semicircle arcs to avoid degenerate SVG
		return `M ${CX} ${CY - CLIP_R} A ${CLIP_R} ${CLIP_R} 0 1 1 ${CX} ${CY + CLIP_R} A ${CLIP_R} ${CLIP_R} 0 1 1 ${CX} ${CY - CLIP_R} Z`;
	}
	const endAngle = startAngle + sweep;
	const x1 = CX + CLIP_R * Math.cos(startAngle);
	const y1 = CY + CLIP_R * Math.sin(startAngle);
	const x2 = CX + CLIP_R * Math.cos(endAngle);
	const y2 = CY + CLIP_R * Math.sin(endAngle);
	return `M ${CX} ${CY} L ${x1} ${y1} A ${CLIP_R} ${CLIP_R} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`;
}

export function OverlayPieChart(props: {
	basePie: PieEntry[];
	overlayPie: PieEntry[];
	negativeItems: CommodityContribution[];
	patternPrefix: string;
}) {
	const hasNegatives = () => props.negativeItems.length > 0;
	const clipPathId = () => `${props.patternPrefix}-reveal-clip`;
	const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
	const nav = navigator as Navigator & { deviceMemory?: number };
	const lowEndDevice = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
	const mobile = window.matchMedia?.("(max-width: 768px)").matches ?? false;
	const animationMs = (() => {
		if (prefersReducedMotion) return 0;

		return mobile || lowEndDevice ? 250 : PIE_DURATION;
	})();

	let clipSectorRef!: SVGPathElement;

	// Animate the clipPath sector from 0 -> 2pi, shortened or skipped on constrained devices.
	onMount(() => {
		const el = clipSectorRef;
		if (!el) return;

		if (animationMs === 0) {
			el.setAttribute("d", revealSectorPath(2 * Math.PI));
			return;
		}

		const easeOut = (t: number) => 1 - (1 - t) ** 3;
		const start = performance.now();
		let rafId: number;

		const animate = (now: number) => {
			const t = Math.min((now - start) / animationMs, 1);
			el.setAttribute("d", revealSectorPath(easeOut(t) * 2 * Math.PI));
			if (t < 1) rafId = requestAnimationFrame(animate);
		};

		el.setAttribute("d", revealSectorPath(0.001));
		rafId = requestAnimationFrame(animate);
		onCleanup(() => cancelAnimationFrame(rafId));
	});

	const pieLayout = d3Pie<PieEntry>()
		.value((d) => d.value)
		.sort(null);
	const baseArcGen = d3Arc<ReturnType<typeof pieLayout>[number]>().innerRadius(0).outerRadius(BASE_OUTER_R);
	const overlayArcGen = d3Arc<ReturnType<typeof pieLayout>[number]>()
		.innerRadius(0)
		.outerRadius(OVERLAY_OUTER_R);

	const baseArcs = createMemo(() =>
		pieLayout(props.basePie).map((a) => ({ data: a.data, path: baseArcGen(a) ?? "" })),
	);
	const overlayArcs = createMemo(() =>
		hasNegatives() ? pieLayout(props.overlayPie).map((a) => ({ data: a.data, path: overlayArcGen(a) ?? "" })) : [],
	);

	const labelGroupClass = () => {
		if (animationMs === 0) return "";

		return animationMs === PIE_DURATION ? "pie-labels pie-labels-normal" : "pie-labels pie-labels-fast";
	};

	return (
		<div class="flex flex-col items-center w-full">
			<div class="w-full aspect-square max-h-100 relative">
				<svg viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`} class="w-full h-full overflow-visible">
					<title>Pie Chart</title>

					<defs>
						{/* Reveal clip — animated by rAF */}
						<clipPath id={clipPathId()}>
							<path ref={clipSectorRef} />
						</clipPath>

						<Show when={hasNegatives()}>
							<For each={props.negativeItems}>
								{(_, i) => (
									<pattern
										id={`${props.patternPrefix}-hatch-${i()}`}
										patternUnits="userSpaceOnUse"
										width="6"
										height="6"
										patternTransform="rotate(45)"
									>
										<line x1="0" y1="0" x2="0" y2="6" stroke={NEG_STRIPE_COLOR} stroke-width="6.5" />
									</pattern>
								)}
							</For>
						</Show>
					</defs>

					{/* LAYER 1 — Base pie clipped to the growing sector */}
					<g clip-path={`url(#${clipPathId()})`}>
						<g transform={`translate(${CX},${CY})`} stroke="#fff" stroke-width={2}>
							<For each={baseArcs()}>
								{({ data, path }, i) => (
									<CustomBaseSector
										path={path}
										code={data.code}
										index={i()}
										value={data.value}
										originalShare={data.originalShare}
										patternPrefix={props.patternPrefix}
									/>
								)}
							</For>
						</g>
					</g>

					{/* LAYER 2 — Overlay pie clipped to the same growing sector */}
					<Show when={hasNegatives()}>
						<g clip-path={`url(#${clipPathId()})`}>
							<g transform={`translate(${CX},${CY})`} class="overlay-sectors">
								<For each={overlayArcs()}>
									{({ data, path }, i) => (
										<CustomOverlaySector
											path={path}
											type={data.type}
											code={data.code}
											negIdx={data.negIdx ?? i()}
											value={data.value}
											originalShare={data.originalShare}
											patternPrefix={props.patternPrefix}
										/>
									)}
								</For>
							</g>
						</g>
					</Show>

					<g class={labelGroupClass()}>
						{/* Positive labels — blur focus-in, staggered */}
						<For each={baseArcs()}>
							{({ data }) => (
								<g class="pie-label">
									<CustomPositiveLabel
										payload={data}
										chartId={props.patternPrefix}
										basePie={props.basePie}
										overlayPie={props.overlayPie}
										cx={CX}
										cy={CY}
										outerRadius={BASE_OUTER_R}
									/>
								</g>
							)}
						</For>

						{/* Negative labels — continue stagger after positives */}
						<Show when={hasNegatives()}>
							<For each={overlayArcs()}>
								{({ data }, i) => (
									<g class="pie-label">
										<CustomNegativeLabel
											payload={data}
											index={i()}
											chartId={props.patternPrefix}
											basePie={props.basePie}
											overlayPie={props.overlayPie}
											cx={CX}
											cy={CY}
											outerRadius={OVERLAY_OUTER_R}
										/>
									</g>
								)}
							</For>
						</Show>
					</g>
				</svg>
			</div>
		</div>
	);
}
