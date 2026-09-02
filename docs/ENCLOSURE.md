# Enclosure

Activated with `aicam-enclosure`. Spec: `openspec/changes/add-thor-enclosure/`.
Print: `aicam-print` (human, Anycubic resin).

## First article

Wrap the **AGX Thor Developer Kit**, not the SOM:

- 243.19 × 112.40 × 56.88 mm
- Leave kit fan / TTP path open
- Boss or clamp for the **body camera** on the front
- Cable exits: 5GbE, QSFP, USB-C, power, body CSI/GMSL if present

Production SOM lid (87 × 100 × 15.29 mm, 350 g) is a second print after
TDG-12271-001.

## CAD

Blender MCP was not connected in the session that opened this change.
STL target: `docs/cad/` once modeled.

Resin is brittle and a poor heat sink. Fit-check only.

## Still blocked

- Blender MCP
- Kit STEP/STL from NVIDIA (not in the Arrow PDF; figures 6-1…6-5 are
  SOM drawings, raster-only in the datasheet)
