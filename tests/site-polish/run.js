#!/usr/bin/env node
/* Site-polish checks: error/offline state, blank-until-ready, accessibility, analytics, share tags, sitemap and clean URLs,
   image SEO, and page-to-page links. Serves the repo itself; nothing else needs to be running.

     npm i playwright-core pngjs          (Chrome at /usr/local/bin/google-chrome, or CHROME=...)
     node tests/site-polish/run.js [group ...]      groups: errors blank a11y analytics og sitemap images links
   Screenshots go to $ARTIFACTS (default /opt/cursor/artifacts). Exit code 1 if any check fails. */
const L = require('./lib');
const { check, setGroup, sleep, BASE, ART, VIEWS, results } = L;
const fs = L.fs, path = L.path;

const only = process.argv.slice(2);
const want = (g) => !only.length || only.includes(g);
fs.mkdirSync(ART, { recursive: true });

const EXTERNAL = /^https:\/\/(raw\.githack\.com|jamesgillmedia\.github\.io)\//;
const STUB = (c) => `<!doctype html><body style="margin:0;background:${c};color:#fff;font:20px sans-serif"><h1 style="margin:20px">stub preview</h1>`;
const CORS = { 'access-control-allow-origin': '*' };

async function stubExternal(ctx, state) {
  state = state || { mode: 'ok', color: '#c13584', delay: 0, hits: [] };
  await ctx.route(EXTERNAL, async (route) => {
    const req = route.request();
    state.hits.push(req.method() + ' ' + req.url());
    if (state.mode === 'abort') return route.abort('connectionrefused');
    if (state.mode === 'hang') return; // never answers
    if (state.delay && req.method() === 'GET') await sleep(state.delay);
    if (state.mode === 'http404') return route.fulfill({ status: 404, headers: CORS, contentType: 'text/html', body: 'not found' });
    return route.fulfill({ status: 200, headers: CORS, contentType: 'text/html', body: STUB(state.color) });
  });
  return state;
}

