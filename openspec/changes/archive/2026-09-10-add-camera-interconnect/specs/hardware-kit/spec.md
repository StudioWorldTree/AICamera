## ADDED Requirements

### Requirement: Hybrid camera fabric
The camera body SHALL ingest the body camera over CSI-2 or GMSL on the
Thor module, and SHALL ingest satellite cameras over Power-over-Ethernet.
USB-C SHALL NOT be the satellite trunk.

#### Scenario: bring-up plant
- GIVEN one body camera and two satellites
- WHEN the kit is powered
- THEN the body path is native CSI/GMSL into Thor and each satellite is a PoE endpoint

### Requirement: HEVC record path
The kit SHALL record 4K picture as H.265. RAW SHALL NOT be required on
the satellite or truck uplink. CSI RAW is permitted only as the body
sensor hop into Thor NVENC. Satellite H.265 SHALL be written to the NAS
by Thor (remux, no re-encode) alongside the body master.

#### Scenario: bring-up bit rate
- GIVEN 1 body + 2 satellites at 4K30 HEVC
- WHEN streams are recorded
- THEN aggregate payload is on the order of 0.24 Gbps and fits in 5 GbE

### Requirement: Satellite-side encode for T4000 bring-up
On the T4000 production ceiling (1× NVENC, HQ 2× 4Kp30), each satellite
SHALL encode its own H.265. Thor NVENC SHALL own the body master only.
The kit SHALL NOT require Thor to HQ-encode the 1 body + 2 satellite
bring-up trio.

#### Scenario: T4000 HQ ceiling
- GIVEN T4000 HQ NVENC is 2× 4Kp30
- WHEN 1 body + 2 satellites record 4K30
- THEN the body is Thor NVENC and each satellite ships camera-side H.265

### Requirement: PoE power vs data boundary
PoE SHALL power satellites. The satellite Ethernet PHY SHALL carry H.265.
Thor SHALL NOT supply PoE. An external PoE switch is a kit item. PoE class
and switch uplink capacity SHALL be evaluated as separate criteria; PoE
does not name link bitrate.

#### Scenario: switch is in the kit
- GIVEN Thor has no PoE
- WHEN two satellites are on set
- THEN each sat is a PoE endpoint on an external switch, and that switch’s
  data uplink is sized for the HEVC payload plus overhead, not by PoE class

### Requirement: Independent MGBE lanes
QSFP/MGBE lanes on Thor SHALL be treated as independent controllers.
The kit SHALL NOT present QSFP28 as one aggregated 100GbE video trunk.

#### Scenario: QSFP is not 100G
- GIVEN QSFP28 is three (T4000) or four (T5000 / AGX kit) independent MGBE controllers (DS-11945-001 4.10.1)
- WHEN the truck uplink is planned
- THEN each lane is budgeted on its own; the plant is not a 100G pipe

### Requirement: Clock and sidecar alignment
Body hardware timing, satellite PTP, picture timecode, and Cooke /i–class
JSONL SHALL be reconcilable per frame. The exact product clock master MAY
remain unspecified.

#### Scenario: sidecar locks to picture
- GIVEN a take written to the NAS
- WHEN a HEVC file and its JSONL sidecar are opened
- THEN timecode on the sidecar matches picture; satellite PTP and body
  hardware clocks are named well enough to reconcile them

### Requirement: Record-first under AI drop
HEVC recording, the NVMe ring, satellite remux to storage, and metadata
sidecars SHALL continue when AI decode or overlay is dropped. Mode switch
drops AI, never record. Remux is record, not AI.

#### Scenario: thermal sag
- GIVEN 1 body + 2 satellites recording
- WHEN slice-1 AI is killed or thermal sag drops overlay/AD
- THEN body HEVC, sat remux to the NAS, and JSONL sidecars keep writing
