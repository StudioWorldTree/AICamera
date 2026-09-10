# Design — packer

Steered 2026-09-10. Living rules in `openspec/specs/cartridge-runtime/spec.md`.

`pack(desired, envelope_id) -> {resident, refused, evict, log}`

- Envelope default `3090` on fractal1. `t4000` is a second call (gauge).
- Always-on with null cost on the target envelope: `absent`, logged, pack legal.
- Slottable with null cost: refused, name the cart.
- Exclusive tag collision: refuse, name both.
- never-on-thor on 3090/t4000: refuse.
- Swap (`3090`): compare Σ(always-on seated) + max(slottable) to VRAM/host/NVENC ceilings.
- Resident (`t4000`, `6000`): sum unified + NVENC.
- Sag: `evict` is slottable AI in reverse-seat order; never encode/cuVSLAM.

Not a mode checker. DA-S + SAM2 + 9B is legal if it fits.

Reuse `sim/3090/check_catalog.py` as the kernel; `pack.py` is the CLI.
Extend `main()` with 4K-pair refusal and the 3090 swap-set scenario.
