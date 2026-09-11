import { describe, expect, test } from 'bun:test';
import { createApi } from './app';
import { bindIp, DEFAULT_TAILSCALE_IP } from './bind';
import { createRoot } from './root';
import { MODEL_ID, PROVIDER, downSidecar, warmSidecar, type Sidecar } from './sidecar';
import { WINDOW_SECONDS } from './stream';
import { SAMPLE_RATE, writeWavPcm16 } from './wav';

function wav(n = 1600, rate = SAMPLE_RATE, channels = 1) {
	return writeWavPcm16(new Int16Array(n * channels), rate, channels);
}

describe('discovery', () => {
	const root = createRoot(createApi(warmSidecar()));

	test('well-known equals versioned spec', async () => {
		const wellKnown = await root.request('/.well-known/openapi.json');
		const versioned = await root.request('/api/v1/openapi.json');
		expect(wellKnown.status).toBe(200);
		expect(versioned.status).toBe(200);
		expect(await wellKnown.text()).toBe(await versioned.text());
	});

	test('servers /api/v1 and relative paths', async () => {
		const spec = await (await root.request('/.well-known/openapi.json')).json();
		expect(spec.openapi).toMatch(/^3\.1/);
		expect(spec.servers.some((s: { url: string }) => s.url === '/api/v1')).toBe(true);
		expect(spec.paths['/transcribe']).toBeTruthy();
		expect(spec.paths['/health']).toBeTruthy();
		expect(spec.paths['/stream']).toBeTruthy();
		expect(spec.paths['/api/v1/transcribe']).toBeUndefined();
	});

	test('rfc 9727 catalog', async () => {
		const res = await root.request('/.well-known/api-catalog');
		expect(res.status).toBe(200);
		expect(res.headers.get('content-type')).toMatch(/linkset\+json/);
		const cat = await res.json();
		expect(
			cat.linkset[0].describedby.some(
				(l: { href: string }) => l.href === '/.well-known/openapi.json'
			)
		).toBe(true);
	});
});

describe('health', () => {
	test('200 warm', async () => {
		const root = createRoot(createApi(warmSidecar()));
		const res = await root.request('/api/v1/health');
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.sidecar).toBe('warm');
		expect(body.provider).toBe('CPUExecutionProvider');
		expect(body.model).toBeTruthy();
	});

	test('200 when sidecar down', async () => {
		const root = createRoot(createApi(downSidecar()));
		const res = await root.request('/api/v1/health');
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.sidecar).toBe('down');
	});
});

describe('transcribe', () => {
	test('415 non-audio', async () => {
		const root = createRoot(createApi(warmSidecar()));
		const res = await root.request('/api/v1/transcribe', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ nope: true })
		});
		expect(res.status).toBe(415);
	});

	test('422 wrong sample rate', async () => {
		const root = createRoot(createApi(warmSidecar()));
		const res = await root.request('/api/v1/transcribe', {
			method: 'POST',
			headers: { 'content-type': 'audio/wav' },
			body: wav(800, 8000, 1)
		});
		expect(res.status).toBe(422);
	});

	test('503 sidecar down', async () => {
		const root = createRoot(createApi(downSidecar()));
		const res = await root.request('/api/v1/transcribe', {
			method: 'POST',
			headers: { 'content-type': 'audio/wav' },
			body: wav()
		});
		expect(res.status).toBe(503);
	});
});

function pcm16le(seconds: number): Uint8Array {
	return new Uint8Array(seconds * SAMPLE_RATE * 2);
}

function ndjson(text: string) {
	return text
		.split('\n')
		.map((s) => s.trim())
		.filter(Boolean)
		.map((s) => JSON.parse(s) as { text: string; t0: number; t1: number; final: boolean });
}

describe('stream', () => {
	test('spec lists /stream PCM in and NDJSON out', async () => {
		const root = createRoot(createApi(warmSidecar()));
		const spec = await (await root.request('/.well-known/openapi.json')).json();
		const post = spec.paths['/stream']?.post;
		expect(post).toBeTruthy();
		expect(post.requestBody.content['application/octet-stream']).toBeTruthy();
		expect(post.requestBody.content['audio/L16']).toBeTruthy();
		expect(post.responses['200'].content['application/x-ndjson']).toBeTruthy();
	});

	test('fake sidecar yields two NDJSON events then final', async () => {
		let n = 0;
		const sidecar: Sidecar = {
			async health() {
				return { state: 'warm', provider: PROVIDER, model: MODEL_ID };
			},
			async transcribe() {
				n += 1;
				return { text: `seg ${n}` };
			}
		};
		const root = createRoot(createApi(sidecar));
		const res = await root.request('/api/v1/stream', {
			method: 'POST',
			headers: { 'content-type': 'application/octet-stream' },
			body: pcm16le(WINDOW_SECONDS * 2)
		});
		expect(res.status).toBe(200);
		expect(res.headers.get('content-type')).toMatch(/ndjson/);
		const events = ndjson(await res.text());
		expect(n).toBe(2);
		expect(events).toHaveLength(2);
		expect(events[0]).toEqual({ text: 'seg 1', t0: 0, t1: WINDOW_SECONDS, final: false });
		expect(events[1]).toEqual({
			text: 'seg 2',
			t0: WINDOW_SECONDS,
			t1: WINDOW_SECONDS * 2,
			final: true
		});
	});

	test('415 non-pcm', async () => {
		const root = createRoot(createApi(warmSidecar()));
		const res = await root.request('/api/v1/stream', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ nope: true })
		});
		expect(res.status).toBe(415);
	});

	test('503 sidecar down', async () => {
		const root = createRoot(createApi(downSidecar()));
		const res = await root.request('/api/v1/stream', {
			method: 'POST',
			headers: { 'content-type': 'application/octet-stream' },
			body: pcm16le(WINDOW_SECONDS)
		});
		expect(res.status).toBe(503);
	});
});

describe('bind', () => {
	test('TAILSCALE_IP wins and is not a public wildcard', () => {
		const prev = process.env.TAILSCALE_IP;
		process.env.TAILSCALE_IP = '100.64.0.1';
		try {
			expect(bindIp()).toBe('100.64.0.1');
		} finally {
			if (prev === undefined) delete process.env.TAILSCALE_IP;
			else process.env.TAILSCALE_IP = prev;
		}
	});

	test('default is fractal1 tailnet v4', () => {
		expect(DEFAULT_TAILSCALE_IP).toBe('100.103.147.70');
	});
});
