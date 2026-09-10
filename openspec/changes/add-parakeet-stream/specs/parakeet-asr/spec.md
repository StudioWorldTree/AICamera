## ADDED Requirements

### Requirement: Stream listed in well-known
The well-known OpenAPI document SHALL list the audio stream operation
(method, path, `application/octet-stream` PCM in, `application/x-ndjson`
events out).

#### Scenario: spec names the pipe
- GIVEN the Bun process
- WHEN `GET /.well-known/openapi.json`
- THEN an operation exists whose description is the PCM stream pipe
