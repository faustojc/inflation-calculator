import { useId, useMemo } from "react";
import CustomPieLegend, { type LegendItem } from "@/components/graphs/custom/CustomPieLegend";
import { OverlayPieChart } from "@/components/graphs/custom/OverlayPieChart";
import type { PieEntry } from "@/lib/types";
import type { CommodityContribution, ContributionFactor } from "@/utils/inflationCompute";
import { getColor, NEG_STRIPE_COLOR, NEG_STROKE_COLOR } from "@/utils/metadata";

interface Props {
	personal: ContributionFactor;
	official: ContributionFactor;
}

/**
 * Splits contributors into base (positive) + overlay (negative) pie data.
 *
 * The base pie fills the full 360° with only the positive contributors.
 * The overlay pie layers negative contributors on top using proportional
 * sizing relative to the total positive sum, with a transparent filler
 * slice consuming the remainder so that negative arcs span the correct angular fraction.
 */
function buildPieData(contributors: readonly CommodityContribution[]) {
	const items = contributors.filter((c) => c.code !== "0");

	const positiveItems = items.filter((c) => c.percentShare > 0);
	const negativeItems = items.filter((c) => c.percentShare < 0);

	const totalPositive = positiveItems.reduce((s, c) => s + c.percentShare, 0);
	const totalNegAbs = negativeItems.reduce((s, c) => s + Math.abs(c.percentShare), 0);

	// Base pie for positive
	const basePie: PieEntry[] = positiveItems.map((c) => ({
		name: c.name,
		value: c.percentShare,
		originalShare: c.percentShare,
		code: c.code,
		type: "positive" as const,
	}));

	//Overlay pie for negative + filler (should be transparent)
	const overlayPie: PieEntry[] = [
		...negativeItems.map((c, i) => ({
			name: c.name,
			value: Math.abs(c.percentShare),
			originalShare: c.percentShare,
			code: c.code,
			type: "negative" as const,
			negIdx: i,
		})),
		{
			name: "_filler",
			value: Math.max(totalPositive - totalNegAbs, 0.01),
			originalShare: 0,
			code: "",
			type: "filler" as const,
		},
	];

	return { basePie, overlayPie, positiveItems, negativeItems, totalPositive, totalNegAbs };
}

function buildLegend(contributors: readonly CommodityContribution[]): LegendItem[] {
	const uniqueCommodities = new Map<string, LegendItem>();

	contributors
		.filter((c) => c.code !== "0")
		.forEach((item, index) => {
			if (item.code && !uniqueCommodities.has(item.code)) {
				uniqueCommodities.set(item.code, {
					code: item.code,
					name: item.name,
					value: item.percentShare,
					color: getColor(item.code, index),
				});
			}
		});

	return Array.from(uniqueCommodities.values());
}

export default function ContribInflationPie({ personal, official }: Readonly<Props>) {
	const instanceId = useId().replace(/:/g, "");

	const personalParts = useMemo(() => buildPieData(personal.contributors), [personal.contributors]);
	const officialParts = useMemo(() => buildPieData(official.contributors), [official.contributors]);

	const personalLegend = useMemo(() => buildLegend(personal.contributors), [personal.contributors]);
	const officialLegend = useMemo(() => buildLegend(official.contributors), [official.contributors]);

	const deflationFootnotes = useMemo(() => {
		const notes: { name: string; code: string; personalShare?: number; officialShare?: number }[] = [];

		const personalNegs = personal.contributors.filter((c) => c.code !== "0" && c.percentShare < 0);
		const officialNegs = official.contributors.filter((c) => c.code !== "0" && c.percentShare < 0);

		for (const c of personalNegs) {
			notes.push({ name: c.name, code: c.code, personalShare: c.percentShare });
		}

		for (const c of officialNegs) {
			const existing = notes.find((n) => n.code === c.code);
			if (existing) {
				existing.officialShare = c.percentShare;
			} else {
				notes.push({ name: c.name, code: c.code, officialShare: c.percentShare });
			}
		}

		return notes;
	}, [personal.contributors, official.contributors]);

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-base text-center italic text-muted-foreground">
				"Click/Hover on pie slice or commodity to highlight"
			</h1>
			<div className="grid grid-cols-1 xl:grid-cols-2 xl:grid-rows-1 gap-4">
				{/* Personal Pie */}
				<div className="col-span-1 flex flex-col gap-2">
					<div className="flex gap-3 items-center justify-center">
						<h4 className="text-base lg:text-xl text-center font-semibold text-primary/80">
							{personal.factorName}
						</h4>
						<h4 className="text-base lg:text-xl text-center text-primary/80 font-semibold">
							Inflation Rate:
							<span className="text-base lg:text-xl text-blue-700 font-bold ml-1">
								{personal.inflationRate.toFixed(1)}%
							</span>
						</h4>
					</div>
					<div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
						<div className="w-full">
							<OverlayPieChart
								basePie={personalParts.basePie}
								overlayPie={personalParts.overlayPie}
								negativeItems={personalParts.negativeItems}
								patternPrefix={`p-${instanceId}`}
							/>
						</div>
						<div className="w-full flex items-center sm:py-4">
							<CustomPieLegend props={personalLegend} patternPrefix={`p-${instanceId}`} />
						</div>
					</div>
				</div>

				{/* Official Pie */}
				<div className="col-span-1 flex flex-col gap-2">
					<div className="flex gap-3 items-center justify-center">
						<h4 className="text-base lg:text-xl text-center font-semibold text-primary/80">
							{official.areaName}
						</h4>
						<h4 className="text-base lg:text-xl text-center text-primary/80 font-semibold">
							Inflation Rate:
							<span className="text-base lg:text-xl text-blue-700 font-bold ml-1">
								{official.inflationRate.toFixed(1)}%
							</span>
						</h4>
					</div>
					<div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
						<div className="w-full">
							<OverlayPieChart
								basePie={officialParts.basePie}
								overlayPie={officialParts.overlayPie}
								negativeItems={officialParts.negativeItems}
								patternPrefix={`o-${instanceId}`}
							/>
						</div>
						<div className="w-full flex items-center sm:py-4">
							<CustomPieLegend props={officialLegend} patternPrefix={`o-${instanceId}`} />
						</div>
					</div>
				</div>
			</div>

			{/* Deflation Footnotes */}
			{deflationFootnotes.length > 0 && (
				<div className="px-4 pb-2 border-t border-border/50 pt-4">
					<p className="text-base font-semibold text-muted-foreground mb-2 uppercase">
						Deflationary Contributors
					</p>
					<ul className="space-y-1.5">
						{deflationFootnotes.map((note) => (
							<li key={note.code} className="flex items-center gap-2 text-xs text-muted-foreground">
								<span
									className="inline-block w-5 h-5 rounded-sm shrink-0 mt-0.5"
									style={{
										border: `2px dashed ${NEG_STROKE_COLOR}`,
										background: `repeating-linear-gradient(
											45deg,
											transparent,
											transparent 2px,
											${NEG_STRIPE_COLOR} 2px,
											${NEG_STRIPE_COLOR} 4px
										)`,
									}}
								/>
								<span>
									<strong className="text-foreground text-sm">{note.name}</strong>
									{" — "}
									{note.personalShare !== undefined && (
										<span className="text-sm text-destructive font-semibold">
											Personal: {note.personalShare.toFixed(1)}%
										</span>
									)}
									{note.personalShare !== undefined && note.officialShare !== undefined && " | "}
									{note.officialShare !== undefined && (
										<span className="text-sm text-destructive font-semibold">
											Official: {note.officialShare.toFixed(1)}%
										</span>
									)}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
