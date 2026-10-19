"""Original royalty-free music bed + SFX for the inflatable-costume how-to video.

Writes to public/: music.wav (playful 112 BPM bed, 48s), whoosh.wav, pop.wav,
click.wav, inflate.wav, ding.wav.  Run: python3 scripts/make_audio.py
"""
import os
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public")
rng = np.random.default_rng(3)


def write(name, x):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    peak = np.max(np.abs(x)) or 1.0
    x = x / peak * 0.89
    data = (x * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)


def onepole(x, a):
    y = np.empty_like(x)
    a = np.broadcast_to(a, x.shape)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---------------------------------------------------------------- music bed
BPM = 112
BEAT = 60 / BPM
DUR = 48.0
N = int(SR * DUR)
mix = np.zeros((N, 2))


def add(sig, t, pan=0.0, g=1.0):
    i = int(t * SR)
    if i >= N:
        return
    j = min(N, i + len(sig))
    s = sig[: j - i] * g
    mix[i:j, 0] += s * (1 - pan)
    mix[i:j, 1] += s * (1 + pan)


def kick():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    f = 50 + 120 * np.exp(-t * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.15)


def hat():
    n = int(0.05 * SR)
    return np.diff(rng.standard_normal(n), prepend=0) * env(n, 0.0005, 0.012) * 0.22


def clap():
    n = int(0.2 * SR)
    e = np.zeros(n)
    for o in (0, 0.011, 0.022):
        k = int(o * SR)
        e[k:] += env(n - k, 0.0005, 0.035)
    return np.diff(rng.standard_normal(n), prepend=0) * e * 0.3


def pluck(freq, length=0.35):
    # Karplus-Strong: ukulele-ish pluck
    n = int(length * SR)
    p = int(SR / freq)
    buf = rng.uniform(-1, 1, p)
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return out * 0.5


def bass(freq, length):
    n = int(length * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(4 * np.pi * freq * t)
    return x * env(n, 0.004, 0.3) * 0.55


def bell(freq, length=0.6):
    n = int(length * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2.76 * t)
    return x * env(n, 0.002, 0.25) * 0.18


# I - V - vi - IV in C major
prog = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (41, [60, 65, 69])]
arp = [0, 1, 2, 1, 0, 2, 1, 2]
nbars = int(DUR / (4 * BEAT)) + 1
for bar in range(nbars):
    root, chord = prog[bar % 4]
    t0 = bar * 4 * BEAT
    for b in range(4):
        tb = t0 + b * BEAT
        add(kick(), tb, g=0.55 if b in (0, 2) else 0.0)
        if b in (1, 3):
            add(clap(), tb, g=0.5)
        add(hat(), tb + BEAT / 2, pan=0.3)
        add(hat(), tb, pan=-0.3, g=0.6)
    add(bass(midi(root), BEAT * 1.5), t0, g=1)
    add(bass(midi(root), BEAT * 0.9), t0 + BEAT * 1.5)
    add(bass(midi(root + 7), BEAT * 1.4), t0 + BEAT * 2.5)
    for k, idx in enumerate(arp):
        add(pluck(midi(chord[idx] + 12)), t0 + k * BEAT / 2, pan=0.35 * (1 if k % 2 else -1), g=0.55)
    if bar % 2 == 1:
        add(bell(midi(chord[2] + 24)), t0 + 3.5 * BEAT, pan=0.2)

fade = np.ones(N)
fn = int(2.5 * SR)
fade[-fn:] = np.linspace(1, 0, fn)
fade[: int(0.3 * SR)] = np.linspace(0, 1, int(0.3 * SR))
mix *= fade[:, None]
write("music.wav", mix)

# ---------------------------------------------------------------- SFX
n = int(0.55 * SR)
t = np.arange(n) / SR
noise = rng.standard_normal(n)
sweep = np.sin(np.pi * t / t[-1]) ** 2
whoosh = onepole(noise, 0.05 + 0.25 * sweep) * sweep
write("whoosh.wav", whoosh)

n = int(0.18 * SR)
t = np.arange(n) / SR
f = 300 + 900 * np.exp(-t * 30)
write("pop.wav", np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.05))

n = int(0.08 * SR)
write("click.wav", np.diff(rng.standard_normal(n), prepend=0) * env(n, 0.0002, 0.006)
      + np.sin(2 * np.pi * 2200 * np.arange(n) / SR) * env(n, 0.0002, 0.01))

n = int(3.5 * SR)
t = np.arange(n) / SR
a = t / t[-1]
air = onepole(rng.standard_normal(n), 0.02 + 0.2 * a) * (0.3 + a)
tone = np.sin(2 * np.pi * np.cumsum(120 + 500 * a ** 2) / SR) * 0.25 * a
infl = (air + tone) * np.minimum(1, (t[-1] - t) / 0.15)
write("inflate.wav", infl)

n = int(1.2 * SR)
t = np.arange(n) / SR
ding = sum(np.sin(2 * np.pi * f * t) * g for f, g in ((1318.5, 1), (1975.5, 0.5), (2637, 0.3)))
write("ding.wav", ding * env(n, 0.002, 0.35))
print("done")
