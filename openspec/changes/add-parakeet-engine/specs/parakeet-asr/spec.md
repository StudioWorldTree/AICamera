## ADDED Requirements

### Requirement: Warm CPU sidecar
The ASR engine SHALL keep Parakeet TDT 0.6B v3 INT8 loaded in a
long-lived process. A second transcribe of the same clip SHALL NOT
reload encoder weights. Inference SHALL use ONNX Runtime
`CPUExecutionProvider` only.

#### Scenario: two clips
- GIVEN the sidecar has already transcribed one wav
- WHEN a second wav is sent
- THEN wall time excludes model download and GPU memory.used is unchanged
