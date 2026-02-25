import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { type ContributionFactor } from "@/utils/inflationCompute";
import React from "react";

export function ContributorTable({ contributors }: Readonly<{ contributors: ContributionFactor[] }>) {
	const isMobile = useIsMobile();
	const maxRows = Math.max(...contributors.map((f) => f.contributors.length));

	if (!contributors || contributors.length === 0) return null;

	if (isMobile) {
		return (
			<div className="space-y-6">
				{contributors.map((factor) => {
					const totalWeight = factor.contributors[0]?.weight || 1;

					return (
						<div
							key={factor.factorName}
							className="border rounded-lg overflow-hidden shadow-sm bg-card border-border"
						>
							{/* Factor header */}
							<div className="bg-primary px-4 py-3 flex justify-between items-center">
								<span className="font-bold text-base text-primary-foreground tracking-wider">
									{factor.factorName.toLowerCase() === "personal" ? factor.factorName : factor.areaName}
								</span>
							</div>

							{/* Column table */}
							<Table>
								<TableHeader>
									<TableRow className="bg-primary/90">
										<TableHead className="w-8 h-9 text-xs text-primary-foreground font-bold uppercase tracking-wide">
											#
										</TableHead>
										<TableHead className="h-9 text-xs text-primary-foreground font-bold uppercase tracking-wide">
											Commodity
										</TableHead>
										<TableHead
											className="text-right h-9 text-xs w-[52px] text-primary-foreground font-bold uppercase tracking-wide"
											title="Weight"
										>
											Wt
										</TableHead>
										<TableHead
											className="text-right h-9 text-xs w-[52px] text-primary-foreground font-bold uppercase tracking-wide"
											title="Percentage Weight"
										>
											%Wt
										</TableHead>
										<TableHead
											className="text-right h-9 text-xs w-[52px] text-primary-foreground font-bold uppercase tracking-wide"
											title="Inflation Rate"
										>
											Rate
										</TableHead>
										<TableHead
											className="text-right h-9 text-xs w-[52px] text-primary-foreground font-bold uppercase tracking-wide"
											title="Percentage Share to Inflation"
										>
											%Shr
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{factor.contributors.map((c, i) => {
										const isAllItems = c.code === "0";
										const pctWeight = isAllItems ? 100 : (c.weight / totalWeight) * 100;
										return (
											<TableRow
												key={c.code}
												className={isAllItems ? "bg-primary/8 border-b-2 border-primary/20" : ""}
											>
												<TableCell
													className={`text-center py-2 h-auto text-xs ${
														isAllItems
															? "font-bold text-primary"
															: "font-medium text-muted-foreground"
													}`}
												>
													{isAllItems ? "—" : i}
												</TableCell>
												<TableCell
													className={`py-2 h-auto text-xs max-w-[130px] ${
														isAllItems ? "font-bold" : "font-medium"
													}`}
												>
													<div className="line-clamp-2" title={c.name}>
														{c.name}
													</div>
												</TableCell>
												<TableCell className="text-right py-2 h-auto text-xs tabular-nums font-mono text-muted-foreground">
													{c.weight.toFixed(1)}
												</TableCell>
												<TableCell className="text-right py-2 h-auto text-xs tabular-nums font-mono text-muted-foreground">
													{pctWeight.toFixed(1)}
												</TableCell>
												<TableCell className="text-right py-2 h-auto text-xs tabular-nums font-mono text-muted-foreground">
													{c.inflationRate.toFixed(1)}
												</TableCell>
												<TableCell className="text-right py-2 h-auto text-xs tabular-nums font-mono font-semibold">
													{c.percentShare.toFixed(1)}
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					);
				})}
			</div>
		);
	}

	return (
		<div className="border rounded-lg overflow-hidden shadow-sm bg-card border-border">
			<div className="overflow-x-auto">
				<table className="w-full text-sm border-collapse">
					<thead>
						{/* Row 1: Factor group names */}
						<tr>
							<th className="p-2 border-r border-primary-foreground/20 sticky left-0 bg-primary z-10 w-12" />
							{contributors.map((f, i) => (
								<th
									key={f.factorName}
									colSpan={5}
									className={`p-3 border-r border-primary-foreground/20 last:border-r-0 text-center min-w-[300px] ${i % 2 === 0 ? "bg-primary/90" : "bg-primary/75"}`}
								>
									<div className="font-bold tracking-wider text-white flex items-center justify-center gap-2">
										<span className="text-base">
											{f.factorName.toLowerCase() === "personal" ? f.factorName : f.areaName}
										</span>
									</div>
								</th>
							))}
						</tr>

						{/* Row 2: Column sub-headers */}
						<tr className="border-b border-primary-foreground/20">
							<th className="p-2 border-r border-primary-foreground/20 sticky left-0 bg-primary z-10 text-center text-xs uppercase font-bold text-white w-12">
								Rank
							</th>
							{contributors.map((f, i) => (
								<React.Fragment key={f.factorName}>
									<th
										className={`p-2 text-left font-semibold text-xs uppercase text-white border-r border-primary-foreground/20 border-t ${i % 2 === 0 ? "bg-primary/90" : "bg-primary/75"}`}
									>
										Commodity Group
									</th>
									<th
										className={`p-2 text-center font-semibold text-xs uppercase text-white border-r border-primary-foreground/20 border-t ${i % 2 === 0 ? "bg-primary/90" : "bg-primary/75"}`}
										title="Weight"
									>
										Weight
									</th>
									<th
										className={`p-2 text-center font-semibold text-xs uppercase text-white border-r border-primary-foreground/20 border-t ${i % 2 === 0 ? "bg-primary/90" : "bg-primary/75"}`}
										title="Percentage Weight"
									>
										% Weight
									</th>
									<th
										className={`p-2 text-center font-semibold text-xs uppercase text-white border-r border-primary-foreground/20 border-t ${i % 2 === 0 ? "bg-primary/90" : "bg-primary/75"}`}
										title="Inflation Rate"
									>
										Inflation Rate
									</th>
									<th
										className={`p-2 text-center font-semibold text-xs uppercase text-white border-r border-primary-foreground/20 border-t ${i % 2 === 0 ? "bg-primary/90" : "bg-primary/75"}`}
										title="Percentage Share to Inflation"
									>
										% Share to Inflation
									</th>
								</React.Fragment>
							))}
						</tr>
					</thead>

					<tbody>
						{Array.from({ length: maxRows }, (_, rankIndex) => {
							const isAllItems = rankIndex === 0;

							return (
								<tr
									key={rankIndex}
									className={`border-b border-border last:border-b-0 transition-colors ${
										isAllItems ? "bg-primary/5 font-semibold" : "hover:bg-muted/50"
									}`}
								>
									{/* Rank cell */}
									<td
										className={`p-3 border-r border-border text-center font-bold sticky left-0 z-10 ${
											isAllItems ? "bg-primary/5 text-primary" : "bg-card text-muted-foreground"
										}`}
									>
										{isAllItems ? "—" : rankIndex}
									</td>

									{/* Contributor cells per factor */}
									{contributors.map((f) => {
										const c = f.contributors[rankIndex];
										if (!c)
											return (
												<td
													key={f.factorName + "empty"}
													colSpan={5}
													className="border-r border-border last:border-r-0 bg-muted/20"
												/>
											);

										const totalWeight = f.contributors[0]?.weight || 1;
										const pctWeight = isAllItems ? 100 : (c.weight / totalWeight) * 100;

										return (
											<React.Fragment key={f.factorName}>
												<td
													className={`p-2 border-r border-border text-sm max-w-[200px] ${
														isAllItems ? "font-bold" : ""
													}`}
												>
													<div className="line-clamp-2 pl-1" title={c.name}>
														{c.name}
													</div>
												</td>
												<td className="p-2 border-r border-border text-sm text-right font-mono tabular-nums text-muted-foreground">
													{c.weight.toFixed(1)}
												</td>
												<td className="p-2 border-r border-border text-sm text-right font-mono tabular-nums text-muted-foreground">
													{pctWeight.toFixed(1)}
												</td>
												<td className="p-2 border-r border-border text-sm text-right font-mono tabular-nums text-muted-foreground">
													{c.inflationRate.toFixed(1)}
												</td>
												<td className="p-2 border-r border-border last:border-r-0 text-sm text-right font-mono tabular-nums font-semibold">
													{c.percentShare.toFixed(1)}
												</td>
											</React.Fragment>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
