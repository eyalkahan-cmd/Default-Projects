"""Video 1, v2: frame-synced footsteps per surface + ambience beds only."""
import subprocess, sys, os, random
import numpy as np
from steps_lib import slices, SR

S = os.path.dirname(os.path.abspath(__file__))
SFX = os.path.join(S, "sfx")
VIDEO, OUT = sys.argv[1], sys.argv[2]
DUR = 110.56
random.seed(7)

# surface -> (recording, peak dBFS per step, playback-rate for a lighter child foot)
SURF = {
    "crawl":   ("crawl_carpet", -27, 1.10),
    "carpet":  ("carpet_bare",  -21, 1.12),
    "rubber":  ("rubber_bare",  -19, 1.15),
    "tile":    ("tile_bare",    -18, 1.15),
    "woodin":  ("wood_indoor",  -19, 1.12),
    "stone":   ("stone_sneak",  -18, 1.12),
    "stairs":  ("stone_stairs", -17, 1.10),
    "grass":   ("grass_walk",   -19, 1.10),
    "grassrun":("grass_run",    -18, 1.08),
    "ladder":  ("ladder_wood",  -23, 1.10),
    "wet":     ("wet",          -17, 1.10),
    "deck":    ("wood_deck",    -19, 1.12),
    "dirt":    ("dirt",         -18, 1.10),
    "hoof":    ("horse_walk",   -20, 1.00),
    "sand":    ("sand_bare",    -18, 1.10),
}

# (surface, [step times in seconds], extra gain dB) - times read off 10 fps frame sheets
STEPS = [
    ("crawl",  [8.6, 9.0, 9.4, 9.8], 0),                                   # foam play mat
    ("crawl",  [10.3, 10.65, 11.0, 11.35, 11.7], -1),                     # onto the rug
    ("carpet", [17.6, 17.9, 18.2, 18.5, 18.8], 0),                        # barefoot on rug
    ("rubber", [19.1, 19.4, 19.7, 20.0, 20.3, 20.6, 20.9, 21.2, 21.5], 0),  # playground rubber
    ("rubber", [28.95], 3),                                               # hop off the swing
    ("rubber", [29.25, 29.5, 29.75, 30.0, 30.25], 0),
    ("tile",   [30.5, 30.75, 31.0, 31.3, 31.6, 31.9, 32.2], 0),           # marble floor, barefoot
    ("tile",   [36.6, 36.9, 37.15, 37.4], -1),
    ("woodin", [50.4, 50.75, 51.05], 0),                                  # shoes, hallway
    ("stone",  [51.35, 51.65, 51.95, 52.25, 52.55, 52.85], 0),            # stone entrance
    ("stairs", [53.15, 53.5, 53.85, 54.2], 0),                            # down the steps
    ("stone",  [54.5], -6),                                               # crouch shuffle
    ("stone",  [57.35], -5),                                              # stands up
    ("stairs", [57.5, 57.8, 58.1], 0),
    ("stone",  [58.4, 58.7], 0),
    ("grass",  [59.0, 59.3, 59.6, 59.9, 60.2, 60.5, 60.8, 61.1], 0),      # garden lawn
    ("ladder", [61.6, 62.3, 63.4, 64.1, 64.6, 65.2, 65.9, 66.3], 0),      # wooden rungs
    ("grass",  [66.55], 2),                                               # jumps down
    ("grass",  [66.85, 67.15, 67.45, 67.75, 68.05, 68.35], 0),
    ("wet",    [68.7, 69.05, 69.4, 69.75, 70.1, 70.4], 0),                # wet plaza
    ("wet",    [71.75, 72.1, 72.45, 72.8, 73.15, 73.5, 73.85, 74.2, 74.55], 0),
    ("deck",   [74.9, 75.2, 75.5], 0),                                    # wooden studio floor
    ("deck",   [75.75, 76.3, 76.6, 77.0], -6),                            # kneels, hands, lies down
    ("deck",   [79.35, 79.6, 80.0], -5),
    ("deck",   [80.4, 80.75], 0),
    ("grassrun", [81.1, 81.4, 81.7, 82.0, 82.3, 82.6, 82.9, 83.15], 0),   # runs across the lawn
    ("grass",  [83.4, 84.1, 84.4, 85.0, 86.5, 87.6], -5),                 # small shifts while playing
    ("grass",  [88.15, 88.45, 88.75, 89.05, 89.35, 89.65, 89.95], 0),
    ("dirt",   [90.25, 90.55, 90.85, 91.15, 91.45, 91.75, 92.05, 92.3], 0),  # farm path
    ("woodin", [92.6, 93.0], 0),                                          # onto the mounting block
    ("hoof",   [94.2, 94.8, 95.5, 96.4], 0),                              # pony shifting its weight
    ("dirt",   [97.6], 3),                                                # jumps off
    ("dirt",   [97.85, 98.15, 98.45, 98.75], 0),
    ("grass",  [99.0, 99.3, 99.6, 99.9, 100.2, 100.5], 0),
    ("grass",  [101.3, 104.3], -4),                                       # sits down / gets up
    ("grassrun", [105.2, 105.5, 105.8], 0),
    ("sand",   [106.1, 106.4, 106.7, 107.0, 107.3, 107.6, 107.9], 0),     # beach sand
    ("sand",   [108.15], -3),                                             # kneels
]

