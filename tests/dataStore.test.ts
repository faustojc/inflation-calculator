import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AreaManifest, ChunkFile } from "@/lib/types";
import { getCalculationData } from "@/stores/dataStore";
import { clearGlobalIndex, MANIFEST_CACHE } from "@/utils/metadata";

/**
 * Integration tests for the v3 chunked fetch layer (spec §10.2):
 *  - a range spanning two chunks issues exactly 2 chunk requests,
 *  - a repeat call issues 0,
 *  - B30 requests outside the published B30 chunks are gated by the manifest
 *    (0 network requests instead of 404 round-trips),
 *  - indexing preserves exact float values month-by-month.
 */

const MANIFEST: AreaManifest = {
	v: 3,
	dates: {
		official: { ALL: { 2016: 12, 2019: 12 }, B30: { 2018: 12 } },
		personal: { ALL: { 2018: 12 }, B30: { 2018: 12 } },
	},
	weights: { ALL: [38.34], B30: [59.73] },
	chunks: {
		ALL: ["1994-2001", "2002-2009", "2010-2017", "2018-2025"],
		B30: ["2018-2025"],
	},
};

// Precision-sensitive fixture values — must survive indexing bit-for-bit.
const CHUNK_2010: ChunkFile = {
	v: 3,
	area: "aklan",
	name: "Aklan",
	ids: { r: 6, p: 4 },
	class: "ALL",
	range: [2010, 2017],
	years: {
		"2016": {
			official: { "0": [87.123456789, null, 88.000000001], "01": [90.1, 90.2, null] },
		},
		"2017": {
			official: { "0": [89.5, 89.6] },
		},
	},
};

const CHUNK_2018: ChunkFile = {
	v: 3,
	area: "aklan",
	name: "Aklan",
	ids: { r: 6, p: 4 },
	class: "ALL",
	range: [2018, 2025],
	years: {
		"2018": {
			official: { "0": [95.4] },
			personal: { "0": [96.7] },
		},
		"2019": {
			official: { "0": [97.2, 97.3] },
		},
	},
};

// Same chunk window as CHUNK_2018 but class B30 with distinct values —
// switching classes must never serve one class's numbers to the other.
const CHUNK_2018_B30: ChunkFile = {
	v: 3,
	area: "aklan",
	name: "Aklan",
	ids: { r: 6, p: 4 },
	class: "B30",
	range: [2018, 2025],
	years: {
		"2018": {
			official: { "0": [91.1] },
			personal: { "0": [92.2] },
		},
		"2019": {
			official: { "0": [93.3, 93.4] },
		},
	},
};

function jsonResponse(body: unknown): Response {
	return {
		ok: true,
		headers: { get: (h: string) => (h.toLowerCase() === "content-type" ? "application/json" : null) },
		json: () => Promise.resolve(structuredClone(body)),
		clone() {
			return this;
		},
	} as unknown as Response;
}

function notFoundResponse(): Response {
	return {
		ok: false,
		status: 404,
		headers: { get: () => "text/html" },
		json: () => Promise.reject(new Error("not json")),
	} as unknown as Response;
}

const fetchMock = vi.fn((url: string) => {
	if (url.endsWith("data/aklan/manifest.json")) return Promise.resolve(jsonResponse(MANIFEST));
	if (url.endsWith("data/aklan/all/2010-2017.json")) return Promise.resolve(jsonResponse(CHUNK_2010));
	if (url.endsWith("data/aklan/all/2018-2025.json")) return Promise.resolve(jsonResponse(CHUNK_2018));
	if (url.endsWith("data/aklan/b30/2018-2025.json"))
		return Promise.resolve(jsonResponse(CHUNK_2018_B30));
	return Promise.resolve(notFoundResponse());
});

const chunkRequests = () => fetchMock.mock.calls.filter(([u]) => /\/(all|b30)\//.test(u));

beforeEach(() => {
	clearGlobalIndex();
	MANIFEST_CACHE.clear();
	fetchMock.mockClear();
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("getCalculationData (v3 chunks)", () => {
	it("range spanning two chunks issues exactly 2 chunk requests", async () => {
		await getCalculationData(["aklan"], "ALL", 2016, 2019);

		expect(chunkRequests().map(([u]) => u)).toEqual([
			"api/v3/data/aklan/all/2010-2017.json",
			"api/v3/data/aklan/all/2018-2025.json",
		]);
	});

	it("repeat call issues 0 chunk requests", async () => {
		await getCalculationData(["aklan"], "ALL", 2016, 2019);
		fetchMock.mockClear();

		await getCalculationData(["aklan"], "ALL", 2016, 2019);
		expect(chunkRequests()).toHaveLength(0);
	});

	it("B30 request for 1994-2001 is gated by the manifest (0 chunk requests)", async () => {
		await getCalculationData(["aklan"], "B30", 1994, 2001);
		expect(chunkRequests()).toHaveLength(0);
	});

	it("switching income class ALL→B30→ALL always serves the selected class's data", async () => {
		const all1 = await getCalculationData(["aklan"], "ALL", 2018, 2019);
		expect(all1.aklan![2018]!.official![1]!["0"]).toBe(95.4);

		const b30 = await getCalculationData(["aklan"], "B30", 2018, 2019);
		expect(b30.aklan![2018]!.official![1]!["0"]).toBe(91.1);
		expect(b30.aklan![2018]!.personal![1]!["0"]).toBe(92.2);
		expect(b30.aklan![2019]!.official![2]!["0"]).toBe(93.4);

		// Switch back: ALL values must be intact, and no re-fetch is needed.
		fetchMock.mockClear();
		const all2 = await getCalculationData(["aklan"], "ALL", 2018, 2019);
		expect(all2.aklan![2018]!.official![1]!["0"]).toBe(95.4);
		expect(all2.aklan![2018]!.personal![1]!["0"]).toBe(96.7);
		expect(chunkRequests()).toHaveLength(0);
	});

	it("indexes chunk data identically to the old per-year format (exact floats)", async () => {
		const index = await getCalculationData(["aklan"], "ALL", 2016, 2019);

		// index[area][year][dataType][month][code] — month is 1-based, nulls skipped.
		expect(index.aklan![2016]!.official![1]!["0"]).toBe(87.123456789);
		expect(index.aklan![2016]!.official![2]!["0"]).toBeUndefined(); // null skipped
		expect(index.aklan![2016]!.official![2]!["01"]).toBe(90.2);
		expect(index.aklan![2016]!.official![3]!["0"]).toBe(88.000000001);
		expect(index.aklan![2016]!.official![1]!["01"]).toBe(90.1);
		expect(index.aklan![2017]!.official![2]!["0"]).toBe(89.6);
		expect(index.aklan![2018]!.official![1]!["0"]).toBe(95.4);
		expect(index.aklan![2018]!.personal![1]!["0"]).toBe(96.7);
		expect(index.aklan![2019]!.official![2]!["0"]).toBe(97.3);
	});
});
