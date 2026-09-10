# Design — four-box mix

Product ground stays in web3d-space (`HARDWARE.md`, `MODELS.md`,
`VIDEO-PERCEPTION.md`). This repo owns `docs/3090-SIM.md` derates.

| Box | Role |
|---|---|
| Thor T4000 | Production body. 64 GB unified, 70 W, 1× NVENC. Pack envelope `t4000`. |
| fractal1 3090 | Local pipe. FP16, sequential unload, 24 GB + 16 GB host. Envelope `3090`. Not a T4000. |
| RunPod RTX PRO 6000 Blackwell Server 96 GB | 30 fps all-perception-filters lab. Quant / co-resident. |
| Truck 6000 | Quality box. DiT, gsplat, 27B overnight. Not the body. |

3090 FACT → T4000 read: filters ×0.13, SAM2/LLM ×0.30, no FP8 on Ampere.

Cartridge catalog (`add-cartridge-model`) carries per-box costs; this
change is the envelope list those columns mean.
