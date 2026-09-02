# AICamera (AllSystemsGo)

Hardware home for the All Systems Go AI camera. Work on `main`. Repo currently tracks `docs/`, `AGENTS.md`, and beads.

**Product ground** (pipeline, modes, models, vision) lives in
`~/work/Family/web3d-space/docs/all-systems-go/`. This repo does
carriers, sensors, interconnect, enclosures, datasheets. The SvelteKit
app in web3d-space is the spatial viewer, not the camera body.

**Already decided** (do not re-litigate without new evidence): Thor is
the body; RTX PRO 6000 is the quality box; NAS is source of truth;
mode switch drops AI, never record; live overlay is depth-test not a
DiT; rooms are captured not generated; H3 is license-gated in the US;
snap is FLUX.2 klein 4B; AD is Qwen3.5-9B (27B on sticks). The AGX Thor Developer Kit is a T5000 module — there is no T4000
kit. Lab brick is the AGX kit; production thermal/encode ceiling is
the T4000 SOM (1× NVENC, 64 GB, default 70 W / throttle 90 W,
87 × 100 × 15.29 mm) unless satellite count forces T5000. Module
datasheet: `docs/references/` (DS-11945-001 v1.4 from Arrow).

**Record path is HEVC** (Thor NVENC and/or camera-side H.265). Do not
haul RAW over Ethernet. CSI RAW is the body sensor hop into NVENC.

Issue tracking: `bd prime` / `bd ready`. Prefix `aicam`.
