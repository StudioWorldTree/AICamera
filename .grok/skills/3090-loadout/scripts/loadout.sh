#!/usr/bin/env bash
# Live fractal1 3090 loadout: resident VRAM/RAM vs disk caches vs zram vs disk swap.
set -euo pipefail
HOST="${FRACTAL1_HOST:-fractal1}"
ssh -o BatchMode=yes -o ConnectTimeout=8 "$HOST" 'bash -s' << 'EOF'
set +e
echo "=== host ==="
echo "user=$(whoami) kernel=$(uname -r) ts=$(date -Iseconds)"

echo "=== ram ==="
awk '
  /^MemTotal:/ {t=$2}
  /^MemAvailable:/ {a=$2}
  /^MemFree:/ {f=$2}
  /^Cached:/ {c=$2}
  /^Buffers:/ {b=$2}
  /^Committed_AS:/ {as=$2}
  END {
    printf "total_gb %.2f  avail_gb %.2f  free_gb %.2f  cached_gb %.2f  committed_gb %.2f\n",
      t/1048576, a/1048576, f/1048576, (c+b)/1048576, as/1048576
  }
' /proc/meminfo

echo "=== swap ==="
# zram = compressed RAM. swapfile = actual disk.
awk '
  BEGIN {zr=0; zrsz=0; fi=0; fisz=0}
  NR==1 {next}
  $1 ~ /zram/ {zr+=$4; zrsz+=$3}
  $2=="file" {fi+=$4; fisz+=$3}
  {tot+=$3; used+=$4}
  END {
    printf "disk_swapfile_used_mb %.1f  disk_swapfile_size_gb %.1f\n", fi/1024, fisz/1048576
    printf "zram_used_mb %.1f  zram_size_gb %.1f   # compressed RAM, not disk\n", zr/1024, zrsz/1048576
    printf "swap_total_used_mb %.1f\n", used/1024
  }
' /proc/swaps
echo -n "swappiness="; cat /proc/sys/vm/swappiness
zramctl 2>/dev/null | sed 's/^/zramctl /'

echo "=== vram ==="
nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu,power.draw,persistence_mode --format=csv,noheader
python3 - << 'PY'
import subprocess
out = subprocess.check_output(["nvidia-smi"], text=True)
print("--- smi processes ---")
grab=False
for line in out.splitlines():
    if "Processes:" in line:
        grab=True
    if grab:
        print(line)
PY

echo "=== rss_top ==="
ps -eo rss,user,comm --sort=-rss | awk 'NR==1{next} {mb=$1/1024; if(mb<8) exit; printf "%.0f MB  %s  %s\n", mb, $2, $3}'

echo "=== swapped_procs_kB ==="
# VmSwap includes zram. Disk share is tiny unless swapfile used_mb is large.
for pid in /proc/[0-9]*; do
  sw=$(awk '/^VmSwap:/ {print $2}' "$pid/status" 2>/dev/null) || continue
  [ "${sw:-0}" -gt 1024 ] || continue
  cmd=$(tr '\0' ' ' < "$pid/cmdline" 2>/dev/null | cut -c1-90)
  printf "%6s kB  %s\n" "$sw" "${cmd:-$(basename "$pid")}"
done | sort -nr | head -12

echo "=== disk_stack ==="
# Real klein weights (not HF snapshot bloat / .incomplete)
python3 - << 'PY'
import os
hub=os.path.expanduser("~/.cache/huggingface/hub")
print("hf_hub_gb %.1f" % (sum(os.path.getsize(os.path.join(dp,f)) for dp,_,fs in os.walk(hub) for f in fs)/1e9) if os.path.isdir(hub) else "hf_hub missing")
rows=[
 ("sam2.1-hiera-tiny", "facebook--sam2.1-hiera-tiny", None),
 ("clip-vit-base-patch32", "openai--clip-vit-base-patch32", None),
 ("flux2-klein-4B", "black-forest-labs--FLUX.2-klein-4B", [
    ("text_enc_1", "8c0506e7f4936fa7e26183a4fd8da4e2bdbc5990ba64ae441f965d51228f36ea", 4967215360),
    ("text_enc_2", "82f2bd839378541b0557bfabaf37c7d3d637071fdcb73302dedd7cf61162ce07", 3077766632),
    ("transformer", "9f29f9edcfdae452a653ffb51a534ca4decd389952c225724ff3b94042612a6e", 7751109744),
    ("vae", "ca70d2202afe6415bdbcb8793ba8cd99fd159cfe6192381504d6c4d3036e0f04", 168120878),
 ]),
]
for label, slug, blobs in rows:
    p=os.path.join(hub, "models--"+slug)
    if not os.path.isdir(p):
        print(f"{label}  DISK_ABSENT")
        continue
    total=sum(os.path.getsize(os.path.join(dp,f)) for dp,_,fs in os.walk(p) for f in fs)
    inc=sum(os.path.getsize(os.path.join(dp,f)) for dp,_,fs in os.walk(p) for f in fs if "incomplete" in f)
    print(f"{label}  cache_gb {total/1e9:.2f}  incomplete_gb {inc/1e9:.2f}")
    if blobs:
        ok=0
        for n,h,exp in blobs:
            bp=os.path.join(p,"blobs",h)
            got=os.path.getsize(bp) if os.path.exists(bp) else 0
            flag="OK" if got==exp else "MISSING"
            ok += got
            print(f"  weight {n} {got/1e9:.2f} GB {flag}")
        print(f"  weights_sum_gb {ok/1e9:.2f}")
PY
du -sh ~/aicam/.venv ~/aicam/out 2>/dev/null | awk '{print "aicam", $2, $1}'

echo "=== python_gpu ==="
pgrep -af 'python|pipeline.py|diffusers|uvicorn' | grep -v 'pgrep\|bash -s' || echo "(no python AI procs)"

echo "=== units ==="
for u in nvidia-persistenced smb aicam-smb-tailscale nfs-server; do
  printf "%s %s\n" "$u" "$(systemctl is-active $u 2>/dev/null)"
done
EOF
