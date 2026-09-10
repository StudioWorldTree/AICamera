# Tasks

- [ ] Sidecar under `asr/` (or `sim/parakeet/`) using fractal1 `~/aicam/parakeet-cpu` INT8 weights
- [ ] Force CPU: `CUDA_VISIBLE_DEVICES=` and `providers=["CPUExecutionProvider"]`
- [ ] Keep process warm; second transcribe does not re-download / re-load encoder
- [ ] Sidecar is a Bun child on stdin/IPC — no TCP/UDP listener
- [ ] Smoke: `2086-149220-0033.wav`; nvidia-smi memory.used unchanged
