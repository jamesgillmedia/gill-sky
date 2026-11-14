"""Shared helpers for the site-polish build scripts (stdlib only, plus Pillow for images)."""
import html
import json
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
BASE = 'https://jamesgillmedia.github.io/gill-sky/'
BOARD = 'https://jamesgillmedia.github.io/gilljames/previews/'

OG_BEGIN = '<!-- og:begin -->'
OG_END = '<!-- og:end -->'


def p(*parts):
    return os.path.join(ROOT, *parts)


def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)


def esc(s):
    return html.escape(s, quote=True)


def abs_url(rel):
    """rel is a repo-root-relative path like 'tour/' or 'og/home.jpg'."""
    return BASE + rel.lstrip('/')


def og_block(title, desc, page_rel, image_rel, alt=None, og_type='website'):
    """Open Graph + Twitter card tags. Every URL is absolute."""
    url = abs_url(page_rel)
    img = abs_url(image_rel)
    lines = [
        OG_BEGIN,
        '<link rel="canonical" href="%s">' % esc(url),
        '<meta property="og:type" content="%s">' % og_type,
        '<meta property="og:site_name" content="Gill James">',
        '<meta property="og:title" content="%s">' % esc(title),
        '<meta property="og:description" content="%s">' % esc(desc),
        '<meta property="og:url" content="%s">' % esc(url),
        '<meta property="og:image" content="%s">' % esc(img),
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
    ]
    if alt:
        lines.append('<meta property="og:image:alt" content="%s">' % esc(alt))
    lines += [
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:title" content="%s">' % esc(title),
        '<meta name="twitter:description" content="%s">' % esc(desc),
        '<meta name="twitter:image" content="%s">' % esc(img),
    ]
    if alt:
        lines.append('<meta name="twitter:image:alt" content="%s">' % esc(alt))
    lines.append(OG_END)
    return '\n'.join(lines)


def load_stops():
    src = read(p('tour', 'stops.js'))
    m = re.search(r'window\.GJ_TOUR_STOPS\s*=\s*(\[.*\]);', src, re.S)
    return json.loads(m.group(1))
