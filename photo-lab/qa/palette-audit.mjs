// Darkroom palette audit for /photo-lab/ with body.safe on.
//
// Rule: every colour the UI paints (text, background, border, outline, shadows, gradients, scrollbar,
// selection, pseudo-elements) is red to red-orange: hue <= 15deg or >= 350deg, HSL lightness < 55%,
// and not grey (saturation >= 50% unless it is near-black). Pure black and fully transparent are exempt.
// Photographs (img, video) are skipped as content, but must compute to filter:none.
//
// Three passes:
//   dom    computed styles of every visible non-media element (+ ::before/::after, ::selection, scrollers)
//   css    every colour literal in every stylesheet rule that mentions .safe (reaches hover/active/focus too)
//   pixels screenshot with media masked black, every pixel hue-checked (catches canvas, scrollbars, anything JS paints)
//
// CLI:  node palette-audit.mjs [url]     (starts its own server when no url is given)
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

export const LIMITS = { hueMax: 15, hueMin: 350, lightMax: 0.55, satMin: 0.5, nearBlackL: 0.06 };

export function launch(opts = {}) {
  return chromium.launch({ executablePath: process.env.CHROME || '/usr/local/bin/google-chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'], ...opts });
}

/* ---------- pass 1: computed styles (runs inside the page) ---------- */
function domPass(L) {
  const COL = /rgba?\([^)]*\)|color\(srgb[^)]*\)/gi;
  const parse = (s) => {
    let m = /^rgba?\(([^)]*)\)$/i.exec(s.trim());
    if (m) { const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; }
    m = /^color\(srgb\s+([^)]*)\)$/i.exec(s.trim());
    if (m) { const p = m[1].split(/[\s/]+/).filter(Boolean).map(parseFloat); return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p.length > 3 ? p[3] : 1 }; }
    return null;
  };
  const hsl = ({ r, g, b }) => {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
    let h = 0;
    if (d) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
    return { h, s: d ? d / (1 - Math.abs(2 * l - 1)) : 0, l };
  };
  const judge = (c) => {
    if (!c || c.a === 0) return null;
    if (c.r === 0 && c.g === 0 && c.b === 0) return null;
    const { h, s, l } = hsl(c);
    const why = [];
    const veryDark = Math.max(c.r, c.g, c.b) <= 40;
    if (!(h <= L.hueMax || h >= L.hueMin) && !veryDark) why.push(`hue ${h.toFixed(1)}`);
    if (l >= L.lightMax) why.push(`lightness ${(l * 100).toFixed(1)}%`);
    if (l >= L.nearBlackL && s < L.satMin) why.push(`saturation ${(s * 100).toFixed(0)}% (grey)`);
    return why.length ? why.join(', ') : null;
  };
  const sel = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    if (el.classList.length) s += '.' + [...el.classList].join('.');
    return s;
  };
  const visible = (el) => {
    if (el.closest('[hidden]')) return false;
    let o = 1;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      o *= parseFloat(cs.opacity);
    }
    if (o < 0.02) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const bad = [], seen = new Map();
  let checked = 0, tokens = 0;
  const add = (el, where, prop, value, why) => {
    const key = sel(el) + '|' + where + '|' + prop + '|' + value;
    if (seen.has(key)) return;
    seen.set(key, 1);
    bad.push({ el: sel(el), where, prop, value, why });
  };
  const check = (el, where, prop, value) => {
    if (!value || value === 'none' || value === 'auto' || value === 'normal') return;
    const found = value.match(COL) || [];
    for (const t of found) { tokens++; const why = judge(parse(t)); if (why) add(el, where, prop, t, why); }
  };
  const all = [document.documentElement, ...document.querySelectorAll('body, body *')];
  for (const el of all) {
    if (el.matches('img,video,script,style,link,meta,head,title,noscript,source')) continue;
    if (el.closest('video,noscript')) continue;
    if (!visible(el) && el !== document.documentElement) continue;
    checked++;
    for (const pseudo of [null, '::before', '::after']) {
      const cs = getComputedStyle(el, pseudo);
      if (pseudo && (cs.content === 'none' || cs.content === 'normal' || cs.display === 'none')) continue;
      const w = pseudo || 'element';
      check(el, w, 'color', cs.color);
      check(el, w, 'background-color', cs.backgroundColor);
      check(el, w, 'background-image', cs.backgroundImage);
      for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
        if (cs['border' + side + 'Style'] !== 'none' && parseFloat(cs['border' + side + 'Width']) > 0) check(el, w, 'border-' + side.toLowerCase() + '-color', cs['border' + side + 'Color']);
      }
      if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) check(el, w, 'outline-color', cs.outlineColor);
      check(el, w, 'box-shadow', cs.boxShadow);
      check(el, w, 'text-shadow', cs.textShadow);
      if (cs.textDecorationLine !== 'none') check(el, w, 'text-decoration-color', cs.textDecorationColor);
      if (!pseudo && (cs.overflowY === 'auto' || cs.overflowY === 'scroll' || el === document.documentElement)) {
        if (cs.scrollbarColor === 'auto') { if (el.scrollHeight > el.clientHeight + 1 && cs.overflowY !== 'hidden') add(el, w, 'scrollbar-color', 'auto', 'UA default scrollbar (grey)'); }
        else check(el, w, 'scrollbar-color', cs.scrollbarColor);
      }
    }
  }
  const selc = getComputedStyle(document.body, '::selection');
  check(document.body, '::selection', 'color', selc.color);
  check(document.body, '::selection', 'background-color', selc.backgroundColor);
  const theme = document.querySelector('meta[name=theme-color]')?.content;
  if (theme) { const c = { r: parseInt(theme.slice(1, 3), 16), g: parseInt(theme.slice(3, 5), 16), b: parseInt(theme.slice(5, 7), 16), a: 1 }; const why = judge(c); if (why) bad.push({ el: 'meta[theme-color]', where: 'element', prop: 'content', value: theme, why }); }
  const media = [...document.querySelectorAll('img,video')].filter((m) => m.getBoundingClientRect().width > 0);
  const filtered = media.filter((m) => getComputedStyle(m).filter !== 'none').map((m) => ({ el: sel(m), filter: getComputedStyle(m).filter }));
  const ancestorFilter = media.filter((m) => { for (let n = m.parentElement; n; n = n.parentElement) if (getComputedStyle(n).filter !== 'none' || getComputedStyle(n).mixBlendMode !== 'normal') return true; return false; }).map((m) => sel(m));
  const blend = media.filter((m) => getComputedStyle(m).mixBlendMode !== 'normal').map((m) => sel(m));
  return { checked, tokens, bad, media: media.length, filtered, ancestorFilter: [...new Set(ancestorFilter)], blend, safe: document.body.classList.contains('safe') && document.documentElement.classList.contains('safe') };
}

