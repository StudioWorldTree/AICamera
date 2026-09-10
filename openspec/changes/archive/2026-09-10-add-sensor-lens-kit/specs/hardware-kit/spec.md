## ADDED Requirements

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
