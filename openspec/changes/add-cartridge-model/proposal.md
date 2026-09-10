# add-cartridge-model

> **PENDING**

## Why

Named modes already pick one extra and unload the rest. The operator
wants to slot models and plugins like game carts. Without a catalog of
costs and shelves, a packer cannot refuse an illegal seat, and `/bay`
cannot draw the board.

## What

- ADD capability `cartridge-runtime`
- Catalog JSON: id, kind (model|plugin), shelf, costs per box, exclusive tags
- Named modes are preset arrays of cartridge ids
- Envelope id parameterizes the pack target (live brick vs T4000 second scale)
- Names from web3d-space MODELS.md / MODES.md; 3090 FACT costs from this repo

## Impact

- Capabilities: ADDED `cartridge-runtime`
- ADRs: none yet (shape is a catalog + later packer; ARCHITECTURE.md still empty)

## User journey & surfaces

No new UI because the slot board is `add-cartridge-glass` on `/bay`. This
change is the catalog contract the packer and glass will read. A filmmaker
on `/bay` later seats a cart; bounce is `add-cartridge-pack`.

## Out of scope

- Binpacker algorithm (`add-cartridge-pack`)
- 3090 loader (`add-3090-cartridge-load`)
- Slot-board glass (`add-cartridge-glass`)
- Qwen3.5-9B install on fractal1
- Forking product ground out of web3d-space MODELS.md / MODES.md
