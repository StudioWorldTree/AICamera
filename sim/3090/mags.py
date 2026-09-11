"""Allowlisted HF mag pull/eject. Stdlib + huggingface-cli/hf. Fractal1 only."""
from __future__ import annotations

import shutil
import subprocess
import threading
from pathlib import Path

HUB = Path.home() / ".cache/huggingface/hub"

# id -> huggingface repo
HUB_REPO = {
    "sam2-tiny": "facebook/sam2.1-hiera-tiny",
    "clip": "openai/clip-vit-base-patch32",
    "klein-4b": "black-forest-labs/FLUX.2-klein-4B",
}

PULLING: set[str] = set()
_LOCK = threading.Lock()


def hub_dir(mid: str) -> Path | None:
    repo = HUB_REPO.get(mid)
    if not repo:
        return None
    return HUB / f"models--{repo.replace('/', '--')}"


def pulling() -> list[str]:
    with _LOCK:
        return sorted(PULLING)


def start_pull(mid: str) -> tuple[int, dict]:
    if mid not in HUB_REPO:
        return 400, {"ok": False, "error": "not a downloadable mag"}
    with _LOCK:
        if mid in PULLING:
            return 202, {"ok": True, "status": "pulling", "id": mid}
        PULLING.add(mid)
    threading.Thread(target=_pull, args=(mid,), daemon=True).start()
    return 202, {"ok": True, "status": "pulling", "id": mid}


def _pull(mid: str) -> None:
    repo = HUB_REPO[mid]
    try:
        cmd = _hf_cmd() + ["download", repo]
        subprocess.run(cmd, check=False, timeout=3600)
    except (subprocess.TimeoutExpired, FileNotFoundError, OSError):
        pass
    finally:
        with _LOCK:
            PULLING.discard(mid)


def _hf_cmd() -> list[str]:
    for bin in ("hf", "huggingface-cli"):
        if shutil.which(bin):
            return [bin]
    return ["huggingface-cli"]


def eject(mid: str, resident: bool) -> tuple[int, dict]:
    if mid not in HUB_REPO:
        return 400, {"ok": False, "error": "not a disk mag"}
    if resident:
        return 409, {"ok": False, "error": "in the gate — unload first"}
    dest = hub_dir(mid)
    if dest is None or not dest.exists():
        return 404, {"ok": False, "error": "not on disk"}
    shutil.rmtree(dest, ignore_errors=False)
    return 200, {"ok": True, "status": "ejected", "id": mid}
