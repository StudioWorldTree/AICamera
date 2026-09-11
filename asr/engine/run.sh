#!/usr/bin/env bash
# fractal1 CPU Parakeet sidecar. JSONL stdin/stdout. No listener.
set -euo pipefail
cd "$(dirname "$0")"
export CUDA_VISIBLE_DEVICES=
export PYTHONUNBUFFERED=1
export PARAKEET_WEIGHTS="${PARAKEET_WEIGHTS:-$HOME/aicam/parakeet-cpu}"
if [[ ! -d .venv ]]; then
  uv venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
uv pip install -q -r requirements.txt
exec python sidecar.py "$@"
