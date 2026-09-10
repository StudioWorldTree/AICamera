## ADDED Requirements

### Requirement: Well-known OpenAPI
The ASR process SHALL publish the current OpenAPI 3.1 document at
`GET /.well-known/openapi.json`. The body SHALL be the same bytes as
`GET /api/v1/openapi.json`. The document SHALL set `servers` to the
`/api/v1` base so path keys are relative to it. `GET /.well-known/api-catalog`
SHALL be an RFC 9727 linkset pointing at those two URLs. The well-known
URL SHALL NOT return HTML. Agents SHALL discover operations from this
document, not from a hardcoded route list.

#### Scenario: agent discovers the API
- GIVEN the ASR process is bound on the tailnet
- WHEN an agent `GET /.well-known/openapi.json`
- THEN the response is OpenAPI 3.1 JSON, `servers` includes `/api/v1`,
  and `paths` lists `/transcribe` and `/health` relative to that base

#### Scenario: well-known matches versioned
- GIVEN the generated spec
- WHEN `GET /.well-known/openapi.json` and `GET /api/v1/openapi.json`
- THEN the two bodies are identical

### Requirement: Bun Hono REST
The ASR HTTP surface SHALL be a standalone Bun process using Hono and
`@hono/zod-openapi`. Features SHALL land as `createRoute` operations
before any other client. The process SHALL NOT be mounted inside the
SvelteKit `adapter-static` app.

#### Scenario: spec first
- GIVEN a new transcribe field
- WHEN it is callable
- THEN it appears in `/.well-known/openapi.json` from the Zod route

### Requirement: CPU-only Parakeet
Transcription SHALL run NVIDIA Parakeet TDT 0.6B v3 INT8 on CPU
(`CPUExecutionProvider`). The sidecar SHALL run with `CUDA_VISIBLE_DEVICES`
empty and ONNX Runtime intra-op threads ≤ 4. The ASR process and sidecar
SHALL NOT create a CUDA context. The 3090 SHALL remain available for 30 fps
plugins.

#### Scenario: transcribe leaves the GPU idle
- GIVEN compositor-only VRAM (~319 MiB)
- WHEN a clip is transcribed
- THEN `nvidia-smi` memory.used is unchanged and no python/onnx CUDA process appears

#### Scenario: transcribe beside 30 fps plugins
- GIVEN the 30 fps plugin stack is running on the 3090
- WHEN a clip is transcribed on the sidecar
- THEN intra-op threads stay ≤ 4 and plugin frame time does not regress from the CPU steal

### Requirement: Tailscale bind
The ASR process SHALL bind the Tailscale IPv4 only (default
`100.103.147.70:8750`) and SHALL NOT listen on `0.0.0.0`. The sidecar
SHALL NOT open a network listener; it is a child of the Bun process on
stdin/IPC. Bun SHALL be the sole tailnet socket.

#### Scenario: no public bind
- GIVEN the unit is running
- WHEN `ss` or `lsof` lists the ASR port
- THEN the listen address is the Tailscale IP, not `0.0.0.0` or `*`

#### Scenario: sidecar has no port
- GIVEN the sidecar is warm
- WHEN listeners on the box are listed
- THEN only Bun holds `:8750` on the Tailscale IP; the sidecar has no TCP/UDP bind

### Requirement: Clip transcribe
`POST /api/v1/transcribe` SHALL accept 16 kHz mono audio (WAV or raw
PCM as declared in the spec) and return JSON with the transcript text.
A warm sidecar SHALL serve the second call without reloading weights.
Wrong sample shape SHALL be 422. Non-audio content-type SHALL be 415.
Sidecar unavailable SHALL be 503. `GET /api/v1/health` SHALL report
sidecar `warm | cold | down`, provider `CPUExecutionProvider`, and
model id, and SHALL be listed in the well-known document.

#### Scenario: known wav
- GIVEN `2086-149220-0033.wav` and a warm sidecar
- WHEN `POST /api/v1/transcribe`
- THEN the body includes text about Phoebe and the old portrait

#### Scenario: health before a clip
- GIVEN the sidecar is warm
- WHEN `GET /api/v1/health`
- THEN the body says `warm`, provider is `CPUExecutionProvider`, and
  the well-known spec lists `/health`

### Requirement: Audio stream pipe
The API SHALL accept a 16 kHz mono PCM stream and emit transcript
segments as NDJSON `{text, t0, t1, final}`. Windowed TDT (VAD or
fixed windows) is the v1 decoder. v1 stream clients are non-browser.
The stream operation SHALL appear in `/.well-known/openapi.json`.
End-of-stream is connection close; the last event SHALL set `final: true`.

#### Scenario: pipe PCM
- GIVEN a 16 kHz mono PCM stream of spoken English
- WHEN a client opens the stream operation
- THEN NDJSON text events arrive without a CUDA process on the 3090
