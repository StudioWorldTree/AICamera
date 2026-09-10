## ADDED Requirements

### Requirement: Bay is its own section
The hardware notebook SHALL expose brick state at `/bay`, a nav sibling
to Kit and Docs, not a mdsvex docs chapter.

#### Scenario: filmmaker opens Bay
- GIVEN the notebook
- WHEN they follow Bay in primary nav
- THEN they reach `/bay/` and the glass is the EVF, not a markdown article

### Requirement: Dark-locked glass
`/bay` SHALL render in its dark EVF palette regardless of the site light/dark toggle.

#### Scenario: site is in light theme
- GIVEN `data-theme=light` on the document
- WHEN `/bay` is shown
- THEN the bay surface stays dark (tungsten, tally, near-black)

### Requirement: Live on the tailnet, plate on Pages
Live metrics SHALL be fetched only from a same-origin vite proxy or a
Tailscale-bound HTTP feed. GitHub Pages SHALL display a committed last
plate. The feed SHALL NOT listen on `0.0.0.0`.

#### Scenario: Pages visitor
- GIVEN a public Pages build
- WHEN `/bay` loads
- THEN the glass shows the last plate, not a failed fetch to `100.x`

#### Scenario: vite on the tailnet
- GIVEN `npm run dev` and fractal1 reachable
- WHEN `/bay` loads
- THEN the glass updates from `/bay-api/loadout.json`

### Requirement: Swap split
The glass SHALL distinguish zram (compressed RAM) from the disk swapfile.
It SHALL NOT label zram as “swapping to disk.”

#### Scenario: idle brick
- GIVEN zram ~100 MB and swapfile ~7 MB
- WHEN the glass renders swap
- THEN disk paging is the swapfile number and zram is labeled as compressed RAM

### Requirement: Stack vs resident
The glass SHALL show the 3090 stack (SAM2-tiny, CLIP, FLUX.2 klein 4B)
as resident only when a live snapshot says so; otherwise on-disk / on the cart.

#### Scenario: idle after unload
- GIVEN no python CUDA process
- WHEN the mag rack renders
- THEN SAM2, CLIP, and klein read as on the cart, not loaded

### Requirement: HUD type
Bay titles SHALL use Space Age. HUD numerals SHALL use Tactic Extra
Extended Black.

#### Scenario: VRAM readout
- GIVEN a VRAM used figure
- WHEN it is painted
- THEN the digits are Tactic Extra Extended Black
