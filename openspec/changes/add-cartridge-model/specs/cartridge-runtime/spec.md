## ADDED Requirements

### Requirement: Cartridge catalog
The kit SHALL expose a catalog of cartridges. Each cartridge SHALL have
an id, a kind (`model` or `plugin`), a shelf (`always-on`, `slottable`,
or `never-on-thor`), zero or more exclusive tags, and a cost record per
envelope id (`3090`, `t4000`, `6000`) with VRAM, host RAM, watts, and
NVENC sessions. A null cost means unmeasured, not free.

#### Scenario: seed catalog
- GIVEN the catalog file for this repo
- WHEN a packer or `/bay` reads it
- THEN every always-on, slottable, and never-on-thor cartridge used by
  named modes is present with kind and shelf set

### Requirement: Always-on reserved
Encode (NVENC HEVC) and pose (cuVSLAM) SHALL be always-on cartridges.
A pack SHALL NOT drop them. Thermal or power sag SHALL drop slottable
AI cartridges, never record.

#### Scenario: sag
- GIVEN a seated loadout that includes slottable AI
- WHEN thermal or power sag is signalled
- THEN encode and cuVSLAM remain resident

### Requirement: Exclusive tags
Cartridges that share an exclusive tag SHALL NOT be co-resident. Tags
this pass are `klein-27b` and `sam2-maxine-4k`. Other combinations are
legal if they fit the envelope.

#### Scenario: klein vs 27B
- GIVEN klein-4b and qwen-27b both requested
- WHEN the packer runs
- THEN the pack refuses; it names which cartridge to unslot

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
