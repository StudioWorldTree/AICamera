## ADDED Requirements

### Requirement: Hybrid camera fabric
The camera body SHALL ingest the body camera over CSI-2 or GMSL on the
Thor module, and SHALL ingest satellite cameras over Power-over-Ethernet.

#### Scenario: bring-up plant
- GIVEN one body camera and two satellites
- WHEN the kit is powered
- THEN the body path is native CSI/GMSL into Thor and each satellite is a PoE endpoint

### Requirement: HEVC record path
The kit SHALL record 4K picture as H.265. RAW SHALL NOT be required on
the satellite or truck uplink. CSI RAW is permitted only as the body
sensor hop into Thor NVENC.

#### Scenario: bring-up bit rate
- GIVEN 1 body + 2 satellites at 4K30 HEVC
- WHEN streams are recorded
- THEN aggregate payload is on the order of 0.24 Gbps and fits in 5 GbE
