"""Find bass-kick onsets in an audio/video file.

Usage: python3 find_kicks.py <file> [start_sec] [duration_sec]
Prints each low-end onset (absolute seconds in the file) with its relative strength.
Use it on the music around the drop to get KICK_SEC, and on the rendered mp4 to verify the sync.
"""
import subprocess
import sys

import numpy as np

path = sys.argv[1]
start = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
dur = float(sys.argv[3]) if len(sys.argv) > 3 else 10.0
SR = 22050
raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-ss", str(start), "-t", str(dur), "-i", path,
     "-ac", "1", "-ar", str(SR), "-af", "lowpass=f=120", "-f", "s16le", "-"],
    capture_output=True, check=True,
).stdout
a = np.frombuffer(raw, dtype=np.int16).astype(float)
hop = int(SR * 0.005)
env = np.array([np.sqrt((a[i:i + 2 * hop] ** 2).mean()) for i in range(0, len(a) - 2 * hop, hop)])
d = np.maximum(0, np.diff(env))
if not len(d) or d.max() == 0:
    sys.exit("no low-end energy found")
thr = d.max() * 0.25
for i in range(1, len(d) - 1):
    if d[i] > thr and d[i] == d[max(0, i - 20):i + 20].max():
        t = start + i * 0.005
        print(f"kick onset {t:.3f}s  (frame@30fps {t * 30:.1f})  strength {d[i] / d.max():.2f}")
