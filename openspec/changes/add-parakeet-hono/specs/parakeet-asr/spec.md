## ADDED Requirements

### Requirement: Well-known spec is served
The Bun process SHALL serve `GET /.well-known/openapi.json` as OpenAPI
3.1 generated from Zod routes. The body SHALL equal
`GET /api/v1/openapi.json`. `POST /api/v1/transcribe` SHALL be listed.

#### Scenario: curl well-known
- GIVEN the Bun process is up on the tailnet
- WHEN `curl -sf http://100.103.147.70:8750/.well-known/openapi.json`
- THEN `openapi` starts with `3.`, `servers` includes `/api/v1`, and
  `paths` includes `/transcribe` and `/health`
