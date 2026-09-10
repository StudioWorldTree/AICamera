## ADDED Requirements

### Requirement: Bay glass reads as an EVF
`/bay` SHALL present VRAM, power, RAM, zram vs disk swap, and the model
mag rack in a dark EVF chrome (tungsten, tally, waveform). It SHALL NOT
use the docs paper-grid as the primary surface.

#### Scenario: idle brick plate
- GIVEN last plate or live idle snapshot
- WHEN `/bay` renders
- THEN VRAM readout, waveform fill, and mag rack are visible on a dark field
