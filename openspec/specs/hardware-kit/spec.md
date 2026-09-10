# hardware-kit

Living spec for the All Systems Go camera body. In-flight deltas:
`openspec/changes/*/specs/hardware-kit/`.

## Purpose

CAD and buys use envelopes and URLs from `docs/references/`, not folklore.

## Requirements

### Requirement: Datasheet manifest
Every steered SKU SHALL have a PDF or URL, fetch date, and mechanical
envelope listed under `docs/references/`.

#### Scenario: Thor SOM
- GIVEN DS-11945-001 v1.4 in `docs/references/`
- WHEN CAD or power work starts
- THEN envelopes come from [T4000.md](../../../docs/references/T4000.md), not memory

### Requirement: Cooke /i–class lens sidecar
Each camera, body and satellite, SHALL produce frame-accurate lens
metadata in Cooke /i (or ARRI LDS, ZEISS XD, or EF electronic mapped
into the same fields). Thor SHALL write it as a JSONL sidecar 1:1 with
that camera’s HEVC timecode. RAW lens maps (/i3 distortion, shading)
SHALL be files on the NAS keyed by lens identity, not per-frame blobs.

#### Scenario: body and two sats
- GIVEN three cameras recording
- WHEN a take is written to the NAS
- THEN each HEVC file has a sibling JSONL with at least make, serial,
  true focal length, T-stop, and focus distance locked to timecode

### Requirement: First-article enclosure
The first printable enclosure SHALL fit the AGX Thor Developer Kit
envelope and provide a body-camera mount plus TTP ventilation.

#### Scenario: Anycubic fit-check
- GIVEN the AGX kit dimensions 243.19 × 112.40 × 56.88 mm
- WHEN an STL is printed in resin
- THEN the kit seats, the body cam has a mount, and vents do not cover the TTP

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

### Requirement: Body-mounted camera
One camera SHALL be mounted to the Thor enclosure and ingested over
CSI-2 or GMSL into Thor NVENC. It SHALL be 4K30 class. HSB or USB on
the AGX kit is a bring-up fallback only and SHALL NOT be the production
body path.

#### Scenario: body record
- GIVEN the body camera is mounted and powered on the production enclosure
- WHEN capture starts
- THEN Thor encodes H.265 from that CSI/GMSL sensor without a PoE hop
  and without using HSB/USB as the ingest

### Requirement: PoE satellites
Bring-up SHALL include two satellite cameras on PoE that emit H.265 at
4K30. The shipped satellite class SHALL support electronic iris and/or
focus, a Cooke /i–class metadata path (barrel port to Ethernet), and a
UART 1D ToF sensor whose range is written into the same JSONL sidecar
as picture. A sealed P-iris turret MAY be an encode mule for bring-up
and SHALL NOT be the shipped satellite class.

#### Scenario: satellite record
- GIVEN two PoE satellites of the shipped class and a PoE switch
- WHEN capture starts
- THEN each satellite delivers camera-side H.265 that Thor remuxes to
  the NAS, plus Cooke-class lens metadata and 1D ToF in the sidecar,
  without a RAW Ethernet payload

### Requirement: Lab brick
Bring-up SHALL use the NVIDIA Jetson AGX Thor Developer Kit (T5000 module).

#### Scenario: first power-on
- GIVEN no custom carrier yet
- WHEN the lab kit is used
- THEN I/O is the kit’s 5GbE, QSFP28 (independent MGBE lanes), USB-C, and HSB/USB cameras

### Requirement: Production ceiling
Production body design SHALL fit the T4000 SOM: 87 × 100 × 15.29 mm,
699-pin B2B, default 70 W, throttle at 90 W TMP, 1× NVENC, 3× 25GbE,
no CAN. The carrier SHALL supply SYS_VIN_HV 7–20 V and SYS_VIN_MV 5 V.
It SHALL NOT require SYS_VIN_SV (a T5000-only rail). T4000 is the default
production module. T5000 is permitted only when the required satellite
encode load cannot remain camera-side or otherwise exceeds the validated
T4000 hybrid budget.

#### Scenario: drop to T4000
- GIVEN hybrid HEVC satellites
- WHEN the body is a T4000 SOM
- THEN Thor encodes the body camera only and satellites remain camera-side H.265

#### Scenario: rails
- GIVEN a production carrier for T4000
- WHEN the SOM is seated
- THEN HV 7–20 V and MV 5 V are present and SYS_VIN_SV is absent at the module

#### Scenario: T5000 escape
- GIVEN satellite count or encode demand that will not stay camera-side
  within the T4000 hybrid budget (1× NVENC, HQ 2× 4Kp30)
- WHEN the body module is chosen
- THEN T5000 may be used; otherwise the body stays T4000

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
