"""Fits app screens exported from Figma to the iPhone 15 Pro screen (1179x2556).
Usage: python3 prepare_screens.py --work /abs/work
Reads work/frames/<key>.png, writes work/devices/scr-<key>.png.
- wider/shorter frames: scaled to 1179 px width, the missing bottom is filled with the frame's bottom colour;
- taller frames (scrolling screens): scaled to 1179 px width and cropped from the top.
--status-bar: adds an iOS status bar (9:41, signal, battery) on top, for frames designed without one,
so the Dynamic Island does not cover the app header. The bar takes the colour of the frame's top edge;
the design is scaled to fit under it (the bottom tab bar stays visible), side margins are filled from the edges."""
import argparse, glob, os
from PIL import Image, ImageDraw, ImageFont

SB = 162  # 54 pt at 3x

def font(size):
    for f in ['/System/Library/Fonts/SFNS.ttf', '/System/Library/Fonts/Helvetica.ttc', '/Library/Fonts/Arial.ttf']:
        if os.path.exists(f):
            try: return ImageFont.truetype(f, size)
            except Exception: pass
    return ImageFont.load_default()

def status_bar(top):
    bar = Image.new('RGB', (W, SB), top); d = ImageDraw.Draw(bar)
    fg = (0, 0, 0) if sum(top) / 3 > 140 else (255, 255, 255)
    d.text((150, 88), '9:41', font=font(51), fill=fg, anchor='lm')
    x = 860
    for i, h in enumerate([16, 22, 28, 34]): d.rounded_rectangle((x + i * 18, 106 - h, x + i * 18 + 11, 106), 3, fill=fg)
    d.rounded_rectangle((955, 72, 1030, 106), 9, outline=fg, width=4); d.rounded_rectangle((962, 79, 1010, 99), 5, fill=fg)
    d.rounded_rectangle((1034, 82, 1040, 96), 2, fill=fg)
    return bar

W, H = 1179, 2556

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--work'); ap.add_argument('--status-bar', action='store_true'); a = ap.parse_args()
    out = os.path.join(a.work, 'devices'); os.makedirs(out, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(a.work, 'frames', '*.png'))):
        k = os.path.splitext(os.path.basename(f))[0]
        im = Image.open(f).convert('RGB')
        im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
        if a.status_bar:
            # Full-height screens (up to +15% taller than the area under the status bar) are scaled down to fit,
            # so the bottom tab bar stays visible; taller (scrolling) screens are cropped from the top;
            # shorter screens keep full width and the missing bottom is filled with their bottom colour.
            avail = H - SB
            if im.height > avail * 1.15:
                body = im.crop((0, 0, W, avail))
            else:
                body = im
            if body.height > avail:
                sc = avail / body.height; bw = round(W * sc); body = body.resize((bw, avail), Image.LANCZOS)
            else:
                bw = W
            full = Image.new('RGB', (W, H), body.getpixel((bw // 2, body.height - 2))); pad = (W - bw) // 2
            if pad > 0:
                full.paste(body.crop((0, 0, 1, body.height)).resize((pad + 1, body.height)), (0, SB))
                full.paste(body.crop((bw - 1, 0, bw, body.height)).resize((W - pad - bw + 1, body.height)), (pad + bw - 1, SB))
            full.paste(body, (pad, SB)); full.paste(status_bar(body.getpixel((bw // 2, 4))), (0, 0))
            im = full
        if im.height >= H:
            im = im.crop((0, 0, W, H))
        else:
            bg = Image.new('RGB', (W, H), im.getpixel((W // 2, im.height - 2))); bg.paste(im, (0, 0)); im = bg
        im.save(os.path.join(out, f'scr-{k}.png')); print('OK', k)

if __name__ == '__main__':
    main()
