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
from snapshot import snapshot  # noqa: E402


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write("bay-feed: " + (fmt % args) + "\n")

    def do_GET(self) -> None:  # noqa: N802
        path = self.path.split("?", 1)[0]
        if path in ("/loadout.json", "/", "/loadout"):
            body = json.dumps(snapshot()).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
            return
        self.send_error(404, "bay feed: GET /loadout.json")


def main() -> None:
    ip = bind_ip()
    httpd = HTTPServer((ip, PORT), Handler)
    print(f"bay-feed http://{ip}:{PORT}/loadout.json", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
