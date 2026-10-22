"""Build the SFX mix for video 1 and mux it onto the picture."""
import subprocess, sys, os

S = os.path.dirname(os.path.abspath(__file__))
SFX = os.path.join(S, "sfx")
VIDEO = sys.argv[1]
OUT = sys.argv[2]
DUR = 110.56

# measured (mean_dB, peak_dB) per clip
LEVELS = {}
for line in open(os.path.join(S, "levels.txt")):
    n, m, p = line.split()
    LEVELS[n] = (float(m), float(p))

# (clip, start_in_video, src_offset, length, target_mean_dB, fade_in, fade_out)
CUES = [
    # 0-5s  Earth -> clouds -> city dive
    ("01_space_whoosh",   0.2,  0,   1.05, -24, 0.3, 0.3),
    ("02_wind_howl",      0.7,  0,   4.8,  -24, 1.0, 1.4),
    ("04_city_amb",       3.0,  10,  3.8,  -34, 1.0, 1.6),
    ("03_soft_gust",      3.6,  0,   2.6,  -27, 0.4, 1.0),
    # 5-18.5s  play mat, crawl to grandpa, sofa
    ("05_room_tone",      4.6,  0,   15.6, -38, 1.5, 2.0),
    ("06_toy_rattle",     5.9,  0,   3.0,  -29, 0.2, 0.8),
    ("08_baby_giggle",    7.1,  0,   2.3,  -25, 0.1, 0.5),
    ("07_toy_box",        8.2,  0,   2.6,  -31, 0.2, 0.8),
    ("09_kid_laugh",     13.3,  0,   1.5,  -26, 0.05, 0.4),
    ("10_grandpa_laugh", 14.1,  0,   1.75, -28, 0.05, 0.5),
    ("08_baby_giggle",   16.0,  0,   2.3,  -27, 0.1, 0.6),
    # 18.5-29.5s  run out -> playground swing
    ("33_whoosh_airy",   18.0,  0,   3.0,  -31, 0.5, 1.0),
    ("11_playground_amb",18.4,  30,  13.0, -33, 2.0, 2.2),
    ("12_swing_creak",   22.0,  0,   7.5,  -33, 0.6, 1.2),
    ("13_toddler_laugh", 23.3,  0,   0.78, -25, 0.03, 0.3),
    ("13_toddler_laugh", 24.9,  0,   0.78, -27, 0.03, 0.3),
    ("09_kid_laugh",     26.6,  0,   1.5,  -27, 0.05, 0.4),
    # 29.5-50s  balloons, newborn twins, leather couch
    ("05_room_tone",     29.3,  18,  22.0, -38, 2.0, 1.8),
    ("14_balloon",       31.4,  2,   5.2,  -32, 0.4, 1.0),
    ("32_whoosh_wave",   36.4,  0,   3.0,  -33, 0.5, 1.0),
    ("15_baby_coo",      39.4,  0,   3.0,  -30, 0.2, 0.6),
    ("09_kid_laugh",     40.5,  0,   1.5,  -28, 0.05, 0.4),
    ("15_baby_coo",      42.2,  0.6, 2.3,  -32, 0.2, 0.7),
    ("16_leather",       44.6,  0,   5.0,  -33, 0.4, 1.2),
    # 50-58s  front door, stone steps, basket
    ("17_door",          50.1,  0,   2.2,  -31, 0.05, 0.9),
    ("18_garden_amb",    50.4,  0,   18.4, -33, 2.0, 2.2),
    ("19_basket",        54.2,  0,   4.0,  -31, 0.2, 0.8),
    # 58-68s  park, ladder
    ("33_whoosh_airy",   57.6,  0,   3.0,  -33, 0.5, 1.0),
    ("20_ladder_creak",  61.4,  0,   2.7,  -31, 0.1, 0.6),
    ("20_ladder_creak",  63.7,  0,   2.7,  -33, 0.1, 0.6),
    # 67.5-74s  wet plaza
    ("22_rain_drip",     66.8,  5,   8.8,  -34, 2.0, 2.0),
    ("21_wet_steps",     68.0,  2,   6.4,  -31, 0.6, 1.2),
    # 74-80.5s  wooden studio with the twins
    ("05_room_tone",     73.6,  45,  8.2,  -39, 1.5, 1.6),
    ("23_wood_floor",    75.1,  0,   2.4,  -33, 0.1, 0.6),
    ("24_kids_laugh",    76.5,  0,   4.0,  -30, 0.3, 1.0),
    ("23_wood_floor",    78.8,  0,   2.4,  -34, 0.1, 0.6),
    # 80.5-90.5s  firefighter in the garden
    ("32_whoosh_wave",   79.9,  0,   3.0,  -33, 0.5, 1.0),
    ("18_garden_amb",    80.4,  20,  11.6, -33, 2.0, 2.2),
    ("29_grass_run",     80.6,  0,   2.0,  -32, 0.2, 0.6),
    ("25_fire_siren",    82.6,  0,   6.0,  -34, 0.6, 1.6),
    ("29_grass_run",     88.7,  1,   2.8,  -32, 0.3, 0.8),
    # 90.5-98s  pony farm
    ("28_country_amb",   89.8,  20,  16.4, -32, 2.0, 2.2),
    ("26_horse_snort",   91.8,  0,   3.0,  -28, 0.05, 0.6),
    ("27_horse_nicker",  95.1,  0,   1.75, -28, 0.05, 0.5),
    ("26_horse_snort",   97.3,  0,   3.0,  -30, 0.05, 0.8),
    # 98-105.5s  grass
    ("29_grass_run",     98.3,  3,   2.8,  -31, 0.3, 0.8),
    ("09_kid_laugh",    101.9,  0,   1.5,  -28, 0.05, 0.4),
    ("29_grass_run",    104.0,  6,   2.2,  -32, 0.3, 0.8),
    # 105.5-110.5s  beach
    ("30_waves",        104.2,  3,   6.36, -29, 2.0, 1.2),
    ("31_sand_dig",     106.8,  0,   3.6,  -30, 0.3, 1.0),
    ("13_toddler_laugh",109.0,  0,   0.78, -28, 0.03, 0.3),
]

