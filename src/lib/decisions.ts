import openJson from '../../docs/decisions/open.json';

export type DecisionStatus = 'locked' | 'open' | 'lab';

export type Decision = {
	id: string;
	status: DecisionStatus;
	call: string;
	detail: string;
	doc?: string;
};

export const locked: Decision[] = [
	{
		id: 'thor-body',
		status: 'locked',
		call: 'Thor is the body',
		detail: 'Jetson Thor captures, encodes, runs live AD, pose, overlay, and snap. Not a cloud camera with a brick glued on.',
		doc: 'carrier'
	},
	{
		id: '6000',
		status: 'locked',
		call: 'RTX PRO 6000 is the quality box',
		detail: 'Overnight reconstruct, gsplat, FLUX.2 [dev], Wan / Hunyuan, Cosmos. Off-body. Optional dual.',
		doc: 'model-map'
	},
	{
		id: 'nas',
		status: 'locked',
		call: 'NAS is source of truth',
		detail: 'Takes, pose, prompts, LUTs, USD, splats, checkpoints as ordinary files. Unmount the disks and leave.',
		doc: 'interconnect'
	},
	{
		id: 'drop-ai',
		status: 'locked',
		call: 'Mode switch drops AI, never record',
		detail: 'If power or thermal sags, unload models. HEVC and the sidecar keep running.',
		doc: 'power'
	},
	{
		id: 'fanless',
		status: 'locked',
		call: '70 W fanless is not honest',
		detail:
			'A cine-sized metal shell dumps ~38–50 W still air. Body-as-radiator is ~40 W. Record-only (NVENC + CSI, AI dropped) is 15–30 W and can be silent. 70 W AI wants heatpipes to a radiator and at most one slow fan.',
		doc: 'references/thermal'
	},
	{
		id: 'ttp-customer',
		status: 'locked',
		call: 'The cooler sits on the TTP. We design it.',
		detail:
			'T4000 TTP max 75 °C, SoC 90 °C recommended. NVIDIA sells neither a cine body nor a fanless 70 W promise. Do not open the TTP. ATS “passive” means chassis airflow, not still air.',
		doc: 'references/thermal'
	},
	{
		id: 'overlay',
		status: 'locked',
		call: 'Live overlay is a depth-test, not a DiT',
		detail: 'EVF composite is mesh / low splat against live pose. Generative insert is minutes on the 6000.',
		doc: 'model-map'
	},
	{
		id: 'rooms',
		status: 'locked',
		call: 'Rooms are captured, not generated',
		detail: 'Walk the space. Reconstruct overnight. Do not hallucinate the set as the live picture.',
		doc: 'model-map'
	},
	{
		id: 'h3',
		status: 'locked',
		call: 'H3 is license-gated in the US',
		detail: 'MiniMax H3 open-weights are excluded here. Default local video is Wan 2.2 + Hunyuan 1.5 + Cosmos.',
		doc: 'model-map'
	},
	{
		id: 'snap',
		status: 'locked',
		call: 'Snap is FLUX.2 klein 4B',
		detail: 'Inline still on Thor, Apache, ~8–13 GB. Unloads 27B. Not a replacement take. [dev] stays on the 6000.',
		doc: 'model-map'
	},
	{
		id: 'ad',
		status: 'locked',
		call: 'AD is Qwen3.5-9B (27B on sticks)',
		detail: 'Talks; does not move the camera unless asked. 27B only at 130 W, and it unloads klein.',
		doc: 'model-map'
	},
	{
		id: 'hevc',
		status: 'locked',
		call: 'Record path is HEVC',
		detail: 'Thor NVENC and/or camera-side H.265. Do not haul RAW over Ethernet. CSI RAW is the body hop into NVENC.',
		doc: 'stream-budget'
	},
	{
		id: 'lens',
		status: 'locked',
		call: 'Lens metadata is Cooke /i class',
		detail: 'Every camera, body and sat. JSONL sidecar 1:1 with picture. Not inside the HEVC.',
		doc: 'lens'
	},
	{
		id: 'kit-sku',
		status: 'locked',
		call: 'AGX kit is a T5000. There is no T4000 kit',
		detail: 'Lab brick is the AGX Developer Kit. Production thermal/encode ceiling is the T4000 SOM unless satellite count forces T5000.',
		doc: 'carrier'
	},
	{
		id: 'fabric',
		status: 'locked',
		call: 'Hybrid fabric',
		detail: 'Body camera on CSI/GMSL mounted to the Thor box. Satellites on PoE Ethernet. USB-C is not the trunk.',
		doc: 'interconnect'
	},
	{
		id: 'count',
		status: 'locked',
		call: 'Bring-up is 1 body + 2 sats at 4K30',
		detail: '4-sat and 6-sat stay in the budget tables. T4000 HQ cannot Thor-encode the trio — sats encode on camera.',
		doc: 'stream-budget'
	},
	{
		id: 'shape',
		status: 'locked',
		call: 'Thor lives inside the camera body',
		detail: 'T4000 + compact carrier + CSI sensor + active HS. Not the AGX kit as the product, and not a PYXIS bolted onto a brick.',
		doc: 'enclosure'
	}
];

export const open: Decision[] = openJson as Decision[];

export const lab: Decision[] = [
	{
		id: 'lab-brick',
		status: 'lab',
		call: 'First enclosure wraps the AGX kit',
		detail: '243.19 × 112.40 × 56.88 mm. Two-part resin fit-check, not a heat sink. Leave the kit fan. Production body is metal.',
		doc: 'enclosure'
	},
	{
		id: 'gmsl-count',
		status: 'lab',
		call: 'Honest GMSL2 4K30 RAW is 4, not 8, not 20',
		detail: '8 is the deser catalog. 20 is HSB / Camera-over-Ethernet. 4K30 RAW12 on GMSL2 is a 4-lane budget.',
		doc: 'cameras'
	}
];
