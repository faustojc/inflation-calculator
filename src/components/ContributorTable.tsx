import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { type ContributionFactor } from "@/utils/inflationCompute";
import React from "react";

interface ContributorTableProps {
	contributors: ContributionFactor[];
}

export function ContributorTable({ contributors }: Readonly<ContributorTableProps>) {
	const isMobile = useIsMobile();

	if (!contributors || contributors.length === 0) return null;

	if (isMobile) {
		return (
			<div className="space-y-6">
				{contributors.map((factor) => (
					<div key={factor.factorName} className="border rounded-lg overflow-hidden shadow-sm bg-card border-border">
						<div className="bg-muted px-4 py-3 font-bold text-sm tracking-wider flex justify-between items-center border-b border-border">
							<div className="flex flex-col">
								{factor.factorName.toLowerCase() === "personal" && (
									<span className="font-bold text-base">{factor.factorName}</span>
								)}
								{factor.factorName.toLowerCase() !== "personal" && (
									<span className="font-bold text-base">{factor.areaName}</span>
								)}
							</div>
							<span className="bg-card px-2 py-1 rounded text-xs border font-mono">
								{factor.inflationRate.toFixed(1)}%
							</span>
						</div>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12 h-8 text-xs">RK</TableHead>
									<TableHead className="h-8 text-xs">Commodity</TableHead>
									<TableHead className="text-right h-8 text-xs w-16">%Shr</TableHead>
									<TableHead className="text-right h-8 text-xs w-16">%Pt</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{factor.contributors.map((c, i) => (
									<TableRow key={c.code}>
										<TableCell className="font-medium text-center py-2 h-auto text-xs">{i + 1}</TableCell>
										<TableCell className="py-2 h-auto text-xs font-medium max-w-[150px]">
											<div className="line-clamp-2" title={c.name}>
												{c.name}
											</div>
										</TableCell>
										<TableCell className="text-right py-2 h-auto text-xs tabular-nums">
											{c.percentShare.toFixed(1)}
										</TableCell>
										<TableCell className="text-right py-2 h-auto text-xs tabular-nums">
											{c.percentPointShare.toFixed(1)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="border rounded-lg overflow-hidden shadow-sm bg-card border-border">
			<div className="overflow-x-auto">
				<table className="w-full text-sm border-collapse">
					<thead>
						<tr className="border-b bg-muted">
							<th className="p-2 border-r border-border sticky left-0 bg-muted z-10 w-12"></th>
							{contributors.map((f) => (
								<th
									key={f.factorName}
									colSpan={3}
									className="p-3 border-r border-border last:border-r-0 text-center min-w-[240px]"
								>
									<div className="font-bold tracking-wider text-xs flex items-center justify-center gap-1">
										{f.factorName.toLowerCase() === "personal" && (
											<span className="font-bold text-base">{f.factorName}</span>
										)}
										{f.factorName.toLowerCase() !== "personal" && (
											<span className="font-bold text-base">{f.areaName}</span>
										)}
										<span className="bg-card border px-1.5 rounded text-sm font-mono leading-none py-0.5">
											{f.inflationRate.toFixed(1)}%
										</span>
									</div>
								</th>
							))}
						</tr>
						<tr className="border-b border-border bg-muted">
							<th className="p-2 border-r border-border sticky left-0 bg-muted z-10 text-center text-[10px] uppercase font-bold text-muted-foreground w-12">
								Rank
							</th>
							{contributors.map((f) => (
								<React.Fragment key={f.factorName}>
									<th className="p-2 text-left font-medium text-base sm:text-sm uppercase text-muted-foreground border-r border-border">
										Group
									</th>
									<th className="p-2 text-right font-medium text-base sm:text-sm uppercase text-muted-foreground border-r border-border w-16">
										%Shr
									</th>
									<th className="p-2 text-right font-medium text-base sm:text-sm uppercase text-muted-foreground border-r border-border last:border-r-0 w-16">
										%Pt
									</th>
								</React.Fragment>
							))}
						</tr>
					</thead>
					<tbody>
						{[0, 1, 2].map((rankIndex) => (
							<tr
								key={rankIndex}
								className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
							>
								<td className="p-3 border-r border-border text-center font-bold text-muted-foreground sticky left-0 bg-card z-10">
									{rankIndex + 1}
								</td>
								{contributors.map((f) => {
									const c = f.contributors[rankIndex];
									if (!c)
										return (
											<td
												key={f.factorName + "empty"}
												colSpan={3}
												className="border-r border-border last:border-r-0 bg-muted/20"
											/>
										);

									return (
										<React.Fragment key={f.factorName}>
											<td className="p-2 border-r border-border text-base sm:text-sm max-w-[200px]">
												<div className="line-clamp-2 pl-1" title={c.name}>
													{c.name}
												</div>
											</td>
											<td className="p-2 border-r border-border text-base sm:text-sm text-right font-mono tabular-nums text-muted-foreground">
												{c.percentShare.toFixed(1)}
											</td>
											<td className="p-2 border-r border-border last:border-r-0 text-base sm:text-sm text-right font-mono tabular-nums font-semibold">
												{c.percentPointShare.toFixed(1)}
											</td>
										</React.Fragment>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
