import { ChevronDown, ChevronUp } from "lucide-solid";
import { createSignal, For, Index, Show } from "solid-js";
import { Button } from "@/components/primitives/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/primitives/table";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ContributionFactor } from "@/utils/inflationCompute";

interface Props {
	personal: ContributionFactor;
	official: ContributionFactor;
}

export function ContributorTable(props: Props) {
	const isMobile = useIsMobile();
	const [isExpanded, setIsExpanded] = createSignal(false);

	const visibleContributors = () => [props.personal, props.official];

	const maxRows = () => Math.max(...visibleContributors().map((f) => f.contributors.length));
	const displayRows = () => (isExpanded() ? maxRows() : Math.min(maxRows(), 4));
	const canExpand = () => maxRows() > 4;

	const ExpandButtonLabel = () => (
		<Show
			when={isExpanded()}
			fallback={
				<>
					<ChevronDown class="w-4 h-4 mr-2 text-muted-foreground" />
					See More Contributors
				</>
			}
		>
			<ChevronUp class="w-4 h-4 mr-2 text-muted-foreground" />
			Show Less
		</Show>
	);

	return (
		<Show
			when={!isMobile()}
			fallback={
				<div class="space-y-4">
					<div class="space-y-6">
						<For each={visibleContributors()}>
							{(factor) => {
								const totalWeight = () => factor.contributors[0]?.weight || 1;

								return (
									<div class="border rounded-lg overflow-hidden shadow-sm bg-card border-border">
										{/* Factor header */}
										<div class="bg-primary px-4 py-3 flex justify-between items-center">
											<span class="font-bold text-base text-white tracking-wider">
												{factor.factorName.toLowerCase() === "personal" ? factor.factorName : factor.areaName}
											</span>
										</div>

										{/* Column table */}
										<Table>
											<TableHeader>
												<TableRow class="bg-primary/90">
													<TableHead class="w-8 h-9 text-xs text-white font-bold uppercase tracking-wide">
														#
													</TableHead>
													<TableHead class="h-9 text-xs text-white font-bold uppercase tracking-wide">
														Commodity
													</TableHead>
													<TableHead
														class="text-center h-9 text-xs text-white whitespace-nowrap font-bold uppercase tracking-wide"
														title="Percentage Weight"
													>
														Weight (in percent)
													</TableHead>
													<TableHead
														class="text-center h-9 text-xs text-white whitespace-nowrap font-bold uppercase tracking-wide"
														title="Inflation Rate"
													>
														Inflation Rate
													</TableHead>
													<TableHead
														class="text-center h-9 text-xs text-white whitespace-nowrap font-bold uppercase tracking-wide"
														title="Percentage Share to Inflation"
													>
														%Share Inflation
													</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												<For each={factor.contributors.slice(0, displayRows())}>
													{(c, i) => {
														const isAllItems = c.code === "0";
														const pctWeight = isAllItems ? 100 : (c.weight / totalWeight()) * 100;
														return (
															<TableRow class={isAllItems ? "bg-primary/8 border-b-2 border-primary/20" : ""}>
																<TableCell
																	class={`text-center py-2 h-auto text-xs ${
																		isAllItems
																			? "font-bold text-primary"
																			: "font-medium text-muted-foreground"
																	}`}
																>
																	{isAllItems ? "—" : i()}
																</TableCell>
																<TableCell
																	class={`py-2 h-auto text-xs max-w-95 ${isAllItems ? "font-bold" : "font-medium"}`}
																>
																	<div class="line-clamp-2" title={c.name}>
																		{c.name}
																	</div>
																</TableCell>
																<TableCell class="text-center py-2 h-auto text-xs tabular-nums font-mono text-muted-foreground">
																	{pctWeight.toFixed(1)}
																</TableCell>
																<TableCell class="text-center py-2 h-auto text-xs tabular-nums font-mono text-muted-foreground">
																	{c.inflationRate.toFixed(1)}
																</TableCell>
																<TableCell class="text-center py-2 h-auto text-xs tabular-nums font-mono font-semibold">
																	{c.percentShare.toFixed(1)}
																</TableCell>
															</TableRow>
														);
													}}
												</For>
											</TableBody>
										</Table>
									</div>
								);
							}}
						</For>
					</div>

					<Show when={canExpand()}>
						<div class="flex justify-center py-2">
							<Button
								variant="outline"
								onClick={() => setIsExpanded(!isExpanded())}
								class="bg-card w-full max-w-sm rounded-full shadow-sm hover:shadow-md transition-shadow font-medium"
							>
								<ExpandButtonLabel />
							</Button>
						</div>
					</Show>
				</div>
			}
		>
			<div class="space-y-4">
				<div class="border rounded-lg overflow-hidden shadow-sm bg-card border-border">
					<div class="overflow-x-auto">
						<table class="w-full text-sm border-collapse">
							<thead>
								{/* Row 1: Factor group names */}
								<tr>
									<th class="p-2 border-r border-primary-foreground/20 sticky left-0 bg-primary z-10 w-12" />
									<For each={visibleContributors()}>
										{(f, i) => (
											<th
												colSpan={4}
												class={`p-3 border-r border-primary-foreground/20 last:border-r-0 text-center min-w-75 ${i() % 2 === 0 ? "bg-primary/90" : "bg-primary/75"}`}
											>
												<div class="font-bold tracking-wider text-white flex items-center justify-center gap-2">
													<span class="text-base">
														{f.factorName.toLowerCase() === "personal" ? f.factorName : f.areaName}
													</span>
												</div>
											</th>
										)}
									</For>
								</tr>

								{/* Row 2: Column sub-headers */}
								<tr class="border-b border-primary-foreground/20">
									<th class="p-2 border-r border-primary-foreground/20 sticky left-0 bg-primary z-10 text-center text-xs uppercase font-bold text-white w-12">
										Rank
									</th>
									<For each={visibleContributors()}>
										{(_, i) => (
											<>
												<th
													class={`p-2 text-left font-semibold text-xs uppercase text-white border-r border-primary-foreground/20 border-t ${i() % 2 === 0 ? "bg-primary/90" : "bg-primary/75"}`}
												>
													Commodity Group
												</th>
												<th
													class={`p-2 text-center font-semibold text-xs uppercase text-white border-r border-primary-foreground/20 border-t ${i() % 2 === 0 ? "bg-primary/90" : "bg-primary/75"}`}
													title="Percentage Weight"
												>
													Weight <br /> (in percent)
												</th>
												<th
													class={`p-2 text-center font-semibold text-xs uppercase text-white border-r border-primary-foreground/20 border-t ${i() % 2 === 0 ? "bg-primary/90" : "bg-primary/75"}`}
													title="Inflation Rate"
												>
													Inflation Rate
												</th>
												<th
													class={`p-2 text-center font-semibold text-xs uppercase text-white border-r border-primary-foreground/20 border-t ${i() % 2 === 0 ? "bg-primary/90" : "bg-primary/75"}`}
													title="Percentage Share to Inflation"
												>
													% Share to Inflation
												</th>
											</>
										)}
									</For>
								</tr>
							</thead>

							<tbody>
								<Index each={Array.from({ length: displayRows() })}>
									{(_, rankIndex) => {
										const isAllItems = rankIndex === 0;

										return (
											<tr
												class={`border-b border-border last:border-b-0 transition-colors ${
													isAllItems ? "bg-primary/5 font-semibold" : "hover:bg-muted/50"
												}`}
											>
												{/* Rank cell */}
												<td
													class={`p-3 border-r border-border text-center font-bold sticky left-0 z-10 ${
														isAllItems ? "bg-blue-700 text-white" : "bg-card text-muted-foreground"
													}`}
												>
													{isAllItems ? "—" : rankIndex}
												</td>

												{/* Contributor cells per factor */}
												<For each={visibleContributors()}>
													{(f) => {
														const c = f.contributors[rankIndex];
														if (!c)
															return (
																<td colSpan={4} class="border-r border-border last:border-r-0 bg-muted/20" />
															);

														const totalWeight = f.contributors[0]?.weight || 1;
														const pctWeight = isAllItems ? 100 : (c.weight / totalWeight) * 100;

														return (
															<>
																<td
																	class={`p-2 border-r border-border text-sm min-w-45 ${
																		isAllItems ? "font-bold" : ""
																	}`}
																>
																	<div class="line-clamp-2 pl-1" title={c.name}>
																		{c.name}
																	</div>
																</td>
																<td class="p-2 border-r border-border text-sm text-right font-mono tabular-nums text-muted-foreground">
																	{pctWeight.toFixed(1)}
																</td>
																<td class="p-2 border-r border-border text-sm text-right font-mono tabular-nums text-muted-foreground">
																	{c.inflationRate.toFixed(1)}
																</td>
																<td class="p-2 border-r border-border last:border-r-0 text-sm text-right font-mono tabular-nums font-semibold">
																	{c.percentShare.toFixed(1)}
																</td>
															</>
														);
													}}
												</For>
											</tr>
										);
									}}
								</Index>
							</tbody>
						</table>
					</div>

					<Show when={canExpand()}>
						<div class="flex justify-center p-3 border-t border-border bg-muted/5 relative">
							<Button
								variant="outline"
								onClick={() => setIsExpanded(!isExpanded())}
								class="bg-card w-64 rounded-full shadow-sm hover:shadow-md transition-shadow font-medium"
							>
								<ExpandButtonLabel />
							</Button>
						</div>
					</Show>
				</div>
			</div>
		</Show>
	);
}
