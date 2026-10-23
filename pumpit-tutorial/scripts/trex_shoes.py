#!/usr/bin/env python3
"""Put the wearer's shoes back under the T-Rex foot cuffs (trex_cutout_v3.png, in place).

On the real product (pumpit.co.il photo) the legs end in open cuffs with claws on the front, and
the wearer's white sneakers show underneath. The AI keyframe the cutout comes from lost them —
one cuff ends over nothing, the other over a flat black slab — so the feet read as chopped off.
Here, in canvas coordinates of the cutout:
- right foot: the black slab behind the claw becomes a white sneaker (toe, upper, grey sole),
- left foot: a white sneaker toe is drawn in the notch under the cuff, behind the fabric.
usage: trex_shoes.py <cutout.png> <out.png>
"""
import sys

import cv2
import numpy as np

src, dst = sys.argv[1:3]
im = cv2.imread(src, cv2.IMREAD_UNCHANGED)
h, w = im.shape[:2]
bgr = im[..., :3].astype(np.float32)
a = im[..., 3].astype(np.float32)
yy, xx = np.mgrid[0:h, 0:w]
lum = bgr.mean(-1)


def sneaker(mask, top, bottom):
    """white upper shading from `top` to `bottom` rows, grey sole on the last 22 % of each column"""
    t = np.clip((yy - top) / max(1, bottom - top), 0, 1)
    # the cuff shades the top of the shoe; light on the toe cap; grey rubber sole below
    upper = 214 + 34 * np.clip(t / 0.35, 0, 1) - 10 * np.clip((t - 0.35) / 0.43, 0, 1)
    col = np.stack([upper, upper, upper + 2], -1)
    sole = t > 0.78
    col[sole] = np.array([150, 152, 156], np.float32)
    m = mask.astype(np.float32)
    m = cv2.GaussianBlur(m, (0, 0), 0.7)
    return col, m


# right foot: the dark slab behind the front claw (the claw tip stays black)
poly_r = np.array([[428, 1258], [570, 1278], [572, 1306], [424, 1294]], np.int32)
reg = np.zeros((h, w), np.uint8)
cv2.fillPoly(reg, [poly_r], 1)
neutral = np.abs(bgr[..., 2] - bgr[..., 0]) < 40  # black slab and its white glint, not the orange fabric
right = (reg > 0) & ((lum < 95) | ((lum > 140) & neutral)) & (a > 40)
col, m = sneaker(right, 1262, 1302)
bgr = bgr * (1 - m[..., None]) + col * m[..., None]

# left foot: a sneaker toe in the notch under the cuff (drawn behind the fabric)
shoe = np.zeros((h, w), np.uint8)
cv2.ellipse(shoe, (366, 1240), (46, 15), -6, 0, 360, 1, -1)
behind = (shoe > 0) & ((a < 200) | (lum < 95))
col, m = sneaker(behind, 1226, 1256)
bgr = bgr * (1 - m[..., None]) + col * m[..., None]
a = np.maximum(a, m * 255)

out = np.dstack([np.clip(bgr, 0, 255).astype(np.uint8), np.clip(a, 0, 255).astype(np.uint8)])
cv2.imwrite(dst, out)
print("ok", dst)
