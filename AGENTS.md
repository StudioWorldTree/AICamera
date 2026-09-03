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

**T4000 cloud sim** lives in web3d-space (`/gpu`, `sim/`). Current box:
RunPod RTX PRO 4500 Blackwell, EU-RO-1, $0.72/hr, pod `lduog58vatxh44`.
See `~/work/Family/web3d-space/docs/all-systems-go/GPU-SIM.md`. Auto-off
30 min. Do not terminate negotiated training pods from that console.

**Record path is HEVC** (Thor NVENC and/or camera-side H.265). Do not
haul RAW over Ethernet. CSI RAW is the body sensor hop into NVENC.
Sats: Rockchip **RV1126B** (or RV1126). Preferred carrier: **Rogue-T5**.
Thor-in-body is the product shape; 70 W fanless is not honest — radiators
over lots of fans; measure TTP before metal CAD
(`docs/references/THERMAL.md`).

**Lens metadata is Cooke /i class** from every camera (body and sats),
written as a JSONL sidecar 1:1 with picture. See `docs/LENS.md`.

Issue tracking: `bd prime` / `bd ready`. Prefix `aicam`.

Public notebook (SvelteKit SSG + mdsvex, GitHub Pages):
https://studioworldtree.github.io/AICamera/

BOM system lives in the sister tree `../daBOM` (SvelteKit + Hono REST +
OpenAPI + Drizzle + a local PGLite file). That is a real server, not
this Pages notebook. Every catalog item has a BOM there. Spec is always
at `/.well-known/openapi.json`; features land in the API first. Login is
IdentiKey. Agent rules: `../daBOM/AGENTS.md`.
