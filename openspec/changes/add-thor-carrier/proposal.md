# add-thor-carrier

> **ACTIVE BUILD**

## Why

The lab brick and the production SOM are different envelopes, rails, and
NVENC counts. Buying the wrong one locks the carrier and the enclosure.

## What

- Lab: AGX Thor Developer Kit = T5000 module
- Production ceiling: T4000 SOM if HEVC hybrid still fits
- Capability: `hardware-kit`

## Impact

- Capabilities: ADDED carrier requirements
- ADRs: none

## User journey & surfaces

No new UI because this is the compute module and its carrier.

## Out of scope

- Sensor SKUs (`add-sensor-lens-kit`)
- Resin lid (`add-thor-enclosure`)
