/**
 * Lightweight fuzzy search scoring for keyword matching.
 *
 * Scoring priorities (highest → lowest):
 * 1. Exact match (case-insensitive)
 * 2. Starts-with match
 * 3. Word-boundary match (query matches the start of any word in the text)
 * 4. Contiguous substring match
 * 5. Fuzzy subsequence match (all query chars appear in order, with penalties for gaps)
 * 6. Typo tolerance with Levenshtein distance (with early termination)
 *
 * Returns a score ≥ 0 for matches, or -1 for no match.
 * Higher score = better match.
 */

export interface FuzzyMatch {
	score: number;
	ranges: [number, number][];
}

const NO_MATCH: FuzzyMatch = { score: -1, ranges: [] };

/**
 * Score a text against a query using fuzzy matching.
 * Both `textLower` and `queryLower` MUST already be lowercased.
 */
export function fuzzyScore(textLower: string, queryLower: string): FuzzyMatch {
	if (queryLower.length === 0) return NO_MATCH;
	if (queryLower.length > textLower.length) return NO_MATCH;

	// Exact match
	if (textLower === queryLower) {
		return { score: 1000, ranges: [[0, textLower.length]] };
	}

	// Starts-with
	if (textLower.startsWith(queryLower)) {
		return {
			score: 800 + (queryLower.length / textLower.length) * 100,
			ranges: [[0, queryLower.length]],
		};
	}

	// Word-boundary match — query matches the start of a word
	const wordBoundaryIdx = findWordBoundaryMatch(textLower, queryLower);
	if (wordBoundaryIdx >= 0) {
		return {
			score: 600 + (queryLower.length / textLower.length) * 100,
			ranges: [[wordBoundaryIdx, wordBoundaryIdx + queryLower.length]],
		};
	}

	// Contiguous substring match
	const substringIdx = textLower.indexOf(queryLower);
	if (substringIdx >= 0) {
		return {
			score: 400 + (queryLower.length / textLower.length) * 100,
			ranges: [[substringIdx, substringIdx + queryLower.length]],
		};
	}

	// Fuzzy subsequence match
	const subseqResult = fuzzySubsequence(textLower, queryLower);
	if (subseqResult.score > 0) return subseqResult;

	// Typo tolerance
	const editResult = editDistanceMatch(textLower, queryLower);
	if (editResult.score > 0) return editResult;

	return NO_MATCH;
}

/**
 * Check if the query matches at a word boundary in the text.
 * A word boundary is: start of string, or preceded by a non-alphanumeric char.
 */
function findWordBoundaryMatch(text: string, query: string): number {
	let searchFrom = 0;
	while (searchFrom < text.length) {
		const idx = text.indexOf(query, searchFrom);
		if (idx < 0) break;

		if (idx === 0 || isWordBoundary(text[idx - 1]!)) {
			return idx;
		}
		searchFrom = idx + 1;
	}
	return -1;
}

function isWordBoundary(char: string): boolean {
	return (
		char === " " ||
		char === "," ||
		char === "-" ||
		char === "/" ||
		char === "(" ||
		char === ")" ||
		char === "."
	);
}

/**
 * Fuzzy subsequence matching.
 * All characters of the query must appear in order in the text.
 * Score is based on:
 * - Number of matched characters (all must match for a result)
 * - Contiguity bonus (consecutive matched chars score higher)
 * - Word-boundary bonus (matching at word starts scores higher)
 */
