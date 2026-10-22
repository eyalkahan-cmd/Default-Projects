"""Cut individual footstep one-shots out of Artlist footstep recordings."""
import subprocess, os, sys
import numpy as np

SR = 48000
S = os.path.dirname(os.path.abspath(__file__))
FS = os.path.join(S, "fs")


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR),
                          "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def onsets(x, min_gap=0.22, hi=0.22, lo=0.06):
    win = int(0.004 * SR)
    env = np.convolve(np.abs(x), np.ones(win) / win, mode="same")
    m = np.percentile(env, 99.5)
    out, armed, last = [], True, -1e9
    for i in range(0, len(env), 48):  # 1 ms hop
        v = env[i] / m
        if armed and v > hi and (i - last) > min_gap * SR:
            # walk back to where the transient starts
            j = i
            while j > 0 and env[j] / m > lo and i - j < 0.03 * SR:
                j -= 48
            out.append(j)
            last, armed = i, False
        elif v < lo:
            armed = True
    return out


def slices(name, length=0.38, tail=0.12):
    x = load(os.path.join(FS, name + ".wav"))
    hits = []
    for o in onsets(x):
        s = x[max(o - int(0.004 * SR), 0): o + int(length * SR)].copy()
        if len(s) < int(0.15 * SR):
            continue
        n = int(tail * SR)
        s[-n:] *= np.linspace(1, 0, n) ** 2
        s[:96] *= np.linspace(0, 1, 96)
        hits.append(s / (np.max(np.abs(s)) + 1e-9))
    return hits


if __name__ == "__main__":
    for f in sorted(os.listdir(FS)):
        n = f[:-4]
        print(n, len(slices(n)))
