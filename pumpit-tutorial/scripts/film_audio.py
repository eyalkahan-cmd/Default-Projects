#!/usr/bin/env python3
"""Soundtrack for the CINEMATIC REBUILD 3.0 film (89.73 s).

- Voiceover: audio/Guide_v2.mp3, untouched, from 0.0 s.
- Music: "House Call (Instrumental)" (Artlist, user's plan). The slice is placed so the track's
  second drop (123.99 s) lands on "וזהו!" (77.66 s), the moment the costume reaches full size;
  the breakdown then sits under the dense sealing instructions (≈46–76 s).
- SFX (Artlist, user's plan) on picture events; speech-aware ducking; two-pass loudnorm to
  -15 LUFS / -1.5 dBTP with a limiter.

usage: film_audio.py <silent_film.mp4> <out.mp4>
"""
import sys

import numpy as np

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import lookdev_audio as L  # noqa: E402  (shared load/place/fade/snap helpers)

SR = L.SR
DUR = 89.733
VOICE = f"{L.ROOT}/audio/Guide_v2.mp3"
DROP2 = 123.99
FULL_SIZE = 77.66
MUSIC_IN = DROP2 - FULL_SIZE  # 46.33 s into the track at film 0

# (file, at s, gain dB, max length s)
SFX = [
    # opening: soft air on each beat cut of the costume montage
    ("whoosh", 0.95, -26, None), ("whoosh", 1.92, -26, None), ("whoosh", 2.89, -26, None), ("whoosh", 3.86, -24, None),
    # chapter light-wipes
    ("fabric_whoosh", 6.2, -20, None), ("whoosh", 11.8, -22, None), ("whoosh", 30.4, -24, None),
    ("whoosh", 41.9, -22, None), ("whoosh", 66.0, -22, None), ("whoosh", 79.0, -22, None), ("whoosh", 86.35, -24, None),
    # AA cells seating one by one (Power scene, cells seat at local 40 + 16 i)
    ("battery_click", 13.30, -22, 0.35), ("battery_click", 13.83, -22, 0.35), ("battery_click", 14.37, -22, 0.35), ("battery_click", 14.90, -22, 0.35),
    # USB plug seats in the power bank, then in the battery box
    ("battery_click", 24.22, -16, 0.5), ("battery_click", 29.98, -14, 0.5),
    # into the pocket, onto the belt
    ("fabric_whoosh", 36.2, -22, None), ("battery_click", 41.40, -17, 0.5),
    # zipper run
    ("zipper", 50.55, -13, 3.3),
    # switch on, blower, inflation, taut snap
    ("switch_click", 66.55, -14, 0.6), ("fan_running", 66.8, -22, 12.0), ("inflate", 67.6, -16, 8.6), ("pop", 77.45, -21, None),
    # reminder: the blower keeps running
    ("fan_running", 81.9, -25, 4.4),
]


def main(silent, out, sfx=None, dur=None, tail_fade=2.4, music_path=None, music_in=MUSIC_IN, full_size=FULL_SIZE, music_db=-16):
    sfx = SFX if sfx is None else sfx
    dur = DUR if dur is None else dur
    n = int(dur * SR)
    music = L.fade(L.load(music_path or L.MUSIC, music_in, dur)[:n], 0.35, tail_fade)
    if len(music) < n:
        music = np.pad(music, ((0, n - len(music)), (0, 0)))
    voice = np.zeros((n, 2), np.float32)
    v = L.load(VOICE)[:n]
    voice[: len(v)] = v
    fx = np.zeros((n, 2), np.float32)
    for f, at, g, mx in sfx:
        s = L.load(f"{L.SFX}/{f}.wav", 0, mx)
        L.place(fx, L.fade(s, 0.01, min(0.4, len(s) / SR / 3)), at, g)
    env = np.sqrt(np.convolve(voice[:, 0] ** 2, np.ones(1440) / 1440, "same"))
    active = (env > 0.01).astype(np.float32)
    duck = np.empty_like(active)
    ka, kr = 1 - np.exp(-1 / (SR * 0.15)), 1 - np.exp(-1 / (SR * 0.45))
    g = 0.0
    for i in range(len(active)):
        g += (active[i] - g) * (ka if active[i] > g else kr)
        duck[i] = g
    # music sits at -16 dB, a further 6 dB under speech; lifts a touch on the full-size drop
    lift = np.clip((np.arange(n) / SR - full_size) / 0.3, 0, 1) * np.clip((full_size + 1.6 - np.arange(n) / SR) / 0.6, 0, 1)
    mg = 10 ** ((music_db - 6 * duck + 3 * lift) / 20)
    mix = music * mg[:, None] + voice + fx
    # end of a partial cut: fade everything out over the last 0.6 s
    if dur < DUR - 0.01:
        mix = L.fade(mix, 0, 0.6)
    raw = out.rsplit(".", 1)[0] + ".f32"
    mix.astype(np.float32).tofile(raw)
    wav = out.rsplit(".", 1)[0] + ".wav"
    L.loudnorm_to(raw, wav, -15.0)
    L.subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", silent, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k",
         "-ar", "48000", "-ac", "2", "-shortest", "-movflags", "+faststart", out],
        check=True,
    )
    print("ok", out)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
