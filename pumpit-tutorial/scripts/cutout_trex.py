#!/usr/bin/env python3
"""Clean alpha cutout of the approved inflated T-Rex keyframe (kling/out/kf_inflated_v2.png).

GrabCut seeded by colour: the navy wall/floor are definite background, the glossy-floor
reflection below the soles is removed with per-region sole lines, and the dark claws are kept
(they are neutral black, the floor is blue-black). The baked magenta rim light is neutralised to
the costume's warm orange, as in the light-studio look.
usage: cutout_trex.py <src.png> <out.png> <preview.jpg>
"""
import sys

import cv2
import numpy as np

src, out, prev = sys.argv[1:4]
img = cv2.imread(src)  # BGR
h, w = img.shape[:2]
b, g, r = [img[..., i].astype(np.int32) for i in range(3)]

mask = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
blue = (b > r + 25) & (b > g + 5)
mask[blue] = cv2.GC_BGD
warm = (r > b + 40) & (r > 90)
dark_neutral = (np.maximum(np.maximum(r, g), b) < 70) & (np.abs(b - r) < 18)
fg_seed = warm | dark_neutral
# soles: everything below them is floor or reflection
sole = np.full(w, 1405)
xs = np.arange(w)
sole[(xs > 1700) & (xs < 1950)] = 1342
sole[(xs >= 2150)] = 1362
yy = np.arange(h)[:, None]
below = yy > sole[None, :]
mask[below] = cv2.GC_BGD
# costume bounding region (from the frame): outside it is background
box = np.zeros((h, w), bool)
box[90:1420, 1480:2420] = True
mask[~box] = cv2.GC_BGD
mask[fg_seed & box & ~below] = cv2.GC_PR_FGD
mask[(warm) & box & ~below] = cv2.GC_FGD
bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
cv2.grabCut(img, mask, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
alpha = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
# keep the largest component, fill holes, soft 1.5 px edge
n, lab, stats, _ = cv2.connectedComponentsWithStats(alpha, 8)
keep = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
alpha = np.where(lab == keep, 255, 0).astype(np.uint8)
inv = cv2.bitwise_not(alpha)
n2, lab2, stats2, _ = cv2.connectedComponentsWithStats(inv, 4)
for i in range(1, n2):
    x, y, ww, hh, area = stats2[i]
    if area < 4000 and x > 0 and y > 0 and x + ww < w and y + hh < h:
        alpha[lab2 == i] = 255
# background seen through gaps (e.g. between the arms) is blue: never costume
alpha[blue] = 0
alpha = cv2.GaussianBlur(alpha, (0, 0), 1.2)

# neutralise the magenta/purple rim (keep the true red of the mouth)
f = img.astype(np.float32) / 255
B, G, R = f[..., 0], f[..., 1], f[..., 2]
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV_FULL).astype(np.float32)
hue = hsv[..., 0] * 360 / 255
sat = hsv[..., 1] / 255
mag = ((hue >= 255) | (hue <= 12)) & (sat > 0.25) & (np.maximum(np.maximum(R, G), B) > 0.25)
mouth = (R > 0.45) & (B < 0.35 * R) & (G < 0.45 * R)
wgt = cv2.GaussianBlur((mag & ~mouth).astype(np.float32), (0, 0), 3)
lum = 0.3 * R + 0.59 * G + 0.11 * B
tgt = np.stack([np.clip(lum * 0.48, 0, 1), np.clip(lum * 0.82, 0, 1), np.clip(lum * 1.25, 0, 1)], -1)
f = f * (1 - wgt[..., None]) + tgt * wgt[..., None]
rgba = np.dstack([(f * 255).astype(np.uint8), alpha])
ys, xs2 = np.where(alpha > 8)
pad = 16
y0, y1, x0, x1 = max(0, ys.min() - pad), min(h, ys.max() + pad), max(0, xs2.min() - pad), min(w, xs2.max() + pad)
crop = rgba[y0:y1, x0:x1]
cv2.imwrite(out, crop)
bg = np.full(crop.shape[:2] + (3,), (252, 244, 238), np.uint8)
a = crop[..., 3:4].astype(np.float32) / 255
cv2.imwrite(prev, (crop[..., :3] * a + bg * (1 - a)).astype(np.uint8))
print("size", crop.shape[1], crop.shape[0])
