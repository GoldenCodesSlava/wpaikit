"""Splits a logo into icon + wordmark for the horizontal logo of template A.
Usage: python3 logo_split.py --work /abs/work [--dark #25221e]
Writes logo/icon.png, logo/text.png (if split) and logo/logo.json with aspects."""
import argparse, json, os
import numpy as np
from PIL import Image

def runs(mask):
    out, start = [], None
    for i, v in enumerate(mask):
        if v and start is None: start = i
        if not v and start is not None: out.append((start, i - 1)); start = None
    if start is not None: out.append((start, len(mask) - 1))
    return out

def crop(im):
    a = np.asarray(im)[:, :, 3]; ys, xs = np.nonzero(a > 10)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--work'); ap.add_argument('--dark', default=None); a = ap.parse_args()
    d = os.path.join(a.work, 'logo'); im = crop(Image.open(os.path.join(d, 'logo-full.png')).convert('RGBA'))
    arr = np.asarray(im).astype(float); alpha = arr[:, :, 3] > 10
    # A very light logo would disappear on the light background: tint it with the site dark colour.
    lum = (arr[:, :, :3][alpha] @ [0.299, 0.587, 0.114]).mean() / 255 if alpha.any() else 0
    if lum > 0.85 and a.dark:
        c = [int(a.dark[i:i + 2], 16) for i in (1, 3, 5)]
        t = np.asarray(im).copy(); t[:, :, 0], t[:, :, 1], t[:, :, 2] = c; im = Image.fromarray(t)
    rows, cols = runs(alpha.any(1)), runs(alpha.any(0))
    gap = lambda rs: max(((rs[i + 1][0] - rs[i][1], i) for i in range(len(rs) - 1)), default=(0, -1))
    rg, cg = gap(rows), gap(cols)
    H, W = alpha.shape; info = {}
    if rg[0] > H * 0.03 and rg[0] >= cg[0] * (H / W):   # stacked: icon above wordmark
        cut = rows[rg[1]][1] + 1
        icon, text = crop(im.crop((0, 0, W, cut))), crop(im.crop((0, cut, W, H)))
    elif cg[0] > W * 0.03:                               # already horizontal: icon left, wordmark right
        cut = cols[cg[1]][1] + 1
        icon, text = crop(im.crop((0, 0, cut, H))), crop(im.crop((cut, 0, W, H)))
    else:
        icon, text = im, None
    icon.save(os.path.join(d, 'icon.png')); info['icon'] = 'logo/icon.png'; info['iconAspect'] = icon.width / icon.height
    if text is not None:
        text.save(os.path.join(d, 'text.png')); info['text'] = 'logo/text.png'; info['textAspect'] = text.width / text.height
    else:
        info['text'] = None
    json.dump(info, open(os.path.join(d, 'logo.json'), 'w'), indent=2); print(json.dumps(info))

if __name__ == '__main__':
    main()
