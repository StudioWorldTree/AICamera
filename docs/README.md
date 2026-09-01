# AICamera hardware docs

This repo is the **camera body**: Thor carrier, sensors, interconnect, power, enclosures, datasheets.

Product ground (vision, pipeline 0–19, modes, models, scene loop) lives in

`~/work/Family/web3d-space/docs/all-systems-go/`

The SvelteKit app in that repo is the spatial viewer, not the EVF.

| Here | There (`web3d-space/docs/all-systems-go/`) |
|---|---|
| [STREAM-BUDGET.md](STREAM-BUDGET.md) | HARDWARE.md, BRAINSTORM.md |
| [MODEL-MAP.md](MODEL-MAP.md) | MODELS.md, PIPELINE.md, MODES.md |

Do not fork VISION / PIPELINE / MODES / MODELS. Cite them. Hardware notes and CAD land here.

## Kit (steered 2026-09-01, AUTO)

- **Lab brick:** Jetson AGX Thor Developer Kit = T5000 module. QSFP28 + 5GbE + USB-C. Envelope 243.19 × 112.40 × 56.88 mm.
- **Production ceiling:** T4000 SOM (64 GB, 1× NVENC, 40–70 W) if the stream budget still fits; else T5000 SOM + carrier.
- **Fabric:** hybrid — body camera on CSI/GMSL mounted to the Thor box; satellites on PoE Ethernet.
- **Bring-up count:** 1 body + 2 satellites at 4K30. 4-sat and 6-sat stay in the budget tables.
- **Coprocessor / vault:** RTX PRO 6000 and NAS, off-body. Already decided in web3d-space.

## Print

Anycubic resin printer on site. First enclosure is a fit-check of the AGX kit + body-cam mount, not a production housing. Blender MCP when connected.
