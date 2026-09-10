## ADDED Requirements

### Requirement: Four compute envelopes
The kit SHALL name four compute envelopes: Thor T4000 (production body),
fractal1 RTX 3090 (local FP16 pipe), RunPod RTX PRO 6000 Blackwell Server
96 GB (30 fps perception lab), and the truck 6000 (quality). The AGX Thor
Developer Kit (T5000 module) SHALL share envelope id `t4000` until
measured apart: bandwidth-bound reads ~1× T4000, TPC-bound ×0.6, NVENC
count 2 not 1. The 3090 SHALL NOT be treated as a T4000 TOPS proxy.
Derates SHALL live in `docs/3090-SIM.md`. Hardware envelope id (derate
and log attribution) and pack id (SMALL or LARGE weights) SHALL be
separate fields. Pack and residency default by envelope and SHALL be
overridable. RunPod 6000 and truck 6000 share the `6000` quality-class
column until measured apart.

#### Scenario: cartridge costs
- GIVEN the cartridge catalog
- WHEN costs are recorded per envelope id
- THEN the ids `t4000`, `3090`, and `6000` match this four-box list
  (RunPod 6000 and truck 6000 share the `6000` quality-class column
  until measured apart; the AGX kit logs as `t4000` with the partial
  derate above)

### Requirement: Resident 30 fps design target
The live perception pipeline SHALL be designed as named slots kept
resident at 30 fps on Thor T4000 and on an RTX PRO 6000. fractal1’s
3090 SHALL emulate that pipeline by loading one slot at a time and
unloading it, and SHALL NOT be a 30 fps host. The same software SHALL
select residency (`resident` or `swap`) and pack (`SMALL` or `LARGE`)
as independent fields that default by envelope id and MAY be overridden.
A PRO 6000 LARGE-pack stream SHALL NOT be logged as a T4000 FACT; no
derate from 6000 fps to T4000 exists. T4000 30 fps SHALL remain SPEC
until measured on Thor silicon. Swap-mode logs SHALL split load/unload
time from per-frame time before `docs/3090-SIM.md` derates apply.

#### Scenario: rent or local body
- GIVEN the live mix is running
- WHEN the envelope is a rented PRO 6000 96 GB
- THEN every live slot stays resident, pack is LARGE, and the stream is
  a lab result with no derate to T4000
- WHEN the envelope is a local T4000
- THEN every live slot stays resident, pack is SMALL, and 30 fps is SPEC
- WHEN the envelope is fractal1 3090
- THEN slots swap, pack is SMALL, and the log splits load/unload from
  per-frame time then applies `docs/3090-SIM.md` derates

### Requirement: Envelope-sized packs
T4000 SHALL pack SMALL live weights (VDA-S / oVDA, YOLOE, SAM2-tiny or
EdgeTAM, RVM-MN3 on talent, Maxine AR). The 30 fps lab 6000 SHALL pack
LARGE live weights (VDA-L or DA3METRIC-L, SAM 3.1, SAM2Matting). The
3090 SHALL load SMALL weights only. SAM 3.1 + VDA-L SHALL NOT be packed
on T4000.

#### Scenario: MODELS quant rows
- GIVEN MODELS.md
- WHEN a live perception job is listed
- THEN it names SMALL and LARGE packs and which envelope runs each
