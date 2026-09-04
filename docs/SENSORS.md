---
title: "Sensors"
kicker: "Glass + silicon"
group: "hardware"
summary: "Bring-up count is 1 body + 2 satellites at 4K30. Body is native CSI/GMSL. Sats are PoE H.265 with Cooke-class metadata, not P-iris stubs."
---

# Sensors and lenses

Activated with `aicam-sensor-lens`. Spec: `openspec/changes/add-sensor-lens-kit/`.
Count: **1 body + 2 satellites, 4K30**. 4-sat and 6-sat stay in the budget.

## Body (on the Thor box)

- Interface: **CSI-2 / GMSL / HSB** into Thor (native sensor)
- Resolution: 4K30 class, Bayer or YUV into ISP then NVENC
- Mount: bolted to the enclosure; electronically controlled iris/focus
- Lens data: **Cooke /i** (or LDS / XD / EF electronic) into Thor — see [LENS.md](LENS.md)
- AGX kit bring-up: USB or HSB camera is acceptable until a CSI module is picked; /i may wait on a PL reader

## Satellites

- Interface: **PoE** (at / 30 W class unless heated/PTZ)
- Payload: **H.265 4K30**, ONVIF or RTSP
- Lens: electronic iris and/or focus, and a **Cooke /i–class metadata
  stream** (barrel port + Ethernet bridge is fine). P-iris counts are
  not enough for a hero sat. Zoom is nice, not required for v1.
- Time: PTP if the camera has it
- Not GigE Vision RAW unless we later add one hero sat
- **Range:** 1D ToF (TFmini-S class, UART) on every sat → JSONL sidecar.
  One 3D lidar (Livox Mid-360S class, Ethernet) on the rig, not per
  eyeball. Needs the RV1126B module, not a sealed turret. See
  [CAMERAS.md](CAMERAS.md).

## Classes to shop (no SKU until datasheets)

| Role | Class | Why |
|---|---|---|
| Body | CSI/GMSL 4K + PL/LPL with /i (or EF electronic) | Native NVENC + SLAM + lens sidecar |
| Sat | Cine /i (or LDS/XD) glass on a PoE H.265 encoder, barrel /i → Ethernet | HEVC + /i + 100 m cable |
| Sat (stub) | Industrial 4K PoE turret, P-iris | Encode mule this week; crack the shell, not the product |
| Sat (module) | RV1126B core + our case + UART ToF + /i | What we ship |
| Rig lidar | One Ethernet 3D lidar on the switch | Point cloud; not per camera |

Do not buy six cinema bodies for bring-up.

## Still need

Datasheets for 1 body module + 2 PoE 4K cameras (`add-datasheet-pack`).
