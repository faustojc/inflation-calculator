import HighlightedText from "@/components/HighlightedText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { fuzzyScore, type FuzzyMatch } from "@/lib/fuzzySearch";
import type { SearchOption } from "@/lib/types";
import { dataStore } from "@/stores/dataStore";
import { activeTab, locateCategory, missingDataItems } from "@/stores/inflationStore";
import { useValue } from "@legendapp/state/react";
import { LucideNavigation, Search, Tag } from "lucide-react";
import { useEffect, useState } from "react";

interface ScoredOption {
	item: SearchOption;
	match: FuzzyMatch;
}

export function SmartSearch() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");

	const isMobile = useIsMobile();
	const scrollDirection = useScrollDirection({ enabled: isMobile });
	const headerHidden = isMobile && scrollDirection === "down";

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(query), 50);
		return () => clearTimeout(timer);
	}, [query]);

	// Map general code → name for tab-aware display
	const generalNameMap = useValue(() => {
		const map = new Map<string, string>();
		for (const c of dataStore.commodities.get()) {
			if (!c.code.includes(".")) map.set(c.code, c.name);
		}
		return map;
	});

	const filteredOptions = useValue(() => {
		const isReady = dataStore.isReady.get();
		if (!isReady || !debouncedQuery || debouncedQuery.length < 2) return [];

		const lowerQuery = debouncedQuery.toLowerCase().trim();
		if (!lowerQuery) return [];

		const scored: ScoredOption[] = [];
		const searchOptions = dataStore.searchOptions.get();
		const missing = missingDataItems.get();
		const currTab = activeTab.get();

		for (const item of searchOptions) {
			const currCode = currTab === "general" && item.code.includes(".") ? item.code.split(".")[0]! : item.code;

			// Skip items whose effective code has no CPI data for this tab
			if (missing.has(currCode)) continue;

			const effectiveName =
				currTab === "general" ? (generalNameMap.get(currCode) ?? item.commodityName) : item.commodityName;

			const effectiveItem: SearchOption = { ...item, code: currCode, commodityName: effectiveName };

			// Score against keyword text
			const match = fuzzyScore(item.keywordLower, lowerQuery);
			if (match.score > 0) {
				scored.push({ item: effectiveItem, match });

				if (scored.length >= 50) break;
				continue;
			}

			if (item.code.startsWith(lowerQuery) || currCode.startsWith(lowerQuery)) {
				scored.push({ item: effectiveItem, match: { score: 300, ranges: [] } });
			}
		}

		// Sort by score descending, then alphabetically by keyword for ties
		scored.sort((a, b) => {
			if (b.match.score !== a.match.score) return b.match.score - a.match.score;
			return a.item.keyword.localeCompare(b.item.keyword);
		});

		const seen = new Set<string>();
		const deduped = scored.filter(({ item }) => {
			const key = `${item.code}|${item.keyword}`;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});

		return deduped.slice(0, 25);
	});

	const handleSelect = (item: SearchOption) => {
		locateCategory(item.code, item.keyword);
		setOpen(false);
		setQuery("");
	};

	// listen for CTRL+K to focus on input of #smart-search
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.key === "k") {
				e.preventDefault();
				setOpen(true);
				setQuery("");
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<div
			className="sticky top-18 sm:top-25 z-30 transition-[top] duration-300 ease-in-out motion-reduce:transition-none"
			style={isMobile ? { top: headerHidden ? 0 : undefined } : undefined}
			id="smart-search-container"
		>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						id="smart-search"
						aria-expanded={open}
						className="w-full justify-between text-left font-normal h-14 px-4 bg-card/95 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/50 hover:bg-card shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all rounded-xl group"
					>
						<span className="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors text-base overflow-hidden">
							<div className="bg-primary/10 p-1.5 rounded-md group-hover:bg-primary group-hover:text-white transition-all">
								<Search className="h-5 w-5" />
							</div>
							<span className="text-sm sm:text-base truncate">
								{query || "Search items (e.g. Rice, Electricity, Gasoline)..."}
							</span>
						</span>
						{!isMobile && (
							<div className="bg-muted px-2 py-0.5 rounded text-xs font-mono text-foreground group-hover:text-primary">
								Ctrl K
							</div>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
					<Command shouldFilter={true}>
						<CommandInput placeholder="Type to search items..." value={query} onValueChange={setQuery} />
						<CommandList>
							{filteredOptions.length === 0 && query.length >= 2 && (
								<CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
									No items found. Try a broader term.
								</CommandEmpty>
							)}
							<CommandGroup>
								{filteredOptions.map(({ item, match }) => (
									<CommandItem
										key={`${item.code}|${item.keyword}`}
										value={item.keyword}
										onSelect={() => handleSelect(item)}
									>
										<LucideNavigation className="ml-4 h-4 w-4 text-primary opacity-60 shrink-0" />
										<div className="flex-1 flex flex-col gap-0.5 min-w-0">
											<div className="flex items-center gap-2 flex-wrap">
												<span className="font-medium truncate">
													<HighlightedText text={item.keyword} ranges={match.ranges} />
												</span>
											</div>
											<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
												<Badge variant="outline" className="px-1.5 gap-1 text-xs font-mono h-5 shrink-0">
													{item.code}
												</Badge>
												<span className="truncate flex items-center gap-1">
													<Tag className="h-3 w-3 shrink-0 opacity-50" />
													{item.commodityName}
												</span>
											</div>
										</div>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
