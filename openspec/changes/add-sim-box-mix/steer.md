# steer add-sim-box-mix

**When.** 2026-09-10
**Depth.** standard

## Decided
- 3090 residency: sequential swap, slower emulator (user)
  Why: 24 GB + 16 GB host cannot co-reside the live mix. fractal1 is the
  T4000 *pipe*, not a T4000 TOPS proxy and not a 30 fps host.
- Design use case: everything-resident 30 fps (user)
  Why: one software path. Rent NVIDIA RTX PRO 6000 Blackwell Server 96 GB,
  or run a local T4000, and stream realtime. 3090 is not that path.
- Do not rent a GPU this pass (user, prior)
  Why: architecture first. Do not terminate negotiated-gpu-*.
- Pack: same named slots, envelope-sized weights (auto — menus declined)
  Why: T4000 at 273 GB/s cannot hold SAM 3.1 + VDA-L + 9B. Same software,
  SMALL on T4000, LARGE on the 6000. 3090 loads one SMALL slot at a time.
- Depth + camera pose until LiDAR/stereo: VDA-S depth; DA3 pose on
  sim/6000; cuVSLAM on Thor when stereo exists (auto — menus declined)
  Why: VDA-S is the published live depth job. Camera pose is a second net,
  not a still-depth hack. Feeds `aicam-pose-depth`.

## Skipped
- none

## Auto
- Body pose: Maxine AR on Thor; RTMPose-m TRT FP16 on 3090. Not OpenPose.
- Not DepthCrafter live. DiTs stay on the truck 6000.
- Record path remains HEVC. Live overlay is depth-test, not a DiT.
- 3090 derates stay in `docs/3090-SIM.md` (filters ×0.13, ViT/LLM ×0.30).
- RunPod 30 fps lab SKU remains RTX PRO 6000 Blackwell Server 96 GB
  (~$2.09/hr). PRO 4500 stays the cheap T4000-shaped sim, not this job.

## Feeds change
Four envelopes, one pipeline of named slots. 3090 swaps and is slow.
T4000 (SMALL, resident) and a rented PRO 6000 (LARGE, resident) are the
realtime hosts of that same software. Change updates HARDWARE / MODELS /
VIDEO-PERCEPTION plus 3090-SIM with the swap-emulator role, the SMALL vs
LARGE pack, and the 30 fps lab SKU. Pose-net details land on
`add-pose-depth-until-lidar`.
