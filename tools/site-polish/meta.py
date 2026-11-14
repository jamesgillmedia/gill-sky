#!/usr/bin/env python3
"""Add (idempotently) to the existing pages: Open Graph + Twitter card tags, the shared quiet-links stylesheet, and the quiet text links.

    python3 tools/site-polish/meta.py

Everything is written between marker comments, so a re-run replaces the previous output and `git diff` stays small.
r9/ and inside/ are never touched. The tour pages are written by build_tour.py."""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
from lib import OG_BEGIN, OG_END, esc, og_block, p, read, write  # noqa: E402
from pages import MAIN, M4, objects_pages, og_file, photo_pages  # noqa: E402
from photo_alts import PAGE_TO_ID  # noqa: E402

SP_BEGIN, SP_END = '<!-- sp-links:begin -->', '<!-- sp-links:end -->'
CSS_MARK = '<!-- sp-css -->'

LABELS = [
    ('home', M4, 'home'),
    ('list', M4 + 'list/', 'list'),
    ('contact', M4 + 'contact/', 'contact'),
    ('player', M4 + 'player/', 'sound'),
    ('photo-lab', 'photo-lab/', 'photo lab'),
    ('darkroom', 'tonight/photo-lab/', 'darkroom'),
    ('archive', 'tonight/archive/', 'archive'),
    ('objects', 'tonight/objects/', 'objects'),
    ('objects-3d', M4 + 'objects-3d/', 'objects 3d'),
    ('tour', 'tour/', 'tour'),
]
BY_KEY = {k: (path, label) for k, path, label in LABELS}

# per page: which links, and how they sit. flow = footer at the end of a scrolling page; fixed = a short stack pinned in a corner.
LAYOUT = {
    'home': dict(links=['photo-lab', 'darkroom', 'archive', 'objects', 'objects-3d', 'player', 'tour'], mode='home'),
    'contact': dict(links=['home', 'list', 'player', 'photo-lab', 'darkroom', 'archive', 'objects', 'objects-3d', 'tour'], mode='flow'),
    'list': dict(links=['home', 'contact', 'player', 'photo-lab', 'darkroom', 'archive', 'objects', 'objects-3d', 'tour'], mode='flow'),
    'player': dict(links=['home', 'list', 'tour'], mode='fixed', corner='bl', off=10),
    'photo-lab': dict(links=['home', 'darkroom', 'archive', 'tour'], mode='fixed', corner='bl', off=10, scripts=['photo-alts.js']),
    'darkroom': dict(links=['home', 'photo-lab', 'archive', 'tour'], mode='fixed', corner='bl', off=46, scripts=['photo-alts.js']),
    'archive': dict(links=['home', 'photo-lab', 'tour'], mode='fixed', corner='br', off=10),
    'objects': dict(links=['home', 'objects-3d', 'tour'], mode='fixed', corner='bl', off=46),
    'objects-3d': dict(links=['home', 'objects', 'tour'], mode='fixed', corner='bl', off=10),
}
SUB = dict(links=['home', 'list', 'objects', 'tour'], mode='flow')
PHOTO = dict(links=['home', 'list', 'photo-lab', 'tour'], mode='flow')


def rel(from_dir, to_dir):
    r = os.path.relpath(to_dir, from_dir).replace(os.sep, '/')
    return './' if r == '.' else r + '/'


def links_html(page, lay):
    here = page['path']
    items = []
    for k in lay['links']:
        path, label = BY_KEY[k]
        cur = ' aria-current="page"' if path == here else ''
        items.append('<a href="%s"%s>%s</a>' % (rel(here, path), cur, label))
    if lay['mode'] == 'home':
        cls, ident = 'sp-links sp-home', ' id="splinks" hidden'
    elif lay['mode'] == 'flow':
        cls, ident = 'sp-links sp-flow', ''
    else:
        cls, ident = 'sp-links sp-fixed sp-%s' % lay['corner'], ''
    style = ''
    if lay['mode'] == 'fixed' and lay.get('off') not in (None, 10):
        style = ' style="--spl-%s:%dpx"' % ('t' if lay['corner'].startswith('t') else 'b', lay['off'])
    return '%s\n<nav class="%s"%s%s aria-label="More pages">%s</nav>\n%s' % (
        SP_BEGIN, cls, ident, style, ''.join(items), SP_END)


def strip_blocks(h):
    h = re.sub(r'\n?' + re.escape(OG_BEGIN) + r'.*?' + re.escape(OG_END), '', h, flags=re.S)
    h = re.sub(r'\n?' + re.escape(SP_BEGIN) + r'.*?' + re.escape(SP_END) + r'\n?', '\n', h, flags=re.S)
    h = re.sub(r'\n?(?:<link rel="stylesheet" href="[^"]*shared/[a-z0-9-]+\.css">|<script src="[^"]*shared/[a-z0-9-]+\.js" defer></script>)+' + re.escape(CSS_MARK), '', h)
    return h


def process(page, lay):
    f = p(page['path'], 'index.html')
    h = strip_blocks(read(f))
    here = page['path']
    root_rel = rel(here, '.')
    root_rel = '' if root_rel == './' else root_rel
    has_desc = bool(re.search(r'<meta name="description"', h))
    has_canon = bool(re.search(r'<link rel="canonical"', h))
    blk = og_block(page['title'], page['desc'], page['path'], og_file(page), page.get('alt'))
    if has_canon:
        blk = re.sub(r'<link rel="canonical"[^\n]*\n', '', blk, count=1)
    if not has_desc:
        blk = blk.replace(OG_BEGIN + '\n', OG_BEGIN + '\n<meta name="description" content="%s">\n' % esc(page['desc']), 1)
    extra = ''.join('<script src="%sshared/%s" defer></script>' % (root_rel, j) for j in lay.get('scripts', []))
    blk += '\n<link rel="stylesheet" href="%sshared/a11y.css"><link rel="stylesheet" href="%sshared/site-links.css">%s%s' % (root_rel, root_rel, extra, CSS_MARK)
    m = re.search(r'</title>[ \t]*(\r?\n)?', h)
    if not m:
        raise SystemExit('no </title> in ' + f)
    nl = m.group(1) or ''
    h = h[:m.end()] + ('\n' if not nl else '') + blk + '\n' + h[m.end():]
    nav = links_html(page, lay)
    if lay['mode'] == 'home':
        m2 = re.search(r'<p id="foot">.*?</p>\n', h, flags=re.S)
        if not m2:
            raise SystemExit('no #foot in ' + f)
        h = h[:m2.end()] + nav + '\n' + h[m2.end():]
    else:
        i = h.rfind('</body>')
        if i < 0:
            raise SystemExit('no </body> in ' + f)
        h = h[:i] + nav + '\n' + h[i:]
    write(f, h)
    print('meta:', page['path'])


def main():
    by_key = {pg['key']: pg for pg in MAIN}
    for key, lay in LAYOUT.items():
        process(by_key[key], lay)
    for pg in objects_pages():
        process(pg, SUB)
    for pg in photo_pages():
        process(pg, PHOTO)
    listed = {pg['slug'] for pg in photo_pages()}
    for slug in PAGE_TO_ID:
        f = p('tonight', 'fable-m4', 'photo', slug, 'index.html')
        if slug not in listed and os.path.isfile(f):
            write(f, strip_blocks(read(f)))
            print('meta: (unlisted, tags removed)', slug)


if __name__ == '__main__':
    main()
