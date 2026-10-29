# stage-bay

The live bay is fractal1-web, not this hardware notebook. In-flight
deltas: `openspec/changes/*/specs/stage-bay/`.

## Purpose

fractal1-web owns the EVF glass, the Tailscale loadout feed, and the
public tunnel. This notebook keeps the 3090 derate table in
`docs/3090-SIM.md` and does not render a bay.

## Requirements

### Requirement: Notebook does not host the bay
This repo SHALL NOT ship a Bay item in primary nav, a `/bay` route, a
committed Pages plate, or a `/bay-api` dev proxy.

#### Scenario: primary nav
- GIVEN the hardware notebook
- WHEN primary nav renders
- THEN there is no Bay item

#### Scenario: static build
- GIVEN a GitHub Pages build of this repo
- WHEN a visitor requests `/bay/`
- THEN the site does not prerender a bay glass

### Requirement: Live bay is fractal1-web
The glass, the feed unit, nginx, and the tunnel SHALL be owned by
`fractal1-web` (`duke/fractal1-web` on mimir, deployed at
`~/work/fractal1-web`). The feed SHALL serve `GET /loadout.json` on the
Tailscale address only and SHALL NOT bind `0.0.0.0`.

#### Scenario: where the live bay is
- GIVEN someone needs the live glass or its deploy
- WHEN they look in this repo
- THEN `AGENTS.md` and `docs/3090-SIM.md` § Bay glass point them at fractal1-web

### Requirement: Derates stay with the sim note
T4000 read factors (filters ×0.13, bandwidth ×0.30) SHALL live in
`docs/3090-SIM.md`. The loadout feed SHALL NOT be required to emit them.

#### Scenario: quoting a T4000 fps
- GIVEN a 3090 FACT fps
- WHEN a T4000 read is printed
- THEN the factor comes from `docs/3090-SIM.md`
