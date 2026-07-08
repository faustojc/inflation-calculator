export const CHUNK_EPOCH = 1994;
export const CHUNK_YEARS = 8;

export function chunkStart(year: number, epoch = CHUNK_EPOCH, span = CHUNK_YEARS): number {
	return year - ((year - epoch) % span);
}

export function chunkName(year: number): string {
	const s = chunkStart(year);
	return `${s}-${s + CHUNK_YEARS - 1}`;
}

export function chunksForRange(startYear: number, endYear: number): string[] {
	const names: string[] = [];
	for (let s = chunkStart(startYear); s <= endYear; s += CHUNK_YEARS) {
		names.push(`${s}-${s + CHUNK_YEARS - 1}`);
	}
	return names;
}

export function chunkRange(name: string): [number, number] {
	const [start, end] = name.split("-").map(Number);
	return [start!, end!];
}
