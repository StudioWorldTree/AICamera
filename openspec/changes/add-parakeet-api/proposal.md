# add-parakeet-api

> **ACTIVE BUILD**

## Why

The 3090 stays on 30 fps plugins. Parakeet runs on the 14600KF. Callers
need a machine-readable contract so any agent can pipe audio and get
text without reading this notebook. This repo is adapter-static Pages
today; the only HTTP is the bay loadout feed. The API is a new process.

## What

- Capability **ADDED:** `parakeet-asr`
- Standalone Bun + Hono + `@hono/zod-openapi` on fractal1
- Canonical spec at `GET /.well-known/openapi.json` (OpenAPI 3.1), same
  bytes as `/api/v1/openapi.json`, plus RFC 9727 `/.well-known/api-catalog`
- CPU INT8 Parakeet TDT 0.6B v3; no CUDA context
- Tailscale bind only (port 8750, not bay 8745)
- Clip transcribe and a 16 kHz mono PCM stream that emits text
- Steal Papyrus CPU-when-strong + PCM contract; do not vendor morphist-asr

## Impact

- Capabilities: ADDED `parakeet-asr`
- ADRs: will amend ARCHITECTURE.md (Bun process beside Pages SSG)

## User journey & surfaces

An agent or CLI on the tailnet discovers the API, then posts or streams
audio.

- **Working:** `GET /.well-known/openapi.json` lists operations. `POST /api/v1/transcribe` returns text. A PCM stream yields NDJSON/SSE lines. `nvidia-smi` stays compositor-only.
- **Empty:** model not loaded yet. Health says so; transcribe is 503, not a hang.
- **Failed:** bad audio shape (not 16 kHz mono) is 422 from the spec. Sidecar down is 503.
- **Off (GitHub Pages visitor):** Pages does not proxy this API. No mixed-content fetch.

No new UI because the surface is REST + OpenAPI. Bay glass does not own ASR.

## Out of scope

- GPU / CUDA / NIM Parakeet (keeps the 3090 for plugins)
- Vendoring Papyrus Tauri, cpal, CoreML
- Unified RNNT word-by-word partials (later; windowed TDT is v1)
- IdentiKey login (tailnet is the gate, like bay)
- Mounting Hono inside SvelteKit `adapter-static`
- daBOM PGLite / quotes
