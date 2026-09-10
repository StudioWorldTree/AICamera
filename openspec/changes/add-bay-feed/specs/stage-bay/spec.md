## ADDED Requirements

### Requirement: Tailscale-only loadout feed
Fractal1 SHALL serve `GET /loadout.json` on `100.103.147.70:8745` and
SHALL NOT bind that port on `0.0.0.0`. The body SHALL include gpu, ram,
swap (zram vs swapfile), procs, and stack with resident flags.

#### Scenario: GET from the Mac
- GIVEN the unit is active and Tailscale is up
- WHEN `curl -sf --max-time 3 http://100.103.147.70:8745/loadout.json`
- THEN the response is JSON with `gpu.vram_used_mib` and `swap.disk_used_mb`
