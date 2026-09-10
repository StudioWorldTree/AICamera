## ADDED Requirements

### Requirement: Four compute envelopes
The kit SHALL name four compute envelopes: Thor T4000 (production body),
fractal1 RTX 3090 (local FP16 pipe), RunPod RTX PRO 6000 Blackwell Server
96 GB (30 fps perception lab), and the truck 6000 (quality). The 3090
SHALL NOT be treated as a T4000 TOPS proxy. Derates SHALL live in
`docs/3090-SIM.md`.

#### Scenario: cartridge costs
- GIVEN the cartridge catalog
- WHEN costs are recorded per envelope id
- THEN the ids `t4000`, `3090`, and `6000` match this four-box list
  (RunPod 6000 and truck 6000 share the `6000` quality-class column
  until measured apart)

### Requirement: Resident 30 fps design target
The live perception pipeline SHALL be designed as named slots kept
resident at 30 fps on Thor T4000 and on an RTX PRO 6000. fractal1’s
3090 SHALL emulate that pipeline by loading one slot at a time and
unloading it, and SHALL NOT be a 30 fps host. The same software SHALL
select residency (`resident` or `swap`) and pack (`t4000` SMALL or
`6000` LARGE) by envelope id.

#### Scenario: rent or local body
- GIVEN the live mix is running
- WHEN the envelope is a rented PRO 6000 96 GB or a local T4000
- THEN every live slot stays resident and the stream is the 30 fps path
- WHEN the envelope is fractal1 3090
- THEN slots swap and the log applies `docs/3090-SIM.md` derates

### Requirement: Envelope-sized packs
T4000 SHALL pack SMALL live weights (VDA-S / oVDA, YOLOE, SAM2-tiny or
EdgeTAM, RVM-MN3 on talent, Maxine AR). The 30 fps lab 6000 SHALL pack
LARGE live weights (VDA-L or DA3METRIC-L, SAM 3.1, SAM2Matting). The
3090 SHALL load SMALL weights only. SAM 3.1 + VDA-L SHALL NOT be packed
on T4000 with the AD 9B.

#### Scenario: MODELS quant rows
- GIVEN MODELS.md
- WHEN a live perception job is listed
- THEN it names SMALL and LARGE packs and which envelope runs each
