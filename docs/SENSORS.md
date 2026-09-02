# Sensors and lenses

Activated with `aicam-sensor-lens`. Spec: `openspec/changes/add-sensor-lens-kit/`.
Count: **1 body + 2 satellites, 4K30**. 4-sat and 6-sat stay in the budget.

## Body (on the Thor box)

- Interface: **CSI-2 / GMSL / HSB** into Thor (native sensor)
- Resolution: 4K30 class, Bayer or YUV into ISP then NVENC
- Mount: bolted to the enclosure; electronically controlled iris/focus
- AGX kit bring-up: USB or HSB camera is acceptable until a CSI module is picked

## Satellites

- Interface: **PoE** (at / 30 W class unless heated/PTZ)
- Payload: **H.265 4K30**, ONVIF or RTSP
- Lens: electronic iris and/or focus. Zoom is nice, not required for v1
- Time: PTP if the camera has it
- Not GigE Vision RAW unless we later add one hero sat

## Classes to shop (no SKU until datasheets)

| Role | Class | Why |
|---|---|---|
| Body | CSI/GMSL 4K module from a Jetson partner, or HSB CoE camera | Native NVENC + SLAM |
| Sat | Industrial 4K PoE box, P-iris or motorized focus | HEVC + PoE + 100 m cable |
| Sat (later) | Cine EF / B4 with servo iris on a PoE encoder | Glass quality, more money |

Do not buy six cinema bodies for bring-up.

## Still need

Datasheets for 1 body module + 2 PoE 4K cameras (`add-datasheet-pack`).
