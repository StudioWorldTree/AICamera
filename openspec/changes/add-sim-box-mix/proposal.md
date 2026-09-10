# add-sim-box-mix

> **ACTIVE BUILD**

**Rigor:** architecture

## Why

The live mix is designed as **everything resident at 30 fps**. fractal1’s
3090 cannot do that — 24 GB + 16 GB host — so it **swaps one slot at a
time and goes slowly**. The same software streams realtime on a rented
RTX PRO 6000 Blackwell Server 96 GB or on a local T4000. Truck 6000 stays
quality / overnight. Cartridge costs need those four envelopes, not one
Thor column.

## What

- Four-box table: Thor T4000, fractal1 3090, RunPod PRO 6000 96 GB, truck 6000
- Named perception slots (depth, names, track, matte, body pose, camera pose)
- Residency policy: T4000 and PRO 6000 keep slots resident; 3090 swaps
- Quant / pack rows: SMALL on T4000, LARGE on 6000; 3090 loads SMALL
- Name the 30 fps lab SKU in VIDEO-PERCEPTION
- Keep `docs/3090-SIM.md` as the derate home and name the emulator role
- Feeds `add-cartridge-model` catalog costs

## Impact

- Capabilities: MODIFIED `hardware-kit` (envelopes + residency)
- Product docs in web3d-space (`HARDWARE.md`, `MODELS.md`, `VIDEO-PERCEPTION.md`)
- ADRs: none

## User journey & surfaces

No new UI because this is envelope tables in HARDWARE / MODELS /
VIDEO-PERCEPTION and the existing 3090-SIM derate page.

## Out of scope

- Renting the RunPod SKU (`brief-runpod-30fps`)
- VDA-S / RTMPose on fractal1 (`add-3090-live-stages`)
- Pose-net SHALLs (`add-pose-depth-until-lidar`)
- Implementing the packer (`add-cartridge-pack`)
- Treating 3090 as a T4000 TOPS proxy
- Terminating `negotiated-gpu-*`
