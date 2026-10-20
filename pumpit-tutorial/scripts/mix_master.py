#!/usr/bin/env python3
"""Mix and master the Pumpit tutorial soundtrack.

Stems: voice (original ElevenLabs MP3, cleaned), music (bar-aligned edit, ducked under speech),
SFX (Artlist clips + synthesized accents placed on the picture's events).
Output: 48 kHz stereo WAV stems and a mastered mix at about -15 LUFS / -1 dBTP.

Usage: python3 -I scripts/mix_master.py <project_dir>
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 48000
DUR = 90.67
ROOT = Path(sys.argv[1]).resolve()
OUT = ROOT / "audio_build"
SFX = ROOT / "assets_raw" / "sfx"


def load(path, filters=""):
    """Decode any audio file to 48 kHz stereo float32 via ffmpeg."""
    af = ["-af", filters] if filters else []
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), *af, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
        check=True,
        capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def save(path, x):
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s24le", str(path)],
        input=np.ascontiguousarray(x, dtype=np.float32).tobytes(),
        check=True,
    )


def db(g):
    return 10 ** (g / 20)


def place(bus, clip, t, gain_db=0.0, length=None, fade=0.03):
    s = int(t * SR)
    c = clip[: int(length * SR)] if length else clip
    c = c * db(gain_db)
    if fade and len(c) > int(fade * SR) * 2:
        n = int(fade * SR)
        c = c.copy()
        c[-n:] *= np.linspace(1, 0, n)[:, None]
    e = min(len(bus), s + len(c))
    bus[s:e] += c[: e - s]


def impact(length=1.6):
    """Synthesized soft sub impact + airy noise tail (for the turning point and the payoff)."""
    t = np.arange(int(length * SR)) / SR
    f = 70 * np.exp(-t * 3) + 38
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    rng = np.random.default_rng(7)
    noise = rng.standard_normal(len(t))
    # one-pole low-pass on the noise
    a = 0.06
    lp = np.empty_like(noise)
    acc = 0.0
    for i, v in enumerate(noise):
        acc += a * (v - acc)
        lp[i] = acc
    air = lp * np.exp(-t * 5) * 0.8
    x = (sub * 0.9 + air) / 1.4
    return np.stack([x, x], axis=1).astype(np.float32)


def riser(length=1.2):
    """Short filtered-noise riser into a reveal."""
    t = np.arange(int(length * SR)) / SR
    rng = np.random.default_rng(3)
    n = rng.standard_normal(len(t))
    env = (t / length) ** 2
    hp = np.diff(n, prepend=0) * 0.5
    x = hp * env * 0.35
    return np.stack([x, x * 0.9], axis=1).astype(np.float32)


def main():
    OUT.mkdir(exist_ok=True)
    n = int(DUR * SR)

    # ---- voice: gentle clean-up (HPF, de-ess, light compression), timing untouched
    voice = load(
        ROOT / "audio" / "Guide.mp3",
        "highpass=f=75,deesser=i=0.35:m=0.5:f=0.5,acompressor=threshold=-20dB:ratio=2.2:attack=8:release=120:makeup=2dB",
    )
    vb = np.zeros((n, 2), np.float32)
    vb[: min(n, len(voice))] = voice[:n]

    # ---- music with speech-aware ducking
    music = load(OUT / "music_edit.wav")
    mb = np.zeros((n, 2), np.float32)
    mb[: min(n, len(music))] = music[:n]
    caps = json.loads((ROOT / "data" / "transcript.json").read_text(encoding="utf-8"))["segments"]
    tt = np.arange(n) / SR
    speaking = np.zeros(n, bool)
    for c in caps:
        speaking |= (tt >= c["start"] - 0.15) & (tt <= c["end"] + 0.12)
    target = np.where(speaking, db(-15.5), db(-9.5))
    # lifts at the musical moments (no speech there)
    lift = np.ones(n)
    lift[(tt < 0.45)] = db(2)
    lift[(tt >= 77.93) & (tt < 78.6)] = db(3)
    lift[tt >= 86.25] = db(5)
    target = target * lift
    # smooth the gain curve (~120 ms) so ducking breathes instead of pumping
    k = int(0.12 * SR)
    kern = np.ones(k) / k
    env = np.convolve(target, kern, mode="same")
    mb *= env[:, None].astype(np.float32)

    # ---- sound effects on picture events
    sb = np.zeros((n, 2), np.float32)
    clips = {name: load(SFX / f"{name}.wav") for name in ["battery_click", "switch_click", "whoosh", "fan_running", "zipper", "inflate", "pop", "fabric_whoosh"]}
    hit = impact()
    rise = riser()

    # opening: costume pops on the beat, headline, balloon reveal
    for i in range(0, 12, 2):
        place(sb, clips["pop"], 0.13 + i * 0.1, -20)
    place(sb, clips["whoosh"], 2.15, -12)
    place(sb, rise, 2.9, -6)
    place(sb, clips["fabric_whoosh"], 3.95, -10)
    # fan scene: push-in + magnifier pop
    place(sb, clips["whoosh"], 6.35, -16)
    place(sb, clips["pop"], 7.5, -14)
    # cut wipes
    for t in [11.91, 25.85, 31.41, 35.25, 50.51, 54.33, 59.77, 66.45, 69.19, 86.67]:
        place(sb, clips["whoosh"], t - 0.2, -14)
    # batteries
    place(sb, clips["switch_click"], 12.2, -14)
    for t in [13.48, 13.88, 14.28, 14.68]:
        place(sb, clips["battery_click"], t, -9, length=0.5)
    place(sb, clips["switch_click"], 16.75, -14)
    place(sb, clips["pop"], 17.4, -14)
    place(sb, clips["pop"], 19.1, -15)
    place(sb, clips["battery_click"], 22.8, -11, length=0.5)
    # cable + pocket/clip
    place(sb, clips["battery_click"], 28.45, -8, length=0.5)
    place(sb, clips["pop"], 28.7, -16)
    place(sb, clips["fabric_whoosh"], 36.4, -12)
    place(sb, clips["switch_click"], 38.85, -12)
    # the turning point
    place(sb, hit, 42.31, -4)
    place(sb, clips["whoosh"], 45.45, -13)
    # zipper / elastic / straps
    place(sb, clips["zipper"], 51.45, -9, length=2.2, fade=0.2)
    place(sb, clips["pop"], 53.55, -16)
    place(sb, clips["fabric_whoosh"], 55.45, -13)
    place(sb, clips["pop"], 57.05, -16)
    place(sb, clips["fabric_whoosh"], 62.3, -14)
    # switch on + fan + inflation
    place(sb, clips["switch_click"], 67.22, -13)
    fan = clips["fan_running"][: int(11.5 * SR)].copy()
    ramp = np.minimum(1, np.arange(len(fan)) / (1.2 * SR))
    tail = np.ones(len(fan))
    tail[-int(1.5 * SR):] = np.linspace(1, 0, int(1.5 * SR))
    fan *= (ramp * tail)[:, None]
    place(sb, fan, 67.3, -17, fade=0)
    place(sb, clips["inflate"], 69.8, -15, fade=0.4)
    place(sb, clips["fabric_whoosh"], 74.55, -10)
    # payoff, finale, logo
    place(sb, hit, 77.93, -7)
    for i in range(5):
        place(sb, clips["pop"], 78.0 + i * 0.09, -19)
    place(sb, clips["pop"], 82.1, -12)
    place(sb, rise, 87.6, -8)
    place(sb, clips["pop"], 88.82, -9)
    place(sb, hit, 88.82, -12)

    save(OUT / "stem_voice.wav", vb)
    save(OUT / "stem_music.wav", mb)
    save(OUT / "stem_sfx.wav", sb)
    mix = vb + mb + sb
    save(OUT / "mix_premaster.wav", mix)

    # ---- two-pass loudness normalisation to -15 LUFS integrated, -1 dBTP
    tgt = "I=-15:TP=-1.5:LRA=11"
    meas = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(OUT / "mix_premaster.wav"), "-af", f"loudnorm={tgt}:print_format=json", "-f", "null", "-"],
        capture_output=True,
        text=True,
    ).stderr
    m = json.loads(meas[meas.rfind("{"): meas.rfind("}") + 1])
    lf = (
        f"loudnorm={tgt}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
        f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample={SR},alimiter=limit=0.79:attack=2:release=60:level=false"
    )
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(OUT / "mix_premaster.wav"), "-af", lf, "-ar", str(SR), "-c:a", "pcm_s24le", str(OUT / "Pumpit_Tutorial_Mix_Master.wav")],
        check=True,
    )
    print("premaster loudness:", m["input_i"], "LUFS, TP", m["input_tp"])


if __name__ == "__main__":
    main()
