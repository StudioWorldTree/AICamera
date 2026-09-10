# Design: stage-bay

## Data plane

GitHub Pages is HTTPS. Fractal1 JSON is HTTP on Tailscale. Mixed content
blocks live fetch from Pages. Same call as web3d-space `/gpu`: live in
`vite dev` via proxy; Pages ships a last plate.

Bind the feed to `100.103.147.70:8745` only. UPnP is on; never `0.0.0.0`.

JSON is the 3090-loadout snapshot: host, gpu, ram, swap (zram vs
swapfile), procs, stack catalog with `resident`. Derate constants stay
in `docs/3090-SIM.md` — the glass cites them, it does not own them.

## Glass

`/bay` is a SvelteKit section. Site light/dark toggle does not recolor
it. Look is an EVF: tungsten, tally, waveform. Titles in Space Age.
HUD numerals in Tactic Extra Extended Black.
