export type Chapter = {
	slug: string;
	file: string;
	title: string;
	kicker: string;
	summary: string;
	group: 'hardware' | 'reference' | 'meta';
};

export const chapters: Chapter[] = [
	{
		slug: '',
		file: 'docs/README.md',
		title: 'Hardware docs',
		kicker: 'Index',
		summary:
			'This repo is the camera body. Product ground (vision, pipeline, modes, models) lives in web3d-space. Do not fork it.',
		group: 'meta'
	},
	{
		slug: 'carrier',
		file: 'docs/CARRIER.md',
		title: 'Carrier',
		kicker: 'Compute',
		summary:
			'Lab brick is the AGX Thor Developer Kit (T5000). Production ceiling is the T4000 SOM — 64 GB, 1× NVENC, 70 W default — unless satellite count forces T5000.',
		group: 'hardware'
	},
	{
		slug: 'cameras',
		file: 'docs/CAMERAS.md',
		title: 'Cameras',
		kicker: 'Pipes',
		summary:
			'Thor speaks CSI-2, not GMSL. Body on the box is CSI. Sats are GMSL2, PoE H.265, or a cine HDMI/SDI body. Cable plant, not picture quality.',
		group: 'hardware'
	},
	{
		slug: 'interconnect',
		file: 'docs/INTERCONNECT.md',
		title: 'Interconnect',
		kicker: 'Plant',
		summary:
			'Hybrid fabric: body CSI/GMSL into NVENC, sats PoE H.265, lens /i as a second stream. HEVC bring-up fits 5GbE.',
		group: 'hardware'
	},
	{
		slug: 'stream-budget',
		file: 'docs/STREAM-BUDGET.md',
		title: 'Stream budget',
		kicker: 'Numbers',
		summary:
			'Working haul is ~100 Mbps per 4K30 HEVC. T4000 HQ encodes 2× 4Kp30, not three. QSFP28 is independent 25G lanes, not aggregated 100G.',
		group: 'hardware'
	},
	{
		slug: 'sensors',
		file: 'docs/SENSORS.md',
		title: 'Sensors',
		kicker: 'Glass + silicon',
		summary:
			'Bring-up count is 1 body + 2 satellites at 4K30. Body is native CSI/GMSL. Sats are PoE H.265 with Cooke-class metadata, not P-iris stubs.',
		group: 'hardware'
	},
	{
		slug: 'lens',
		file: 'docs/LENS.md',
		title: 'Lens metadata',
		kicker: 'Cooke /i',
		summary:
			'Frame-accurate /i (or LDS / XD / EF electronic) from every camera, written as JSONL next to picture. Maps live on the NAS, not per frame.',
		group: 'hardware'
	},
	{
		slug: 'power',
		file: 'docs/POWER.md',
		title: 'Power',
		kicker: 'Watts',
		summary:
			'T4000 default 70 W, throttle at 90 W. If power sags: drop AI, never record. Two PoE+ sats ≈ 60 W at the PSE. Do not power Thor from the switch.',
		group: 'hardware'
	},
	{
		slug: 'references/thermal',
		file: 'docs/references/THERMAL.md',
		title: 'Thermal',
		kicker: 'Heat',
		summary:
			'TDG-12271-001 v1.3. TTP max 75 °C. 70 W fanless in a cine envelope is not honest. Body-as-radiator ~40 W still air; 70 W AI wants heatpipes to a real radiator and at most one slow fan. Measure TTP before metal CAD.',
		group: 'hardware'
	},
	{
		slug: 'enclosure',
		file: 'docs/ENCLOSURE.md',
		title: 'Enclosure',
		kicker: 'Shell',
		summary:
			'First article wraps the AGX kit, two-part resin for an Anycubic bed. Resin is a fit-check, not a heat sink. Production body is metal — the radiator.',
		group: 'hardware'
	},
	{
		slug: 'model-map',
		file: 'docs/MODEL-MAP.md',
		title: 'Model map',
		kicker: 'Stages 0–19',
		summary:
			'Index of which job runs on Thor vs the 6000. Thor resident set stays ≤ ~40 GB. If the 6000 is off, stages 0–8 and 19 still complete.',
		group: 'hardware'
	},
	{
		slug: 'shopping',
		file: 'docs/SHOPPING.md',
		title: 'Shopping',
		kicker: 'Buy brief',
		summary:
			'Not a spec. Blackmagic is a cinema body (path B), not a CSI science project. T4000 SOM, AGX kit, and carrier options with street prices as of 2026-09-01.',
		group: 'hardware'
	},
	{
		slug: 'references/t4000',
		file: 'docs/references/T4000.md',
		title: 'T4000 extract',
		kicker: 'Datasheet',
		summary:
			'Facts from NVIDIA DS-11945-001 v1.4: 1536 CUDA, 64 GB, 1× NVENC, 3× 25G, no CAN, no 3.3 V SV. The SOM, not the kit.',
		group: 'reference'
	},
	{
		slug: 'references',
		file: 'docs/references/README.md',
		title: 'References',
		kicker: 'Sources',
		summary: 'Where the Arrow datasheet lives, and how it was ingested (pdf2md, text-based, 59 pages).',
		group: 'reference'
	},
	{
		slug: 'agents',
		file: 'AGENTS.md',
		title: 'Agent notes',
		kicker: 'Repo',
		summary: 'Working rules for this tree: what is already decided, HEVC, /i sidecars, beads prefix aicam.',
		group: 'meta'
	}
];

export const chapterBySlug = new Map(chapters.map((c) => [c.slug, c]));
export const chapterByFile = new Map(chapters.map((c) => [c.file, c]));
