---
name: 3090-loadout
description: Snapshot the fractal1 RTX 3090 AI stack — what is resident in VRAM and RAM, what is only on disk (SAM2-tiny, CLIP, FLUX.2 klein 4B), and how much swap is zram vs the disk swapfile. Use when the user asks what's loaded, the loadout, VRAM per model, swapping to disk, stacked on the 3090, fractal1 memory, or runs /3090-loadout.
---

# 3090 loadout

Host: `ssh fractal1` (user `dorje`). 16 GB RAM, 24 GB VRAM, 7.7 GB zram + 16 GB swapfile.

Run the script first. Do not guess resident memory from the last chat.

```
bash .grok/skills/3090-loadout/scripts/loadout.sh
```

(`FRACTAL1_HOST` overrides the SSH alias.)

## How to read it

- **Resident** = a row in `nvidia-smi` processes, or a live `python`/`pipeline.py` RSS. If neither, it is **not loaded**.
- **zram_used** = compressed RAM. Not disk. 16 GB host will spill here before the swapfile.
- **disk_swapfile_used** = actual disk paging (`/swap/swapfile`, prio -1). This is the number they mean by "swapping to disk."
- `VmSwap` per process includes zram. Only treat it as disk if `disk_swapfile_used_mb` is also up.

16 GB host cannot co-reside klein + SAM2 + CLIP. The harness (`sim/3090/pipeline.py`) loads one stage, then unloads.

## Disk catalog (weights)

Live sizes come from the script. Expected complete weights:

| Stack piece | Disk | Peak VRAM when run (FACT 2026-09-09) | Co-resident? |
|---|---|---|---|
| CUDA look-dev filters | torch (system) | ~0.7 GB | cheap |
| SAM2.1 Hiera-tiny | ~149 MB | **2.0–3.0 GB**, ~400 W | unload before klein |
| CLIP ViT-B/32 | HF snapshot ~2.3 GB | ~1.8–2.4 GB | unload before klein |
| FLUX.2 klein 4B | **~16.0 GB weights** (text enc 8.05 + transformer 7.75 + VAE 0.17). Cache may be larger (`.incomplete` junk) | cpu_offload; wall ~43 s t2i / 36 s i2i at 768² | snap profile; unloads the rest |
| Qwen3.5-9B | not installed | — | AD profile; not this box yet |
| compositor | — | niri ~98 MB + ghostty ~153 MB | always |

Peaks and T4000 derates live in `docs/3090-SIM.md` (one home). Quote them from there, not from memory.

## Report shape

Lead with **now** (resident VRAM, RAM avail, disk-swap MB), then **on disk**, then **junk** (incomplete HF blobs). If disk_swapfile_used is tens of MB and zram is the rest, say we are **not** swapping to disk. If klein is loading and disk_swapfile_used climbs, that is the 16 GB host hitting the swapfile.

Idle box is normal: GPU ~320 MB compositor, no python, disk swap a few MB leftover from yesterday's klein offload.
