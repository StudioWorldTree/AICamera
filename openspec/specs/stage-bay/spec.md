# stage-bay

Living spec for the hardware notebook bay: fractal1 brick state as a
Tailscale-only JSON feed. In-flight deltas: `openspec/changes/*/specs/stage-bay/`.

## Purpose

`/bay` needs a JSON snapshot of fractal1 without SSHing. Bind like SMB:
Tailscale IP only. GitHub Pages never calls the feed.

## Requirements

### Requirement: Tailscale-only loadout feed
Fractal1 SHALL serve `GET /loadout.json` on `100.103.147.70:8745` and
SHALL NOT bind that port on `0.0.0.0`. The body SHALL include gpu, ram,
swap (zram vs swapfile), procs, and stack with resident flags.

#### Scenario: GET from the Mac
- GIVEN the unit is active and Tailscale is up
- WHEN `curl -sf --max-time 3 http://100.103.147.70:8745/loadout.json`
- THEN the response is JSON with `gpu.vram_used_mib` and `swap.disk_used_mb`

### Requirement: Bay glass reads as an EVF
`/bay` SHALL present VRAM, power, RAM, zram vs disk swap, and the model
mag rack in a dark EVF chrome (tungsten, tally, waveform). It SHALL NOT
use the docs paper-grid as the primary surface.

#### Scenario: idle brick plate
- GIVEN last plate or live idle snapshot
- WHEN `/bay` renders
- THEN VRAM readout, waveform fill, and mag rack are visible on a dark field
