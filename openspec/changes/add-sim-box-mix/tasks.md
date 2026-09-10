# Tasks

- [ ] Advise reader (other family) on this architecture change
- [ ] Four-box table in web3d-space HARDWARE.md (Thor T4000, 3090 swap-emulator, RunPod PRO 6000 96 GB resident-30fps, truck 6000)
- [ ] Quant / pack rows in web3d-space MODELS.md (SMALL on T4000/3090, LARGE on 6000)
- [ ] Name the 30 fps lab SKU and residency policy in web3d-space VIDEO-PERCEPTION.md
- [ ] Confirm docs/3090-SIM.md remains the derate home and names the sequential-swap emulator role (no move)
- [ ] Delta hardware-kit: envelopes, resident-30fps target, SMALL vs LARGE packs
- [ ] (advise) Delta: name the AGX Thor Dev Kit (T5000) envelope. Shares `t4000` until measured apart; bandwidth-bound reads ~1×, TPC-bound ×0.6, NVENC is 2 not 1. Living spec Lab brick requires this box; the four-box SHALL cannot omit it
- [ ] (advise) Delta or 3090-SIM: one line that a PRO 6000 stream is a LARGE-pack lab result with no derate to T4000; T4000 30 fps stays SPEC until measured on Thor silicon
- [ ] (advise) Delta: hardware envelope id (derate/log attribution) and pack id (weights) are separate fields; pack and residency default by envelope, overridable. Match design.md wording (residency is config). Make "SAM 3.1 + VDA-L not on T4000" unconditional, not "with the 9B"
- [ ] (advise) Swap-mode log splits load/unload time from per-frame time before derates apply (3090-SIM klein row currently conflates them)
