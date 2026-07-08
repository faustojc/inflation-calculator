import { Calculator, Loader } from "lucide-solid";
import { createSignal, Show } from "solid-js";
import { Button } from "@/components/Button";
import CalculationFooter from "@/components/CalculationFooter";
import { toast } from "@/components/Toast";
import { isOnline } from "@/stores/connectionStore";
import {
	chunkUrl,
	dataStore,
	getAreaHierarchy,
	getAreaManifest,
	getCalculationData,
	getWeights,
	setCurrentArea,
} from "@/stores/dataStore";
import {
	activeTab,
	calculationResult,
	detailedExpenses,
	generalExpenses,
	isCalculationDisabled,
	mode,
	settings,
	totalAllocation,
} from "@/stores/inflationStore";
import { chunksForRange } from "@/utils/chunks";
import { calculatePersonalInflation } from "@/utils/inflationCompute";
import { isCached } from "@/utils/storage";

const Footer = () => {
	const [isCalculating, setIsCalculating] = createSignal(false);

	const isDisabled = () => isCalculationDisabled.get();

	const handleCalculate = async () => {
		setIsCalculating(true);

		try {
			const { area, startDate, incomeClass } = settings.get();
			const currentMode = mode.get();
			const currentTotalAlloc = totalAllocation.get();
			const currentTab = activeTab.get();
			const items = Object.values(currentTab === "general" ? generalExpenses.get() : detailedExpenses.get());

			const targetYear = startDate.getFullYear();
			const targetMonth = startDate.getMonth() + 1;
			const baseYear = targetYear - 1;
			const baseMonth = targetMonth;

			const dates = {
				startYear: baseYear,
				startMonth: baseMonth,
				endYear: targetYear,
				endMonth: targetMonth,
			};

			const activeCodes = items.filter((i) => i.value > 0).map((i) => i.code);
			if (activeCodes.length === 0) throw new Error("No expenses entered.");

			const hierarchy = getAreaHierarchy(area.key);
			let { currentManifest } = dataStore.get();
			const dataType = currentTab === "general" ? "official" : "personal";

			let datesForType = currentManifest?.dates?.[dataType]?.[incomeClass];

			if (!datesForType && isOnline.get()) {
				await setCurrentArea(area.key);
				const refreshed = await getAreaManifest(area.key);
				if (refreshed) {
					currentManifest = refreshed;
					datesForType = currentManifest?.dates?.[dataType]?.[incomeClass];
				}
			}

			if (!datesForType) {
				const reason = !isOnline.get()
					? "You're offline and the CPI data for this area hasn't been saved locally."
					: `No ${dataType} CPI data available for this area and income class.`;
				toast.warning("Unable to calculate inflation", { description: reason });
				return;
			}

			const areaAvailableYears = Object.keys(datesForType).map(Number);

			if (areaAvailableYears.length > 0) {
				const missingYears: number[] = [];
				if (!areaAvailableYears.includes(targetYear)) missingYears.push(targetYear);
				if (!areaAvailableYears.includes(baseYear)) missingYears.push(baseYear);

				if (missingYears.length > 0) {
					toast.warning(`No CPI data for ${hierarchy.target.name}`, {
						description: `This area has no recorded data for ${missingYears.join(" and ")}. Please select a different year or area.`,
					});
					return;
				}
			}

			const uniqueKeys = new Set([
				hierarchy.target.key,
				hierarchy.province?.key,
				hierarchy.region?.key,
				hierarchy.national?.key,
			]);
			let keysToFetch = Array.from(uniqueKeys).filter(Boolean) as string[];

			// When offline, only include areas whose chunk data is cached
			if (!isOnline.get()) {
				const cachedKeys = await Promise.all(
					keysToFetch.map(async (key) => {
						// Manifest resolves from Cache Storage when offline; without it
						// we cannot know which chunks exist, so treat the area as uncached.
						const manifest = await getAreaManifest(key);
						const available = new Set(manifest?.chunks?.[incomeClass] ?? []);
						const needed = chunksForRange(dates.startYear - 1, dates.endYear).filter((c) =>
							available.has(c),
						);
						if (needed.length === 0) return null;

						const cached = await Promise.all(
							needed.map((c) => isCached(chunkUrl(key, incomeClass, c))),
						);
						return cached.every(Boolean) ? key : null;
					}),
				);
				keysToFetch = cachedKeys.filter(Boolean) as string[];

				if (!keysToFetch.includes(hierarchy.target.key)) {
					toast.warning("You're offline. Cannot fetch CPI data for the selected area.");
					return;
				}

				if (hierarchy.province && !keysToFetch.includes(hierarchy.province.key)) {
					hierarchy.province = undefined;
				}
				if (hierarchy.region && !keysToFetch.includes(hierarchy.region.key)) {
					hierarchy.region = undefined;
				}
				if (hierarchy.national && !keysToFetch.includes(hierarchy.national.key)) {
					hierarchy.national = undefined;
				}
				if (hierarchy.ncr && !keysToFetch.includes(hierarchy.ncr.key)) {
					hierarchy.ncr = undefined;
				}
			}

			const [batchMap, weightsMap] = await Promise.all([
				getCalculationData(keysToFetch, incomeClass, dates.startYear - 1, dates.endYear),
				getWeights(keysToFetch, incomeClass),
			]);

			const { commodities } = dataStore.get();
			const majorCategoryNames: Record<string, string> = {};
			commodities.forEach((c) => {
				majorCategoryNames[c.code] = c.name;
			});

			const result = calculatePersonalInflation(
				items,
				hierarchy,
				dates,
				{ mode: currentMode, totalInput: currentTotalAlloc },
				batchMap,
				weightsMap,
				majorCategoryNames,
				dataType,
			);

			if (result) {
				calculationResult.set({ show: true, data: result });
			} else {
				toast.error("Calculation failed. Please check inputs.");
			}
		} catch (err) {
			if (err instanceof TypeError && !isOnline.get()) {
				toast.error("Unable to calculate inflation", {
					description:
						"You're offline and the required CPI data is not cached. Please connect to the internet and try again.",
				});
			} else if (err instanceof Error) {
				toast.error(err.message || "Calculation failed.");
			} else {
				console.error(err);
				toast.error("Calculation failed.");
			}
		} finally {
			setIsCalculating(false);
		}
	};

	return (
		<footer class="sticky bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
			<div class="max-w-5xl mx-auto px-4 py-3">
				<CalculationFooter />
				<Button
					size="lg"
					id="calculate-btn"
					onClick={handleCalculate}
					disabled={isCalculating() || isDisabled()}
					class="text-white w-full text-sm uppercase font-bold h-11 bg-psa-gradient hover:opacity-90 shadow-lg shadow-primary/25 transition-all active:scale-[0.98] cursor-pointer gap-2"
				>
					<Show
						when={isCalculating()}
						fallback={
							<>
								<Calculator class="h-4 w-4" />
								Calculate Personal Inflation
							</>
						}
					>
						<Loader class="h-4 w-4 animate-spin" />
						Calculating...
					</Show>
				</Button>
			</div>
		</footer>
	);
};

export default Footer;
