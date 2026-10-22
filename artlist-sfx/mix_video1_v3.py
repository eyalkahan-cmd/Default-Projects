"""Video 1, v3: footsteps on verified strike frames + ambience cut to the visual transitions."""
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

# (surface, [strike times, s], extra gain dB) - every time checked on 25 fps foot close-ups
STEPS = [
    ("crawl",  [9.28, 9.56, 9.84], -2),                                   # baby crawling on the foam mat
    ("crawl",  [10.12, 10.44, 10.76, 11.04, 11.32, 11.60], -1),           # onto the rug, up to grandpa
    ("carpet", [17.86, 18.10], -4),                                       # small steps away from grandpa
    ("carpet", [18.92, 19.16, 19.40], 0),                                 # walking on the rug
    ("rubber", [19.62, 19.88, 20.16, 20.48, 20.84, 21.04], 0),            # playground rubber, barefoot
    ("rubber", [21.36], -4),                                              # stops at the swing
    ("rubber", [28.96], 2),                                               # first foot off the swing
    ("rubber", [29.04, 29.20, 29.36, 29.56, 29.72, 29.92, 30.08, 30.24], 0),  # running on rubber
    ("tile",   [30.40, 30.56, 30.72, 30.88, 31.06, 31.22, 31.40, 31.58, 31.76, 32.04, 32.24, 32.48], 0),  # marble
    ("tile",   [36.70, 36.96, 37.20, 37.40], -1),                         # gets up from the chair
    ("woodin", [50.56, 50.92], 0),                                        # hallway floor, shoes
    ("stone",  [51.28, 51.64, 52.04, 52.36, 52.68], 0),                   # stone entrance / landing
    ("stairs", [53.12, 53.56, 54.00, 54.36], 0),                          # down the stone steps
    ("stone",  [54.52], -7),                                              # crouches at the basket
    ("stairs", [57.60, 57.72, 57.88, 58.12], 0),                          # stands, steps down
    ("stone",  [58.40], 0),
    ("grass",  [58.64, 58.92, 59.20, 59.48, 59.76, 60.04, 60.32, 60.60, 60.88, 61.12], 0),  # garden turf
    ("ladder", [61.60, 61.92, 62.24, 62.52, 63.64, 64.10, 64.48, 65.32, 65.60, 65.96], 0),  # rungs, up and down
    ("grass",  [66.44], 1),                                               # off the ladder
    ("grass",  [66.60, 66.84, 67.08, 67.32, 67.52, 67.76, 68.00, 68.20, 68.44], 0),
    ("wet",    [68.64, 68.84, 69.04, 69.30, 69.56, 69.76, 70.04, 70.28, 70.48], 0),  # wet plaza
    ("wet",    [71.92, 72.12, 72.30, 72.48, 72.66, 72.86, 73.04, 73.24, 73.44, 73.64, 73.84, 74.04, 74.24], 0),
    ("deck",   [74.44, 74.64, 74.84, 75.04, 75.24, 75.48], 0),            # studio wooden floor
    ("deck",   [75.72, 76.36, 76.64, 76.96, 79.36, 79.64, 80.04], -7),    # kneels, crawls, lies, gets up
    ("deck",   [80.40, 80.72, 81.04], 0),                                 # runs off the deck
    ("grassrun", [81.32, 81.60, 81.84, 82.00, 82.12, 82.40, 82.62, 82.80, 83.00, 83.18], 0),  # lawn
    ("grass",  [83.36, 84.12, 84.40], -5),                                # crouch / small shifts
    ("grass",  [88.12, 88.36, 88.60, 88.80, 89.00, 89.26, 89.52, 89.80, 90.04, 90.28, 90.52], 0),
    ("dirt",   [90.76, 90.96, 91.20, 91.44, 91.68, 91.92, 92.16], 0),     # farm path
    ("woodin", [92.36, 92.60], 0),                                        # onto the mounting block
    ("dirt",   [97.62], 3),                                               # jumps off the pony
    ("dirt",   [97.86, 98.10, 98.34, 98.56, 98.78, 99.00, 99.20], 0),
    ("grass",  [99.42, 99.64, 99.84, 100.04, 100.26, 100.48], 0),         # into the field
    ("grass",  [100.72], -5),                                             # sits down
    ("grass",  [104.40], -6),                                             # gets up
    ("grassrun", [105.16, 105.44, 105.66, 105.86], 0),
    ("sand",   [106.08, 106.32, 106.56, 106.82, 107.00, 107.18, 107.32, 107.58, 107.84, 108.02], 0),  # beach
    ("sand",   [108.18], -3),                                             # kneels
]

