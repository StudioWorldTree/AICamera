---
title: "Shopping"
kicker: "Buy brief"
group: "hardware"
summary: "Cart T at the 2026-10-27 streets: $8,312.57 required. Each line, the part on the buy, and the ones set aside."
---

# Cart T

The published page is the cart layout (`src/lib/cart.ts`). This chapter is the same brief for the repository. Streets below were read 2026-10-27 unless a line says otherwise. Confirm before you click. Product calls stay in INTERCONNECT, SENSORS, LENS, and the thermal note.

**Required: $8,312.57.** That sum includes three placeholder lines (two turrets, one EVB, one PoE switch). HDMI capture is **$80** and stays off the required total. JCB003 is **$1,538** and stays on the sheet so it is not ordered as a 4K pipe.

## What the buy is

One production body computer: a T4000 on a Rogue-T5, a bench heatsink, an NVMe ring, a 12 V brick, and two IX-to-RJ45 leads. A PYXIS 6K PL that records the cinema master itself. Two throwaway PoE H.265 turrets and one RV1126B dev board, so satellite encode and the /i and ToF UART can be written before a custom satellite exists. A small PoE switch that powers the turrets and does not power Thor.

The T4000 hardware encoder does two 4Kp30 streams. A body plus two satellites is therefore hybrid: the satellites encode H.265, Thor remuxes. That haul is about 0.24 Gbps, so the Rogue’s 10G jack is enough. The NAS is the vault. The RTX PRO 6000 stays off the camera.

The lab brick is still the AGX Thor Developer Kit (a T5000 in NVIDIA’s shell). That is Cart S, and it is a different envelope. This chapter is Cart T.

## Where the cinema camera sits

A Blackmagic body speaks HDMI or 12G-SDI. Thor speaks CSI. Three honest paths:

**A. Capture into CSI.** The catalog SDI card is 1080p60. Live 4K into the Thor ISP is not a part we can order.

**B. The camera keeps the master.** BRAW and /i stay on the PYXIS. Thor gets a picture to look at. This is the cart.

**C. Open the body.** The sensor does not land on a Jetson connector. On a PL body the part worth stealing is the mount and the /i reader.

Do not buy a Blackmagic as a CSI science project. If the sensor must be native CSI, that is a FRAMOS or Leopard module, not BMD.

## 01 — NVIDIA Jetson T4000

