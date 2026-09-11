import { describe, expect, test } from 'bun:test';
import { createApi } from './app';
import { bindIp, DEFAULT_TAILSCALE_IP } from './bind';
import { createRoot } from './root';
import { downSidecar, warmSidecar } from './sidecar';
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
