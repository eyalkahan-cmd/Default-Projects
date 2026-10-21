#!/usr/bin/env python3
"""Soundtrack for the full v2 film (89.73 s): Guide_v2 untouched, the House Call slice with its
second drop on "וזהו!", and a sound-design layer synced to the v2 cut (beat-snapped shot cuts,
puff-ins, mechanics). Event times mirror the composition code (cinematic/src/film/v2/*).
usage: film_audio_v2.py <silent.mp4> <out.mp4>
"""
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import film_audio as F  # noqa: E402

FPS = 30
BEAT = 60 / 124 * FPS


def cut(scene_start, local):
    """same as cutOnBeat() in motion.tsx: scene-local frame snapped to the film beat grid"""
    return round(round((scene_start + local - 0.3) / BEAT) * BEAT + 0.3) - scene_start


def sec(f):
    return f / FPS


def s(x):
    return round(x * FPS)


W = lambda t, g=-22: ("air_whoosh", t - 0.55, g, None)  # noqa: E731  (peak ~0.55 s into the file)
P = lambda t, g=-26: ("ui_pop", t, g, 0.5)  # noqa: E731
SFX = []
# ---------------- 0–30.58 s: opening, 01 fan, 02 power, connect (same cut as the style test)
SFX += [("air_whoosh", max(0.0, 0.27 + (60 / 124) * k - 0.4), -30, None) for k in range(1, 7)]
SFX += [("fabric_whoosh", 3.55, -20, None), ("air_breath", 5.75, -26, None)]
SFX += [W(6.4), W(7.87), W(9.47, -27), W(10.73), W(11.96), ("air_breath", 11.4, -27, None)]
SFX += [W(sec(359 + 38), -28), W(sec(359 + 82), -27), W(sec(359 + 132), -26), W(sec(359 + 204), -26), W(sec(359 + 278), -26)]
SFX += [W(25.58), ("air_breath", 25.0, -27, None), W(sec(767 + 52))]
SFX += [P(t) for t in [0.47, 2.0, 4.07, 4.55, 5.03, 6.53, 7.0, 8.4, 10.2, 11.17, 12.09, 14.83, 17.37, 18.97, 23.37, 28.7]]
SFX += [P(16.7, -22)]
SFX += [("battery_click", t, -21, 0.35) for t in (12.83, 13.40, 13.97, 14.53)]
SFX += [("plastic_snap", 23.5, -17, None), ("plastic_snap", 29.67, -16, None)]
# ---------------- 03 wear (917–1261)
WS = 917
SFX += [W(sec(WS)), ("air_breath", sec(WS) - 0.5, -27, None), P(sec(WS + 4)), P(sec(WS + 14), -24)]
SFX += [W(sec(WS + cut(WS, 60)), -28), W(sec(WS + cut(WS, 182))), W(sec(WS + cut(WS, 224)), -27), W(sec(WS + cut(WS, 286)))]
PK = WS + 120  # WearPack local 0
SFX += [("fabric_whoosh", sec(PK + 30), -20, None), P(sec(PK + 48)), P(sec(PK + 184)), ("plastic_snap", sec(PK + 205), -15, None)]
# ---------------- 04 seal: air leak (1261–1507) + zipper / elastics / drawstring (1507–1985)
LS = 1261
SFX += [W(sec(LS)), P(sec(LS + 8), -22), P(sec(LS + 100)), P(sec(LS + 128)), W(sec(LS + cut(LS, 166)))]
SFX += [("air_breath", sec(LS + 110), -24, None), ("air_breath", sec(LS + 175), -26, None)]
SS = 1507
SFX += [W(sec(SS), -26)] + [W(sec(SS + cut(SS, x)), -27) for x in (52, 115, 250, 372)]
SFX += [("zipper", 50.55, -13, 3.3), P(51.2), P(53.6), P(55.1), P(59.6)]
# ---------------- 05 inflate (1985–2375)
IS = 1985
SFX += [W(sec(IS)), ("air_breath", sec(IS) - 0.5, -27, None), P(sec(IS + 4))] + [W(sec(IS + cut(IS, x)), -27) for x in (62, 198, 344)]
SFX += [("switch_click", 66.55, -14, 0.6), ("fan_running", 66.8, -22, 12.0), ("inflate", 67.6, -16, 8.6)]
SFX += [P(66.85), P(69.3), P(72.5, -24), P(78.0, -23), ("air_breath", 77.45, -19, None)]
# ---------------- finale (2375–2692)
SFX += [W(79.18), P(sec(2375 + 8), -23)] + [P(sec(2375) + k * 0.24, -30) for k in range(3)]
SFX += [W(81.83), ("fan_running", 81.9, -25, 4.4), P(sec(2455 + 22))]
SFX += [W(86.5), ("air_breath", 86.55, -18, None), P(sec(2595 + 22), -24)]

if __name__ == "__main__":
    F.main(sys.argv[1], sys.argv[2], sfx=SFX)
