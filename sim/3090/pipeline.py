#!/usr/bin/env python3
"""fractal1 3090 harness — T4000 live-stack stand-in (FP16 only).

Stages unload between jobs so 16 GB host RAM survives.
Read fps through AICamera/docs/3090-SIM.md (filters ×0.13, SAM2/CLIP ×0.30).
"""
from __future__ import annotations

import argparse
import gc
import json
import subprocess
import sys
import time
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "out"
SRC = ROOT / "src"
VIDEO = SRC / "bedroom.mp4"
VIDEO_URL = (
    "https://huggingface.co/datasets/hf-internal-testing/sam2-fixtures"
    "/resolve/main/bedroom.mp4"
)

# T4000 translation (3090-SIM.md)
K_FILTER = 0.13
K_BANDWIDTH = 0.30

REGION_PROTOTYPES = [
    "a person",
    "a face",
    "a bed",
    "a pillow",
    "a wall",
    "a floor",
    "a window",
    "a lamp",
    "a plant",
    "furniture",
    "clothing",
    "a doorway",
]


def _free() -> None:
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        torch.cuda.synchronize()


def _smi() -> str:
    return subprocess.check_output(
        [
            "nvidia-smi",
            "--query-gpu=memory.used,utilization.gpu,power.draw",
            "--format=csv,noheader",
        ],
        text=True,
    ).strip()


def _ensure_video() -> Path:
    SRC.mkdir(parents=True, exist_ok=True)
    if VIDEO.exists() and VIDEO.stat().st_size > 10_000:
        return VIDEO
    print(f"downloading {VIDEO_URL}")
    subprocess.check_call(["curl", "-L", "--fail", "-o", str(VIDEO), VIDEO_URL])
    return VIDEO


def _probe(path: Path) -> tuple[int, int, float, int]:
    out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height,r_frame_rate,nb_frames",
            "-of",
            "csv=p=0",
            str(path),
        ],
        text=True,
    ).strip()
    w, h, rate, n = out.split(",")
    num, _, den = rate.partition("/")
    fps = float(num) / float(den or 1)
    try:
        n_frames = int(n)
    except ValueError:
        n_frames = 0
    return int(w), int(h), fps, n_frames


def _decode_rgb(path: Path, max_frames: int = 48, max_w: int = 1280) -> list[np.ndarray]:
    w, h, fps, n = _probe(path)
    scale = min(1.0, max_w / w)
    ow, oh = int(w * scale) // 2 * 2, int(h * scale) // 2 * 2
    vf = f"scale={ow}:{oh}"
    if n and n > max_frames:
        vf = f"{vf},select='not(mod(n\\,{max(1, n // max_frames)}))'"
    cmd = [
        "ffmpeg",
        "-v",
        "error",
        "-i",
        str(path),
        "-vf",
        vf,
        "-frames:v",
        str(max_frames),
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "pipe:1",
    ]
    raw = subprocess.check_output(cmd)
    frame_n = ow * oh * 3
    frames = [
        np.frombuffer(raw[i : i + frame_n], dtype=np.uint8).reshape(oh, ow, 3).copy()
        for i in range(0, len(raw) - frame_n + 1, frame_n)
    ]
    print(f"decoded {len(frames)} frames {ow}x{oh} src_fps={fps:.2f} smi={_smi()}")
    return frames


def _encode_rgb(frames: list[np.ndarray], dest: Path, fps: float = 12) -> None:
    h, w = frames[0].shape[:2]
    dest.parent.mkdir(parents=True, exist_ok=True)
    proc = subprocess.Popen(
        [
            "ffmpeg",
            "-y",
            "-v",
            "error",
            "-f",
            "rawvideo",
            "-pix_fmt",
            "rgb24",
            "-s",
            f"{w}x{h}",
            "-r",
            str(fps),
            "-i",
            "pipe:0",
            "-c:v",
            "libx265",
            "-preset",
            "fast",
            "-crf",
            "23",
            "-pix_fmt",
            "yuv420p",
            "-tag:v",
            "hvc1",
            str(dest),
        ],
        stdin=subprocess.PIPE,
    )
    assert proc.stdin is not None
    for f in frames:
        proc.stdin.write(f.tobytes())
    proc.stdin.close()
    if proc.wait() != 0:
        raise RuntimeError(f"ffmpeg encode failed {dest}")


def _to_t(frame: np.ndarray) -> torch.Tensor:
    t = torch.from_numpy(frame).to(device="cuda", dtype=torch.float32)
    return t.permute(2, 0, 1).contiguous() / 255.0


def _to_np(t: torch.Tensor) -> np.ndarray:
    x = (t.clamp(0, 1) * 255).to(torch.uint8).permute(1, 2, 0).cpu().numpy()
    return np.ascontiguousarray(x)


