#!/usr/bin/env python3
"""Smoke check: the film panel's modes are instant (prototype, preview-beyond).

  pip install playwright && python3 tools/film_still_smoke.py [BASE_URL] [--shots DIR] [--chrome PATH]

The film panel is the reel view (#film/demo-reel): moving (the filmstrip drifts and the clip plays) / still, and
fill / fit. For each switch, in the page, it samples the strip transform, the clip's currentTime and the CSS
transitions / animations running inside the panel, once just before, once synchronously after, and on each of the
next frames. It asserts:
  * moving > still: the strip does not move by one pixel, the clip is paused on the very frame it was showing
    (currentTime unchanged), and nothing is left running (no slide, no ease, no transition, no animation)
  * still > moving: the clip resumes from that same frame and the strip from that same position (no jump back)
  * fill <-> fit: the switch lands on the next frame, with no transition or animation running in the panel
  * the film board's own modes (GJ_DEC film: snap / map / board) land on the next frame too
  * toggling in the middle of a glide freezes the glide where it is
Also: no CSS transition or animation duration on any element of the panel, and no console errors.
Exit status 0 only if every check passes.
"""
import argparse
import json
import os
import sys

from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument('base', nargs='?', default='http://127.0.0.1:8123/tonight/fable-m4/')
ap.add_argument('--shots', default='/tmp/film-still-shots')
ap.add_argument('--chrome', default='/usr/local/bin/google-chrome')
args = ap.parse_args()
BASE = args.base if args.base.endswith('/') else args.base + '/'
os.makedirs(args.shots, exist_ok=True)
FAILS, LOG = [], []


def check(name, ok, detail=''):
    LOG.append(('PASS' if ok else 'FAIL', name, detail))
    print('%s  %s %s' % ('PASS' if ok else 'FAIL', name, detail))
    if not ok:
        FAILS.append(name)


SAMPLER = """
async (act) => {
  const root = document.querySelector('.rl'), tr = root.querySelector('.rl-tr'), stage = root.querySelector('.rl-st');
  const fire = (el, type) => el.dispatchEvent(new PointerEvent(type, {bubbles: true, clientX: innerWidth / 2, clientY: innerHeight / 2, button: 0, pointerType: 'mouse'}));
  const ACT = {
    tap: () => { fire(stage, 'pointerdown'); fire(window, 'pointerup'); },
    space: () => stage.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true})),
    fit: () => root.querySelector('[data-m=fit]').click(),
    fill: () => root.querySelector('[data-m=fill]').click(),
  };
  const px = () => { const m = /translate3d\\((-?[\\d.]+)px/.exec(tr.style.transform); return m ? parseFloat(m[1]) : null };
  const snap = () => {
    const vs = [...root.querySelectorAll('.rl-st video')];
    const on = vs.find(v => v.classList.contains('on')) || vs.find(v => !v.paused) || vs[0];
    const run = document.getAnimations().filter(a => { const t = a.effect && a.effect.target; return t && root.contains(t) && a.playState === 'running' })
      .map(a => (a.transitionProperty ? 'transition:' + a.transitionProperty : 'animation:' + (a.animationName || 'waapi')));
    return {x: px(), t: on ? on.currentTime : null, paused: on ? on.paused : null, src: on ? on.currentSrc.split('/').slice(-2).join('/') : null,
            img: root.querySelector('.rl-im').src.split('/').slice(-2).join('/'), cls: root.className, run: run,
            inset: getComputedStyle(stage).top + ' ' + getComputedStyle(stage).left};
  };
  const raf = () => new Promise(r => requestAnimationFrame(r));
  await raf();
  const before = snap();
  ACT[act]();
  const sync = snap();
  const frames = [];
  for (let i = 0; i < 8; i++) { await raf(); frames.push(snap()); }
  return {before, sync, frames};
}
"""


