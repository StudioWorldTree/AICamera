# steer add-stage-bay

**When.** 2026-09-10
**Depth.** lean (decide-for-me / activate all)

## Decided

- Route: `/bay` (user | decide-for-me)
  Why: camera bay, not Grafana, not `/gpu`.
- Live vs plate: vite+Tailscale live, Pages last-plate (user | decide-for-me)
  Why: Pages is HTTPS; fractal1 is HTTP on 100.x; UPnP is on.
- Look: tungsten / tally / waveform, dark-locked (user | decide-for-me)
  Why: filmmaker first, a little sci-fi, not neon city.
- Type: Space Age + Tactic Extra Extended Black HUD digits (user | auto)
  Why: existing pairing rule.

## Skipped

- none

## Feeds change

Ship `/bay` as a nav sibling. JSON from 3090-loadout. Feed bound to
Tailscale IP:8745. Glass falls back to `last-plate.json`.
