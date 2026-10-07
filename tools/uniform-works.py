"""Make every artwork image on the site the same size.

Landscape works become WORK_L (1.494:1), portrait works WORK_P (2:3). An image whose shape differs is
centre-cropped to the target shape first (on the current scans this only trims plain paper margin),
then resized. Thumbnails in assets/thumbs are rebuilt from the result at THUMB_H pixels tall.

Usage (from the site folder):
    python3 tools/uniform-works.py                  # current scans, in place, at 832px wide
    python3 tools/uniform-works.py SRC_DIR 1600     # new high-res scans from SRC_DIR, written at 1600px wide

When new scans arrive, run it on them with the larger width; every page picks the files up by name.
"""
import os, sys
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else 'assets/works'
WIDTH = int(sys.argv[2]) if len(sys.argv) > 2 else 832
RATIO_L, RATIO_P, THUMB_H = 1.494, 2 / 3, 260

def fit(im):
    w, h = im.size
    r = RATIO_L if w >= h else RATIO_P
    if w / h > r:
        nw = round(h * r); x = (w - nw) // 2; im = im.crop((x, 0, x + nw, h))
    else:
        nh = round(w / r); y = (h - nh) // 2; im = im.crop((0, y, w, y + nh))
    return im.resize((WIDTH, round(WIDTH / r)), Image.LANCZOS)

for f in sorted(os.listdir(SRC)):
    if not f.lower().endswith(('.jpg', '.jpeg', '.png', '.tif', '.tiff')) or f == 'Vector_2.png':
        continue
    im = fit(Image.open(os.path.join(SRC, f)).convert('RGB'))
    name = os.path.splitext(f)[0] + '.jpg'
    im.save(os.path.join('assets/works', name), 'JPEG', quality=88, optimize=True, progressive=True)
    t = im.resize((round(im.width * THUMB_H / im.height), THUMB_H), Image.LANCZOS)
    t.save(os.path.join('assets/thumbs', name), 'JPEG', quality=85, optimize=True, progressive=True)
    print(name, im.size, t.size)
