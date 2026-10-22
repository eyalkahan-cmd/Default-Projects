#!/usr/bin/env python3
"""Soundtrack for the v3 film (89.73 s).

- Voiceover: audio/Guide_v2.mp3, untouched.
- Music: "Blissful Land" (Raz Burg, Artlist), time-stretched 122 → 124 BPM (pitch kept, rubberband)
  so its beats sit exactly on the film's cut grid (0.3 + n · BEAT frames), with a gentle 700 Hz dip
  for the voice. The slice is placed so the track's full re-entry lands on beat 160 (77.43 s),
  just ahead of "וזהו!"; its breakdown falls under "נכנסים לתחפושת" (~31 s).
- SFX: every event below is derived from the composition code (scene starts, retime maps, shot cuts,
  callout / kinetic-word starts), so each sound lands on its picture frame. UI accents use a soft,
  non-tonal air puff (no beeps).

usage: film_audio_v3.py <silent.mp4> <out.mp4>
"""
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import film_audio as F  # noqa: E402

FPS = 30
BEAT = 60 / 124 * FPS
ROOT = "/home/user/Default-Projects/pumpit-tutorial"
MUSIC = f"{ROOT}/audio/music/blissful_land_124.wav"
DROP = 139.094  # full re-entry (downbeat) in the stretched track, measured on the kick grid
GRID_DROP = (0.3 + 160 * BEAT) / FPS  # 77.43 s, on the film beat grid
MUSIC_IN = DROP - GRID_DROP


def snap(f):
    """beatSnap() in motion.tsx"""
    return round(round((f - 0.3) / BEAT) * BEAT + 0.3)


def cut(start, local):
    """cutOnBeat() in motion.tsx"""
    return snap(start + local) - start


def s(x):
    return round(x * FPS)


def inv(src, dst, e):
    """film-local frame at which a piecewise-linear retime (src → dst) first reaches child frame e"""
    for i in range(len(src) - 1):
        a, b = dst[i], dst[i + 1]
        if b > a and a <= e <= b:
            return src[i] + (e - a) / (b - a) * (src[i + 1] - src[i])
    return None


def t(f):
    return f / FPS


SC = dict(opening=0, fan=s(6.4), power=s(11.96), connect=s(25.58), wear=s(30.58), leak=s(42.04), seal=s(50.24), inflate=s(66.18), lineup=s(79.18), keep=s(81.83), end=s(86.5))

# sound palette: (file, peak offset in the file s, default gain)
W = lambda f, g=-24: ("air_whoosh", t(f) - 0.55, g, None)  # noqa: E731  transition / camera move (peak ~0.55 s in)
Wc = lambda f: W(f, -30)  # noqa: E731  hard cut inside a scene: a breath of air only
P = lambda f, g=-25: ("soft_puff", t(f) - 0.004, g, None)  # noqa: E731  callout / word puffs in
PB = lambda f: P(f, -20)  # noqa: E731  big kinetic word / hero puff

SFX = []
# ---------------- OPENING (0–192): cover-flow steps one card per beat from frame 8 (move = 55% of a beat)
O = SC["opening"]
SFX += [("air_whoosh", max(0.0, t(O + 8 + k * BEAT + 4) - 0.55), -32, None) for k in range(7)]
SFX += [PB(O + 14), PB(O + 60)]  # kinetic lines
SFX += [("fabric_whoosh", t(O + 104), -21, None)]  # zoom-through (104–116)
SFX += [PB(O + 116), P(O + 122), P(O + 122 + BEAT), P(O + 122 + 2 * BEAT, -27)]  # hero + title words
SFX += [("soft_puff", t(O + 126 + 2 * BEAT + i * 3), -33, None) for i in range(5)]  # five step dots
SFX += [W(SC["fan"])]  # zoom out → 01

# ---------------- 01 FAN (192–359)
Fn = SC["fan"]
A, B, Cc = 44, 92, 130
SFX += [P(Fn + 9)]  # fan-opening dot + callout
SFX += [W(Fn + A, -25)]  # zoom into the opening
SFX += [P(Fn + A + inv([0, B - A], [22, 98], 40))]  # "הפתח הייעודי"
SFX += [Wc(Fn + B), P(Fn + B + inv([0, Cc - B], [104, 152], 124))]  # low orbit · "המאוורר"
SFX += [W(Fn + Cc, -26), P(Fn + Cc + inv([0, 167 - Cc], [158, 210], 168))]  # whip · "כבל המאוורר"
SFX += [W(SC["power"])]  # whip → 02

# ---------------- 02 POWER (359–767)
Pw = SC["power"]
S_ = dict(top=0, macro=38, hero=82, split=132, bank=204, usb=278)
SFX += [("battery_click", t(Pw + f) - 0.01, -20, 0.35) for f in (26, 43, 60, 77)]
SFX += [Wc(Pw + S_[k]) for k in ("macro", "hero", "split", "bank", "usb")]
SFX += [PB(Pw + S_["hero"] + 4)]  # "AA"
SFX += [P(Pw + S_["split"] + 10, -21), P(Pw + S_["split"] + 22)]  # "או" bubble · Power Bank callout
SFX += [PB(Pw + S_["bank"] + 6)]  # "Power Bank"
SFX += [("air_whoosh", t(Pw + S_["usb"] + 8) - 0.55, -31, None)]  # plug drops in
SFX += [P(Pw + S_["usb"] + 30), ("plastic_snap", t(Pw + S_["usb"] + 38) - 0.01, -16, None)]  # callout · seats
SFX += [W(SC["connect"])]  # whip → connect

