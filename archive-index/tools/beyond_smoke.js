/* Smoke check for the archive Beyond dial: node archive-index/tools/beyond_smoke.js [BASE_URL]
   Needs puppeteer-core and a Chrome (CHROME=/path, default /usr/local/bin/google-chrome; SHOTS=/dir for screenshots). Runs 1440 with a mouse and 390 with touch.
   Per viewport: no console errors; one tap opens the dial (big dial only, no mini dials / sub-menu); tap outside, Esc, back and a second tap each close it;
   the dial is opaque with a mist that has pointer-events:none and a blur; every one of the ten detents (off, red, orange, amber, green, teal, blue, violet, mono, light)
   is reachable by a tap on the ring, changes the leading frames, and the ring carries the right hue at its detent (red mode: a red ramp); the colour steps gather a gallery
   and off returns the full field; images never get a CSS filter (field canvas, lifted frame); red mode on and off both work and the colour selection still works in red mode;
   back, Esc and pinch / wheel still work (frame lift, constellation). */
const puppeteer = require('puppeteer-core');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = process.argv[2] || 'http://localhost:8123/archive-index/index.html';
const SHOTS = process.env.SHOTS || '/tmp';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const parse = c => (/rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c) || []).slice(1, 4).map(Number);
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/local/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  for (const phone of [false, true]) {
    const tag = phone ? 'phone 390' : 'desktop 1440', short = phone ? 'phone' : 'desktop', p = await b.newPage(), errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    await p.evaluateOnNewDocument(() => { try { localStorage.clear(); } catch (e) {} });
    await p.setViewport(phone ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { width: 1440, height: 900 });
    await p.goto(BASE + '#order=continuous&boxes=dim', { waitUntil: 'networkidle2' });
    const interstitial = await p.$('button.url-action-button'); if (interstitial) { await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }), interstitial.click()]); }
    await sleep(2500);
    const lvl = () => p.evaluate(() => document.getElementById('bdial').dataset.lvl);
    const settle = async () => { for (let i = 0; i < 60 && await p.evaluate(() => window.__ai.swapping()); i++) await sleep(400); await sleep(500); };
    const tap = async sel => { if (phone) { const r = await p.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; }, sel); await p.touchscreen.tap(r[0], r[1]); } else await p.click(sel); };
    const tapAt = async (x, y) => { if (phone) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); };
    ok(await lvl() === '0', tag + ': closed at load');
    ok(await p.evaluate(() => document.querySelectorAll('.bd-dial').length) === 1, tag + ': one dial only (no depth / drift / orbit / easing minis)');
    const href0 = await p.evaluate(() => location.href);
    await tap('.bd-hub'); await sleep(1400);
    ok(await lvl() === '1', tag + ': one tap on the hub opens the Beyond dial');
    ok(await p.evaluate(() => !document.querySelector('[data-k=depth],[data-k=drift],[data-k=orbit],[data-k=ease]')), tag + ': no mini dials or sub-menu');
    const vis = await p.evaluate(() => { const vw = innerWidth, vh = innerHeight, q = s => { const e = document.querySelector(s), r = e.getBoundingClientRect(), c = getComputedStyle(e); return { in: r.left >= -1 && r.top >= -1 && r.right <= vw + 1 && r.bottom <= vh + 1 && r.width > 20, vis: c.visibility !== 'hidden' && c.display !== 'none' && +c.opacity > .3 }; }; return { hub: q('.bd-hub'), dial: q('.bd-body') }; });
    ok(vis.hub.in && vis.hub.vis, tag + ': the hub is visible and on screen'); ok(vis.dial.in && vis.dial.vis, tag + ': the open dial is visible and fully on screen');
    const css = await p.evaluate(() => { const m = document.querySelector('.bd-mist'), bo = document.querySelector('.bd-body'), cm = getComputedStyle(m), cb = getComputedStyle(bo); return { pe: cm.pointerEvents, bf: cm.backdropFilter || cm.webkitBackdropFilter, bg: cb.backgroundColor }; });
    ok(css.pe === 'none', tag + ': mist has pointer-events:none'); ok(/blur/.test(css.bf), tag + ': backdrop blur on the mist'); ok(/rgb\(\d+, \d+, \d+\)$/.test(css.bg), tag + ': body is an opaque solid (' + css.bg + ')');
    await tapAt(phone ? 60 : 400, phone ? 420 : 450); await sleep(900);
    ok(await lvl() === '0', tag + ': tap outside closes'); ok(await p.evaluate(() => document.getElementById('lt').hidden), tag + ': the outside tap did not open a frame');
    await tap('.bd-hub'); await sleep(900); await p.keyboard.press('Escape'); await sleep(900); ok(await lvl() === '0', tag + ': Esc closes');
    await tap('.bd-hub'); await sleep(900); await p.goBack(); await sleep(900); ok(await lvl() === '0', tag + ': back closes'); ok(await p.evaluate(() => location.href) === href0, tag + ': back stayed on the page');
    await tap('.bd-hub'); await sleep(900); await tap('.bd-hub'); await sleep(900); ok(await lvl() === '0', tag + ': a second hub tap closes');
    // the ten detents
    await tap('.bd-hub'); await sleep(1400);
    const modes = await p.evaluate(() => GJ_BEYOND.MODES.slice()), N1 = modes.length - 1;
    ok(modes.length === 10, tag + ': ten detents (' + modes.join(' / ') + ')');
    const R = await p.evaluate(() => { const s = document.querySelector('.bd-svg'), r = s.getBoundingClientRect(); return { x: r.left, y: r.top, sc: r.width / 160 }; });
    const at = i => { const a = (-135 + 270 * i / N1) * Math.PI / 180; return [R.x + (80 + 62 * Math.sin(a)) * R.sc, R.y + (80 - 62 * Math.cos(a)) * R.sc]; };
    const expect = await p.evaluate(() => { const o = {}; GJ_BEYOND.MODES.forEach(m => o[m] = GJ_BEYOND.STEPCOL[m]); return o; });
    let prev = null, prevPerm = JSON.stringify(await p.evaluate(() => window.__ai.perm()));
    const walk = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    for (const i of walk) {
      const pt = at(i); await tapAt(pt[0], pt[1]); await settle();
      const m = modes[i], st = await p.evaluate(() => ({ mode: GJ_BEYOND.state.mode, perm: JSON.stringify(window.__ai.perm()), gal: window.__ai.gallery(), tick: document.querySelectorAll('.ring-out .bd-tick')[0] && [...document.querySelectorAll('.ring-out .bd-tick')].map(t => t.getAttribute('stroke')), act: document.querySelector('.bd-act').getAttribute('stroke'), c2: document.querySelectorAll('.bd-c2')[0].textContent, c1: document.querySelectorAll('.bd-c1')[0].textContent }));
      ok(st.mode === m, tag + ': detent ' + i + ' snaps to ' + m);
      if (i === 0) ok(st.perm === 'null', tag + ': off returns the full field (no ranking, no gallery)');
      else ok(st.perm !== prevPerm, tag + ': ' + m + ' changes the leading frames (' + st.perm + ')');
      if (i >= 2 && i <= 8) ok(!!st.gal && st.gal.n >= 12 && st.gal.k > 2, tag + ': ' + m + ' gathers a gallery of ' + (st.gal && st.gal.n));
      const tc = parse(st.tick[i]), ex = expect[m];
      ok(tc.every((v, n) => Math.abs(v - ex[n]) <= 2), tag + ': the ring carries the ' + m + ' hue at its detent (' + tc.join(',') + ' ~ ' + ex.join(',') + ')');
      if (i > 0) ok(Math.abs(parse(st.act)[0] - ex[0]) <= 6 && Math.abs(parse(st.act)[2] - ex[2]) <= 6, tag + ': the active arc takes the colour at ' + m);
      if (i > 0) ok(st.c2.length > 0 && (st.c1 + ' ' + st.c2).toLowerCase().indexOf(m === 'mono' ? 'mono' : m) >= 0, tag + ': the label names the step (' + st.c1 + ' ' + st.c2 + ')');
      if ([3, 4, 6].includes(i)) await p.screenshot({ path: SHOTS + '/steps-' + short + '-' + m + '.png' });
      prevPerm = st.perm; prev = i;
    }
    // red mode: the ring stays red-ramped, the colour selection still works on frames
    await p.keyboard.press('Escape'); await sleep(700);
    await tap('.rm-dot'); await sleep(900);
    await tap('.bd-hub'); await sleep(1400);
    const R2 = await p.evaluate(() => { const s = document.querySelector('.bd-svg'), r = s.getBoundingClientRect(); return { x: r.left, y: r.top, sc: r.width / 160 }; });
    const at2 = i => { const a = (-135 + 270 * i / N1) * Math.PI / 180; return [R2.x + (80 + 62 * Math.sin(a)) * R2.sc, R2.y + (80 - 62 * Math.cos(a)) * R2.sc]; };
    const permBefore = JSON.stringify(await p.evaluate(() => window.__ai.perm()));
    const pb = at2(6); await tapAt(pb[0], pb[1]); await settle();
    const rm = await p.evaluate(() => ({ rm: document.documentElement.classList.contains('rm'), mode: GJ_BEYOND.state.mode, perm: JSON.stringify(window.__ai.perm()), gal: !!window.__ai.gallery(), ticks: [...document.querySelectorAll('.ring-out .bd-tick')].map(t => t.getAttribute('stroke')), body: getComputedStyle(document.querySelector('.bd-body')).backgroundColor, filter: getComputedStyle(document.getElementById('cv')).filter }));
    ok(rm.rm && rm.mode === 'blue', tag + ': red mode on, blue detent selected');
    ok(rm.perm !== permBefore && rm.gal, tag + ': the colour selection still works on frames in red mode');
    ok(rm.ticks.slice(1).every(t => { const c = parse(t); return c[0] > c[1] + 20 && c[0] > c[2] + 15; }), tag + ': in red mode the ring stays red-ramped (' + rm.ticks[6] + ')');
    const r1 = parse(rm.ticks[1]), r9 = parse(rm.ticks[9]); ok(r9[0] > r1[0], tag + ': red ramp runs dim to bright');
    ok(/rgb\((\d+), (\d+), (\d+)\)/.test(rm.body) && +/rgb\((\d+)/.exec(rm.body)[1] > +/rgb\(\d+, (\d+)/.exec(rm.body)[1], tag + ': red mode body is dark red (' + rm.body + ')');
    ok(rm.filter === 'none', tag + ': no filter on the images (red mode on)');
    await p.screenshot({ path: SHOTS + '/steps-' + short + '-redmode-blue.png' });
    await p.keyboard.press('Escape'); await sleep(600);
    await tap('.rm-dot'); await sleep(900);
    const roff = await p.evaluate(() => ({ rm: document.documentElement.classList.contains('rm'), filter: getComputedStyle(document.getElementById('cv')).filter }));
    ok(!roff.rm && roff.filter === 'none', tag + ': red mode off works, images filter:none');
    // navigation still works: lift, Esc, back, pinch / wheel to the constellation
    await p.evaluate(() => { location.hash = '#order=continuous&boxes=dim&n=0142'; }); await sleep(1800);
    ok(await p.evaluate(() => !document.getElementById('lt').hidden), tag + ': a frame lifts');
    ok(await p.evaluate(() => getComputedStyle(document.getElementById('ltbox').querySelector('img')).filter) === 'none', tag + ': the lifted frame keeps filter:none');
    await p.keyboard.press('Escape'); await sleep(1100); ok(await p.evaluate(() => document.getElementById('lt').hidden), tag + ': Esc leaves the frame');
    await p.evaluate(() => { location.hash = '#order=continuous&boxes=dim&n=0142'; }); await sleep(1800);
    await p.goBack(); await sleep(1100); ok(await p.evaluate(() => document.getElementById('lt').hidden), tag + ': back leaves the frame');
    await p.evaluate(() => { location.hash = '#order=continuous&boxes=dim&n=0142'; }); await sleep(1800);
    if (phone) { const c = await p.createCDPSession(); const T = (ty, pts) => c.send('Input.dispatchTouchEvent', { type: ty, touchPoints: pts }); const cx = 195, cy = 430;
      for (let n = 0; n < 2; n++) { await T('touchStart', [{ x: cx - 100, y: cy }, { x: cx + 100, y: cy }]); for (let i = 1; i <= 20; i++) { const w = 100 - 75 * i / 20; await T('touchMove', [{ x: cx - w, y: cy }, { x: cx + w, y: cy }]); await sleep(18); } await T('touchEnd', []); await sleep(500); } }
    else { await p.mouse.move(720, 450); for (let i = 0; i < 16; i++) { await p.mouse.wheel({ deltaY: 250 }); await sleep(45); } }
    await sleep(1500); ok(await p.evaluate(() => !document.querySelector('.cstl').hidden), tag + ': pinch / wheel out still reaches the constellation');
    await p.keyboard.press('Escape'); await sleep(1800); ok(await p.evaluate(() => document.querySelector('.cstl').hidden), tag + ': Esc returns from the constellation');
    ok(errs.length === 0, tag + ': no console errors' + (errs.length ? ' ' + JSON.stringify(errs.slice(0, 3)) : ''));
    await p.close();
  }
  await b.close(); console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); process.exit(fails ? 1 : 0);
})();