function sitemapUrls(origin) {
  const xml = fs.readFileSync(path.join(L.ROOT, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
const local = (origin, u) => origin + u.slice(BASE.length);
const attr = (tag, n) => { const m = new RegExp('\\b' + n + '="([^"]*)"', 'i').exec(tag); return m ? m[1] : null; };

/* ------------------------------------------------------------------ 1 + error states */
async function errors(b, origin) {
  setGroup('item 1 · error and offline states');
  for (const [vn, vp] of Object.entries(VIEWS)) {
    const ctx = await b.newContext(vp);
    const st = await stubExternal(ctx);
    const p = await ctx.newPage();
    await p.goto(origin + 'tour/backward-fall/');
    await p.waitForFunction(() => document.getElementById('view').dataset.state === 'ready', null, { timeout: 8000 }).catch(() => {});
    const sel = await p.evaluate(() => document.getElementById('view').dataset.state);
    check(`[${vn}] online stop loads and shows`, sel === 'ready', 'state=' + sel);
    await p.waitForFunction(() => GJ_FAILSAFE.cached() === 6, null, { timeout: 8000 }).catch(() => {}); // the cups are warmed into memory while online

    // offline
    await ctx.setOffline(true);
    await p.click('#next');
    await p.waitForFunction(() => document.getElementById('view').dataset.state === 'error', null, { timeout: 4000 }).catch(() => {});
    await p.waitForFunction(() => { const im = [...document.querySelectorAll('.gjf img')]; return im.length > 0 && im.every((i) => i.complete && i.naturalWidth > 0); }, null, { timeout: 3000 }).catch(() => {});
    let r = await p.evaluate(() => {
      const f = document.querySelector('.gjf');
      const imgs = f ? [...f.querySelectorAll('img')].map((i) => ({ w: i.naturalWidth, filter: getComputedStyle(i).filter, blend: getComputedStyle(i).mixBlendMode })) : [];
      const link = f && f.querySelector('a.gjf-link');
      return { reason: document.getElementById('view').dataset.reason, has: !!f, role: f && f.getAttribute('role'), text: f ? f.innerText : '', imgs,
        retry: !!(f && f.querySelector('button.gjf-retry')), board: link && link.href, frames: f ? f.querySelectorAll('.gjf-frame').length : 0, iframes: document.querySelectorAll('#view iframe').length };
    });
    check(`[${vn}] offline shows the cups collage with its message`, r.has && r.reason === 'offline' && /offline/i.test(r.text), `reason=${r.reason}`);
    check(`[${vn}] collage has several rotating frames of real cup images`, r.frames >= 3 && r.imgs.length >= 10 && r.imgs.every((i) => i.w > 300), `frames=${r.frames} widths=${r.imgs.map((i) => i.w).join(",")}`);
    check(`[${vn}] cup photographs carry no filter or blend (never graded or tinted)`, r.imgs.every((i) => i.filter === 'none' && i.blend === 'normal'));
    check(`[${vn}] Retry button and Studio board link are present`, r.retry && r.board === 'https://jamesgillmedia.github.io/gilljames/previews/', r.board);
    check(`[${vn}] no half-loaded frame is left behind`, r.iframes === 0);
    if (vn === 'phone' || vn === 'desktop') await p.screenshot({ path: path.join(ART, `error-state-offline-${vn}.png`) });
    await p.click('.gjf-retry');
    await sleep(500);
    const still = await p.evaluate(() => document.getElementById('view').dataset.state);
    check(`[${vn}] Retry while still offline stays on the calm message`, still === 'error', still);
    await ctx.setOffline(false);
    await p.waitForFunction(() => document.getElementById('view').dataset.state === 'ready', null, { timeout: 6000 }).catch(() => {});
    check(`[${vn}] back online, the stop loads again by itself`, (await p.evaluate(() => document.getElementById('view').dataset.state)) === 'ready');

    // network failure + manual Retry
    st.mode = 'abort';
    await p.click('#next');
    await p.waitForFunction(() => document.getElementById('view').dataset.state === 'error', null, { timeout: 8000 }).catch(() => {});
    r = await p.evaluate(() => ({ s: document.getElementById('view').dataset.state, reason: document.getElementById('view').dataset.reason }));
    check(`[${vn}] unreachable host (HEAD check fails) shows the error state`, r.s === 'error' && r.reason === 'network', JSON.stringify(r));
    st.mode = 'ok';
    await p.click('.gjf-retry');
    await p.waitForFunction(() => document.getElementById('view').dataset.state === 'ready', null, { timeout: 8000 }).catch(() => {});
    check(`[${vn}] Retry works once the host answers`, (await p.evaluate(() => document.getElementById('view').dataset.state)) === 'ready');

    // HTTP error
    st.mode = 'http404';
    await p.click('#next');
    await p.waitForFunction(() => document.getElementById('view').dataset.state === 'error', null, { timeout: 8000 }).catch(() => {});
    r = await p.evaluate(() => ({ s: document.getElementById('view').dataset.state, reason: document.getElementById('view').dataset.reason }));
    check(`[${vn}] a 404 from the preview (HEAD check) shows the error state`, r.s === 'error' && r.reason === 'http', JSON.stringify(r));
    await ctx.close();
  }

  // load timeout (phone only: it waits for the real 15 s)
  const ctx = await b.newContext(VIEWS.phone);
  const st = await stubExternal(ctx, { mode: 'hang', hits: [] });
  const p = await ctx.newPage();
  await p.goto(origin + 'tour/film-board/');
  await p.waitForFunction(() => document.getElementById('view').dataset.state === 'error', null, { timeout: 20000 }).catch(() => {});
  const r = await p.evaluate(() => ({ s: document.getElementById('view').dataset.state, reason: document.getElementById('view').dataset.reason }));
  check('iframe load timeout (15 s) shows the error state', r.s === 'error' && r.reason === 'timeout', JSON.stringify(r));
  st.mode = 'ok';
  await p.click('.gjf-retry');
  await p.waitForFunction(() => document.getElementById('view').dataset.state === 'ready', null, { timeout: 8000 }).catch(() => {});
  check('Retry after a timeout loads the stop', (await p.evaluate(() => document.getElementById('view').dataset.state)) === 'ready');
  await ctx.close();

  // shared component demo page, motion
  for (const reduce of [false, true]) {
    const c2 = await b.newContext({ ...VIEWS.desktop, reducedMotion: reduce ? 'reduce' : 'no-preference' });
    const pg = await c2.newPage();
    await pg.goto(origin + 'shared/offline-collage/demo.html?reason=timeout');
    await sleep(600);
    const a = await pg.evaluate(() => [...document.querySelectorAll('.gjf-frame')].findIndex((f) => f.classList.contains('on')));
    await sleep(4300);
    const z = await pg.evaluate(() => [...document.querySelectorAll('.gjf-frame')].findIndex((f) => f.classList.contains('on')));
    check(reduce ? 'demo: Reduce Motion keeps the first frame still' : 'demo: the collage rotates between frames', reduce ? a === 0 && z === 0 : a !== z, `${a} -> ${z}`);
    if (!reduce) await pg.screenshot({ path: path.join(ART, 'error-state-demo-desktop.png') });
    await c2.close();
  }
}

/* ------------------------------------------------------------------ 2 blank until ready */
async function blank(b, origin) {
  setGroup('item 2 · film / stills: blank until ready, no spinner, no fade');
  const ctx = await b.newContext(VIEWS.phone);
  const st = await stubExternal(ctx, { mode: 'ok', color: '#c13584', delay: 0, hits: [] });
  const p = await ctx.newPage();
  await p.goto(origin + 'tour/one-with-the-devil/');
  await p.waitForFunction(() => document.getElementById('view').dataset.state === 'ready');
  const px = async () => {
    const box = await p.evaluate(() => { const r = document.getElementById('view').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    const { PNG } = require('pngjs');
    const png = PNG.sync.read(await p.screenshot({ clip: { x: box.x - 4, y: box.y - 4, width: 8, height: 8 } }));
    return [png.data[0], png.data[1], png.data[2]];
  };
  let c = await px();
  check('film stop shows its (stub) picture once ready', c[0] > 150 && c[1] < 80, JSON.stringify(c));
  st.delay = 1800; st.color = '#1fb35a';
  await p.click('#menubtn');
  await p.click('#menu a:nth-child(7)'); // Photo Lab (live): a stills environment
  await sleep(500);
  const mid = await p.evaluate(() => {
    const fr = document.querySelectorAll('#view iframe');
    const f = fr[0];
    const cs = f && getComputedStyle(f);
    const anim = [...document.querySelectorAll('#view *')].some((e) => getComputedStyle(e).animationName !== 'none');
    return { n: fr.length, on: f && f.classList.contains('on'), vis: cs && cs.visibility, tr: cs && cs.transitionDuration, state: document.getElementById('view').dataset.state, anim,
      spinner: !!document.querySelector('#view [class*=spin],#view [class*=load],#view progress,#view svg') };
  });
  c = await px();
  check('while the stills load, the target area is blank (no old film frame, ink only)', mid.n === 1 && mid.on === false && mid.vis === 'hidden' && c[0] < 20 && c[1] < 20, JSON.stringify({ ...mid, c }));
  check('no spinner and no animation in the frame area', !mid.anim && !mid.spinner);
  check('the frame has no fade (transition 0s)', mid.tr === '0s', mid.tr);
  await p.screenshot({ path: path.join(ART, 'blank-while-loading-phone.png') });
  await p.waitForFunction(() => document.getElementById('view').dataset.state === 'ready', null, { timeout: 6000 });
  c = await px();
  check('once ready the stills appear whole at once', c[1] > 150 && c[0] < 80, JSON.stringify(c));
  // and back: stills -> film
  st.color = '#c13584';
  await p.click('#prev');
  await sleep(500);
  c = await px();
  check('stills to film: blank again until the film is ready', c[0] < 20 && c[1] < 20, JSON.stringify(c));
  await ctx.close();
}

/* ------------------------------------------------------------------ 3 accessibility */
const A11Y_PAGES = [
  ['home (sky)', 'tonight/fable-m4/', '#dive'], ['home (landing)', 'tonight/fable-m4/'], ['contact', 'tonight/fable-m4/contact/'], ['list', 'tonight/fable-m4/list/'],
  ['sound', 'tonight/fable-m4/player/'], ['photo lab', 'photo-lab/'], ['darkroom', 'tonight/photo-lab/'], ['archive', 'tonight/archive/'], ['objects', 'tonight/objects/'],
  ['objects 3d', 'tonight/fable-m4/objects-3d/'], ['objects page', 'tonight/fable-m4/objects/joio/'], ['tour', 'tour/'], ['tour stop', 'tour/beyond/'],
];

async function a11y(b, origin) {
  setGroup('item 3 · red mode accessibility');
  for (const [vn, vp] of Object.entries(VIEWS)) {
    const ctx = await b.newContext(vp);
    await stubExternal(ctx);
    const p = await ctx.newPage();
    await p.goto(origin + 'tonight/fable-m4/');
    await sleep(2200);
    await p.click('#dive').catch(() => {});
    await sleep(5500);
    const s0 = await p.evaluate(() => { const e = document.getElementById('themeBtn'); return { label: e.getAttribute('aria-label'), pressed: e.getAttribute('aria-pressed'), theme: document.documentElement.dataset.theme }; });
    check(`[${vn}] red mode dot has aria-label and aria-pressed=false in Night`, s0.pressed === 'false' && /red mode/.test(s0.label) && s0.theme === 'night', JSON.stringify(s0));
    // keyboard: Tab to it, check the focus ring, toggle with Enter then Space
    await p.evaluate(() => document.activeElement && document.activeElement.blur());
    let found = false;
    for (let i = 0; i < 60 && !found; i++) { await p.keyboard.press('Tab'); found = await p.evaluate(() => document.activeElement && document.activeElement.id === 'themeBtn'); }
    check(`[${vn}] the red mode dot is reachable with Tab`, found);
    const ring = await p.evaluate(() => { const cs = getComputedStyle(document.activeElement); return { style: cs.outlineStyle, w: cs.outlineWidth, col: cs.outlineColor }; });
    check(`[${vn}] visible focus ring on the dot (2px solid)`, ring.style === 'solid' && parseFloat(ring.w) >= 2, JSON.stringify(ring));
    if (vn === 'desktop') await p.screenshot({ path: path.join(ART, 'red-mode-focus-night-desktop.png') });
    await p.keyboard.press('Enter');
    await sleep(500);
    let s1 = await p.evaluate(() => { const e = document.getElementById('themeBtn'); const cs = getComputedStyle(e); return { pressed: e.getAttribute('aria-pressed'), theme: document.documentElement.dataset.theme, bw: cs.borderTopWidth, bc: cs.borderTopColor, label: e.getAttribute('aria-label') }; });
    check(`[${vn}] Enter turns Red on: aria-pressed=true, label unchanged`, s1.pressed === 'true' && s1.theme === 'red' && s1.label === s0.label, JSON.stringify(s1));
    check(`[${vn}] active indicator uses the new-item colour #e8e4dc (2px ring)`, s1.bc === 'rgb(232, 228, 220)' && s1.bw === '2px', `${s1.bw} ${s1.bc}`);
    const ring2 = await p.evaluate(() => { const cs = getComputedStyle(document.activeElement); return { style: cs.outlineStyle, w: cs.outlineWidth }; });
    check(`[${vn}] focus ring still shows in Red`, ring2.style === 'solid' && parseFloat(ring2.w) >= 2, JSON.stringify(ring2));
    await p.screenshot({ path: path.join(ART, `red-mode-focus-red-${vn}.png`) });
    await p.keyboard.press('Space');
    await sleep(500);
    s1 = await p.evaluate(() => ({ pressed: document.getElementById('themeBtn').getAttribute('aria-pressed'), theme: document.documentElement.dataset.theme }));
    check(`[${vn}] Space turns it back: aria-pressed=false`, s1.pressed === 'false' && s1.theme === 'night', JSON.stringify(s1));
    // the other icon controls on home
    const other = await p.evaluate(() => ['back', 'marktune', 'mmap'].map((id) => { const e = document.getElementById(id); return e ? [id, e.getAttribute('aria-label')] : [id, 'missing']; }));
    check(`[${vn}] mark, drawer and map buttons are named`, other.every((x) => x[1] && x[1] !== 'missing'), JSON.stringify(other));
    await ctx.close();
  }

  // every visible control on every page has a name and a visible keyboard focus
  const ctx = await b.newContext(VIEWS.desktop);
  await stubExternal(ctx);
  for (const [name, rel, click] of A11Y_PAGES) {
    const p = await ctx.newPage();
    await p.goto(origin + rel);
    await sleep(2200);
    if (click) { await p.click(click).catch(() => {}); await sleep(4500); }
    const bad = await p.evaluate(() => {
      const out = [];
      const nameOf = (e) => {
        const al = e.getAttribute('aria-label'); if (al && al.trim()) return al.trim();
        const lb = e.getAttribute('aria-labelledby'); if (lb) { const t = lb.split(/\s+/).map((i) => document.getElementById(i)).filter(Boolean).map((x) => x.textContent).join(' ').trim(); if (t) return t; }
        if (e.id) { const l = document.querySelector('label[for="' + e.id + '"]'); if (l && l.textContent.trim()) return l.textContent.trim(); }
        if (e.closest('label') && e.closest('label').textContent.trim()) return e.closest('label').textContent.trim();
        const t = (e.textContent || '').replace(/\s+/g, ' ').trim(); if (t) return t;
        const im = e.querySelector('img[alt]'); if (im && im.alt.trim()) return im.alt.trim();
        return e.getAttribute('title') || '';
      };
      for (const e of document.querySelectorAll('a[href],button,input:not([type=hidden]),select,[role=button],[role=radio],[role=tab],[tabindex="0"]')) {
        const s = getComputedStyle(e), r = e.getBoundingClientRect();
        if (r.width === 0 || r.height === 0 || s.visibility === 'hidden' || s.display === 'none') continue;
        const n = nameOf(e);
        const ok = n && /[A-Za-z0-9\u1400-\u167F]/.test(n);
        if (!ok) out.push((e.id ? '#' + e.id : e.tagName.toLowerCase()) + ' ' + (e.textContent || '').trim().slice(0, 10));
      }
      return out;
    });
    check(`${name}: every visible control has an accessible name`, bad.length === 0, bad.slice(0, 5).join(' | '));
    const weak = [];
    await p.evaluate(() => document.activeElement && document.activeElement.blur());
    for (let i = 0; i < 20; i++) {
      await p.keyboard.press('Tab');
      const r = await p.evaluate(() => {
        const e = document.activeElement; if (!e || e === document.body) return null;
        const cs = getComputedStyle(e);
        return { id: (e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]), ring: cs.outlineStyle === 'solid' && parseFloat(cs.outlineWidth) >= 2, safe: e.id === 'safe' };
      });
      if (r && !r.ring && !r.safe && !weak.includes(r.id)) weak.push(r.id);
    }
    check(`${name}: Tab shows a visible focus ring (safelight button excluded on purpose)`, weak.length === 0, weak.slice(0, 5).join(' | '));
    await p.close();
  }
  await ctx.close();

  // keyboard operability of the tour menu
  const c3 = await b.newContext(VIEWS.desktop);
  await stubExternal(c3);
  const p = await c3.newPage();
  await p.goto(origin + 'tour/');
  await p.focus('#menubtn');
  await p.keyboard.press('Enter');
  let o = await p.evaluate(() => ({ exp: document.getElementById('menubtn').getAttribute('aria-expanded'), inMenu: document.getElementById('menu').contains(document.activeElement) }));
  check('tour: menu opens with Enter and moves focus into it', o.exp === 'true' && o.inMenu, JSON.stringify(o));
  await p.keyboard.press('Escape');
  o = await p.evaluate(() => ({ exp: document.getElementById('menubtn').getAttribute('aria-expanded'), back: document.activeElement.id }));
  check('tour: Escape closes the menu and returns focus to its button', o.exp === 'false' && o.back === 'menubtn', JSON.stringify(o));
  await p.keyboard.press('ArrowRight');
  await sleep(300);
  check('tour: ArrowRight goes to the next stop (clean URL)', /\/tour\/backward-fall\/$/.test(p.url()), p.url());
  await c3.close();

  // contrast in Red (DOM text) and photographs staying true
  const { PNG } = require('pngjs');
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const Lm = (r, g, bl) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(bl);
  const cx = await b.newContext(VIEWS.phone);
  for (const [name, rel, click] of [['home', 'tonight/fable-m4/?theme=red', '#dive'], ['contact', 'tonight/fable-m4/contact/?theme=red'], ['list', 'tonight/fable-m4/list/?theme=red'], ['objects page', 'tonight/fable-m4/objects/joio/?theme=red']]) {
    const p2 = await cx.newPage();
    await p2.goto(origin + rel);
    await sleep(2200);
    if (click) { await p2.click(click).catch(() => {}); await sleep(5000); }
    const items = await p2.evaluate(() => {
      const out = [], seen = new Set(); const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) {
        const t = n.textContent.trim(); if (!t) continue; const e = n.parentElement; if (seen.has(e)) continue; seen.add(e);
        const s = getComputedStyle(e), r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || s.visibility === 'hidden' || s.display === 'none') continue;
        let op = 1, el = e, hid = false; while (el && el !== document.documentElement) { const cs = getComputedStyle(el); op *= parseFloat(cs.opacity); if (cs.display === 'none' || cs.visibility === 'hidden') hid = true; el = el.parentElement; }
        if (hid || op < 0.02 || r.bottom < 0 || r.top > innerHeight) continue;
        out.push({ t: t.slice(0, 24), col: s.color, op, px: parseFloat(s.fontSize), x: r.left, y: r.top, w: r.width, h: r.height });
      }
      return out;
    });
    await p2.addStyleTag({ content: '*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}' });
    await sleep(300);
    const png = PNG.sync.read(await p2.screenshot({ scale: 'css' }));
    const bad = []; let worst = 99;
    for (const it of items) {
      const lums = [];
      const x0 = Math.max(0, Math.floor(it.x)), x1 = Math.min(png.width, Math.ceil(it.x + it.w)), y0 = Math.max(0, Math.floor(it.y)), y1 = Math.min(png.height, Math.ceil(it.y + it.h));
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * png.width + x) * 4; lums.push(Lm(png.data[i], png.data[i + 1], png.data[i + 2])); }
      lums.sort((a, c2) => a - c2);
      const bg = lums.length ? lums[Math.floor(lums.length * 0.5)] : 0;
      const m = it.col.match(/[\d.]+/g).map(Number); const a = (m[3] == null ? 1 : m[3]) * it.op;
      const bgv = Math.round(255 * Math.pow(bg, 1 / 2.2));
      const l1 = Lm(m[0] * a + bgv * (1 - a), m[1] * a + bgv * (1 - a), m[2] * a + bgv * (1 - a));
      const cr = (Math.max(l1, bg) + 0.05) / (Math.min(l1, bg) + 0.05);
      worst = Math.min(worst, it.px >= 24 ? 99 : cr);
      if (cr < (it.px >= 24 ? 3 : 4.5)) bad.push(`${it.t} ${cr.toFixed(2)}`);
    }
    check(`Red mode text contrast >= 4.5:1 (${name}, ${items.length} text blocks, lowest ${worst.toFixed(2)})`, bad.length === 0, bad.slice(0, 4).join(' | '));
    await p2.close();
  }
  // photographs are never recoloured by Red
  const pa = await cx.newPage();
  const crop = async (theme) => {
    await pa.goto(origin + 'tonight/fable-m4/objects/joio-co-cup/?theme=' + theme);
    await sleep(1800);
    const box = await pa.evaluate(() => { const r = document.querySelector('.hero img').getBoundingClientRect(); return { x: r.x + r.width * 0.3, y: r.y + r.height * 0.3, width: r.width * 0.4, height: r.height * 0.4 }; });
    return PNG.sync.read(await pa.screenshot({ clip: box, scale: 'css' }));
  };
  const n = await crop('night'), r = await crop('red');
  let d = 0; const cnt = Math.min(n.data.length, r.data.length) / 4;
  for (let i = 0; i < cnt; i++) d += Math.abs(n.data[i * 4] - r.data[i * 4]) + Math.abs(n.data[i * 4 + 1] - r.data[i * 4 + 1]) + Math.abs(n.data[i * 4 + 2] - r.data[i * 4 + 2]);
  check('a photograph is pixel-identical in Night and Red (never graded or tinted)', d / cnt < 1, 'mean abs diff ' + (d / cnt).toFixed(2));
  await cx.close();
}

