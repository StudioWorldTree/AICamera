## ADDED Requirements

### Requirement: Split power tree
Thor module power and satellite PoE SHALL be separate supplies. PoE SHALL
NOT backfeed the AGX kit or SOM.

#### Scenario: sag
- GIVEN thermal or power headroom is gone
- WHEN the kit must shed load
- THEN AI (MIG slice 1) is dropped and record (slice 0) continues

### Requirement: T4000 thermal ceiling
A T4000 body SHALL be designed for 70 W default and 90 W TMP, TTP ≤ 75 °C.

#### Scenario: enclosure
- GIVEN a resin lid over the SOM or AGX kit
- WHEN the GPU is at default power
- THEN the TTP is vented or heat-sunk; resin is not the thermal path
