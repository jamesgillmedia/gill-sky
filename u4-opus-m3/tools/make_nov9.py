"""Writes js/nov9.js from media/nov9/manifest.json: Gill's Nov 9 media, grouped for the boards."""
import json, os
here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
m = json.load(open(os.path.join(here, 'media/nov9/manifest.json')))
SLUG = {'joio.co cup from above': 'joio-co-cup-from-above', 'glazed joio.co cup in hand': 'glazed-joio-co-cup-in-hand',
        'latte in a joio.co cup': 'latte-in-a-joio-co-cup', 'planter cup with moss': 'planter-cup-with-moss',
        'joio.co cup': 'joio-co-cup', 'crescent rim of a cup': 'crescent-rim-of-a-cup', 'holding a joio.co cup': 'holding-a-joio-co-cup',
        'joio.co cup on a board': 'joio-co-cup-on-a-board', 'hand-carved piece': 'hand-carved-piece', 'carved spoon': 'carved-spoon',
        'design board': 'design-board', 'wireframe board': 'wireframe-board', 'materials board': 'materials-board',
        'joio · the studio feed': 'joio'}
out = []
for f in m['files']:
    if not f.get('in_package') or f['category'] not in ('objects', 'film', 'photo'):
        continue
    p = 'media/nov9/' + f['file']
    clip = p if p.endswith('.mp4') else ''
    still = ('media/nov9/' + f['poster']) if clip else p
    thumb = 'media/nov9/thumbs/' + (f['poster'] if clip else f['file'])[:-4] + '-480.webp'
    for q in (p, still, thumb):
        assert os.path.exists(os.path.join(here, q)), q
    name = os.path.splitext(os.path.basename(f['file']))[0]
    lo = f.get('likely_object') or 'unknown'
    out.append({'k': f['category'], 'name': name, 'of': ('objects/' + SLUG[lo]) if lo in SLUG else '',
                'thumb': thumb, 'big': still, 'clip': clip, 'w': f['width'], 'h': f['height']})
open(os.path.join(here, 'js/nov9.js'), 'w').write('window.NOV9=' + json.dumps(out, separators=(',', ':'), ensure_ascii=False) + ';\n')
print(len(out), {k: sum(1 for o in out if o['k'] == k) for k in ('objects', 'film', 'photo')})
