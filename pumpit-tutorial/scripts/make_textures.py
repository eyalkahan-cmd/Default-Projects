#!/usr/bin/env python3
"""Generate tileable production textures for the cinematic rebuild (no AI, fully procedural).

- trex_print.jpg: the T-Rex costume print (colors sampled from the real product photo:
  base #D4924A, mid #B66725, stripes #48220F) as curved tiger strokes and speckles.
- ripstop_normal.png: fine ripstop-nylon weave as a tangent-space normal map.
- tape_normal.png: woven zipper-tape texture normal map.

Usage: python3 -I scripts/make_textures.py <out_dir> [real]   (real: only the photo-matched print)
"""
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(42)


def tile_draw(draw_fn, size):
    """Draw on a 3x3 canvas and keep the centre so strokes wrap seamlessly."""
    big = Image.new("RGBA", (size * 3, size * 3), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)
    for ox in (0, size, 2 * size):
        for oy in (0, size, 2 * size):
            draw_fn(d, ox, oy)
    return big.crop((size, size, 2 * size, 2 * size))


def print_texture(size=2048):
    base = np.zeros((size, size, 3), np.float32)
    base[:] = (212, 146, 74)
    # low-frequency tonal variation toward the mid orange
    n = rng.standard_normal((8, 8))
    var = np.array(Image.fromarray(((n - n.min()) / (n.max() - n.min()) * 255).astype(np.uint8)).resize((size, size), Image.BICUBIC)) / 255.0
    var = np.roll(var, 0)
    mid = np.array((182, 103, 37), np.float32)
    base = base * (1 - 0.45 * var[..., None]) + mid * (0.45 * var[..., None])
    img = Image.fromarray(base.astype(np.uint8)).convert("RGBA")

    strokes = []
    # stripes come in loose parallel bundles, like the real print
    for _ in range(55):
        cx, cy = rng.uniform(0, size, 2)
        ang = rng.normal(-0.45, 0.3)
        for k in range(rng.integers(2, 5)):
            off = k * rng.uniform(22, 40)
            x = cx - math.sin(ang) * off + rng.normal(0, 8)
            y = cy + math.cos(ang) * off + rng.normal(0, 8)
            length = rng.uniform(140, 420)
            width = rng.uniform(9, 26)
            bend = rng.normal(0, 0.45)
            strokes.append((x, y, ang + rng.normal(0, 0.08), length, width, bend))
    specks = [(rng.uniform(0, size), rng.uniform(0, size), rng.uniform(3, 9)) for _ in range(380)]

    def draw(d, ox, oy):
        for (x, y, ang, length, width, bend) in strokes:
            pts = []
            steps = max(24, int(length / 2.5))
            for i in range(steps + 1):
                t = i / steps
                a = ang + bend * (t - 0.5)
                px = x + math.cos(a) * length * t + ox
                py = y + math.sin(a) * length * t + oy
                pts.append((px, py, width * math.sin(math.pi * t) ** 0.7 + 1))
            for (px, py, w) in pts:
                d.ellipse((px - w / 2, py - w / 2, px + w / 2, py + w / 2), fill=(72, 34, 15, 235))
        for (x, y, r) in specks:
            d.ellipse((x + ox - r, y + oy - r * 0.8, x + ox + r, y + oy + r * 0.8), fill=(72, 34, 15, 210))

    layer = tile_draw(draw, size).filter(ImageFilter.GaussianBlur(1.2))
    img.alpha_composite(layer)
    img.convert("RGB").save(OUT / "trex_print.jpg", quality=92)


