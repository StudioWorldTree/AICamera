---
title: "Thermal"
kicker: "Heat"
group: "hardware"
summary: "TDG-12271-001 v1.3. TTP max 75 °C. A sealed head plus a rear fin plate is the silent record body, about a 70% bet. Continuous 70 W AI needs a sled-sized plate. No fan in the mic cavity."
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

QATS (the maker), not the distributor line cards: **100 W at 50 °C
ambient with 8 CFM**. Unducted flow is **0.4 °C/W at 1.0 m/s**
(200 ft/min) and **0.2 °C/W at 2.0 m/s**. Fan not included. There is
**no still-air column**. Digi-Key’s “0.21 °C/W natural” is that
2 m/s figure filed under the wrong heading. Natural is better than
forced only in a catalog bug.

Still air on this extrusion is our estimate, ~**1.5 °C/W** with the
fins vertical and uncovered (buoyancy ~0.1–0.2 m/s, scaled off the
1 m/s point). At 1.5 °C/W × 70 W the rise is **105 °C**. TTP would
sit near 130 °C in a 25 °C room. **The bench brick does not cool
70 W in still air.** “Passive” here means “we didn’t put a fan on
this extrusion; your system air does.” Inside a shell the number is
worse, because the fins then heat a pocket of air.

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

A microphone in the head rules out a rotor in the head. Blade-pass
and turbulence couple into the shell, and the mic is in that shell.
The fan, if one is ever needed, lives on a rear plate that does not
share the acoustic cavity. First design is no fan at all.

Ranked thermal architectures (best first for this product):

1. **Sealed head, rear fin plate, no fan.** TTP and the Rogue PHY
   spreader → TIM → vapor chamber / heatpipes → fins on the back,
   outside the seal. Mic and lens stay in the front. Honest steady
   state is the **record** budget below (~35 W through the module).
   Matches “drop AI, never record.”
2. **Same plate, one large slow fan on the plate only.** Ducted
   backward, PWM from Thor (TDG ch. 4.2). This is how 70 W AI gets
   honest on a hot set. It is not the camera fan. Prefer it over
   any blower in the head.
3. **Radiator on the battery sled**, heatpipes or a loop across the
   dovetail. Head stays small. More plumbing. Same silence.
4. **Catalog ATS on the lab bench.** Measure TTP with a thermocouple
   at Fig. 3-2 before any custom body CAD. The brick is the
   instrument, not the lid.

Do **not**: resin as a heat path; a fan in the mic cavity; many small
fans; opening the TTP; matte-black sun-facing skin; promising sun-load
before a metal prototype.

## What the box actually dissipates (2026-10-28)

Electrical power in becomes heat. The LED is the only light that
leaves. Two paths, and they are not the same path: module watts cross
the **TTP**; PHY, SSD, and regulator watts are born on the **carrier**
and the drive.

Rogue-T5, CTIM-00160 rev 0.01 (2026-07-17), page 30. Theoretical
maximum is a T5000 MAXN pile, not our plant:

| Term in their table | Watts | Ours |
|---|---|---|
| Module | 130 (T5000 MAXN) | T4000 **70** default, **90** throttle |
| 2× USB 3.2 at 5 V / 3 A | 30 | not loaded |
| 2× 10GbE linked | **6** (3 each) | link **one 2.5G** for the 0.24 Gbps haul; leave 10G dark |
| 1× 2.5GbE linked | **2** | this jack |
| 8× GMSL PoC | 40 | no; sats are on their own PoE switch |
| NVMe | **10** budget | ~**2** at ~30 MB/s. The 10 W is a full-tilt drive |
| Wi-Fi | 3 | Key E not populated |

Their tested rows (idle, LLM, thermal chamber) are **TBD**. The
thermal-options headings are empty. Weight line: board only, “with
ethernet phy heat spreader”, also TBD. So CTI already knows the
10GBASE-T PHYs need their own spreader, and they have not published
a temperature. Their TTP cell on that page says **80 °C**, which is
the **T5000** cap. T4000 stays **75 °C**.

FORECR DSBOARD-THRMAX (UM rev 1.2): the power-consumption section
says it will be completed later. No watts, no θ. What is published:
**140 × 125 mm**, **18–36 V** in, 12 V fan connector, optional fan
or heat spreader, carrier-only ambient **−40 to +85 °C** (same trick
as the Rogue’s −40 to +85: the fiberglass, not the SOM). A 14.4 V
V-mount is **under** 18 V, so this board wants a 24 V-class pack.
That pack is bucked on the board; at ~93 % and 70 W the extra
regulator heat is about **5 W** the Rogue does not pay, because the
Rogue takes **12 V straight** onto SYS_VIN_HV. FORECR’s 1G RJ45 is
cooler than a 10GBASE-T PHY (~1 W vs ~3 W). A QSFP DAC is cool; an
optical module parks a few watts in the cage. Net: the Rogue is the
smaller, cooler carrier **if the 10G PHYs stay unlinked**. FORECR
is the escape board, and it is drawn around a fan.

