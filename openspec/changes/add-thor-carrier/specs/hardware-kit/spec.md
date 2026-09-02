## ADDED Requirements

### Requirement: Lab brick
Bring-up SHALL use the NVIDIA Jetson AGX Thor Developer Kit (T5000 module).

#### Scenario: first power-on
- GIVEN no custom carrier yet
- WHEN the lab kit is used
- THEN I/O is the kit’s 5GbE, QSFP28 (independent MGBE lanes), USB-C, and HSB/USB cameras

### Requirement: Production ceiling
Production body design SHALL fit the T4000 SOM envelope and power: 87 × 100 × 15.29 mm, default 70 W, throttle at 90 W TMP, 1× NVENC, 3× 25GbE, no CAN.

#### Scenario: drop to T4000
- GIVEN hybrid HEVC satellites
- WHEN the body is a T4000 SOM
- THEN Thor encodes the body camera only and satellites remain camera-side H.265
