# Tasks

- [x] Record hybrid + HEVC-not-RAW on the bead
- [x] Write `docs/INTERCONNECT.md`
- [x] Delta `hardware-kit` interconnect requirements
- [x] Require satellite-side H.265 encode for T4000 1+2 HQ bring-up and protect the two-session NVENC ceiling
- [x] Specify PoE power versus Ethernet data roles, the external switch boundary, and PHY/uplink capacity criteria
- [x] Add the independent-MGBE-lanes constraint; forbid treating QSFP as aggregated 100GbE
- [x] Add a testable clock/metadata capability contract while leaving the exact product clock source open
- [x] Add a record-first scenario in which AI decode/overlay can drop without interrupting HEVC plus sidecars

- [x] Re-advise 2026-09-10 (fable): Thor-in-the-loop — sat H.265 remuxed by Thor to NAS; remux is record, not in the AI drop set
- [x] Re2-advise 2026-09-10 (fable, docs only, not gating): strike "or Thor remux" in `docs/STREAM-BUDGET.md:77` and "Sats = camera H.265" in `docs/INTERCONNECT.md` so the docs say Thor remux writes the sat master, matching the SHALL
