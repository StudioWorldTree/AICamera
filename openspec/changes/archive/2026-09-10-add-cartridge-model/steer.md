# steer add-cartridge-model

**When.** 2026-09-10
**Depth.** standard

## Decided
- cartridge vs mode: named modes are factory presets (a bag of carts). Operator may unslot/slot from a preset. (user)
- exclusive vs knapsack: knapsack on measured costs; exclusive tags only for physics already decided (klein↔27B, SAM2↔Maxine at 4K). (user)
- envelope: seat/bounce is the live brick; T4000 is a second scale, not a seated lie. (user)
- glass home: control row of `/bay` — recorded on aicam-cart.4, not this node. (user)

## Skipped
- none

## Auto
- capability ADD `cartridge-runtime` in this repo; MODELS.md not forked
- kind: model | plugin
- always-on encode+SLAM reserved
- drop AI, never record

## Feeds change
Catalog of cartridges with per-box costs and exclusive tags. Modes are preset arrays. Pack target is an envelope id. This change does not implement the packer or the slot board.
