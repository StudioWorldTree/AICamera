---
title: "Model map"
kicker: "Stages 0–19"
group: "hardware"
summary: "Index of which job runs on Thor vs the 6000. Thor resident set stays ≤ ~40 GB. If the 6000 is off, stages 0–8 and 19 still complete."
---

# Model map — pipeline stages on this kit

Index only. Canonical placement, licenses, and VRAM live in

`~/work/Family/web3d-space/docs/all-systems-go/MODELS.md`

Pipeline stages: `…/PIPELINE.md`. Modes: `…/MODES.md`.

Latency: **LIVE** &lt;33 ms · **NEAR** 1–30 s · **MIN** minutes · **NIGHT** hours.

Thor resident set stays ≤ ~40 GB. Always: NVENC + cuVSLAM + (SAM2 **or** Maxine) + Depth Anything V2-S. Pick one extra (AD 9B / AD 27B / klein snap / AR overlay). Drop AI, never record.

If the 6000 is off, stages **0–8 and 19** still complete.

## Stages 0–19

| # | Stage | Default model / engine | Box | Latency | On Thor? |
|---|---|---|---|---|---|
| 0 | Power-on / rig | load encode + SLAM + 9B or klein; thermal | Thor | — | yes |
| 1 | Scout | cuVSLAM sparse map; optional VGGT burst | Thor; VGGT on 6000 | LIVE / NEAR–MIN | SLAM yes; VGGT no as 24 fps |
| 2 | Previs / block | USD mesh occluders + live pose | Thor | LIVE | yes, mesh not splat-fill |
| 3 | Light / look | LUT; **FLUX.2 klein 4B** snap | Thor | NEAR | snap mode; unload 27B |
| 4 | Slate | sidecar JSON + burn-in | Thor | LIVE | yes |
| 5 | Capture | NVENC all Thor-side cams; sat HEVC remux; pose; NAS write-through | Thor | LIVE | encode always |
| 6 | Live AD | **Qwen3.5-9B** (27B on sticks, 130 W) | Thor | NEAR | yes; 27B unloads klein |
| 7 | Live AR | depth-test mesh / low splat, **not** a DiT | Thor | LIVE | 720p EVF honest; 4K photoreal splat not v1 |
| 8 | Playback / continuity | NVDEC last-take; VLM index | Thor + NAS | NEAR | yes |
| 9 | Dailies / proxy | proxies, waveform | **6000** + NAS | MIN | no |
| 10 | Reconstruct | COLMAP **or** VGGT shared poses | **6000** | MIN | no |
| 11 | Appearance | **gsplat** (Apache) | **6000** | MIN–NIGHT | no |
| 12 | Structure | Meshroom / OpenMVS or Scaniverse LiDAR | 6000 / phone | MIN–NIGHT | no |
| 13 | Author USD | SOG/SPZ + GLB + `KHR_gaussian_splatting` | 6000 + web3d-space viewer | MIN | no |
| 14 | Matchmove lock | **recorded pose sidecar** first; else VGGT/COLMAP | Thor record / 6000 solve | — | record yes |
| 15 | Performance transfer | live: Maxine/SAM2; hero: **4DGS** | Thor live / **6000** night | LIVE / NIGHT | live bones only |
| 16 | Plate ↔ scene | depth-test LIVE; Cosmos-Transfer / Wan MIN | Thor / **6000** | LIVE / MIN | composite yes; DiT no |
| 17 | Generative insert | FLUX.2 [dev]; Wan 2.2; Hunyuan 1.5; H3 if licensed | **6000** | MIN | **no** |
| 18 | Grade / deliver | ProRes/EXR and/or SOG+GLB+USD | 6000 + viewer | MIN | no |
| 19 | Archive / exit | NAS disks: keys, takes, prompts, LUTs, scenes | NAS | — | cache only |

## Named jobs you asked about

| Job | Model | Where | What it is not |
|---|---|---|---|
| **Snap / inline still** | FLUX.2 [klein] 4B Apache (~8–13 GB) | Thor, snap profile | Not a replacement take. Unloads 27B. klein 9B is non-commercial. FLUX.2 [dev] is 6000. |
| **Performance tracking** | SAM2 (TensorRT) + Maxine 3D body (34 kpts) | Thor | Not a VLA. One or the other at 4K until measured. |
| **Performance capture (live)** | Maxine/SAM2 → bone stream to USD humanoid | Thor | Blocking and eyeline. OpenPi π0.5 only if the body is a motion-control head. |
| **Performance transfer (hero)** | 4DGS train overnight | **6000** | Not live. Markers optional. |
| **Shot-calling** | Qwen3.5-9B (~7–12 GB) | Thor | Talks; does not move the camera unless asked. |
| **Pose / matchmove** | cuVSLAM + IMU, 1:1 sidecar with picture | Thor always | VGGT is a burst reconstructor, not 24 fps. |

## Never resident on Thor

MiniMax H3, Wan 2.2 14B, Hunyuan, Cosmos-Predict 14B, Cosmos-Transfer2.5 (~65 GB FACT), TRELLIS.2 high res, room-scale gsplat densify, FLUX.2 [dev] BF16.

H3: US open-weights excluded. Default local video for a US artist is Wan 2.2 + Hunyuan 1.5 + Cosmos. H3 is a license gate or API.

## License defaults (from MODELS.md)

**Ship:** gsplat, COLMAP, Wan 2.2 5B, FLUX.2 klein 4B, Isaac ROS / cuVSLAM, PlayCanvas, SAM2 (check Meta), Qwen3.5 (check current terms).

**Gate:** FLUX.2 [dev] / klein 9B, INRIA 3DGS, Hunyuan community, MiniMax H3.

## Thor co-resident extra (one at a time)

| Profile | Extra | Unload |
|---|---|---|
| AD | Qwen3.5-9B | — |
| AD heavy | 27B | klein |
| Snap | klein 4B | 27B |
| AR overlay | mesh + low splat | klein + 27B; keep 9B if AD talks |

MIG: slice 0 = encode + SLAM. Slice 1 = brain. Kill slice 1 first.
