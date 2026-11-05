"""Map a track's loudness sections to find where the heavy part ("the drop") really starts.

Usage:
  python3 find_sections.py <file>                    # 1s loudness overview + biggest section jumps
  python3 find_sections.py <file> <start> <end> [step]  # fine bass/full profile (default step 0.04s)

Pick a boundary where a SUSTAINED loud section begins (quiet/break before, loud for >= 10s after),
not a single hit after a breakdown. Then refine the exact first kick with the fine profile
(the frame where bass jumps) or with find_kicks.py.
"""
import subprocess
import sys

import numpy as np

SR = 11025
path = sys.argv[1]
x = np.frombuffer(
    subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                   capture_output=True, check=True).stdout,
    dtype=np.float32,
)


def rms(v):
    return float(np.sqrt((v ** 2).mean())) if len(v) else 0.0


if len(sys.argv) >= 4:
    a, b = float(sys.argv[2]), float(sys.argv[3])
    step = float(sys.argv[4]) if len(sys.argv) > 4 else 0.04
    seg = x[int(a * SR):int(b * SR)]
    lp = np.convolve(seg, np.ones(40) / 40, "same")  # crude low-pass (~275 Hz) for kicks
    h = int(SR * step)
    for i in range(len(seg) // h):
        bass, full = rms(lp[i * h:(i + 1) * h]), rms(seg[i * h:(i + 1) * h])
        print(f"{a + i * step:8.2f}s bass {bass:.3f} full {full:.3f} " + "#" * int(bass * 80))
    sys.exit()

hop = int(SR * 0.02)
n = len(x) // hop
e = np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1))
sec = e[:len(e) // 50 * 50].reshape(-1, 50).mean(1)
print("1s loudness:", " ".join(f"{i}:{v:.2f}" for i, v in enumerate(sec)))
w = 100  # 2s windows
jumps = sorted(((np.mean(e[i:i + w]) / (np.mean(e[i - w:i]) + 1e-6), i * 0.02) for i in range(w, len(e) - w, 5)),
               reverse=True)
seen = []
for v, t in jumps:
    if all(abs(t - s) > 4 for s in seen):
        seen.append(t)
        print(f"jump x{v:.2f} at {t:.2f}s")
    if len(seen) >= 8:
        break
