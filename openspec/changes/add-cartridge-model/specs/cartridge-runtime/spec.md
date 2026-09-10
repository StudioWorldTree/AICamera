## ADDED Requirements

### Requirement: Cartridge catalog
The kit SHALL expose a catalog of cartridges. Each cartridge SHALL have
an id, a kind (`model` or `plugin`), a `job` string pointing at the
MODELS.md row it fills, a shelf (`always-on`, `slottable`, or
`never-on-thor`), zero or more exclusive tags, and a cost record per
envelope id (`3090`, `t4000`, `6000`) with watts, NVENC sessions, and
either a 3090-shaped split (`vram_gb` + `host_ram_gb`) or a unified
pool (`unified_gb` on `t4000`). The packer SHALL sum `vram_gb` +
`host_ram_gb` against one ceiling on unified envelopes. Shelf
`never-on-thor` SHALL override any measured cost (policy, e.g. H3).
A null cost means unmeasured, not free.

#### Scenario: seed catalog
- GIVEN the catalog file for this repo
- WHEN a packer or `/bay` reads it
- THEN every always-on, slottable, and never-on-thor cartridge used by
  named modes is present with kind, shelf, and job set

### Requirement: Always-on reserved
Encode (NVENC HEVC) and pose (cuVSLAM) SHALL be always-on cartridges.
A pack SHALL NOT drop them. Thermal or power sag SHALL drop slottable
AI cartridges, never record.

#### Scenario: sag
- GIVEN a seated loadout that includes slottable AI
- WHEN thermal or power sag is signalled
- THEN encode and cuVSLAM remain resident

### Requirement: Null costs
On the target envelope: an always-on cartridge with a null cost SHALL
be `absent` (logged, not seated; the pack remains legal). A slottable
cartridge with a null cost SHALL NOT seat.

#### Scenario: cuVSLAM on fractal1
- GIVEN cuvslam is always-on and its `3090` cost is null
- WHEN a packer runs for envelope `3090`
- THEN cuvslam is absent and logged; slottable carts still pack

#### Scenario: slottable unmeasured
- GIVEN a slottable cart with null `3090` cost
- WHEN a packer runs for envelope `3090`
- THEN that cart does not seat

### Requirement: Exclusive tags
Cartridges that share an exclusive tag SHALL NOT be co-resident. Tags
this pass are `klein-27b` and `sam2-maxine-4k`. `sam2-maxine-4k` SHALL
apply only to 4K-class cart ids. EVF / 720p variants SHALL be untagged
so the talent-tracking preset (SAM2 + Maxine) seats. Other combinations
are legal if they fit the envelope.

#### Scenario: klein vs 27B
- GIVEN klein-4b and qwen-27b both requested
- WHEN the packer runs
- THEN the pack refuses; it names which cartridge to unslot

#### Scenario: talent-tracking at EVF
- GIVEN the talent-tracking preset with untagged SAM2-tiny and Maxine
- WHEN the packer runs
- THEN both seat; a 4K SAM2 cart and a 4K Maxine cart that share
  `sam2-maxine-4k` SHALL NOT

### Requirement: Swap envelope pack
On envelope `3090`, residency is swap (`add-sim-box-mix`): one slot
loaded at a time. A pack on a swap envelope SHALL compare the **max of
per-slot peaks** against the envelope ceiling, not the sum of peaks.
Sum-of-peaks is the rule on resident envelopes (`t4000`, `6000`).

#### Scenario: 3090 swap set
- GIVEN klein-4b, sam2-tiny, and clip are in the desired set
- WHEN the packer runs for envelope `3090`
- THEN the pack seats if each cart's peak fits 24 GB / 16 GB host; it
  SHALL NOT refuse because the sum of those peaks exceeds the brick

### Requirement: Named modes are presets
Named camera modes SHALL be arrays of cartridge ids in the catalog,
not a second exclusive runtime. The operator MAY unslot or slot from
a preset. Job names SHALL come from the product MODELS.md / MODES.md
list; this catalog SHALL NOT fork that prose.

#### Scenario: snap preset
- GIVEN the Creative snap preset
- WHEN it is applied
- THEN klein-4b is in the desired set and qwen-27b is not

### Requirement: Envelope id
The pack target SHALL be an envelope id. On fractal1 the live brick
SHALL be `3090`. Envelope `t4000` SHALL be available as a second scale
and SHALL NOT be reported as seated on the 3090.

#### Scenario: live brick
- GIVEN fractal1
- WHEN a cart is seated
- THEN the packer uses envelope `3090`; a T4000-only fit is a gauge,
  not a seated cart

### Requirement: Latency vs pack
Each cartridge SHALL record `latency` (`LIVE` / `NEAR` / `MIN` / `NIGHT`)
from MODELS.md. This packer SHALL be memory, host/unified RAM, watts,
and NVENC only. 30 fps residency is `add-sim-box-mix` (`pack` SMALL/LARGE
and `resident`/`swap`); it is a gauge, not a seat/bounce on this catalog.

#### Scenario: 9B + SAM2
- GIVEN qwen-9b (NEAR) and sam2-tiny (LIVE) both fit memory on `t4000`
- WHEN this packer runs
- THEN both seat; LIVE-slot count is not a refusal here

### Requirement: Envelope ceilings
The catalog SHALL list ceilings per envelope: on `3090`, VRAM GB, host
RAM GB, watts, NVENC sessions; on `t4000` and `6000`, unified GB, watts,
NVENC sessions. This change owns those ceilings. `add-sim-box-mix` owns
which box is which and swap vs resident.

#### Scenario: refuse over ceiling
- GIVEN envelope `3090` ceilings 24 GB VRAM / 16 GB host / 1 NVENC
- WHEN a single cart's 3090 peak exceeds 24 GB VRAM
- THEN it does not seat, even on a swap envelope

### Requirement: Cost provenance
Each cost record SHALL carry `src` (3090-SIM or MODELS.md anchor plus
date) or `fact: false`. Disk weight size SHALL NOT be recorded as a
VRAM peak.

#### Scenario: klein
- GIVEN klein-4b 3090 cost
- WHEN the catalog is read
- THEN `fact` is false or `src` does not claim 16 GB weights as VRAM peak
