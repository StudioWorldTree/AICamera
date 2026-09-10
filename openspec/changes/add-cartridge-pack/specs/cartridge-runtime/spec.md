## ADDED Requirements

### Requirement: Packer function
The kit SHALL expose a pure packer: desired cartridge ids and an
envelope id in, `{resident, refused, evict, log}` out, with no GPU.
Default envelope on fractal1 SHALL be `3090`. Envelope `t4000` SHALL be
a second call and SHALL NOT be reported as seated on the 3090.

#### Scenario: snap on fractal1
- GIVEN desired set is the snap preset
- WHEN the packer runs with envelope `3090`
- THEN klein-4b is resident if it fits; qwen-27b is not in the set

### Requirement: Record-path properties
A pack SHALL NOT drop always-on encode or cuVSLAM (except always-on
null → absent). Exclusive-tag collisions SHALL refuse and name what
to unslot. Over-ceiling SHALL refuse. A sag signal SHALL fill `evict`
with slottable AI and SHALL NOT list encode or cuVSLAM.

#### Scenario: sag
- GIVEN a seated set that includes klein-4b
- WHEN sag is signalled
- THEN evict contains klein-4b and does not contain nvenc-hevc

#### Scenario: 4K exclusive
- GIVEN sam2-4k and maxine-4k both requested
- WHEN the packer runs
- THEN the pack refuses and names the `sam2-maxine-4k` pair

#### Scenario: 3090 swap-set
- GIVEN klein-4b, sam2-tiny, and clip on envelope `3090`
- WHEN the packer runs
- THEN the pack seats if always-on plus the largest slottable peak fits
