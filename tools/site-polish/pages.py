"""The page registry: one place that says which pages exist, how they are described for sharing, and what their share image is.

Used by og_images.py (thumbnails), meta.py (share tags + quiet links), sitemap.py (sitemaps) and the tests."""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
from lib import load_stops, p, read  # noqa: E402
from photo_alts import ALTS, PAGE_TO_ID  # noqa: E402

M4 = 'tonight/fable-m4/'

# key: og/<key>.jpg.  shot = (url path, steps) captured by og_shots.js.  still = repo-relative source image.
MAIN = [
    dict(key='home', path=M4, title='Gill James \u00b7 film, photographs, objects and sound',
         desc='Gill James. Film, photographs, objects and sound: one sky, and a page for every piece.',
         shot='home', alt='The Gill James sky: film, photo, objects, sound and about as constellations on a dark ground', links='home'),
    dict(key='contact', path=M4 + 'contact/', title='Contact \u00b7 Gill James',
         desc='How to reach Gill James: email, licensing and the joio.co shop.', shot='contact',
         alt='Contact page: the email address imjamesgill@gmail.com on a dark ground'),
    dict(key='list', path=M4 + 'list/', title='List \u00b7 Gill James',
         desc='Everything on the Gill James site as one list: film, photographs, objects and sound.', shot='list',
         alt='The list page: films with their stills, one under another'),
    dict(key='player', path=M4 + 'player/', title='Sound \u00b7 inside the waveform \u00b7 Gill James',
         desc='Sound: a constellation of songs to tap, and the waveform to dive into.', shot='player',
         alt='The Sound constellation: six song stars and five wind-chime strands on a dark blue sky'),
    dict(key='photo-lab', path='photo-lab/', title='Photo lab \u00b7 Gill James',
         desc='The photo lab: Gill James\u2019s photographs lined up on a horizon, darkest to brightest.', shot='photo-lab',
         alt='Photographs standing on a horizon line, one lit in the middle'),
    dict(key='darkroom', path='tonight/photo-lab/', title='Photo lab and darkroom \u00b7 Gill James',
         desc='The photo lab with its darkroom room: photographs on a horizon, and one at a time in the dark.', shot='darkroom',
         alt='Photographs standing on a horizon line, one lit in the middle'),
    dict(key='archive', path='tonight/archive/', title='Archive index \u00b7 Gill James',
         desc='An index of film frames from Gill James\u2019s work: drag, pinch, and tap a box to lift a frame out.', shot='archive',
         alt='A dense field of small film frames in boxes, grouped by film'),
    dict(key='objects', path='tonight/objects/', title='Objects \u00b7 rings \u00b7 Gill James',
         desc='Objects: Gill James\u2019s cups, carvings and boards as rings you go through.', shot='objects',
         alt='Rings of round object photographs: cups, carvings and boards'),
    dict(key='objects-3d', path=M4 + 'objects-3d/', title='Objects in 3D \u00b7 Gill James',
         desc='Objects in 3D, a prototype: one specimen at a time on a dark ground.', shot='objects-3d',
         alt='A joio cup lit from the side on a dark ground'),
]

TOUR_INDEX = dict(key='tour', path='tour/', title='Gill James \u00b7 preview tour',
                  desc='Nine previews of the Gill James site, one after another: films, photographs and objects.',
                  still='tonight/fable-m4/media/owtd/stills/01_wood_chop.jpg',
                  alt='A still from One With the Devil: a man chopping wood')

# Stills / shots for the tour stops that have their own share image (the others reuse a main page's image, see stops.js).
TOUR_SOURCES = {
    'tour-one-with-the-devil': dict(still='tonight/fable-m4/media/owtd/stills/09_landscape.jpg'),
    'tour-backward-fall': dict(still='tonight/fable-m4/media/films/backward-fall/poster-1600.webp'),
    'tour-film-board': dict(shot='film-board'),
    'tour-demo-reel-card': dict(still='tonight/fable-m4/media/pro2/reel/a/000.webp'),
    'tour-contact-sheet': dict(shot='contact-sheet'),
}


def objects_pages():
    out = []
    d = p('tonight', 'fable-m4', 'objects')
    for slug in sorted(os.listdir(d)):
        f = os.path.join(d, slug, 'index.html')
        if not os.path.isfile(f):
            continue
        h = read(f)
        t = re.search(r'<title>([^<]*)</title>', h).group(1)
        t = re.sub(r'\s*\u00b7\s*Gill James\s*$', '', t)
        m = re.search(r'<figure class="hero"><img src="([^"]*)"', h)
        img = os.path.normpath(os.path.join('tonight/fable-m4/objects', slug, m.group(1))) if m else None
        out.append(dict(key='objects-' + slug, path='%sobjects/%s/' % (M4, slug), title='%s \u00b7 Gill James' % t,
                        desc='%s, from the objects room of the Gill James site.' % (t[0].upper() + t[1:]),
                        still=img, alt=t, links='sub'))
    return out


def photo_pages():
    """The photo pages the list links to. A page nothing links to (photograph-05 today) is left out, so the sitemap never lists an orphan."""
    out = []
    d = p('tonight', 'fable-m4', 'photo')
    listed = set(re.findall(r'href="\.\./photo/([^/"]+)/"', read(p('tonight', 'fable-m4', 'list', 'index.html'))))
    for slug in sorted(os.listdir(d)):
        f = os.path.join(d, slug, 'index.html')
        if slug not in PAGE_TO_ID or slug not in listed or not os.path.isfile(f):
            continue
        h = read(f)
        m = re.search(r'<figure class="hero"><img src="([^"]*)"', h)
        title, alt = ALTS[PAGE_TO_ID[slug]]
        img = os.path.normpath(os.path.join('tonight/fable-m4/photo', slug, m.group(1)))
        out.append(dict(key='photo-' + slug, path='%sphoto/%s/' % (M4, slug), title='%s \u00b7 Gill James' % title,
                        desc='%s. A photograph from the Gill James photo room.' % alt, still=img, alt=alt, links='photo',
                        slug=slug, pid=PAGE_TO_ID[slug], bare_title=title))
    return out


def tour_pages():
    out = [dict(TOUR_INDEX)]
    for s in load_stops():
        out.append(dict(key='tour-' + s['slug'], path='tour/%s/' % s['slug'], title=s['title'], desc=s['desc'], og=s['og']))
    return out


def all_pages():
    """Every page that goes in sitemap.xml, in sitemap order."""
    pages = [dict(x) for x in MAIN]
    pages += objects_pages()
    pages += photo_pages()
    pages += tour_pages()
    return pages


def og_file(page):
    if page.get('og'):
        return 'og/' + page['og']
    return 'og/%s.jpg' % page['key']
