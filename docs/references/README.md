---
title: "References"
kicker: "Sources"
group: "reference"
summary: "Where the Arrow datasheet lives, and how it was ingested (pdf2md, text-based, 59 pages)."
---

# References

Vendor PDFs. Extracted facts go in sibling `.md` files. Do not treat a PDF as unread if `pdf2md` has not been run.

| File | What | Date | Extract |
|---|---|---|---|
| [jetson_thor_series_modules_datasheet_ds-11945-001v1.4.pdf](jetson_thor_series_modules_datasheet_ds-11945-001v1.4.pdf) | NVIDIA Jetson Thor Series Modules (T5000 + T4000). Arrow download. DS-11945-001 **v1.4** Feb 2026. T4000 added in v1.3 (2025-09-29). | fetched 2026-09-01 | [T4000.md](T4000.md) |
| [jetson_thor_thermal_dg_tdg-12271-001v1.3.pdf](jetson_thor_thermal_dg_tdg-12271-001v1.3.pdf) | Jetson Thor Series Modules Thermal Design Guide. NVIDIA Developer. TDG-12271-001 **v1.3** May 18 2026. T4000 added v1.1. | fetched 2026-09-02 | [THERMAL.md](THERMAL.md) |

Still wanted (not in tree):

- Jetson Thor Series Modules **Design Guide** DG-12084-001 (carrier pins, MGBE PHY, CSI)
- **AGX Thor Developer Kit** datasheet (the 243 × 112 × 57 mm brick)
- NVIDIA Jetson Thor Series Module **3D CAD STEP** (P3834) — needed before metal body fit
