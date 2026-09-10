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

```json
{
  "id": "klein-4b",
  "kind": "model",
  "shelf": "slottable",
  "exclusive": ["klein-27b"],
  "costs": {
    "3090": { "vram_gb": 16.0, "host_ram_gb": 8.0, "watts": 350, "nvenc": 0 },
    "t4000": { "vram_gb": null, "host_ram_gb": null, "watts": null, "nvenc": 0 },
    "6000": { "vram_gb": null, "host_ram_gb": null, "watts": null, "nvenc": 0 }
  }
}
```

3090 numbers are FACT when measured (`docs/3090-SIM.md`, loadout). T4000
and 6000 may be null until measured; null is not zero. The packer
(`add-cartridge-pack`) refuses a seat when the live-brick envelope is
exceeded or an exclusive tag collides. T4000 pack is a second call for
the gauge, not what seats on fractal1.

Exclusive tags this pass: `klein-27b`, `sam2-maxine-4k`.

## Source of truth

- Job names and licenses: `~/work/Family/web3d-space/docs/all-systems-go/MODELS.md`
- Named mode bags: `…/MODES.md`
- FACT 3090 costs: this repo (`docs/3090-SIM.md`, `sim/3090/`, loadout)

Do not copy MODELS.md into this catalog as prose.
