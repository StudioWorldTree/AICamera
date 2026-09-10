# Tasks

- [ ] Bun workspace `asr/` with Hono + `@hono/zod-openapi` + Zod routes
- [ ] `app.doc31('/openapi.json')`; root serves `/.well-known/openapi.json` as the same bytes
- [ ] RFC 9727 `/.well-known/api-catalog`
- [ ] `POST /api/v1/transcribe` wired to the warm sidecar
- [ ] Bind Tailscale IPv4 `:8750` only
- [ ] `bun test` via `app.request` for spec equality + transcribe 422/503 shapes