# ambience: (clip, src_offset, fade_in_start, fade_in_end, fade_out_start, fade_out_end, target_mean_dB)
# fades sit exactly on the visual morph between locations
BEDS = [
    ("02_wind_howl",    0.0,   1.6,  2.5,   3.4,   4.4,  -31),  # entering the clouds
    ("04_city_amb",     10.0,  3.4,  3.9,   4.9,   5.5,  -33),  # aerial city
    ("05_room_tone",    0.0,   4.9,  5.5,  19.2,  19.8,  -38),  # living room
    ("18_garden_amb",   40.0, 19.2, 19.7,  30.1,  30.6,  -33),  # playground
    ("05_room_tone",    18.0, 30.1, 30.6,  51.1,  51.6,  -38),  # house interiors
    ("18_garden_amb",    0.0, 51.1, 51.6,  68.3,  68.8,  -33),  # front garden / park
    ("04_city_amb",     20.0, 59.2, 60.0,  68.3,  68.8,  -38),  # skyline appears behind the park
    ("22_rain_drip",     5.0, 68.3, 68.8,  74.2,  74.7,  -33),  # wet plaza
    ("05_room_tone",    45.0, 74.2, 74.7,  80.8,  81.4,  -38),  # studio
    ("18_garden_amb",   20.0, 80.8, 81.4,  90.6,  91.2,  -33),  # lawn
    ("28_country_amb",  20.0, 90.6, 91.2, 106.0, 107.0,  -32),  # farm and field
    ("30_waves",         3.0, 107.0, 108.0, 110.56, 110.56, -29),  # sea comes into view
    ("31_sand_dig",      0.0, 108.3, 108.6, 110.0, 110.56, -36),  # hands in the sand
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

steps_wav = os.path.join(S, "out", "v3_steps.wav")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2",
                "-i", "-", "-c:a", "pcm_s24le", steps_wav],
               input=track[: int(DUR * SR)].tobytes(), check=True)

# --- ambience + footsteps mix ---
LEVELS = {}
for line in open(os.path.join(S, "levels.txt")):
    n, m, p = line.split()
    LEVELS[n] = (float(m), float(p))

inputs, chains, labels = ["-i", steps_wav], ["[0:a]anull[st]"], ["[st]"]
for i, (clip, off, fi0, fi1, fo0, fo1, target) in enumerate(BEDS, 1):
    mean, peak = LEVELS[clip]
    gain = min(target - mean, -6.0 - peak)
    length = fo1 - fi0
    inputs += ["-i", os.path.join(SFX, clip + ".wav")]
    chains.append(
        f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,"
        f"atrim={off}:{off + length},asetpts=PTS-STARTPTS,volume={gain:.2f}dB,"
        f"afade=t=in:st=0:d={fi1 - fi0:.2f}:curve=qsin,"
        f"afade=t=out:st={fo0 - fi0:.3f}:d={max(fo1 - fo0, 0.01):.2f}:curve=qsin,"
        f"adelay={int(fi0 * 1000)}:all=1[b{i}]")
    labels.append(f"[b{i}]")

graph = ";".join(chains) + ";" + "".join(labels) + (
    f"amix=inputs={len(labels)}:normalize=0:dropout_transition=0,"
    f"apad=whole_dur={DUR},atrim=0:{DUR},"
    f"volume=2dB,afade=t=in:st=0:d=0.3,afade=t=out:st={DUR - 1.2}:d=1.2,"
    f"alimiter=limit=0.89:level=false[mix]")
open(os.path.join(S, "graph3.txt"), "w").write(graph)

stem = OUT.rsplit(".", 1)[0] + "_sfx_stem.wav"
subprocess.run(["ffmpeg", "-y", "-v", "error"] + inputs + [
    "-filter_complex_script", os.path.join(S, "graph3.txt"),
    "-map", "[mix]", "-c:a", "pcm_s24le", "-ar", "48000", stem], check=True)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", VIDEO, "-i", stem,
                "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                "-c:a", "aac", "-b:a", "320k", "-shortest", OUT], check=True)
print("done", OUT)
