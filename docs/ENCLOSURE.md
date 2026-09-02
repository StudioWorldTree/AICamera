# Enclosure

Activated with `aicam-enclosure`. Spec: `openspec/changes/add-thor-enclosure/`.
Print: `aicam-print` (human, Anycubic resin).

## First article

Wrap the **AGX Thor Developer Kit**, not the SOM:

- 243.19 × 112.40 × 56.88 mm
- Leave kit fan / TTP path open
- Boss or clamp for the **body camera** on the front
- Cable exits: 5GbE, QSFP, USB-C, power, body CSI/GMSL if present

Production SOM lid is a **later metal** article, not resin. Product
shape is still **Thor inside the camera body** (T4000 + **Rogue-T5** +
CSI sensor), not the AGX kit and not a PYXIS bolted onto a brick.
Thermal architecture is a **hold** until we measure T4000 + Rogue-T5 +
ATS on the TTP (TDG-12271-001 v1.3): prefer heatpipes / vapor chamber /
a real radiator over lots of fans. 70 W fanless in a cine envelope is
not honest; record-only / drop-AI is. See
[references/THERMAL.md](references/THERMAL.md) and [CAMERAS.md](CAMERAS.md).
Sats stay off-body PoE.

## CAD (first article, 2026-09-01)

Blender 5.0 via addon socket `:9876` (Grok MCP blender server was not
in this session; same protocol). Script: [cad/build_agx_shell.py](cad/build_agx_shell.py).

| File | What | Span (mm) |
|---|---|---|
| [cad/agx_thor_shell.blend](cad/agx_thor_shell.blend) | Kit dummy + two halves | — |
| [cad/agx_shell_front.stl](cad/agx_shell_front.stl) | Camera-boss half | **152.3 × 119.8 × 64.3** |
| [cad/agx_shell_rear.stl](cad/agx_shell_rear.stl) | Cable-exit half | **130.3 × 119.8 × 64.3** |
| [cad/preview.png](cad/preview.png) | Viewport | — |

Wall 2.2 mm, 1.5 mm kit clearance. Front has a 32 mm OD / 18 mm bore
boss. Rear has RJ45 / QSFP / DC cutouts. Top vent slots. Manifold.

**Print:** two parts so they fit a ~192 × 120 mm resin bed. Width **119.8 mm**
is tight on a 120 mm vat — rotate or knock 0.5 mm off the walls if the
slicer complains. Resin is a fit-check, not a heat sink. Leave the TTP
path open.

Production SOM lid is metal, after a TTP measurement, not this resin print.
