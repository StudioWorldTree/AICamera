# Design: parakeet-asr

## Process split

GitHub Pages is static. The ASR API is a **Bun** process on fractal1,
sibling to `aicam-bay-feed` (`:8745`), bound to the Tailscale IPv4 only
on **`:8750`**. UPnP is on; never `0.0.0.0`.

```
caller --HTTP--> Bun Hono :8750  --stdin/IPC-->  Python onnx-asr sidecar
                 OpenAPI here                    INT8 TDT v3, CPU EP
```

Hono owns HTTP, Zod, and the spec. The sidecar owns the model. Bun does
not `dlopen` CUDA. The sidecar sets `CUDA_VISIBLE_DEVICES=` and
`providers=["CPUExecutionProvider"]`. Four intra-op threads.

Papyrus `morphist-asr` is the policy source (CPU-when-AVX2, 16 kHz mono
f32, INT8 ONNX, keep the dGPU free). It is utterance-batch, CoreML on
Apple, and a Tauri crate. We do not vendor it.

## Discovery

Copy daBOM, not the SvelteKit mount:

| URL | Body |
|---|---|
| `GET /.well-known/openapi.json` | OpenAPI 3.1, canonical; `servers: [{ url: '/api/v1' }]` |
| `GET /api/v1/openapi.json` | same bytes |
| `GET /.well-known/api-catalog` | RFC 9727 linkset |

`app.doc31('/openapi.json', …)` generates the document from
`createRoute`. Agents read well-known. Do not hard-code path lists in
clients in this repo.

## Audio

Input is 16 kHz mono PCM (or WAV that already is that). Wrong sample
shape is 422. Non-audio content-type is 415. The sidecar does not
resample or mix channels. Clip `POST` is one utterance. Stream is
windowed TDT (VAD or N-second chunks) emitting NDJSON
`{text, t0, t1, final}`. v1 stream clients are non-browser. No Unified
RNNT in this change.

The sidecar is a child of the Bun process on stdin/IPC. It does not
open a network listener. Bun is the sole tailnet socket.

## GPU

A new CUDA process during transcribe is a failed acceptance, not a
warning. Bay feed stays the 3090 tenant.
