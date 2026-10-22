"""25 fps full-body crop sheets of the child, with smoothed pose-driven framing."""
import json, sys, os, cv2, numpy as np
S = os.path.dirname(os.path.abspath(__file__))
VIDEO = sys.argv[1]
d = json.load(open(os.path.join(S, "pose1.json"))); FPS = d["fps"]; F = d["frames"]; N = len(F)
box = np.full((N, 4), np.nan)  # cx, cy, size
prev = None
chosen = [None] * N
for f in F:
    cands = []
    for p in f["poses"]:
        pts = [(v[0], v[1]) for v in p.values() if v[2] > 0.3]
        if len(pts) < 4: continue
        xs, ys = zip(*pts)
        h = max(ys) - min(ys)
        cands.append((np.mean(xs), (max(ys) + min(ys)) / 2, h, max(ys), p))
    if not cands: continue
    if prev is not None:
        c = min(cands, key=lambda c: np.hypot(c[0] - prev[0], c[1] - prev[1]) + 0.3 * abs(c[2] - prev[2]))
    else:
        c = min(cands, key=lambda c: c[2])
    prev = c
    chosen[f["f"]] = c[4]
    box[f["f"]] = [c[0], c[1], c[2], c[3]]
for k in range(4):  # fill gaps, median smooth
    a = box[:, k]; idx = np.arange(N); ok = ~np.isnan(a)
    a = np.interp(idx, idx[ok], a[ok])
    box[:, k] = [np.median(a[max(0, i - 5): i + 6]) for i in range(N)]

def foot_rel(side):
    a = np.full(N, np.nan)
    for i, p in enumerate(chosen):
        if p is None: continue
        hy = (p["lhip"][1] + p["rhip"][1]) / 2
        pts = [p[side + k] for k in ("heel", "ank", "toe") if p[side + k][2] > 0.4]
        if pts: a[i] = max(q[1] for q in pts) - hy
    return a
def sm(a):
    return np.array([np.nanmean(a[max(0, i - 1): i + 2]) if not np.isnan(a[max(0, i - 1): i + 2]).all() else np.nan for i in range(N)])
REL = [sm(foot_rel("l")), sm(foot_rel("r"))]
LEG = np.nanmedian(np.abs(np.concatenate(REL)))
def strikes(i0, i1):
    out = []
    for r in REL:
        s = r / LEG
        for i in range(i0 + 2, i1 - 2):
            if np.isnan(s[i - 2:i + 3]).any(): continue
            if s[i] <= s[i - 1] and s[i] <= s[i + 1]:
                top = np.nanmax(s[i:i + 10]); lo = s[i]
                if top - lo < 0.05: continue
                for j in range(i + 1, min(i + 12, i1)):
                    if s[j] >= lo + 0.85 * (top - lo):
                        out.append(j); break
    out = sorted(set(out)); merged = []
    for o in out:
        if merged and o - merged[-1] <= 2: continue
        merged.append(o)
    return merged
def sheet(name, t0, t1, cols=10, tw=190):
    cap = cv2.VideoCapture(VIDEO); i0, i1 = int(round(t0 * FPS)), int(round(t1 * FPS))
    cap.set(cv2.CAP_PROP_POS_FRAMES, i0); tiles = []
    marks = set(strikes(i0, i1)); print(name, [round(m / FPS, 2) for m in sorted(marks)])
    for i in range(i0, i1):
        ok, fr = cap.read()
        if not ok: break
        cx, cy, h, bot = box[i]
        size = max(220, h * 1.25)
        x0 = int(np.clip(cx - size / 2, 0, 1920 - size)); y0 = int(np.clip(cy - size * 0.40, 0, 1080 - size))
        crop = cv2.resize(fr[y0:y0 + int(size), x0:x0 + int(size)], (tw, tw))
        cv2.putText(crop, f"{i/FPS:.2f}", (4, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 255), 2)
        tiles.append(cv2.copyMakeBorder(crop, 4, 4, 4, 4, cv2.BORDER_CONSTANT, value=(0, 0, 255) if i in marks else (30, 30, 30)))
    while len(tiles) % cols: tiles.append(np.zeros_like(tiles[0]))
    cv2.imwrite(os.path.join(S, "verify", name + ".jpg"),
                np.vstack([np.hstack(tiles[r:r + cols]) for r in range(0, len(tiles), cols)]), [cv2.IMWRITE_JPEG_QUALITY, 85])
for a in sys.argv[2:]:
    n, t0, t1 = a.split(":"); sheet(n, float(t0), float(t1))
