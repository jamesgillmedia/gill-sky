#!/usr/bin/env python3
"""Fast smoke check for Beyond (prototype, preview-beyond).

  pip install playwright && python3 tools/beyond_smoke.py [BASE_URL] [--shots DIR] [--chrome PATH]

BASE_URL defaults to http://127.0.0.1:8123/tonight/fable-m4/ (serve the repo root: python3 -m http.server 8123).
For a phone (390x780, touch) and a desktop (1280x800) it checks:
  * no console errors, no page errors, no failed requests for Beyond's own files
  * each choice (red, colour, light) visibly changes the selection: the board order and the picked stills differ from
    the normal selection on the film board, the order differs on the photo board, the stills differ on a film page
  * the dial cluster: the hub opens it, the outer ring snaps to the four detents, the inner ring sweeps the value,
    the four camera dials write depth / drift / easing / orbit, the held dial leaves only an ~18% track, the cluster contracts
  * no pixel is touched: no CSS filter anywhere on a still, a tile, a frame or the player
  * Reduce Motion: a changed selection does not travel (no slot animation)
Screenshots of the same film board under normal / red / colour / light go to --shots.
Exit status 0 only if every check passes.
"""
import argparse
import json
import os
import sys

from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument('base', nargs='?', default='http://127.0.0.1:8123/tonight/fable-m4/')
ap.add_argument('--shots', default='/tmp/beyond-shots')
ap.add_argument('--chrome', default='/usr/local/bin/google-chrome')
args = ap.parse_args()
BASE = args.base if args.base.endswith('/') else args.base + '/'
os.makedirs(args.shots, exist_ok=True)

FAILS = []
LOG = []


def check(name, ok, detail=''):
    LOG.append(('PASS' if ok else 'FAIL', name, detail))
    print('%s  %s %s' % ('PASS' if ok else 'FAIL', name, detail))
    if not ok:
        FAILS.append(name)


def visit(pg, url):
    pg.goto(url)
    # raw.githack shows a one-time "One more step" page to browsers; step through it
    pg.wait_for_timeout(400)
    if pg.locator('text=One more step').count():
        pg.locator('text=Open the page').first.click()
        pg.wait_for_timeout(1500)


def settle(pg, ms=400, cap=9000):
    pg.wait_for_timeout(ms)
    t = 0
    while t < cap and pg.evaluate('GJ_BEYOND.moving()'):
        pg.wait_for_timeout(150)
        t += 150
    pg.wait_for_timeout(250)


def tiles(pg, n=14):
    return pg.evaluate('__u1.tiles.slice(0,%d).map(t=>t.id)' % n)


def picks(pg, n=14):
    return pg.evaluate("""(n)=>__u1.tiles.slice(0,n).map(t=>{const it=__u1.byId(t.id);return it&&it._bp||(it&&it.media&&it.media.thumb)||''})""", n)


def center(pg, sel):
    return pg.evaluate("""(s)=>{const e=document.querySelectorAll(s);return [...e].map(x=>{const r=x.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})}""", sel)


class Drag:
    """Mouse on desktop, real touch events (CDP) on the phone."""

    def __init__(self, pg, touch):
        self.pg, self.touch = pg, touch
        self.cdp = pg.context.new_cdp_session(pg) if touch else None

    def _t(self, kind, x, y):
        pts = [] if kind == 'touchEnd' else [{'x': x, 'y': y, 'id': 1}]
        self.cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': pts})

    def down(self, x, y):
        if self.touch:
            self._t('touchStart', x, y)
        else:
            self.pg.mouse.move(x, y)
            self.pg.mouse.down()

    def move(self, x, y):
        if self.touch:
            self._t('touchMove', x, y)
        else:
            self.pg.mouse.move(x, y)

    def up(self, x=0, y=0):
        if self.touch:
            self._t('touchEnd', x, y)
        else:
            self.pg.mouse.up()

    def path(self, a, b, steps=14):
        self.down(*a)
        for i in range(1, steps + 1):
            self.pg.wait_for_timeout(18)
            self.move(a[0] + (b[0] - a[0]) * i / steps, a[1] + (b[1] - a[1]) * i / steps)