# ambience beds: (clip, start, src_offset, length, target_mean_dB, fade_in, fade_out)
BEDS = [
    ("02_wind_howl",      0.4,  0,   5.0,  -31, 1.2, 1.6),   # air rushing during the descent
    ("04_city_amb",       3.0,  10,  3.8,  -33, 1.0, 1.6),
    ("05_room_tone",      4.6,  0,   15.6, -38, 1.5, 2.0),
    ("18_garden_amb",    18.4,  40,  12.8, -33, 2.0, 2.2),   # playground: birds, leaves, far traffic
    ("05_room_tone",     29.3,  18,  22.0, -38, 2.0, 1.8),
    ("17_door",          50.1,  0,   2.2,  -34, 0.05, 0.9),
    ("18_garden_amb",    50.4,  0,   18.4, -33, 2.0, 2.2),
    ("22_rain_drip",     66.8,  5,   8.8,  -33, 2.0, 2.0),
    ("05_room_tone",     73.6,  45,  8.2,  -38, 1.5, 1.6),
    ("18_garden_amb",    80.4,  20,  11.6, -33, 2.0, 2.2),
    ("28_country_amb",   89.8,  20,  16.4, -32, 2.0, 2.2),
    ("30_waves",        104.2,  3,   6.36, -29, 2.0, 1.2),
    ("31_sand_dig",     108.3,  0,   2.4,  -35, 0.3, 0.9),
]


def speed(x, rate):
    if rate == 1.0:
        return x
    idx = np.arange(0, len(x) - 1, rate)
    return np.interp(idx, np.arange(len(x)), x).astype(np.float32)


# --- footsteps track ---
lib = {}
for surf, (rec, _, rate) in SURF.items():
    hits = slices(rec)
    # keep the middle of the loudness range: no scuffs, no stomps
    hits.sort(key=lambda h: np.sqrt(np.mean(h[: int(0.08 * SR)] ** 2)))
    k = len(hits)
    lib[surf] = [speed(h, rate) for h in hits[k // 5: k - k // 5] or hits]

track = np.zeros((int(DUR * SR) + SR, 2), dtype=np.float32)
for surf, times, extra in STEPS:
    peak_db = SURF[surf][1] + extra
    pool, last = lib[surf], None
    for n, t in enumerate(times):
        h = random.choice([p for p in pool if p is not last] or pool)
        last = h
        g = 10 ** ((peak_db + 6 + random.uniform(-1.5, 1.5)) / 20)  # steps lead the mix
        pan = 0.5 + random.uniform(-0.08, 0.08)
        i = int(t * SR)
        seg = h[: len(track) - i] * g
        track[i: i + len(seg), 0] += seg * np.sqrt(1 - pan)
        track[i: i + len(seg), 1] += seg * np.sqrt(pan)

steps_wav = os.path.join(S, "out", "v2_steps.wav")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2",
                "-i", "-", "-c:a", "pcm_s24le", steps_wav],
               input=track[: int(DUR * SR)].tobytes(), check=True)

# --- ambience + footsteps mix ---
LEVELS = {}
for line in open(os.path.join(S, "levels.txt")):
    n, m, p = line.split()
    LEVELS[n] = (float(m), float(p))

inputs, chains, labels = ["-i", steps_wav], ["[0:a]anull[st]"], ["[st]"]
for i, (clip, start, off, length, target, fin, fout) in enumerate(BEDS, 1):
    mean, peak = LEVELS[clip]
    gain = min(target - mean, -6.0 - peak)
    inputs += ["-i", os.path.join(SFX, clip + ".wav")]
    chains.append(
        f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,"
        f"atrim={off}:{off + length},asetpts=PTS-STARTPTS,volume={gain:.2f}dB,"
        f"afade=t=in:st=0:d={fin},afade=t=out:st={max(length - fout, 0):.3f}:d={fout},"
        f"adelay={int(start * 1000)}:all=1[b{i}]")
    labels.append(f"[b{i}]")

graph = ";".join(chains) + ";" + "".join(labels) + (
    f"amix=inputs={len(labels)}:normalize=0:dropout_transition=0,"
    f"apad=whole_dur={DUR},atrim=0:{DUR},"
    f"volume=2dB,afade=t=in:st=0:d=0.3,afade=t=out:st={DUR - 1.2}:d=1.2,"
    f"alimiter=limit=0.89:level=false[mix]")
open(os.path.join(S, "graph2.txt"), "w").write(graph)

stem = OUT.rsplit(".", 1)[0] + "_sfx_stem.wav"
subprocess.run(["ffmpeg", "-y", "-v", "error"] + inputs + [
    "-filter_complex_script", os.path.join(S, "graph2.txt"),
    "-map", "[mix]", "-c:a", "pcm_s24le", "-ar", "48000", stem], check=True)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", VIDEO, "-i", stem,
                "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                "-c:a", "aac", "-b:a", "320k", "-shortest", OUT], check=True)
print("done", OUT)
