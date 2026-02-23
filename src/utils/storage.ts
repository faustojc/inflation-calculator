import { FILE_CACHE, MANIFEST_CACHE, WEIGHTS_CACHE } from "@/utils/metadata";

export const CACHE_NAME = "inflation-data-v1";
const CACHE_TIMESTAMP_KEY = "inflation-cache-month";

type CacheStrategy = "cache-first" | "network-first";

/**
 * Returns a "YYYY-MM" string for the given date, representing the cache epoch.
 * Cache is considered stale when this value changes (i.e., a new month begins).
 */
function getCurrentCacheEpoch(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	return `${year}-${month}`;
}

/**
 * Checks if the cached data belongs to a previous month and, if so,
 * purges both the Cache Storage and in-memory caches so that the app
 * re-fetches the latest CPI data from the CDN.
 */
export async function invalidateStaleCacheOnMonthChange(): Promise<void> {
	const currentEpoch = getCurrentCacheEpoch();
	const storedEpoch = localStorage.getItem(CACHE_TIMESTAMP_KEY);

	if (storedEpoch && storedEpoch !== currentEpoch) {
		console.info(
			`[Cache] Month changed (${storedEpoch} → ${currentEpoch}). Clearing stale CPI cache.`,
		);

		await clearDataCache();

		FILE_CACHE.clear();
		MANIFEST_CACHE.clear();
		WEIGHTS_CACHE.clear();
	}

	localStorage.setItem(CACHE_TIMESTAMP_KEY, currentEpoch);
}

/**
 * Fetches a resource using the specified caching strategy.
 *
 * @param url - The URL to fetch.
 * @param strategy - 'cache-first' (optimal for immutable data) or 'network-first' (optimal for frequently changing data).
 * @returns The Response object (from cache or network).
 */
export async function fetchWithCache(url: string, strategy: CacheStrategy = "cache-first"): Promise<Response> {
	if (!("caches" in globalThis)) {
		return fetch(url);
	}

	const cache = await caches.open(CACHE_NAME);

	if (strategy === "cache-first") {
		return fetchCacheFirst(url, cache);
	} else {
		return fetchNetworkFirst(url, cache);
	}
}

async function fetchCacheFirst(url: string, cache: Cache): Promise<Response> {
	const cachedResponse = await cache.match(url);
	if (cachedResponse) {
		return cachedResponse;
	}

	const networkResponse = await fetch(url);
	if (networkResponse.ok) {
		cache.put(url, networkResponse.clone());
	}
	return networkResponse;
}

async function fetchNetworkFirst(url: string, cache: Cache): Promise<Response> {
	try {
		const networkResponse = await fetch(url);
		if (networkResponse.ok) {
			cache.put(url, networkResponse.clone());
		}
		return networkResponse;
	} catch (error) {
		const cachedResponse = await cache.match(url);
		if (cachedResponse) {
			return cachedResponse;
		}
		throw error;
	}
}

/**
 * Clears the application data cache.
 */
export async function clearDataCache() {
	if ("caches" in globalThis) {
		await caches.delete(CACHE_NAME);
	}
}
