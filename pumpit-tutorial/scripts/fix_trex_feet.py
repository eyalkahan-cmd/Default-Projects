#!/usr/bin/env python3
"""Rebuild the feet and the tail tip of the T-Rex cutout (trex_cutout_v2.png → trex_cutout_v3.png).

The first GrabCut pass cut the soles with straight "sole lines" that ran through the claws (the
feet ended in flat chops, claws floating loose), and its canvas ended before the tail tip. Here,
in the source frame (kling/out/kf_inflated_v2.png):
- the canvas is widened on the right by PAD_R px so the whole tail fits (the body keeps its exact
  position inside the original 914 × 1311 reference box, so every layout/uv constant stays valid),
- the feet and the tail are re-masked against a sole polyline traced just under each real contact
  edge (below it there is only the glossy floor and its mirror image), keeping the orange fabric,
  the black claws and their highlights and none of the navy floor,
- newly revealed pixels get the same magenta-rim neutralisation as the rest of the cutout.
Foreground for the feet and tail comes from a BiRefNet matte of the source (rembg,
"birefnet-general", run on the source crop starting at MATTE_XY): it keeps the black claws on the
black floor cleanly; the sole polyline then removes the floor reflection it also picks up.
usage: fix_trex_feet.py <src.png> <cutout_v2.png> <birefnet_mask.png> <out_v3.png> <preview.jpg>
"""
import sys

import cv2
import numpy as np

PAD_R = 80
src_p, cut_p, matte_p, out_p, prev_p = sys.argv[1:6]
MATTE_XY = (1440, 60)
src = cv2.imread(src_p)
cut = cv2.imread(cut_p, cv2.IMREAD_UNCHANGED)
ch, cw = cut.shape[:2]
H, W = src.shape[:2]

# where the cutout canvas sits in the source frame
r = cv2.matchTemplate(src, cut[500:600, 300:400, :3], cv2.TM_SQDIFF_NORMED)
_, _, loc, _ = cv2.minMaxLoc(r)
X0, Y0 = loc[0] - 300, loc[1] - 500
X1, Y1 = X0 + cw + PAD_R, Y0 + ch

# source colours with the same magenta-rim neutralisation as cutout_trex.py
f = src.astype(np.float32) / 255
B, G, R = f[..., 0], f[..., 1], f[..., 2]
hsv = cv2.cvtColor(src, cv2.COLOR_BGR2HSV_FULL).astype(np.float32)
hue, sat = hsv[..., 0] * 360 / 255, hsv[..., 1] / 255
mag = ((hue >= 255) | (hue <= 12)) & (sat > 0.25) & (np.maximum(np.maximum(R, G), B) > 0.25)
mouth = (R > 0.45) & (B < 0.35 * R) & (G < 0.45 * R)
wgt = cv2.GaussianBlur((mag & ~mouth).astype(np.float32), (0, 0), 3)
lum = 0.3 * R + 0.59 * G + 0.11 * B
tgt = np.stack([np.clip(lum * 0.48, 0, 1), np.clip(lum * 0.82, 0, 1), np.clip(lum * 1.25, 0, 1)], -1)
neutral = ((f * (1 - wgt[..., None]) + tgt * wgt[..., None]) * 255).astype(np.uint8)

# the new canvas: the old cutout, plus PAD_R columns of source on the right
out = np.zeros((ch, cw + PAD_R, 4), np.uint8)
out[:, :cw] = cut
out[:, cw:, :3] = neutral[Y0:Y1, X0 + cw : X1]

# sole polyline (source coords) under the real contact edges: left foot, right foot, tail
SOLE = [(1690, 1368), (1880, 1368), (1892, 1372), (1950, 1396), (2000, 1403), (2050, 1409), (2078, 1413), (2095, 1400), (2130, 1388),
        (2170, 1372), (2220, 1362), (2600, 1360)]
RX0, RX1, RY0, RY1 = 1690, X1, 1180, Y1
reg = src[RY0:RY1, RX0:RX1].astype(np.int32)
b, g, rr = reg[..., 0], reg[..., 1], reg[..., 2]
hh, ww = reg.shape[:2]
xs = np.arange(RX0, RX1)
sole = np.interp(xs, [p[0] for p in SOLE], [p[1] for p in SOLE])
below = np.arange(RY0, RY1)[:, None] > sole[None, :]
matte = cv2.imread(matte_p, cv2.IMREAD_GRAYSCALE)
mx, my = MATTE_XY
fg = matte[RY0 - my : RY1 - my, RX0 - mx : RX1 - mx].copy()
fg[below] = 0
# drop specks the matte left on the floor: keep what is connected to the body (top rows)
n, lab, _, _ = cv2.connectedComponentsWithStats((fg > 40).astype(np.uint8), 8)
top = set(np.unique(lab[:6][fg[:6] > 40])) - {0}
fg[~np.isin(lab, list(top))] = 0
fg = cv2.GaussianBlur(fg, (0, 0), 0.6)

oy0, ox0 = RY0 - Y0, RX0 - X0
old = out[oy0:, ox0:, 3].astype(np.float32)
ramp = np.clip((np.arange(hh)[:, None] - 4) / 16.0, 0, 1)
new = (old * (1 - ramp) + fg * ramp).astype(np.uint8)
rev = (new > 8) & (old < 8)
patch = out[oy0:, ox0:, :3]
patch[rev] = neutral[RY0:RY1, RX0:RX1][rev]
out[oy0:, ox0:, 3] = new
cv2.imwrite(out_p, out)
bg = np.full(out.shape[:2] + (3,), (252, 244, 238), np.uint8)
a = out[..., 3:4].astype(np.float32) / 255
cv2.imwrite(prev_p, (out[..., :3] * a + bg * (1 - a)).astype(np.uint8))
print("offset", X0, Y0, "canvas", out.shape[1], out.shape[0])
