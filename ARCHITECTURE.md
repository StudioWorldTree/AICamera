# Architecture

`cartridge-runtime` is the catalog and packer contract. The catalog JSON
is `sim/3090/catalog.json`. Packing (`add-cartridge-pack`) is later.

## Parakeet ASR process (add-parakeet-api)

GitHub Pages is adapter-static SSG. The ASR API is a **standalone Bun
process** on fractal1 (`asr/server`), sibling to `aicam-bay-feed`
(`:8745`), not mounted in SvelteKit. Bind is the Tailscale IPv4 only on
**`:8750`**. UPnP is on; never `0.0.0.0`.

```
caller --HTTP--> Bun Hono :8750  --stdin/IPC-->  Python onnx-asr sidecar
                 OpenAPI here                    INT8 TDT v3, CPU EP
```

Hono owns HTTP, Zod, and the generated OpenAPI 3.1 document. The sidecar
owns the model (`CUDA_VISIBLE_DEVICES=` empty, `CPUExecutionProvider`,
≤4 intra-op threads). The sidecar has no network listener; Bun is the
sole tailnet socket.

Discovery copies daBOM: `GET /.well-known/openapi.json` (canonical,
`servers: [{ url: '/api/v1' }]`) is the same bytes as
`GET /api/v1/openapi.json`; `GET /.well-known/api-catalog` is RFC 9727.
Agents read well-known. Clip is `POST /api/v1/transcribe`; stream is
windowed TDT emitting NDJSON `{text, t0, t1, final}`.
