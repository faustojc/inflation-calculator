import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { dataStore, getDisplayLabel, type SearchOption } from "@/stores/dataStore";
import { useStore } from "@nanostores/react";
import { ArrowRightCircle, Check, ChevronsUpDown, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface SmartSearchProps {
	onSelect: (item: { categoryCode: string; name: string }) => void;
}

export function SmartSearch({ onSelect }: Readonly<SmartSearchProps>) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const { searchOptions, isReady } = useStore(dataStore);

	const filteredOptions = useMemo(() => {
		if (!isReady || !query) return [];

		const lowerQuery = query.toLowerCase();
		return searchOptions.filter((item) => item.name.toLowerCase().includes(lowerQuery) || item.code.includes(lowerQuery)).slice(0, 30);
	}, [query, searchOptions, isReady]);

	const handleSelect = (item: SearchOption) => {
		onSelect({ categoryCode: item.code, name: item.name });
		setOpen(false);
		setQuery("");
	};

	return (
		<div className="w-full">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between text-left font-normal h-12 px-4">
						<span className="flex items-center gap-2 text-muted-foreground">
							<Search className="h-4 w-4" />
							{query || "Search specific items (e.g. Rice, Diesel, Tuition)..."}
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
										<div className="flex-1 flex flex-col">
											<span className="font-medium">{getDisplayLabel(item)}</span>
											<span className="text-[10px] text-muted-foreground font-mono">{item.code}</span>
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
