import type { PieEntry } from "@/lib/types";

// Cache the layout in memory to prevent recalculating for every label on every render
// since Recharts has rerendering problems causing lags and heavy stutters
const layoutCache = new Map<string, Map<string, LayoutPosition>>();

export interface LayoutPosition {
	sx: number;
	sy: number;
	ex: number;
	ey: number;
	cos: number;
	textAnchor: "start" | "end";
}

interface ProcessedLabel {
	id: string;
	idealTheta: number; // original geometric angle
	y: number;
	side: "left" | "right";
	R: number;
}

function processPie(pie: PieEntry[], cy: number, outerRadius: number, totalValue: number, isNegative: boolean): ProcessedLabel[] {
	let currentAngle = 90;
	const RADIAN = Math.PI / 180;
	const processed: ProcessedLabel[] = [];

	for (const entry of pie) {
		const sliceAngle = (entry.value / totalValue) * 360;
		const midAngle = currentAngle - sliceAngle / 2;

		const skip = entry.type === "filler" || (entry.originalShare >= 0 && entry.originalShare <= 0.099) || entry.value === 0;

		if (!skip) {
			const theta = -RADIAN * midAngle;
			const cos = Math.cos(theta);

			// Push negative slightly out to avoid crossing
			const radius = outerRadius + (isNegative ? 44 : 20);

			processed.push({
				id: (isNegative ? "n_" : "p_") + entry.code,
				idealTheta: theta,
				y: cy + radius * Math.sin(theta),
				side: cos >= 0 ? "right" : "left",
				R: radius,
			});
		}
		currentAngle -= sliceAngle;
	}

	return processed;
}

function relaxSide(labels: ProcessedLabel[], minH: number, minY: number, maxY: number): ProcessedLabel[] {
	if (labels.length === 0) return labels;

	const sides = labels.sort((a, b) => a.y - b.y);

	// Use 1D Relaxation Algorithm along the y-axis to guarantee minH spacing
	for (let iter = 0; iter < 100; iter++) {
		let moved = false;

		for (let i = 0; i < sides.length - 1; i++) {
			const curr = sides[i]!;
			const next = sides[i + 1]!;
			const diff = next.y - curr.y;

			if (diff < minH) {
				const adj = (minH - diff) / 2;
				curr.y -= adj;
				next.y += adj;
				moved = true;
			}
		}
		if (!moved) break;
	}

	const currentHeight = sides[sides.length - 1]!.y - sides[0]!.y;
	const availableHeight = maxY - minY;

	// Enforce bounds cleanly to prevent vertical clipping outside the parent element
	if (currentHeight > availableHeight) {
		// Scale them to fit inside the bounds
		const scale = availableHeight / Math.max(1, currentHeight);
		for (let i = 0; i < sides.length; i++) {
			sides[i]!.y = minY + (sides[i]!.y - sides[0]!.y) * scale;
		}
	} else {
		// Shift block if out of bounds
		const topOverflow = minY - sides[0]!.y;
		if (topOverflow > 0) {
			for (const l of sides) l.y += topOverflow;
		}
		const bottomOverflow = sides[sides.length - 1]!.y - maxY;
		if (bottomOverflow > 0) {
			for (const l of sides) l.y -= bottomOverflow;
		}
	}

	return sides;
}

export function getSmartLabelLayout(
	chartId: string,
	basePie: PieEntry[],
	overlayPie: PieEntry[],
	cx: number,
	cy: number,
	outerRadius: number,
): Map<string, LayoutPosition> {
	const dataHash = basePie.map((e) => e.code + e.value).join(",") + "|" + overlayPie.map((e) => e.code + e.value).join(",");
	const cacheKey = `${chartId}-${cx}-${cy}-${outerRadius}-${dataHash}`;
	if (layoutCache.has(cacheKey)) {
		return layoutCache.get(cacheKey)!;
	}

	const totalValue = basePie.reduce((acc, curr) => acc + curr.value, 0);
	if (totalValue === 0) return new Map();

	const allLabels: ProcessedLabel[] = [];

	const processedBase = processPie(basePie, cy, outerRadius, totalValue, false);
	const processedOverlay = processPie(overlayPie, cy, outerRadius, totalValue, true);
	allLabels.push(...processedBase, ...processedOverlay);

	// Deriving bounds from outerRadius directly since Pie chart uses 60% (Pie settings) outerRadius and might be centered at (0,0)
	const halfSize = outerRadius / 0.6;
	const minH = 25;
	const minY = cy - halfSize + 14;
	const maxY = cy + halfSize - 14;

	const relaxedRight = relaxSide(
		allLabels.filter((l) => l.side === "right"),
		minH,
		minY,
		maxY,
	);
	const relaxedLeft = relaxSide(
		allLabels.filter((l) => l.side === "left"),
		minH,
		minY,
		maxY,
	);

	allLabels.splice(0, allLabels.length, ...relaxedRight, ...relaxedLeft);

	const map = new Map<string, LayoutPosition>();

	// Max horizontal distance to prevent horizontal clipping, reserving space for the text
	const maxDx = Math.max(20, halfSize - 35);

	for (const l of allLabels) {
		const dy = l.y - cy;

		// If dy pushed outside R, cap to min dx 20 to form a vertical column
		const dxSq = l.R * l.R - dy * dy;
		const dx = Math.min(maxDx, Math.sqrt(Math.max(400, dxSq)));

		// Use the exact coordinate on the arc border pointing middle of the angle
		const sx = cx + outerRadius * Math.cos(l.idealTheta);
		const sy = cy + outerRadius * Math.sin(l.idealTheta);
		const ex = cx + (l.side === "right" ? dx : -dx);
		const ey = l.y;

		map.set(l.id, {
			sx,
			sy,
			ex,
			ey,
			cos: l.side === "right" ? 1 : -1,
			textAnchor: l.side === "right" ? "start" : "end",
		});
	}

	if (layoutCache.size > 20) layoutCache.clear();
	layoutCache.set(cacheKey, map);

	return map;
}
