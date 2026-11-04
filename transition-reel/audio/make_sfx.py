"""Synthesize original whoosh / impact / riser SFX into ../public (44.1kHz stereo wav)."""
import os
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public")
rng = np.random.default_rng(7)


def save(name, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.9
    st = np.stack([x, x], axis=1)
    data = (st * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def lowpass(x, cutoff):
    """Time-varying one-pole lowpass; cutoff is an array (Hz) or scalar."""
    cutoff = np.broadcast_to(cutoff, x.shape)
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x)
    prev = 0.0
    for i in range(len(x)):
        prev = (1 - a[i]) * x[i] + a[i] * prev
        y[i] = prev
    return y


def whoosh(dur=0.55, peak=0.6):
    n = int(SR * dur)
    t = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    cutoff = 300 + 5000 * np.exp(-((t - peak) ** 2) / 0.03)
    band = lowpass(noise, cutoff) - lowpass(noise, cutoff * 0.25)
    env = np.exp(-((t - peak) ** 2) / 0.04)
    return band * env


def boom(dur=1.8):
    n = int(SR * dur)
    t = np.arange(n) / SR
    freq = 38 + 90 * np.exp(-t * 9)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    sub = np.sin(phase) * np.exp(-t * 2.2)
    click = lowpass(rng.standard_normal(n), 2500) * np.exp(-t * 35) * 1.5
    tail = lowpass(rng.standard_normal(n), 600) * np.exp(-t * 3) * 0.6
    return np.tanh((sub + click + tail) * 2.2)


def riser(dur=1.4):
    n = int(SR * dur)
    t = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    hp = noise - lowpass(noise, 400 + 6000 * t**2)
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * t**2) / SR) * 0.25
    return (lowpass(noise, 400 + 7000 * t**2) * 0.6 + tone - hp * 0.1) * t**2.5


def snap(dur=0.35):
    n = int(SR * dur)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 90 * t) * np.exp(-t * 18)
    hit = lowpass(rng.standard_normal(n), 4000) * np.exp(-t * 50)
    return np.tanh((body + hit) * 2)


if __name__ == "__main__":
    save("whoosh.wav", whoosh())
    save("boom.wav", boom())
    save("riser.wav", riser())
    save("snap.wav", snap())
    print("ok")
