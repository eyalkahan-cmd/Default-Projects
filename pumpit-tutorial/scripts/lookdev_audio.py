#!/usr/bin/env python3
"""Sound for the four look-development clips (CINEMATIC REBUILD 3.0).

Each clip gets: a bar-aligned slice of the electronic underscore (Artlist, user's plan),
untouched excerpts of the original voiceover placed on the picture beats (no time-stretch,
no pitch change, no regeneration), restrained SFX, speech-aware ducking, and a two-pass
loudnorm to -16 LUFS / -1.5 dBTP. Then muxes onto the silent Remotion render.

usage: lookdev_audio.py <silent_dir> <out_dir>
"""
import json
import subprocess
import sys
import numpy as np

SR = 48000
ROOT = "/home/user/Default-Projects/pumpit-tutorial"
MUSIC = f"{ROOT}/audio/music/house_call_instr.wav"
VOICE = f"{ROOT}/audio/Guide.mp3"
SFX = f"{ROOT}/assets_raw/sfx"
BEAT = 60 / 124
DROP1 = 31.34  # first drop of "House Call" (measured)
DROP2 = 123.99  # second drop

# clip: (duration s, music start s, [voice excerpts (src_in, src_out, at)], [sfx (file, at, gain dB, max len)])
CLIPS = {
    "LD1-Fan": (7.0, 96.0 + 0 * BEAT, [(6.35, 11.35, 0.9)], [
        ("fabric_whoosh", 2.2, -16, None),
        ("battery_click", 4.05, -20, 0.4),
    ]),
    "LD2-Seal": (9.0, DROP1 + 4 * BEAT * 1, [(50.51, 53.89, 0.45), (63.27, 65.83, 6.1)], [
        ("zipper", 0.6, -12, 3.3),
        ("fabric_whoosh", 6.0, -18, None),
        ("battery_click", 3.93, -22, 0.4),
    ]),
    # drop lands on the pressure snap (frame 192 = 6.4 s)
    "LD3-Inflate": (9.0, DROP2 - 6.4, [(66.45, 68.59, 0.3), (69.19, 72.39, 2.7), (75.82, 77.93, 6.55)], [
        ("switch_click", 0.85, -14, 0.6),
        ("fan_running", 1.0, -20, 8.0),
        ("inflate", 1.1, -15, 5.6),
        ("pop", 6.35, -20, None),
    ]),
    # drop lands as the USB plug seats (frame 132 = 4.4 s)
    "LD4-Flow": (10.0, DROP1 - 4.4, [(11.91, 16.31, 5.0)], [
        ("whoosh", 0.0, -20, None),
        ("battery_click", 4.38, -12, 0.6),
        ("fabric_whoosh", 5.0, -22, None),
        ("whoosh", 6.75, -22, None),
    ]),
}


def load(path, start=0.0, dur=None):
    cmd = ["ffmpeg", "-v", "error", "-ss", str(start), "-i", path]
    if dur:
        cmd += ["-t", str(dur)]
    cmd += ["-ac", "2", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()


def place(buf, x, at, gain_db=0.0):
    i = int(at * SR)
    n = min(len(x), len(buf) - i)
    if n > 0:
        buf[i : i + n] += x[:n] * 10 ** (gain_db / 20)


def fade(x, fin, fout):
    a, b = int(fin * SR), int(fout * SR)
    if a:
        x[:a] *= np.linspace(0, 1, a)[:, None]
    if b:
        x[-b:] *= np.linspace(1, 0, b)[:, None]
    return x


def build(name, dur, mstart, vo, sfx):
    n = int(dur * SR)
    music = fade(load(MUSIC, mstart, dur)[:n], 0.25, 0.9)
    voice = np.zeros((n, 2), np.float32)
    for a, b, at in vo:
        place(voice, fade(load(VOICE, a, b - a), 0.02, 0.06), at)
    fx = np.zeros((n, 2), np.float32)
    for f, at, g, mx in sfx:
        s = load(f"{SFX}/{f}.wav", 0, mx)
        place(fx, fade(s, 0.01, min(0.3, len(s) / SR / 3)), at, g)
    # speech-aware ducking: 30 ms envelope, 6 dB under speech, 150 ms attack / 400 ms release
    env = np.sqrt(np.convolve(voice[:, 0] ** 2, np.ones(1440) / 1440, "same"))
    active = (env > 0.01).astype(np.float32)
    duck = np.empty_like(active)
    ka, kr = 1 - np.exp(-1 / (SR * 0.15)), 1 - np.exp(-1 / (SR * 0.4))
    g = 0.0
    for i in range(len(active)):
        g += (active[i] - g) * (ka if active[i] > g else kr)
        duck[i] = g
    mg = 10 ** ((-17 - 6 * duck) / 20)
    mix = music * mg[:, None] + voice + fx
    return mix


def loudnorm(raw, out):
    args = "I=-16:TP=-1.5:LRA=11"
    m = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", f"loudnorm={args}:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    j = json.loads(m[m.rindex("{") : m.rindex("}") + 1])
    af = (f"loudnorm={args}:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
          f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,alimiter=limit=0.8:level=false")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", af, "-ar", str(SR), out], check=True)


def main(silent_dir, out_dir):
    for name, (dur, mstart, vo, sfx) in CLIPS.items():
        mix = build(name, dur, mstart, vo, sfx)
        raw = f"{out_dir}/{name}.f32"
        mix.astype(np.float32).tofile(raw)
        wav = f"{out_dir}/{name}.wav"
        loudnorm(raw, wav)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{silent_dir}/{name}.silent.mp4", "-i", wav, "-map", "0:v", "-map", "1:a",
                        "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2", "-shortest", "-movflags", "+faststart",
                        f"{out_dir}/{name}.mp4"], check=True)
        print("ok", name)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