def print_texture_real(size=2048):
    """Matched to the photographed costume: saturated orange base with lighter yellow areas, thin
    tapered near-black strokes in diagonal bundles, and clusters of dark-brown spots."""
    base = np.zeros((size, size, 3), np.float32)
    base[:] = (236, 158, 66)
    n = rng.standard_normal((6, 6))
    var = np.array(Image.fromarray(((n - n.min()) / (n.max() - n.min()) * 255).astype(np.uint8)).resize((size, size), Image.BICUBIC)) / 255.0
    light = np.array((246, 196, 108), np.float32)
    deep = np.array((214, 120, 40), np.float32)
    base = base * (1 - 0.35 * var[..., None]) + deep * (0.35 * var[..., None])
    n2 = rng.standard_normal((10, 10))
    var2 = np.array(Image.fromarray(((n2 - n2.min()) / (n2.max() - n2.min()) * 255).astype(np.uint8)).resize((size, size), Image.BICUBIC)) / 255.0
    m = np.clip((var2[..., None] - 0.55) / 0.3, 0, 1)
    m = m * m * (3 - 2 * m)
    base = base * (1 - 0.3 * m) + light * (0.3 * m)
    img = Image.fromarray(base.astype(np.uint8)).convert("RGBA")
    strokes = []
    for _ in range(70):
        cx, cy = rng.uniform(0, size, 2)
        ang = rng.normal(-0.9, 0.35)
        for k in range(rng.integers(3, 7)):
            off = k * rng.uniform(14, 26)
            x = cx - math.sin(ang) * off + rng.normal(0, 6)
            y = cy + math.cos(ang) * off + rng.normal(0, 6)
            strokes.append((x, y, ang + rng.normal(0, 0.06), rng.uniform(120, 360), rng.uniform(4, 11), rng.normal(0, 0.35)))
    spots = []
    for _ in range(26):
        cx, cy = rng.uniform(0, size, 2)
        for _k in range(rng.integers(6, 16)):
            spots.append((cx + rng.normal(0, 38), cy + rng.normal(0, 30), rng.uniform(5, 15)))

    def draw(d, ox, oy):
        for (x, y, ang, length, width, bend) in strokes:
            steps = max(24, int(length / 2.5))
            for i in range(steps + 1):
                t = i / steps
                a = ang + bend * (t - 0.5)
                px = x + math.cos(a) * length * t + ox
                py = y + math.sin(a) * length * t + oy
                w = width * math.sin(math.pi * t) ** 0.6 + 0.8
                d.ellipse((px - w / 2, py - w / 2, px + w / 2, py + w / 2), fill=(22, 16, 12, 240))
        for (x, y, r) in spots:
            d.ellipse((x + ox - r, y + oy - r * 0.75, x + ox + r, y + oy + r * 0.75), fill=(70, 34, 18, 225))

    layer = tile_draw(draw, size).filter(ImageFilter.GaussianBlur(1.0))
    img.alpha_composite(layer)
    img.convert("RGB").save(OUT / "trex_print_real.jpg", quality=92)


def normal_from_height(h, strength):
    gx = np.roll(h, -1, 1) - np.roll(h, 1, 1)
    gy = np.roll(h, -1, 0) - np.roll(h, 1, 0)
    nx, ny, nz = -gx * strength, -gy * strength, np.ones_like(h)
    l = np.sqrt(nx * nx + ny * ny + nz * nz)
    n = np.stack([nx / l, ny / l, nz / l], -1)
    return Image.fromarray(((n * 0.5 + 0.5) * 255).astype(np.uint8))


def ripstop(size=1024):
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)
    weave = 0.5 + 0.25 * np.sin(x * 2 * np.pi / 6) * np.sin(y * 2 * np.pi / 6)
    grid = ((x % 64) < 3) | ((y % 64) < 3)  # reinforcement threads
    h = weave + grid * 0.8
    h = np.array(Image.fromarray((h / h.max() * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8)), np.float32) / 255
    normal_from_height(h, 2.2).save(OUT / "ripstop_normal.png")


def tape(size=512):
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)
    h = 0.5 + 0.5 * np.sin(x * 2 * np.pi / 4) * np.cos(y * 2 * np.pi / 8)
    normal_from_height(h, 1.6).save(OUT / "tape_normal.png")


if len(sys.argv) > 2 and sys.argv[2] == "real":
    print_texture_real()
else:
    print_texture()
    ripstop()
    tape()
print("ok")
