# CSI vs GMSL (and the rest of the camera pipes)

Thor never “speaks GMSL.” It speaks **MIPI CSI-2**. GMSL is a long-haul
truck that dumps CSI at the carrier.

```
sensor ──CSI-2──► [optional SerDes] ──cable──► [optional DeSer] ──CSI-2──► Thor NVCSI → ISP → NVENC
```

## CSI-2 (MIPI)

**What:** Phone/embedded camera bus. 2 or 4 data lanes + clock on a
flex (FFC) or tiny coax. D-PHY on Thor: **2.5 Gbit/s per pair, 40 Gbps
aggregate** (DS-11945). C-PHY exists; qualified slower than the brochure.

**Cable:** **~10–30 cm.** Past that, the eye closes. Not a set cable.

**Control:** I2C on the same flex (sensor registers, sometimes a VCM
for autofocus).

**Power:** Separate 1.8/2.8/3.3 V on the flex, or the carrier’s camera
header.

**On Thor:** Up to **6 cameras / 16 lanes**, 32 virtual channels. Body
cam bolted to the box is this.

**Cost:** Module $30–$400. No extra chips.

**Failure mode:** Flex rips, connectors walk out, EMI, length.

## GMSL (Gigabit Multimedia Serial Link)

Analog Devices (Maxim) SerDes. **GMSL2 ≈ 3 or 6 Gbit/s per coax.**
GMSL3 ≈ 12 Gbit/s. Automotive cameras, FAKRA connectors.

**What it really is:** CSI on the camera board → **serializer**
(e.g. MAX9295) → 50 Ω coax → **deserializer** on the carrier
(e.g. MAX9296) → CSI into Thor. I2C is tunneled. **Power over Coax
(PoC)** so one cable is video + control + 12 V.

**Cable:** **~8–15 m** (3 Gbps), sometimes 15–20 m. Locking FAKRA.
Vibration-proof vs CSI flex.

**On Thor:** Needs a deserializer card (CTI JCB022, Leopard adapter,
FORECR GMSL add-on). Jetson still sees CSI. Hardware frame-sync is
common (all sats share a trigger).

**Cost:** Camera $150–$800 + deserializer board $400–$1,500 + FAKRA
cables. BOM for 2 sats is real money vs CSI.

**Failure mode:** SerDes lock, I2C address clashes, PoC current,
driver not in the BSP. Bring-up is the hard part, not the pixels.

**GMSL3** is the newer, faster cousin. Same idea, fewer cameras in
catalog, CTI JCB009.

## How this maps to our kit

| Role | Pipe | Why |
|---|---|---|
| **Body on the Thor box** | **CSI-2** | 20 cm of flex. Lowest latency into ISP/NVENC/cuVSLAM. |
| **Sats across a set** | **GMSL2** *or* PoE H.265 *or* BMD HDMI/SDI | Need 5–15 m. CSI cannot. |
| **Cine A-cam (PYXIS)** | HDMI / 12G-SDI | Not CSI. See SHOPPING.md. |

CSI vs GMSL is **not** a picture-quality choice. Same Sony IMX can ship
as CSI *or* GMSL. You’re picking **cable plant**.

## Cousins (so the table is complete)

| Pipe | Distance | Into Thor as | Notes |
|---|---|---|---|
| CSI-2 | 10–30 cm | native | Body |
| GMSL2/3 | 8–15 m coax | DeSer → CSI | Sats, PoC, FAKRA |
| FPD-Link III | 10–15 m | DeSer → CSI | TI’s GMSL rival. Fewer Jetson boards |
| HSB / CoE | Ethernet | Holoscan Sensor Bridge | NVIDIA’s Ethernet-sensor story. AGX kit QSFP |
| HDMI | meters | bridge chip → CSI | Pocket cameras. 4K30 maybe |
| 3G-SDI | long | CTI JCB003 → CSI | **1080p only** |
| 12G-SDI | long | no cheap Jetson card | PYXIS 4K out; Thor can’t ingest 12G off-the-shelf |
| USB UVC | 3–5 m | USB | Easy, latency, not the take |
| GigE / PoE IP | 100 m | Ethernet, already compressed | Our original sat idea; no RAW into ISP |
| Cooke /i | milliamps serial | UART sidecar | Orthogonal. Almost no CSI/GMSL module has it |

## Lens metadata gap

Industrial CSI/GMSL cameras are **M12 or C-mount**, sometimes a tiny
VCM. They do **not** speak Cooke /i. C-mount can take cinema glass
mechanically; /i still needs the four PL pins or a barrel reader.

So:

- **CSI/GMSL body** = great pixels into NVENC, fake /i unless you add a
  reader.
