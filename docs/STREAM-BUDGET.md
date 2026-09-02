# Stream budget — 4K in, 4K out

Feeds `aicam-interconnect`. Does not pick the fabric; it says which links survive which payload.

**Record path is HEVC, not RAW over the wire** (2026-09-01). Thor and/or the satellite cameras have hardware 4K H.265. CSI/GMSL RAW exists only as the body sensor → ISP → NVENC hop on the module. Do not budget 5–10 Gbps per satellite.

Bring-up row: **1 body + 2 satellites, 4K30**. 4-sat and 6-sat are tabled. Hybrid fabric (body CSI/GMSL, satellites PoE HEVC) is the working assumption.

## Payload per stream (payload only, no protocol overhead)

| Class | What | 4K30 | 4K60 | Notes |
|---|---|---|---|---|
| RAW12 Bayer | 3840×2160×12/8 × fps | **2.99 Gbps** | **5.97 Gbps** | Often shipped in 16-bit containers → same as 8-bit 4:2:2 |
| 8-bit 4:2:2 | 3840×2160×2 × fps | **3.98 Gbps** | **7.96 Gbps** | |
| 10-bit 4:2:2 | 3840×2160×2.5 × fps | **4.98 Gbps** | **9.95 Gbps** | Matches 12G-SDI ~11.88 Gbps with overhead |
| HEVC contribution | UHD Forum 2160p50/60 Main10 | — | **50–80 Mbps** | Cinema proxy often 100–200 Mbps |
| HEVC HQ on-set | working number | **40–80 Mbps** | **80–150 Mbps** | NVENC; not a distribution encode |

Working number for **what we haul:** **~100 Mbps per 4K30 HEVC** (NVENC HQ on-set). The RAW/4:2:2 rows stay as a ceiling for a hero uncompressed sat or for CSI into the SoC — not the satellite plant.

## Thor encode (FACT, DS-11945-001 v1.4 tables 2-4 / 2-5)

YUV420 8-bit, indicative. NVENC shares the GPU rail. Local copy: [references/jetson_thor_series_modules_datasheet_ds-11945-001v1.4.pdf](references/jetson_thor_series_modules_datasheet_ds-11945-001v1.4.pdf). T4000 extract: [references/T4000.md](references/T4000.md).

| SKU | NVENC | HEVC HQ 4Kp30 | HEVC HQ 4Kp60 | HEVC UHP 4Kp30 | HEVC UHP 4Kp60 |
|---|---|---|---|---|---|
| **T4000** 70 W | 1× | **2** | **1** | 6 | 3 |
| **T5000** 120 W | 2× | **4** | **2** | 12 | 6 |

AGX Thor Developer Kit = **T5000 module**. There is no T4000 kit.

**Implication:** T4000 HQ cannot Thor-encode 1 body + 2 sats at 4K30 (needs 3). That is an **NVENC count** problem, not a cable problem. Hybrid: Thor NVENC on the body cam; satellites send H.265 they already made (or Thor remuxes). T5000 HQ can encode the trio on-module if we want.

Six 4K60 on Thor is UHP, not a quality-master promise. HEVC decode for AD/overlay is the other budget: T4000 1× NVDEC, 4× 4Kp60 HEVC Main10 — do not decode six 4K60 for the VLM.

## Links (usable, not wire-rate)

