import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import type { SearchOption } from "@/lib/types";
import { dataStore } from "@/stores/dataStore";
import { locateCategory } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";
import { LucideNavigation, Search, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function SmartSearch() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const { searchOptions, isReady } = useStore(dataStore);

	const isMobile = useIsMobile();

	const filteredOptions = useMemo(() => {
		if (!isReady || !query) return [];

		const lowerQuery = query.toLowerCase();

		return searchOptions
			.map((item) => {
				const nameMatch = item.name.toLowerCase().includes(lowerQuery);
				const matchedKeyword = item.keywords.find((k) => k.toLowerCase().includes(lowerQuery));
				return { ...item, isKeywordMatch: !!matchedKeyword && !nameMatch, matchedKeyword };
			})
			.filter((item) => item.name.toLowerCase().includes(lowerQuery) || item.code.includes(lowerQuery) || item.matchedKeyword !== undefined)
			.slice(0, 20);
	}, [query, searchOptions, isReady]);

	const handleSelect = (item: SearchOption) => {
		locateCategory(item.code, item.name);
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
		<div className="sticky top-18 sm:top-[85px] z-30 transition-all duration-300" id="smart-search-container">
			<Popover open={open} onOpenChange={setOpen} modal={true}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						id="smart-search"
						aria-expanded={open}
						className="w-full justify-between text-left font-normal h-14 px-4 bg-white/95 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/50 hover:bg-white shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all rounded-xl group"
					>
						<span className="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors text-base overflow-hidden">
							<div className="bg-primary/10 p-1.5 rounded-md group-hover:bg-primary group-hover:text-white transition-all">
								<Search className="h-5 w-5" />
							</div>
							<span className="text-sm sm:text-base truncate">{query || "Search for items (e.g. Rice, Electricity, Meat)..."}</span>
						</span>
						{!isMobile && (
							<div className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-mono text-muted-foreground group-hover:text-primary">
								Ctrl K
							</div>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
					<Command shouldFilter={false}>
						<CommandInput placeholder="Type to search..." value={query} onValueChange={setQuery} />
						<CommandList>
							{filteredOptions.length === 0 && query && (
								<CommandEmpty className="py-6 text-center text-sm text-muted-foreground">No items found. Try a broader term.</CommandEmpty>
							)}
							<CommandGroup>
								{filteredOptions.map((item) => (
									<CommandItem key={item.code} value={item.name} onSelect={() => handleSelect(item)}>
										<LucideNavigation className="ml-4 h-4 w-4 text-blue-600 opacity-60" />
										<div className="flex-1 flex flex-col gap-0.5">
											<div className="flex items-center gap-2">
												<span className="font-medium">{item.name}</span>
												{item.isKeywordMatch && (
													<Badge variant="secondary" className="px-1.5 gap-1 text-blue-600 bg-blue-50 hover:bg-blue-100">
														<Tag className="h-3 w-3" />
														{item.matchedKeyword}
													</Badge>
												)}
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
