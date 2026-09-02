# Interconnect

Activated with `aicam-interconnect`. Spec delta: `openspec/changes/add-camera-interconnect/`.

## Plant

```
[body cam] --CSI/GMSL--> Thor ISP --> NVENC H.265 --> NVMe ring --> 5/10/25GbE --> NAS
[body /i ] --PL pins or barrel--> UART/USB on Thor ----------------+--> JSONL sidecar
[sat 1]    --PoE H.265--> PoE switch --\                            |
[sat 1 /i] --/i port--> Lockit+ or ONVIF meta --> switch --\        |
[sat 2]    --PoE H.265--> PoE switch ---+--> Thor remux / NVDEC ----+--> NAS
                                         PoE switch is a kit item (Thor has no PoE)
```

Lens metadata is a second stream, 1:1 with picture, not inside the HEVC.
See [LENS.md](LENS.md).

## Decisions

| Fork | Call |
|---|---|
| Fabric | Hybrid: body on CSI/GMSL, satellites on PoE |
| Record | **H.265**. RAW is CSI-into-SoC only |
| Uplink | HEVC bring-up fits **5GbE**. 10/25GbE is NAS/headroom |
| QSFP28 | Independent MGBE lanes, not aggregated 100G |
| USB-C | Not the satellite trunk (short, shared, no PoE) |
| Encode split | Body = Thor NVENC. Sats = camera H.265 (T4000 HQ is 2× 4Kp30) |
| Time | PTP on sats; GMSL/HW on body. SMPTE genlock unproven |
| Lens | Cooke /i class from **every** camera, sidecar JSONL |

## Why HEVC

DS-11945-001 v1.4: T4000 1× NVENC, HEVC HQ 2× 4Kp30 / 1× 4Kp60. Hardware
encode exists. One 4K30 HEVC is ~80 Mbps; three is ~0.24 Gbps. Gigabit
PoE + 5GbE is the plant. Uncompressed 4K30 10-bit 4:2:2 is ~5 Gbps and
is not the satellite budget.

## Still open

- Exact PoE switch SKU (at vs bt)
- PTP vs camera TC vs slate clock (product, not model)
- Hero uncompressed sat — exception, not v1
