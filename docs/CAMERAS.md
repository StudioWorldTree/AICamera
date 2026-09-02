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

---

## How many GMSL2 cameras can Thor actually host?

The brochure number is **8**. The honest 4K RAW number is **4**.
**20 is not GMSL** — that is HSB / Camera-over-Ethernet.

### The three ceilings (they are not the same)

| Ceiling | Number | What it actually means |
|---|---|---|
| Catalog deser board | **8** | CTI **JCB022**: 4× MAX9296A, 8× GMSL2 coax, 16 CSI lanes out, 75×57 mm, 45 g, PoC. Mates CTI Rogue-T5 / Gauntlet camera header. FORECR GMSL add-on is the same 8-ch story. |
| Thor NVCSI fabric | **16 lanes / 6 cameras / 32 VCs** | DS-11945 ch. 2.10 / 4.1. NVIDIA GMSL framework: **12 with ISP**, 16 VC with ISP / 24 without. T4000 has **one ISP**. |
| 4K30 RAW12 on GMSL2 | **4 at 4-lane, 8 at 2-lane** | Payload ~3 Gbps/cam. GMSL2 6 Gbps/link fits 4K30 RAW12; **4K60 RAW12 (~6 Gbps) does not**. A 4K module wants 4 CSI lanes after deser. 16 lanes ÷ 4 = **4 cameras**. 8 cameras on JCB022 is 2-lane each — 1080p-class or a squeezed 4K. |
| T4000 NVENC HQ | **2 × 4Kp30** | Even if 8 RAW streams arrive, Thor can HQ-encode two. The rest sit in DRAM or get UHP. |
| T4000 NVDEC | **9 × 4Kp30 HEVC** | Only matters if the sats already encoded. |

NVIDIA’s “up to 20 cameras” is **HSB / CoE** on Ethernet (FPGA bridge → MGBE), not FAKRA. Do not quote 20 as a GMSL2 count.

**Working number for this kit:** 1 CSI body on the box + **up to 4 GMSL2 4K30 RAW sats** on one JCB022 if we ever want RAW into ISP. 8 GMSL2 is a 1080p/2-lane plant. Past that, Ethernet.

Cable: **8–15 m** FAKRA + PoC. Not 100 m.

---

## GMSL2 RAW vs encode-on-camera then Ethernet

This is the real fork. Same pixels can leave the sensor as Bayer on coax
or as H.265 on Cat6. They are not interchangeable.

```
GMSL2:  sensor ──CSI──► MAX9295 ──6 Gbps coax 8–15 m──► MAX9296 ──CSI──► Thor ISP ──NVENC──► HEVC
PoE:    sensor ──CSI──► RV1126 ISP+HEVC ──~80 Mbps Cat6 100 m──► switch ──► Thor NVDEC (AI) / remux (record)
```

| | **GMSL2 (RAW into Thor)** | **Inline 4K H.265 + Ethernet** |
|---|---|---|
| What Thor sees | Bayer / YUV, native NVCSI | Already-compressed RTSP/ONVIF |
| Per-cam payload (4K30) | **~3 Gbps** RAW12 | **~40–80 Mbps** HEVC HQ |
| Honest cam count on T4000 | **4** 4K RAW (8 at 1080p) | **Dozens** on 5GbE; **~9** if Thor must NVDEC every stream for AI |
| Cable | 8–15 m 50 Ω coax, FAKRA, PoC | **100 m** Cat5e/6, PoE af/at |
| Power | PoC 12 V on the same coax | PoE switch (Thor has **no** PoE) |
| Sync | Hardware FSYNC through SerDes. This is why GMSL exists. | PTP / 802.1AS (Thor has it). Weaker than genlock. Fine for v1. |
| Latency | ~1 frame + SerDes lock | Encoder GOP + network. Cheap IPC is **50–200 ms**. Not a live EVF. |
| ISP / SLAM / NVENC on pixels | **Yes.** Thor ISP, cuVSLAM, NVENC HQ. | **No RAW.** Thor remuxes the take; NVDEC a proxy for AD/overlay. |
| Cooke /i | Almost never on the module. Add a barrel reader. | Same. UART sidecar over Ethernet is actually easier. |
| Bring-up | Device tree, I2C aliasing, SerDes lock, BSP. Weeks. | RTSP/ONVIF. Days. |
| BOM, 2 sats | Cams $150–2k + deser $400–1.5k + FAKRA | **$50–200 / cam** turret + a PoE switch |
| Failure | SerDes unlock, PoC current, DT | Network, GOP, ONVIF quirks |
| Catalog | Common in auto/industrial. Not cine. See list above. | Every IP camera on earth. |

