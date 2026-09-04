---
title: "Hardware docs"
kicker: "Index"
group: "meta"
summary: "This repo is the camera body. Product ground (vision, pipeline, modes, models) lives in web3d-space. Do not fork it."
---

# AICamera hardware docs

This repo is the **camera body**: Thor carrier, sensors, interconnect, power, enclosures, datasheets.

Product ground (vision, pipeline 0–19, modes, models, scene loop) lives in

`~/work/Family/web3d-space/docs/all-systems-go/`

The SvelteKit app in that repo is the spatial viewer, not the EVF.

| Here | There (`web3d-space/docs/all-systems-go/`) |
|---|---|
| [STREAM-BUDGET.md](STREAM-BUDGET.md) | HARDWARE.md, BRAINSTORM.md |
| [MODEL-MAP.md](MODEL-MAP.md) | MODELS.md, PIPELINE.md, MODES.md |
| [INTERCONNECT.md](INTERCONNECT.md) | — |
| [CARRIER.md](CARRIER.md) | HARDWARE.md |
| [SENSORS.md](SENSORS.md) | — |
| [LENS.md](LENS.md) | MODES.md (lens sidecar) |
| [POWER.md](POWER.md) | — |
| [ENCLOSURE.md](ENCLOSURE.md) | — |
| [cad/](cad/) | STLs for Anycubic |
| [SHOPPING.md](SHOPPING.md) | Camera + T4000 carrier buy brief |
| [CAMERAS.md](CAMERAS.md) | CSI vs GMSL vs PoE H.265; turret vs module; lidar; Thor-in-body hold |
| [references/THERMAL.md](references/THERMAL.md) | TDG-12271-001 v1.3: TTP 75 °C, θpa, radiators not lots of fans |
| [references/T4000.md](references/T4000.md) | — (Arrow DS-11945-001 v1.4) |

Do not fork VISION / PIPELINE / MODES / MODELS. Cite them. Hardware notes and CAD land here.

## Kit (steered 2026-09-01, AUTO)

- **Lab brick:** Jetson AGX Thor Developer Kit = T5000 module. QSFP28 + 5GbE + USB-C. Envelope 243.19 × 112.40 × 56.88 mm.
- **Production ceiling:** T4000 SOM (64 GB, 1× NVENC, default **70 W**, throttle at **90 W**, 87 × 100 × 15.29 mm) if the stream budget still fits; else T5000 SOM + carrier. See [references/T4000.md](references/T4000.md).
- **Fabric:** hybrid — body camera on CSI/GMSL mounted to the Thor box; satellites on PoE Ethernet (RV1126B).
- **Carrier:** Connect Tech **Rogue-T5** (AGX302) preferred. Thermal: metal radiator body; 70 W fanless not honest. See [references/THERMAL.md](references/THERMAL.md).
- **Bring-up count:** 1 body + 2 satellites at 4K30. 4-sat and 6-sat stay in the budget tables.
- **Coprocessor / vault:** RTX PRO 6000 and NAS, off-body. Already decided in web3d-space.

## Print

Anycubic resin printer on site. First enclosure is a fit-check of the AGX kit + body-cam mount, not a production housing. Blender MCP when connected.
