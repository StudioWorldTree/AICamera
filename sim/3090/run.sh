#!/usr/bin/env bash
# fractal1: filters → SAM2-tiny → CLIP regions → FLUX.2 klein 4B
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -d .venv ]]; then
  uv venv --system-site-packages .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
uv pip install -q transformers diffusers accelerate huggingface_hub pillow protobuf sentencepiece
export PYTHONUNBUFFERED=1
export HF_HUB_DISABLE_TELEMETRY=1
export HF_HUB_DOWNLOAD_TIMEOUT=120
export HF_HUB_ETAG_TIMEOUT=60
exec python pipeline.py "$@"
