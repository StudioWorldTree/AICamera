---
title: "Shopping"
kicker: "Buy brief"
group: "hardware"
summary: "Not a spec. Blackmagic is a cinema body (path B), not a CSI science project. T4000 SOM, AGX kit, and carrier options with street prices as of 2026-09-01."
---

# Hardware shopping — cameras and T4000 breakout

Prices checked 2026-09-01 (USD street unless noted). Confirm before you click.
This is a buy brief, not a spec. Product decisions stay in INTERCONNECT / SENSORS / LENS.

## The fork that matters

Blackmagic cameras **do not speak MIPI CSI**. They speak HDMI (Pocket / Cinema Camera 6K) or **12G-SDI + Ethernet + USB-C** (PYXIS). Thor eats CSI/GMSL/HSB natively.

So “mount a Blackmagic on the Thor box” has three honest paths:

| Path | 4K into Thor? | Cooke /i? | Crack the camera? | Prototype speed |
|---|---|---|---|---|
| **A. HDMI/SDI → CSI capture card on the carrier** | HDMI 4K30 maybe; **CTI JCB003 is 3G-SDI = 1080p60 only** | From BMD files / Ethernet control, not from the SDI payload | No | Days if the card exists for Thor |
| **B. BMD records BRAW internally; Thor gets a monitor feed + sidecar** | Thor AI on 1080p/4K HDMI proxy; master stays on CFexpress | Yes, in BRAW metadata (PL /i or EF/L electronic) | No | Fastest cine path |
| **C. Open the body, rewire the sensor to CSI** | Only if you reverse a Sony IMX + FPGA. Not a weekend. | You’d still need the /i pins off the mount PCB | Yes | Weeks–months. Don’t buy a PYXIS *in order* to do this |

**Recommendation:** do **not** buy a Blackmagic as a CSI science project. Buy it as a cinema body (path B, plus HDMI/SDI into Thor for live AD/overlay). If you want native CSI, that’s a FRAMOS/Leopard module, not BMD.

---

## 1. Compute / breakout (no custom PCB)

### NVIDIA Jetson T4000 SOM (the module)

