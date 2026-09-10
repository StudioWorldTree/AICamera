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