| Link | Wire | Honest video | Length | Role on this kit |
|---|---|---|---|---|
| USB-C 3.1 (AGX kit) | 10 Gbps | ~8 Gbps shared, short | meters | Not the multi-4K trunk. Debug, disk, one webcam. |
| USB4 / TB4 | 40 Gbps | ~32 Gbps, shared, short | meters | Still a bad trunk for satellites. |
| 5GbE (AGX RJ45) | 5 Gbps | ~4.5 Gbps | 100 m | One HEVC bundle, or **one** uncompressed 4K30 if nothing else talks. |
| 10GbE | 10 Gbps | ~9 Gbps | 100 m copper / fiber | ~1 uncompressed 4K30 10-bit, or **dozens** of HEVC 4K. |
| 25GbE (T4000 **3×**, T5000 **4×**) | 25 Gbps each | ~23 Gbps each | fiber/DAC | 4 uncompressed 4K30 **per lane**. T4000 total **75 Gbps**, T5000 **100 Gbps**. |
| QSFP28 cage | 4×25 or 4×10 | **not aggregated 100G** | fiber | DS 4.10.1 note 2: lanes stay independent MGBE controllers. A 100G peer in 100G mode will not link. |
| GMSL2 | ~6 Gbps/link | one 4K30 RAW-class | coax, tens of m | Body cam / industrial sats. Needs a GMSL carrier; AGX kit is HSB/QSFP + USB, not 8× FAKRA. |
| HSB (Holoscan Sensor Bridge) | Ethernet sensor bridge | sensor-over-Ethernet into Thor | | NVIDIA’s Ethernet-sensor story. Worth a candidate next to GigE Vision. |
| PoE (af/at/bt) | power, not a bitrate | 15.4 / 30 / 60–90 W | 100 m | Satellites. Thor has **no** PoE — add a switch. Data rate is the PHY (1/2.5/5/10G), not the PoE class. |

## Kit rows

Payload = satellites + body. “Thor encode” is NVENC HQ 4K30 count.

| Kit | Uncompressed 10-bit 4:2:2 | HEVC ~80 Mbps | Thor-encode all? | Uplink that fits HEVC | Uplink that fits uncompressed |
|---|---|---|---|---|---|
| **1+2 4K30 (bring-up)** | ~15 Gbps | ~0.24 Gbps | T4000 HQ **no** (2 vs 3). T5000 HQ **yes**. Hybrid: yes on T4000. | **5GbE** is enough | **25GbE** (5GbE is not) |
| 1+4 4K30 | ~25 Gbps | ~0.40 Gbps | T4000 HQ no. T5000 HQ maybe at HP. Hybrid: yes. | 5GbE | 25GbE / 2×25 |
| 1+6 4K60 | ~70 Gbps | ~1.0 Gbps | T4000 no. T5000 UHP 6× 4Kp60, HQ only 2×. | 5GbE still yes for HEVC | **3× or 4× 25GbE** (not one 100G pipe) |

HEVC bring-up (1+2 at ~80 Mbps) is **~0.24 Gbps**. Gigabit PoE + the AGX **5GbE** jack covers it. 10/25GbE is headroom and NAS write, not a requirement to leave RAW behind. USB-C is still a bad satellite trunk (short, shared, no PoE); uncompressed columns are the exception path.

## Hybrid working plan

```
[body cam] --CSI/GMSL--> Thor NVENC --> NVMe ring --> 10/25GbE (or 3×25) --> NAS
[sat 1]    --PoE HEVC--> PoE switch --\ 
[sat 2]    --PoE HEVC--> PoE switch ----+--> Thor (decode for AI, remux to NAS)
```

- Record: HEVC. Body master from Thor NVENC; satellite masters from camera H.265 (or Thor remux).
- AI: Thor NVDEC sat proxies as needed (T4000 1× NVDEC).
- RAW stays on the module (CSI → ISP → NVENC). A hero uncompressed sat is a later exception, not v1.

## PoE power (order of magnitude)

| Class | Budget at PSE | Typical camera |
|---|---|---|
| 802.3af (PoE) | 15.4 W | small IP cam, no heater |
| 802.3at (PoE+) | 30 W | 4K box cam + iris motor |
| 802.3bt (PoE++) | 60–90 W | PTZ / heated / full cine servo |

2 satellites at PoE+ ≈ 60 W from the switch, plus Thor 40–70 W (T4000) or 40–130 W (AGX kit). Separate PSUs. Do not backfeed the AGX kit from PoE.

## Sources

- [DS-11945-001 v1.4](references/jetson_thor_series_modules_datasheet_ds-11945-001v1.4.pdf) (Arrow, Feb 2026): encode 2-4/2-5, MGBE 4.10.1, CSI 4.1, CoE 4.2, mechanical 6.4. Extract: [references/T4000.md](references/T4000.md)
- NVIDIA Jetson Thor product page: AGX kit = T5000
- 4K60 10-bit 4:2:2 ≈ 9.95 Gbps payload (12G-SDI class)
- Ultra HD Forum contribution HEVC 2160p50/60 ≈ 50–80 Mbps
