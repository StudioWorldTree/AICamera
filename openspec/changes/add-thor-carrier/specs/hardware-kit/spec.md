## ADDED Requirements

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
It SHALL NOT require T4000 SYS_VIN_SV (T5000-only). T4000 is the default
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
- THEN HV 7–20 V and MV 5 V are present and SYS_VIN_SV is absent

#### Scenario: T5000 escape
- GIVEN satellite count or encode demand that will not stay camera-side
  within the T4000 hybrid budget (1× NVENC, HQ 2× 4Kp30)
- WHEN the body module is chosen
- THEN T5000 may be used; otherwise the body stays T4000
