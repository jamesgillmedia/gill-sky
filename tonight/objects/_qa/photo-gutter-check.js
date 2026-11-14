#!/usr/bin/env node
/* Objects gallery · photo layout check (Gill's rule, Nov 14): photos never overlap each other, never touch each other, and never touch or clip into the
   screen edges or the safe area. Every visible photograph is measured: the stills (#front .pc), the joio cup cutouts (.cup) and anything marked [data-photo].
   For every size, orientation, take (G1 with several pieces in the case, G2, G3) it asserts
     1. zero intersections between any two photo rects,
     2. a gap of at least MIN_GAP px between any two photo rects (the layouts use a GUTTER of 12),
     3. every photo inside the viewport minus the safe-area insets, with at least MIN_EDGE px to spare.
   Content inside a scrolling rail may leave the viewport as long as it does not overlap within the rail ([data-rail]); the gallery has no rail yet, so none is measured.
   Safe areas: the real env(safe-area-inset-*) values, plus a simulated notch pass (?safe=top,right,bottom,left, a QA-only override in js/gallery.js).
   Usage: node _qa/photo-gutter-check.js [baseUrl] [--shots=dir]      (needs playwright-core and a Chrome: CHROME=/path, default /usr/local/bin/google-chrome)
   The base URL defaults to http://localhost:8970/objects/ (python3 tonight/serve.py 8970 --no-open). */
const { chromium } = require('playwright-core');
const BASE = (process.argv[2] && !process.argv[2].startsWith('--')) ? process.argv[2] : 'http://localhost:8970/objects/';
const SHOTS = (process.argv.find(a => a.startsWith('--shots=')) || '').slice(8);
const MIN_GAP = 8, MIN_EDGE = 8;
const SIZES = [
  ['phone portrait 390x844', 390, 844], ['phone portrait small 360x640', 360, 640], ['phone landscape 844x390', 844, 390],
  ['tablet portrait 768x1024', 768, 1024], ['tablet landscape 1024x768', 1024, 768], ['desktop 1440x900', 1440, 900], ['desktop wide 1920x1080', 1920, 1080]
];
const TAKES = [['G1', 0], ['G1', 3], ['G1', 7], ['G2', 0], ['G3', 0]];
const NOTCH = '47,0,34,0', NOTCH_L = '0,47,21,47';

function measure() {
  const out = [];
  const seen = new Set();
  const add = (el, kind) => {
    if (seen.has(el)) return; seen.add(el);
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return;
    let rail = el.closest('[data-rail]');
    out.push({ kind, name: el.getAttribute('aria-label') || el.dataset.k || el.className, l: r.left, t: r.top, r: r.right, b: r.bottom, rail: rail ? [...document.querySelectorAll('[data-rail]')].indexOf(rail) : -1 });
  };
  document.querySelectorAll('#front .pc').forEach(e => add(e, 'still'));
  document.querySelectorAll('#front .cup').forEach(e => add(e, 'cup'));
  document.querySelectorAll('[data-photo]').forEach(e => add(e, 'photo'));
  const p = document.createElement('div'); p.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  document.body.appendChild(p); const c = getComputedStyle(p); const safe = { t: parseFloat(c.paddingTop), r: parseFloat(c.paddingRight), b: parseFloat(c.paddingBottom), l: parseFloat(c.paddingLeft) }; p.remove();
  return { photos: out, safe, vw: innerWidth, vh: innerHeight };
}

function judge(m, forced) {
  const s = forced || m.safe, P = m.photos, fails = []; let minGap = Infinity;
  for (let i = 0; i < P.length; i++) {
    const a = P[i];
    if (!(a.rail >= 0)) {
      if (a.l < s.l + MIN_EDGE - .01) fails.push(`${a.name} left edge ${(a.l - s.l).toFixed(1)}px from the safe area`);
      if (a.t < s.t + MIN_EDGE - .01) fails.push(`${a.name} top edge ${(a.t - s.t).toFixed(1)}px from the safe area`);
      if (a.r > m.vw - s.r - MIN_EDGE + .01) fails.push(`${a.name} right edge ${(m.vw - s.r - a.r).toFixed(1)}px from the safe area`);
      if (a.b > m.vh - s.b - MIN_EDGE + .01) fails.push(`${a.name} bottom edge ${(m.vh - s.b - a.b).toFixed(1)}px from the safe area`);
    }
    for (let j = i + 1; j < P.length; j++) {
      const b = P[j]; if (a.rail !== b.rail && (a.rail >= 0 || b.rail >= 0)) continue;
      const sx = Math.max(a.l - b.r, b.l - a.r), sy = Math.max(a.t - b.b, b.t - a.b);
      const gap = Math.max(sx, sy);
      if (gap < 0) fails.push(`OVERLAP ${a.name} x ${b.name} (${(-gap).toFixed(1)}px)`);
      else { minGap = Math.min(minGap, gap); if (gap < MIN_GAP) fails.push(`TOUCH ${a.name} x ${b.name} (gap ${gap.toFixed(1)}px)`) }
    }
  }
  return { fails, minGap: isFinite(minGap) ? minGap : null };
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/local/bin/google-chrome', args: ['--no-sandbox'] });
  let total = 0, failed = 0; const lines = [];
  for (const [label, w, h] of SIZES) {
    for (const safeMode of ['none', 'notch']) {
      const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 800, isMobile: w < 600 });
      const p = await ctx.newPage(); const errs = [];
      p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/NotSameOrigin/.test(m.text())) errs.push(m.text()) });
      const forced = safeMode === 'notch' ? (w > h ? { t: 0, r: 47, b: 21, l: 47 } : { t: 47, r: 0, b: 34, l: 0 }) : null;
      const safeQ = safeMode === 'notch' ? (w > h ? NOTCH_L : NOTCH) : null;
      for (const [g, cur] of TAKES) {
        if (safeMode === 'notch' && g === 'G1' && cur !== 3) continue;
        await p.goto(BASE + '?dev=1&v=' + g + (safeQ ? '&safe=' + safeQ : ''), { waitUntil: 'load' });
        const ob = await p.$('button:has-text("Open the page")'); if (ob) { await ob.click(); await p.waitForTimeout(2500) }
        await p.waitForTimeout(1800);
        for (let k = 0; k < cur; k++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(120) }
        await p.waitForTimeout(1600);
        const m = await p.evaluate(measure), r = judge(m, forced);
        total++; if (r.fails.length) failed++;
        const tag = `${r.fails.length ? 'FAIL' : 'PASS'} ${label}${forced ? ' +safe-area ' + safeQ : ''} ${g}${g === 'G1' ? ' piece ' + (cur + 1) : ''}: ${m.photos.length} photos, min gap ${r.minGap == null ? '-' : r.minGap.toFixed(1)}px`;
        lines.push(tag); if (r.fails.length) r.fails.slice(0, 6).forEach(f => lines.push('     ' + f));
        if (SHOTS && !forced && (cur === 0 || g === 'G1' && cur === 3)) await p.screenshot({ path: `${SHOTS}/${label.split(' ').join('-')}-${g}${g === 'G1' ? '-p' + (cur + 1) : ''}.png` });
      }
      if (errs.length) { lines.push(`FAIL console errors at ${label}: ${errs.join(' | ')}`); failed++ }
      await ctx.close();
    }
  }
  lines.push(`\n${total - failed >= 0 ? total : total} configurations, ${failed} failing`);
  console.log(lines.join('\n')); await b.close(); process.exit(failed ? 1 : 0);
})();
