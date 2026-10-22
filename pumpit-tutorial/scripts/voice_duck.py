#!/usr/bin/env python3
"""Voice-activity envelope of Guide_v2 at the film frame rate (0 = silence, 1 = speech), with a
0.15 s attack / 0.45 s release, for ducking the music under the voiceover in the Remotion
soundtrack (cinematic/src/film/v2/SoundTrack.tsx). Derived data only; the voice is untouched.
usage: voice_duck.py <voice> <out.json>
"""
import json
import subprocess
import sys

import numpy as np

SR, FPS = 48000, 30
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout, np.float32)
env = np.sqrt(np.convolve(x**2, np.ones(1440) / 1440, "same"))
active = (env > 0.01).astype(np.float32)
ka, kr = 1 - np.exp(-1 / (SR * 0.15)), 1 - np.exp(-1 / (SR * 0.45))
g, duck = 0.0, np.empty_like(active)
for i, a in enumerate(active):
    g += (a - g) * (ka if a > g else kr)
    duck[i] = g
per_frame = [round(float(duck[int(f * SR / FPS)]), 3) for f in range(int(len(x) / SR * FPS))]
json.dump(per_frame, open(sys.argv[2], "w"))
print(len(per_frame), "frames")
