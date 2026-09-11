import { join } from 'node:path';
import { ShapeError } from './wav';

export const PROVIDER = 'CPUExecutionProvider';
export const MODEL_ID = 'nemo-parakeet-tdt-0.6b-v3';

export type SidecarState = 'warm' | 'cold' | 'down';

export type HealthInfo = {
	state: SidecarState;
	provider: string;
	model: string;
};

export type TranscribeInput = {
	pcm_f32?: number[];
	wav_path?: string;
	sample_rate: number;
};

export class SidecarDownError extends Error {
	readonly http = 503 as const;
	constructor(message = 'sidecar down') {
		super(message);
		this.name = 'SidecarDownError';
	}
}

export interface Sidecar {
	health(): Promise<HealthInfo>;
	transcribe(input: TranscribeInput): Promise<{ text: string }>;
}

type WireOut = {
	id: string;
	ok: boolean;
	text?: string;
	error?: string;
	http?: number;
	state?: string;
	provider?: string;
	model?: string;
};

const SERVER_ROOT = join(import.meta.dir, '..');
export const SIDECAR_SCRIPT = join(SERVER_ROOT, '..', 'engine', 'sidecar.py');

export function downSidecar(): Sidecar {
	return {
		async health() {
			return { state: 'down', provider: PROVIDER, model: MODEL_ID };
		},
		async transcribe() {
			throw new SidecarDownError();
		}
	};
}

export function warmSidecar(text = 'place the portrait of phoebe'): Sidecar {
	return {
		async health() {
			return { state: 'warm', provider: PROVIDER, model: MODEL_ID };
		},
		async transcribe() {
			return { text };
		}
	};
}

function asState(value: string | undefined, ok: boolean): SidecarState {
	if (value === 'warm' || value === 'cold' || value === 'down') return value;
	return ok ? 'warm' : 'down';
}

/** JSONL child at ../engine/sidecar.py. No TCP/UDP listener. */
export class JsonlSidecar implements Sidecar {
	private proc: Bun.Subprocess;
	private pending = new Map<
		string,
		{ resolve: (v: WireOut) => void; reject: (e: Error) => void }
	>();
	private buf = '';
	private dead = false;

	constructor(script = SIDECAR_SCRIPT) {
		this.proc = Bun.spawn(['python3', script], {
			stdin: 'pipe',
			stdout: 'pipe',
			stderr: 'inherit',
			env: { ...process.env, CUDA_VISIBLE_DEVICES: '' }
		});
		void this.pump();
		void this.proc.exited.then(() => {
			this.dead = true;
			for (const [, wait] of this.pending) {
				wait.reject(new SidecarDownError('sidecar exited'));
			}
			this.pending.clear();
		});
	}

	async health(): Promise<HealthInfo> {
		if (this.dead) return { state: 'down', provider: PROVIDER, model: MODEL_ID };
		try {
			const out = await this.rpc({ op: 'health' });
			return {
				state: asState(out.state, out.ok),
				provider: out.provider ?? PROVIDER,
				model: out.model ?? MODEL_ID
			};
		} catch {
			return { state: 'down', provider: PROVIDER, model: MODEL_ID };
		}
	}

	async transcribe(input: TranscribeInput): Promise<{ text: string }> {
		if (this.dead) throw new SidecarDownError();
		const out = await this.rpc({
			op: 'transcribe',
			wav_path: input.wav_path,
			pcm_f32: input.pcm_f32,
			sample_rate: input.sample_rate
		});
		if (!out.ok) {
			if (out.http === 422) throw new ShapeError(out.error ?? 'wrong sample shape');
			throw new SidecarDownError(out.error ?? 'sidecar down');
		}
		return { text: out.text ?? '' };
	}

	private async rpc(body: Record<string, unknown>, timeoutMs = 30_000): Promise<WireOut> {
		const id = crypto.randomUUID();
		const stdin = this.proc.stdin;
		if (!stdin || typeof stdin === 'number') throw new SidecarDownError('no stdin');
		const p = new Promise<WireOut>((resolve, reject) => {
			const t = setTimeout(() => {
				this.pending.delete(id);
				reject(new SidecarDownError('sidecar timeout'));
			}, timeoutMs);
			this.pending.set(id, {
				resolve: (v) => {
					clearTimeout(t);
					resolve(v);
				},
				reject: (e) => {
					clearTimeout(t);
					reject(e);
				}
			});
		});
		stdin.write(`${JSON.stringify({ id, ...body })}\n`);
		return p;
	}

	private async pump() {
		const stdout = this.proc.stdout;
		if (!stdout || typeof stdout === 'number') return;
		const decoder = new TextDecoder();
		for await (const chunk of stdout as ReadableStream<Uint8Array>) {
			this.buf += decoder.decode(chunk, { stream: true });
			let nl = this.buf.indexOf('\n');
			while (nl >= 0) {
				const line = this.buf.slice(0, nl).trim();
				this.buf = this.buf.slice(nl + 1);
				if (line) {
					try {
						const msg = JSON.parse(line) as WireOut;
						const wait = this.pending.get(msg.id);
						if (wait) {
							this.pending.delete(msg.id);
							wait.resolve(msg);
						}
					} catch {
						// ignore non-JSONL noise on stdout
					}
				}
				nl = this.buf.indexOf('\n');
			}
		}
	}
}
