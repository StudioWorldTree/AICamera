#!/usr/bin/env python3
"""GET /loadout.json on Tailscale only. Never bind 0.0.0.0."""
from __future__ import annotations

import json
import os
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

PORT = 8745


def bind_ip() -> str:
    env = os.environ.get("TAILSCALE_IP", "").strip()
    if env:
        return env
    try:
        out = subprocess.check_output(["tailscale", "ip", "-4"], text=True)
        ip = out.strip().splitlines()[0].strip()
        if ip:
            return ip
    except (subprocess.CalledProcessError, FileNotFoundError, IndexError):
        pass
    return "100.103.147.70"
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from mags import eject, pulling, start_pull  # noqa: E402
from snapshot import snapshot  # noqa: E402


def _cors(handler: BaseHTTPRequestHandler) -> None:
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")


def _json(handler: BaseHTTPRequestHandler, code: int, payload: dict) -> None:
    body = json.dumps(payload).encode()
    handler.send_response(code)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Cache-Control", "no-store")
    _cors(handler)
    handler.end_headers()
    handler.wfile.write(body)


def _mag_id(path: str) -> tuple[str | None, str | None]:
    parts = [p for p in path.split("/") if p]
    if len(parts) < 2 or parts[0] != "mags":
        return None, None
    mid = parts[1]
    action = parts[2] if len(parts) > 2 else None
    return mid, action


def _resident(mid: str) -> bool:
    snap = snapshot()
    for row in snap.get("stack") or []:
        if row.get("id") == mid and row.get("resident"):
            return True
    return False


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write("bay-feed: " + (fmt % args) + "\n")

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        _cors(self)
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        path = self.path.split("?", 1)[0]
        if path in ("/loadout.json", "/", "/loadout"):
            payload = snapshot()
            payload["pulling"] = pulling()
            _json(self, 200, payload)
            return
        self.send_error(404, "bay feed: GET /loadout.json")

    def do_POST(self) -> None:  # noqa: N802
        path = self.path.split("?", 1)[0]
        mid, action = _mag_id(path)
        if mid and action == "pull":
            code, payload = start_pull(mid)
            _json(self, code, payload)
            return
        self.send_error(404, "POST /mags/{id}/pull")

    def do_DELETE(self) -> None:  # noqa: N802
        path = self.path.split("?", 1)[0]
        mid, action = _mag_id(path)
        if mid and action is None:
            code, payload = eject(mid, _resident(mid))
            _json(self, code, payload)
            return
        self.send_error(404, "DELETE /mags/{id}")


def main() -> None:
    ip = bind_ip()
    httpd = HTTPServer((ip, PORT), Handler)
    print(f"bay-feed http://{ip}:{PORT}/loadout.json", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
