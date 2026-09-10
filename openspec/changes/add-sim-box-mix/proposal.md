# add-sim-box-mix

> **PENDING**

## Why

Cartridge costs need four envelopes, not one Thor column. fractal1 3090
is the local T4000 pipe (FP16, sequential, derate ×0.13 / ×0.30). The
truck 6000 stays quality. 30 fps all-perception-filters is a different
lie: rent NVIDIA RTX PRO 6000 Blackwell Server 96 GB, not the 3090.

## What

- Four-box table: Thor T4000, fractal1 3090, RunPod PRO 6000 96 GB, truck 6000
- Quant rows on the product MODELS list
- Name the 30 fps lab SKU in VIDEO-PERCEPTION
- Keep `docs/3090-SIM.md` as the derate home (do not move it)
- Feeds `add-cartridge-model` catalog costs

## Impact

- Capabilities: MODIFIED `hardware-kit` (envelopes); product docs in web3d-space
- ADRs: none

## User journey & surfaces

No new UI because this is envelope tables in HARDWARE / MODELS /
VIDEO-PERCEPTION and the existing 3090-SIM derate page.

## Out of scope

- Renting the RunPod SKU (`brief-runpod-30fps`)
- VDA-S / RTMPose on fractal1 (`add-3090-live-stages`)
- Implementing the packer (`add-cartridge-pack`)
- Treating 3090 as a T4000 TOPS proxy
