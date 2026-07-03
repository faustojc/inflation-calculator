import type uPlot from "uplot";
import type { TrendType } from "@/stores/graphStore";
import type { TrendPoint } from "@/utils/inflationCompute";

export const SERIES_COLORS = {
	personal: "var(--color-primary)",
	area: "#ff9800",
	province: "#fc0377",
	region: "#169c49",
	national: "#a83fe0",
} as const;

export function buildUplotData(trend: TrendPoint[]): uPlot.AlignedData {
	return [
		trend.map((_, i) => i),
		trend.map((d) => d.personal),
		trend.map((d) => d.area ?? null),
		trend.map((d) => d.province ?? null),
		trend.map((d) => d.region ?? null),
		trend.map((d) => d.national ?? null),
	] as uPlot.AlignedData;
}

/**
 * Computes evenly-spaced label indices for the x-axis.
 * Shows all labels when each slot is ≥65 CSS px (desktop / wide tablet).
 * Reduces density to ~60px/label when space is tight (narrow tablet / mobile).
 * Always includes index 0 (first) and n-1 (last).
 */
export function computeXSplits(chartCssWidth: number, n: number): number[] {
	const SPACE = 100;
	const LABEL_GAP = 70;

	if (n <= 1) return n === 1 ? [0] : [];
	if (chartCssWidth / n >= SPACE) return Array.from({ length: n }, (_, i) => i);

	const maxLabels = Math.max(2, Math.floor(chartCssWidth / LABEL_GAP));
	const step = Math.max(1, Math.ceil((n - 1) / (maxLabels - 1)));
	const result = new Set<number>([0]);

	for (let i = step; i < n - 1; i += step) result.add(i);

	result.add(n - 1);
	return [...result].sort((a, b) => a - b);
}

export function buildYAxisConfig(trend: TrendPoint[], currTrend: TrendType) {
	const allValues = trend
		.flatMap((d) => [d.personal, d.area, d.region, d.province, d.national])
		.filter((v): v is number => typeof v === "number");

	if (allValues.length === 0) return { domain: [0, 5] as [number, number], ticks: [0, 1, 2, 3, 4, 5] };

	const dataMax = Math.max(...allValues);
	const dataMin = Math.min(...allValues);
	const viewMax = Math.max(dataMax, 0);
	let viewMin = Math.min(dataMin, 0);

	if (currTrend === "cpi") viewMin = Math.floor(dataMin / 5) * 5;

	const range = viewMax - viewMin;
	let step: number;
	if (range <= 4) step = 0.5;
	else if (range <= 7) step = 1;
	else if (range <= 14) step = 1.5;
	else if (range <= 30) step = 3.5;
	else step = 5;

	const ticks = new Set<number>([currTrend === "cpi" ? viewMin : 0]);

	let current = currTrend === "cpi" ? viewMin : 0;
	while (current < viewMax) {
		current += step;
		ticks.add(Number.parseFloat(current.toFixed(1)));
	}
	current = currTrend === "cpi" ? viewMin : 0;
	while (current > viewMin) {
		current -= step;
		ticks.add(Number.parseFloat(current.toFixed(1)));
	}

	const sortedTicks = Array.from(ticks).sort((a, b) => a - b);
	return {
		domain: [sortedTicks[0]!, sortedTicks.at(-1)!] as [number, number],
		ticks: sortedTicks,
	};
}
