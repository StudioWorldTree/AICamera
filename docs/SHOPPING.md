---
title: "Shopping"
kicker: "Buy brief"
group: "hardware"
summary: "Cart T at the 2026-10-27 streets: $7,745.58 required. The satellite plant is $600, off that total."
---

# Hardware shopping

The published page reads `src/lib/bom/kit-prod.csv`, a daBOM export of `kit-prod` committed in this repo. Refresh it with `bun run bom` when a quote changes, then commit the file. The sentences live in `src/lib/cart.ts`. Streets below were read 2026-10-27 unless a line says otherwise. Confirm before you click. Product calls stay in INTERCONNECT, SENSORS, LENS, and the thermal note.

**Required: $7,745.58.** HDMI capture is **$80** and stays off the required total. The satellite plant is **$600** and stays off it too: an RV1126B dev board, two PoE cameras, and the switch that powers those cameras. Cooke /i can be patched without that board. The body 4K sensor is not on the order yet. SDI and HDMI bridge cards are off the cart.

## What the buy is

One production body computer: a T4000 on a Rogue-T5, a bench heatsink, an NVMe ring, a 12 V brick, and two IX-to-RJ45 leads. A PYXIS 6K PL that records the cinema master itself. Satellites are a separate buy: a dev board, two throwaway PoE cameras, and the switch that powers those cameras. /i does not require that board.

The T4000 hardware encoder does two 4Kp30 streams. A body plus two satellites is therefore hybrid: the satellites encode H.265, Thor remuxes. That haul is about 0.24 Gbps, so the Rogue’s 10G jack is enough. The NAS is the vault. The RTX PRO 6000 stays off the camera.

The lab brick is still the AGX Thor Developer Kit (a T5000 in NVIDIA’s shell). That is Cart S, and it is a different envelope. This chapter is Cart T.

## Where the cinema camera sits

A Blackmagic body speaks HDMI or 12G-SDI. Thor speaks CSI. Three honest paths:

