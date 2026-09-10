# add-stage-bay

> **ACTIVE BUILD**

## Why

The 3090 brick (fractal1) is the T4000-shaped lab stand-in. Its state —
VRAM, RAM, zram vs disk swap, stacked vs resident — lives in a CLI skill.
A filmmaker needs an EVF, not `nvidia-smi`. GitHub Pages cannot see
Tailscale, so the data plane has to be honest about live vs plate.

## What

- Capability **ADDED:** `stage-bay`
- Route `/bay` — nav sibling, not a docs chapter
- Live JSON from fractal1 on Tailscale only (`100.103.147.70:8745`)
- Pages and any HTTPS origin use a committed last plate
- Dark-locked glass; tungsten / tally / waveform, not neon
- Space Age titles, Tactic Extra Extended Black HUD digits
- 3090 FACT vs T4000-read as a second scale (`docs/3090-SIM.md`)

## Impact

- Capabilities: ADDED `stage-bay`
- ADRs: none (Pages-cannot-see-Tailscale is the same call as web3d-space `/gpu`)

## User journey & surfaces

A filmmaker opens `/bay` on the hardware notebook.

- **Working (vite dev, Mac on Tailscale):** glass polls `/bay-api/loadout.json` (proxy to fractal1). Tally lit if GPU util or a compute proc. Mag rack shows SAM2 / CLIP / klein resident vs on the cart.
- **Empty / idle brick:** compositor-only VRAM, stack on disk, disk-swap near zero. Still a cinematic plate, not a blank.
- **Failed / brick dark:** fetch timeout. Last plate with a “BRICK DARK” slate. No stack dump.
- **Off (GitHub Pages visitor):** last plate only. No attempt to tunnel `100.x`.

## Out of scope

- RunPod `/gpu` console (web3d-space)
- Qwen 9B on this box
- NFS (nfsd.ko missing until fractal1 reboot)
- Light theme on `/bay`