| | |
|---|---|
| PN | `900-13834-0000-000` |
| Price | **$2,749** qty 1 at [Arrow](https://www.arrow.com/en/products/900-13834-0000-000/nvidia) (492 listed in stock, “ships tomorrow”; also lists 24-week factory LT) |
| 1KU list | Was $1,999; NVIDIA raised to **$2,999** (Jul 2026) |
| Notes | 64 GB, 1× NVENC, 70 W default / 90 W TMP, **no CAN, no 3.3 V SYS_VIN_SV**. Needs a 699-pin carrier + TTP/heatsink. Arrow already sold you the datasheet. |

ATS Thor heatsinks at Digi-Key: active **~$106**, passive **~$47**.

### NVIDIA AGX Thor Developer Kit (T5000 brick — not a T4000)

| | |
|---|---|
| PN | `945-14070-0080-000` (US) |
| Price | **$3,499** Arrow (75 listed); NVIDIA US list hiked to **$5,499** Jul 2026; Seeed industrial PDF **$5,899**; Amazon third-party **$2,799** — treat Amazon as unverified |
| What’s in the box | T5000 SOM, reference carrier, 140 W PSU, 1 TB NVMe, Wi-Fi, fan |
| I/O | 5GbE, QSFP28 (4× **independent** 25G, not 100G), HDMI **out**, DP, USB-C, HSB, USB cameras |
| Notes | Fastest software bring-up. **No HDMI/SDI in.** Wrong envelope vs production T4000. Fine as the lab brick we already designed the resin shell around. |

### Connect Tech Rogue-T5 (`AGX302`) — T4000 *and* T5000  **(preferred carrier)**

| | |
|---|---|
| Size | **92 × 108 mm** |
| Compat | T5000 / T4000 / IGX Thor 500 (no SMCU) |
| Net | 2× 10GBASE-T + 1× 2.5G, locking IX Industrial |
| Camera | Expansion header → add-on boards: GMSL2/3, **3G-SDI**, HDMI, MIPI, FPD-Link |
| Carrier-only | PN `AGX302` — **quote** `sales@connecttech.com` (not a web cart) |
| Integrated (T5000 already on board) | WDL: **$8,225–$12,325** depending on cooling/NVMe/Wi-Fi/GMSL ([example AGX302-01M $8,225](https://www.wdlsystems.com/embedded/gpgpu/custitem_ff_processor/Jetson-Thor,NVIDIA-Quadro)) |
| Power | 12 V, CTI brick MSG103 252 W |
| Notes | Smallest *production* Thor carrier. Same board if you later drop in T4000. Camera I/O is **add-on**, not on the carrier. Manual: CTIM-00160. |

### Connect Tech Gauntlet (`AGX301`)

| | |
|---|---|
| Size | 155 × 126 mm |
| Compat | Marketed T5000; T4000 support claimed in CTI blogs |
| Net | 2× 10GbE + 2× 1GbE RJ45 |
| Camera | 16-lane MIPI header + same JCB add-ons |
| Price | AU listing **A$3,999** (~US$2,600) “in stock” — confirm if that’s carrier-only or with T5000. US is quote/WDL assemblies |
| Notes | Bigger than Rogue-T5. Dual NVMe. Better if you want RJ45 instead of industrial IX plugs. |

### FORECR DSBOARD-THRMAX (Estonia)

| | |
|---|---|
| Size | **140 × 125 mm** |
| Compat | **T4000 and T5000** |
| Price | **€999** carrier-only (~US$1,100) at [forecr.io](https://www.forecr.io/products/nvidia-jetson-thor-carrier-board-dsboard-thrmax). SOM/SSD variants listed **sold out** |
| I/O | 1× GbE RJ45, **QSFP28 4×25G**, 2× HDMI **2.1 out**, USB-C locking, CSI expansion (6×2-lane or 4×4-lane), M.2 NVMe, 18–36 V |
| Camera add-ons | Optional GMSL2 / MIPI cards |
| Notes | Cheapest T4000-capable carrier with a public price. **HDMI is output, not capture.** QSFP matches our uplink story. CAN-FD pins are dead on T4000 (no CAN on the SOM). Made in Europe. |

### Auvidea X242

| | |
|---|---|
| Compat | Published as **T5000**. Dual 10GbE, PCIe x16, 16-lane CSI (NVIDIA P3762 cam) |
| Price | Quote (Auvidea / distributors). Historically cheaper BSP than CTI, more DIY |
| Notes | Don’t assume T4000 until Auvidea says so. CSI-native, no SDI. |

### “Breakout board” in the CTI sense

CTI’s old **XBG*** boards were TX2-era mezzanine breakouts, not Thor. For Thor, the prototype without a custom PCB is: **carrier + camera add-on**, not a pin header fan-out of the 699-pin SOM. Don’t look for a $50 Thor “breakout.”

---

## 2. Getting Blackmagic video *into* Thor

| Widget | Price | What it actually does | 4K? |
|---|---|---|---|
| **CTI JCB003** SDI→CSI | **$1,538** [WDL, in stock](https://www.wdlsystems.com/connect-tech-jcb003-01) | 2× **3G-SDI** in → MIPI. Needs Gauntlet or Rogue-T5 | **No.** 1080p60 max. PYXIS 12G-SDI will not give you 4K through this |
| **CTI JCB010** HDMI→CSI | Quote (JCB010). Page still says Rogue/Forge **Orin/Xavier** — confirm Thor BSP | 4× HDMI → MIPI (Toshiba TC358840) | 4K30 *if* the bridge and BSP allow it. Not confirmed on Thor in public docs |
| USB HDMI capture | $30–200 | UVC into Thor USB | 4K maybe, latency and CPU. Fine for AD, not for “the take” |
| PYXIS USB-C / 1G Ethernet | included | Control, proxy, SSD record. 12K model has **10GbE** | Not a live CSI pipe |
| Open the camera | your time | Sensor is a Sony IMX on a BMD board, not a Jetson CSI pinout | Research project |

**Live 4K from PYXIS into Thor ISP is not a catalog part today.** Plan on: BMD records the master; Thor takes HDMI 1080p/4K from a Pocket or a converter for live AI.

---

## 3. Blackmagic cameras (body)

Street from B&H 2026-09-01 unless noted. All record BRAW internally. None are CSI cameras.

| Camera | Street | Mount / metadata | Video out | Form | Why / why not |
|---|---|---|---|---|---|
| **PYXIS 6K PL** | **$3,675** | **Cooke /i pins at 12 o’clock** (Canon/Cooke/Fujinon/Leica/Zeiss /i lenses). PL not user-swappable | **12G-SDI**, USB-C, **1G Ethernet**, TC/ref | Box, side plates, mounts on a Thor box | **Best match** to LENS.md. /i is real (PYXIS manual). SDI is 4K60 monitoring, not a Thor CSI input |
| **PYXIS 6K EF** | **$3,455** | Active EF (focal/iris/focus). Not /i | 12G-SDI, USB-C, Ethernet | Box | Cheaper glass. Metadata is EF-class, not entrance-pupil /i |
| **PYXIS 6K L** | **$3,465** | L-mount electronic | 12G-SDI, USB-C, Ethernet | Box | Adapt EF/PL *out* (flange). No native /i |
| **Cinema Camera 6K L** | **$2,989** (used ~$2,390) | L-mount electronic, OLP | **HDMI**, USB-C. No SDI | Handheld brick | Cheapest full-frame 6K. HDMI into a capture card is simpler than 12G. Worse “bolted to Thor” |
| **Pocket 6K G2** | **$2,269** (used ~$1,770) | Active EF | HDMI only | Pocket | Cheap Super35. HDMI. No ND. Fine as a sacrificial HDMI source |
| **Pocket 6K Pro** | **$2,835** (used ~$1,820) | Active EF, built-in ND, dual XLR | HDMI | Pocket | Same as G2 plus ND/XLR. Still HDMI |
| **Pocket 4K** | **$1,139** (used ~$930) | MFT electronic | HDMI | Pocket | Too small a sensor for “the” A-cam. OK as an HDMI test mule |
| **PYXIS 12K L/EF/PL** | **$5,825–5,829** | L electronic; PL has /i. **10GbE** | 12G-SDI, 10G RJ45 | Box | Overkill. Early 12K had a sensor-board recall (pre s/n 14221337) |
| **URSA Cine 12K LF** | **$8,435–17,435** | EF/PL | SDI / optional 100GbE | Shoulder | Wrong size/price for a Thor-mounted body |

Blackmagic list prices on their site (PYXIS 6K ~$3,455–3,515) match B&H. Holiday 2025 discounts are over.

### Cracking one open

Teardowns show a sensor board + I/O board + fan. The MIPI from the IMX does not land on a Jetson-compatible connector. /i lives on the PL mount PCB (four pins, RS-232-ish, milliamps — **not** servo power). If you crack a PYXIS PL, the useful steal is the **mount + /i reader**, not the sensor.

Rewire value: tap /i UART and HDMI/SDI. Leave the sensor in the BMD box unless you want a six-week FPGA job.

---

## 4. Suggested carts (pick one)

### Cart S — software this week (no T4000 SOM yet)

1. AGX Thor Dev Kit — **$3,499** Arrow  
2. Pocket 6K G2 — **$2,269** B&H (HDMI mule + EF metadata)  
3. HDMI cable + cheap USB capture if the kit USB stack is easier than CSI  

**~$5.8k.** Matches the resin shell. Not production T4000.

### Cart T — T4000 + Rogue-T5 **(preferred production stack)**

1. T4000 SOM — **$2,749** Arrow `900-13834-0000-000`  
2. **CTI Rogue-T5 AGX302** — quote `sales@connecttech.com` (carrier-only). WDL T5000 assemblies $8.2k+ if you want them to solder a T5000  
3. ATS Thor HS — passive `ATS-NVP-3739` **~$56** (needs system air) or active `ATS-NVA-3740` **~$125** Digi-Key. Prefer measuring the passive on the bench; production wants heatpipes to a radiator, not this brick as the product lid  
4. **PYXIS 6K PL** — **$3,675** B&H (hero /i + BRAW; not the CSI body)  
5. 1–2× RV1126/B IMX415 **PoE turrets** — **$50–150** each (encode mule)  
6. 1× RV1126B EVB/core — **$160–244** (sat software; UART for ToF + /i)  

Carrier + SOM + HS is the T4000 prototype. Live AI is HDMI/USB until a CSI/GMSL add-on. Master is BRAW + /i on the PYXIS until the CSI body exists. Thor remuxes sat HEVC.

FORECR THRMAX (€999, 140×125, QSFP) is the fallback if CTI quotes slowly. Bigger board.

If you need SDI→CSI on day one, add **JCB003 ($1,538)** and accept **1080p** into the ISP.

### Cart C — cine body that is actually /i, Thor is the brain

Same as T, PYXIS PL non-negotiable. Do not buy EF “and add /i later” — the mount is not swappable.

---

## 5. What I would not buy yet

- Auvidea X242 until T4000 is in writing  
- JCB003 as a “4K pipeline” — it is 3G  
- PYXIS 12K (money, recall, 10GbE you don’t need)  
- Integrated CTI T5000 assemblies at $8k+ unless you want them to solder the SOM  
- Opening a Pocket to harvest CSI — wrong pinout  

---

## Contacts

- Arrow T4000 / AGX kit: arrow.com (you already have the DS)  
- Connect Tech: sales@connecttech.com · WDL Systems US reseller  
- FORECR: sales@forecr.io  
- Blackmagic: B&H, or blackmagicdesign.com reseller finder  

## Sources (primary)

- Arrow T4000 `900-13834-0000-000` $2,749 (2026-09-01)  
- NVIDIA / VideoCardz Jul 2026 list-price hike (kit $5,499, T4000 1KU $2,999)  
- FORECR product page €999  
- WDL Rogue-T5 assemblies $8,225+; JCB003 $1,538  
- B&H BMD prices 2026-09-01  
- PYXIS manual: Cooke /i on PL models only  
- CTI JCB003: 3G-SDI, 1080p60, MIPI 8-bit  
