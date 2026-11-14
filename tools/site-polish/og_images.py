#!/usr/bin/env python3
"""Share images: 1200x630 optimized jpgs in og/.

    python3 tools/site-polish/og_images.py [--shots /tmp/og-shots]

Sources are either a plain first-frame screenshot (og_shots.js) or the page's first key image. Pictures are only resized, never graded or
tinted: a wide picture is cropped to the card, a tall or square one is centred whole on the dark ground (#04070b) with no cropping."""
import os
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from lib import p  # noqa: E402
from pages import MAIN, TOUR_INDEX, TOUR_SOURCES, objects_pages, photo_pages  # noqa: E402

W, H = 1200, 630
GROUND = (4, 7, 11)
SHOTS = '/tmp/og-shots'
for i, a in enumerate(sys.argv):
    if a == '--shots':
        SHOTS = sys.argv[i + 1]


def card(src, out):
    im = Image.open(src)
    if im.mode in ('RGBA', 'LA', 'P'):
        bg = Image.new('RGB', im.size, GROUND)
        im = im.convert('RGBA')
        bg.paste(im, mask=im.split()[3])
        im = bg
    else:
        im = im.convert('RGB')
    w, h = im.size
    a, ta = w / h, W / H
    if 1.4 <= a <= 2.2:
        s = max(W / w, H / h)
        im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
        l, t = (im.width - W) // 2, (im.height - H) // 2
        canvas = im.crop((l, t, l + W, t + H))
    else:
        s = min(W / w, H / h, 1.25)
        im = im.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
        canvas = Image.new('RGB', (W, H), GROUND)
        canvas.paste(im, ((W - im.width) // 2, (H - im.height) // 2))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    canvas.save(out, 'JPEG', quality=82, optimize=True, progressive=True)
    print('og/%s  %d KB' % (os.path.basename(out), os.path.getsize(out) // 1024))


def main():
    jobs = []
    for pg in MAIN:
        jobs.append((os.path.join(SHOTS, pg['shot'] + '.png'), p('og', pg['key'] + '.jpg')))
    jobs.append((p(TOUR_INDEX['still']), p('og', 'tour.jpg')))
    for key, spec in TOUR_SOURCES.items():
        src = os.path.join(SHOTS, spec['shot'] + '.png') if 'shot' in spec else p(spec['still'])
        jobs.append((src, p('og', key + '.jpg')))
    for pg in objects_pages() + photo_pages():
        jobs.append((p(pg['still']), p('og', pg['key'] + '.jpg')))
    for src, out in jobs:
        card(src, out)
    total = sum(os.path.getsize(o) for _, o in jobs)
    print('%d images, %d KB total' % (len(jobs), total // 1024))


if __name__ == '__main__':
    main()
