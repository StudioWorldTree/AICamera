# hardware-kit

Living spec for the All Systems Go camera body. In-flight deltas:
`openspec/changes/*/specs/hardware-kit/`.

## Purpose

CAD and buys use envelopes and URLs from `docs/references/`, not folklore.

## Requirements

### Requirement: Datasheet manifest
Every steered SKU SHALL have a PDF or URL, fetch date, and mechanical
envelope listed under `docs/references/`.

#### Scenario: Thor SOM
- GIVEN DS-11945-001 v1.4 in `docs/references/`
- WHEN CAD or power work starts
- THEN envelopes come from [T4000.md](../../../docs/references/T4000.md), not memory

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

### Requirement: First-article enclosure
The first printable enclosure SHALL fit the AGX Thor Developer Kit
envelope and provide a body-camera mount plus TTP ventilation.

#### Scenario: Anycubic fit-check
- GIVEN the AGX kit dimensions 243.19 × 112.40 × 56.88 mm
- WHEN an STL is printed in resin
- THEN the kit seats, the body cam has a mount, and vents do not cover the TTP
