# add-cartridge-pack

> **PENDING**

**Rigor:** instrument

## Why

The catalog says what a legal pack is. Nothing yet takes a desired set
and returns resident / refused / evict. Without that function the 3090
loader has nothing to call. The slot board lives with the bay in fractal1-web.

## What

- Pure packer over `sim/3090/catalog.json` (no GPU)
- Input: desired cartridge ids + envelope id (default `3090`)
- Output: `{resident, refused, evict}`
- Living rules: always-on reserved; exclusive tags; swap = Σ(always-on)+max(slottable); resident = sum; watts is sag not bounce
- Property tests including 4K-pair refusal and 3090 swap-set
- Capability: `cartridge-runtime`

## Impact

- Capabilities: MODIFIED `cartridge-runtime` (packer function)
- ADRs: none

## User journey & surfaces

No new UI in this notebook. The slot board is `add-cartridge-glass` in fractal1-web. This change is
the function the harness will call. CLI: `python3 sim/3090/pack.py --envelope 3090 klein-4b sam2-tiny`.

## Out of scope

- GPU load/unload (`add-3090-cartridge-load`)
- Slot-board glass (`add-cartridge-glass`)
- Treating watts as a seat/bounce axis (living spec: sag)
