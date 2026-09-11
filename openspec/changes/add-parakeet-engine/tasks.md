# Tasks

- [x] Sidecar under `asr/engine/` using fractal1 `~/aicam/parakeet-cpu` INT8 weights
- [x] Force CPU: `CUDA_VISIBLE_DEVICES=` and `providers=["CPUExecutionProvider"]`
- [x] Keep process warm; second transcribe does not re-download / re-load encoder
- [x] Sidecar is a Bun child on stdin/IPC — no TCP/UDP listener
- [ ] Smoke: `2086-149220-0033.wav`; nvidia-smi memory.used unchanged (fractal1, after deploy)
