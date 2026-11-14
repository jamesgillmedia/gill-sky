#!/usr/bin/env python3
"""Fast smoke check for Beyond (prototype, preview-beyond).

  pip install playwright && python3 tools/beyond_smoke.py [BASE_URL] [--shots DIR] [--chrome PATH]

BASE_URL defaults to http://127.0.0.1:8123/tonight/fable-m4/ (serve the repo root: python3 -m http.server 8123).
For a phone (390x780, touch) and a desktop (1280x800) it checks:
  * no console errors, no page errors, no failed requests for Beyond's own files
  * each choice (red, colour, light) visibly changes the selection: the board order and the picked stills differ from
    the normal selection on the film board, the order differs on the photo board, the stills differ on a film page
  * the dial cluster: the hub opens it, the outer ring snaps to the four detents, the inner ring sweeps the value,
    the four camera dials write depth / drift / easing / orbit, the held dial leaves only an ~18% track, the two-step open
    (tap 1 = only the Beyond dial, tap 2 = the depth / drift / easing / orbit dials), one level closed at a time by a tap outside, Esc or back,
    nothing auto-hides, an open cluster never fades, the opaque body / blur / mist (pointer-events none), the state colour ramp
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
        return True
    return False


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
    if visit(pg, BASE + '#film/board'):
        errs.clear()  # the host's own interstitial page logs a blocked ad request; it is not the site
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
    tap = (lambda sel: pg.locator(sel).tap()) if touch else (lambda sel: pg.locator(sel).click())
    lvl = lambda: pg.evaluate('GJ_BEYOND_DIAL.level')
    vis = lambda k: pg.evaluate("(k)=>getComputedStyle(document.querySelector('.bd-dial[data-k='+k+']')).visibility", k)
    settle_dial = lambda: pg.wait_for_timeout(2600)
    # tap 1: only the big Beyond dial
    tap('#bdial .bd-hub')
    settle_dial()
    check('%s dial: tap 1 shows only the Beyond dial' % label, lvl() == 1 and vis('beyond') == 'visible' and all(vis(k) == 'hidden' for k in ('depth', 'drift', 'ease', 'orbit')), 'level %s' % lvl())
    pg.screenshot(path=os.path.join(shots, '%s-dial-level1.png' % label))
    # nothing auto-hides
    pg.wait_for_timeout(7000)
    check('%s dial: nothing auto-hides (still open 7s later)' % label, lvl() == 1 and vis('beyond') == 'visible')
    # the body, the blur and the mist
    body = pg.evaluate("""()=>{const d=document.querySelector('.bd-dial[data-k=beyond]'),b=d.querySelector('.bd-body'),m=d.querySelector('.bd-mist'),sb=getComputedStyle(b),sm=getComputedStyle(m);
      const a=/rgba?\\(([^)]*)\\)/.exec(sb.backgroundColor)[1].split(',').map(parseFloat);
      return {alpha:a.length>3?a[3]:1,bodyBlur:sb.backdropFilter||sb.webkitBackdropFilter,mistBlur:sm.backdropFilter||sm.webkitBackdropFilter,mistPE:sm.pointerEvents,bodyPE:sb.pointerEvents,
              mask:sm.maskImage||sm.webkitMaskImage,radius:sb.borderRadius,opacity:+getComputedStyle(document.getElementById('bdial')).opacity}}""")
    check('%s dial: opaque body, backdrop blur, feathered mist with pointer-events none' % label, body['alpha'] == 1 and 'blur' in body['bodyBlur'] and 'blur' in body['mistBlur'] and body['mistPE'] == 'none' and body['bodyPE'] == 'none' and 'radial' in body['mask'], str(body))
    # an open cluster never fades, even over content
    over = pg.evaluate("""()=>{const r=document.querySelector('.bd-dial[data-k=beyond] .bd-body').getBoundingClientRect(),w=__u1.rects&&__u1.rects.win;
      return {over:!!(w&&r.right>w[0]&&r.left<w[0]+w[2]&&r.bottom>w[1]&&r.top<w[1]+w[3]),cover:document.getElementById('bdial').classList.contains('bd-cover'),op:+getComputedStyle(document.getElementById('bdial')).opacity}}""")
    check('%s dial: open over the board it stays fully visible' % label, over['over'] and not over['cover'] and over['op'] == 1, str(over))
    # tap 2: the sub-menu
    tap('#bdial .bd-hub')
    settle_dial()
    check('%s dial: tap 2 shows the depth / drift / easing / orbit dials' % label, lvl() == 2 and all(vis(k) == 'visible' for k in ('beyond', 'depth', 'drift', 'ease', 'orbit')), 'level %s' % lvl())
    pg.screenshot(path=os.path.join(shots, '%s-dial-expanded.png' % label))
    # Esc steps back one level at a time
    pg.keyboard.press('Escape')
    settle_dial()
    a = (lvl(), vis('beyond'), vis('depth'))
    pg.keyboard.press('Escape')
    settle_dial()
    b = (lvl(), vis('beyond'))
    check('%s dial: Esc closes one level at a time (2 > 1 > 0)' % label, a == (1, 'visible', 'hidden') and b == (0, 'hidden'), '%s then %s' % (a, b))
    # the big dial's centre is the second tap too; tap outside steps back one level
    tap('#bdial .bd-hub')
    settle_dial()
    cc = center(pg, '.bd-dial[data-k=beyond] .ctr')[0]
    pg.touchscreen.tap(*cc) if touch else pg.mouse.click(*cc)
    settle_dial()
    l2 = lvl()
    outside = (4, 300)
    pg.touchscreen.tap(*outside) if touch else pg.mouse.click(*outside)
    settle_dial()
    l1 = lvl()
    pg.touchscreen.tap(*outside) if touch else pg.mouse.click(*outside)
    settle_dial()
    l0 = lvl()
    check('%s dial: big dial centre = second tap; a tap outside closes one level at a time' % label, (l2, l1, l0) == (2, 1, 0), str((l2, l1, l0)))
    # the site's back button closes a level and does not leave the board
    tap('#bdial .bd-hub')
    settle_dial()
    tap('#bdial .bd-hub')
    settle_dial()
    h0 = pg.evaluate('location.hash')
    pg.locator('#back').click() if not touch else pg.locator('#back').tap()
    settle_dial()
    k1 = lvl()
    pg.locator('#back').click() if not touch else pg.locator('#back').tap()
    settle_dial()
    k0 = lvl()
    check('%s dial: back closes one level at a time and stays on the board' % label, (k1, k0) == (1, 0) and pg.evaluate('location.hash') == h0 == '#film/board', str((k1, k0, h0)))
    tap('#bdial .bd-hub')
    settle_dial()
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
            hb = pg.evaluate("[...document.querySelectorAll('.bd-body,.bd-mist')].every(e=>getComputedStyle(e).visibility==='hidden')")
            check('%s dial: held, the bodies step aside so the content can be read' % label, hb)
            check('%s dial: held = rest of the cluster gone at once, active track at ~18%%' % label, hold['hold'] and hold['others'] and abs(hold['ring'] - .18) < .02 and hold['inner'] == 'hidden', str(hold))
            check('%s dial: no CSS transition moves the dial (springs only)' % label, not hold['transition'])
        dr.up(*tk[i])
        pg.wait_for_timeout(200)
        got.append(pg.evaluate('GJ_BEYOND.state.mode'))
        tk = center(pg, '.bd-dial[data-k=beyond] .ring-out .bd-tick')
    check('%s dial: outer ring snaps off > red > colour > light > off' % label, got == ['red', 'colour', 'light', 'off'], str(got))
    # state colour: the outer track ramps from the normal UI colour toward red along the detents; the active bits take the colour at the current position
    rgb = lambda c: [float(x) for x in c[c.index('(') + 1:c.index(')')].split(',')]
    seg = pg.evaluate("[...document.querySelectorAll('.bd-dial[data-k=beyond] .ring-out .bd-seg')].map(s=>s.style.stroke)")
    f, l = rgb(seg[0]), rgb(seg[-1])
    check('%s dial colour: outer track ramps from the UI colour toward red' % label, f[1] > 200 and l[1] < 90 and l[0] > 240 and all(rgb(seg[i])[1] >= rgb(seg[i + 1])[1] for i in range(len(seg) - 1)), '%s -> %s' % (seg[0], seg[-1]))
    cols = {}
    for m in ('off', 'red', 'colour', 'light'):
        pg.evaluate('(m)=>GJ_BEYOND.set({mode:m})', m)
        pg.wait_for_timeout(2600)
        cols[m] = pg.evaluate("""()=>{const d=document.querySelector('.bd-dial[data-k=beyond]');return {thumb:d.querySelector('.ring-out .bd-th').style.fill,label:d.querySelector('.bd-lab.on')&&d.querySelector('.bd-lab.on').style.fill,
          centre:d.querySelector('.bd-c1').style.fill,inner:d.querySelector('.ring-in .bd-th').style.fill,innerSeg:[...d.querySelectorAll('.ring-in .bd-seg')].map(s=>s.style.stroke),hub:document.querySelector('.bd-label b').style.color}}""")
        pg.screenshot(path=os.path.join(shots, '%s-detent-%s.png' % (label, m)), clip={'x': 0, 'y': max(0, vp[1] - 330), 'width': min(vp[0], 420), 'height': 330})
    close = lambda a, b: all(abs(x - y) <= 3 for x, y in zip(rgb(a), rgb(b)))
    gs = [rgb(cols[m]['thumb'])[1] for m in ('off', 'red', 'colour', 'light')]
    check('%s dial colour: thumb, label and centre take the colour at each detent (white to red)' % label, all(gs[i] > gs[i + 1] for i in range(3)) and close(cols['light']['centre'], cols['light']['thumb']) and close(cols['colour']['label'], cols['colour']['thumb']), str([round(g) for g in gs]))
    ins = rgb(cols['light']['innerSeg'][0]), rgb(cols['light']['innerSeg'][-1])
    check('%s dial colour: the inner sweep shifts toward red as it moves' % label, ins[0][1] > ins[1][1] + 80, '%s -> %s' % (cols['light']['innerSeg'][0], cols['light']['innerSeg'][-1]))
    pg.evaluate("GJ_BEYOND.set({mode:'off'})")
    pg.wait_for_timeout(1500)
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
        pg.evaluate('GJ_BEYOND_DIAL.setLevel(2)')
        pg.wait_for_timeout(2400)
        tks = center(pg, '.bd-dial[data-k=%s] .bd-tick' % k)
        mth = center(pg, '.bd-dial[data-k=%s] .bd-th' % k)[0]
        dr.path(mth, tks[idx], 10)
        dr.up(*tks[idx])
        pg.wait_for_timeout(250)
        cam[key] = pg.evaluate('GJ_BEYOND.state.%s' % key)
    pg.evaluate('GJ_BEYOND_DIAL.setLevel(2)')
    pg.wait_for_timeout(2400)
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
    pg.wait_for_timeout(6000)
    check('%s dial: nothing auto-hides after the last release (still at level 2)' % label, lvl() == 2 and vis('depth') == 'visible' and pg.evaluate("+getComputedStyle(document.getElementById('bdial')).opacity") == 1)
    pg.evaluate("localStorage.removeItem('gj.beyond')")

    check('%s no console errors / page errors' % label, not errs, str(errs[:3]))
    mine = [b for b in bad if 'beyond' in b or 'samples' in b]
    check('%s no failed requests for Beyond files' % label, not mine, str(mine[:3]))
    ctx.close()

    # ---- red mode: a dark red body, red mist, and the colour ramp stays inside the reds ----
    rr = br.new_context(viewport={'width': vp[0], 'height': vp[1]}, is_mobile=touch, has_touch=touch)
    rg = rr.new_page()
    visit(rg, BASE + '?theme=red&beyond=colour&bv=.5#film/board')
    rg.wait_for_function('window.GJ_BEYOND&&GJ_BEYOND.ready&&window.__u1&&__u1.ready', timeout=20000)
    rg.wait_for_timeout(2500)
    rg.evaluate('GJ_BEYOND_DIAL.setLevel(2)')
    rg.wait_for_timeout(2600)
    rgb2 = lambda c: [float(x) for x in c[c.index('(') + 1:c.index(')')].split(',')]
    info = rg.evaluate("""()=>{const d=document.querySelector('.bd-dial[data-k=beyond]');return {segs:[...d.querySelectorAll('.ring-out .bd-seg')].map(s=>s.style.stroke),inn:[...d.querySelectorAll('.ring-in .bd-seg')].map(s=>s.style.stroke),
      thumb:d.querySelector('.ring-out .bd-th').style.fill,body:getComputedStyle(d.querySelector('.bd-body')).backgroundColor,mist:getComputedStyle(d.querySelector('.bd-mist')).backgroundImage,
      mistPE:getComputedStyle(d.querySelector('.bd-mist')).pointerEvents,theme:document.documentElement.getAttribute('data-theme')}}""")
    allc = [rgb2(c) for c in info['segs'] + info['inn'] + [info['thumb']]]
    inred = all(c[0] >= 120 and c[1] <= 100 and c[2] <= 112 and c[0] > c[1] * 1.3 for c in allc)
    dim2bright = rgb2(info['segs'][0])[0] < rgb2(info['segs'][-1])[0] and rgb2(info['segs'][0])[1] < rgb2(info['segs'][-1])[1]
    bd = rgb2(info['body'])
    check('%s red mode: the colour ramp stays in the reds, dim to bright' % label, info['theme'] == 'red' and inred and dim2bright, '%s -> %s' % (info['segs'][0], info['segs'][-1]))
    check('%s red mode: dark red body and red mist, mist pointer-events none' % label, bd[0] > bd[1] and bd[0] < 40 and 'rgba(' in info['mist'] and info['mistPE'] == 'none', '%s | %s' % (info['body'], info['mist'][:70]))
    rg.screenshot(path=os.path.join(shots, '%s-dial-red.png' % label))
    rr.close()

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
    check('%s reduced motion: tap 1 shows only the Beyond dial at once' % label, rp.evaluate('GJ_BEYOND_DIAL.level') == 1 and rp.evaluate("getComputedStyle(document.querySelector('.bd-dial[data-k=depth]')).visibility") == 'hidden')
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
