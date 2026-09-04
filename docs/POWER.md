---
title: "Power"
kicker: "Watts"
group: "hardware"
summary: "T4000 default 70 W, throttle at 90 W. If power sags: drop AI, never record. Two PoE+ sats ≈ 60 W at the PSE. Do not power Thor from the switch."
---

# Power and thermal

Activated with `aicam-thermal`. Spec: `openspec/changes/add-power-thermal/`.
If power sags: **drop AI, never record**.

## Thor

| | T4000 SOM | AGX kit (T5000) |
|---|---|---|
| Default | 70 W | 120 W mode exists; kit 40–130 W |
| Throttle | TMP > **90 W** | TMP > 130 W |
| TTP max | **75 °C** | 80 °C |
| HV | 7–20 V (12 V typ), 22 A max @ 20 V | kit brick |
| MV | 5 V, 6 A max | kit brick |
| SV 3.3 V | none | T5000 only |

TDG-12271-001 v1.3 is in tree: [references/THERMAL.md](references/THERMAL.md).
T4000 TTP **75 °C**, SoC 90 °C recommended. 70 W still-air handheld
is not honest; body-as-radiator ~40 W; 70 W AI wants heatpipes to a
real radiator and at most one slow fan. Prefer radiators to lots of
fans. Measure before sun-load promises.

## PoE satellites

Two cameras at 802.3at ≈ **60 W** at the PSE. Heated/PTZ → bt.

PoE switch is its own PSU. Do not power Thor from the switch.

## Kit watts (bring-up order of magnitude)

- AGX Thor: 40–130 W
- 2× PoE+: ~60 W
- Switch: ~15–30 W
- NAS: off-body

## Enclosure

Resin is structural, not a heat sink. Vent the TTP / kit fan. First
print is a fit-check of the **AGX kit** (243 × 112 × 57 mm), not the
15 mm SOM sandwich. Production body is **metal** (the radiator).
Hold sealed-body CAD until T4000 + Rogue-T5 + ATS is measured.
