// Chunk math — mirror of the generator rule (psa-cpi-transformer).
// Constants come from v3 metadata.json (`chunk_epoch`, `chunk_years`) but are
// hardcoded here so the module is pure and testable. `initializeApp` validates
// that the published data agrees with these constants.

export const CHUNK_EPOCH = 1994;
export const CHUNK_YEARS = 8;

/** First year of the fixed window containing `year`. */
export function chunkStart(year: number, epoch = CHUNK_EPOCH, span = CHUNK_YEARS): number {
	return year - ((year - epoch) % span);
}

/** Chunk file basename for `year`, e.g. 2003 → "2002-2009". */
export function chunkName(year: number): string {
	const s = chunkStart(year);
	return `${s}-${s + CHUNK_YEARS - 1}`;
}

/** Distinct chunk names covering [startYear, endYear], inclusive. */
export function chunksForRange(startYear: number, endYear: number): string[] {
	const names: string[] = [];
	for (let s = chunkStart(startYear); s <= endYear; s += CHUNK_YEARS) {
		names.push(`${s}-${s + CHUNK_YEARS - 1}`);
	}
	return names;
}

/** Inclusive [start, end] years encoded in a chunk name like "1994-2001". */
export function chunkRange(name: string): [number, number] {
	const [start, end] = name.split("-").map(Number);
	return [start!, end!];
}
