import { curveMonotoneX, line as d3Line } from "d3-shape";
import { useEffect, useRef } from "react";
import uPlot from "uplot";
import type { TrendPoint } from "@/utils/inflationCompute";
import { buildUplotData, computeXSplits, SERIES_COLORS } from "@/utils/trendChartUtils";

interface UseTrendChartOptions {
	trend: TrendPoint[];
	isMobile: boolean;
	seriesOrder: readonly string[];
	seriesLabels: Record<string, string>;
	hasProvince: boolean;
	hasRegion: boolean;
	showLine: (key: string) => boolean;
	yAxisConfig: { domain: [number, number]; ticks: number[] };
}

/**
 * Manages uPlot instance lifecycle: creation, resize, tooltip, and cleanup.
 *
 * NOTE ON COORDINATES: uPlot draws on a raw canvas (no ctx.scale applied).
 * All canvas drawing must use DEVICE pixels → valToPos(v, scale, true).
 * CSS pixels (false) are only used for positioning HTML overlay elements.
 */
export function useTrendChart({
	trend,
	isMobile,
	seriesOrder,
	seriesLabels,
	hasProvince,
	hasRegion,
	showLine,
	yAxisConfig,
}: UseTrendChartOptions) {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<HTMLDivElement>(null);
	const uplotRef = useRef<uPlot | null>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);
	const animProgressRef = useRef(1);

	useEffect(() => {
		if (!wrapperRef.current || !chartRef.current || trend.length === 0) return;

		const wrapper = wrapperRef.current;
		const container = chartRef.current;
		const tooltip = tooltipRef.current;
		const data = buildUplotData(trend);

		uplotRef.current?.destroy();
		uplotRef.current = null;
		animProgressRef.current = 0;

		const style = getComputedStyle(document.documentElement);
		const fg = `hsl(${style.getPropertyValue("--foreground").trim()})`;
		const muted = `hsl(${style.getPropertyValue("--muted-foreground").trim()} / 0.35)`;
		const primaryColor = style.getPropertyValue("--primary").trim();
		const lineDash = isMobile ? [4, 4] : [8, 8];

		const resolvedColors: Record<string, string> = {
			personal: `hsl(${primaryColor})`,
			area: SERIES_COLORS.area,
			province: SERIES_COLORS.province,
			region: SERIES_COLORS.region,
			national: SERIES_COLORS.national,
		};

		// Pre-build tooltip DOM once
		let tooltipDateEl: HTMLElement | null = null;
		const tooltipRowMap = new Map<string, { rowEl: HTMLElement; valEl: HTMLElement }>();
		let lastTooltipIdx = -1;

		if (tooltip) {
			while (tooltip.firstChild) tooltip.removeChild(tooltip.firstChild);
			tooltip.style.boxShadow = "0 2px 10px rgba(0,0,0,0.45)";

			tooltipDateEl = document.createElement("div");
			tooltipDateEl.className = "text-base";
			tooltipDateEl.style.cssText = "font-weight:600;margin-bottom:6px;";
			tooltip.appendChild(tooltipDateEl);

			const visibleKeys = seriesOrder.filter((key) => {
				if (key === "province" && !hasProvince) return false;
				if (key === "region" && !hasRegion) return false;
				return showLine(key);
			});
			for (const key of visibleKeys) {
				const color = resolvedColors[key] ?? "#888";
				const rowEl = document.createElement("div");
				rowEl.style.cssText = "display:none;align-items:center;gap:6px;";

				const labelEl = document.createElement("span");
				labelEl.style.color = color;
				labelEl.className = "text-base";
				labelEl.textContent = `${seriesLabels[key] ?? key}: `;

				const valEl = document.createElement("strong");
				valEl.style.color = color;
				valEl.className = "text-base";

				labelEl.appendChild(valEl);
				rowEl.appendChild(labelEl);
				tooltip.appendChild(rowEl);
				tooltipRowMap.set(key, { rowEl, valEl });
			}
		}

		// Monotone cubic spline path builder. Uses DEVICE pixels (true) since
		// uPlot does not apply ctx.scale(dpr, dpr) — the canvas is in raw device px space.
		const monotonePaths =
			(si: number): uPlot.Series.PathBuilder =>
			(u, _si, idx0, idx1) => {
				const xdata = u.data[0] as number[];
				const ydata = u.data[si] as (number | null)[];
				const indices = Array.from({ length: idx1 - idx0 + 1 }, (_, k) => idx0 + k);
				const lineGen = d3Line<number>()
					.x((i) => u.valToPos(xdata[i]!, "x", true))
					.y((i) => {
						const v = ydata[i];
						return v != null ? u.valToPos(v, "y", true) : 0;
					})
					.defined((i) => ydata[i] != null)
					.curve(curveMonotoneX);

				const pathStr = lineGen(indices);
				if (!pathStr) return null;

				const clip = new Path2D();
				clip.rect(u.bbox.left, u.bbox.top, u.bbox.width * animProgressRef.current, u.bbox.height);

				return { stroke: new Path2D(pathStr), fill: null, clip };
			};

		const series: uPlot.Series[] = [
			{},
			{
				label: seriesLabels.personal ?? "",
				stroke: resolvedColors.personal,
				width: 4,
				spanGaps: true,
				points: { show: false },
				paths: monotonePaths(1),
			},
			{
				label: seriesLabels.area ?? "",
				stroke: resolvedColors.area,
				width: 2,
				dash: lineDash,
				show: showLine("area"),
				spanGaps: true,
				points: { show: false },
				paths: monotonePaths(2),
			},
			{
				label: hasProvince ? (seriesLabels.province ?? "") : "",
				stroke: resolvedColors.province,
				width: 2,
				dash: lineDash,
				show: hasProvince ? showLine("province") : false,
				spanGaps: true,
				points: { show: false },
				paths: monotonePaths(3),
			},
			{
				label: hasRegion ? (seriesLabels.region ?? "") : "",
				stroke: resolvedColors.region,
				width: 2,
				dash: lineDash,
				show: hasRegion ? showLine("region") : false,
				spanGaps: true,
				points: { show: false },
				paths: monotonePaths(4),
			},
			{
				label: seriesLabels.national ?? "",
				stroke: resolvedColors.national,
				width: 2,
				dash: lineDash,
				show: showLine("national"),
				spanGaps: true,
				points: { show: false },
				paths: monotonePaths(5),
			},
		];

		let currentXSplits: number[] = [];

		// Use getBoundingClientRect for accurate initial size after React layout
		const rect = wrapper.getBoundingClientRect();
		const initW = rect.width || wrapper.clientWidth || 400;
		const initH = Math.max(rect.height || wrapper.clientHeight, 320);

		const opts: uPlot.Options = {
			width: initW,
			height: initH,
			cursor: {
				drag: { x: false, y: false },
				points: { size: 8, fill: (_u, si) => series[si]?.stroke as string },
			},
			select: { show: false, left: 0, top: 0, width: 0, height: 0 },
			legend: { show: false },
			series,
			axes: [
				{
					// X axis labels drawn manually in drawAxes (two-line: month / year)
					stroke: fg,
					grid: { show: false },
					ticks: { show: false },
					border: { show: false },
					splits: (u) => {
						currentXSplits = computeXSplits(u.width, trend.length);
						return currentXSplits;
					},
					values: () => currentXSplits.map(() => ""),
					size: 45,
				},
				{
					// Y axis
					stroke: fg,
					font: "16px sans-serif",
					grid: { stroke: muted, width: 1 },
					ticks: { show: false },
					border: { show: false },
					splits: () => yAxisConfig.ticks,
					values: (_self, splits) => splits.map((v) => v.toFixed(1)),
					size: 50,
				},
			],
			scales: {
				x: { range: () => [-0.15, trend.length - 0.88] },
				y: {
					range: () => [yAxisConfig.domain[0] - 0.1, yAxisConfig.domain[1] + 0.1],
				},
			},
			hooks: {
				drawAxes: [
					(u) => {
						const ctx = u.ctx;
						const pxR = window.devicePixelRatio || 1;
						const lastJ = currentXSplits.length - 1;

						ctx.save();
						ctx.fillStyle = fg;
						ctx.textBaseline = "top";
						ctx.font = `${Math.round(16 * pxR)}px sans-serif`;

						// u.bbox in device pixels — draw text in device pixel space
						const yBase = u.bbox.top + u.bbox.height;
						const gap = 5 * pxR;
						const lineH = 16 * pxR;

						for (let j = 0; j <= lastJ; j++) {
							const idx = currentXSplits[j]!;
							const roundIdx = Math.round(idx);
							if (roundIdx < 0 || roundIdx >= trend.length) continue;
							const dateStr = trend[roundIdx]?.date;
							if (!dateStr) continue;

							const [month = "", year = ""] = dateStr.split(" ");
							const x = u.valToPos(idx, "x", true); // device pixels

							// Edge labels: left-align first, right-align last → no overflow into axes
							ctx.textAlign = "center";
							ctx.fillText(month, x, yBase + gap);
							ctx.fillText(year, x, yBase + gap + lineH);
						}

						ctx.restore();
					},
				],
				setCursor: [
					(u) => {
						if (!tooltip || !tooltipDateEl) return;
						const { left, top, idx } = u.cursor;
						if (idx == null || left == null || top == null || left < 0) {
							tooltip.style.display = "none";
							lastTooltipIdx = -1;
							return;
						}

						const point = trend[idx];
						if (!point) {
							tooltip.style.display = "none";
							return;
						}

						// Only rebuild content when the data point index changes
						if (idx !== lastTooltipIdx) {
							lastTooltipIdx = idx;
							tooltipDateEl.style.color = fg;
							tooltipDateEl.textContent = point.date;
							for (const [key, { rowEl, valEl }] of tooltipRowMap) {
								const val = point[key as keyof TrendPoint];
								if (typeof val === "number") {
									valEl.textContent = val.toFixed(1);
									rowEl.style.display = "flex";
								} else {
									rowEl.style.display = "none";
								}
							}
						}

						const ttWidth = 220;
						const xPos = u.valToPos(idx, "x", false);
						const gap16 = 16;
						let tooltipLeft: number;
						if (xPos > u.width / 2) {
							tooltipLeft = xPos - ttWidth - gap16;
						} else {
							tooltipLeft = xPos + 60 + gap16;
						}
						tooltipLeft = Math.max(4, Math.min(tooltipLeft, u.width - ttWidth - 4));

						tooltip.style.display = "block";
						tooltip.style.left = `${tooltipLeft}px`;
						tooltip.style.top = `${Math.max(4, (top ?? 0) - 20)}px`;
					},
				],
			},
		};

		const chart = new uPlot(opts, data, container);
		uplotRef.current = chart;

		// Cubic ease-in-out draw-on animation: reveal lines left→right over 700ms
		const ANIM_DURATION = 700;
		const animStart = performance.now();
		let rafId: number;
		const animate = (now: number) => {
			const t = Math.min((now - animStart) / ANIM_DURATION, 1);
			animProgressRef.current = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
			chart.redraw(true, false);
			if (t < 1) rafId = requestAnimationFrame(animate);
		};
		rafId = requestAnimationFrame(animate);

		const onLeave = () => {
			if (tooltip) tooltip.style.display = "none";
		};
		container.addEventListener("mouseleave", onLeave);

		// Observe wrapper (not container) so resize isn't circular with uplot's own canvas
		const ro = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) return;
			const { width, height } = entry.contentRect;
			chart.setSize({
				width: Math.max(width, 100),
				height: Math.max(height, 320),
			});
		});
		ro.observe(wrapper);

		return () => {
			cancelAnimationFrame(rafId);
			container.removeEventListener("mouseleave", onLeave);
			ro.disconnect();
			chart.destroy();
		};
	}, [trend, isMobile, yAxisConfig, hasRegion, hasProvince, seriesLabels, seriesOrder, showLine]);

	return { wrapperRef, chartRef, tooltipRef };
}
