"""Label and tile frames so a moment can be located frame by frame.

Usage:
  python3 contact_sheet.py <frames_dir> <first> <last> <out.png> [src_fps]
    frames_dir holds fNNN.jpg from `npm run frames`; tiles frames first..last, 9 per row.
  python3 contact_sheet.py --video <clip.mp4> <out.jpg> [fps]
    quick overview of a whole clip (default 2 frames per second).
"""
import subprocess
import sys

if sys.argv[1] == "--video":
    clip, out = sys.argv[2], sys.argv[3]
    fps = sys.argv[4] if len(sys.argv) > 4 else "2"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", clip, "-vf",
                    f"fps={fps},scale=270:-1,tile=8x3", "-frames:v", "1", out], check=True)
    sys.exit()

from PIL import Image, ImageDraw  # noqa: E402

frames_dir, first, last, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
src_fps = float(sys.argv[5]) if len(sys.argv) > 5 else 24.0
nums = list(range(first, last + 1))
W, H, COLS = 180, 320, 9
rows = (len(nums) + COLS - 1) // COLS
sheet = Image.new("RGB", (W * COLS, (H + 20) * rows), "white")
draw = ImageDraw.Draw(sheet)
for i, n in enumerate(nums):
    x, y = (i % COLS) * W, (i // COLS) * (H + 20)
    sheet.paste(Image.open(f"{frames_dir}/f{n:03d}.jpg").resize((W, H)), (x, y + 20))
    draw.text((x + 5, y + 4), f"f{n} = {n / src_fps:.3f}s", fill="black")
sheet.save(out)
