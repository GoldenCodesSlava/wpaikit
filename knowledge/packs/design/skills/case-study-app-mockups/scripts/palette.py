"""Proposes background colours from the app screens.
Usage: python3 palette.py --work /abs/work   -> prints {"dark","light","accent"} and writes work/palette.json
- dark: the most used dark colour of the screens (not pure black), else the accent darkened;
- light: the most used light, non-white colour, else white mixed with 8% of the accent;
- accent: the most used saturated colour (buttons, tab bar, highlights)."""
import argparse, colorsys, glob, json, os
from collections import Counter
from PIL import Image

def hexc(c): return '#%02x%02x%02x' % c
def mix(c, d, t): return tuple(round(a + (b - a) * t) for a, b in zip(c, d))

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--work'); a = ap.parse_args()
    cnt = Counter()
    for f in glob.glob(os.path.join(a.work, 'devices', 'scr-*.png')):
        im = Image.open(f).convert('RGB').resize((118, 256))
        for p in (im.get_flattened_data() if hasattr(im, "get_flattened_data") else im.getdata()): cnt[tuple(v // 8 * 8 + 4 for v in p)] += 1
    hls = {c: colorsys.rgb_to_hls(*(v / 255 for v in c)) for c in cnt}
    acc = [c for c, _ in cnt.most_common() if hls[c][2] > 0.35 and 0.25 < hls[c][1] < 0.75]
    accent = acc[0] if acc else (90, 90, 200)
    dark = [c for c, _ in cnt.most_common() if hls[c][1] < 0.2 and max(c) > 12]
    light = [c for c, _ in cnt.most_common() if hls[c][1] > 0.9 and min(c) < 250]
    pal = {'dark': hexc(dark[0] if dark else mix(accent, (0, 0, 0), 0.75)),
           'light': hexc(light[0] if light else mix((255, 255, 255), accent, 0.08)),
           'accent': hexc(accent)}
    json.dump(pal, open(os.path.join(a.work, 'palette.json'), 'w'), indent=2); print(json.dumps(pal))

if __name__ == '__main__':
    main()