def run(pw, label, vp, touch):
    print('\n== %s %dx%d ==' % (label, vp[0], vp[1]))
    br = pw.chromium.launch(executable_path=args.chrome, args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
    ctx = br.new_context(viewport={'width': vp[0], 'height': vp[1]}, is_mobile=touch, has_touch=touch)
    pg = ctx.new_page()
    errs = []
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.goto(BASE + '#film/demo-reel')
    pg.wait_for_selector('.rl .rl-tr', timeout=20000)
    pg.wait_for_timeout(2500)

    # clips must really be playing for the check to mean anything
    pg.wait_for_function("[...document.querySelectorAll('.rl-st video')].some(v=>!v.paused&&v.currentTime>0)", timeout=15000)

    # ---- moving -> still ----
    pg.screenshot(path=os.path.join(args.shots, '%s-moving-a.png' % label))
    pg.wait_for_timeout(250)
    pg.screenshot(path=os.path.join(args.shots, '%s-moving-b.png' % label))
    r = pg.evaluate(SAMPLER, 'tap')
    b, s, fr = r['before'], r['sync'], r['frames']
    check('%s moving>still: strip does not move after the toggle' % label, all(f['x'] == b['x'] for f in fr) and s['x'] == b['x'], 'x %s -> %s' % (b['x'], sorted({f['x'] for f in fr})))
    check('%s moving>still: clip pauses at once on its current frame' % label, s['paused'] is True and all(f['t'] == s['t'] and f['paused'] for f in fr) and abs(s['t'] - b['t']) < .08, 't %.3f -> %.3f paused=%s' % (b['t'], s['t'], s['paused']))
    check('%s moving>still: same clip and same still shown' % label, all(f['src'] == b['src'] and f['img'] == b['img'] for f in fr))
    check('%s moving>still: nothing running (no slide, ease, transition or animation)' % label, not s['run'] and all(not f['run'] for f in fr), str(s['run'] + [x for f in fr for x in f['run']])[:120])
    check('%s moving>still: the panel says paused in the same frame' % label, 'paused' in s['cls'])
    pg.screenshot(path=os.path.join(args.shots, '%s-still-a.png' % label))
    pg.wait_for_timeout(400)
    pg.screenshot(path=os.path.join(args.shots, '%s-still-b.png' % label))
    held = pg.evaluate("(()=>{const r=document.querySelector('.rl');return r.querySelector('.rl-tr').style.transform})()")
    check('%s still: position holds over time' % label, held == b['x'] and True or ('translate3d(%spx' % b['x']) in held, held)

    # ---- still -> moving ----
    r = pg.evaluate(SAMPLER, 'space')
    b2, s2, fr2 = r['before'], r['sync'], r['frames']
    check('%s still>moving: clip resumes from the same frame' % label, abs(fr2[0]['t'] - b2['t']) < .12 and fr2[0]['src'] == b2['src'] and not s2['paused'], 't %.3f -> %.3f' % (b2['t'], fr2[0]['t']))
    check('%s still>moving: strip resumes from the same position' % label, abs(fr2[0]['x'] - b2['x']) < 4 and fr2[-1]['x'] < b2['x'], 'x %.1f -> %.1f -> %.1f' % (b2['x'], fr2[0]['x'], fr2[-1]['x']))
    check('%s still>moving: nothing running' % label, not s2['run'] and all(not f['run'] for f in fr2))

    # ---- toggle in the middle of a glide ----
    # a short swipe while moving: on release the strip glides to the nearest shot (260 ms); toggle to still part-way through it
    pg.evaluate("""()=>{const st=document.querySelector('.rl-st'),x=innerWidth/2,y=innerHeight/2;
      const ev=(t,dx)=>new PointerEvent(t,{bubbles:true,clientX:x+dx,clientY:y,button:0,pointerType:'mouse'});
      st.dispatchEvent(ev('pointerdown',0));window.dispatchEvent(ev('pointermove',-60));window.dispatchEvent(ev('pointerup',-60))}""")
    pg.wait_for_timeout(90)
    r = pg.evaluate(SAMPLER, 'tap')
    b3, s3, fr3 = r['before'], r['sync'], r['frames']
    check('%s mid-glide toggle freezes the glide where it is' % label, all(f['x'] == b3['x'] for f in fr3) and s3['paused'] is True, 'x %s -> %s' % (b3['x'], sorted({f['x'] for f in fr3})))
    pg.evaluate(SAMPLER, 'tap')

    # ---- fill <-> fit ----
    for m in ('fit', 'fill'):
        r = pg.evaluate(SAMPLER, m)
        ok_next = ('fit' in r['frames'][0]['cls']) == (m == 'fit')
        check('%s %s: lands on the next frame, no transition or animation' % (label, m), ok_next and not r['sync']['run'] and all(not f['run'] for f in r['frames']) and len({f['inset'] for f in r['frames']}) == 1,
              'inset %s' % sorted({f['inset'] for f in r['frames']}))

    # ---- no CSS transition or animation duration anywhere in the panel ----
    d = pg.evaluate("""()=>{const bad=[];document.querySelectorAll('.rl, .rl *').forEach(e=>{for(const p of [null,'::before','::after']){const s=getComputedStyle(e,p);
      const td=s.transitionDuration.split(',').some(x=>parseFloat(x)>0), ad=s.animationName!=='none'&&s.animationName!==''&&s.animationName.split(',').some(x=>x.trim()!=='none');
      if(td||ad)bad.push(e.className+(p||'')+':'+s.transitionDuration+'/'+s.animationName)}});return bad}""")
    check('%s no transition or animation set anywhere in the film panel' % label, not d, str(d[:4]))

    # ---- the film board's own modes ----
    pg.goto(BASE + '#film/board')
    pg.wait_for_function('window.GJ_DEC&&window.__u1&&__u1.ready', timeout=20000)
    pg.wait_for_timeout(3000)
    for mode in ('map', 'board', 'snap'):
        res = pg.evaluate("""async (m)=>{const raf=()=>new Promise(r=>requestAnimationFrame(r));await raf();GJ_DEC.set('film',m);
          const s0=JSON.stringify(__u1.fsn),fr=[];for(let i=0;i<6;i++){await raf();fr.push(JSON.stringify(__u1.fsn))}
          const run=document.getAnimations().filter(a=>a.playState==='running'&&a.effect&&a.effect.target&&a.effect.target.closest&&a.effect.target.closest('#layer,#gj-tiles')).length;
          return {s0,fr,run,m}}""", mode)
        check('%s film board mode %s: settled on the next frame, nothing travelling' % (label, mode), len(set(res['fr'])) == 1 and res['run'] == 0, '%s -> %s' % (res['s0'], res['fr'][0]))
    pg.evaluate("GJ_DEC.reset()")

    check('%s no console errors / page errors' % label, not errs, str(errs[:3]))
    ctx.close()
    br.close()


with sync_playwright() as pw:
    run(pw, 'desktop', (1280, 800), False)
    run(pw, 'phone', (390, 780), True)

print('\n%d checks, %d failed' % (len(LOG), len(FAILS)))
for f in FAILS:
    print('  FAILED:', f)
with open(os.path.join(args.shots, 'film-still-smoke.json'), 'w') as fh:
    json.dump(LOG, fh, indent=1)
sys.exit(1 if FAILS else 0)
