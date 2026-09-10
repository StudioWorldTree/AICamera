# Tasks

- [x] Advise reader (other family) on this architecture change (send-back 2026-09-10; three spec pins amended)
- [x] Catalog schema: id, kind, shelf, exclusive tags, costs per box (3090 / t4000 / 6000)
- [x] Seed always-on (nvenc-hevc, cuvslam), slottable (filters, sam2-tiny, clip, klein-4b, qwen-9b if absent marked), never-on-thor (flux-dev, wan-14b, h3, …)
- [x] Exclusive tags: klein-27b, sam2-maxine-4k
- [x] Mode presets as arrays of cartridge ids (master-capture, snap, ad, ar, talent-tracking)
- [x] Envelope ids: `3090` (fractal1 live), `t4000` (second scale), `6000`
- [x] Point names at MODELS.md / MODES.md; FACT costs at 3090-SIM.md — do not fork product ground

## From advise 2026-09-10 (agt-fable-5-1-arch-review)

- [x] Spec: pack semantics on a `swap` envelope (`3090` = one slot at a time; max-of-peaks or stated rule). Cite add-sim-box-mix
- [x] Spec: `sam2-maxine-4k` vs talent-tracking preset — resolution-variant cart ids, or drop the tag this pass
- [x] Spec: null scenario — always-on with null cost on target envelope is `absent` and logged; slottable with null cost cannot seat
- [x] Record: `t4000` cost is unified (`unified_gb`), or state the sum rule; do not carry a 3090 host/VRAM split onto Thor
- [x] Record: `latency` (LIVE/NEAR/MIN from MODELS.md) or `pack` (SMALL/LARGE from sim-box-mix), or state that this pack is memory-and-power only
- [x] Record: `job` per cart pointing at the MODELS.md row (ids are models, MODELS.md rows are jobs)
- [x] Record: each cost carries `src` (3090-SIM anchor + date) or `fact: false`; the design's klein `vram_gb: 16.0` is disk weight size, not a measured VRAM peak
- [x] Spec note: `never-on-thor` shelf is an override that wins over any measured cost (policy, e.g. H3)
- [x] Envelope ceilings (VRAM / host or unified / watts / NVENC sessions) for `3090`, `t4000`, `6000` — owned here or by add-sim-box-mix `hardware-kit`; one of the two must
- [x] Acceptance: every seeded preset seats on its home envelope under the spec's own rules (catches the three spec pins before a packer exists) — watts is not a pack axis; checker is memory + NVENC

## From re-advise 2026-09-10 (fable-5-1-arch-review)

- [x] Spec: power axis — watts is a record and sag (hardware-kit) enforces power, so strike `watts` as a pack axis from "Latency vs pack" and "Envelope ceilings"
- [x] Spec: swap formula — Σ(always-on) + max(slottable) against the ceiling, not max over the whole set (always-on carts are resident beside the loaded slot)
