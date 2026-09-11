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
	hub: string | null;
	cacheGb: number;
	incompleteGb: number;
	peakVramGb: number | null;
	hostRamGb: number | null;
	pulling: boolean;
};

const SEAT_RANK: Record<MagSeat, number> = {
	gate: 0,
	cart: 1,
	empty: 2,
	absent: 3
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
	opts?: {
		vramUsedMib?: number;
		procs?: { kind: string; name: string }[];
		pulling?: string[];
	}
): MagRow[] {
	const live = liveById(stack);
	const carts = brickCarts();
	const pulling = new Set(opts?.pulling ?? []);
	const cost3090 = (c: Cartridge) => {
		const cost = c.costs['3090'];
		if (!cost || typeof cost !== 'object') return { peak: null as number | null, host: null as number | null };
		return {
			peak: 'vram_gb' in cost ? cost.vram_gb : null,
			host: 'host_ram_gb' in cost ? cost.host_ram_gb : null
		};
	};
	const rows = carts.map((c) => {
		const hit = live.get(c.id);
		const size =
			hit?.weights_gb ?? (hit && hit.cache_gb > 0.05 ? hit.cache_gb : null);
		const seat = seatOf(c, hit);
		const { peak, host } = cost3090(c);
		return {
			id: c.id,
			label: magLabel(c.id),
			job: c.job,
			shelf: c.shelf,
			seat,
			sizeGb: size,
			resident: seat === 'gate',
			hub: c.hub ?? null,
			cacheGb: hit?.cache_gb ?? 0,
			incompleteGb: hit?.incomplete_gb ?? 0,
			peakVramGb: peak,
			hostRamGb: host,
			pulling: pulling.has(c.id)
		};
	});
	const gated = inferGate(
		rows,
		carts,
		opts?.vramUsedMib ?? 0,
		(opts?.procs ?? []).filter((p) => p.kind === 'C').map((p) => p.name)
	);
	const ranked = gated
		? rows.map((r) =>
				r.id === gated ? { ...r, seat: 'gate' as const, resident: true } : r
			)
		: rows;
	return ranked.sort(
		(a, b) => SEAT_RANK[a.seat] - SEAT_RANK[b.seat] || a.label.localeCompare(b.label)
	);
}

export type MagFilter = 'ready' | 'all';

export function filterRack(rows: MagRow[], filter: MagFilter): MagRow[] {
	if (filter === 'all') return rows;
	return rows.filter((r) => r.seat === 'gate' || r.seat === 'cart' || (r.seat === 'empty' && r.hub));
}

export function sizeHint(m: MagRow): string {
	const bits: string[] = [];
	if (m.sizeGb != null) bits.push(`disk ${m.sizeGb.toFixed(1)} GB`);
	else if (m.cacheGb > 0.05) bits.push(`disk ${m.cacheGb.toFixed(1)} GB`);
	else bits.push('not on disk');
	if (m.incompleteGb > 0.01) bits.push(`incomplete ${m.incompleteGb.toFixed(2)} GB`);
	if (m.peakVramGb != null) bits.push(`peak VRAM ${m.peakVramGb.toFixed(1)} GB`);
	if (m.hostRamGb != null) bits.push(`host ${m.hostRamGb.toFixed(1)} GB`);
	return bits.join(' · ');
}
