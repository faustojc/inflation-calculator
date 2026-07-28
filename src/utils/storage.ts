import { clearGlobalIndex, MANIFEST_CACHE, WEIGHTS_CACHE } from "@/utils/metadata";

export const CACHE_NAME = "inflation-data-v3";
const LEGACY_CACHE_NAME = "inflation-data-v2";
const CACHE_VERSION_KEY = "inflation-cache-version";

if ("caches" in globalThis) {
	caches.delete(LEGACY_CACHE_NAME).catch(() => {});
}

const VISIT_SID = "visit_sid";
const VISIT_TABS = "visit_tabs";
const VISIT_TRACKED = "visit_tracked";

type CacheStrategy = "cache-first" | "network-first";

export function shouldTrackVisit(): boolean {
	const sessionId = sessionStorage.getItem(VISIT_SID);
	const tabCount = parseInt(localStorage.getItem(VISIT_TABS) || "0", 10);

	if (!sessionId) {
		if (tabCount > 0) {
			// Another tab is open, join the existing session
			sessionStorage.setItem(VISIT_SID, localStorage.getItem(VISIT_SID) ?? "");
		} else {
			// No tabs open, new browser session, reset tracking
			const newId = crypto.randomUUID();
			sessionStorage.setItem(VISIT_SID, newId);
			localStorage.setItem(VISIT_SID, newId);
			localStorage.removeItem(VISIT_TRACKED);
		}
	}

	localStorage.setItem(VISIT_TABS, String(tabCount + 1));
	window.addEventListener(
		"pagehide",
		() => {
			const count = parseInt(localStorage.getItem(VISIT_TABS) || "1", 10) - 1;
			localStorage.setItem(VISIT_TABS, String(Math.max(0, count)));
		},
		{ once: true },
	);

	if (localStorage.getItem(VISIT_TRACKED)) return false;
	localStorage.setItem(VISIT_TRACKED, "1");

	return true;
}

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
		console.info(
			`[Cache] Data version changed (${storedVersion} → ${generatedAt}). Purging stale CPI cache.`,
		);

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
export async function fetchWithCache(
	url: string,
	strategy: CacheStrategy = "cache-first",
): Promise<Response> {
	if (!("caches" in globalThis)) {
		return fetch(url);
	}

	const cache = await caches.open(CACHE_NAME);

	try {
		if (strategy === "cache-first") {
			return fetchCacheFirst(url, cache);
		} else {
			return fetchNetworkFirst(url, cache);
		}
	} catch (error) {
		throw new Error(`Unable to fetch ${url}: ${error}`);
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
		const isJson = networkResponse.headers.get("Content-Type")?.startsWith("application/json");

		// returning not json is 404, must be json
		if (!isJson) {
			throw new Error(`Request ${url} not found`);
		}

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

export async function isCached(url: string): Promise<boolean> {
	if (!("caches" in globalThis)) return false;
	const cache = await caches.open(CACHE_NAME);
	return (await cache.match(url)) !== undefined;
}

/**
 * Clears the application data cache.
 */
export async function clearDataCache() {
	if ("caches" in globalThis) {
		await caches.delete(CACHE_NAME);
	}
}
