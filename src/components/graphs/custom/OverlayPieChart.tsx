import { arc as d3Arc, pie as d3Pie } from "d3-shape";
import { useEffect, useRef } from "react";
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
const LABEL_SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const LABEL_DURATION = 0.25; // s — faster labels
const LABEL_STAGGER = 0.04; // s

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

export function OverlayPieChart({
	basePie,
	overlayPie,
	negativeItems,
	patternPrefix,
}: {
	basePie: PieEntry[];
	overlayPie: PieEntry[];
	negativeItems: CommodityContribution[];
	patternPrefix: string;
}) {
	const hasNegatives = negativeItems.length > 0;
	const clipSectorRef = useRef<SVGPathElement>(null);
	const clipPathId = `${patternPrefix}-reveal-clip`;
	const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
	const nav = navigator as Navigator & { deviceMemory?: number };
	const lowEndDevice = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
	const mobile = window.matchMedia?.("(max-width: 768px)").matches ?? false;
	const animationMs = (() => {
		if (prefersReducedMotion) return 0;

		return mobile || lowEndDevice ? 250 : PIE_DURATION;
	})();

	// Animate the clipPath sector from 0 -> 2pi, shortened or skipped on constrained devices.
	useEffect(() => {
		const el = clipSectorRef.current;
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
		return () => cancelAnimationFrame(rafId);
	}, [animationMs, basePie, overlayPie]);

	const pieLayout = d3Pie<PieEntry>()
		.value((d) => d.value)
		.sort(null);
	const baseArcGen = d3Arc<ReturnType<typeof pieLayout>[number]>()
		.innerRadius(0)
		.outerRadius(BASE_OUTER_R);
	const overlayArcGen = d3Arc<ReturnType<typeof pieLayout>[number]>()
		.innerRadius(0)
		.outerRadius(OVERLAY_OUTER_R);

	const baseArcs = pieLayout(basePie).map((a) => ({ data: a.data, path: baseArcGen(a) ?? "" }));
	const overlayArcs = hasNegatives
		? pieLayout(overlayPie).map((a) => ({ data: a.data, path: overlayArcGen(a) ?? "" }))
		: [];

	// Changes whenever pie data changes → forces label wrapper remount → CSS animation restarts
	const labelAnimKey = basePie.map((p) => `${p.code}:${p.value.toFixed(4)}`).join("|");

	const labelStyle = (i: number): React.CSSProperties =>
		animationMs === 0
			? { opacity: 1 }
			: {
					animation: `labelFocusIn ${LABEL_DURATION}s ${LABEL_SPRING} both`,
					animationDelay: `${Math.max(animationMs / 1000 - 0.05, 0) + i * LABEL_STAGGER}s`,
				};

	return (
		<div className="flex flex-col items-center w-full">
			<div className="w-full aspect-square max-h-100 relative">
				<svg
					viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
					className="w-full h-full"
					style={{ overflow: "visible" }}
				>
					<title>Pie Chart</title>
					<style>{`
						@keyframes labelFocusIn {
							0%   { opacity: 0; filter: blur(6px); }
							60%  { opacity: 1; filter: blur(1px); }
							100% { opacity: 1; filter: blur(0px); }
						}
						@keyframes overlayFlareIn {
							0%   { opacity: 0; filter: drop-shadow(0 0 10px rgba(220,50,50,0.95)); }
							45%  { opacity: 1; filter: drop-shadow(0 0 5px rgba(220,50,50,0.5)); }
							100% { opacity: 1; filter: drop-shadow(0 0 0px rgba(220,50,50,0)); }
						}
						@keyframes marchDashes {
							from { stroke-dashoffset: 0; }
							to   { stroke-dashoffset: -9; }
						}
					`}</style>

					<defs>
						{/* Reveal clip — animated by rAF */}
						<clipPath id={clipPathId}>
							<path ref={clipSectorRef} />
						</clipPath>

						{hasNegatives &&
							negativeItems.map((_, i) => (
								<pattern
									key={`${patternPrefix}-hatch-${i}`}
									id={`${patternPrefix}-hatch-${i}`}
									patternUnits="userSpaceOnUse"
									width="6"
									height="6"
									patternTransform="rotate(45)"
								>
									<line x1="0" y1="0" x2="0" y2="6" stroke={NEG_STRIPE_COLOR} strokeWidth="6.5" />
								</pattern>
							))}
					</defs>

					{/* LAYER 1 — Base pie clipped to the growing sector */}
					<g clipPath={`url(#${clipPathId})`}>
						<g transform={`translate(${CX},${CY})`} stroke="#fff" strokeWidth={2}>
							{baseArcs.map(({ data, path }, i) => (
								<CustomBaseSector
									key={data.code || i}
									path={path}
									code={data.code}
									index={i}
									value={data.value}
									originalShare={data.originalShare}
									patternPrefix={patternPrefix}
								/>
							))}
						</g>
					</g>

					{/* LAYER 2 — Overlay pie clipped to the same growing sector */}
					{hasNegatives && (
						<g clipPath={`url(#${clipPathId})`}>
							<g transform={`translate(${CX},${CY})`}>
								{overlayArcs.map(({ data, path }, i) => (
									<CustomOverlaySector
										key={data.code || `filler-${i}`}
										path={path}
										type={data.type}
										code={data.code}
										negIdx={data.negIdx ?? i}
										value={data.value}
										originalShare={data.originalShare}
										patternPrefix={patternPrefix}
									/>
								))}
							</g>
						</g>
					)}

					{/* Positive labels — blur focus-in, staggered */}
					{baseArcs.map(({ data }, i) => (
						<g key={`plabel-anim-${data.code || i}-${labelAnimKey}`} style={labelStyle(i)}>
							<CustomPositiveLabel
								payload={data}
								chartId={patternPrefix}
								basePie={basePie}
								overlayPie={overlayPie}
								cx={CX}
								cy={CY}
								outerRadius={BASE_OUTER_R}
							/>
						</g>
					))}

					{/* Negative labels — continue stagger after positives */}
					{hasNegatives &&
						overlayArcs.map(({ data }, i) => (
							<g
								key={`nlabel-anim-${data.code || i}-${labelAnimKey}`}
								style={labelStyle(baseArcs.length + i)}
							>
								<CustomNegativeLabel
									payload={data}
									index={i}
									chartId={patternPrefix}
									basePie={basePie}
									overlayPie={overlayPie}
									cx={CX}
									cy={CY}
									outerRadius={OVERLAY_OUTER_R}
								/>
							</g>
						))}
				</svg>
			</div>
		</div>
	);
}
