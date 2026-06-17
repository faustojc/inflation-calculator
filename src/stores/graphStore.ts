import { observable } from "@legendapp/state";
import type { ContributionFactor } from "@/utils/inflationCompute";

export type CompareModeType = "all" | "area" | "province" | "region" | "national";
export type TrendType = "inflation" | "cpi";

export const trendType = observable<TrendType>("inflation");
export const compareMode = observable<CompareModeType>("all");
export const compareOfficial = observable<ContributionFactor | undefined>(undefined);
export const activeSlice = observable<string | null>(null);

export const sliceId = (code: string, value: number) => {
	const rounded = Math.abs(value).toFixed(4);
	return value > 0 ? `p-${code}-${rounded}` : `n-${code}-${rounded}`;
};

export function setCompareOfficial(official: ContributionFactor | undefined) {
	compareOfficial.set(official);
}

export function setCompareMode(mode: CompareModeType) {
	compareMode.set(mode);
}
