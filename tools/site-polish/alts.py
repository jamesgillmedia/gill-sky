#!/usr/bin/env python3
"""Titles and alt text for the photographs.

    python3 tools/site-polish/alts.py

- tonight/fable-m4/photo/<slug>/ : the untitled pages get a short title, the crumb and the picture's alt (text from photo_alts.py).
- photo-lab/ and tonight/photo-lab/ : the no-JS photographs get real alt text. For the pictures the labs draw with script,
  shared/photo-alts.js (written here) swaps the generic "photograph 07" alt for the same text, without touching the labs' own scripts.
Nothing here touches a picture."""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
from lib import esc, p, read, write  # noqa: E402
from photo_alts import ALTS, PAGE_TO_ID  # noqa: E402


def photo_pages():
    d = p('tonight', 'fable-m4', 'photo')
    for slug in sorted(os.listdir(d)):
        f = os.path.join(d, slug, 'index.html')
        if slug not in PAGE_TO_ID or not os.path.isfile(f):
            continue
        title, alt = ALTS[PAGE_TO_ID[slug]]
        h = read(f)
        h = re.sub(r'<title>[^<]*</title>', '<title>%s \u00b7 Gill James</title>' % esc(title), h, count=1)
        h = re.sub(r'<p class="crumb">[^<]*</p>', '<p class="crumb">%s</p>' % esc(title), h, count=1)
        h = re.sub(r'(<figure class="hero"><img src="[^"]*") alt="[^"]*"', lambda m: '%s alt="%s"' % (m.group(1), esc(alt)), h, count=1)
        write(f, h)
    print('alts: photo pages done')


def labs():
    for f in ('photo-lab/index.html', 'tonight/photo-lab/index.html'):
        h = read(p(f))
        h, n = re.subn(r'alt="photograph (\d\d)"', lambda m: 'alt="%s"' % esc(ALTS['p' + m.group(1)][1]), h)
        write(p(f), h)
        print('alts: %s noscript images: %d' % (f, n))


def shared_js():
    data = {k: v[1] for k, v in ALTS.items()}
    js = '''/* Alt text for the photo labs' photographs. The labs draw their pictures with script and label them "photograph 07" / "print 07";
   this swaps that generic alt for a literal description (shared/photo-alts.js, written by tools/site-polish/alts.py).
   It only ever sets the alt attribute: no picture is touched. Pictures the labs mark decorative (alt="") stay decorative. */
(function () {
  'use strict';
  var A = %s;
  var GENERIC = /^(photograph|print) \\d+/;
  var SRC = /\\/p(\\d\\d)\\.webp(?:\\?|$)/;
  function fix(im) {
    var a = im.getAttribute('alt');
    if (a == null || !GENERIC.test(a)) return;
    var m = SRC.exec(im.getAttribute('src') || '');
    if (!m || !A['p' + m[1]]) return;
    var t = A['p' + m[1]];
    if (a !== t) im.setAttribute('alt', t);
  }
  function scan(n) {
    if (n.nodeType !== 1) return;
    if (n.tagName === 'IMG') fix(n);
    else if (n.querySelectorAll) [].forEach.call(n.querySelectorAll('img'), fix);
  }
  function start() {
    scan(document.documentElement);
    new MutationObserver(function (list) {
      list.forEach(function (r) {
        if (r.type === 'attributes') fix(r.target);
        else [].forEach.call(r.addedNodes, scan);
      });
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'alt'] });
  }
  if (document.documentElement) start(); else document.addEventListener('DOMContentLoaded', start);
})();
''' % json.dumps(data, indent=1, ensure_ascii=False)
    write(p('shared', 'photo-alts.js'), js)
    print('alts: shared/photo-alts.js')


if __name__ == '__main__':
    photo_pages()
    labs()
    shared_js()
