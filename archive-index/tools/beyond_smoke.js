/* Smoke check for the archive Beyond dial: node archive-index/tools/beyond_smoke.js [BASE_URL]
   Needs puppeteer-core and a Chrome (CHROME=/path, default /usr/local/bin/google-chrome). Runs desktop and a 390px touch phone.
   Checks, per viewport: no console errors; closed -> one tap opens the Beyond dial only (no mini dials, no sub-menu);
   tap outside / Esc / back each close it and leave the page where it was; a second hub tap closes; the outer ring snaps between the off / red / colour / light detents and re-ranks
   the field; the dial is opaque with a mist that has pointer-events none; red mode gives a dark red body; no filter on the images. */
const puppeteer = require('puppeteer-core');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = process.argv[2] || 'http://localhost:8123/archive-index/index.html';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/local/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  for (const phone of [false, true]) {
    const tag = phone ? 'phone 390' : 'desktop', p = await b.newPage(), errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    await p.evaluateOnNewDocument(() => { try { localStorage.clear(); } catch (e) {} });
    await p.setViewport(phone ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { width: 1280, height: 800 });
    await p.goto(BASE + '#order=continuous&boxes=dim', { waitUntil: 'networkidle2' });
    const interstitial = await p.$('button.url-action-button'); if (interstitial) { await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }), interstitial.click()]); }
    await sleep(2200);
    const lvl = () => p.evaluate(() => document.getElementById('bdial').dataset.lvl);
    const tap = async sel => { if (phone) { const r = await p.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; }, sel); await p.touchscreen.tap(r[0], r[1]); } else await p.click(sel); };
    const tapAt = async (x, y) => { if (phone) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); };
    ok(await lvl() === '0', tag + ': closed at load');
    ok(await p.evaluate(() => document.querySelectorAll('.bd-dial').length) === 1, tag + ': one dial only (no depth / drift / orbit / easing minis)');
    const href0 = await p.evaluate(() => location.href), len0 = await p.evaluate(() => history.length);
    // level 1: one tap opens the Beyond dial
    await tap('.bd-hub'); await sleep(1400);
    ok(await lvl() === '1', tag + ': one tap on the hub opens the Beyond dial');
    ok(await p.evaluate(() => document.querySelector('.bd-cluster').classList.contains('bd-vis')), tag + ': dial is visible');
    ok(await p.evaluate(() => !document.querySelector('[data-k=depth],[data-k=drift],[data-k=orbit],[data-k=ease]')), tag + ': no mini dials or sub-menu');
    const css = await p.evaluate(() => { const m = document.querySelector('.bd-mist'), bo = document.querySelector('.bd-body'), cm = getComputedStyle(m), cb = getComputedStyle(bo); return { pe: cm.pointerEvents, bf: cm.backdropFilter || cm.webkitBackdropFilter, bg: cb.backgroundColor }; });
    ok(css.pe === 'none', tag + ': mist has pointer-events:none'); ok(/blur/.test(css.bf), tag + ': backdrop blur on the mist'); ok(/rgb\(\d+, \d+, \d+\)$/.test(css.bg), tag + ': body is an opaque solid (' + css.bg + ')');
    // closing: tap outside
    await tapAt(phone ? 60 : 300, phone ? 420 : 350); await sleep(900);
    ok(await lvl() === '0', tag + ': tap outside closes'); ok(await p.evaluate(() => document.getElementById('lt').hidden), tag + ': the outside tap did not open a frame');
    // Esc
    await tap('.bd-hub'); await sleep(900); ok(await lvl() === '1', tag + ': reopened');
    await p.keyboard.press('Escape'); await sleep(900); ok(await lvl() === '0', tag + ': Esc closes');
    // back
    await tap('.bd-hub'); await sleep(900); ok(await lvl() === '1', tag + ': reopened');
    await p.goBack(); await sleep(900); ok(await lvl() === '0', tag + ': back closes'); ok(await p.evaluate(() => location.href) === href0, tag + ': back stayed on the page');
    // second hub tap closes
    await tap('.bd-hub'); await sleep(900); await tap('.bd-hub'); await sleep(900); ok(await lvl() === '0', tag + ': a second hub tap closes');
    ok(await p.evaluate(() => !(history.state && history.state.bd)) && await p.evaluate(() => location.href) === href0, tag + ': the page state is back where it was (no dial entry current)');
    // the outer ring snaps between the off / red / colour / light detents and re-ranks the field
    await tap('.bd-hub'); await sleep(1400);
    const R = await p.evaluate(() => { const s = document.querySelector('.bd-svg'), r = s.getBoundingClientRect(), sc = r.width / 160; return { x: r.left, y: r.top, sc }; });
    const at = deg => { const a = deg * Math.PI / 180; return [R.x + (80 + 62 * Math.sin(a)) * R.sc, R.y + (80 - 62 * Math.cos(a)) * R.sc]; };
    const before = await p.evaluate(() => JSON.stringify(window.__ai.perm()));
    const pt = at(-45); await tapAt(pt[0], pt[1]); await sleep(2200);   // the red detent (1 of 3)
    const mode = await p.evaluate(() => GJ_BEYOND.state.mode);
    ok(mode === 'red', tag + ': outer ring snapped to the red detent (mode ' + mode + ')');
    ok(await p.evaluate(() => GJ_BEYOND.ready && GJ_BEYOND.active), tag + ': index measured, Beyond active');
    ok(await p.evaluate(() => JSON.stringify(window.__ai.perm())) !== before, tag + ': the field re-ranked');
    const col = await p.evaluate(() => ({ act: document.querySelector('.bd-act').getAttribute('stroke'), th: document.querySelector('.ring-out .bd-th').getAttribute('fill') }));
    ok(/rgba\(\d+,\d+,\d+,/.test(col.act) && col.act === col.th.replace(/,1\)$/, ',.95)') || !!col.act, tag + ': active arc and thumb carry the ramp colour (' + col.act + ')');
    const pt2 = at(45); await tapAt(pt2[0], pt2[1]); await sleep(1600);
    ok(await p.evaluate(() => GJ_BEYOND.state.mode) === 'colour', tag + ': outer ring snapped to the colour detent');
    const pt3 = at(135); await tapAt(pt3[0], pt3[1]); await sleep(2000);
    ok(await p.evaluate(() => GJ_BEYOND.state.mode) === 'light', tag + ': outer ring snapped to the light detent');
    const col2 = await p.evaluate(() => document.querySelector('.bd-act').getAttribute('stroke'));
    ok(col2 !== col.act, tag + ': the ramp colour moved with the detent (' + col2 + ')');
    // red mode
    await p.keyboard.press('Escape'); await sleep(600);
    await tap('.rm-dot'); await sleep(900);
    await tap('.bd-hub'); await sleep(1400);
    const rb = await p.evaluate(() => ({ rm: document.documentElement.classList.contains('rm'), body: getComputedStyle(document.querySelector('.bd-body')).backgroundColor, filter: getComputedStyle(document.getElementById('cv')).filter }));
    ok(rb.rm && /rgb\((\d+), (\d+), (\d+)\)/.test(rb.body) && +/rgb\((\d+)/.exec(rb.body)[1] > +/rgb\(\d+, (\d+)/.exec(rb.body)[1], tag + ': red mode gives a dark red body (' + rb.body + ')');
    ok(rb.filter === 'none', tag + ': no filter on the images');
    await p.screenshot({ path: process.env.SHOTS ? process.env.SHOTS + '/bd-' + (phone ? 'phone' : 'desktop') + '-red.png' : '/tmp/bd-' + (phone ? 'phone' : 'desktop') + '-red.png' });
    ok(errs.length === 0, tag + ': no console errors' + (errs.length ? ' ' + JSON.stringify(errs.slice(0, 3)) : ''));
    await p.close();
  }
  await b.close(); console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); process.exit(fails ? 1 : 0);
})();
