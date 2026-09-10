# add-sensor-lens-kit

> **ACTIVE BUILD**

## Why

One camera is bolted to the Thor box; two more cover the set. Lenses
must be electronically controlled. The fabric (HEVC PoE + CSI body)
picks the camera family.

## What

- Body: CSI/GMSL 4K30+ into Thor, mount on the box
- Satellites: PoE+, 4K30 H.265, electronic iris/focus (zoom if we get it)
- Bring-up count 1+2; table 4 and 6
- Capability: `hardware-kit`

## Impact

- Capabilities: ADDED sensor/lens requirements
- ADRs: none

## User journey & surfaces

No new UI because this is the optical kit. Operator mounts, focuses,
records.

## Out of scope

- Exact retail SKUs until datasheets land (`add-datasheet-pack`)
- Motion-control VLA (`OpenPi`) unless the head is actuated
