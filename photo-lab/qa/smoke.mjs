// Photo lab smoke + emulation harness.
// iPhone, Android, iPad and desktop, each with the safelight (darkroom) on and off:
//   - no console errors, page errors, failed requests or 4xx/5xx (404s)
//   - every img/video computes filter:none (and, with the darkroom on, no filter/blend on any ancestor either)
//   - navigation: pinch (touch / ctrl+wheel) round the whole loop, Esc, phone back (history.back), the ‹ button, camera back levels
//   - safelight toggle + localStorage persistence
//   - darkroom on: the palette audit (computed styles, stylesheet literals, pixels) at every layer, hover and keyboard focus
//
//   node smoke.mjs [--url http://host/photo-lab/] [--out dir] [--only iphone,desktop]
// Exit code 1 if anything fails. Writes report.json into --out.
import fs from 'node:fs';
import path from 'node:path';
import { chromium, devices } from 'playwright-core';
import { serve } from './serve.mjs';
import { launch, auditDom, auditCss, auditPixels, contrastReport } from './palette-audit.mjs';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('out', '/tmp/photo-lab-qa');
const ONLY = (arg('only', '') || '').split(',').filter(Boolean);
fs.mkdirSync(OUT, { recursive: true });

const PROFILES = [
  { id: 'iphone', label: 'iPhone 14', opts: devices['iPhone 14'] },
  { id: 'android', label: 'Pixel 7 (Android)', opts: devices['Pixel 7'] },
  { id: 'ipad', label: 'iPad (gen 7)', opts: devices['iPad (gen 7)'] },
  { id: 'desktop', label: 'Desktop 1440x900', opts: { viewport: { width: 1440, height: 900 } } },
].filter((p) => !ONLY.length || ONLY.includes(p.id));

