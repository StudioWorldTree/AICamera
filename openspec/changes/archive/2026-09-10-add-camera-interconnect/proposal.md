# add-camera-interconnect

> **ACTIVE BUILD**

## Why

Pixels, power, and clocks have to move between a Thor-mounted body camera,
PoE satellites, and the NAS. The wrong fabric buys the wrong cameras.

## What

- Hybrid fabric: body CSI/GMSL on the Thor box; satellites PoE carrying H.265
- Record path is HEVC, not RAW over the wire
- T4000 1+2: satellite-side H.265; Thor NVENC owns the body only
- PoE powers sats; an external switch is a kit item; PoE class ≠ link bitrate
- QSFP/MGBE lanes stay independent (not aggregated 100GbE)
- Record-first: drop AI, never record
- Capability: `hardware-kit`

## Impact

- Capabilities: ADDED `hardware-kit` interconnect
- ADRs: none yet; ARCHITECTURE.md still empty

## User journey & surfaces

No new UI because this is cabling and encode placement. The operator mounts
cameras, plugs PoE, and records to the NAS.

## Out of scope

- Camera SKUs (`add-sensor-lens-kit`)
- Carrier pinout (`add-thor-carrier`)
- Enclosure (`add-thor-enclosure`)
