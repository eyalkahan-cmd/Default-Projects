#!/usr/bin/env python3
"""Soundtrack for the v2 style test (0–30.58 s): same mix as the film, SFX re-timed to the v2 cut."""
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import film_audio as F  # noqa: E402

BEAT = 60 / 124
SFX = [
    # --- transitions: an air whoosh on every whip/zoom, a short air hiss leading into each chapter
    ("whoosh", 6.18, -21, None), ("inflate", 5.7, -27, 0.55),
    ("whoosh", 7.72, -22, None), ("whoosh", 9.42, -26, None), ("whoosh", 10.6, -22, None),
    ("whoosh", 11.78, -21, None), ("inflate", 11.3, -27, 0.55),
    ("whoosh", 13.2, -27, None), ("whoosh", 14.66, -26, None), ("whoosh", 16.33, -25, None), ("whoosh", 18.73, -25, None), ("whoosh", 21.2, -25, None),
    ("whoosh", 25.42, -21, None), ("inflate", 24.95, -27, 0.55), ("whoosh", 27.18, -22, None),
    # carousel steps (one per beat from 0.27 s) and the zoom-through to the title
    *[("whoosh", 0.27 + BEAT * k + 0.05, -28, None) for k in range(7)],
    ("fabric_whoosh", 3.55, -20, None),
    # --- puff-ins: a soft balloon pop for every graphic that inflates onto the screen
    *[("pop", t, -29, 0.35) for t in [0.47, 2.0, 4.07, 4.55, 5.03, 6.53, 7.0, 8.4, 10.2, 11.17, 12.09, 14.83, 17.37, 18.97, 23.37, 28.7]],
    ("pop", 16.7, -24, 0.4),
    # --- mechanics: cells seat (local 26 + 17 i), USB plug seats in the power bank and the box
    ("battery_click", 12.83, -21, 0.35), ("battery_click", 13.40, -21, 0.35), ("battery_click", 13.97, -21, 0.35), ("battery_click", 14.53, -21, 0.35),
    ("battery_click", 23.5, -15, 0.5), ("battery_click", 29.67, -14, 0.5),
]

if __name__ == "__main__":
    F.main(sys.argv[1], sys.argv[2], sfx=SFX, dur=30.58)
