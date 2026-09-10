# add-parakeet-stream

> **ACTIVE BUILD**

## Why

Clip POST is not a pipe. Callers need to stream 16 kHz mono PCM and
read text as it is decoded, still on CPU.

## What

- Stream operation on the same Bun app and the same well-known spec
- 16 kHz mono PCM in; NDJSON or SSE `{text, t0, t1}` out
- Windowed TDT (VAD or N-second), not Unified RNNT
- Capability: `parakeet-asr`

## Impact

- Capabilities: MODIFIED `parakeet-asr` (stream)
- ADRs: none

## User journey & surfaces

A client opens the stream listed in `/.well-known/openapi.json` and
pipes PCM. No new UI because the pipe is the API.

## Out of scope

- Word-by-word Unified partials
- Mic capture (cpal / Papyrus)
- Browser Pages client