def run(pw, label, vp, touch, shots):
    print('\n== %s %dx%d ==' % (label, vp[0], vp[1]))
    br = pw.chromium.launch(executable_path=args.chrome, args=['--no-sandbox'])
    ctx = br.new_context(viewport={'width': vp[0], 'height': vp[1]}, is_mobile=touch, has_touch=touch, device_scale_factor=1)
    pg = ctx.new_page()
    errs, bad = [], []
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.on('requestfailed', lambda r: bad.append('FAILED ' + r.url))
    pg.on('response', lambda r: bad.append('%d %s' % (r.status, r.url)) if r.status >= 400 else None)

    # ---- film board: each choice changes the selection ----
    visit(pg, BASE + '#film/board')
    pg.wait_for_function('window.GJ_BEYOND&&GJ_BEYOND.ready&&window.__u1&&__u1.ready', timeout=20000)
    pg.wait_for_timeout(2500)
    base_ids, base_pk = tiles(pg), picks(pg)
    check('%s film board: normal order untouched' % label, base_ids[:5] == ['film/one-with-the-devil', 'film/weird-kid', 'film/back-to-the-start', 'film/backward-fall', 'film/legends'], str(base_ids[:3]))
    shot = os.path.join(shots, '%s-film-normal.png' % label)
    pg.screenshot(path=shot)
    states = {'red': {'mode': 'red', 'red': .85}, 'colour': {'mode': 'colour', 'colour': .59}, 'light': {'mode': 'light', 'light': .88}}
    seen = {}
    for name, patch in states.items():
        pg.evaluate('(p)=>GJ_BEYOND.set(p)', patch)
        settle(pg)
        ids, pk = tiles(pg), picks(pg)
        seen[name] = (ids, pk)
        moved = sum(1 for a, b in zip(ids, base_ids) if a != b)
        swapped = sum(1 for a, b in zip(pk, base_pk) if a != b)
        check('%s film board: %s reorders and swaps' % (label, name), moved >= 6 and swapped >= 6, 'moved %d swapped %d of %d' % (moved, swapped, len(ids)))
        pg.screenshot(path=os.path.join(shots, '%s-film-%s.png' % (label, name)))
    check('%s film board: the three choices differ from each other' % label, len({tuple(v[0]) for v in seen.values()}) == 3 and len({tuple(v[1]) for v in seen.values()}) == 3)
    # darkness really follows the choice: the red pick is darker than the light pick
    lum = pg.evaluate("""(arr)=>arr.map(l=>l.map(p=>{const m=GJ_BEYOND.meta(p);return m?m.lum:null}).filter(v=>v!=null).reduce((a,b)=>a+b,0)/Math.max(1,l.filter(p=>GJ_BEYOND.meta(p)).length))""", [seen['red'][1], seen['light'][1]])
    check('%s red picks are darker than light picks' % label, lum[0] < lum[1], 'mean lum red %.3f light %.3f' % tuple(lum))
    # light slider sweeps dark -> bright
    pg.evaluate("GJ_BEYOND.set({mode:'light',light:.05})")
    settle(pg)
    lo = pg.evaluate("""()=>__u1.tiles.slice(0,14).map(t=>{const it=__u1.byId(t.id);const p=(it&&it._bp)||(it&&it.media&&it.media.thumb);const m=GJ_BEYOND.meta(p);return m?m.lum:.3}).reduce((a,b)=>a+b,0)/14""")
    pg.evaluate("GJ_BEYOND.set({light:.95})")
    settle(pg)
    hi = pg.evaluate("""()=>__u1.tiles.slice(0,14).map(t=>{const it=__u1.byId(t.id);const p=(it&&it._bp)||(it&&it.media&&it.media.thumb);const m=GJ_BEYOND.meta(p);return m?m.lum:.3}).reduce((a,b)=>a+b,0)/14""")
    check('%s light slider: dark end < bright end' % label, lo < hi, 'lum %.3f -> %.3f' % (lo, hi))

    # ---- no filter anywhere ----
    f = pg.evaluate("""()=>{const bad=[];document.querySelectorAll('img,video,canvas,.gj-box,#gj-tiles,#cv').forEach(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);if(!r.width||!r.height||e.closest('[hidden]'))return;if(s.filter&&s.filter!=='none')bad.push(e.tagName+'.'+e.className+':'+s.filter)});return bad}""")
    check('%s no CSS filter on any still, clip, tile or canvas' % label, not f, str(f[:3]))

    # ---- photo board ----
    pg.evaluate("GJ_BEYOND.set({mode:'off'})")
    visit(pg, BASE + '#photo/board')
    pg.wait_for_timeout(2500)
    p0 = tiles(pg, 12)
    pg.evaluate("GJ_BEYOND.set({mode:'light',light:.9})")
    settle(pg)
    p1 = tiles(pg, 12)
    check('%s photo board: light reorders the stills' % label, sum(1 for a, b in zip(p0, p1) if a != b) >= 6, '%d of 12 moved' % sum(1 for a, b in zip(p0, p1) if a != b))
    pg.screenshot(path=os.path.join(shots, '%s-photo-light.png' % label))
    pg.evaluate("GJ_BEYOND.set({mode:'off'})")

    # ---- a film page ----
    visit(pg, BASE + '#film/back-to-the-start')
    pg.wait_for_timeout(3500)
    strip = lambda: pg.evaluate("[...document.querySelectorAll('.fp-strip img')].map(i=>i.getAttribute('src'))")
    s0 = strip()
    pg.evaluate("GJ_BEYOND.set({mode:'red',red:.85})")
    settle(pg, 600)
    s1 = strip()
    pg.evaluate("GJ_BEYOND.set({mode:'light',light:.9})")
    settle(pg, 600)
    s2 = strip()
    check('%s film page: stills swap under red and light' % label, s0 != s1 and s1 != s2 and len(s0) == len(s1) == len(s2), '%d / %d swapped' % (sum(a != b for a, b in zip(s0, s1)), sum(a != b for a, b in zip(s1, s2))))
    pg.evaluate("GJ_BEYOND.set({mode:'off'})")
    settle(pg, 600)
    check('%s film page: off restores the page\'s own stills' % label, strip() == s0)

    # ---- the dial cluster ----
    visit(pg, BASE + '#film/board')
    pg.wait_for_timeout(3000)
    dr = Drag(pg, touch)
    check('%s dial: hub is there on the film board' % label, pg.evaluate("!document.getElementById('bdial').hidden"))
    pg.evaluate("document.querySelector('#bdial .bd-hub').click()")
    pg.wait_for_timeout(1800)
    check('%s dial: hub expands the cluster' % label, pg.evaluate("document.getElementById('bdial').classList.contains('bd-open')"))
    pg.screenshot(path=os.path.join(shots, '%s-dial-expanded.png' % label))
    # outer ring: drag the thumb to each detent
    tk = center(pg, '.bd-dial[data-k=beyond] .ring-out .bd-tick')
    th = center(pg, '.bd-dial[data-k=beyond] .ring-out .bd-th')[0]
    got = []
    for i, want in ((1, 'red'), (2, 'colour'), (3, 'light'), (0, 'off')):
        th = center(pg, '.bd-dial[data-k=beyond] .ring-out .bd-th')[0]
        dr.path(th, tk[i], 10)
        pg.wait_for_timeout(120)
        if i == 3:
            hold = pg.evaluate("""()=>({hold:document.getElementById('bdial').classList.contains('bd-hold'),
              others:[...document.querySelectorAll('.bd-dial:not(.bd-act)')].every(d=>getComputedStyle(d).visibility==='hidden'),
              ring:+getComputedStyle(document.querySelector('.bd-dial.bd-act .ring-out')).opacity,
              inner:getComputedStyle(document.querySelector('.bd-dial.bd-act .ring-in')).visibility,
              transition:[...document.querySelectorAll('#bdial *')].some(e=>parseFloat(getComputedStyle(e).transitionDuration)>0&&!e.matches('#bdial'))})""")
            pg.screenshot(path=os.path.join(shots, '%s-dial-held.png' % label))
            check('%s dial: held = rest of the cluster gone at once, active track at ~18%%' % label, hold['hold'] and hold['others'] and abs(hold['ring'] - .18) < .02 and hold['inner'] == 'hidden', str(hold))
            check('%s dial: no CSS transition moves the dial (springs only)' % label, not hold['transition'])
        dr.up(*tk[i])
        pg.wait_for_timeout(200)
        got.append(pg.evaluate('GJ_BEYOND.state.mode'))
        tk = center(pg, '.bd-dial[data-k=beyond] .ring-out .bd-tick')
    check('%s dial: outer ring snaps off > red > colour > light > off' % label, got == ['red', 'colour', 'light', 'off'], str(got))
    # land on colour, then sweep the inner ring
    th = center(pg, '.bd-dial[data-k=beyond] .ring-out .bd-th')[0]
    dr.path(th, tk[2], 10)
    dr.up(*tk[2])
    pg.wait_for_timeout(300)
    mj = center(pg, '.bd-dial[data-k=beyond] .ring-in .bd-maj')
    ith = center(pg, '.bd-dial[data-k=beyond] .ring-in .bd-th')[0]
    before = pg.evaluate('GJ_BEYOND.state.colour')
    dr.path(ith, mj[3], 12)
    pg.wait_for_timeout(300)
    mid = pg.evaluate('GJ_BEYOND.state.colour')
    inner_hold = pg.evaluate("""()=>({outer:getComputedStyle(document.querySelector('.bd-dial.bd-act .ring-out')).visibility,ring:+getComputedStyle(document.querySelector('.bd-dial.bd-act .ring-in')).opacity})""")
    dr.up(*mj[3])
    pg.wait_for_timeout(300)
    after = pg.evaluate('GJ_BEYOND.state.colour')
    check('%s dial: inner ring sweeps the hue family' % label, abs(after - before) > .2 and abs(after - .75) < .12, 'colour %.2f -> %.2f (%s)' % (before, after, pg.evaluate('GJ_BEYOND.hueName(GJ_BEYOND.hueDeg(GJ_BEYOND.state.colour))')))
    check('%s dial: inner hold anchors the inner track at ~18%%' % label, inner_hold['outer'] == 'hidden' and abs(inner_hold['ring'] - .18) < .02, str(inner_hold))
    # camera dials
    cam = {}
    for k, idx, key in (('depth', 3, 'depth'), ('ease', 0, 'ease'), ('orbit', 1, 'orbit')):
        pg.evaluate("document.querySelector('#bdial .bd-hub').getAttribute('aria-expanded')==='true'||document.querySelector('#bdial .bd-hub').click()")
        pg.wait_for_timeout(1200)
        tks = center(pg, '.bd-dial[data-k=%s] .bd-tick' % k)
        mth = center(pg, '.bd-dial[data-k=%s] .bd-th' % k)[0]
        dr.path(mth, tks[idx], 10)
        dr.up(*tks[idx])
        pg.wait_for_timeout(250)
        cam[key] = pg.evaluate('GJ_BEYOND.state.%s' % key)
    pg.evaluate("document.querySelector('#bdial .bd-hub').getAttribute('aria-expanded')==='true'||document.querySelector('#bdial .bd-hub').click()")
    pg.wait_for_timeout(1200)
    dth = center(pg, '.bd-dial[data-k=drift] .bd-th')[0]
    dtk = center(pg, '.bd-dial[data-k=drift] .bd-tick')
    d0 = pg.evaluate('GJ_BEYOND.state.drift')
    dr.path(dth, (dth[0] + 14, dth[1] - 10), 8)
    dr.up(dth[0] + 14, dth[1] - 10)
    pg.wait_for_timeout(250)
    d1 = pg.evaluate('GJ_BEYOND.state.drift')
    check('%s dial: depth / easing / orbit detents write the camera state' % label, cam == {'depth': 3, 'ease': 0, 'orbit': 1}, str(cam))
    check('%s dial: drift dial moves the drift speed' % label, abs(d1 - d0) > .02, '%.2f -> %.2f' % (d0, d1))
    # the same springs: the selected easing is the one the swaps use
    c = pg.evaluate('GJ_BEYOND.cam()')
    check('%s dial: easing/depth/drift/orbit are what the swaps use' % label, c['ease']['k'] == 'soft' and abs(c['w'] - 3.2 * c['spd']) < .01 and c['yaw'] > 0 and c['z'] > 120 * 2.3, 'w %.2f z %.0f yaw %.2f' % (c['w'], c['z'], c['yaw']))
    t = 0
    while t < 9000 and pg.evaluate("document.getElementById('bdial').classList.contains('bd-open')"):
        pg.wait_for_timeout(250)
        t += 250
    check('%s dial: the cluster contracts after release' % label, t < 9000, 'closed after %.1fs' % (t / 1000 + 0))
    pg.evaluate("localStorage.removeItem('gj.beyond')")

    check('%s no console errors / page errors' % label, not errs, str(errs[:3]))
    mine = [b for b in bad if 'beyond' in b or 'samples' in b]
    check('%s no failed requests for Beyond files' % label, not mine, str(mine[:3]))
    ctx.close()

    # ---- Reduce Motion ----
    rc = br.new_context(viewport={'width': vp[0], 'height': vp[1]}, reduced_motion='reduce', is_mobile=touch, has_touch=touch)
    rp = rc.new_page()
    rerr = []
    rp.on('pageerror', lambda e: rerr.append(str(e)))
    visit(rp, BASE + '#film/board')
    rp.wait_for_function('window.GJ_BEYOND&&GJ_BEYOND.ready&&window.__u1&&__u1.ready', timeout=20000)
    rp.wait_for_timeout(2500)
    r0 = tiles(rp)
    rp.evaluate("GJ_BEYOND.set({mode:'red',red:.85})")
    rp.wait_for_timeout(500)
    anim = rp.evaluate("GJ_BEYOND.moving()")
    r1 = tiles(rp)
    check('%s reduced motion: the selection changes and does not travel' % label, r0 != r1 and not anim, 'moving=%s' % anim)
    rp.evaluate("document.querySelector('#bdial .bd-hub').click()")
    rp.wait_for_timeout(120)
    tr = rp.evaluate("document.querySelector('.bd-dial[data-k=beyond]').style.transform")
    check('%s reduced motion: the cluster opens at its end pose at once' % label, 'translate3d(0px,0px,28px)' in tr.replace(' ', ''), tr)
    check('%s reduced motion: no page errors' % label, not rerr)
    rc.close()
    br.close()


with sync_playwright() as pw:
    run(pw, 'desktop', (1280, 800), False, args.shots)
    run(pw, 'phone', (390, 780), True, args.shots)

print('\n%d checks, %d failed' % (len(LOG), len(FAILS)))
for f in FAILS:
    print('  FAILED:', f)
with open(os.path.join(args.shots, 'smoke.json'), 'w') as fh:
    json.dump(LOG, fh, indent=1)
sys.exit(1 if FAILS else 0)