def filter_frame(t: torch.Tensor) -> torch.Tensor:
    """Look-dev filters on CUDA cores: unsharp, teal-orange, vignette, grain."""
    c, h, w = t.shape
    blur = torch.nn.functional.avg_pool2d(t.unsqueeze(0), 5, stride=1, padding=2)[0]
    sharp = (t + 0.55 * (t - blur)).clamp(0, 1)
    # 3x3 color matrix: slight teal shadows / orange highlights
    m = torch.tensor(
        [
            [1.06, -0.04, -0.02],
            [-0.03, 1.02, 0.01],
            [-0.04, -0.02, 1.08],
        ],
        device=t.device,
        dtype=t.dtype,
    )
    grade = torch.einsum("ij,jhw->ihw", m, sharp).clamp(0, 1)
    yy = torch.linspace(-1, 1, h, device=t.device).view(1, h, 1)
    xx = torch.linspace(-1, 1, w, device=t.device).view(1, 1, w)
    vig = 1.0 - 0.28 * (xx * xx + yy * yy)
    grain = torch.randn_like(grade) * 0.012
    return (grade * vig + grain).clamp(0, 1)


def stage_filters(frames: list[np.ndarray]) -> list[np.ndarray]:
    print("== filters (CUDA cores) ==")
    t0 = time.perf_counter()
    out = []
    # warmup
    filter_frame(_to_t(frames[0]))
    torch.cuda.synchronize()
    t1 = time.perf_counter()
    for f in frames:
        out.append(_to_np(filter_frame(_to_t(f))))
    torch.cuda.synchronize()
    dt = time.perf_counter() - t1
    fps = len(frames) / dt if dt else 0
    print(
        json.dumps(
            {
                "stage": "filters",
                "n": len(frames),
                "warmup_s": round(t1 - t0, 3),
                "fps_3090": round(fps, 1),
                "fps_t4000_read": round(fps * K_FILTER, 1),
                "smi": _smi(),
            }
        )
    )
    Image.fromarray(out[len(out) // 2]).save(OUT / "filter_still.jpg", quality=92)
    _encode_rgb(out, OUT / "filtered.mp4")
    return out


def _overlay_masks(
    frame: np.ndarray, masks: list[np.ndarray], labels: list[str] | None = None
) -> np.ndarray:
    vis = frame.astype(np.float32)
    rng = np.random.default_rng(0)
    colors = rng.integers(40, 220, size=(max(len(masks), 1), 3))
    for i, m in enumerate(masks):
        if m.dtype != bool:
            m = m > 0.5
        if m.shape != frame.shape[:2]:
            continue
        col = colors[i].astype(np.float32)
        vis[m] = vis[m] * 0.45 + col * 0.55
    img = Image.fromarray(vis.clip(0, 255).astype(np.uint8))
    if labels:
        draw = ImageDraw.Draw(img)
        try:
            font = ImageFont.load_default()
        except Exception:
            font = None
        for i, (m, lab) in enumerate(zip(masks, labels)):
            ys, xs = np.where(m > 0.5)
            if len(xs) == 0:
                continue
            x, y = int(xs.mean()), int(ys.min())
            draw.text((x, max(0, y - 10)), lab, fill=(255, 255, 255), font=font)
    return np.array(img)


def _sam2_grid(image: Image.Image) -> tuple[list[np.ndarray], list[float]]:
    """Point-grid SAM2 if AMG NMS chokes. LIVE-shaped: sparse prompts, not AMG."""
    from transformers import Sam2Model, Sam2Processor

    model = Sam2Model.from_pretrained("facebook/sam2.1-hiera-tiny").to("cuda")
    processor = Sam2Processor.from_pretrained("facebook/sam2.1-hiera-tiny")
    w, h = image.size
    xs = [w * t / 5 for t in range(1, 5)]
    ys = [h * t / 4 for t in range(1, 4)]
    points = [[[x, y] for y in ys for x in xs]]
    labels = [[[1] * (len(xs) * len(ys))]]
    inputs = processor(
        images=image, input_points=points, input_labels=labels, return_tensors="pt"
    ).to("cuda")
    with torch.no_grad():
        out = model(**inputs)
    post = processor.post_process_masks(
        out.pred_masks.cpu(),
        original_sizes=inputs.get("original_sizes"),
        reshaped_input_sizes=inputs.get("reshaped_input_sizes"),
    )[0]
    # post: (n_points, n_multi, H, W) or similar
    arr = post.numpy() if hasattr(post, "numpy") else np.asarray(post)
    while arr.ndim > 3:
        arr = arr.reshape(-1, arr.shape[-2], arr.shape[-1])
    masks = [arr[i] > 0.0 for i in range(arr.shape[0])]
    scores = [1.0] * len(masks)
    del model
    _free()
    return masks, scores


def stage_segment(frames: list[np.ndarray]) -> dict:
    print("== SAM2-tiny mask-generation ==")
    from transformers import pipeline as hf_pipe

    mid = frames[len(frames) // 2]
    image = Image.fromarray(mid)
    image.save(OUT / "keyframe.jpg", quality=92)
    # float32: torchvision NMS on this Arch build rejects fp16 scores vs fp32 boxes
    gen = hf_pipe(
        "mask-generation",
        model="facebook/sam2.1-hiera-tiny",
        device=0,
        dtype=torch.float32,
        local_files_only=True,
    )
    torch.cuda.synchronize()
    t0 = time.perf_counter()
    try:
        outputs = gen(image, points_per_batch=16)
        masks = [np.asarray(m) for m in outputs["masks"]]
        scores = [float(s) for s in outputs.get("scores", [1.0] * len(masks))]
    except RuntimeError as e:
        print("AMG failed, falling back to point grid:", e)
        masks, scores = _sam2_grid(image)
    torch.cuda.synchronize()
    dt = time.perf_counter() - t0
    # keep largest / highest-score, drop tiny
    ranked = sorted(
        zip(masks, scores),
        key=lambda ms: float(ms[0].sum()),
        reverse=True,
    )
    kept = []
    for m, s in ranked:
        area = float(m.sum()) / m.size
        if area < 0.004 or area > 0.92:
            continue
        kept.append((m.astype(bool), s, area))
        if len(kept) >= 12:
            break
    if len(kept) < 1:
        print("AMG kept nothing, adding point grid")
        gmasks, gscores = _sam2_grid(image)
        for m, s in zip(gmasks, gscores):
            area = float(np.asarray(m).sum()) / np.asarray(m).size
            if area < 0.004 or area > 0.92:
                continue
            kept.append((np.asarray(m).astype(bool), s, area))
            if len(kept) >= 12:
                break
    vis = _overlay_masks(mid, [k[0] for k in kept])
    Image.fromarray(vis).save(OUT / "sam2_overlay.jpg", quality=92)
    rec = {
        "stage": "sam2",
        "n_masks_raw": len(masks),
        "n_masks_kept": len(kept),
        "amg_s_3090": round(dt, 3),
        "amg_fps_3090": round(1.0 / dt, 2) if dt else 0,
        "amg_fps_t4000_read": round((1.0 / dt) * K_BANDWIDTH, 2) if dt else 0,
        "smi": _smi(),
    }
    print(json.dumps(rec))
    rec["keyframe"] = mid
    rec["kept"] = kept
    del gen
    _free()
    return rec


def stage_embed(seg: dict) -> list[dict]:
    print("== CLIP region embeddings ==")
    from transformers import CLIPModel, CLIPProcessor

    model = CLIPModel.from_pretrained(
        "openai/clip-vit-base-patch32", local_files_only=True
    ).to("cuda")
    proc = CLIPProcessor.from_pretrained(
        "openai/clip-vit-base-patch32", local_files_only=True
    )
    key = seg["keyframe"]
    h, w = key.shape[:2]
    texts = REGION_PROTOTYPES
    def _as_feat(x):
        if torch.is_tensor(x):
            return x
        for k in ("text_embeds", "image_embeds", "pooler_output"):
            v = getattr(x, k, None)
            if torch.is_tensor(v):
                return v
        raise TypeError(type(x))

    text_in = proc(text=texts, return_tensors="pt", padding=True).to("cuda")
    with torch.no_grad():
        text_f = torch.nn.functional.normalize(_as_feat(model.get_text_features(**text_in)), dim=-1)

    regions = []
    crops = []
    metas = []
    for i, (m, score, area) in enumerate(seg["kept"]):
        ys, xs = np.where(m)
        y0, y1 = int(ys.min()), int(ys.max()) + 1
        x0, x1 = int(xs.min()), int(xs.max()) + 1
        crop = key[y0:y1, x0:x1].copy()
        crop[~m[y0:y1, x0:x1]] = 0
        if crop.size == 0:
            continue
        crops.append(Image.fromarray(crop))
        metas.append(
            {
                "id": i,
                "bbox": [x0, y0, x1, y1],
                "area": round(area, 4),
                "sam_score": round(float(score), 4),
            }
        )
        crops[-1].save(OUT / f"crop_{i:02d}.jpg", quality=90)

    if not crops:
        print("no crops")
        return []

    img_in = proc(images=crops, return_tensors="pt", padding=True).to("cuda")
    torch.cuda.synchronize()
    t0 = time.perf_counter()
    with torch.no_grad():
        img_f = torch.nn.functional.normalize(_as_feat(model.get_image_features(**img_in)), dim=-1)
        sim = img_f @ text_f.T
    torch.cuda.synchronize()
    dt = time.perf_counter() - t0

    for idx, (meta, row) in enumerate(zip(metas, sim)):
        top = torch.topk(row, k=min(3, row.numel()))
        labels = [
            {"name": texts[int(i)], "score": round(float(s), 4)}
            for s, i in zip(top.values, top.indices)
        ]
        meta["region"] = labels[0]["name"]
        meta["topk"] = labels
        meta["embed8"] = [round(float(x), 5) for x in img_f[idx][:8].tolist()]
        regions.append(meta)

    (OUT / "regions.jsonl").write_text(
        "".join(json.dumps(r) + "\n" for r in regions)
    )
    labeled = _overlay_masks(
        key,
        [k[0] for k in seg["kept"][: len(regions)]],
        [r["region"] for r in regions],
    )
    Image.fromarray(labeled).save(OUT / "regions_overlay.jpg", quality=92)
    print(
        json.dumps(
            {
                "stage": "clip",
                "n": len(regions),
                "embed_s_3090": round(dt, 3),
                "smi": _smi(),
                "labels": [r["region"] for r in regions],
            }
        )
    )
    del model
    _free()
    return regions


def stage_snap(regions: list[dict], keyframe: np.ndarray) -> None:
    print("== FLUX.2 klein 4B snap ==")
    from diffusers import Flux2KleinPipeline

    skip = ("person", "face", "child", "kid")
    names = []
    for r in regions:
        n = r["region"]
        if any(s in n.lower() for s in skip):
            continue
        if n not in names:
            names.append(n)
    catalog = ", ".join(names[:6]) if names else "striped bedspread, pink wallpaper, white shelf, pillows"
    prompt = (
        f"cinematic still of an empty bedroom set: {catalog}, "
        "Cooke S4 look, T2.0, shallow depth of field, practical tungsten, "
        "35mm, fine grain, no people, no text, no faces"
    )
    print("prompt:", prompt)
    dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
    pipe = Flux2KleinPipeline.from_pretrained(
        "black-forest-labs/FLUX.2-klein-4B",
        torch_dtype=dtype,
        local_files_only=True,
    )
    pipe.enable_model_cpu_offload()
    torch.cuda.synchronize()
    t0 = time.perf_counter()
    image = pipe(
        prompt=prompt,
        height=768,
        width=768,
        guidance_scale=1.0,
        num_inference_steps=4,
        generator=torch.Generator(device="cuda").manual_seed(7),
    ).images[0]
    torch.cuda.synchronize()
    dt = time.perf_counter() - t0
    image.save(OUT / "klein_t2i.jpg", quality=95)

    # image-edit / ref from the filtered keyframe — the on-set snap shape
    try:
        edited = pipe(
            prompt="same room, cooler moonlight through the window, cinematic still, no text",
            image=Image.fromarray(keyframe).convert("RGB").resize((768, 768)),
            height=768,
            width=768,
            guidance_scale=1.0,
            num_inference_steps=4,
            generator=torch.Generator(device="cuda").manual_seed(11),
        ).images[0]
        edited.save(OUT / "klein_i2i.jpg", quality=95)
        i2i_ok = True
    except TypeError:
        i2i_ok = False
        print("klein i2i signature not accepted; t2i only")

    rec = {
        "stage": "klein",
        "t2i_s_3090": round(dt, 3),
        "i2i": i2i_ok,
        "size": 768,
        "steps": 4,
        "smi": _smi(),
        "prompt": prompt,
        "note": "FP16/BF16 on Ampere. T4000 may beat this with FP8/NVFP4. Compute ~1× at FP16.",
    }
    (OUT / "klein.json").write_text(json.dumps(rec, indent=2))
    print(json.dumps(rec))
    del pipe
    _free()


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument(
        "--stage",
        choices=["all", "filters", "segment", "embed", "snap"],
        default="all",
    )
    args = p.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    print("gpu", torch.cuda.get_device_name(0), "smi", _smi())
    _ensure_video()
    frames = _decode_rgb(VIDEO)
    if args.stage in ("all", "filters"):
        frames = stage_filters(frames)
        _free()
    if args.stage in ("all", "segment", "embed", "snap"):
        if not (OUT / "filter_still.jpg").exists() and args.stage != "all":
            frames = stage_filters(frames)
        seg = stage_segment(frames) if args.stage in ("all", "segment", "embed", "snap") else None
        _free()
    if args.stage in ("all", "embed", "snap"):
        regions = stage_embed(seg)
        _free()
    else:
        regions = []
    if args.stage in ("all", "snap"):
        key = seg["keyframe"] if seg else frames[len(frames) // 2]
        stage_snap(regions, key)
        _free()
    print("done", OUT, "smi", _smi())
    return 0


if __name__ == "__main__":
    sys.exit(main())
