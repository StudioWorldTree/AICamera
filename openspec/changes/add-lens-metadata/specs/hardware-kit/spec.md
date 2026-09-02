## ADDED Requirements

### Requirement: Cooke /i–class lens sidecar
Each camera, body and satellite, SHALL produce frame-accurate lens
metadata in Cooke /i (or ARRI LDS, ZEISS XD, or EF electronic mapped
into the same fields). Thor SHALL write it as a JSONL sidecar 1:1 with
that camera’s HEVC timecode. RAW lens maps (/i3 distortion, shading)
SHALL be files on the NAS keyed by lens identity, not per-frame blobs.

#### Scenario: body and two sats
- GIVEN three cameras recording
- WHEN a take is written to the NAS
- THEN each HEVC file has a sibling JSONL with at least make, serial,
  true focal length, T-stop, and focus distance locked to timecode
