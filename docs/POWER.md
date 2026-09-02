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

Need TDG-12271-001 before promising sun-load numbers.

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
15 mm SOM sandwich.
