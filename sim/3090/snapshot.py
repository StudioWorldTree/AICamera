#!/usr/bin/env python3
"""JSON loadout for /bay. Run on fractal1. Stdlib only."""
from __future__ import annotations

import json
import os
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

HUB = Path.home() / ".cache/huggingface/hub"
KLEIN_BLOBS = {
    "text_enc_1": ("8c0506e7f4936fa7e26183a4fd8da4e2bdbc5990ba64ae441f965d51228f36ea", 4967215360),
    "text_enc_2": ("82f2bd839378541b0557bfabaf37c7d3d637071fdcb73302dedd7cf61162ce07", 3077766632),
    "transformer": ("9f29f9edcfdae452a653ffb51a534ca4decd389952c225724ff3b94042612a6e", 7751109744),
    "vae": ("ca70d2202afe6415bdbcb8793ba8cd99fd159cfe6192381504d6c4d3036e0f04", 168120878),
}


def _sh(cmd: list[str]) -> str:
    try:
        return subprocess.check_output(cmd, text=True, stderr=subprocess.DEVNULL).strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return ""


def _meminfo() -> dict[str, int]:
    out: dict[str, int] = {}
    for line in Path("/proc/meminfo").read_text().splitlines():
        k, _, rest = line.partition(":")
        num = rest.strip().split()[0]
        try:
            out[k] = int(num)
        except ValueError:
            pass
    return out


def _kb_gb(n: int) -> float:
    return round(n / 1048576, 2)


def dir_sizes(p: Path) -> tuple[float, float]:
    if not p.is_dir():
        return 0.0, 0.0
    total = 0
    inc = 0
    for dp, _, fs in os.walk(p):
        for f in fs:
            fp = Path(dp) / f
            try:
                sz = fp.stat().st_size
            except OSError:
                continue
            total += sz
            if "incomplete" in f:
                inc += sz
    return round(total / 1e9, 2), round(inc / 1e9, 2)


def gpu() -> dict:
    q = _sh(
        [
            "nvidia-smi",
            "--query-gpu=name,memory.used,memory.total,utilization.gpu,power.draw,power.limit,persistence_mode",
            "--format=csv,noheader,nounits",
        ]
    )
    parts = [x.strip() for x in q.split(",")]
    if len(parts) < 7:
        parts = ["", "0", "0", "0", "0", "0", "Disabled"]
    name, used, total, util, power, limit, pers = parts[:7]
    procs: list[dict] = []
    smi = _sh(["nvidia-smi"])
    grab = False
    for line in smi.splitlines():
        if "Processes:" in line:
            grab = True
            continue
        if not grab:
            continue
        m = re.search(
            r"\|\s+\d+\s+\S+\s+\S+\s+(\d+)\s+([A-Z])\s+(\S.*?)\s+(\d+)MiB",
            line,
        )
        if m:
            procs.append(
                {
                    "pid": int(m.group(1)),
                    "kind": m.group(2),
                    "name": m.group(3).strip(),
                    "mib": int(m.group(4)),
                }
            )
    return {
        "name": name,
        "vram_used_mib": int(float(used or 0)),
        "vram_total_mib": int(float(total or 0)),
        "util_pct": int(float(util or 0)),
        "power_w": round(float(power or 0), 1),
        "power_limit_w": round(float(limit or 0), 1),
        "persistence": pers.lower() in {"enabled", "on"},
        "procs": procs,
    }


def swap() -> dict:
    disk_used = disk_sz = zram_used = zram_sz = 0
    for line in Path("/proc/swaps").read_text().splitlines()[1:]:
        parts = line.split()
        if len(parts) < 5:
            continue
        name, kind, size, used = parts[0], parts[1], int(parts[2]), int(parts[3])
        if "zram" in name:
            zram_used += used
            zram_sz += size
        elif kind == "file":
            disk_used += used
            disk_sz += size
    return {
        "disk_used_mb": round(disk_used / 1024, 1),
        "disk_size_gb": round(disk_sz / 1048576, 1),
        "zram_used_mb": round(zram_used / 1024, 1),
        "zram_size_gb": round(zram_sz / 1048576, 1),
    }


def python_resident() -> bool:
    ps = _sh(["ps", "-eo", "args"])
    for line in ps.splitlines():
        if "snapshot.py" in line or "serve.py" in line:
            continue
        if re.search(r"python.*(pipeline|diffusers|transformers|sam2)", line, re.I):
            return True
    return False


def stack(_g: dict) -> list[dict]:
    rows = []
    catalog = [
        ("sam2-tiny", "segment", "facebook--sam2.1-hiera-tiny", 2.5),
        ("clip-vit-b32", "region", "openai--clip-vit-base-patch32", 2.0),
        ("flux2-klein-4b", "snap", "black-forest-labs--FLUX.2-klein-4B", 13.0),
    ]
    for sid, role, slug, peak in catalog:
        cache, inc = dir_sizes(HUB / f"models--{slug}")
        rows.append(
            {
                "id": sid,
                "role": role,
                "cache_gb": cache,
                "incomplete_gb": inc,
                "peak_vram_gb": peak,
                "resident": False,
            }
        )
    # klein weights
    klein = HUB / "models--black-forest-labs--FLUX.2-klein-4B" / "blobs"
    wsum = 0
    ok = True
    for _n, (h, exp) in KLEIN_BLOBS.items():
        p = klein / h
        got = p.stat().st_size if p.is_file() else 0
        wsum += got
        ok = ok and got == exp
    for r in rows:
        if r["id"] == "flux2-klein-4b":
            r["weights_gb"] = round(wsum / 1e9, 2)
            r["weights_ok"] = ok
    return rows


def snapshot() -> dict:
    mi = _meminfo()
    g = gpu()
    return {
        "ts": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "host": _sh(["hostname"]) or "fractal1",
        "kernel": Path("/proc/version").read_text().split()[2] if Path("/proc/version").exists() else "",
        "gpu": g,
        "ram": {
            "total_gb": _kb_gb(mi.get("MemTotal", 0)),
            "avail_gb": _kb_gb(mi.get("MemAvailable", 0)),
            "committed_gb": _kb_gb(mi.get("Committed_AS", 0)),
        },
        "swap": swap(),
        "stack": stack(g),
        "ai_on_tube": python_resident()
        or any(p.get("kind") == "C" for p in g.get("procs", [])),
        "source": "fractal1",
    }


if __name__ == "__main__":
    print(json.dumps(snapshot(), indent=2))