**When GMSL2 is the right sat:** the sat is close (<15 m), you want RAW
into Thor ISP (tracking, SLAM, your own NVENC look), and you will pay
for FSYNC. Alvium GM2 / NileCAM81 / VC IMX585+GMSL adapter.

**When encode-on-sat is the right sat:** anything across a stage,
anything cheap, anything we already steered (hybrid fabric, T4000 HQ
cannot encode 1+2). This is the bring-up plant.

**Do both at the connector level, not as two products.** Body = CSI
(or one GMSL hop if the sensor sits 1–2 m off the box). Sats = PoE
H.265. Add a JCB022 later if a sat needs to become a RAW tracker.
Do not make every sat GMSL — you will run out of CSI lanes, ISP, and
NVENC before you run out of set.

HSB/CoE is the third path (RAW-class over Ethernet, FPGA on the
camera). Worth a later look; not cheap, not a $50 turret.

---

## Cheap hardware for Ethernet + hardware 4K H.265

**Do not use a Raspberry Pi as the sat encoder.**

| Board | HW encode | HW decode | Ethernet | Verdict |
|---|---|---|---|---|
| **Pi CM4** (BCM2711, 55×40 mm) | **H.264 1080p30 only** | HEVC 4Kp60 | GbE | Cannot 4K-encode. Wrong chip. |
| **Pi CM5 / Pi 5** (BCM2712) | **none** (RPi engineer, 2025: no HW encoder; ARM MJPEG maybe) | HEVC 4Kp60 | GbE | Worse than CM4 for this job. |
| **Rockchip RV1126** | **H.265/H.264 4K30** (+ 1080p30 second stream) | 4K30 | 100/1000 | **This is the sat SoC.** 4× A7, 2 TOPS NPU, ~5 W. |
| **Rockchip RV1126B** | **H.265/H.264 4K30** (brochure 4K45 / 12 MP30, bitrate to 200 Mbps) | 4K30 | **GbE** | Newer: 4× A53, 3 TOPS, USB3. Buy this if the module exists in stock. |
| HiSilicon Hi3519A | 4K60 H.265, better ISP | 4K | GbE | Classic IPC. Export-painful in the US. Skip unless a turret already has it. |
| Ambarella CV2/CV5 | cinema-grade | — | — | Wrong price. |
| RK3588 / Orange Pi 5 | 4K encode *and* a desktop | — | GbE | Overkill; power and size of a mini PC. |

### What to actually buy (qty-1, 2026)

| Item | Street | What you get |
|---|---|---|
| **RV1126 + IMX415** turret, PoE, ONVIF | **~$50–150** (Alibaba/Made-in-China Smartgiant etc.; complete camera) | 8 MP / 4K30 H.265, 802.3af, RTSP. Crack the shell, keep the board. This is the sat prototype. |
| RV1126 IPC **dev board** + IMX415 | **$160–244** (ivcan.com Thinkcore / EVB) | SDK, serial, Ethernet. For bringing up our sidecar, not for hanging on a stand. |
| RV1126 **core board** 38×38 mm | **~$90–135** 1-off | Sensor + PoE carrier separate. Path to a C-mount sat we own. |
| RV1126B-P SoM (Boardcon MINI1126B-P) | quote | 2–4 GB LPDDR4, GbE PHY on module. Newer silicon. |
| Firefly CQ38W-1126B | IP67, **no PoE** (12 V) | Rugged shell; 3/5 MP not 4K. Skip for picture sats. |

A $60 PoE turret already is “ethernet + hardware-level 4K encode.”
You do not need to invent a CM4 carrier. If we later want C-mount +
/i on a sat: RV1126 core board + Alvium-class sensor is a custom
PCB, not a Pi hat.

**Pi CM4 is a fine GPIO/I2C sidecar** (Cooke /i UART → Ethernet
bridge) bolted onto a real encoder. It is not the encoder.