# ---------------- CONNECT (767–917)
Cn = SC["connect"]
seat = 52 + (132 - 84) / (150 - 84) * (150 - 52)
SFX += [W(Cn + 52, -26)]  # whip to the port
SFX += [P(Cn + 52 + inv([0, 98], [84, 150], 104))]  # "מחברים לקופסת הסוללות"
SFX += [("plastic_snap", t(Cn + seat) - 0.01, -15, None)]
SFX += [W(SC["wear"])]  # zoom → 03

# ---------------- 03 WEAR (917–1261)
Wr = SC["wear"]
a, p1, p2, p3 = cut(Wr, 60), cut(Wr, 182), cut(Wr, 224), cut(Wr, 286)
SFX += [PB(Wr + 14)]  # "נכנסים לתחפושת"
SFX += [Wc(Wr + a)]
SFX += [W(Wr + 120, -26), ("fabric_whoosh", t(Wr + 120 + 22), -21, None)]  # whip · pack slides into the pocket (8–70)
SFX += [P(Wr + 120 + 40)]  # "בכיס הפנימי"
SFX += [Wc(Wr + p1), W(Wr + p2, -27), Wc(Wr + p3)]
SFX += [P(Wr + 120 + 176), ("plastic_snap", t(Wr + 120 + 205) - 0.01, -15, None)]  # clip callout · clips on
SFX += [W(SC["leak"])]  # whip → 04

# ---------------- 04 SEAL · air leak (1261–1507)
Lk = SC["leak"]
b = cut(Lk, 166)
SFX += [P(Lk + 4, -24), PB(Lk + 6), ("air_breath", t(Lk + 16), -27, None)]  # "עכשיו" · title · accent bar
SFX += [("air_breath", t(Lk + 104), -22, None), ("air_breath", t(Lk + 150), -25, None)]  # air escaping
SFX += [P(Lk + 120)]  # "בריחת אוויר"
SFX += [W(Lk + b, -26), ("air_breath", t(Lk + b + 6), -25, None)]  # zoom to the cuff

# ---------------- 04 SEAL · zipper / elastics / cord lock (1507–1985)
Se = SC["seal"]
SRC = [0, s(3.38), s(3.82), s(8.34), s(9.26), s(12.76), s(15.32), s(15.94)]
DST = [0, 118, 128, 180, 184, 236, 270, 270]
c1, c2, c3, c4 = cut(Se, 52), cut(Se, SRC[2]), cut(Se, SRC[3]), cut(Se, s(12.4))
cE = cut(Se, round((c2 + c3) / 2))
zip_on = inv(SRC, DST, 18)
zip_off = inv(SRC, DST, 118)
SFX += [("zipper", t(Se + zip_on), -13, t(zip_off - zip_on) + 0.15)]
SFX += [Wc(Se + c1), P(Se + c1 + 3 / (118 / SRC[1]))]  # follow shot · zipper label
SFX += [P(Se + inv(SRC, DST, 116), -27)]  # "עד הסוף"
SFX += [W(Se + c2, -26), Wc(Se + cE), P(Se + cE + 3 * (SRC[3] - SRC[2]) / (DST[3] - DST[2]))]  # elastics · cuff · label
SFX += [W(Se + c3, -26), ("fabric_whoosh", t(Se + inv(SRC, DST, 182)), -24, None)]  # lock macro · cord lock slides
SFX += [P(Se + inv(SRC, DST, 186))]  # "מהדקים בעדינות"
SFX += [Wc(Se + c4), P(Se + inv(SRC, DST, 232), -27)]  # fit ring · "✓ נוח"
SFX += [W(SC["inflate"])]  # zoom → 05

# ---------------- 05 INFLATE (1985–2375)
In = SC["inflate"]
ISRC, IDST = [0, s(6.33), s(11.48), s(13.0)], [0, 150, 192, 270]
i1, i2, i3 = cut(In, 62), cut(In, 198), cut(In, ISRC[2])
sw = inv(ISRC, IDST, 8)
SFX += [("switch_click", t(In + sw) - 0.02, -14, 0.6), P(In + sw, -26)]  # switch on · "מפעילים את המאוורר"
SFX += [("fan_running", t(In + sw) + 0.1, -22, 12.0), ("inflate", t(In + inv(ISRC, IDST, 34)), -16, 8.6)]
SFX += [W(In + i1, -27), P(In + inv(ISRC, IDST, 66))]  # wide · "האוויר זורם פנימה"
SFX += [Wc(In + i2), P(In + inv(ISRC, IDST, 150), -23)]  # low hero · time card
SFX += [W(In + i3, -26), ("air_breath", t(In + inv(ISRC, IDST, 195)) - 0.25, -19, None)]  # full size: taut snap
SFX += [PB(In + inv(ISRC, IDST, 212))]  # "למלוא גודלה"
SFX += [W(SC["lineup"])]  # whip → line-up

# ---------------- FINALE
Ln = SC["lineup"]
SFX += [P(Ln + round(k * BEAT / 2), -23) for k in range(3)] + [PB(Ln + 8)]
SFX += [W(SC["keep"])]
Kp = SC["keep"]
SFX += [("fan_running", t(Kp) + 0.1, -25, 4.4), ("air_breath", t(Kp + 6), -27, None), P(Kp + 14)]
SFX += [W(SC["end"]), ("air_breath", t(SC["end"] + 4) - 0.1, -18, None), P(SC["end"] + 22, -24)]

if __name__ == "__main__":
    if "--list" in sys.argv:
        for e in sorted(SFX, key=lambda e: e[1]):
            print(f"{e[1]:7.2f}  {e[0]:14s} {e[2]:4d}")
        print("events", len(SFX), "music in", round(MUSIC_IN, 3))
        sys.exit()
    F.main(sys.argv[1], sys.argv[2], sfx=SFX, music_path=MUSIC, music_in=MUSIC_IN, full_size=GRID_DROP)
