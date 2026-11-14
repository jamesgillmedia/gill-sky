#!/usr/bin/env python3
"""Write tour/index.html and tour/<stop>/index.html (nine real static pages that share tour.css / tour.js).

    python3 tools/site-polish/build_tour.py

Stops come from tour/stops.js. Everything the page needs for crawling and for no-JS use (prev, next, menu, link row, share tags)
is in the markup; tour.js only frames the preview and adds the loading / failure states."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from lib import esc, load_stops, og_block, p, write  # noqa: E402

ICON_PREV = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg>'
ICON_NEXT = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>'
ICON_MENU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.5h10M3 8h10M3 11.5h10"/></svg>'


def page(stops, i, index):
    n = len(stops)
    s = stops[i]
    pv, nx = stops[(i - 1) % n], stops[(i + 1) % n]
    r = '' if index else '../'
    up = '../' if index else '../../'
    home = up + 'tonight/fable-m4/'
    title = (('%s \u00b7 %d of %d \u00b7 ' % (s['title'], i + 1, n)) + 'Gill James preview tour')
    if index:
        title = 'Gill James \u00b7 preview tour'
        og_title = 'Gill James \u00b7 preview tour'
        og_desc = 'Nine previews of the Gill James site, one after another: films, photographs and objects.'
        page_rel, image = 'tour/', 'og/tour.jpg'
        alt = 'The Gill James sky: film, photo, objects and sound as constellations on a dark ground'
    else:
        og_title = '%s \u00b7 Gill James preview tour' % s['title']
        og_desc = s['desc']
        page_rel, image = 'tour/%s/' % s['slug'], 'og/' + s['og']
        alt = None
    desc = og_desc
    menu = ''.join(
        '<a href="%s%s/"%s><span class="n">%d</span><span class="t">%s</span></a>' % (
            r, t['slug'], ' aria-current="true"' if k == i else '', k + 1, esc(t['title']))
        for k, t in enumerate(stops))
    index_link = '<a href="%s"%s>tour index</a>' % (r or './', ' aria-current="page"' if index else '')
    links = (
        '<a href="%s">home</a>' % home +
        index_link +
        '<a class="pn" rel="prev" href="%s%s/">\u2039 %s</a>' % (r, pv['slug'], esc(pv['title'])) +
        '<a class="pn" rel="next" href="%s%s/">%s \u203a</a>' % (r, nx['slug'], esc(nx['title']))
    )
    return '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#050507">
<title>%(title)s</title>
<meta name="description" content="%(desc)s">
%(og)s
<link rel="icon" href="data:,">
<link rel="stylesheet" href="%(up)sshared/offline-collage/collage.css">
<link rel="stylesheet" href="%(r)stour.css">
</head>
<body data-stop="%(n)d"%(idx)s>
<main id="view" aria-label="Preview"><noscript><p style="padding:20px"><a href="%(url)s" style="color:#c9c5bd">Open %(stitle)s</a></p></noscript></main>
<nav id="links" aria-label="More pages">%(links)s</nav>
<nav id="strip" aria-label="Preview tour">
  <a id="prev" rel="prev" href="%(r)s%(pslug)s/" aria-label="Previous preview: %(ptitle)s">%(iprev)s</a>
  <div id="label" role="status" aria-live="polite"><span class="n">%(n)d of %(total)d</span><span class="t">%(stitle)s</span></div>
  <a id="next" rel="next" href="%(r)s%(nslug)s/" aria-label="Next preview: %(ntitle)s">%(inext)s</a>
  <button id="menubtn" type="button" aria-expanded="false" aria-controls="menu" aria-label="All previews">%(imenu)s</button>
  <a id="alone" href="%(url)s" target="_blank" rel="noopener" aria-label="Open this preview alone, outside the frame">open alone</a>
  <div id="menu" aria-label="All previews">%(menu)s</div>
</nav>
<script src="%(up)sshared/analytics/config.js"></script>
<script src="%(up)sshared/analytics/analytics.js"></script>
<script src="%(up)sshared/offline-collage/collage.js"></script>
<script src="%(r)sstops.js"></script>
<script src="%(r)stour.js"></script>
</body>
</html>
''' % dict(
        title=esc(title), desc=esc(desc), og=og_block(og_title, og_desc, page_rel, image, alt), up=up, r=r, n=i + 1, total=n,
        idx=' data-index="1"' if index else '', url=esc(s['url']), stitle=esc(s['title']), links=links,
        pslug=pv['slug'], ptitle=esc(pv['title']), nslug=nx['slug'], ntitle=esc(nx['title']),
        iprev=ICON_PREV, inext=ICON_NEXT, imenu=ICON_MENU, menu=menu)


def main():
    stops = load_stops()
    write(p('tour', 'index.html'), page(stops, 0, True))
    for i, s in enumerate(stops):
        write(p('tour', s['slug'], 'index.html'), page(stops, i, False))
    print('tour: wrote index + %d stops' % len(stops))


if __name__ == '__main__':
    main()
