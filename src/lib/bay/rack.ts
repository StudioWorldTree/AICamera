import type { BayMag } from './types';
import { MAG_ALIAS, brickCarts, magLabel, type Cartridge } from './catalog';

export type MagSeat = 'gate' | 'cart' | 'empty' | 'absent';

export type MagRow = {
	id: string;
	label: string;
	job: string;
	shelf: Cartridge['shelf'];
	seat: MagSeat;
	sizeGb: number | null;
	resident: boolean;
};

export function seatWord(seat: MagSeat): string {
	switch (seat) {
		case 'gate':
			return 'IN GATE';
		case 'cart':
			return 'ON CART';
		case 'absent':
			return 'ABSENT';
		default:
			return 'EMPTY';
	}
}

function liveById(stack: BayMag[]): Map<string, BayMag> {
	const m = new Map<string, BayMag>();
	for (const mag of stack) {
		const id = MAG_ALIAS[mag.id] ?? mag.id;
		m.set(id, { ...mag, id });
	}
	return m;
}

function peakGb(c: Cartridge): number | null {
	const cost = c.costs['3090'];
	if (!cost || typeof cost !== 'object') return null;
	if ('vram_gb' in cost) return cost.vram_gb;
	return null;
}

function seatOf(c: Cartridge, live: BayMag | undefined): MagSeat {
	const cost = c.costs['3090'];
	if (live?.resident) return 'gate';
	if (cost == null) return 'absent';
	if ((live?.cache_gb ?? 0) > 0.05 || live?.weights_ok) return 'cart';
	return 'empty';
}

const FOREIGN = /llama|ollama|vllm|comfy|whisper|stable-diff/;
const OURS = /klein|flux|sam2|hiera|clip|pipeline|diffusers/;

/** Swap brick: one slottable mag. Infer IN GATE from VRAM when the feed omits resident. */
function inferGate(
	rows: MagRow[],
	carts: Cartridge[],
	usedMib: number,
	procs: string[]
): string | null {
	if (rows.some((r) => r.seat === 'gate')) return null;
	const blob = procs.join(' ').toLowerCase();
	if (FOREIGN.test(blob) && !OURS.test(blob)) return null;
	const extra = usedMib / 1024 - 0.4;
	if (extra < 0.5) return null;
	if (!blob && extra < 1.2) return null;
	let best: { id: string; err: number } | null = null;
	for (const c of carts) {
		if (c.shelf !== 'slottable') continue;
		const pk = peakGb(c);
		if (pk == null) continue;
		const err = Math.abs(pk - extra);
		if (!best || err < best.err) best = { id: c.id, err };
	}
	if (!best) return null;
	if (extra > 8) return OURS.test(blob) ? 'klein-4b' : null;
	if (best.err > Math.max(2, extra * 0.6)) return null;
	return best.id;
}

export function magRack(
	stack: BayMag[],
	opts?: { vramUsedMib?: number; procs?: { kind: string; name: string }[] }
): MagRow[] {
	const live = liveById(stack);
	const carts = brickCarts();
	const rows = carts.map((c) => {
		const hit = live.get(c.id);
		const size =
			hit?.weights_gb ?? (hit && hit.cache_gb > 0.05 ? hit.cache_gb : null);
		const seat = seatOf(c, hit);
		return {
			id: c.id,
			label: magLabel(c.id),
			job: c.job,
			shelf: c.shelf,
			seat,
			sizeGb: size,
			resident: seat === 'gate'
		};
	});
	const gated = inferGate(
		rows,
		carts,
		opts?.vramUsedMib ?? 0,
		(opts?.procs ?? []).filter((p) => p.kind === 'C').map((p) => p.name)
	);
	if (gated) {
		return rows.map((r) =>
			r.id === gated ? { ...r, seat: 'gate' as const, resident: true } : r
		);
	}
	return rows;
}