**$2,749** at [Arrow](https://www.arrow.com/en/products/900-13834-0000-000/nvidia). MPN `900-13834-0000-000`. On the cart.

Production ceiling. 64 GB, one NVENC, 70 W default and 90 W throttle, 87 × 100 × 15.29 mm. No CAN, no 3.3 V SYS_VIN_SV. HQ encode is two 4Kp30 streams. Two indexed US listings disagreed on stock (434 pieces on a 12-week lead, and 492 that ship tomorrow) and agreed on the unit price. The 1KU list was hiked to **$2,999** in July 2026.

| Choice | Price | Why |
|---|---|---|
| T4000 SOM, qty 1 | **$2,749** | This line. |
| AGX Thor Developer Kit | **$3,499** | Arrow street as of 2026-09-01, not re-fetched. T5000, 128 GB, two NVENCs. Lab brick. NVIDIA’s US list is **$5,499**. |
| Seeed listing | **$3,399** | PN `900-13834-0000-001`. A different part number. Leave it. |

A T5000 in the body is the move only if the satellite count outgrows one encoder.

## 02 — Connect Tech Rogue-T5

**$1,806** at [WDL Systems](https://www.wdlsystems.com/connect-tech-agx302). MPN `AGX302`, WDL SKU `1CAGX302`. Six available. On the cart.

Smallest production Thor carrier that takes a T4000 or a T5000. 92 × 107 mm. Two 10GBASE-T jacks and one 2.5G, all locking IX Industrial. Camera I/O is an add-on header, not connectors on the board. The page title says T5000. The spec lists both modules. Qty breaks: **$1,784** at 10, **$1,761** at 25, **$1,740** at 50.

Buying the carrier alone is the point. An assembly with the SOM already soldered is a different purchase.

| Choice | Price | Why |
|---|---|---|
| Rogue-T5, carrier only | **$1,806** | This line. |
| AGX302-002 with T4000 | **$9,291** | Stock heatspreader and 2 TB, soldered. Skip. |
| AGX302-005 with T4000 | **$9,367** | Same stack plus Wi-Fi. Skip. |
| T5000 assemblies on the same board | **$8,200–$12,500** | WDL integrated. Skip unless someone else is soldering the SOM. |
| FORECR DSBOARD-THRMAX | **€999** | Public carrier-only list, not re-fetched 2026-10-27. 140 × 125 mm, QSFP28, HDMI is an output, brick is 18–36 V. SOM and SSD variants were sold out. The escape if the Rogue slips. |
| Connect Tech Gauntlet `AGX301` | **A$3,999** | Older AU listing, not re-fetched. 155 × 126 mm, RJ45, dual NVMe. Confirm whether that price is carrier-only. US is still a quote. |
| Auvidea X242 | Quote | Published as T5000. Do not assume T4000 until Auvidea says so. |

There is no $50 Thor breakout. CTI’s old XBG boards were TX2-era. For Thor the prototype without a custom PCB is carrier plus a camera add-on.

## 03 — ATS passive heatsink

**$55.58** at [Digi-Key](https://www.digikey.com/en/products/detail/advanced-thermal-solutions-inc/ATS-NVP-3739-C1-R0/28249778). Orderable MPN `ATS-NVP-3739-C1-R0`, Digi-Key `684-ATS-NVP-3739-C1-R0-ND`. 81 in stock, 10-week factory lead, a tariff may apply. On the cart, as a bench piece.

The 100 W number is with airflow, about 500 LFM, not a sealed lid. Natural convection on this brick is a ~140 °C rise at 70 W. Measure TTP before any metal. The product lid is heatpipes to a radiator, with at most one slow fan. 70 W fanless in a cine shell is not the design.

| Choice | Price | Why |
|---|---|---|
| Passive ATS-NVP-3739-C1-R0 | **$55.58** | Digi-Key. Measure it. |
| Same sink at Mouser | **$61.37** | `984-ATSNVP-3739C1-R0`, 20 in stock. Second source. |
| Active ATS-NVA-3740-C1-R0 | **$125.27** | Digi-Key. The honest fan if the bench is still air. |

## 04 — Connect Tech MSG103

**$316** at [WDL](https://www.wdlsystems.com/Connect-Tech-Forge-AGX-Orin-AC-DC-Power-Supply-252Watt-12Volt). WDL SKU `1CMSG103`. 28 available. Fifty-plus is **$308**. On the cart.

12 V, 21 A, 252 W ±5%, 6-pin Micro-Fit. The Rogue wants 12 V. FORECR’s carrier wants 18–36 V, so that board means a different supply. Do not feed Thor from the PoE switch.

The wall cable, **CBG448**, is not in the box and was not priced.

## 05 — IX to RJ45, 1.5 m

**$82** each, **$164** for the two on the cart. [WDL](https://www.wdlsystems.com/connect-tech-cbg695), Connect Tech `CBG695`, WDL SKU `1CBG695R`. 26 available.

The Rogue’s Ethernet is locking IX, not RJ45. Two leads land the 10G jacks on an ordinary switch. The third jack is 2.5G and can wait. A third lead is another **$82**.

The full cable kit **CKG073** is **$784** (eight in stock). It adds USB and DisplayPort breakouts this cart is not using. Leave it.

## 06 — 1 TB NVMe

**$146.99** is a stand-in, not a locked part. [ADATA Legend 710 1 TB](https://www.amazon.com/ADATA-Legend-PCIe-Gen4x4-2280/dp/B09YRY5MDC) (`ALEG-710-1TCS`), sold by ADATA, Gen3. The old $80 crib number is dead. No manufacturer part is chosen.

A TLC Gen4 in the WD SN7100 class is about **$175–$200** and is the drive to buy if the ring holds real picture. Locking that MPN is the choice still open on this line. Do not use an unnamed $138 merchant.

## 07 — Blackmagic PYXIS 6K PL

**$2,475** at B&H, catalog card `BLPYXIS6KPL`, MFR `CINECAMCPYXH60LFPL`. Temporarily out of stock. The expected date was 16 Oct 2026, which has passed. Sweetwater lists the same **$2,475**. The direct B&H page returned a Cloudflare interstitial, so stock is from the catalog card. On the cart.

The PYXIS records BRAW itself. Thor takes a monitor feed. Cooke /i pins sit at 12 o’clock on the PL mount, and the mount does not swap later. SDI on this body is 4K60 monitoring. It is not a CSI input.

The September ex-duty list for PL was **$2,195**. US street, duties in, settled at **$2,475**. The old crib number, **$3,675**, is the pre-cut B&H price.

| Choice | Price | Why |
|---|---|---|
| PYXIS 6K PL | **$2,475** | The /i body. |
| PYXIS 6K EF or L | **$2,245** | About $230 less. Electronic mount metadata. No Cooke /i pins. Do not buy EF and plan to add /i later. |
| PL plus Irix two-lens kit | **$6,355** | Body, two lenses, a case. Not this line. |
| Pocket 6K G2 | older street | A cheaper HDMI mule. Not this master. |

Cracking one open: teardowns show a sensor board, an I/O board, and a fan. The MIPI from the IMX does not land on a Jetson-compatible connector. /i lives on the PL mount PCB (four pins, RS-232-ish, milliamps). The useful steal is the mount and the /i reader.

## 08 — Two PoE turrets and one EVB

**$400** of placeholders from 2026-09-01. Not re-shopped. On the cart as stand-ins: **$100** each for two turrets, **$200** for one dev board.

These are encode mules. They are not what we ship. The SoC has to be an RV1126 or RV1126B. RV1126 is being discontinued. RV1126B is the successor. A random IMX415 turret, or a USB board such as the youyeetoo at **$75**, is the wrong pipe. iVcan’s RV1126B-P with IMX415 was quote-only. Tronlong’s industrial kit was a limited 398 CNY promo and is not clearly this sensor. iVcan’s older RV1126 boards were **$160–$244**. PoE+ is enough for two turrets.

Name an RV1126B PoE turret and a dev board before RV1126 stock disappears.

## 09 — PoE+ switch and HDMI capture

The switch is a **$200** placeholder. It powers the two turrets and nothing else. Thor has no PoE. A bigger switch does not change the camera.

USB HDMI capture is **$80** optional, and off the required total. A real dongle is anywhere from about $30 to $200. It is the live-AI proxy until a CSI or GMSL add-on exists. It is not the take. The take is BRAW on the PYXIS.

## 10 — JCB003, leave it

**$1,538** at [WDL](https://www.wdlsystems.com/connect-tech-jcb003-01). MPN `JCB003-01`, WDL SKU `1CJCB031`. Four available. It does run on a Rogue-T5. Do not buy it.

Two 3G-SDI inputs into MIPI, 1080p60. The PYXIS 12G output does not become 4K by passing through this board. It stays on the sheet so nobody adds it as a 4K pipeline.

**JCB010**, the HDMI bridge, is still a quote. Its public page is Orin and Xavier. Confirm a Thor BSP before that becomes a line. 4K30 only if the bridge and the BSP both allow it.

## Choices that still move the build

- Name the NVMe. **$146.99** is a Gen3 stand-in. A TLC Gen4 is the ring if it holds picture.
- Measure the passive sink. Still air on the bench means the **$125.27** active, not a hope.
- Quote **CBG448**, the wall cable the brick does not include.
- Name an RV1126B PoE turret and a dev board before RV1126 stock disappears.
- FORECR at **€999** is the escape if the Rogue slips. It is a different brick and a bigger board.
- A third IX lead is **$82** when the 2.5G jack needs a switch.

## What not to buy

- Seeed `900-13834-0000-001` at **$3,399**. Wrong part number.
- Integrated Rogue assemblies at **$9,291** and up, unless someone else is soldering the SOM.
- CKG073 at **$784** in place of two CBG695 leads.
- JCB003 as a 4K pipeline.
- PYXIS EF or L “and add /i later.” The mount is not swappable.
- Auvidea X242 until T4000 is in writing.
- A Pocket opened up to harvest CSI. Wrong pinout.
- PYXIS 12K. Money, an early sensor-board recall, and 10GbE this cart does not need.

## Cart S, the other buy

The resin shell wraps the AGX kit, not this sandwich.

1. AGX Thor Developer Kit — **$3,499** at the 2026-09-01 Arrow street. Not re-fetched. NVIDIA US list **$5,499**.
2. A Pocket as an HDMI mule, if the week’s job is software on the kit.

That is not the production ceiling. Cart T is.

## Contacts

- Arrow, T4000 and the AGX kit.
- Connect Tech, `sales@connecttech.com`. WDL Systems is the US reseller with the public cart.
- FORECR, `sales@forecr.io`.
- Blackmagic, B&H, or the Blackmagic reseller finder.

## Sources

- Arrow T4000 `900-13834-0000-000`, **$2,749**, 2026-10-27. Two stock counts, one price.
- WDL Rogue-T5 carrier **$1,806**; AGX302-002 **$9,291**; AGX302-005 **$9,367**; MSG103 **$316**; CBG695 **$82**; CKG073 **$784**; JCB003-01 **$1,538**.
- Digi-Key ATS-NVP-3739-C1-R0 **$55.58**; Mouser **$61.37**; ATS-NVA-3740-C1-R0 **$125.27**.
- B&H PYXIS 6K PL catalog card **$2,475**, out of stock. EF and L **$2,245**. Irix kit **$6,355**.
- ADATA Legend 710 1 TB **$146.99**, Amazon, sold by ADATA. Not a locked MPN.
- Not re-fetched this pass: AGX kit **$3,499**, FORECR **€999**, Gauntlet **A$3,999**, turret / EVB / switch / HDMI placeholders.
