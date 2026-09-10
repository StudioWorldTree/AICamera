/** Types for `sim/3090/catalog.json`. Do not fork cost numbers here. */
export type Latency = 'LIVE' | 'NEAR' | 'MIN' | 'NIGHT';
export type Shelf = 'always-on' | 'slottable' | 'never-on-thor';
export type Kind = 'model' | 'plugin';

export type SplitCost = {
	vram_gb: number;
	host_ram_gb: number;
	watts: number | null;
	nvenc: number;
	fact: boolean;
	src: string;
};

export type UnifiedCost = {
	unified_gb: number;
	watts: number | null;
	nvenc: number;
	fact: boolean;
	src: string;
};

export type Cartridge = {
	id: string;
	kind: Kind;
	job: string;
	shelf: Shelf;
	exclusive: string[];
	latency: Latency;
	costs: Record<string, SplitCost | UnifiedCost | null>;
};
