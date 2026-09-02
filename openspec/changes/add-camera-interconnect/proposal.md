# add-camera-interconnect

> **ACTIVE BUILD**

## Why

Pixels, power, and clocks have to move between a Thor-mounted body camera,
PoE satellites, and the NAS. The wrong fabric buys the wrong cameras.

## What

- Hybrid fabric: body CSI/GMSL on the Thor box; satellites PoE carrying H.265
- Record path is HEVC, not RAW over the wire
- Truck uplink: 5GbE is enough for bring-up HEVC; MGBE lanes stay independent
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
