# add-parakeet-engine

> **ACTIVE BUILD**

## Why

Hono must talk to a warm CPU Parakeet, not cold-start onnx-asr per
request (first load was ~40 s). The 3090 stays on plugins.

## What

- Long-lived INT8 TDT 0.6B v3 sidecar on fractal1
- `CPUExecutionProvider`, `CUDA_VISIBLE_DEVICES` empty, 4 threads
- Transcribe a WAV; second call does not reload weights
- Capability: `parakeet-asr`

## Impact

- Capabilities: MODIFIED `parakeet-asr` (engine)
- ADRs: none

## User journey & surfaces

Bun calls the sidecar. No new UI because the surface is the REST process.

## Out of scope

- HTTP/OpenAPI (`add-parakeet-hono`)
- PCM stream windows (`add-parakeet-stream`)
- CUDA / NeMo / NIM
