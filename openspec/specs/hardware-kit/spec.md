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
