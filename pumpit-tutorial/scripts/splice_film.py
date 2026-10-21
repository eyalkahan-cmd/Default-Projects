#!/usr/bin/env python3
"""Splice re-rendered frame ranges into the full silent film render, convert to broadcast-range
yuv420p H.264, then lay the soundtrack (film_audio.py).

Segments (Remotion --frames ranges, inclusive) replace the same frames of Film_v1.silent.mp4.
"""
import subprocess
import sys

ROOT = "/home/user/Default-Projects/pumpit-tutorial"
OUT = f"{ROOT}/cinematic/out"
BASE = f"{OUT}/Film_v1.silent.mp4"
TOTAL = 2692
SEGS = [("A", 359, 916), ("B", 1507, 1984), ("C", 2455, 2594)]


def main():
    inputs = ["-i", BASE] + sum((["-i", f"{OUT}/seg_{n}.mp4"] for n, _, _ in SEGS), [])
    parts, labels, cur = [], [], 0
    for i, (_, a, b) in enumerate(SEGS, start=1):
        if a > cur:
            parts.append(f"[0:v]trim=start_frame={cur}:end_frame={a},setpts=PTS-STARTPTS[o{i}]")
            labels.append(f"[o{i}]")
        parts.append(f"[{i}:v]setpts=PTS-STARTPTS[s{i}]")
        labels.append(f"[s{i}]")
        cur = b + 1
    if cur < TOTAL:
        parts.append(f"[0:v]trim=start_frame={cur}:end_frame={TOTAL},setpts=PTS-STARTPTS[tail]")
        labels.append("[tail]")
    fc = ";".join(parts) + f";{''.join(labels)}concat=n={len(labels)}:v=1:a=0,scale=in_range=pc:out_range=tv,format=yuv420p[v]"
    silent = f"{OUT}/Film_v1b.silent.mp4"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[v]", "-r", "30", "-c:v", "libx264", "-preset", "slow",
         "-crf", "17", "-profile:v", "high", "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
         "-movflags", "+faststart", silent],
        check=True,
    )
    subprocess.run([sys.executable, f"{ROOT}/scripts/film_audio.py", silent, f"{ROOT}/deliver/Pumpit_Tutorial_Cinematic_v1.mp4"], check=True)


if __name__ == "__main__":
    main()
