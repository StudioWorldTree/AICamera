---
title: "Thermal"
kicker: "Heat"
group: "hardware"
summary: "TDG-12271-001 v1.3. TTP max 75 °C. 70 W fanless in a cine envelope is not honest. Body-as-radiator ~40 W still air; 70 W AI wants heatpipes to a real radiator and at most one slow fan. Measure TTP before metal CAD."
---

# T4000 thermal — facts from TDG-12271-001 v1.3

Source: [jetson_thor_thermal_dg_tdg-12271-001v1.3.pdf](jetson_thor_thermal_dg_tdg-12271-001v1.3.pdf)
NVIDIA Developer download, 24 pp, May 18 2026. `pdftotext` 2026-09-02.

This is the **SOM thermal / mechanical interface**, not a product cooler.
Customer designs the cooler that sits on the TTP. NVIDIA sells neither
a cine body nor a fanless 70 W promise.

## Limits (Table 2-1)

| | T4000 | T5000 |
|---|---|---|
| **TTP max** (must not exceed) | **75 °C** | 80 °C |
| Recommended SoC (Tj) | **90 °C** | 90 °C |
| SoC max / specified clocks | 115 °C | 115 °C |
| Hardware reset (thermal trip) | **118 °C** | 118 °C |
| TMP default / throttle | 70 W / **90 W** | 120 W / 130 W |

Reliability (note 3): 95 % of 5-year life at 90 °C Tj, 5 % at 118 °C.
Running hot shortens the module. Software throttle at 90 °C; hardware
throttle then **reset** at 118 °C. Trip settings **cannot be changed**.
Sensor uncertainty ±3 °C — design headroom under 90 °C, not onto it.

Datasheet companion (DS-11945): T4000 air-cooled **not guaranteed
above 45 °C ambient**. T5000: not guaranteed above 25 °C ambient.
Sun-load on a black cine body is the 45 °C problem, not the lab.

## What the TTP is

The module ships with a **Thermal Transfer Plate** covering the whole
PCB, internal heat spreader + heatpipe onto the SoC. Contact patch
**62.5 × 81.4 mm**. Full-face contact.

- Cooler (passive *or* active — NVIDIA’s words) bonds to the **top of
  the TTP** with **customer TIM**.
- Mount: M3 screws through cooler + TTP + backside stiffener into
  **standoffs**. Connector cannot carry the module.
- **Do not open the TTP.** Warranty void (Fig. 1-3 note).

TMP = steady-state average board watts (size the cooler).
EDP = power-supply transients (size the PSU). Do not confuse them.

## The number that matters: θpa

θjp (SoC → TTP), Table 3-1, T4000:

| Workload | θjp |
|---|---|
| Balanced (CPU+GPU+DRAM — our AI+encode case) | **0.24 °C/W** |
| Unbalanced (CPU-only hotspot) | 0.30 °C/W |

At 70 W balanced: SoC is **16.8 °C above TTP**. Hold SoC at 90 °C →
TTP **73.2 °C** (2 °C under the 75 °C cap). TTP and SoC limits are
almost the same on T4000; T5000 is looser (80 °C TTP, θjp 0.18).

Required cooler, TTP → ambient:

```
θpa ≤ (73.2 − Tamb) / 70     °C/W
```

| Tamb | θpa max at 70 W | θpa max at 40 W |
|---|---|---|
| 25 °C | **0.69** | 1.21 |
| 35 °C | **0.55** | 0.96 |
| 45 °C (NVIDIA air-cooled ceiling) | **0.40** | 0.71 |

NVIDIA’s own example (T5000, 60 W, 50 °C amb) needed **0.49 °C/W**.
That is a serious cooler.

## Catalog coolers vs those numbers

ATS Thor (fits TTP, Digi-Key):

| PN | Kind | Envelope | Mass | Claim |
|---|---|---|---|---|
| `ATS-NVP-3739` | “Passive” extrusion | 87 × 101 × 20 mm | 168 g | **100 W @ 50 °C with 500 LFM** |
| `ATS-NVA-3740` | Fan in the fins | same | 104 g | 95 W @ 50 °C |
| `ATS-NVA-3752` | Blower | 92 × 101 × 29 mm | 174 g | 175 W — T5000, skip |

500 LFM ≈ 2.5 m/s. That is **chassis airflow**, not still air. ATS
passive at 200 LFM is ~0.45 °C/W — works at 25–35 °C **with a fan
somewhere in the box**. Natural convection on an 87 × 101 × 20 mm
fin stack is ~1.5–2.5 °C/W. At 2 °C/W × 70 W = **140 °C rise**.
TTP would be ~165 °C. **A small “passive” brick does not cool 70 W
in still air.** The word passive in the ATS catalog means “we didn’t
put a fan on this extrusion; your system air does.”

CTI Rogue-T5 SKU **AGX302-02Y** is “Thor Passive Cooling” on a T5000
assembly (~$8.4k). Same story: a chunk of aluminum, not a silent
handheld.

## Radiators, not a flock of fans

Duke preference: better heatsinks/radiators, not lots of fans.
TDG allows either. Physics of 70 W:

A cine-sized metal shell (≈0.12 m², six sides of ~150 × 120 × 80 mm)
at 8 W/m²K natural convection and 40 K rise dumps **~38 W**. Fins
might get 50 W. **70 W fanless in a PYXIS-class envelope is not
honest.** Record-only (NVENC + CSI, AI dropped) is more like
15–30 W — that *is* fanless-capable.

Ranked thermal architectures (best first for this product):

1. **Body is the radiator.** TTP → TIM → vapor chamber / heatpipes
   → magnesium or aluminum cine shell, black anodized, finned back.
   Honest **~40 W** still air. Matches “drop AI, never record.”
2. **Heatpipes to a V-mount / rear radiator + one large slow fan.**
   One 80–92 mm on a fin stack, PWM from Thor (TDG ch. 4.2, default
   table 750–2900 RPM). 70 W AI. Cine already sounds like this (RED).
   Prefer this over three tiny blowers.
3. **Remote radiator.** Heatpipes or a liquid loop to a battery-plate
   or pack. Optical body stays cool and silent. More plumbing.
4. **Catalog ATS/CTI HS on the lab bench.** Measure TTP with a
   thermocouple at Fig. 3-2 before any custom body CAD.

Do **not**: resin as a heat path; sealed plastic; many small fans;
opening the TTP; promising sun-load before a metal prototype.

Thor PWM + tach exist if we use one fan. Default fan table is an
example; we must qualify our own cooler in software (ch. 4.2 note 1).

## Body-integration hold

Thor-in-body is still the product shape. It is **not** a solid plan
until we pick 1 vs 2 vs 3 above and measure a T4000 + Rogue-T5 +
ATS stack. Lab remains the AGX kit in resin (kit has its own fan;
leave it). Production body is metal. See [POWER.md](../POWER.md),
[ENCLOSURE.md](../ENCLOSURE.md).

## Don’t

- Treat ATS “100 W passive” as still-air 100 W
- Design a sealed magnesium brick at 70 W without a radiator path
- Run at 90 °C Tj as a lifestyle — that’s the reliability knee
- Skip TIM or mount on the B2B connector alone
