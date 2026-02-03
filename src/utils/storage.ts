export const CACHE_NAME = "inflation-data-v1";

type CacheStrategy = "cache-first" | "network-first";

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
