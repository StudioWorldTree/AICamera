# Design — cartridge catalog

Steered 2026-09-10 (user: modes as presets, knapsack + physics tags,
live-brick envelope, glass on `/bay`).

A **cartridge** is a named slottable unit. Kind is `model` (HF net) or
`plugin` (engine/filter: NVENC, cuVSLAM, Maxine, CUDA look-dev). Shelf is
`always-on`, `slottable`, or `never-on-thor`.

Always-on reserved: HEVC encode (NVENC) and cuVSLAM. Drop AI, never record.

Named modes (Master capture, Creative snap, AD, Live AR, Talent tracking)
are preset arrays of cartridge ids, not a second exclusive runtime.

## Catalog record

Seed file: `sim/3090/catalog.json`. 3090 FACT from `docs/3090-SIM.md`
Measured (2026-09-09). klein 16 GB is **disk weights**, not a VRAM peak —
that cost is `fact: false`. T4000 uses `unified_gb`. Null is unmeasured.

On `3090` the packer uses Σ(always-on) + max(slottable). On `t4000` /
`6000` it sums. Exclusive tags: `klein-27b`; `sam2-maxine-4k` only on
4K-class ids.

## Source of truth

- Job names and licenses: `~/work/Family/web3d-space/docs/all-systems-go/MODELS.md`
- Named mode bags: `…/MODES.md`
- FACT 3090 costs: this repo (`docs/3090-SIM.md`, `sim/3090/`, loadout)

Do not copy MODELS.md into this catalog as prose.
