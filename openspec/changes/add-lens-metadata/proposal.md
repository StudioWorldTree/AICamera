# add-lens-metadata

> **ACTIVE BUILD**

## Why

Matchmove, AD, and splat-readiness need real focal length, T-stop, and
focus, not a scripty guess. Cooke /i is the cine interchange.

## What

- /i-class stream from **each** camera, sidecar JSONL 1:1 with HEVC
- Body: PL pins or barrel port; sats: barrel /i → Ethernet (Lockit+ class)
- Capability: `hardware-kit`

## Impact

- Capabilities: ADDED lens metadata
- ADRs: none

## User journey & surfaces

No new UI because this is a sidecar next to picture. Continuity and VFX
read the JSONL; the EVF may overlay T-stop later.

## Out of scope

- Implementing a /i parser in this change
- Buying Lockit+ / PL reader SKUs (datasheet pack)
