# add-bay-feed

> **ACTIVE BUILD**

## Why

`/bay` needs a JSON snapshot of fractal1 without SSHing. The 3090-loadout
script already knows the facts. Bind like SMB: Tailscale IP only.

## What

- `sim/3090/snapshot.py` emits the contracted JSON on the box
- `sim/3090/serve.py` serves `GET /loadout.json` on `100.103.147.70:8745`
- systemd unit `aicam-bay-feed`
- Last plate copied into `src/lib/bay/last-plate.json`
- Capability: `stage-bay`

## Impact

- Capabilities: MODIFIED `stage-bay` (feed)
- ADRs: none

## User journey & surfaces

Vite `/bay-api/loadout.json` proxies to the feed. Pages never calls it.

## Out of scope

- TLS / Tailscale serve HTTPS
- Binding 0.0.0.0