export async function auditDom(page) {
  return page.evaluate(domPass, LIMITS);
}

/* ---------- pass 2: every colour literal in rules that mention .safe ---------- */
function cssPass(L) {
  const hexToRgb = (h) => { h = h.slice(1); if (h.length === 3) h = [...h].map((c) => c + c).join(''); return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 }; };
  const hsl = ({ r, g, b }) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2; let h = 0; if (d) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; } return { h, s: d ? d / (1 - Math.abs(2 * l - 1)) : 0, l }; };
  const hslLit = (m) => { // hsl(7 80% calc(...)) literals are checked by hue/sat only; their lightness is bounded by the calc range
    const p = m.replace(/^hsla?\(|\)$/g, '').split(/[\s,/]+/); return { h: parseFloat(p[0]), s: parseFloat(p[1]) / 100 };
  };
  const out = [], rules = [];
  const walk = (list) => { for (const r of list) { if (r.cssRules && !r.selectorText) walk(r.cssRules); else if (r.selectorText) rules.push(r); } };
  for (const ss of document.styleSheets) { try { walk(ss.cssRules); } catch (e) {} }
  let n = 0, lits = 0;
  for (const r of rules) {
    if (!/\.safe\b/.test(r.selectorText)) continue;
    n++;
    for (let i = 0; i < r.style.length; i++) {
      const prop = r.style[i], val = r.style.getPropertyValue(prop);
      const toks = val.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\((?:[^()]|\([^)]*\))*\)/g) || [];
      for (const t of toks) {
        lits++;
        let c, why = [];
        if (/^hsl/i.test(t)) { const q = hslLit(t); if (!(q.h <= L.hueMax || q.h >= L.hueMin)) why.push('hue ' + q.h); if (q.s < L.satMin) why.push('grey'); }
        else {
          if (t[0] === '#') c = hexToRgb(t); else { const p = t.replace(/^rgba?\(|\)$/g, '').split(/[\s,/]+/).map(parseFloat); c = { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; }
          if (c.a === 0 || (c.r === 0 && c.g === 0 && c.b === 0)) continue;
          const { h, s, l } = hsl(c);
          const dark = l < L.nearBlackL && Math.max(c.r, c.g, c.b) <= 40;
          if (!(h <= L.hueMax || h >= L.hueMin) && !dark) why.push('hue ' + h.toFixed(1));
          if (l >= L.lightMax) why.push('lightness ' + (l * 100).toFixed(1) + '%');
          if (l >= L.nearBlackL && s < L.satMin) why.push('grey');
        }
        if (why.length) out.push({ selector: r.selectorText, prop, value: t, why: why.join(', ') });
      }
    }
  }
  return { safeRules: n, literals: lits, bad: out };
}
export async function auditCss(page) {
  return page.evaluate(cssPass, LIMITS);
}

