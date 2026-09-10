# Design — sensors and lenses

Body camera is a module Thor can CSI-capture (Bayer/YUV) so NVENC and
cuVSLAM see a native sensor. Electronically controlled iris/focus.

Satellites are **PoE H.265 cameras**, not GigE Vision RAW. Prefer
PTP, 4K30 Main10 if available, motorized iris/focus. PTZ optional.

Classes, not SKUs yet:

- Body (production): enclosure-mounted CSI/GMSL 4K module into Thor
  NVENC. Electronically controlled iris/focus. Cooke /i (or LDS / XD /
  EF electronic) into Thor.
- Body (AGX bring-up fallback only): USB or HSB camera on the kit until
  a CSI module is picked. /i may wait on a PL reader. Not the product
  path.
- Sat (stub / encode mule): industrial 4K PoE turret, P-iris, ONVIF/RTSP.
  This week’s encode mule; crack the shell, not what we ship.
- Sat (shipped): RV1126B module + our case. PoE H.265 4K30. Barrel /i
  (or LDS/XD) → Ethernet sidecar. UART 1D ToF (TFmini-S class) on every
  sat, aligned to the same JSONL as picture. One Ethernet 3D lidar on
  the rig switch, not per camera.