- **PYXIS PL** = real /i, not CSI.
- Hybrid we already steered: cine body (BMD or PL CSI-box you build)
  + GMSL or PoE sats that may never be /i-class.

---

## Widened camera list (not Blackmagic)

Prices qty-1, 2026. Thor drivers are **not** guaranteed — Orin BSP is
the usual starting point.

### CSI-2 (body / close-in)

| Camera | Sensor | Res / shutter | Street | Notes |
|---|---|---|---|---|
| NVIDIA / Leopard **P3762** (IMX219-class kit cam) | small rolling | 1080p-ish | kit accessory | Dev-kit ribbon. Not 4K cine. |
| **Arducam xISP IMX678** | Sony Starvis2 1/1.8" | **4K15** rolling, UYVY (onboard ISP) | **$160** | Cheap 4K CSI for Orin NX. Confirm Thor DT. M12, no /i. |
| **Vision Components VC MIPI IMX585** | Starvis 1/1.2" **4K** | rolling, ~72 fps class | **~€245** 1ku flyer; proto higher | Proper module, source drivers. Optional GMSL2 adapter (~10 m). |
| **FRAMOS FSM:GO IMX900** | 3.2 MP **global** | PixelMate CSI | **$129** Mouser | Thor “preparing” (FRAMOS Aug 2026). Not 4K. Global shutter tracking. |
| **e-con e-CAM81_CUONX** | 4K HDR CSI | Orin NX/Nano | **~$99–200** kit | Orin, not Thor-listed. |
| Allied Vision **Alvium CSI-2** | many Sony/onsemi | C-mount | **$400–1,500** | Interchangeable glass. JetPack 6.2 drivers (Orin). Closest to “cine CSI.” |

### GMSL2 (sats)

| Camera | Sensor | Res | Street | Notes |
|---|---|---|---|---|
| **FRAMOS FSM:GO IMX900 GMSL3** | 3 MP global | not 4K | **$207** Mouser | Same module as CSI, FAKRA. |
| **e-con NileCAM81** | IMX678 4K | GMSL2, AGX Orin/Xavier | **~$99** module (+ kit) | 4K GMSL sat candidate. Thor BSP unknown. |
| **Leopard IMX390 GMSL2** | 2.1 MP automotive | 1080p HDR | **~$540–725** kit | ADAS, M12, 3 m FAKRA. Not 4K. |
| **Leopard AR0234 HAWK/OWL** | 2.3 MP global | stereo kits | **$149–3k** kits | Tracking/SLAM, not picture. |
| **Allied Vision Alvium GM2** | C-mount, many sensors | 1080p–4K depending | **$500–2,000** | **C-mount + GMSL2 + FAKRA.** Best “sat with real glass.” CTI Rogue documented (WDL). |
| **TechNexion VLS-GM2-*** | AR0144 etc. | 1 MP global, C-mount | **$163** | Cheap GMSL C-mount. |
| **D3 ISX031** sealed GMSL2 | 3 MP | **$624** | Automotive sealed. |

### Deserializer boards (required for GMSL)

| Board | Price | Host |
|---|---|---|
| CTI **JCB022** GMSL2 (8 ch, PoC) | quote | Gauntlet / Rogue-T5 |
| Leopard **LI-GMSL2-DESER-HOLOSCAN** | **$388** | Thor HSB / Holoscan, 1 cam |
| Leopard 8-ch AGX adapters | **$699** carriers | Orin-era; Thor TBD |
| D3 DesignCore 16-ch | **$799** | Orin kit, not Thor |
| FORECR GMSL2 add-on | quote | THRMAX |

---

## How I’d shop if we widen past Blackmagic

**Body (on the box):** CSI IMX585 or Alvium C-mount, 20 cm flex, Thor
NVENC. Add a PL /i reader later if you care. This is the *camera
Thor was designed for*.

**Sats:** Alvium GM2 or NileCAM81 GMSL2, 5–10 m FAKRA, PoC, hardware
sync. Not Cooke /i unless you bolt a reader on.

**Cine A-cam:** still PYXIS 6K PL if /i + BRAW matter. Parallel, not
instead of CSI.

You can mix: CSI body + two GMSL sats + PYXIS as a hero that records
its own card. Three different pipes, one NAS sidecar format.

## Don’t

- Assume a $160 Arducam “just works” on Thor JetPack 7. Device-tree
  work.
- Assume GMSL 4K @ 60. GMSL2 6 Gbps is tight for RAW12 4K60 (~6 Gbps
  payload). 4K30 RAW12 (~3 Gbps) is the honest sat.
- Buy GMSL without picking the **deserializer + BSP** in the same PO
  as the cameras.