inputs, chains, labels = [], [], []
for i, (clip, start, off, length, target, fin, fout) in enumerate(CUES):
    mean, peak = LEVELS[clip]
    gain = min(target - mean, -3.0 - peak)  # hit target loudness but never clip
    inputs += ["-i", os.path.join(SFX, clip + ".wav")]
    fo_start = max(length - fout, 0)
    chains.append(
        f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,"
        f"atrim={off}:{off + length},asetpts=PTS-STARTPTS,"
        f"volume={gain:.2f}dB,"
        f"afade=t=in:st=0:d={fin},afade=t=out:st={fo_start:.3f}:d={fout},"
        f"adelay={int(start * 1000)}:all=1[c{i}]"
    )
    labels.append(f"[c{i}]")

n = len(CUES)
graph = ";".join(chains) + ";" + "".join(labels) + (
    f"amix=inputs={n}:normalize=0:dropout_transition=0,"
    f"apad=whole_dur={DUR},atrim=0:{DUR},"
    f"afade=t=in:st=0:d=0.2,afade=t=out:st={DUR - 1.2}:d=1.2,"
    f"alimiter=limit=0.89:level=false[mix]"
)
open(os.path.join(S, "graph1.txt"), "w").write(graph)

stem = OUT.rsplit(".", 1)[0] + "_sfx_stem.wav"
# render the SFX mix as a 24-bit WAV stem, then lay it under the untouched picture
subprocess.run(["ffmpeg", "-y", "-v", "error"] + inputs + [
    "-filter_complex_script", os.path.join(S, "graph1.txt"),
    "-map", "[mix]", "-c:a", "pcm_s24le", "-ar", "48000", stem,
], check=True)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", VIDEO, "-i", stem,
                "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                "-c:a", "aac", "-b:a", "320k", "-shortest", OUT], check=True)
print("done", OUT)
