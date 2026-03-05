import { clearGlobalIndex, MANIFEST_CACHE, WEIGHTS_CACHE } from "@/utils/metadata";

export const CACHE_NAME = "inflation-data-v2";
const CACHE_VERSION_KEY = "inflation-cache-version";

type CacheStrategy = "cache-first" | "network-first";

/**
 * Checks if the upstream data has changed by comparing the `generated_at`
 * field from the freshly fetched metadata against the locally stored version.
 *
 * If the version differs (e.g. new data published, correction uploaded),
 * all Cache Storage entries and in-memory caches are purged so the app
 * re-fetches the latest CPI data on next access.
 *
 * @param generatedAt - The `generated_at` value from the latest metadata.json.
 * @returns `true` if the cache was invalidated, `false` otherwise.
 */
export async function invalidateIfDataChanged(generatedAt: string): Promise<boolean> {
	const storedVersion = localStorage.getItem(CACHE_VERSION_KEY);

	if (storedVersion && storedVersion !== generatedAt) {
		console.info(`[Cache] Data version changed (${storedVersion} → ${generatedAt}). Purging stale CPI cache.`);

		await clearDataCache();

		clearGlobalIndex();
		MANIFEST_CACHE.clear();
		WEIGHTS_CACHE.clear();

		localStorage.setItem(CACHE_VERSION_KEY, generatedAt);
		return true;
	}

	localStorage.setItem(CACHE_VERSION_KEY, generatedAt);
	return false;
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
