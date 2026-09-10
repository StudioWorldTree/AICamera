# Tasks

- [x] Record hybrid + HEVC-not-RAW on the bead
- [x] Write `docs/INTERCONNECT.md`
- [x] Delta `hardware-kit` interconnect requirements
- [ ] Require satellite-side H.265 encode for T4000 1+2 HQ bring-up and protect the two-session NVENC ceiling
- [ ] Specify PoE power versus Ethernet data roles, the external switch boundary, and PHY/uplink capacity criteria
- [ ] Add the independent-MGBE-lanes constraint; forbid treating QSFP as aggregated 100GbE
- [ ] Add a testable clock/metadata capability contract while leaving the exact product clock source open
- [ ] Add a record-first scenario in which AI decode/overlay can drop without interrupting HEVC plus sidecars
