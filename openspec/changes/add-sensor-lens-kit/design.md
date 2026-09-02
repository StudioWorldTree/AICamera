# Design — sensors and lenses

Body camera is a module Thor can CSI-capture (Bayer/YUV) so NVENC and
cuVSLAM see a native sensor. Electronically controlled iris/focus.

Satellites are **PoE H.265 cameras**, not GigE Vision RAW. Prefer
PTP, 4K30 Main10 if available, motorized iris/focus. PTZ optional.

Classes, not SKUs yet:

- Body: NVIDIA partner CSI/GMSL 4K module, or HSB camera on the AGX QSFP
- Sats: industrial 4K PoE box (ONVIF/RTSP) with P-iris or DC iris;
  broadcast B4 / EF cine with a motorized iris is a later spend
