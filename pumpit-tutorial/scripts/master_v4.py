#!/usr/bin/env python3
"""Master the Remotion-rendered soundtrack (composition FilmV2Audio, built from TIMINGS in
cinematic/src/film/v2/timings.ts) and mux it onto the silent picture.
Two-pass loudnorm to -15 LUFS / -1.5 dBTP + limiter, AAC 256k 48 kHz stereo.
usage: master_v4.py <soundtrack.wav> <silent.mp4> <out.mp4>
"""
import subprocess
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import lookdev_audio as L  # noqa: E402

src, silent, out = sys.argv[1:4]
raw = out.rsplit(".", 1)[0] + ".f32"
wav = out.rsplit(".", 1)[0] + ".wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "2", "-ar", str(L.SR), "-f", "f32le", raw], check=True)
L.loudnorm(raw, wav, -15.0)
subprocess.run(
    ["ffmpeg", "-v", "error", "-y", "-i", silent, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k",
     "-ar", "48000", "-ac", "2", "-shortest", "-movflags", "+faststart", out],
    check=True,
)
print("ok", out)