/* ------------------------------------------------------------------ 4 analytics */
async function analytics(b, origin) {
  setGroup('item 4 · tour analytics');
  const titles = JSON.parse(fs.readFileSync(path.join(L.ROOT, 'tour', 'stops.js'), 'utf8').replace(/^[^[]*/, '').replace(/;\s*$/, '')).map((s) => s.title);
  const walk = async (p) => { for (let i = 1; i < 9; i++) { await p.click('#next'); await sleep(120); } };

  // default: off
  let ctx = await b.newContext(VIEWS.desktop);
  await stubExternal(ctx);
  let reqs = [];
  ctx.on('request', (r) => reqs.push(r.url()));
  let p = await ctx.newPage();
  await p.goto(origin + 'tour/');
  await walk(p);
  const off = await p.evaluate(() => ({ mode: GJ_ANALYTICS.mode, ls: Object.keys(localStorage).filter((k) => /analytics/.test(k)) }));
  const foreign = reqs.filter((u) => !u.startsWith(origin) && !EXTERNAL.test(u));
  check('default: analytics mode is off, no storage written', off.mode === 'off' && off.ls.length === 0, JSON.stringify(off));
  check('default: no network call to any analytics endpoint across all nine stops', foreign.length === 0, foreign.slice(0, 3).join(' '));
  await ctx.close();

  // debug
  ctx = await b.newContext(VIEWS.desktop);
  await stubExternal(ctx);
  reqs = [];
  ctx.on('request', (r) => reqs.push(r.url()));
  p = await ctx.newPage();
  const logs = [];
  p.on('console', (m) => { if (/analytics:debug/.test(m.text())) logs.push(m.text()); });
  await p.goto(origin + 'tour/?analytics=debug');
  await walk(p);
  const counts = await p.evaluate(() => GJ_ANALYTICS.counts());
  check('?analytics=debug logs one console event per stop (nine)', logs.length === 9, 'logs=' + logs.length);
  check('debug: localStorage counter holds nine stops, each once', Object.keys(counts).length === 9 && Object.values(counts).every((v) => v === 1), JSON.stringify(counts).slice(0, 120));
  check('debug: event carries the stop title', titles.every((t) => logs.some((l) => l.includes('title: ' + t) || l.includes(t))), '');
  check('debug: nothing is sent', reqs.filter((u) => !u.startsWith(origin) && !EXTERNAL.test(u)).length === 0);
  await ctx.close();

  // configured provider (Plausible-style) via a stub
  ctx = await b.newContext(VIEWS.desktop);
  await stubExternal(ctx);
  const bodies = [];
  await ctx.route('**/shared/analytics/config.js', (r) => r.fulfill({ contentType: 'text/javascript', body: "window.GJ_ANALYTICS_CONFIG={provider:'plausible',endpoint:'https://analytics.invalid/api/event',domain:'jamesgillmedia.github.io'};" }));
  await ctx.route('https://analytics.invalid/**', (r) => { bodies.push(r.request().postData() || ''); r.fulfill({ status: 202, body: '' }); });
  p = await ctx.newPage();
  await p.goto(origin + 'tour/');
  await walk(p);
  await sleep(500);
  const evs = bodies.map((x) => { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean);
  check('configured provider: nine events are posted, one per stop', evs.length === 9, 'events=' + evs.length);
  check('configured provider: each event names the stop and its title, in order', evs.length === 9 && evs.every((e, i) => e.name === 'tour_stop' && e.props.title === titles[i] && e.props.stop === i + 1), '');
  await ctx.close();
}

/* ------------------------------------------------------------------ 5 share tags */
async function og(b, origin) {
  setGroup('item 5 · Open Graph and Twitter cards');
  const urls = sitemapUrls(origin);
  let bad = [];
  const imgs = new Set();
  for (const u of urls) {
    const r = await L.get(origin, u.slice(BASE.length) + 'index.html');
    const h = r.body.toString('utf8');
    const meta = (k, v) => { const m = new RegExp('<meta [^>]*\\b' + k + '="' + v + '"[^>]*>', 'i').exec(h); return m ? attr(m[0], 'content') : null; };
    const miss = [];
    for (const k of ['og:title', 'og:description', 'og:image', 'og:url']) if (!meta('property', k)) miss.push(k);
    if (meta('name', 'twitter:card') !== 'summary_large_image') miss.push('twitter:card');
    if (meta('property', 'og:url') !== u) miss.push('og:url!=' + meta('property', 'og:url'));
    const im = meta('property', 'og:image');
    if (!im || !im.startsWith(BASE)) miss.push('og:image not absolute');
    else imgs.add(im.slice(BASE.length));
    if (!/<title>[^<]+<\/title>/.test(h)) miss.push('title');
    if (miss.length) bad.push(u.slice(BASE.length) + ' ' + miss.join(','));
  }
  check(`all ${urls.length} sitemap pages carry og:title/description/image/url and twitter:card=summary_large_image, with absolute URLs`, bad.length === 0, bad.slice(0, 4).join(' | '));
  const dims = [];
  for (const rel of imgs) {
    const r = await L.get(origin, rel);
    const s = r.status === 200 ? L.jpegSize(r.body) : null;
    if (!s || s.w !== 1200 || s.h !== 630) dims.push(rel + ' ' + r.status + ' ' + JSON.stringify(s));
  }
  check(`all ${imgs.size} share images exist and are 1200x630 jpg`, dims.length === 0, dims.slice(0, 3).join(' | '));
  let total = 0; for (const rel of imgs) total += fs.statSync(path.join(L.ROOT, rel)).size;
  check('share images are optimized (each under 200 KB)', [...imgs].every((rel) => fs.statSync(path.join(L.ROOT, rel)).size < 200 * 1024), `${imgs.size} files, ${(total / 1024 / 1024).toFixed(1)} MB total`);
  const titles = new Set(); let untitled = [];
  for (const u of urls) { const h = (await L.get(origin, u.slice(BASE.length) + 'index.html')).body.toString('utf8'); const t = (/<title>([^<]*)<\/title>/.exec(h) || [])[1] || ''; if (/^untitled|^Gill James$/i.test(t.trim())) untitled.push(u.slice(BASE.length)); titles.add(t); }
  check('no page in the sitemap is untitled', untitled.length === 0, untitled.slice(0, 3).join(' '));
}

/* ------------------------------------------------------------------ 6 sitemap + clean URLs */
async function sitemap(b, origin) {
  setGroup('item 6 · sitemap, robots and clean tour URLs');
  const ctx = await b.newContext(VIEWS.desktop);
  await stubExternal(ctx);
  const p = await ctx.newPage();
  await p.goto(origin + 'tour/');
  for (const f of ['sitemap.xml', 'sitemap-images.xml']) {
    const xml = (await L.get(origin, f)).body.toString('utf8');
    const err = await p.evaluate((x) => { const d = new DOMParser().parseFromString(x, 'application/xml'); return d.querySelector('parsererror') ? d.querySelector('parsererror').textContent.slice(0, 100) : ''; }, xml);
    check(`${f} is well-formed XML`, err === '', err);
  }
  const urls = sitemapUrls(origin);
  check('sitemap uses only absolute https://jamesgillmedia.github.io/gill-sky/ URLs', urls.every((u) => u.startsWith(BASE)), `${urls.length} urls`);
  const stops = JSON.parse(fs.readFileSync(path.join(L.ROOT, 'tour', 'stops.js'), 'utf8').replace(/^[^[]*/, '').replace(/;\s*$/, ''));
  check('sitemap lists all nine tour stops and tour/', stops.every((s) => urls.includes(BASE + 'tour/' + s.slug + '/')) && urls.includes(BASE + 'tour/'));
  const main = ['tonight/fable-m4/', 'tonight/fable-m4/contact/', 'tonight/fable-m4/list/', 'tonight/fable-m4/player/', 'photo-lab/', 'tonight/photo-lab/', 'tonight/archive/', 'tonight/objects/', 'tonight/fable-m4/objects-3d/'];
  check('sitemap lists home, contact, list, player, photo-lab, darkroom, archive, objects and objects-3d', main.every((m) => urls.includes(BASE + m)));
  const non200 = [];
  for (const u of urls) { const r = await L.get(origin, u.slice(BASE.length)); if (r.status !== 200 || !/<html/i.test(r.body.toString('utf8', 0, 400))) non200.push(u.slice(BASE.length) + ' ' + r.status); }
  check(`all ${urls.length} sitemap URLs return 200 locally`, non200.length === 0, non200.slice(0, 3).join(' | '));
  const robots = (await L.get(origin, 'robots.txt')).body.toString();
  check('robots.txt points at both sitemaps', robots.includes('Sitemap: ' + BASE + 'sitemap.xml') && robots.includes('Sitemap: ' + BASE + 'sitemap-images.xml'));

  // old hash links
  const bad = [];
  for (let i = 1; i <= 9; i++) {
    await p.goto(origin + 'tour/#' + i);
    await p.waitForURL(new RegExp('/tour/' + stops[i - 1].slug + '/$'), { timeout: 4000 }).catch(() => {});
    if (!p.url().endsWith('/tour/' + stops[i - 1].slug + '/')) bad.push('#' + i + ' -> ' + p.url());
  }
  check('old tour/#1 .. tour/#9 links redirect to the clean paths', bad.length === 0, bad.join(' | '));
  await p.goto(origin + 'tour/backward-fall/#3');
  await p.waitForURL(/\/tour\/film-board\/$/, { timeout: 4000 }).catch(() => {});
  check('a #n on a stop page redirects too', /\/tour\/film-board\/$/.test(p.url()), p.url());

  // each stop is a real page that loads its own stop; prev/next/menu work
  const wrong = [];
  for (let i = 0; i < 9; i++) {
    await p.goto(origin + 'tour/' + stops[i].slug + '/');
    await p.waitForFunction(() => document.getElementById('view').dataset.state === 'ready', null, { timeout: 6000 }).catch(() => {});
    const o = await p.evaluate(() => ({ t: document.title, src: (document.querySelector('#view iframe') || {}).src, n: document.getElementById('label').innerText, st: document.getElementById('view').dataset.state }));
    if (!o.t.startsWith(stops[i].title) || o.src !== stops[i].url || o.st !== 'ready' || !o.n.includes((i + 1) + ' of 9')) wrong.push(stops[i].slug + ' ' + JSON.stringify(o));
  }
  check('each of the nine stop pages loads its own stop and title', wrong.length === 0, wrong.slice(0, 2).join(' | '));
  await p.goto(origin + 'tour/film-board/');
  await p.click('#next'); await sleep(250);
  const a1 = p.url();
  await p.click('#prev'); await p.click('#prev'); await sleep(250);
  const a2 = p.url();
  await p.click('#menubtn'); await p.click('#menu a:nth-child(9)'); await sleep(250);
  const a3 = p.url();
  await p.click('#next'); await sleep(250);
  check('next, prev, menu and wrap-around update the clean URL', a1.endsWith('/tour/demo-reel-card/') && a2.endsWith('/tour/backward-fall/') && a3.endsWith('/tour/objects-orbit/') && p.url().endsWith('/tour/one-with-the-devil/'), [a1, a2, a3, p.url()].map((u) => u.split('/tour/')[1]).join(' > '));
  await p.screenshot({ path: path.join(ART, 'tour-stop-stub-desktop.png') });
  await ctx.close();
  const cp = await b.newContext(VIEWS.phone);
  await stubExternal(cp);
  const pp = await cp.newPage();
  await pp.goto(origin + 'tour/one-with-the-devil/');
  await pp.waitForFunction(() => document.getElementById('view').dataset.state === 'ready', null, { timeout: 6000 }).catch(() => {});
  await pp.screenshot({ path: path.join(ART, 'tour-stop-stub-phone.png') });
  await cp.close();
}

/* ------------------------------------------------------------------ 7 image SEO */
async function images(b, origin) {
  setGroup('item 7 · image alt text and image sitemap');
  const urls = sitemapUrls(origin);
  const generic = [], missing = [];
  let seen = 0, described = 0;
  for (const u of urls) {
    const h = (await L.get(origin, u.slice(BASE.length) + 'index.html')).body.toString('utf8').replace(/<noscript>/g, '<div>').replace(/<\/noscript>/g, '</div>');
    for (const tag of h.match(/<img\b[^>]*>/gi) || []) {
      const alt = attr(tag, 'alt');
      seen++;
      if (alt === null) missing.push(u.slice(BASE.length) + ' ' + (attr(tag, 'src') || '').slice(-24));
      else if (/^(photograph|print) \d+$/i.test(alt) || /^(IMG_|image)/i.test(alt)) generic.push(u.slice(BASE.length) + ' ' + alt);
      else if (alt.trim()) described++;
    }
  }
  check(`no <img> without an alt attribute (${seen} images across the sitemap pages)`, missing.length === 0, missing.slice(0, 3).join(' | '));
  check(`no generic alt such as "photograph 07" left in static markup (${described} described)`, generic.length === 0, generic.slice(0, 3).join(' | '));
  for (const [name, rel, n] of [['photo lab', 'photo-lab/', 67], ['darkroom', 'tonight/photo-lab/', 66]]) {
    const h = (await L.get(origin, rel + 'index.html')).body.toString('utf8');
    const alts = (h.match(/<img\b[^>]*>/gi) || []).map((t) => attr(t, 'alt')).filter((a) => a);
    check(`${name}: all ${n} no-JS photographs have descriptive alt`, alts.length >= n && alts.every((a) => a.split(' ').length >= 3), `${alts.length} alts`);
  }
  // the labs draw pictures with script: the swap script fixes their generic alts at run time
  const ctx = await b.newContext(VIEWS.desktop);
  const p = await ctx.newPage();
  for (const [name, rel] of [['photo lab', 'photo-lab/'], ['darkroom', 'tonight/photo-lab/']]) {
    await p.goto(origin + rel);
    await sleep(3500);
    const o = await p.evaluate(() => [...document.querySelectorAll('img')].map((i) => i.getAttribute('alt')).filter((a) => a !== null));
    const gen = o.filter((a) => /^(photograph|print) \d+/i.test(a));
    check(`${name}: images drawn by script get descriptive alt (${o.filter((a) => a).length} labelled, ${gen.length} generic)`, o.filter((a) => a).length > 0 && gen.length === 0, gen.slice(0, 3).join(' | '));
  }
  await ctx.close();
  // image sitemap
  const xml = (await L.get(origin, 'sitemap-images.xml')).body.toString('utf8');
  const locs = [...xml.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((m) => m[1]);
  const pageLocs = [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check(`image sitemap has image:image entries (${locs.length}) for ${pageLocs.length} pages, all in sitemap.xml`, locs.length > 100 && pageLocs.every((u) => urls.includes(u)));
  const dead = [];
  for (const u of new Set(locs)) { if (!u.startsWith(BASE)) { dead.push(u); continue; } const r = await L.get(origin, u.slice(BASE.length), 'HEAD'); if (r.status !== 200) dead.push(u.slice(BASE.length) + ' ' + r.status); }
  check('every image:loc is absolute and returns 200 locally', dead.length === 0, dead.slice(0, 3).join(' | '));
  const robots = (await L.get(origin, 'robots.txt')).body.toString();
  check('robots.txt references sitemap-images.xml', robots.includes('sitemap-images.xml'));
}

/* ------------------------------------------------------------------ 8 links */
async function links(b, origin) {
  setGroup('item 8 · quiet links between pages');
  const urls = sitemapUrls(origin).map((u) => u.slice(BASE.length));
  const cache = new Map();
  const page = async (rel) => {
    if (cache.has(rel)) return cache.get(rel);
    const r = await L.get(origin, rel);
    const o = { status: r.status, html: r.status === 200 && /html/.test(r.headers['content-type'] || '') ? r.body.toString('utf8') : '' };
    cache.set(rel, o);
    return o;
  };
  const hrefs = (html, from) => {
    const out = [];
    for (const m of html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/gi)) {
      const h = m[1].replace(/&amp;/g, '&');
      if (!h || h.startsWith('#') || /^(mailto:|tel:|javascript:|data:)/i.test(h)) continue;
      let u;
      try { u = new URL(h, origin + from); } catch (e) { continue; }
      if (u.origin + '/' !== origin) { if (h.startsWith(BASE)) u = new URL(h.slice(BASE.length), origin); else continue; }
      out.push(u.pathname.replace(/^\//, ''));
    }
    return out;
  };
  const start = 'tonight/fable-m4/';
  const depth = new Map([[start, 0]]);
  const queue = [start], broken = [], seenFrom = new Map();
  while (queue.length) {
    const cur = queue.shift();
    const pg = await page(cur);
    if (pg.status !== 200) { broken.push(`${cur} -> ${pg.status} (from ${seenFrom.get(cur)})`); continue; }
    if (!pg.html) continue;
    for (const t of new Set(hrefs(pg.html, cur))) {
      if (!depth.has(t)) { depth.set(t, depth.get(cur) + 1); seenFrom.set(t, cur); queue.push(t); }
    }
  }
  check(`crawled ${depth.size} internal pages from home: no internal link 404s`, broken.length === 0, broken.slice(0, 5).join(' | '));
  const unreach = urls.filter((u) => !depth.has(u));
  const far = urls.filter((u) => depth.has(u) && depth.get(u) > 3);
  const maxd = Math.max(...urls.map((u) => depth.get(u) ?? 99));
  check(`every sitemap page is reachable from home (${urls.length} pages)`, unreach.length === 0, unreach.slice(0, 5).join(' | '));
  check(`... within 3 clicks (deepest: ${maxd})`, far.length === 0, far.slice(0, 5).map((u) => u + ':' + depth.get(u)).join(' | '));
  const dist = {}; for (const u of urls) dist[depth.get(u)] = (dist[depth.get(u)] || 0) + 1;
  console.log('    clicks from home:', JSON.stringify(dist));

  // specific promises
  const tour = ['tour/'];
  const stops = urls.filter((u) => /^tour\/[^/]+\/$/.test(u));
  const bad = [];
  for (let i = 0; i < stops.length; i++) {
    const h = (await page(stops[i])).html;
    const ls = new Set(hrefs(h, stops[i]));
    const prev = stops[(i + stops.length - 1) % stops.length], next = stops[(i + 1) % stops.length];
    if (!ls.has('tour/') || !ls.has(prev) || !ls.has(next) || !ls.has(start)) bad.push(stops[i]);
  }
  check('each tour stop links to the tour index, its prev and next stop, and home', bad.length === 0, bad.join(' '));
  const mains = ['tonight/fable-m4/contact/', 'tonight/fable-m4/list/', 'tonight/fable-m4/player/', 'photo-lab/', 'tonight/photo-lab/', 'tonight/archive/', 'tonight/objects/', 'tonight/fable-m4/objects-3d/', 'tour/'];
  const home = new Set(hrefs((await page(start)).html, start));
  check('home links to every main page (contact, list, sound, photo lab, darkroom, archive, objects, objects 3d, tour)', mains.every((m) => home.has(m)), mains.filter((m) => !home.has(m)).join(' '));
  const back = [];
  for (const m of mains.filter((m) => m !== 'tour/')) { const ls = new Set(hrefs((await page(m)).html, m)); if (!ls.has(start)) back.push(m); }
  check('every main page links back home', back.length === 0, back.join(' '));
  check('no links were added inside r9/ or inside/', (() => { const { execSync } = require('child_process'); try { return execSync('git diff --name-only origin/main -- r9 inside', { cwd: L.ROOT }).toString().trim() === ''; } catch (e) { return true; } })());

  // not covering existing controls, phone and desktop
  const targets = [['home (sky)', start, '#dive'], ['contact', 'tonight/fable-m4/contact/'], ['list', 'tonight/fable-m4/list/'], ['sound', 'tonight/fable-m4/player/'], ['photo lab', 'photo-lab/'], ['darkroom', 'tonight/photo-lab/'],
    ['archive', 'tonight/archive/'], ['objects', 'tonight/objects/'], ['objects 3d', 'tonight/fable-m4/objects-3d/'], ['objects page', 'tonight/fable-m4/objects/joio/'], ['tour stop', 'tour/beyond/']];
  for (const [vn, vp] of Object.entries(VIEWS)) {
    const ctx = await b.newContext(vp);
    await stubExternal(ctx);
    const clash = [], hidden = [];
    for (const [name, rel, click] of targets) {
      const p = await ctx.newPage();
      await p.goto(origin + rel);
      await sleep(2200);
      if (click) { await p.click(click).catch(() => {}); await sleep(5500); }
      const r = await p.evaluate(() => {
        const sel = '.sp-links:not([hidden]),#splinks:not([hidden]),#links';
        const nav = [...document.querySelectorAll(sel)].filter((n) => n.getBoundingClientRect().width > 0);
        if (!nav.length) return { none: true };
        const ctl = [...document.querySelectorAll('a,button,input,select,summary,[role=button],[tabindex]')].filter((e) => {
          if (nav.some((n) => n.contains(e))) return false;
          const s = getComputedStyle(e), q = e.getBoundingClientRect();
          return q.width > 0 && q.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && parseFloat(s.opacity) > 0.05 && s.pointerEvents !== 'none' && q.width < innerWidth * 0.6 && q.height < innerHeight * 0.6;
        });
        const hit = [];
        for (const n of nav) for (const a of n.querySelectorAll('a')) {
          const q = a.getBoundingClientRect();
          for (const e of ctl) { const c = e.getBoundingClientRect(); if (q.left < c.right - 1 && q.right > c.left + 1 && q.top < c.bottom - 1 && q.bottom > c.top + 1) hit.push((a.textContent) + '/' + (e.id || e.className || e.tagName)); }
        }
        const inView = nav.every((n) => { const q = n.getBoundingClientRect(); return q.left >= -1 && q.right <= innerWidth + 1 && q.top >= -1 && (q.bottom <= innerHeight + 1 || getComputedStyle(n).position !== 'fixed'); });
        const topEl = [...nav][0].querySelector('a');
        if (getComputedStyle([...nav][0]).position !== 'fixed') topEl.scrollIntoView({ block: 'center' });
        const q = topEl.getBoundingClientRect();
        const at = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2);
        return { hit, inView, reachable: !!at && (at === topEl || topEl.contains(at)) };
      });
      if (r.none) hidden.push(name);
      else { if (r.hit.length) clash.push(name + ': ' + r.hit.slice(0, 3).join(',')); if (!r.inView) clash.push(name + ': off screen'); if (!r.reachable) clash.push(name + ': covered by something'); }
      if (name.startsWith('home')) await p.screenshot({ path: path.join(ART, `links-home-${vn}.png`) });
      if (name === 'photo lab' || name === 'objects') await p.screenshot({ path: path.join(ART, `links-${name.replace(' ', '-')}-${vn}.png`) });
      await p.close();
    }
    check(`[${vn}] links are visible on every page and cover no existing control`, clash.length === 0 && hidden.length === 0, clash.concat(hidden.map((h) => h + ': no links shown')).slice(0, 4).join(' | '));
    await ctx.close();
  }
}

(async () => {
  const { srv, origin } = await L.serve();
  const b = await L.launch();
  const G = { errors, blank, a11y, analytics, og, sitemap, images, links };
  try {
    for (const [name, fn] of Object.entries(G)) if (want(name)) await fn(b, origin);
  } finally {
    await b.close();
    srv.close();
  }
  const fails = results.filter((r) => !r.ok);
  console.log(`\n${results.length - fails.length}/${results.length} checks passed`);
  fs.writeFileSync(path.join(ART, 'site-polish-test-results.json'), JSON.stringify(results, null, 1));
  process.exit(fails.length ? 1 : 0);
})();
