#!/usr/bin/env bash
# One-time install on fractal1, from the clone: sudo deploy/fractal1/install.sh
# Needs: pacman -S nginx nodejs bun; clone at /home/dorje/src/AICamera.
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
owner=${SUDO_USER:-dorje}

install -d -o "$owner" -g "$owner" /srv/aicam
install -m644 "$here/nginx.conf" /etc/nginx/nginx.conf
install -Dm644 "$here/nginx-tailscale.conf" /etc/systemd/system/nginx.service.d/aicam-tailscale.conf
install -m644 "$here/aicam-site-build.service" "$here/aicam-site-build.timer" /etc/systemd/system/
systemctl daemon-reload

systemctl start aicam-site-build.service
nginx -t
systemctl enable --now nginx.service aicam-site-build.timer
systemctl reload nginx.service
