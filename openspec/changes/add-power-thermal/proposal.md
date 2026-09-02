# add-power-thermal

> **ACTIVE BUILD**

## Why

Thor, PoE satellites, and a resin lid fight the same watts and the same
sun. If power sags, drop AI, never record.

## What

- T4000 70 W default / 90 W TMP; AGX kit 40–130 W
- PoE+ budget for two sats
- Separate PSUs; no PoE backfeed into the kit
- Capability: `hardware-kit`

## Impact

- Capabilities: ADDED power/thermal
- ADRs: none

## User journey & surfaces

No new UI because this is the power tree and heat.

## Out of scope

- Measured thermal on the real kit (needs TDG-12271-001 + a print)