Our body, heat that has to leave:

| Mode | Through the TTP | Elsewhere in the head | Head total |
|---|---|---|---|
| Record, 2.5G, light SSD | **25–35 W** (unmeasured; NVENC + ISP + DRAM + a light CPU) | ~2 PHY + ~2 SSD + ~2 bucks + ~1 sensor | **~32–42 W** |
| Record, both 10G linked | same | **+6** | **~38–48 W** |
| AI at the 70 W mode | **70** | ~6–10 | **~76–80 W** |
| Sitting on the 90 W throttle | **90** | ~8–12 | **~100 W** |

The 25–35 W record band is an estimate until the bench. It is not a
datasheet row. Put the 12 V buck for a V-mount on the **battery
plate**, not in the head. That is another few watts that does not
have to cross the shell.

## Still air, PYXIS-sized

Vertical-plate convection at a 40 K rise is about **6 W/m²K**. A
high-emissivity surface adds about **6 W/m²K** of radiation over the
same rise (σΔ(T⁴) / ΔT, ε ≈ 0.8). Planning value **h ≈ 12 W/m²K**
when every face is exposed. Bare aluminum radiates a sixth of that.
Black anodize is the right IR finish **indoors**. In sun, black
absorbs ~0.9 of 1000 W/m²: one 150 cm² face is an extra **~14 W**
heater. A white high-ε coating (α ≈ 0.25) cuts that to ~4 W.

PYXIS 6K envelope is 106 × 119 × 151 mm, geometric area **0.093 m²**.
θ of that shell, uniform and unobstructed, is 1 / (12 × 0.093) ≈
**0.90 °C/W**. A vapor-chamber couple from TTP to shell is another
**0.15–0.25 °C/W** if it is actually designed. Call the stack
**1.1 °C/W**. Lens, dovetail, and a hand eat area, so treat 1.1 as
the optimistic bare body.

TTP budget is min(75 °C, Tj − 0.24·P). Design Tj is **87 °C**, three
degrees under the 90 °C software throttle, because the sensor is
±3 °C. At 70 W that binds first: TTP must stay ≤ **70 °C**. At
30–35 W the 75 °C cap binds.

| Case | Rise at 1.1 °C/W | TTP from 25 °C air | TTP from 35 °C air |
|---|---|---|---|
| Record, 30 W through the TTP | 33 K | **58 °C**, fine | **68 °C**, fine |
| Record, 35 W | 39 K | **64 °C**, fine | **74 °C**, on the cap |
| AI, 70 W | 77 K | **102 °C**, no | worse |

So a bare cine shell, fanless, does the **record** day in a room and
gets marginal on a warm set at the top of the record estimate. It
does not do continuous AI. NVIDIA already refuses to guarantee
T4000 air cooling above **45 °C** ambient. Sun on a black face spends
that margin before the silicon does.

A rear fin plate is how the record case gets comfortable, and it is
still not a 70 W cooler. Fins want ≥8 mm spacing or the boundary
layers merge. Inner faces convect (~7 W/m²K) and barely radiate.
A 200 × 150 mm plate with 35 mm fins is ~0.26 m² of fin and about
**0.5 °C/W** on its own, in free air, fins vertical. With the shell,
record at 35 °C ambient has margin. Getting θ down to the **0.50 °C/W**
the 70 W mode needs at 35 °C wants on the order of **0.4 m²** of fin
(roughly 300 × 150 × 40 mm). That is a battery-plate, not a camera
cheek. And a tripod can aim the fins horizontal, which derates
natural convection. The plate has to stay a chimney, or the budget
shrinks.

Thermal mass buys bursts, not a mode. About 0.8 kg of aluminum in
the head is ~700 J/K. If the shell is already at steady record and
AI then adds ~40 W it cannot dump, TTP climbs ~3 K/min. From a warm
record TTP to the 70 °C AI cap is on the order of **10 minutes**.
Snaps and short looks fit. A continuous look does not. Then the
existing rule fires: drop AI, keep record.

## What to build

