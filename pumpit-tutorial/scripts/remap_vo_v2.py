#!/usr/bin/env python3
"""Re-time all voiceover data to the corrected voiceover (audio/Guide_v2.mp3).

The client removed a doubled "ה-" before "USB" (~21.9 s). Measured by windowed
cross-correlation of v1 vs v2 (1 s windows, r 0.5-0.9 throughout):
  v1 t < CUT_IN   -> v2 = t + 0.051   (v2 starts 51 ms later)
  v1 t > CUT_OUT  -> v2 = t - 0.269   (0.32 s removed)
  inside the cut  -> v2 = CUT_IN + 0.051
v2 also ends with ~1.4 s of digital silence (87.67 s total, speech ends ~85.90 s).
Originals are archived in data/v1/.
"""
import json
import re
import shutil
from pathlib import Path

D = Path(__file__).resolve().parent.parent / "data"
LEAD, SHIFT = 0.051, -0.269
CUT_IN, CUT_OUT = 21.95, 22.27
FPS = 30


def remap(t: float) -> float:
    if t <= CUT_IN:
        return round(t + LEAD, 3)
    if t >= CUT_OUT:
        return round(t + SHIFT, 3)
    return round(CUT_IN + LEAD, 3)


def main():
    v1 = D / "v1"
    v1.mkdir(exist_ok=True)
    files = ["word-timings.json", "transcript.json", "scene-timings.json", "speech_segments.json", "subtitles.srt"]
    for f in files:
        if not (v1 / f).exists():
            shutil.copy(D / f, v1 / f)

    w = json.loads((v1 / "word-timings.json").read_text())
    for x in w["words"]:
        x["start"], x["end"] = remap(x["start"]), remap(x["end"])
    w["note"] = (w.get("note", "") + " | re-timed to Guide_v2.mp3 (doubled 'ה-' before USB removed).").strip(" |")
    (D / "word-timings.json").write_text(json.dumps(w, ensure_ascii=False, indent=1))

    t = json.loads((v1 / "transcript.json").read_text())
    for s in t["segments"]:
        s["start"], s["end"] = remap(s["start"]), remap(s["end"])
    t["duration"] = 87.67
    t["voiceover"] = "audio/Guide_v2.mp3"
    (D / "transcript.json").write_text(json.dumps(t, ensure_ascii=False, indent=1))

    sc = json.loads((v1 / "scene-timings.json").read_text())
    for s in sc:
        s["start"], s["end"] = remap(s["start"]), remap(s["end"])
        s["startFrame"], s["endFrame"] = round(s["start"] * FPS), round(s["end"] * FPS)
    (D / "scene-timings.json").write_text(json.dumps(sc, ensure_ascii=False, indent=1))

    sp = json.loads((v1 / "speech_segments.json").read_text())
    for s in sp:
        s["start"], s["end"] = remap(s["start"]), remap(s["end"])
    (D / "speech_segments.json").write_text(json.dumps(sp, ensure_ascii=False, indent=1))

    def ts(sec):
        ms = round(sec * 1000)
        return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"

    def sub(m):
        a = [int(x) for x in re.split("[:,]", m.group(1))]
        b = [int(x) for x in re.split("[:,]", m.group(2))]
        sa = a[0] * 3600 + a[1] * 60 + a[2] + a[3] / 1000
        sb = b[0] * 3600 + b[1] * 60 + b[2] + b[3] / 1000
        return f"{ts(remap(sa))} --> {ts(remap(sb))}"

    srt = re.sub(r"(\d\d:\d\d:\d\d,\d\d\d) --> (\d\d:\d\d:\d\d,\d\d\d)", sub, (v1 / "subtitles.srt").read_text())
    (D / "subtitles.srt").write_text(srt)
    print("re-timed:", ", ".join(files))


if __name__ == "__main__":
    main()
