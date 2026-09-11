#!/usr/bin/env python3
"""Warm CPU Parakeet TDT 0.6B v3 INT8 sidecar.

JSONL stdin/stdout child of Bun. No TCP/UDP listener.
Weights: fractal1 ~/aicam/parakeet-cpu (onnx-asr nemo-parakeet-tdt-0.6b-v3 INT8).
"""
from __future__ import annotations

import os

# Before onnxruntime: hide every GPU. Intra-op ceiling is 4 (spec).
os.environ["CUDA_VISIBLE_DEVICES"] = ""
os.environ.setdefault("OMP_NUM_THREADS", "4")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "4")
os.environ.setdefault("MKL_NUM_THREADS", "4")
os.environ.setdefault("NUMEXPR_NUM_THREADS", "4")
os.environ.setdefault("HF_HUB_OFFLINE", "1")

import argparse
import json
import sys
import threading
import wave
from pathlib import Path
from typing import Any

MODEL_ID = "nemo-parakeet-tdt-0.6b-v3"
PROVIDER = "CPUExecutionProvider"
SAMPLE_RATE = 16000
MAX_INTRA_OP = 4
INT8_FILES = (
    "encoder-model.int8.onnx",
    "decoder_joint-model.int8.onnx",
    "vocab.txt",
)


def intra_op_threads() -> int:
    raw = os.environ.get("PARAKEET_INTRA_OP", "4").strip() or "4"
    try:
        n = int(raw)
    except ValueError:
        n = MAX_INTRA_OP
    return max(1, min(MAX_INTRA_OP, n))


def weights_dir() -> Path:
    env = os.environ.get("PARAKEET_WEIGHTS", "").strip()
    if env:
        return Path(env).expanduser()
    return Path.home() / "aicam" / "parakeet-cpu"


def log(msg: str) -> None:
    sys.stderr.write(f"parakeet-sidecar: {msg}\n")
    sys.stderr.flush()


def emit(payload: dict[str, Any]) -> None:
    body = {k: v for k, v in payload.items() if v is not None}
    sys.stdout.write(json.dumps(body, ensure_ascii=False) + "\n")
    sys.stdout.flush()


class SidecarError(Exception):
    def __init__(self, message: str, http: int) -> None:
        super().__init__(message)
        self.http = http


class ShapeError(SidecarError):
    def __init__(self, message: str) -> None:
        super().__init__(message, 422)


class RequestError(SidecarError):
    def __init__(self, message: str, http: int = 400) -> None:
        super().__init__(message, http)


class Engine:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._model: Any = None
        self._state = "cold"
        self._error: str | None = None
        self._weights = weights_dir()

    def snapshot(self) -> tuple[str, str | None, Any]:
        with self._lock:
            return self._state, self._error, self._model

    def health(self, req_id: Any) -> dict[str, Any]:
        state, err, _ = self.snapshot()
        out: dict[str, Any] = {
            "id": req_id,
            "ok": True,
            "state": state,
            "provider": PROVIDER,
            "model": MODEL_ID,
        }
        if state == "down" and err:
            out["error"] = err
        return out

    def load(self) -> None:
        path = self._weights
        try:
            if not path.is_dir():
                raise FileNotFoundError(f"weights dir missing: {path}")
            missing = [name for name in INT8_FILES if not (path / name).is_file()]
            if missing:
                raise FileNotFoundError(
                    f"INT8 weights missing in {path}: {', '.join(missing)}"
                )
            import onnx_asr
            import onnxruntime as ort

            sess = ort.SessionOptions()
            sess.intra_op_num_threads = intra_op_threads()
            sess.inter_op_num_threads = 1
            sess.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
            model = onnx_asr.load_model(
                MODEL_ID,
                path,
                quantization="int8",
                sess_options=sess,
                providers=[PROVIDER],
            )
        except Exception as exc:
            with self._lock:
                self._state = "down"
                self._error = str(exc)
                self._model = None
            log(f"load failed: {exc}")
            return
        with self._lock:
            self._model = model
            self._state = "warm"
            self._error = None
        log(f"warm {MODEL_ID} INT8 {PROVIDER} threads={intra_op_threads()} path={path}")

    def start_warm(self) -> None:
        threading.Thread(target=self.load, name="parakeet-load", daemon=True).start()

    def transcribe(self, req_id: Any, req: dict[str, Any]) -> dict[str, Any]:
        state, err, model = self.snapshot()
        warm = state == "warm" and model is not None
        base = {
            "id": req_id,
            "state": state,
            "provider": PROVIDER,
            "model": MODEL_ID,
        }
        try:
            pcm = _audio(req, load_pcm=warm)
        except SidecarError as exc:
            return {**base, "ok": False, "error": str(exc), "http": exc.http}
        except Exception as exc:
            return {**base, "ok": False, "error": str(exc), "http": 500}
        if not warm:
            msg = "sidecar cold" if state == "cold" else f"sidecar down: {err or 'not loaded'}"
            return {**base, "ok": False, "error": msg, "http": 503}
        try:
            text = model.recognize(pcm, sample_rate=SAMPLE_RATE)
        except Exception as exc:
            return {**base, "ok": False, "error": str(exc), "http": 500}
        if not isinstance(text, str):
            text = getattr(text, "text", None) or str(text)
        return {**base, "ok": True, "text": text}


def _as_rate(value: Any) -> int | None:
    if value is None or value == "":
        return None
    try:
        if isinstance(value, bool):
            raise ValueError
        rate = int(value)
    except (TypeError, ValueError):
        raise RequestError(f"sample_rate must be an integer, got {value!r}") from None
    return rate


