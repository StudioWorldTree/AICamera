# Tasks

- [x] Bun workspace `asr/server/` with Hono + `@hono/zod-openapi` + Zod routes
- [x] `app.doc31('/openapi.json')`; root serves `/.well-known/openapi.json` as the same bytes
- [x] RFC 9727 `/.well-known/api-catalog`
- [x] `POST /api/v1/transcribe` wired to the warm sidecar
- [x] Bind Tailscale IPv4 `:8750` only
- [x] `bun test` via `app.request` for spec equality + transcribe 422/503 shapes