**A. Bridge the PYXIS into CSI.** The SDI card is 1080p60, and there is no 12G card. That door is off the cart. The USB capture is already the monitor picture.

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
| [Seeed listing](https://www.seeedstudio.com/NVIDIA-Jetson-AGX-Thor-T4000-Module-p-6939.html) | **$3,399** | PN `900-13834-0000-001`. A different part number. Leave it. |

A T5000 in the body is the move only if the satellite count outgrows one encoder.

## 02 — Connect Tech Rogue-T5

**$1,806** at [WDL Systems](https://www.wdlsystems.com/connect-tech-agx302). MPN `AGX302`, WDL SKU `1CAGX302`. Six available. On the cart.

Smallest production Thor carrier that takes a T4000 or a T5000. 92 × 107 mm. Two 10GBASE-T jacks and one 2.5G, all locking IX Industrial. Camera I/O is an add-on header, not connectors on the board. The page title says T5000. The spec lists both modules. Qty breaks: **$1,784** at 10, **$1,761** at 25, **$1,740** at 50.

Buying the carrier alone is the point. An assembly with the SOM already soldered is a different purchase.

| Choice | Price | Why |
|---|---|---|
| Rogue-T5, carrier only | **$1,806** | This line. |
| [AGX302-002 with T4000](https://www.wdlsystems.com/connect-tech-agx302) | **$9,291** | Stock heatspreader and 2 TB, soldered. Skip. |
| [AGX302-005 with T4000](https://www.wdlsystems.com/connect-tech-agx302) | **$9,367** | Same stack plus Wi-Fi. Skip. |
| T5000 assemblies on the same board | **$8,200–$12,500** | WDL integrated. Skip unless someone else is soldering the SOM. |
| [FORECR DSBOARD-THRMAX](https://www.forecr.io/products/nvidia-jetson-thor-carrier-board-dsboard-thrmax) | **€999** | Public carrier-only list, not re-fetched 2026-10-27. 140 × 125 mm, QSFP28, HDMI is an output, brick is 18–36 V. SOM and SSD variants were sold out. The escape if the Rogue slips. |
| Connect Tech Gauntlet `AGX301` | **A$3,999** | Older AU listing, not re-fetched. 155 × 126 mm, RJ45, dual NVMe. Confirm whether that price is carrier-only. US is still a quote. |
| Auvidea X242 | Quote | Published as T5000. Do not assume T4000 until Auvidea says so. |

There is no $50 Thor breakout. CTI’s old XBG boards were TX2-era. For Thor the prototype without a custom PCB is carrier plus a camera add-on.

## 03 — ATS passive heatsink

**$55.58** at [Digi-Key](https://www.digikey.com/en/products/detail/advanced-thermal-solutions-inc/ATS-NVP-3739-C1-R0/28249778). Orderable MPN `ATS-NVP-3739-C1-R0`, Digi-Key `684-ATS-NVP-3739-C1-R0-ND`. 81 in stock, 10-week factory lead, a tariff may apply. On the cart, as a bench piece.

The 100 W number is with airflow, about 500 LFM, not a sealed lid. Natural convection on this brick is a ~140 °C rise at 70 W. Measure TTP before any metal. The product lid is heatpipes to a radiator, with at most one slow fan. 70 W fanless in a cine shell is not the design.

| Choice | Price | Why |
|---|---|---|
| Passive ATS-NVP-3739-C1-R0 | **$55.58** | Digi-Key. Measure it. |
| [Same sink at Mouser](https://www.mouser.com/ProductDetail/Advanced-Thermal-Solutions/ATS-NVP-3739-C1-R0) | **$61.37** | `984-ATSNVP-3739C1-R0`, 20 in stock. Second source. |
| [Active ATS-NVA-3740-C1-R0](https://www.digikey.com/en/products/detail/advanced-thermal-solutions-inc/ATS-NVA-3740-C1-R0/28249775) | **$125.27** | Digi-Key. The honest fan if the bench is still air. |

## 04 — Connect Tech MSG103

**$316** at [WDL](https://www.wdlsystems.com/Connect-Tech-Forge-AGX-Orin-AC-DC-Power-Supply-252Watt-12Volt). WDL SKU `1CMSG103`. 28 available. Fifty-plus is **$308**. On the cart.

12 V, 21 A, 252 W ±5%, 6-pin Micro-Fit. The Rogue wants 12 V. FORECR’s carrier wants 18–36 V, so that board means a different supply. Do not feed Thor from the PoE switch.

The wall cable, **CBG448**, is not in the box and was not priced.

## 05 — IX to RJ45, 1.5 m

**$82** each, **$164** for the two on the cart. [WDL](https://www.wdlsystems.com/connect-tech-cbg695), Connect Tech `CBG695`, WDL SKU `1CBG695R`. 26 available.

The Rogue’s Ethernet is locking IX, not RJ45. Two leads land the 10G jacks on an ordinary switch. The third jack is 2.5G and can wait. A third lead is another **$82**.

The full cable kit [CKG073](https://www.wdlsystems.com/connect-tech-ckg073) is **$784** (eight in stock). It adds USB and DisplayPort breakouts this cart is not using. Leave it.

## 06 — Sandisk Optimus GX 7100, 1 TB

**$180** at [Amazon](https://www.amazon.com/dp/B0GK1M1N4V). MPN `SDSP71100TAN`. New, three left, sold and shipped by Elite100. On the cart.

This is the ring. PCIe 4.0 x4, M.2 2280, TLC BiCS, up to 7,250 MB/s read and 6,900 MB/s write. Sandisk’s page for the WD_BLACK SN7100 says this drive replaces it. There is no heatsink in the box, so it fits the Rogue slot. One terabyte holds about nine hours of the hybrid HEVC haul.

The previous part, WD `WDS100T4X0E`, is the same TLC Gen4. B&H lists it at **$219.99** and in stock. The ADATA Legend 710 at **$146.99** is Gen3 and stays off the cart. A 2 TB card is on the same Sandisk listing if the ring has to outlast a long day. Do not buy the used $175.74 offer.

## 07 — Blackmagic PYXIS 6K PL

**$2,475** at [B&H](https://www.bhphotovideo.com/c/product/1823586-REG/blackmagic_design_blpyxis6kpl_pyxis_6k_cinema_box.html), catalog card `BLPYXIS6KPL`, MFR `CINECAMCPYXH60LFPL`. Temporarily out of stock. The expected date was 16 Oct 2026, which has passed. Sweetwater lists the same **$2,475**. The direct B&H page returned a Cloudflare interstitial, so stock is from the catalog card. On the cart.

The PYXIS records BRAW itself. Thor takes a monitor feed. Cooke /i pins sit at 12 o’clock on the PL mount, and the mount does not swap later. SDI on this body is 4K60 monitoring. It is not a CSI input.

The September ex-duty list for PL was **$2,195**. US street, duties in, settled at **$2,475**. The old crib number, **$3,675**, is the pre-cut B&H price.

| Choice | Price | Why |
|---|---|---|
| PYXIS 6K PL | **$2,475** | The /i body. |
| PYXIS 6K EF or L | **$2,245** | About $230 less. Electronic mount metadata. No Cooke /i pins. Do not buy EF and plan to add /i later. |
| PL plus Irix two-lens kit | **$6,355** | Body, two lenses, a case. Not this line. |
| Pocket 6K G2 | older street | A cheaper HDMI mule. Not this master. |

Cracking one open: teardowns show a sensor board, an I/O board, and a fan. The MIPI from the IMX does not land on a Jetson-compatible connector. /i lives on the PL mount PCB (four pins, RS-232-ish, milliamps). The useful steal is the mount and the /i reader.

## Optional — satellites

**$600** of placeholders from 2026-09-01. Not re-shopped. Off the required total.

An RV1126B dev board at **$200**, two throwaway PoE H.265 cameras at **$100** each, and the **$200** PoE+ switch that powers those cameras. The board is one way to get a UART. Cooke /i can be patched without a whole camera dev board, so the board is not on the cart just for those pins. The cameras are encode mules. They are not what we ship. A random IMX415 turret is the wrong pipe. If a board or a camera is named, the SoC still has to be an RV1126 or RV1126B. RV1126 is being discontinued. RV1126B is the successor. A USB board such as the youyeetoo at **$75** is the wrong pipe. iVcan’s RV1126B-P with IMX415 was quote-only. Tronlong’s industrial kit was a limited 398 CNY promo and is not clearly this sensor. iVcan’s older RV1126 boards were **$160–$244**. PoE+ is enough for two cameras. Thor has no PoE, and this switch does not power Thor.

## 08 — HDMI capture

USB HDMI capture is **$80** optional, and off the required total. It is also off the satellite plant. A real dongle is anywhere from about $30 to $200. It is the live-AI proxy until a CSI or GMSL add-on exists. It is not the take. The take is BRAW on the PYXIS.

## 09 — 4K into Thor

**Open.** Not on this order.

Two different 4K pictures arrive at Thor, and only one of them is missing a part.

When satellites are on the plant, they encode 4K30 H.265 in the camera. Ethernet carries about 80 Mbps each. Thor stores those streams and can decode them. That plant is optional and is not this line.

The body 4K is the one Thor itself encodes. The Rogue-T5 camera input is one Samtec QSH-060, sixteen MIPI CSI-2 lanes (CTIM-00160). Four lanes is one 4K30 RAW camera. Those pixels land in the ISP, and the NVENC makes the HEVC. That uses one of the two HQ encoders. The header is on the carrier we are already buying. Nothing on the order mates to it.

The sensor to aim at is a Sony Starvis 4K module. Vision Components **VC MIPI IMX585** is 3840×2160, up to 72 fps, **€244.99** on the thousand-piece flyer. That is not a qty-1 street checked this pass. The public driver tree stops at Orin. VC said Thor drivers would follow project demand from the end of 2025, and the repo does not show that overlay yet.

The header is not the module’s flex. Something has to mate the QSH. Connect Tech’s Alvium board, [JCB005](https://www.wdlsystems.com/Connect-Tech-JCB005-Allied-Vision-MIPI-Camera-Expansion-Board-up-to-6x.-4-x-4-Lane-or-6-x-2-Lane-150), is **$448.80** at WDL and out of stock. The product page still limits it to Xavier and Orin. A March 2026 WDL note says to order it for a Rogue-T5. Those pages disagree, so it is not a buy.

The open move is a yes or no from each vendor: a Thor device tree for the IMX585, and a Thor BSP for one 4-lane camera on that header. A one-camera flex is a small board once those answers are yes.

| Choice | Price | Why |
|---|---|---|
| VC MIPI IMX585 | **€245** | The 4K sensor to aim at. Thousand-piece flyer. Driver not shown for Thor. |
| JCB005 Alvium mating board | **$448.80** | Out of stock. Page says Xavier and Orin. Not confirmed on Thor. |
| SDI or HDMI bridge | Off | 1080p60, or an unconfirmed HDMI card. The monitor feed is already the USB capture. |

## Choices that still move the build

- Measure the passive sink. Still air on the bench means the **$125.27** active, not a hope.
- Quote **CBG448**, the wall cable the brick does not include.
- FORECR at **€999** is the escape if the Rogue slips. It is a different brick and a bigger board.
- A third IX lead is **$82** when the 2.5G jack needs a switch.
- Get a Thor device tree for the IMX585, and a Thor BSP for one 4-lane camera on the Rogue header. That is the body 4K.

## What not to buy

- Seeed `900-13834-0000-001` at **$3,399**. Wrong part number.
- Integrated Rogue assemblies at **$9,291** and up, unless someone else is soldering the SOM.
- CKG073 at **$784** in place of two CBG695 leads.
- An SDI or HDMI bridge card. The USB capture is already the 1080p monitor picture, and neither bridge is the body 4K.
- PYXIS EF or L “and add /i later.” The mount is not swappable.
- Auvidea X242 until T4000 is in writing.
- A Pocket opened up to harvest CSI. Wrong pinout.
- PYXIS 12K. Money, an early sensor-board recall, and 10GbE this cart does not need.

## The lab kit

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
- WDL Rogue-T5 carrier **$1,806**; AGX302-002 **$9,291**; AGX302-005 **$9,367**; MSG103 **$316**; CBG695 **$82**; CKG073 **$784**.
- WDL JCB005 **$448.80**, out of stock. Product page still says Xavier and Orin. Not on the buy.
- VC MIPI IMX585 **€244.99** on the thousand-piece flyer. Not a qty-1 street. Not on the buy.
- Digi-Key ATS-NVP-3739-C1-R0 **$55.58**; Mouser **$61.37**; ATS-NVA-3740-C1-R0 **$125.27**.
- B&H PYXIS 6K PL catalog card **$2,475**, out of stock. EF and L **$2,245**. Irix kit **$6,355**.
- Sandisk Optimus GX 7100 1 TB **$180**, Amazon, MPN `SDSP71100TAN`. The ring. WD SN7100 `WDS100T4X0E` is the previous part, **$219.99** at B&H.
- Not re-fetched this pass: AGX kit **$3,499**, FORECR **€999**, Gauntlet **A$3,999**, turret / EVB / switch / HDMI placeholders.

## Crib selection

The numbered carts below are the selection the hardware crib reads. The discussion above is the same buy.

### NVIDIA Jetson T4000 SOM

| | |
|---|---|
| PN | `900-13834-0000-000` |
| Notes | Production module. 64 GB, one NVENC. |

### Connect Tech Rogue-T5

| | |
|---|---|
| Carrier-only | PN `AGX302` |
| Notes | Preferred carrier. T4000 and T5000. |

### NVIDIA AGX Thor Developer Kit

| | |
|---|---|
| PN | `945-14070-0080-000` |
| Notes | Lab brick. T5000 in NVIDIA’s shell. |

### Cart S — software this week

1. AGX Thor Dev Kit — `945-14070-0080-000`
2. Pocket as an HDMI mule

### Cart T — T4000 + Rogue-T5

1. T4000 SOM — `900-13834-0000-000`
2. CTI Rogue-T5 `AGX302` — carrier only
3. ATS Thor HS — passive `ATS-NVP-3739` or active `ATS-NVA-3740`
4. PYXIS 6K PL — BRAW and Cooke /i

### Optional — satellites

Not in the Cart T total. **$600** of placeholders.

1. 1× RV1126B EVB
2. 1–2× RV1126/B PoE turrets
3. PoE+ switch — powers those cameras, not Thor

### Cart C — cine body that is actually /i

Same as T. The PYXIS PL is non-negotiable. The mount is not swappable.
