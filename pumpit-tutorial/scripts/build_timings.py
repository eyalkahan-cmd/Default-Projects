import re, json, sys
raw = open('data/turboscribe_raw.srt', encoding='utf-8').read()
blocks = [b for b in raw.strip().split('\n\n') if b.strip()]
def ts(s):
    h, m, r = s.split(':'); sec, ms = r.split(',')
    return int(h)*3600 + int(m)*60 + int(sec) + int(ms)/1000
fixes = [('(תומלל על ידי TurboScribe. שדרג ללא הגבלה כדי להסיר הודעה זו.) ', ''),
         ('ודעו', 'ודאו'), ('המעברר', 'המאוורר'), ('היהודי', 'הייעודי'), ('קבל', 'כבל'),
         ('בריכת', 'בריחת'), ('סיגרו', 'סגרו'), ('שרוחים', 'שרוכים'), ('הטעימו', 'התאימו'),
         ('באדינות', 'בעדינות'), ('זיכרו', 'זכרו'), ('הסוללות בהתאם', 'הסוללות, בהתאם'),
         ('התחפושת והניחו', 'התחפושת, והניחו'), ('הקליפס בהתאם', 'הקליפס, בהתאם'),
         ('הסוף.', 'הסוף,'), ('גודלה.', 'גודלה!'), ('ההצגה.', 'ההצגה!'), ('ובדרך\nכלל,', 'ובדרך כלל'), ('כלל, תוך', 'כלל תוך')]
segs = []
for b in blocks:
    lines = b.split('\n'); a, e = lines[1].split(' --> ')
    t = ' '.join(lines[2:])
    for o, n in fixes: t = t.replace(o, n)
    segs.append({'start': ts(a), 'end': ts(e), 'text': t.strip()})
# pauses for snapping
pauses = [tuple(map(float, l.split())) for l in open('data/pauses_120ms.tsv')]
words = []
for i, s in enumerate(segs):
    toks = s['text'].split()
    # speech sub-spans inside segment (remove internal pauses)
    spans = [[s['start'], s['end']]]
    for ps, pe in pauses:
        new = []
        for a, b in spans:
            if ps > a + 0.05 and pe < b - 0.05: new += [[a, ps], [pe, b]]
            else: new.append([a, b])
        spans = new
    # trim leading/trailing silence
    for ps, pe in pauses:
        if ps <= spans[0][0] < pe: spans[0][0] = pe
        if ps < spans[-1][1] <= pe: spans[-1][1] = ps
    total = sum(b - a for a, b in spans)
    wts = [len(re.sub(r'[^\w]', '', t)) + (3 if re.search(r'[A-Za-z]', t) else 0) + 1 for t in toks]
    W = sum(wts); pos = 0.0
    def at(x):
        for a, b in spans:
            if x <= b - a: return a + x
            x -= b - a
        return spans[-1][1]
    for t, w in zip(toks, wts):
        st = at(pos); pos += w / W * total; en = at(pos - 1e-6)
        words.append({'w': t, 'start': round(st, 3), 'end': round(en, 3), 'seg': i + 1, 'method': 'interpolated'})
def fmt(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f'{h:02}:{m:02}:{s:02},{ms:03}'
with open('data/subtitles.srt', 'w', encoding='utf-8') as f:
    for i, s in enumerate(segs, 1): f.write(f"{i}\n{fmt(s['start'])} --> {fmt(s['end'])}\n{s['text']}\n\n")
json.dump({'source': 'TurboScribe segment timings, manually corrected text', 'duration': 86.67, 'segments': segs}, open('data/transcript.json', 'w'), ensure_ascii=False, indent=1)
json.dump({'note': 'Word times interpolated inside TurboScribe segments by character weight, with internal pauses (silencedetect -35dB/120ms) removed. Accuracy ~±0.15s; segment edges are measured.', 'words': words}, open('data/word-timings.json', 'w'), ensure_ascii=False, indent=1)
scenes = [('S01_opening', 0.0, 6.35), ('S02_fan', 6.35, 11.91), ('S03a_aa', 11.91, 20.89), ('S03b_powerbank', 20.89, 25.85),
          ('S04_wear', 25.85, 41.65), ('S05_most_important', 42.31, 50.51), ('S06_zip_elastic_straps', 50.51, 65.83),
          ('S07_inflate', 66.45, 77.93), ('S08_finale', 77.93, 86.67), ('S09_logo_tail', 86.67, 90.0)]
json.dump([{'id': a, 'start': b, 'end': c, 'startFrame': round(b * 30), 'endFrame': round(c * 30)} for a, b, c in scenes], open('data/scene-timings.json', 'w'), indent=1)
for s in segs: print(f"{s['start']:6.2f}-{s['end']:6.2f} {s['text']}")
