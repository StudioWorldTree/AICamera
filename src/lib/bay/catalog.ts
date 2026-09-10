import raw from '../../../sim/3090/catalog.json';
import type { Cartridge, Kind, Latency, Shelf } from './cartridges';

export type CatalogFile = {
	schema: string;
	envelopes: Record<string, unknown>;
	cartridges: Cartridge[];
	presets: Record<string, string[]>;
};

export const catalog = raw as unknown as CatalogFile;

export const MAG_LABEL: Record<string, string> = {
	'nvenc-hevc': 'NVENC',
	cuvslam: 'SLAM',
	filters: 'FILTERS',
	'sam2-tiny': 'SAM2',
	'sam2-4k': 'SAM2 4K',
	maxine: 'MAXINE',
	'maxine-4k': 'MAXINE 4K',
	clip: 'CLIP',
	'da-s': 'DA-S',
	'klein-4b': 'KLEIN',
	'qwen-9b': '9B',
	'qwen-27b': '27B',
	'ar-overlay': 'AR'
};

/** Plate/snapshot used older HF ids. */
export const MAG_ALIAS: Record<string, string> = {
	'clip-vit-b32': 'clip',
	'flux2-klein-4b': 'klein-4b'
};

export function magLabel(id: string): string {
	return MAG_LABEL[id] ?? id.replace(/-/g, ' ').toUpperCase();
}

export function brickCarts(): Cartridge[] {
	return catalog.cartridges.filter((c) => c.shelf !== 'never-on-thor');
}

export type { Cartridge, Kind, Latency, Shelf };
