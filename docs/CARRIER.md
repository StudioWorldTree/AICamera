# Carrier

Activated with `aicam-thor-carrier`. Spec: `openspec/changes/add-thor-carrier/`.
Module facts: [references/T4000.md](references/T4000.md).

## Lab brick

**Jetson AGX Thor Developer Kit** = T5000 module.

- 243.19 × 112.40 × 56.88 mm (kit, not SOM)
- 128 GB, 2× NVENC, 40–130 W
- 1× 5GbE RJ45, 1× QSFP28 (4 independent 25G, not 100G aggregated)
- 2× USB-A 3.2, 2× USB-C 3.1
- HSB via QSFP, USB cameras
- First enclosure wraps **this** brick

## Production SOM

**T4000** (DS-11945-001 v1.4):

- 87.0 × 100.0 × 15.29 mm, 0.350 kg ±4%, 699-pin B2B
- 64 GB LPDDR5X, 273 GB/s, 12× Neoverse V3AE, 1536 CUDA
- 1× NVENC / 1× NVDEC / 1 ISP
- 3× 25G MGBE (75 Gbps total, independent)
- Rails: SYS_VIN_HV 7–20 V (typ 12 V), SYS_VIN_MV 5 V. **No** SYS_VIN_SV, **no** CAN
- Default 70 W, throttle at 90 W TMP, TTP max 75 °C

Stay on T4000 unless satellite count forces T5000 encode.

**Preferred carrier (2026-09-02): Connect Tech Rogue-T5 (`AGX302`)**,
92 × 108 mm, T4000 and T5000, camera I/O via JCB add-ons. See
[SHOPPING.md](SHOPPING.md). Thermal: TTP cooler is customer-side;
[references/THERMAL.md](references/THERMAL.md).

## Carrier I/O the body needs

- CSI-2 (or GMSL deserializer) for the **body** camera
- MGBE copper/fiber to a **PoE switch** (switch is not on the SOM)
- NVMe
- TTP cooler per [references/THERMAL.md](references/THERMAL.md) (TDG-12271-001 v1.3 in tree)
- 7–20 V input that does not backfeed from PoE

Partner boards with 8× GMSL2 (e.g. Firefly EC-ThorT5000) are T5000-class
and GMSL-first. Only buy one if we abandon T4000 ceiling or need GMSL sats.

## Still need

- DG-12084-001 Design Guide
- AGX kit datasheet PDF
- P3834 STEP model (metal body fit)