function fuzzySubsequence(text: string, query: string): FuzzyMatch {
	const textLen = text.length;
	const queryLen = query.length;

	// if query is longer than text, no match
	if (queryLen > textLen) return NO_MATCH;

	// check if all query chars exist in text (cheap pre-check)
	const charCounts = new Map<string, number>();
	for (const c of text) {
		charCounts.set(c, (charCounts.get(c) || 0) + 1);
	}
	for (const c of query) {
		const count = charCounts.get(c);
		if (!count) return NO_MATCH;
		charCounts.set(c, count - 1);
	}

	// Greedy forward match with contiguity and word-boundary bonuses
	let score = 0;
	let qi = 0;
	let consecutiveMatches = 0;
	const ranges: [number, number][] = [];
	let rangeStart = -1;

	for (let ti = 0; ti < textLen && qi < queryLen; ti++) {
		if (text[ti] === query[qi]) {
			if (rangeStart === -1) rangeStart = ti;

			consecutiveMatches++;

			// Base score per matched char
			let charScore = 10;

			// consecutive chars in text matching consecutive chars in query
			if (consecutiveMatches > 1) {
				charScore += 5 * consecutiveMatches;
			}

			if (ti === 0 || isWordBoundary(text[ti - 1]!)) {
				charScore += 15;
			}

			score += charScore;
			qi++;
		} else {
			if (rangeStart !== -1) {
				ranges.push([rangeStart, ti]);
				rangeStart = -1;
			}
			consecutiveMatches = 0;
		}
	}

	// Close the last range
	if (rangeStart !== -1 && qi > 0) {
		const lastMatchedTextIdx = findLastMatchedIndex(text, query, qi - 1, ranges);
		ranges.push([rangeStart, lastMatchedTextIdx + 1]);
	}

	// Must match all query characters
	if (qi < queryLen) return NO_MATCH;

	// Normalize score: ratio of query coverage
	const coverageBonus = (queryLen / textLen) * 50;
	score = Math.round(score + coverageBonus);

	return { score, ranges };
}

// find the text index of the last matched query character
function findLastMatchedIndex(
	text: string,
	query: string,
	lastQi: number,
	existingRanges: [number, number][],
): number {
	// Walk backward from end to find where we left off
	let qi = 0;
	let lastTi = 0;
	const skipBefore = existingRanges.length > 0 ? existingRanges[existingRanges.length - 1]![1] : 0;

	for (let ti = 0; ti < text.length && qi <= lastQi; ti++) {
		if (ti < skipBefore && existingRanges.length > 0) {
			// Count chars matched in existing ranges
			for (const [s, e] of existingRanges) {
				if (ti >= s && ti < e) {
					qi++;
					lastTi = ti;
					break;
				}
			}
			continue;
		}
		if (text[ti] === query[qi]) {
			lastTi = ti;
			qi++;
		}
	}
	return lastTi;
}

function editDistanceMatch(text: string, query: string): FuzzyMatch {
	const maxDist = query.length <= 4 ? 1 : 2;
	const words = text.split(/[\s,\-/().]+/);

	let bestScore = -1;
	let bestRange: [number, number][] = [];

	let offset = 0;
	for (const word of words) {
		if (word.length === 0) {
			offset++;
			continue;
		}

		const wordStart = text.indexOf(word, offset);
		offset = wordStart + word.length;

		// Compare query against each word, and against word prefixes
		// for partial word matching (e.g., query "gas" vs word "gasoline")
		const compareLen = Math.min(word.length, query.length + maxDist);
		const segment = word.slice(0, compareLen);

		const dist = boundedLevenshtein(segment, query, maxDist);
		if (dist < 0) continue;

		// Score: lower distance = better, longer match = better
		const score = 200 - dist * 80 + (query.length / text.length) * 50;
		if (score > bestScore) {
			bestScore = score;
			bestRange = [[wordStart, wordStart + Math.min(word.length, query.length)]];
		}
	}

	return bestScore > 0 ? { score: Math.round(bestScore), ranges: bestRange } : NO_MATCH;
}

/**
 * Levenshtein distance with early termination.
 * Returns -1 if distance exceeds maxDist (avoids full matrix computation).
 */
function boundedLevenshtein(a: string, b: string, maxDist: number): number {
	const m = a.length;
	const n = b.length;

	if (Math.abs(m - n) > maxDist) return -1;

	let prev = new Array(n + 1);
	let curr = new Array(n + 1);

	for (let j = 0; j <= n; j++) prev[j] = j;

	for (let i = 1; i <= m; i++) {
		curr[0] = i;
		let rowMin = i;

		// Only compute within the diagonal band of width 2*maxDist+1
		const jMin = Math.max(1, i - maxDist);
		const jMax = Math.min(n, i + maxDist);

		// Fill out-of-band cells with maxDist+1 to prevent invalid paths
		if (jMin > 1) curr[jMin - 1] = maxDist + 1;

		for (let j = jMin; j <= jMax; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			curr[j] = Math.min(
				prev[j] + 1, // deletion
				curr[j - 1] + 1, // insertion
				prev[j - 1] + cost, // substitution
			);
			rowMin = Math.min(rowMin, curr[j]);
		}

		if (rowMin > maxDist) return -1;
		[prev, curr] = [curr, prev];
	}

	return prev[n] <= maxDist ? prev[n] : -1;
}
