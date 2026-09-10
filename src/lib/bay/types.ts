export type BayProc = {
	pid: number;
	kind: string;
	name: string;
	mib: number;
};

export type BayMag = {
	id: string;
	role: string;
	cache_gb: number;
	incomplete_gb: number;
	peak_vram_gb: number;
	resident: boolean;
	weights_gb?: number;
	weights_ok?: boolean;
};

export type BayPlate = {
	ts: string;
	host: string;
	kernel: string;
	gpu: {
		name: string;
		vram_used_mib: number;
		vram_total_mib: number;
		util_pct: number;
		power_w: number;
		power_limit_w: number;
		persistence: boolean;
		procs: BayProc[];
	};
	ram: { total_gb: number; avail_gb: number; committed_gb: number };
	swap: {
		disk_used_mb: number;
		disk_size_gb: number;
		zram_used_mb: number;
		zram_size_gb: number;
	};
	stack: BayMag[];
	ai_on_tube: boolean;
	source: string;
};

export type BayFeed = "live" | "dark" | "plate";

export type BayView = BayPlate & { feed: BayFeed };
