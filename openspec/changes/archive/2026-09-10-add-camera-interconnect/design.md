# Design — interconnect

Steered 2026-09-01 (AUTO hybrid + USER HEVC-not-RAW).

```
[body] CSI/GMSL → Thor ISP → NVENC HEVC → NVMe → 5/10/25GbE → NAS
[sat]  PoE H.265 → switch → Thor NVDEC (AI) / remux → NAS
```

Thor has no PoE. A switch is a kit item. QSFP28 on the AGX kit is four
independent MGBE controllers, not aggregated 100GbE (DS-11945-001 4.10.1).

T4000 HQ NVENC is 2× 4Kp30. Bring-up 1+2 needs satellite-side encode.
PTP on sats; do not claim SMPTE genlock until measured.
