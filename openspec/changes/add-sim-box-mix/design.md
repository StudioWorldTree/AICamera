# Design — four-box mix

Product ground stays in web3d-space (`HARDWARE.md`, `MODELS.md`,
`VIDEO-PERCEPTION.md`). This repo owns `docs/3090-SIM.md` derates.

Steer 2026-09-10: design the pipeline as if every perception slot is
resident at 30 fps. 3090 emulates that pipeline by swapping. Realtime
hosts of the **same software**: a rented PRO 6000, or a local T4000.

## Envelopes

| Box | Role | Residency |
|---|---|---|
| Thor T4000 | Production body. 64 GB unified, 70 W, 1× NVENC. Envelope `t4000`. | All live slots **resident**. SMALL weights. 30 fps design target (SPEC until Thor silicon). |
| AGX Thor Dev Kit | Lab brick (T5000 module). Shares `t4000` until measured apart. Bandwidth ~1×; TPC ×0.6; NVENC 2 not 1. | Resident SMALL. |
| fractal1 3090 | Local pipe. FP16, 24 GB + 16 GB host. Envelope `3090`. Not a T4000. | **Swap** one SMALL slot at a time. Slow on purpose. |
| RunPod RTX PRO 6000 Blackwell Server 96 GB | 30 fps all-perception-filters lab. Envelope `6000`. | All live slots **resident**. LARGE weights. Lab result; **no derate to T4000**. |
| Truck 6000 | Quality box. DiT, gsplat, 27B overnight. Not the body. Shares `6000` until measured apart. | Not the live mix. |

3090 FACT → T4000 read: filters ×0.13, SAM2/LLM ×0.30, no FP8 on Ampere.

PRO 4500 32 GB stays the cheap T4000-shaped sim (quant / kernels), not
the 30 fps everything-resident job.

## Slots and packs

Same named slots on every live box. Pack is an envelope id, not a fork
of the software.

| Slot | SMALL (`t4000`, and 3090 when loaded) | LARGE (`6000` lab) |
|---|---|---|
| depth | VDA-S / oVDA (DA-V2-S until measured) | VDA-L or DA3METRIC-L |
| names | YOLOE every N frames | SAM 3.1 |
| track | SAM2-tiny / EdgeTAM | SAM 3.1 memory or SAM2-L |
| matte | invert ∪masks; RVM-MN3 talent hair | SAM2Matting / invert union |
| body pose | Maxine AR | RTMW or Maxine (many streams) |
| camera pose | cuVSLAM when stereo exists; empty on body until then | DA3 pose head |

273 GB/s is why SMALL ≠ LARGE. Do not squeeze SAM 3.1 + VDA-L + 9B onto
the SOM. 9B is AD (NEAR), not a live slot.

Until LiDAR or two cameras (owned by `add-pose-depth-until-lidar`):
depth = VDA-S; camera pose = DA3 pose head on sim/6000; cuVSLAM on Thor
when stereo exists. Not OpenPose. Not DepthCrafter live.

## Software shape

One pipeline. Envelope id (derate / log attribution) and pack id
(SMALL / LARGE weights) are separate fields. Residency (`resident` |
`swap`) is config. Defaults: `t4000` → resident + SMALL; `3090` → swap
+ SMALL; `6000` → resident + LARGE. Either field is overridable.
Cartridge catalog (`add-cartridge-model`) carries per-box costs; this
change is the envelope list those columns mean. RunPod and truck 6000
share the `6000` quality-class column until measured apart. The AGX kit
shares `t4000` until measured apart.
