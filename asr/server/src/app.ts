import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { stream } from 'hono/streaming';
import { ErrorSchema, HealthSchema, StreamEventSchema, TranscribeSchema } from './schemas';
import { MODEL_ID, PROVIDER, SidecarDownError, type Sidecar } from './sidecar';
import { requestChunks, windowedTranscribe } from './stream';
import { parseContentType, parseL16, parseWav, SAMPLE_RATE, ShapeError } from './wav';

const json = <T>(schema: T, description: string) => ({
	content: { 'application/json': { schema } },
	description
});

function err(status: 415 | 422 | 503, description: string) {
	return { [status]: json(ErrorSchema, description) } as const;
}

const AUDIO_TYPES = new Set(['audio/wav', 'audio/wave', 'audio/x-wav', 'audio/l16', 'audio/pcm']);
const STREAM_TYPES = new Set(['application/octet-stream', 'audio/l16']);

const BinaryAudio = z.string().openapi({
	type: 'string',
	format: 'binary',
	description: '16 kHz mono WAV or audio/L16 PCM. No resample.'
});

const BinaryPcm = z.string().openapi({
	type: 'string',
	format: 'binary',
	description:
		'16 kHz mono PCM. application/octet-stream is s16le; audio/L16 is s16be. No resample.'
});

export function createApi(sidecar: Sidecar) {
	const app = new OpenAPIHono({
		defaultHook: (result, c) => {
			if (!result.success) {
				return c.json({ error: 'validation failed', details: result.error.flatten() }, 422);
			}
		}
	});

	app.onError((err, c) => {
		if (err instanceof ShapeError) {
			return c.json({ error: err.message, details: null }, 422);
		}
		if (err instanceof SidecarDownError) {
			return c.json({ error: err.message, details: null }, 503);
		}
		console.error(err);
		return c.json({ error: err instanceof Error ? err.message : 'internal error' }, 500);
	});

	app.openapi(
		createRoute({
			method: 'get',
			path: '/health',
			tags: ['Meta'],
			summary: 'Sidecar liveness',
			description:
				'Always 200. Sidecar state is in the body (warm | cold | down). 503 is reserved for POST /transcribe.',
			responses: { 200: json(HealthSchema, 'ok') }
		}),
		async (c) => {
			let info;
			try {
				info = await sidecar.health();
			} catch {
				info = { state: 'down' as const, provider: PROVIDER, model: MODEL_ID };
			}
			return c.json({
				sidecar: info.state,
				provider: info.provider,
				model: info.model
			});
		}
	);

	app.openapi(
		createRoute({
			method: 'post',
			path: '/transcribe',
			tags: ['ASR'],
			summary: 'Transcribe a 16 kHz mono clip',
			description:
				'WAV (audio/wav) or raw PCM (audio/L16; rate=16000; channels=1). Wrong sample shape is 422. Non-audio content-type is 415. Sidecar down is 503. The sidecar does not resample.',
			middleware: [
				async (c, next) => {
					const { type } = parseContentType(c.req.header('content-type'));
					if (!AUDIO_TYPES.has(type)) {
						return c.json({ error: 'unsupported media type', details: type || null }, 415);
					}
					await next();
				}
			],
			request: {
				body: {
					required: true,
					content: {
						'audio/wav': { schema: BinaryAudio },
						'audio/L16': { schema: BinaryAudio }
					}
				}
			},
			responses: {
				200: json(TranscribeSchema, 'Transcript'),
				...err(415, 'Non-audio content-type'),
				...err(422, 'Wrong sample shape (not 16 kHz mono)'),
				...err(503, 'Sidecar unavailable')
			}
		}),
		async (c) => {
			const { type, params } = parseContentType(c.req.header('content-type'));
			const bytes = new Uint8Array(await c.req.arrayBuffer());
			const pcm =
				type === 'audio/l16' || type === 'audio/pcm'
					? parseL16(bytes, {
							rate: params.rate ? Number(params.rate) : SAMPLE_RATE,
							channels: params.channels ? Number(params.channels) : 1
						})
					: parseWav(bytes).pcmF32;
			const result = await sidecar.transcribe({ pcm_f32: pcm, sample_rate: SAMPLE_RATE });
			return c.json({ text: result.text });
		}
	);

	// PCM stream pipe: openspec/changes/add-parakeet-stream and add-parakeet-api Audio stream pipe.
	app.openapi(
		createRoute({
			method: 'post',
			path: '/stream',
			tags: ['ASR'],
			summary: 'PCM stream pipe',
			description: [
				'16 kHz mono PCM in (application/octet-stream s16le or audio/L16 s16be).',
				'Windowed TDT: 4 s windows via sidecar.transcribe.',
				'NDJSON {text, t0, t1, final}. Last event final:true after request body ends (half-close).',
				'v1 clients are non-browser.'
			].join(' '),
			middleware: [
				async (c, next) => {
					const { type } = parseContentType(c.req.header('content-type'));
					if (!STREAM_TYPES.has(type)) {
						return c.json({ error: 'unsupported media type', details: type || null }, 415);
					}
					await next();
				}
			],
			request: {
				body: {
					required: true,
					content: {
						'application/octet-stream': { schema: BinaryPcm },
						'audio/L16': { schema: BinaryPcm }
					}
				}
			},
			responses: {
				200: {
					content: { 'application/x-ndjson': { schema: StreamEventSchema } },
					description: 'NDJSON segments; last event final:true'
				},
				...err(415, 'Non-audio content-type'),
				...err(422, 'Wrong sample shape (not 16 kHz mono)'),
				...err(503, 'Sidecar unavailable')
			}
		}),
		async (c) => {
			const { type, params } = parseContentType(c.req.header('content-type'));
			const rate = params.rate ? Number(params.rate) : SAMPLE_RATE;
			const channels = params.channels ? Number(params.channels) : 1;
			if (rate !== SAMPLE_RATE || channels !== 1) {
				throw new ShapeError('expected 16 kHz mono');
			}
			const info = await sidecar.health();
			if (info.state === 'down') throw new SidecarDownError();

			c.header('Content-Type', 'application/x-ndjson');
			const littleEndian = type === 'application/octet-stream';
			return stream(c, async (out) => {
				for await (const ev of windowedTranscribe(requestChunks(c.req.raw), {
					littleEndian,
					transcribe: async (pcm) => {
						const result = await sidecar.transcribe({
							pcm_f32: pcm,
							sample_rate: SAMPLE_RATE
						});
						return result.text;
					}
				})) {
					await out.writeln(JSON.stringify(ev));
				}
			});
		}
	);

	// daBOM src/lib/server/api/app.ts: servers [{ url: '/api/v1' }] so path keys are relative.
	app.doc31('/openapi.json', {
		openapi: '3.1.0',
		info: {
			title: 'AICamera Parakeet ASR',
			version: '0.1.0',
			description: [
				'CPU-only Parakeet TDT 0.6B v3 INT8 on the tailnet.',
				'Canonical discovery: /.well-known/openapi.json',
				'servers /api/v1; paths /transcribe, /health, and /stream are relative to that base.'
			].join('\n')
		},
		servers: [{ url: '/api/v1', description: 'Versioned REST' }],
		externalDocs: {
			description: 'Well-known OpenAPI document',
			url: '/.well-known/openapi.json'
		},
		tags: [{ name: 'Meta' }, { name: 'ASR' }]
	});

	return app;
}
