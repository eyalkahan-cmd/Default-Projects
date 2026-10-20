import json, sys
from faster_whisper import WhisperModel
model_name = sys.argv[1]; audio = sys.argv[2]; out = sys.argv[3]
m = WhisperModel(model_name, device="cpu", compute_type="int8", cpu_threads=4)
segs, info = m.transcribe(audio, language="he", word_timestamps=True, beam_size=5, vad_filter=False)
res = []
for s in segs:
    res.append({"start": s.start, "end": s.end, "text": s.text,
                "words": [{"w": w.word, "start": w.start, "end": w.end, "p": w.probability} for w in s.words]})
    print(f"{s.start:6.2f}-{s.end:6.2f} {s.text}", flush=True)
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
