# Lens metadata — Cooke /i class

Every camera, body and satellite, emits frame-accurate lens data next
to picture. Interchange is **Cooke /i** (and /i3 shading/distortion
maps). ARRI LDS and ZEISS eXtended Data are cousins; we normalize to one
sidecar.

Product ground already says the record path carries “lens” in the
sidecar (`web3d-space` MODES.md). This file says **what** that is.

## What /i actually is

Cooke /i Technology: electronics in the lens, absolute encoders, no
init dance. Pins in the PL mount (12 o’clock) and/or an external /i
port on the barrel. License to speak it is €1/year for manufacturers.

Per frame, up to 285 fps:

| Field | Why we want it |
|---|---|
| Manufacturer, type, serial | Continuity, which glass |
| Focal length (true, not the barrel number) | Intrinsics, matchmove |
| Focus distance | DoF, VFX, AD notes |
| T-stop | Exposure, DoF |
| Zoom position / normalized zoom | Zooms |
| Near / far focus, hyperfocal | Scripty / AD |
| Horizontal FOV | Coverage / splat-readiness |
| Entrance pupil | Nodal / virtual camera |
| /i3 shading + distortion maps | Post; **not** every frame — file once per lens+setting |

Metric or imperial, camera’s choice; we store SI in the sidecar.

## Transport (each camera)

Picture is HEVC. Lens data is a **second stream**, 1:1 with encoder
timecode, same as pose. It is not in the 80 Mbps HEVC budget.

```
lens /i pins or /i port
        │
        ├─ body: PL contacts or barrel port → UART/USB on Thor
        │
        └─ sat:  barrel port → /i-to-Ethernet bridge (e.g. Ambient Lockit+
                 TCP 3001 YAML or 3002 raw /i3)
                 OR camera embeds /i in SDI VANC / ONVIF metadata
                          │
                          ▼
              Thor writes JSONL sidecar next to the HEVC
              {camera_id, tcode, ...fields}
```

Do not rely on the scripty typing T-stop. If a camera cannot speak /i,
LDS, XD, or EF electronic iris+focus, it is a **bring-up stub**, not a
hero sat.

## Shopping implication

Cheap PoE boxes with P-iris counts are not /i. Satellites that must
send Cooke-class data need cine glass (/i, LDS, or XD) plus a reader,
or a cinema camera that already muxes /i into its files.

Body: PL or LPL with /i+LDS pins, or EF with electronic metadata as a
fallback (focal + iris + focus, no entrance pupil).

## Sidecar (record)

One JSONL line per sample, timecode-locked to that camera’s HEVC:

```json
{"cam":"A","tc":"01:02:03:04","make":"Cooke","model":"S7/i 32","sn":"…",
 "fl_mm":31.7,"focus_m":2.13,"t":2.8,"zoom_n":null,
 "near_m":1.9,"far_m":2.4,"hyper_m":12.1,"hfov_deg":39.4,"ep_mm":87.0}
```

Maps (/i3 distortion, shading) live as files on the NAS keyed by
`make/model/sn`, referenced from the sidecar, not dumped per frame.

## Still open

- Reader hardware on the Thor carrier (PL contacts vs barrel-only)
- Lockit+ vs in-camera /i vs EF for bring-up
- Whether we store /i3 maps at slate time or from a lens library
