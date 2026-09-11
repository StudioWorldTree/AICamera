import { BYTES_PER_SAMPLE, SAMPLE_RATE, decodePcm16 } from './wav';

/** Default TDT window. openspec/changes/add-parakeet-stream; add-parakeet-api Audio stream pipe. */
export const WINDOW_SECONDS = 4;

export type StreamEvent = {
	text: string;
	t0: number;
	t1: number;
	final: boolean;
};

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
	if (a.byteLength === 0) return b;
	if (b.byteLength === 0) return a;
	const out = new Uint8Array(a.byteLength + b.byteLength);
	out.set(a, 0);
	out.set(b, a.byteLength);
	return out;
}

export async function* requestChunks(req: Request): AsyncGenerator<Uint8Array> {
	const body = req.body;
	if (!body) return;
	const reader = body.getReader();
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			if (value && value.byteLength) yield value;
		}
	} finally {
		reader.releaseLock();
	}
}

/**
 * Buffer N-second windows (default 4s), transcribe each, emit NDJSON-shaped events.
 * Last event is `final: true` after the body ends (half-close).
 */
export async function* windowedTranscribe(
	chunks: AsyncIterable<Uint8Array>,
	opts: {
		littleEndian: boolean;
		transcribe: (pcm: number[]) => Promise<string>;
		windowSeconds?: number;
	}
): AsyncGenerator<StreamEvent> {
	const windowSamples = Math.round(SAMPLE_RATE * (opts.windowSeconds ?? WINDOW_SECONDS));
	const windowBytes = windowSamples * BYTES_PER_SAMPLE;
	let pending = new Uint8Array(0);
	let t0 = 0;
	let held: Omit<StreamEvent, 'final'> | null = null;

	const takeWindow = async (bytes: Uint8Array) => {
		const pcm = decodePcm16(bytes, opts.littleEndian);
		const text = await opts.transcribe(pcm);
		const t1 = t0 + pcm.length / SAMPLE_RATE;
		const ev = { text, t0, t1 };
		t0 = t1;
		return ev;
	};

	for await (const chunk of chunks) {
		pending = concat(pending, chunk);
		while (pending.byteLength >= windowBytes) {
			const win = pending.slice(0, windowBytes);
			pending = pending.subarray(windowBytes);
			if (held) yield { ...held, final: false };
			held = await takeWindow(win);
		}
	}

	const even = pending.byteLength - (pending.byteLength % 2);
	if (even > 0) {
		if (held) yield { ...held, final: false };
		held = await takeWindow(pending.slice(0, even));
	}

	if (held) yield { ...held, final: true };
	else yield { text: '', t0, t1: t0, final: true };
}
