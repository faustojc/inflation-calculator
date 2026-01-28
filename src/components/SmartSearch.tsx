import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { SearchOption } from "@/lib/types";
import { dataStore } from "@/stores/dataStore";
import { locateCategory } from "@/stores/inflationStore";
import { useStore } from "@nanostores/react";
import { ArrowRightCircle, Check, ChevronsUpDown, Search, Tag } from "lucide-react";
import { useMemo, useState } from "react";

export function SmartSearch() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const { searchOptions, isReady } = useStore(dataStore);

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

	return (
		<div className="sticky top-30 z-10">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="w-full justify-between text-left font-normal h-12 px-4 border-blue-500"
					>
						<span className="flex items-center gap-2 text-muted-foreground">
							<Search className="h-4 w-4" />
							{query || "Click here to search..."}
						</span>
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
										<Check className="mr-2 h-4 w-4 opacity-0" />
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
											{/* <div className="flex items-center gap-2">
												<span className="text-[10px] text-muted-foreground font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">
													{item.code}
												</span>
											</div> */}
										</div>
										<ArrowRightCircle className="ml-2 h-4 w-4 text-blue-500 opacity-50" />
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
