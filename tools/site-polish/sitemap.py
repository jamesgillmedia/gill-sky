#!/usr/bin/env python3
"""Write sitemap.xml, sitemap-images.xml and robots.txt at the repo root.

    python3 tools/site-polish/sitemap.py

Pages come from pages.all_pages() (main pages, objects pages, photo pages, the tour and its nine stops). The image sitemap lists, per page, its share
image and every <img> in its static HTML that has real alt text (decorative alt="" images are left out). All URLs are absolute, under
https://jamesgillmedia.github.io/gill-sky/."""
import os
import re
import sys
from urllib.parse import quote
from xml.sax.saxutils import escape

sys.path.insert(0, os.path.dirname(__file__))
from lib import BASE, p, read, write  # noqa: E402
from pages import all_pages, og_file  # noqa: E402

IMG = re.compile(r'<img\b[^>]*>', re.I)


def attr(tag, name):
    m = re.search(r'\b%s="([^"]*)"' % name, tag)
    if not m:
        return None
    import html
    return html.unescape(m.group(1))


def url(rel):
    return BASE + quote(rel.lstrip('/'), safe="/-._~")


def page_images(pg):
    out = []
    seen = set()
    og = og_file(pg)
    alt = pg.get('alt') or pg['title']
    out.append((og, alt))
    seen.add(og)
    f = p(pg['path'], 'index.html')
    h = read(f)
    for tag in IMG.findall(h):
        src, a = attr(tag, 'src'), attr(tag, 'alt')
        if not src or src.startswith('data:') or src.startswith('http') or not a or not a.strip():
            continue
        rel = os.path.normpath(os.path.join(pg['path'], src)).replace(os.sep, '/')
        if rel in seen or not os.path.isfile(p(rel)):
            continue
        seen.add(rel)
        out.append((rel, a.strip()))
    return out


def main():
    pages = all_pages()
    rows = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for pg in pages:
        rows.append('  <url><loc>%s</loc></url>' % escape(BASE + pg['path']))
    rows.append('</urlset>')
    write(p('sitemap.xml'), '\n'.join(rows) + '\n')

    rows = ['<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">']
    n = 0
    for pg in pages:
        imgs = page_images(pg)
        rows.append('  <url>')
        rows.append('    <loc>%s</loc>' % escape(BASE + pg['path']))
        for rel, a in imgs:
            rows.append('    <image:image><image:loc>%s</image:loc><image:caption>%s</image:caption></image:image>' % (escape(url(rel)), escape(a)))
            n += 1
        rows.append('  </url>')
    rows.append('</urlset>')
    write(p('sitemap-images.xml'), '\n'.join(rows) + '\n')

    write(p('robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: %ssitemap.xml\nSitemap: %ssitemap-images.xml\n' % (BASE, BASE))
    print('sitemap: %d pages, %d images' % (len(pages), n))


if __name__ == '__main__':
    main()
