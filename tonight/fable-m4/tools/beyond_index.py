#!/usr/bin/env python3
"""Beyond: the per-asset metadata index for tonight/fable-m4.

Offline only. The site never runs this; it reads the JSON this script writes.

For every gallery still and every clip poster / sample frame the site can show it records
  lum    mean luminance, 0..1  (Rec.709 weights on the display-encoded pixels, i.e. how bright it reads)
  hue    dominant hue, 0..360  (histogram weighted by saturation x value, so grey pixels barely vote)
  chroma mean (max-min) of the pixels, 0..1  (how coloured it is; a black-and-white print is near 0)
  warm   (R-B)/(R+B) of the mean colour, -1..1  (positive leans red / amber, negative leans blue)

Nothing is written back to any image. The Beyond selection only chooses WHICH asset shows and
in what order; no pixel of any frame is ever filtered, tinted or re-graded.

Clip sample frames: each clip in data.json is decoded at four fractions of its length and saved
as a plain frame (no filter) under media/beyond/samples/. They are real frames of the clip, used
as alternate stills for that film's tile, and indexed like every other still.

Usage (from anywhere):
  python3 tonight/fable-m4/tools/beyond_index.py            # reuse sample frames that exist
  python3 tonight/fable-m4/tools/beyond_index.py --force    # re-extract the sample frames
Needs Python 3, Pillow, numpy and ffmpeg on PATH.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
SAMPLE_DIR = 'media/beyond/samples'
SAMPLE_AT = (0.12, 0.38, 0.62, 0.88)
SAMPLE_W = 480
MIN_W = 240
# the Reel 2026 clip is a montage wall of its own: a frame of it is a grid of thumbnails, not a still
MONTAGE = ('media/v3/media/reel/',)
IMG_EXT = ('.webp', '.jpg', '.jpeg', '.png')


def rel(p):
    return p.replace('\\', '/')


def probe_duration(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                          '-of', 'csv=p=0', path], capture_output=True, text=True)
    try:
        return float(out.stdout.strip())
    except ValueError:
        return 0.0


def extract_samples(clip_rel, force):
    """Decode SAMPLE_AT fractions of a clip to plain frames. Returns the relative paths written."""
    src = os.path.join(ROOT, clip_rel)
    base = re.sub(r'[^a-z0-9]+', '-', os.path.splitext(clip_rel)[0].lower()).strip('-')
    base = re.sub(r'^media-', '', base)
    out, dur = [], None
    for n, f in enumerate(SAMPLE_AT):
        dst_rel = '%s/%s-%d.webp' % (SAMPLE_DIR, base, n)
        dst = os.path.join(ROOT, dst_rel)
        if os.path.exists(dst) and not force:
            out.append(dst_rel)
            continue
        if dur is None:
            dur = probe_duration(src)
            if dur <= 0:
                return out
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with tempfile.TemporaryDirectory() as td:
            png = os.path.join(td, 'f.png')
            # scale only; ffmpeg picks the matrix from the stream's own colour tags
            r = subprocess.run(['ffmpeg', '-hide_banner', '-v', 'error', '-y', '-ss', '%.3f' % (dur * f),
                                '-i', src, '-frames:v', '1', '-vf', 'scale=%d:-2' % SAMPLE_W, png],
                               capture_output=True)
            if r.returncode or not os.path.exists(png):
                continue
            Image.open(png).convert('RGB').save(dst, 'WEBP', quality=80, method=4)
        out.append(dst_rel)
    return out


def metrics(path):
    im = Image.open(path)
    w0, h0 = im.size
    im = im.convert('RGB')
    im.thumbnail((96, 96))
    a = np.asarray(im, dtype=np.float32) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = float((0.2126 * r + 0.7152 * g + 0.0722 * b).mean())
    mx, mn = a.max(axis=2), a.min(axis=2)
    d = mx - mn
    chroma = float(d.mean())
    s = np.where(mx > 1e-6, d / np.maximum(mx, 1e-6), 0.0)
    h = np.zeros_like(mx)
    dd = np.maximum(d, 1e-6)
    m = d > 1e-6
    rm = m & (mx == r)
    gm = m & (mx == g) & ~rm
    bm = m & ~rm & ~gm
    h[rm] = (((g - b) / dd)[rm]) % 6
    h[gm] = ((b - r) / dd)[gm] + 2
    h[bm] = ((r - g) / dd)[bm] + 4
    h = h * 60.0
    wgt = s * mx * m
    bins = 72
    hist = np.bincount((h[m] / (360.0 / bins)).astype(int) % bins, weights=wgt[m], minlength=bins)
    if hist.sum() <= 0:
        hue = 0.0
    else:
        sm = hist + 0.5 * (np.roll(hist, 1) + np.roll(hist, -1))
        hue = (float(np.argmax(sm)) + 0.5) * (360.0 / bins)
    mr, mb = float(r.mean()), float(b.mean())
    warm = (mr - mb) / (mr + mb + 1e-6)
    return {'lum': round(lum, 4), 'hue': round(hue, 1), 'chroma': round(chroma, 4),
            'warm': round(warm, 4), 'w': w0, 'h': h0}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--force', action='store_true', help='re-extract clip sample frames')
    ap.add_argument('--out', default=os.path.join(ROOT, 'beyond-index.json'))
    args = ap.parse_args()

    data = json.load(open(os.path.join(ROOT, 'data.json')))
    nov9_src = open(os.path.join(ROOT, 'js/nov9.js')).read()
    nov9 = json.loads(nov9_src[nov9_src.index('['):nov9_src.rindex(']') + 1])

    kinds = {}      # path -> 'still' | 'poster' | 'sample'
    groups = {}     # film card id -> candidate paths, poster first

    def add(path, kind):
        if not path or not isinstance(path, str):
            return None
        if not path.lower().endswith(IMG_EXT):
            return None
        full = os.path.join(ROOT, path)
        if not os.path.exists(full):
            return None
        if Image.open(full).size[0] < MIN_W:  # contact-strip sheets and icons are not stills
            return None
        if kinds.get(path) != 'poster':
            kinds[path] = kind
        return path

    clips = []
    for ch in data['chapters']:
        for card in ch['cards']:
            m = card.get('media') or {}
            cid = card['id']
            pool = []
            poster = add(m.get('thumb'), 'poster')
            if poster:
                pool.append(poster)
            if ch['k'] != 'film':
                p = add(m.get('big'), 'still')
                if p and p not in pool:
                    pool.append(p)
            for p in (m.get('frames') or []) + (card.get('stills') or []) + (card.get('bts') or []):
                p = add(p, 'still')
                if p and p not in pool:
                    pool.append(p)
            for s in card.get('shots') or []:
                if isinstance(s, dict):
                    p = add(s.get('src'), 'still')
                    if p and p not in pool:
                        pool.append(p)
            if ch['k'] == 'film':
                clip = m.get('clip') or m.get('pv') or ''
                num = re.search(r'/(?:sc|pv)/(\d+)\.mp4$', clip)
                fdir = None
                if num:
                    fdir = 'media/pro2/frames/%s' % num.group(1)
                else:
                    t = re.search(r'pro2/frames/(\d+)/', m.get('thumb', ''))
                    if t:
                        fdir = 'media/pro2/frames/%s' % t.group(1)
                if fdir and os.path.isdir(os.path.join(ROOT, fdir)):
                    for fn in sorted(os.listdir(os.path.join(ROOT, fdir))):
                        p = add('%s/%s' % (fdir, fn), 'still')
                        if p and p not in pool:
                            pool.append(p)
                if clip and os.path.exists(os.path.join(ROOT, clip)) and not clip.startswith(MONTAGE):
                    clips.append((cid, clip))
                groups[cid] = pool

    for f in nov9:
        add(f.get('thumb'), 'still')
        add(f.get('big'), 'still')

    n_samples = 0
    for cid, clip in clips:
        for p in extract_samples(clip, args.force):
            add(p, 'sample')
            if p not in groups[cid]:
                groups[cid].append(p)
            n_samples += 1

    assets = {}
    for path in sorted(kinds):
        mt = metrics(os.path.join(ROOT, path))
        mt['k'] = kinds[path]
        assets[path] = mt

    out = {
        'version': 1,
        'generator': 'tools/beyond_index.py',
        'fields': {'lum': 'mean luminance 0..1', 'hue': 'dominant hue 0..360', 'chroma': 'mean max-min 0..1',
                   'warm': '(R-B)/(R+B) of the mean colour, -1..1', 'k': 'still | poster | sample'},
        'count': len(assets),
        'assets': assets,
        'groups': groups,
    }
    with open(args.out, 'w') as fh:
        json.dump(out, fh, separators=(',', ':'), sort_keys=True)
    by = {}
    for a in assets.values():
        by[a['k']] = by.get(a['k'], 0) + 1
    print('wrote %s: %d assets %s, %d film groups, %d clip samples' % (
        os.path.relpath(args.out), len(assets), by, len(groups), n_samples))


if __name__ == '__main__':
    sys.exit(main())