/* ---------- pass 3: pixels (media masked) ---------- */
export async function auditPixels(page, label = 'view', shotPath) {
  const rects = await page.evaluate(() => [...document.querySelectorAll('img,video')].map((m) => { const r = m.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom, parseFloat(getComputedStyle(m).opacity)]; }).filter((r) => r[2] > r[0] && r[3] > r[1]));
  const png = await page.screenshot({ animations: 'allow', path: shotPath });
  const img = PNG.sync.read(png);
  const k = img.width / (await page.evaluate(() => innerWidth)), PAD = 3;
  for (const [x0, y0, x1, y1] of rects) {
    // media is content, not UI: blank it (padded for sub-pixel edges) so only the room around it is judged
    for (let y = Math.max(0, Math.floor(y0 * k) - PAD); y < Math.min(img.height, Math.ceil(y1 * k) + PAD); y++)
      for (let x = Math.max(0, Math.floor(x0 * k) - PAD); x < Math.min(img.width, Math.ceil(x1 * k) + PAD); x++) { const i = (y * img.width + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = 0; }
  }
  let off = 0, total = 0, brightest = 0;
  const samples = new Map();
  for (let i = 0; i < img.data.length; i += 4) {
    const r = img.data[i], g = img.data[i + 1], b = img.data[i + 2];
    total++;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx <= 40) continue;
    const d = (mx - mn) / 255, l = (mx + mn) / 510;
    let h = 0;
    const dd = mx - mn;
    if (dd) { h = mx === r ? ((g - b) / dd) % 6 : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4; h *= 60; if (h < 0) h += 360; }
    brightest = Math.max(brightest, l);
    // 1.5% slack on lightness for resampling at colour edges; hue slack of 1deg for 8-bit rounding
    const hueBad = !(h <= L_.hueMax + 1 || h >= L_.hueMin - 1);
    if (hueBad || l > L_.lightMax + 0.015) {
      off++;
      if (samples.size < 6) samples.set(`${r},${g},${b}`, { rgb: [r, g, b], hue: +h.toFixed(1), l: +l.toFixed(3), at: [Math.round((i / 4) % img.width / k), Math.round(Math.floor(i / 4 / img.width) / k)] });
    }
  }
  return { label, pixels: total, offPalette: off, brightestLightness: +brightest.toFixed(3), samples: [...samples.values()], size: [img.width, img.height] };
}
const L_ = LIMITS;

/* ---------- contrast of the actual text/background pairs on screen ---------- */
function contrastPass() {
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const parse = (s) => { const m = /rgba?\(([^)]*)\)/.exec(s); if (!m) return null; const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const over = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
  const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const bgOf = (el) => {
    const stack = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) stack.push(c);
      const gi = cs.backgroundImage;
      if (gi && gi !== 'none') {
        const stops = (gi.match(/rgba?\([^)]*\)/g) || []).map(parse).filter((s) => s.a >= 0.9);
        if (stops.length) { stops.sort((a, b) => lum(b) - lum(a)); stack.push(stops[0]); }
      }
      if (c && c.a >= 1) break;
    }
    let base = { r: 5, g: 0, b: 0, a: 1 };
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
    return base;
  };
  const rows = new Map();
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let t; (t = tw.nextNode());) {
    if (!t.textContent.trim()) continue;
    const el = t.parentElement;
    if (!el || el.closest('[hidden],noscript,script,style')) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    let o = 1; for (let n = el; n; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity);
    if (o < 0.5) continue;
    const bg = bgOf(el), fg = over(parse(cs.color), bg);
    const L1 = lum(fg), L2 = lum(bg), ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const key = hex(fg) + ' on ' + hex(bg);
    const sel = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].join('.') : '');
    if (!rows.has(key)) rows.set(key, { fg: hex(fg), bg: hex(bg), ratio: +ratio.toFixed(2), size: cs.fontSize, example: sel, text: t.textContent.trim().slice(0, 24) });
  }
  return [...rows.values()].sort((a, b) => a.ratio - b.ratio);
}
export async function contrastReport(page) {
  return page.evaluate(contrastPass);
}

/* ---------- CLI ---------- */
function summarize(name, dom, css, px) {
  const lines = [];
  lines.push(`[${name}] dom: ${dom.checked} elements, ${dom.tokens} colour values, ${dom.bad.length} off-palette; media ${dom.media}, filtered ${dom.filtered.length}, ancestor filter/blend ${dom.ancestorFilter.length}`);
  for (const b of dom.bad.slice(0, 12)) lines.push(`    ${b.el} ${b.where} ${b.prop}: ${b.value} -> ${b.why}`);
  if (css) lines.push(`[${name}] css: ${css.safeRules} .safe rules, ${css.literals} colour literals, ${css.bad.length} off-palette`);
  if (css) for (const b of css.bad.slice(0, 12)) lines.push(`    ${b.selector} { ${b.prop}: ${b.value} } -> ${b.why}`);
  if (px) lines.push(`[${name}] pixels: ${px.pixels} px, ${px.offPalette} off-palette, brightest lightness ${px.brightestLightness}`);
  return lines.join('\n');
}
export { summarize };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let url = process.argv[2], srv;
  if (!url) { srv = await serve(); url = `http://127.0.0.1:${srv.port}/photo-lab/`; }
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.setItem('gj-photo-lab-safelight', '1'); } catch (e) {} });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const dom = await auditDom(page), css = await auditCss(page), px = await auditPixels(page, 'horizon');
  console.log(summarize('horizon', dom, css, px));
  console.log(JSON.stringify(await contrastReport(page), null, 1));
  await browser.close();
  if (srv) srv.server.close();
  process.exit(dom.bad.length || css.bad.length || px.offPalette || dom.filtered.length ? 1 : 0);
}
