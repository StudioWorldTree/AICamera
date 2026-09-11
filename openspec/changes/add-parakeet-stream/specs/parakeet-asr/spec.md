## ADDED Requirements

### Requirement: Stream listed in well-known
The well-known OpenAPI document SHALL list the audio stream operation
(method, path, `application/octet-stream` PCM in, `application/x-ndjson`
events out).

#### Scenario: spec names the pipe
- GIVEN the Bun process
- WHEN `GET /.well-known/openapi.json`
- THEN an operation exists whose description is the PCM stream pipe

### Requirement: Windowed PCM stream
`POST /api/v1/stream` SHALL accept 16 kHz mono PCM
(`application/octet-stream` s16le or `audio/L16` s16be) and emit
`application/x-ndjson` lines `{text, t0, t1, final}`. Windows default
to 4 s and each window SHALL call the sidecar transcribe RPC. After
the request body ends (half-close), the last event SHALL set
`final: true`. v1 stream clients are non-browser.

#### Scenario: two windows then final
- GIVEN a fake sidecar and 8 s of 16 kHz mono PCM
- WHEN `POST /api/v1/stream`
- THEN two NDJSON events arrive, the last with `final: true`
