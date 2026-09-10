#!/usr/bin/env python3
"""Seat every seeded preset on 3090 (swap, max-of-peaks) and t4000 (sum)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CAT = json.loads((ROOT / "catalog.json").read_text())


def cart_map() -> dict:
    return {c["id"]: c for c in CAT["cartridges"]}


def cost_of(c: dict, env: str) -> dict | None:
    raw = (c.get("costs") or {}).get(env)
    if raw is None:
        return None
    return raw


def peak_pair(cost: dict, env: str) -> tuple[float, float, int]:
    """(mem_a, mem_b, nvenc). 3090 is vram+host; unified is (unified, 0)."""
    nv = int(cost.get("nvenc") or 0)
    if env == "3090":
        return float(cost["vram_gb"]), float(cost["host_ram_gb"]), nv
    return float(cost["unified_gb"]), 0.0, nv


def pack(ids: list[str], env: str) -> tuple[bool, str]:
    carts = cart_map()
    env_spec = CAT["envelopes"][env]
    swap = env_spec.get("residency") == "swap"
    seen_tags: dict[str, str] = {}
    always_a = always_b = always_n = 0.0
    slot_a = slot_b = slot_n = 0.0
    seated: list[str] = []
    for cid in ids:
        c = carts[cid]
        if c["shelf"] == "never-on-thor" and env in ("3090", "t4000"):
            return False, f"{cid} never-on-thor"
        cost = cost_of(c, env)
        if cost is None:
            if c["shelf"] == "always-on":
                continue
            return False, f"{cid} null cost on {env}"
        for tag in c.get("exclusive") or []:
            if tag in seen_tags:
                return False, f"exclusive {tag}: {seen_tags[tag]} vs {cid}"
            seen_tags[tag] = cid
        a, b, n = peak_pair(cost, env)
        if swap:
            if c["shelf"] == "always-on":
                always_a += a
                always_b += b
                always_n += n
            else:
                slot_a = max(slot_a, a)
                slot_b = max(slot_b, b)
                slot_n = max(slot_n, n)
            mem_a, mem_b, nv = always_a + slot_a, always_b + slot_b, always_n + slot_n
        else:
            always_a += a
            always_b += b
            always_n += n
            mem_a, mem_b, nv = always_a, always_b, always_n
        seated.append(cid)
    if env == "3090":
        if mem_a > env_spec["vram_gb"] + 1e-6:
            return False, f"vram {mem_a} > {env_spec['vram_gb']}"
        if mem_b > env_spec["host_ram_gb"] + 1e-6:
            return False, f"host {mem_b} > {env_spec['host_ram_gb']}"
    else:
        if mem_a > env_spec["unified_gb"] + 1e-6:
            return False, f"unified {mem_a} > {env_spec['unified_gb']}"
    if nv > env_spec["nvenc"] + 1e-6:
        return False, f"nvenc {nv} > {env_spec['nvenc']}"
    return True, ",".join(seated)


def main() -> int:
    homes = {
        "master-capture": ("3090", "t4000"),
        "snap": ("3090", "t4000"),
        "ad": ("t4000",),
        "ar": ("t4000",),
        "talent-tracking": ("t4000",),
    }
    failed = 0
    for preset, envs in homes.items():
        ids = CAT["presets"][preset]
        for env in envs:
            ok, why = pack(ids, env)
            mark = "OK" if ok else "FAIL"
            print(f"{preset:20} {env:6} {mark}  {why}")
            failed += not ok
    # klein vs 27B must refuse
    ok, why = pack(["nvenc-hevc", "klein-4b", "qwen-27b"], "t4000")
    print(f"{'klein+27b refuse':20} t4000 {'OK' if not ok else 'FAIL'}  {why}")
    failed += ok
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
