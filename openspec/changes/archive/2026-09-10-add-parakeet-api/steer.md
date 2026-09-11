# steer add-parakeet-api

**When.** 2026-09-10
**Depth.** standard

## Decided
- Discovery: `/.well-known/openapi.json` + `/.well-known/api-catalog` (user). Same bytes as `/api/v1/openapi.json`. daBOM shape on this repo's Bun process.
- Engine: warm Python onnx-asr INT8 sidecar on fractal1 (decide-for-me / intend recommended). Do not vendor morphist-asr.
- Bind: Tailscale-only, port 8750, never `0.0.0.0` (decide-for-me).
- Stream: windowed TDT, PCM in, NDJSON/SSE text out (decide-for-me). Unified partials later.
- Runtime: standalone Bun + Hono + `@hono/zod-openapi` (decide-for-me). Not SvelteKit, not daBOM `hooks.server.ts`.
- Activate all four DAG nodes (user).

## Skipped
- none

## Feeds change
Publish the generated OpenAPI 3.1 document at a well-known URL so any
agent can discover transcribe and stream without reading the notebook.
CPU-only Parakeet beside the Pages app; GPU stays on 30 fps plugins.