Bitrate we haul: ~80 Mbps/cam 4K30 (STREAM-BUDGET). 3 sats ≈
0.24 Gbps. Gigabit PoE + Thor 5GbE is plenty. T4000 NVDEC 9× 4Kp30
is the AI ceiling, not the NIC.

---

## How big / heavy is Thor — and should it live in the camera body?

### The module (what production is)

| | mm | g | W |
|---|---|---|---|
| **T4000 SOM** (DS-11945 §6.4) | **87.0 × 100.0 × 15.29** | **350 ±4%** | 70 default / 90 throttle |
| ATS **passive** HS `ATS-NVP-3739` | 87 × 100.8 × **20** | **168** | 100 W @ 50 °C with airflow |
| ATS **active** HS `ATS-NVA-3740` | 87 × 100.8 × **20** (fan in fins) | **104** | 95 W @ 50 °C |
| ATS blower `ATS-NVA-3752` | 92 × 100.8 × 28.6 | 174 | 175 W — T5000-class, skip |
| **SOM + active HS** | ~87 × 101 × **~36** | **~450** | still needs a carrier |

TTP contact patch is 62.5 × 81.4 mm. Resin is not a heat sink.

### The carrier (you cannot skip this)

| | mm | g |
|---|---|---|
| CTI **Rogue-T5** AGX302 | **92 × 108** | **136** (product page; T4000 *and* T5000) |
| FORECR **DSBOARD-THRMAX** | **140 × 125** | — |
| NVIDIA **AGX Thor Dev Kit** | **243.19 × 112.40 × 56.88** | brick | 40–130 W, T5000. Lab only. |

Rogue-T5 + T4000 + active HS is the smallest catalog stack:
about **92 × 108 × 40–55 mm** plus connectors, **~0.7–1.0 kg**
before battery, lens, NVMe. FORECR is a bigger rectangle with QSFP.

### Against a cine body

| | mm | kg | W (picture) |
|---|---|---|---|
| **PYXIS 6K** body | 119 × 106 × 151 | **1.5** | ~15–25 class |
| T4000 + Rogue + HS (no lens, no batt) | ~92 × 108 × 50 | **~0.8–1.0** | **70** |
| AGX kit in our resin shell | 243 × 112 × 57 (+ walls) | kit + resin | 40–130 |

The SOM sandwich is **smaller in two axes than PYXIS and a lot
hotter.** PYXIS depth is the PL mount + sensor stack. Ours would
be: PL (or C) on the front, CSI flex 20 cm to Thor, heatsink
exhaust, V-mount on the back.

### Verdict: yes, Thor-in-body is the product — with the kit as lab

**Coolest (and right) shape:** one box that *is* the camera.
T4000 + compact carrier + CSI body sensor + PL /i reader + NVENC
+ 5/10GbE. Sats are cheap PoE H.265, not more Thors.

**Do not put the AGX kit in a cine body.** 243 mm brick, 130 W,
wrong envelope. The resin shell is a fit-check of the lab brick,
not the product.

**Do not put a Thor in every sat.** $2,749 + 70 W + 350 g per
eyeball. Sats encode on RV1126.

Constraints that will shape the body, in order:

1. **Heat, not volume.** 70 W into a handheld cine envelope is a
   fan, vents, and a TTP lid. PYXIS-class 20 W is silent; we will
   not be. Active ATS HS (104 g, 20 mm) is the starting lid.
2. **Battery.** 70 W + sensor + fan. A 98 Wh V-mount is ~1 hour at
   full AI. Cine already lives on V-mount; handheld-without-brick
   is a later SKU. Drop AI, never record, still helps here.
3. **Carrier area.** Rogue-T5 92×108 mm is the board to design
   around. FORECR 140×125 and the AGX kit are not.
4. **Sensor is CSI, not PYXIS.** Bolting a 1.5 kg PYXIS onto a
   Thor box is two cameras taped together. Fine as a /i + BRAW
   hero *next to* the AI body. The product body is a CSI IMX585 /
   Alvium (or a PL CSI box we build) with Thor inside.
5. **Need TDG-12271-001** before promising sun-load or a sealed
   magnesium shell. First print stays the AGX kit.

So: **integrate Thor into the camera body for production.** Lab
is the kit in resin with a camera clamped on the front. Those
are two different objects; do not confuse the CAD.
