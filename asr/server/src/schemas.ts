import { z } from '@hono/zod-openapi';

export const ErrorSchema = z
	.object({
		error: z.string(),
		details: z.unknown().nullable().optional()
	})
	.openapi('Error');

export const HealthSchema = z
	.object({
		sidecar: z.enum(['warm', 'cold', 'down']),
		provider: z.literal('CPUExecutionProvider'),
		model: z.string()
	})
	.openapi('Health');

export const TranscribeSchema = z
	.object({
		text: z.string()
	})
	.openapi('Transcript');

export const StreamEventSchema = z
	.object({
		text: z.string(),
		t0: z.number(),
		t1: z.number(),
		final: z.boolean()
	})
	.openapi('StreamEvent');