let srv, base = arg('url');
if (!base) { srv = await serve(); base = `http://127.0.0.1:${srv.port}/photo-lab/`; }
const browser = await launch();
const results = [], contrast = {};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function run(profile, safe) {
  const name = `${profile.id}-${safe ? 'safe' : 'plain'}`;
  const touch = !!profile.opts.hasTouch;
  const ctx = await browser.newContext({ ...profile.opts });
  await ctx.addInitScript((v) => { if (!sessionStorage.getItem('qa-init')) { sessionStorage.setItem('qa-init', '1'); try { localStorage.setItem('gj-photo-lab-safelight', v); } catch (e) {} } }, safe ? '1' : '0');
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  const checks = [], issues = { console: [], pageerror: [], failed: [], http: [] };
  const ok = (label, pass, detail = '') => { checks.push({ label, pass: !!pass, detail }); if (!pass) console.log(`  FAIL ${name}: ${label} ${detail}`); };
  page.on('console', (m) => { if (m.type() === 'error') issues.console.push(m.text()); });
  page.on('pageerror', (e) => issues.pageerror.push(String(e)));
  page.on('requestfailed', (r) => { const f = r.failure()?.errorText || ''; if (!/ERR_ABORTED/.test(f)) issues.failed.push(`${r.url()} ${f}`); });
  page.on('response', (r) => { if (r.status() >= 400) issues.http.push(`${r.status()} ${r.url()}`); });

  const top = () => page.evaluate(() => LAB.layer.top());
  const depth = () => page.evaluate(() => LAB.layer.depth());
  const sheetOpen = () => page.evaluate(() => document.body.classList.contains('sheet-open'));
  const where = async () => (await sheetOpen()) && (await depth()) === 0 ? 'sheet' : (await top()) || 'sheet';
  const expectAt = async (label, want, ms = 1300) => { await wait(ms); const w = await where(); ok(label, w === want, `at "${w}", wanted "${want}"`); };
  const tapAt = async (x, y) => (touch ? page.touchscreen.tap(x, y) : page.mouse.click(x, y));
  const pinch = async (dir, sel) => {
    const r = await page.evaluate((s) => { const e = document.querySelector(s); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height * 0.45 }; }, sel);
    if (!touch) { await cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: r.x, y: r.y, deltaX: 0, deltaY: dir === 'in' ? -120 : 120, modifiers: 2 }); return; }
    const a0 = 40, a1 = dir === 'in' ? 130 : 12, pts = (a) => [{ x: r.x - a, y: r.y, id: 1 }, { x: r.x + a, y: r.y, id: 2 }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(a0) });
    for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(a0 + (a1 - a0) * i / 8) }); await wait(18); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  const shot = async (label) => { if (safe) await page.screenshot({ path: path.join(OUT, `${name}-${label}.png`) }); };
  let cssDone = false;
  const audit = async (label, extra = {}) => {
    await shot(label);
    if (!safe) return;
    const dom = await auditDom(page);
    ok(`[${label}] darkroom class on html+body`, dom.safe);
    ok(`[${label}] palette dom (${dom.checked} el, ${dom.tokens} values)`, dom.bad.length === 0, JSON.stringify(dom.bad.slice(0, 3)));
    ok(`[${label}] img/video filter:none (${dom.media})`, dom.filtered.length === 0 && dom.media > 0, JSON.stringify(dom.filtered.slice(0, 2)));
    ok(`[${label}] no filter/blend on any media ancestor`, dom.ancestorFilter.length === 0 && dom.blend.length === 0, JSON.stringify(dom.ancestorFilter.slice(0, 3)));
    if (!cssDone) { cssDone = true; const css = await auditCss(page); ok(`palette css (${css.safeRules} .safe rules, ${css.literals} literals)`, css.bad.length === 0, JSON.stringify(css.bad.slice(0, 3))); }
    const px = await auditPixels(page, label);
    ok(`[${label}] palette pixels (${px.pixels} px, brightest L ${px.brightestLightness})`, px.offPalette === 0, JSON.stringify(px.samples.slice(0, 3)) + ` off=${px.offPalette}`);
    if (extra.contrast) (contrast[name] = contrast[name] || {})[label] = await contrastReport(page);
  };
  const plainFilter = async (label) => {
    if (safe) return;
    const f = await page.evaluate(() => [...document.querySelectorAll('img,video')].filter((m) => m.getBoundingClientRect().width > 0 && getComputedStyle(m).filter !== 'none').length);
    ok(`[${label}] img/video filter:none (safelight off)`, f === 0, `${f} filtered`);
  };

  await page.goto(base, { waitUntil: 'load' });
  await wait(1800);
  ok('boots at the horizon', (await top()) === 'horizon');
  ok(`safelight ${safe ? 'on' : 'off'} from localStorage`, (await page.evaluate(() => document.body.classList.contains('safe'))) === safe);
  ok('safe button aria-pressed matches', (await page.getAttribute('#safe', 'aria-pressed')) === String(safe));
  await audit('1-horizon', { contrast: true });
  await plainFilter('horizon');

  // hover + keyboard focus states
  if (!touch) {
    await page.hover('#sort'); await wait(700);
    await audit('1b-hover');
    await page.mouse.move(5, 400);
    await page.focus('body'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await wait(300);
    const ring = await page.evaluate(() => { const e = document.activeElement; const c = getComputedStyle(e); return { el: e.id || e.className, style: c.outlineStyle, width: c.outlineWidth, color: c.outlineColor }; });
    ok('keyboard focus ring is drawn', ring.style !== 'none' && parseFloat(ring.width) > 0, JSON.stringify(ring));
    if (safe) ok('keyboard focus ring is accent red', ring.color === 'rgb(236, 63, 34)', ring.color);
    if (safe) await audit('1c-focus');
    await page.evaluate(() => document.activeElement.blur());
  }

  // contact sheet
  await page.click('#sheetBtn'); await expectAt('sheet button opens the contact sheet', 'sheet');
  await audit('2-sheet', { contrast: true }); await plainFilter('sheet');
  // scrollbar on the sheet scroller
  if (safe) { const sb = await page.evaluate(() => getComputedStyle(document.getElementById('sc')).scrollbarColor); ok('sheet scroller has a red scrollbar', /rgb\(92, 20, 12\)/.test(sb), sb); }
  await page.evaluate(() => document.getElementById('sc').scrollTo(0, 900)); await wait(500);
  await audit('2b-sheet-scrolled');
  await page.locator('.cell').nth(5).scrollIntoViewIfNeeded();
  const cell = page.locator('.cell').nth(5);
  touch ? await cell.tap() : await cell.click();
  await expectAt('tapping a sheet cell goes to the horizon', 'horizon');

  // day via tap on the standing print
  const cur = await page.evaluate(() => { const b = document.querySelector('.fm.cur').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
  await tapAt(cur.x, cur.y); await expectAt('tap on the standing print opens its day', 'day', 1600);
  await audit('3-day', { contrast: true }); await plainFilter('day');
  await page.evaluate(() => document.getElementById('dsc').scrollTo(0, 1400)); await wait(700);
  await audit('3b-day-stack'); await plainFilter('day stack');
  await page.keyboard.press('Escape'); await expectAt('Esc rises from the day to the horizon', 'horizon');

  // phone back and the back button
  await tapAt(cur.x, cur.y); await expectAt('day again', 'day', 1600);
  await page.goBack(); await expectAt('browser/phone back rises from the day', 'horizon');
  await tapAt(cur.x, cur.y); await expectAt('day a third time', 'day', 1600);
  touch ? await page.tap('#back') : await page.click('#back'); await expectAt('the ‹ button rises from the day', 'horizon');

  // camera back
  touch ? await page.tap('#cam') : await page.click('#cam'); await expectAt('camera button opens the camera back', 'camera back', 1500);
  await audit('4-camera-one', { contrast: true });
  await page.keyboard.press('Escape'); await wait(800); await page.keyboard.press('Escape'); await wait(900);
  await audit('4b-camera-9up');
  await page.keyboard.press('Escape'); await wait(800); await page.keyboard.press('Escape');
  await expectAt('Esc x4 steps down the camera levels and leaves', 'horizon', 1500);

  // pinch loop: horizon -out-> constellation -in-> sheet -out-> horizon -in-> day -in-> camera -out(x4)-> day -out-> horizon
  await pinch('out', '#sky'); await expectAt('pinch out on the horizon: constellation', 'constellation', 1800);
  await audit('5-constellation', { contrast: true });
  if (safe) {
    const star = await page.evaluate(() => { const c = document.querySelector('#cstl canvas'); return c ? c.getContext('2d') ? 'canvas' : 'no ctx' : 'none'; });
    ok('constellation canvas present', star === 'canvas', star);
  }
  await page.keyboard.press('Escape'); await expectAt('Esc rises from the constellation', 'horizon', 1500);
  await pinch('out', '#sky'); await expectAt('constellation again', 'constellation', 1800);
  await pinch('in', '#cstl'); await expectAt('pinch in on the constellation: contact sheet', 'sheet', 2000);
  await pinch('out', '#sheet'); await expectAt('pinch out on the sheet: horizon', 'horizon', 1800);
  await pinch('in', '#sky'); await expectAt('pinch in on the horizon: day', 'day', 1800);
  await pinch('in', '#day'); await expectAt('pinch in on the day: camera back', 'camera back', 1800);
  for (let i = 0; i < 3; i++) { await pinch('out', '.cb-scr'); await wait(1100); }
  await pinch('out', '.cb-scr'); await expectAt('pinch out x4 on the camera back: leaves to the day', 'day', 1800);
  await pinch('out', '#day'); await expectAt('pinch out on the day: horizon', 'horizon', 1800);

  // safelight toggle + persistence
  const was = safe;
  await page.click('#safe'); await wait(500);
  ok('toggle flips body.safe', (await page.evaluate(() => document.body.classList.contains('safe'))) === !was);
  ok('toggle flips html.safe', (await page.evaluate(() => document.documentElement.classList.contains('safe'))) === !was);
  ok('toggle writes localStorage', (await page.evaluate(() => localStorage.getItem('gj-photo-lab-safelight'))) === (was ? '0' : '1'));
  const th = await page.evaluate(() => document.querySelector('meta[name=theme-color]').content);
  ok('theme-color follows the room', was ? th !== '#050000' : th === '#050000', th);
  await page.reload({ waitUntil: 'load' }); await wait(1500);
  ok('toggle persists across reload', (await page.evaluate(() => document.body.classList.contains('safe'))) === !was);
  await page.click('#safe'); await wait(400);
  ok('toggle back restores', (await page.evaluate(() => document.body.classList.contains('safe'))) === was);

  ok('no console errors', issues.console.length === 0, issues.console.join(' | '));
  ok('no page errors', issues.pageerror.length === 0, issues.pageerror.join(' | '));
  ok('no failed requests', issues.failed.length === 0, issues.failed.slice(0, 3).join(' | '));
  ok('no 404 / 4xx / 5xx responses', issues.http.length === 0, issues.http.slice(0, 3).join(' | '));
  await ctx.close();
  const failed = checks.filter((c) => !c.pass);
  console.log(`${failed.length ? 'FAIL' : 'PASS'} ${name.padEnd(16)} ${checks.length - failed.length}/${checks.length} checks`);
  results.push({ name, profile: profile.label, safe, checks, issues });
}

for (const p of PROFILES) for (const safe of [true, false]) await run(p, safe);
await browser.close();
if (srv) srv.server.close();
const bad = results.flatMap((r) => r.checks.filter((c) => !c.pass).map((c) => `${r.name}: ${c.label} ${c.detail}`));
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ base, results, contrast }, null, 1));
console.log(`\n${results.length} runs, ${results.reduce((n, r) => n + r.checks.length, 0)} checks, ${bad.length} failed`);
bad.forEach((b) => console.log('  - ' + b));
process.exit(bad.length ? 1 : 0);