def _require_rate(rate: int | None) -> None:
    if rate is not None and rate != SAMPLE_RATE:
        raise ShapeError(f"expected sample_rate {SAMPLE_RATE}, got {rate}")


def _read_wav(path: Path) -> tuple[int, int, int, int, str, bytes]:
    try:
        with wave.open(str(path), "rb") as wf:
            nch = wf.getnchannels()
            rate = wf.getframerate()
            sw = wf.getsampwidth()
            nframes = wf.getnframes()
            raw = wf.readframes(nframes)
            comptype = wf.getcomptype()
    except wave.Error as exc:
        raise ShapeError(f"not a PCM WAV: {exc}") from exc
    return nch, rate, sw, nframes, comptype, raw


def _check_wav_shape(nch: int, rate: int, sw: int, nframes: int, comptype: str, raw: bytes) -> None:
    if comptype not in ("NONE", "none"):
        raise ShapeError(f"WAV must be uncompressed PCM, got {comptype}")
    if nch != 1 or rate != SAMPLE_RATE:
        raise ShapeError(f"expected {SAMPLE_RATE} Hz mono, got {rate} Hz {nch} ch")
    if nframes <= 0 or not raw:
        raise ShapeError("empty WAV")
    if sw not in (1, 2, 3, 4):
        raise ShapeError(f"unsupported WAV sample width {sw}")


def _pcm_from_frames(sw: int, raw: bytes) -> Any:
    import numpy as np

    if sw == 1:
        return (np.frombuffer(raw, dtype=np.uint8).astype(np.float32) - 128.0) / 128.0
    if sw == 2:
        return np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768.0
    if sw == 3:
        a = np.frombuffer(raw, dtype=np.uint8).reshape(-1, 3).astype(np.int32)
        ints = a[:, 0] | (a[:, 1] << 8) | (a[:, 2] << 16)
        ints = np.where(ints >= 0x800000, ints - 0x1000000, ints)
        return ints.astype(np.float32) / 8388608.0
    return np.frombuffer(raw, dtype="<i4").astype(np.float32) / 2147483648.0


def _check_pcm_f32(pcm_f32: Any) -> None:
    if isinstance(pcm_f32, (str, bytes, dict)):
        raise ShapeError("pcm_f32 must be a non-empty 1-D mono float32 vector")
    try:
        n = len(pcm_f32)
    except TypeError as exc:
        raise ShapeError("pcm_f32 must be a non-empty 1-D mono float32 vector") from exc
    if n == 0:
        raise ShapeError("pcm_f32 must be a non-empty 1-D mono float32 vector")
    first = pcm_f32[0]
    if isinstance(first, (list, tuple)):
        raise ShapeError("pcm_f32 must be a non-empty 1-D mono float32 vector")


def _audio(req: dict[str, Any], *, load_pcm: bool) -> Any:
    wav_path = req.get("wav_path")
    pcm_f32 = req.get("pcm_f32")
    _require_rate(_as_rate(req.get("sample_rate")))
    if wav_path:
        path = Path(str(wav_path)).expanduser()
        if not path.is_file():
            raise RequestError(f"wav not found: {path}")
        nch, rate, sw, nframes, comptype, raw = _read_wav(path)
        _check_wav_shape(nch, rate, sw, nframes, comptype, raw)
        if not load_pcm:
            return None
        return _pcm_from_frames(sw, raw)
    if pcm_f32 is None:
        raise RequestError("wav_path or pcm_f32 required")
    _check_pcm_f32(pcm_f32)
    if not load_pcm:
        return None
    import numpy as np

    pcm = np.asarray(pcm_f32, dtype=np.float32)
    if pcm.ndim != 1 or pcm.size == 0:
        raise ShapeError("pcm_f32 must be a non-empty 1-D mono float32 vector")
    return pcm


def handle(engine: Engine, req: dict[str, Any]) -> dict[str, Any]:
    req_id = req.get("id")
    if req_id is None:
        return {"id": None, "ok": False, "error": "id required", "http": 400}
    op = req.get("op")
    if op is None:
        op = "transcribe" if ("wav_path" in req or "pcm_f32" in req) else "health"
    if op == "health":
        return engine.health(req_id)
    if op == "transcribe":
        return engine.transcribe(req_id, req)
    return {
        "id": req_id,
        "ok": False,
        "error": f"unknown op {op!r}",
        "http": 400,
        "state": engine.snapshot()[0],
        "provider": PROVIDER,
        "model": MODEL_ID,
    }


def jsonl_loop(engine: Engine) -> None:
    engine.start_warm()
    for line in sys.stdin:
        raw = line.strip()
        if not raw:
            continue
        try:
            req = json.loads(raw)
        except json.JSONDecodeError as exc:
            emit({"id": "", "ok": False, "error": f"invalid json: {exc}", "http": 400})
            continue
        if not isinstance(req, dict):
            emit({"id": "", "ok": False, "error": "request must be a JSON object", "http": 400})
            continue
        try:
            emit(handle(engine, req))
        except Exception as exc:
            log(f"handler crashed: {exc}")
            emit({"id": req.get("id"), "ok": False, "error": str(exc), "http": 500})


def once(engine: Engine, wav: str, req_id: str) -> int:
    engine.load()
    out = engine.transcribe(req_id, {"wav_path": wav, "sample_rate": SAMPLE_RATE})
    emit(out)
    return 0 if out.get("ok") else 1


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="CPU Parakeet JSONL sidecar")
    parser.add_argument("--once", metavar="FILE.wav", help="transcribe one WAV and exit")
    parser.add_argument("--id", default="once", help="request id for --once")
    args = parser.parse_args(argv)
    engine = Engine()
    if args.once:
        return once(engine, args.once, args.id)
    jsonl_loop(engine)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
