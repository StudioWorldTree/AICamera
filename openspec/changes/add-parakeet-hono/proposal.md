# add-parakeet-hono

> **ACTIVE BUILD**

## Why

Agents need a generated OpenAPI document at a well-known URL, then a
clip POST. Pages cannot host this. Bun + Hono on the tailnet can.

## What

- Bun process, Hono + `@hono/zod-openapi`
- `GET /.well-known/openapi.json` (canonical), `/api/v1/openapi.json`
  (same bytes), `GET /.well-known/api-catalog` (RFC 9727)
- `POST /api/v1/transcribe` for a clip
- Bind `100.103.147.70:8750` only
- Capability: `parakeet-asr`

## Impact

- Capabilities: MODIFIED `parakeet-asr` (HTTP + discovery)
- ADRs: none (process split is `add-parakeet-api`)

## User journey & surfaces

An agent GETs well-known, then POSTs audio. No new UI because the
contract is the spec.

## Out of scope

- Stream pipe (`add-parakeet-stream`)
- Swagger UI chrome (optional later; spec is the product)
- IdentiKey
