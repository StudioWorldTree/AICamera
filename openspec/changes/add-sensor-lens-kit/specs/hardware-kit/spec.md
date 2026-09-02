## ADDED Requirements

### Requirement: Body-mounted camera
One camera SHALL be mounted to the Thor enclosure and ingested over
CSI-2, GMSL, or HSB. It SHALL be 4K30 class and SHALL feed Thor NVENC.

#### Scenario: body record
- GIVEN the body camera is mounted and powered
- WHEN capture starts
- THEN Thor encodes H.265 from that sensor without a PoE hop

### Requirement: PoE satellites
Bring-up SHALL include two satellite cameras on PoE that emit H.265 at
4K30. Lenses SHALL support electronic iris and/or focus.

#### Scenario: satellite record
- GIVEN two PoE satellites and a PoE switch
- WHEN capture starts
- THEN each satellite delivers an H.265 stream Thor can remux or NVDEC
  without a RAW Ethernet payload
