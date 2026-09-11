/** 16 kHz mono only. Wrong shape is 422; this module does not resample. */

export const SAMPLE_RATE = 16000;

export class ShapeError extends Error {
	readonly http = 422 as const;
	constructor(message = 'expected 16 kHz mono') {
		super(message);
		this.name = 'ShapeError';
	}
}

export type ContentType = {
	type: string;
	params: Record<string, string>;
};

export function parseContentType(header: string | undefined): ContentType {
	const parts = (header ?? '')
		.split(';')
		.map((s) => s.trim())
		.filter(Boolean);
	const type = (parts.shift() ?? '').toLowerCase();
	const params: Record<string, string> = {};
	for (const p of parts) {
		const eq = p.indexOf('=');
		if (eq === -1) continue;
		const key = p.slice(0, eq).trim().toLowerCase();
		params[key] = p.slice(eq + 1).trim().replace(/^"|"$/g, '');
	}
	return { type, params };
}

export type WavInfo = {
	sampleRate: number;
	channels: number;
	bitsPerSample: number;
	audioFormat: number;
	pcmF32: number[];
};

function ascii(bytes: Uint8Array, offset: number, n: number): string {
	return String.fromCharCode(...bytes.subarray(offset, offset + n));
}

export function parseWav(bytes: Uint8Array): WavInfo {
	if (bytes.byteLength < 44) throw new ShapeError('not a wav');
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	if (ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 4) !== 'WAVE') {
		throw new ShapeError('not a wav');
	}
	let offset = 12;
	let fmt: { format: number; channels: number; sampleRate: number; bits: number } | null = null;
	let data: Uint8Array | null = null;
	while (offset + 8 <= bytes.byteLength) {
		const id = ascii(bytes, offset, 4);
		const size = view.getUint32(offset + 4, true);
		const start = offset + 8;
		const end = Math.min(start + size, bytes.byteLength);
		if (id === 'fmt ' && size >= 16) {
			fmt = {
				format: view.getUint16(start, true),
				channels: view.getUint16(start + 2, true),
				sampleRate: view.getUint32(start + 4, true),
				bits: view.getUint16(start + 14, true)
			};
		} else if (id === 'data') {
			data = bytes.subarray(start, end);
		}
		offset = start + size + (size % 2);
	}
	if (!fmt || !data) throw new ShapeError('incomplete wav');
	if (fmt.sampleRate !== SAMPLE_RATE || fmt.channels !== 1) {
		throw new ShapeError('expected 16 kHz mono');
	}
	const pcmF32 = decodePcm(data, fmt.format, fmt.bits);
	return {
		sampleRate: fmt.sampleRate,
		channels: fmt.channels,
		bitsPerSample: fmt.bits,
		audioFormat: fmt.format,
		pcmF32
	};
}

function decodePcm(data: Uint8Array, format: number, bits: number): number[] {
	const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
	if (format === 1 && bits === 16) {
		const n = Math.floor(data.byteLength / 2);
		const pcm = new Array<number>(n);
		for (let i = 0; i < n; i++) pcm[i] = view.getInt16(i * 2, true) / 32768;
		return pcm;
	}
	if (format === 3 && bits === 32) {
		const n = Math.floor(data.byteLength / 4);
		const pcm = new Array<number>(n);
		for (let i = 0; i < n; i++) pcm[i] = view.getFloat32(i * 4, true);
		return pcm;
	}
	throw new ShapeError('expected 16-bit pcm or 32-bit float wav');
}

/** RFC 2586 audio/L16: signed 16-bit PCM, network (big) endian. */
export function parseL16(
	bytes: Uint8Array,
	opts: { rate?: number; channels?: number } = {}
): number[] {
	const rate = opts.rate ?? SAMPLE_RATE;
	const channels = opts.channels ?? 1;
	if (rate !== SAMPLE_RATE || channels !== 1) throw new ShapeError('expected 16 kHz mono');
	if (bytes.byteLength === 0 || bytes.byteLength % 2 !== 0) {
		throw new ShapeError('truncated pcm');
	}
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const n = bytes.byteLength / 2;
	const pcm = new Array<number>(n);
	for (let i = 0; i < n; i++) pcm[i] = view.getInt16(i * 2, false) / 32768;
	return pcm;
}

export function writeWavPcm16(
	samples: Int16Array,
	sampleRate = SAMPLE_RATE,
	channels = 1
): Uint8Array {
	const dataSize = samples.byteLength;
	const buf = new ArrayBuffer(44 + dataSize);
	const view = new DataView(buf);
	const u8 = new Uint8Array(buf);
	const asciiAt = (offset: number, s: string) => {
		for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
	};
	asciiAt(0, 'RIFF');
	view.setUint32(4, 36 + dataSize, true);
	asciiAt(8, 'WAVE');
	asciiAt(12, 'fmt ');
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, channels, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * channels * 2, true);
	view.setUint16(32, channels * 2, true);
	view.setUint16(34, 16, true);
	asciiAt(36, 'data');
	view.setUint32(40, dataSize, true);
	u8.set(new Uint8Array(samples.buffer, samples.byteOffset, samples.byteLength), 44);
	return u8;
}
