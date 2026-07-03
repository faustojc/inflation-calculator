import { LucideNavigation, Search, Tag } from "lucide-solid";
import { createEffect, createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/Command";
import HighlightedText from "@/components/HighlightedText";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { type FuzzyMatch, fuzzyScore } from "@/lib/fuzzySearch";
import type { SearchOption } from "@/lib/types";
import { dataStore } from "@/stores/dataStore";
import { activeTab, locateCategory, missingDataItems } from "@/stores/inflationStore";

interface ScoredOption {
	item: SearchOption;
	match: FuzzyMatch;
}

export function SmartSearch() {
	const [open, setOpen] = createSignal(false);
	const [query, setQuery] = createSignal("");
	const [debouncedQuery, setDebouncedQuery] = createSignal("");

	const isMobile = useIsMobile();
	const scrollDirection = useScrollDirection({ enabled: isMobile });
	const headerHidden = () => isMobile() && scrollDirection() === "down";

	createEffect(() => {
		const nextQuery = query();
		const timer = setTimeout(() => setDebouncedQuery(nextQuery), 50);
		onCleanup(() => clearTimeout(timer));
	});

	const generalNameMap = createMemo(() => {
		const map = new Map<string, string>();
		for (const c of dataStore.commodities.get()) {
			if (!c.code.includes(".")) map.set(c.code, c.name);
		}
		return map;
	});

	const filteredOptions = createMemo(() => {
		const isReady = dataStore.isReady.get();
		const currentQuery = debouncedQuery();
		if (!isReady || !currentQuery || currentQuery.length < 2) return [];

		const lowerQuery = currentQuery.toLowerCase().trim();
		if (!lowerQuery) return [];

		const scored: ScoredOption[] = [];
		const searchOptions = dataStore.searchOptions.get();
		const missing = missingDataItems.get();
		const currTab = activeTab.get();

		for (const item of searchOptions) {
			const currCode =
				currTab === "general" && item.code.includes(".") ? item.code.split(".")[0]! : item.code;

			if (missing.has(currCode)) continue;

			const effectiveName =
				currTab === "general" ? (generalNameMap().get(currCode) ?? item.commodityName) : item.commodityName;

			const effectiveItem: SearchOption = { ...item, code: currCode, commodityName: effectiveName };

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

	onMount(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.key === "k") {
				e.preventDefault();
				setOpen(true);
				setQuery("");
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		onCleanup(() => document.removeEventListener("keydown", handleKeyDown));
	});

	return (
		<div
			class={`sticky z-30 transition-[top] duration-300 ease-in-out motion-reduce:transition-none ${
				isMobile() && headerHidden() ? "top-0" : "top-18 sm:top-25"
			}`}
			id="smart-search-container"
		>
			<Popover open={open()} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						id="smart-search"
						type="button"
						role="combobox"
						aria-expanded={open()}
						class="btn btn-ghost w-full flex justify-between font-normal bg-card h-14 px-4 border-2 border-primary/30 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all rounded-xl group"
					>
						<span class="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors text-base overflow-hidden">
							<div class="bg-primary/10 p-1.5 rounded-md group-hover:bg-primary group-hover:text-white transition-all">
								<Search class="h-5 w-5" />
							</div>
							<span class="text-sm sm:text-base truncate">
								{query() || "Search items (e.g. Rice, Electricity, Gasoline)..."}
							</span>
						</span>
						<Show when={!isMobile()}>
							<div class="bg-primary px-2 py-0.5 rounded text-xs font-mono text-primary-foreground">
								Ctrl K
							</div>
						</Show>
					</button>
				</PopoverTrigger>
				<PopoverContent
					class="w-auto min-w-(--popover-trigger-width) max-w-[calc(100vw-16px)] p-0"
					align="start"
				>
					<Command shouldFilter={false}>
						<CommandInput placeholder="Type to search items..." value={query()} onValueChange={setQuery} />
						<CommandList>
							<Show when={filteredOptions().length === 0 && query().length >= 2}>
								<CommandEmpty class="py-6 text-center text-sm text-muted-foreground">
									No items found. Try a broader term.
								</CommandEmpty>
							</Show>
							<CommandGroup>
								<For each={filteredOptions()}>
									{({ item, match }) => (
										<CommandItem value={item.keyword} onSelect={() => handleSelect(item)}>
											<LucideNavigation class="ml-4 h-4 w-4 text-primary opacity-60 shrink-0" />
											<div class="flex-1 flex flex-col gap-0.5 min-w-0">
												<div class="flex items-center gap-2 flex-wrap">
													<span class="font-medium truncate">
														<HighlightedText text={item.keyword} ranges={match.ranges} />
													</span>
												</div>
												<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
													<span class="badge badge-outline px-1.5 gap-1 text-xs font-mono h-5 shrink-0">
														{item.code}
													</span>
													<span class="truncate flex items-center gap-1">
														<Tag class="h-3 w-3 shrink-0 opacity-50" />
														{item.commodityName}
													</span>
												</div>
											</div>
										</CommandItem>
									)}
								</For>
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
