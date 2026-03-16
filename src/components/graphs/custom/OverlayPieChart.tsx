import CustomNegativeLabel from "@/components/graphs/custom/CustomNegativeLabel";
import CustomPositiveLabel from "@/components/graphs/custom/CustomPositiveLabel";
import CustomBaseSector from "@/components/graphs/custom/CustomBaseSector";
import CustomOverlaySector from "@/components/graphs/custom/CustomOverlaySector";

import type { PieEntry } from "@/lib/types";
import type { CommodityContribution } from "@/utils/inflationCompute";
import { NEG_STRIPE_COLOR } from "@/utils/metadata";
import { Pie, PieChart, ResponsiveContainer, Tooltip, type PieLabelRenderProps } from "recharts";

export function OverlayPieChart({
	title,
	basePie,
	overlayPie,
	negativeItems,
	patternPrefix,
}: {
	title: string;
	basePie: PieEntry[];
	overlayPie: PieEntry[];
	negativeItems: CommodityContribution[];
	patternPrefix: string;
}) {
	const hasNegatives = negativeItems.length > 0;

	return (
		<div className="flex flex-col items-center w-full">
			<h4 className="text-sm font-semibold mb-2 text-foreground text-center">{title}</h4>
			<div className="w-full aspect-square max-h-100 relative">
				{hasNegatives && (
					<svg width="0" height="0" className="absolute" aria-hidden="true">
						<defs>
							{negativeItems.map((_, i) => (
								<pattern
									key={`${patternPrefix}-hatch-${i}`}
									id={`${patternPrefix}-hatch-${i}`}
									patternUnits="userSpaceOnUse"
									width="6"
									height="6"
									patternTransform="rotate(45)"
								>
									<line x1="0" y1="0" x2="0" y2="6" stroke={NEG_STRIPE_COLOR} strokeWidth="2.5" />
								</pattern>
							))}
						</defs>
					</svg>
				)}

				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						{/* LAYER 1 Base Pie - Positive values (solid commodity colors) */}
						<Pie
							data={basePie}
							dataKey="value"
							nameKey="name"
							cx="50%"
							cy="50%"
							outerRadius="60%"
							stroke="#fff"
							strokeWidth={2}
							labelLine={false}
							isAnimationActive={true}
							animationDuration={500}
							animationBegin={0}
							startAngle={90}
							endAngle={-270}
							label={(props: PieLabelRenderProps) => (
								<CustomPositiveLabel
									{...props}
									chartId={patternPrefix}
									basePie={basePie}
									overlayPie={overlayPie}
								/>
							)}
							shape={(props) => <CustomBaseSector {...props} patternPrefix={patternPrefix} />}
						/>

						{/* LAYER 2 Overlay - Negative values (hatched + dashed red border) */}
						{hasNegatives && (
							<Pie
								data={overlayPie}
								dataKey="value"
								nameKey="name"
								cx="50%"
								cy="50%"
								outerRadius="59%"
								labelLine={false}
								isAnimationActive={true}
								animationDuration={500}
								animationBegin={0}
								startAngle={90}
								endAngle={-270}
								label={(props: PieLabelRenderProps) => (
									<CustomNegativeLabel
										{...props}
										chartId={patternPrefix}
										basePie={basePie}
										overlayPie={overlayPie}
									/>
								)}
								shape={(props) => <CustomOverlaySector {...props} patternPrefix={patternPrefix} />}
							/>
						)}

						<Tooltip active={false} />
					</PieChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
