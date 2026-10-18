"""Puts iPhone screens (devices/scr-<key>.png) into the stored device bodies.
Usage: python3 devices.py --work /abs/work --keys home,map,...
Writes devices/front-<key>.png (front iPhone 15 Pro) and devices/iso-<key>.png (isometric iPhone 15 Pro)."""
import argparse, os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
DEV = os.path.join(HERE, '..', 'assets', 'devices')
# Front body 1646x3354: screen hole at (76,64), 1492x3236, corner radius 222.
SW, SH, R, OX, OY = 1492, 3236, 222, 76, 64
# Isometric body 1692x1692: screen corners top-left, top-right, bottom-left.
TL, TR, BL = (72, 694), (595, 345), (1089, 1323)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--work'); ap.add_argument('--keys'); a = ap.parse_args()
    out = os.path.join(a.work, 'devices')
    front = Image.open(os.path.join(DEV, 'iphone-front.png')).convert('RGBA')
    under = Image.open(os.path.join(DEV, 'iphone-iso-under.png')).convert('RGBA')
    over = Image.open(os.path.join(DEV, 'iphone-iso-over.png')).convert('RGBA')
    rnd = Image.open(os.path.join(DEV, 'iphone-iso-mask.png')).convert('RGBA').split()[3]
    m = Image.new('L', (SW * 2, SH * 2), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, SW * 2 - 1, SH * 2 - 1), radius=R * 2, fill=255)
    m = m.resize((SW, SH), Image.LANCZOS)
    for k in a.keys.split(','):
        s = Image.open(os.path.join(out, f'scr-{k}.png')).convert('RGBA')
        f = s.resize((SW, SH), Image.LANCZOS); f.putalpha(m)
        ph = Image.new('RGBA', front.size, (0, 0, 0, 0)); ph.alpha_composite(f, (OX, OY)); ph.alpha_composite(front)
        ph.save(os.path.join(out, f'front-{k}.png'))
        W, H = s.size
        ax = ((TR[0] - TL[0]) / W, (BL[0] - TL[0]) / H); ay = ((TR[1] - TL[1]) / W, (BL[1] - TL[1]) / H)
        det = ax[0] * ay[1] - ax[1] * ay[0]
        A, B, D, E = ay[1] / det, -ax[1] / det, -ay[0] / det, ax[0] / det
        Cc, F = -(A * TL[0] + B * TL[1]), -(D * TL[0] + E * TL[1])
        w = s.transform(under.size, Image.AFFINE, (A, B, Cc, D, E, F), resample=Image.BICUBIC)
        w.putalpha(Image.composite(w.split()[3], Image.new('L', under.size, 0), rnd))
        iso = under.copy(); iso.alpha_composite(w); iso.alpha_composite(over)
        iso.save(os.path.join(out, f'iso-{k}.png'))
        print('OK', k)

if __name__ == '__main__':
    main()
