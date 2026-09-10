# Tasks

- [x] JSON contract in `stage-bay` spec
- [x] Last plate committed at `src/lib/bay/last-plate.json`
- [x] `/bay` route prerenders
- [ ] Advise reader (other family) on this architecture change

## Pinned by advise 2026-09-10 (reader agt-fable-5-1-arch-review)

- [ ] Derates: one owner. `snapshot.py` stops emitting `t4000_read` literals; page reads them from `docs/3090-SIM.md` frontmatter (or the doc becomes the snapshot's input). Reconcile 0.29 vs 0.30 in the doc.
- [ ] Three feed states on the slate: `LIVE`, `BRICK DARK` (DEV, fetch failed), `PLATE <date>` (Pages, never tried). Journey promises BRICK DARK; code has two states.
- [ ] Residency granularity: either the glass says "AI process on tube" or `pipeline.py` writes a per-model manifest the snapshot reads. Today any AI python lights all three mags.
- [ ] `cap 420` → `power.limit` from the same `nvidia-smi` query. Doc says 350 W.
- [ ] Plate refresh is one command (`ssh fractal1 python3 ~/aicam/snapshot.py > src/lib/bay/last-plate.json`), written in `docs/3090-SIM.md` or `package.json`.
- [ ] Tailscale IP once: MagicDNS `fractal1` in the vite proxy, `tailscale ip -4` at serve start, or a single shared constant.
- [ ] Fold target: create `openspec/specs/stage-bay/` on fold; `hardware-kit` is the only living spec dir today.
- [ ] Font licensing: confirm web-embed rights for Tactic Sans and Space Age before Pages is public; add a LICENSE note beside `static/fonts/`.
- [ ] Layout lock: `pathname.startsWith(base + '/bay')` instead of `includes('/bay')`.
- [ ] Write down that live is `vite dev` only (`import.meta.env.DEV` gate); a tailnet-served static build stays on plate.
