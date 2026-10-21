#!/usr/bin/env python3
"""Soundtrack for the v2 style test (0–30.58 s): same mix as the film, SFX re-timed to the v2 cut."""
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import film_audio as F  # noqa: E402

BEAT = 60 / 124
SFX = [
    # carousel steps (one per beat from 0.27 s) and the zoom-through to the title
    *[("whoosh", 0.27 + BEAT * k + 0.05, -27, None) for k in range(7)],
    ("fabric_whoosh", 3.55, -20, None),
    # 01: zoom into the opening, whip to the cable
    ("whoosh", 7.75, -22, None), ("whoosh", 10.68, -22, None), ("whoosh", 11.75, -21, None),
    # 02: cells seat (local 26 + 17 i), "או" pop, power bank, USB plug seats (local 362)
    ("battery_click", 12.83, -21, 0.35), ("battery_click", 13.40, -21, 0.35), ("battery_click", 13.97, -21, 0.35), ("battery_click", 14.53, -21, 0.35),
    ("pop", 16.7, -24, None), ("whoosh", 18.7, -24, None), ("whoosh", 21.2, -24, None),
    ("battery_click", 24.03, -15, 0.5),
    # connect: whip from the blower to the box, plug seats
    ("whoosh", 25.4, -22, None), ("whoosh", 27.1, -22, None), ("battery_click", 29.67, -14, 0.5),
]

if __name__ == "__main__":
    F.main(sys.argv[1], sys.argv[2], sfx=SFX, dur=30.58)