- Head is sealed metal. No vent, no fan, no rotor near the mic.
- ATS-NVP-3739 is the bench instrument on the TTP. Product cooler
  is heatpipes into a **rear fin plate** outside the seal.
- Rogue-T5, 12 V, **2.5G linked and both 10GBASE-T PHYs dark**.
  The PHY spreader still needs a pad to the same pipes. Those watts
  do not cross the TTP, and a cool SoC will not save a hot PHY.
- V-mount buck stays on the battery plate.
- Steady fanless promise is **record**. AI is a timed burst, then
  off. Full-time 70 W is a fan on that rear plate, ducted aft, and
  only after a TTP measurement says the plate cannot do it.
- FORECR stays the carrier escape. It is larger, it burns a buck
  the Rogue skips, and its manual still has no power numbers.

Thor PWM + tach exist if we use one fan. Default fan table is an
example; we must qualify our own cooler in software (ch. 4.2 note 1).

## Can the body stay silent? (2026-10-28)

A T4000 in the camera, with a microphone in the same head, is a
likely product if steady state is record. It is an unlikely product
if the head has to sit at 70 W with the AI on.

| Promise | Odds | Why |
|---|---|---|
| Sealed fanless head, record all day, room air | **~70%** | 30 W through the TTP lands near 58 °C. Cap is 75 °C. No rotor, so no fan in the mic. |
| Same head on a warm set, ~35 °C | **~50%** | 35 W through the TTP sits on the cap. Sun on a black face spends the rest. |
| Continuous 70 W AI, cine-sized body, no fan anywhere | **~15%** | Needs ~0.4 m² of fin. That is a battery brick, not a cheek. |
| Rear fan, "quiet enough" for the onboard mic | **low** | Same rigid shell. Path is structure-borne as well as air. Scratch tracks on quiet sets pick this up. Ruled out. |

The 70% moves on one measurement: thermocouple on a T4000 + Rogue
while encoding, 10G PHYs unlinked. Under ~30 W through the plate, the
silent body is the design. Over ~40 W, the rear plate has to grow and
the all-day silent claim shrinks to the burst. Coil whine and the SSD
are the leftover noises. Neither is a blade tone.

Cold head buys about **10 minutes** of AI from a warm record state,
then drop AI and keep record.

## Which heatsink actually helps

Air is the resistor. Still-air convection is about **6–8 W/m²K**.
Radiation adds about as much again on the outer faces only. Copper, a
vapor chamber, and liquid-metal paste shorten the path from the TTP
to that surface. They are worth doing. They do not multiply what a
given area can hand to still air. Fins closer than **8 mm** fight
each other. Past about **50 mm** tall, the air leaving the top is
already hot.

| Level | What the air sees | 25 °C room, silent | 35 °C set |
|---|---|---|---|
| ATS brick, 20 mm fins on the module | ~0.03 m², less inside a shell | Record only with fins in open air | Over the cap |
| Body skin, pipes into the shell | 0.09 m² | Record, plate near 58–64 °C | Record on the cap |
| **Rear plate on the body**, ~150 × 120 mm, 40 mm fins | **~0.20 m²** | Record with margin, into the mid-40 W range | Record becomes comfortable |
| Plate on the sled, ~300 × 150 mm, 40 mm fins, vertical, uncovered | ~0.40 m² | 70 W AI starts to close | 70 W is marginal |

The rear plate is the level that changes the camera. It sits outside
the seal, so the mic still has no rotor in its cavity, and it is what
turns the warm-set record case into something you can design around.
The sled plate is the only passive sink that makes full-time AI
honest, and only while it sees free air and stays a chimney. Flat,
bagged, or flagged, it falls back to the record budget. The head can
stay small. That sink cannot.

A catalog "100 W passive" part is a forced-air rating. The ATS figure
is 100 W at 50 °C with 8 CFM.

## Body-integration hold

Working plan is architecture 1: sealed metal head, heatpipes to a
rear fin plate, no fan, Rogue 2.5G only, V-mount buck on the battery
plate. Steady promise is record. AI is a burst of about ten minutes.

Still measure T4000 + Rogue-T5 + ATS on the TTP before metal CAD.
Lab remains the AGX kit in resin (kit has its own fan; leave it).
Production body is metal. See [POWER.md](../POWER.md),
[ENCLOSURE.md](../ENCLOSURE.md).

## Don’t

- Treat ATS “100 W passive” as still-air 100 W
- Design a sealed magnesium brick at 70 W without a radiator path
- Run at 90 °C Tj as a lifestyle — that’s the reliability knee
- Skip TIM or mount on the B2B connector alone
