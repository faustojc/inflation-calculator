import { describe, expect, it } from "vitest";
import { chunkName, chunkRange, chunksForRange, chunkStart } from "@/utils/chunks";

describe("chunkName", () => {
	it.each([
		[1994, "1994-2001"],
		[2001, "1994-2001"],
		[2002, "2002-2009"],
		[2017, "2010-2017"],
		[2018, "2018-2025"],
		[2025, "2018-2025"],
		[2026, "2026-2033"],
	])("%i → %s", (year, expected) => {
		expect(chunkName(year)).toBe(expected);
	});
});

describe("chunkStart", () => {
	it("maps epoch year onto itself", () => {
		expect(chunkStart(1994)).toBe(1994);
	});

	it("maps last year of a window to its start", () => {
		expect(chunkStart(2001)).toBe(1994);
		expect(chunkStart(2025)).toBe(2018);
	});
});

describe("chunksForRange", () => {
	it("spans two windows", () => {
		expect(chunksForRange(2016, 2019)).toEqual(["2010-2017", "2018-2025"]);
	});

	it("single year inside one window", () => {
		expect(chunksForRange(2020, 2020)).toEqual(["2018-2025"]);
	});

	it("full multi-window span", () => {
		expect(chunksForRange(1994, 2026)).toEqual([
			"1994-2001",
			"2002-2009",
			"2010-2017",
			"2018-2025",
			"2026-2033",
		]);
	});
});

describe("chunkRange", () => {
	it("parses inclusive bounds", () => {
		expect(chunkRange("1994-2001")).toEqual([1994, 2001]);
		expect(chunkRange("2018-2025")).toEqual([2018, 2025]);
	});
});
