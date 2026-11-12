/* archive index — numbered-box field of every swept film frame.
   Canvas field (pan / pinch / wheel zoom), tap a box to lift it out.
   Nothing ever advances on its own. */
(() => {
'use strict';
const RM = matchMedia('(prefers-reduced-motion: reduce)');
const vp = document.getElementById('vp'), cv = document.getElementById('cv'), cx = cv.getContext('2d');
const $ = id => document.getElementById(id);
const CW = 160, CH = 90, GX = 12, GY = 12, HEAD = 62, FGAP = 30, PAD = 24;
const MONO = 'ui-monospace,"SFMono-Regular","SF Mono",Menlo,Consolas,"DejaVu Sans Mono","Liberation Mono",monospace';
const RED = '229,55,44';
let D, F = [], films = [], mode = 'film', hi = null;  // hi = highlighted film index
let L = null;            // layout
let vw = 0, vh = 0, dpr = 1, TOP = 46;
let s = 1, ox = 0, oy = 0;   // screen = (world - o) * s
let dirty = true, cur = -1;  // cur = lifted frame index

const pad4 = n => String(n).padStart(4, '0');

/* ---------- images ---------- */
const cache = new Map(); let inflight = 0; const want = [];
function img(src) {
  let e = cache.get(src);
  if (e) { if (e.ok) { cache.delete(src); cache.set(src, e); } return e.ok ? e.im : null; }
  want.push(src); return null;
}
function pump() {
  while (inflight < 14 && want.length) {
    const src = want.shift();
    if (cache.has(src)) continue;
    const im = new Image(); im.decoding = 'async';
    const e = { im, ok: false }; cache.set(src, e); inflight++;
    im.onload = () => { e.ok = true; inflight--; dirty = true; pump(); };
    im.onerror = () => { inflight--; pump(); };
    im.src = src;
  }
  // light LRU on big tier
  if (cache.size > 900) {
    let n = cache.size - 900;
    for (const [k, e] of cache) { if (n <= 0) break; if (e.ok && !k.includes('/atlas/')) { cache.delete(k); n--; } }
  }
}

/* ---------- layout ---------- */
function build(cols) {
  const r = new Float32Array(F.length * 2); const heads = [];
  let y = PAD, W = PAD * 2 + cols * CW + (cols - 1) * GX;
  if (mode === 'film') {
    films.forEach((f, k) => {
      if (k) y += FGAP;
      heads.push({ k, y });
      y += HEAD;
      f.frames.forEach((x, j) => {
        const c = j % cols, rr = (j / cols) | 0;
        r[x.g * 2] = PAD + c * (CW + GX); r[x.g * 2 + 1] = y + rr * (CH + GY);
      });
      y += Math.ceil(f.frames.length / cols) * (CH + GY) - GY;
    });
  } else {
    F.forEach((x, j) => {
      const c = j % cols, rr = (j / cols) | 0;
      r[j * 2] = PAD + c * (CW + GX); r[j * 2 + 1] = y + rr * (CH + GY);
    });
    y += Math.ceil(F.length / cols) * (CH + GY) - GY;
  }
  return { cols, r, heads, W, H: y + PAD };
}
function layout() {
  const a = vw / Math.max(1, vh - TOP);
  let best = null, bd = 1e9;
  for (let c = 5; c <= 90; c++) {
    const l = build(c); const d = Math.abs(Math.log((l.W / l.H) / a));
    if (d < bd) { bd = d; best = l; }
  }
  L = best;
}
function fitS() { return Math.min((vw - 8) / L.W, (vh - TOP - 6) / L.H); }
function minS() { return fitS() * 0.85; }
function maxS() { return Math.max(vw, vh) * 0.9 / CW; }
function fit(anim) { const t = fitS(); go(t, L.W / 2 - vw / 2 / t, L.H / 2 - (vh + TOP) / 2 / t, anim); }
function clamp() {
  s = Math.min(maxS(), Math.max(minS(), s));
  const ww = L.W * s, wh = L.H * s;
  // keep some of the field on screen; centre if it is smaller than the view
  const mx = ww < vw ? (L.W / 2 - vw / 2 / s) : null;
  const my = wh < vh - TOP ? (L.H / 2 - (vh + TOP) / 2 / s) : null;
  ox = mx !== null ? mx : Math.min(L.W - vw / s + 40 / s, Math.max(-40 / s, ox));
  oy = my !== null ? my : Math.min(L.H - vh / s + 60 / s, Math.max(-(TOP + 40) / s, oy));
}
let anim = null;
function go(ts, tx, ty, a) {
  if (!a || RM.matches) { s = ts; ox = tx; oy = ty; clamp(); dirty = true; return; }
  const s0 = s, x0 = ox, y0 = oy, t0 = performance.now(), dur = 420;
  anim = t => {
    let k = Math.min(1, (t - t0) / dur); k = 1 - Math.pow(1 - k, 3);
    // interpolate in log-scale, keep centre path smooth
    s = s0 * Math.pow(ts / s0, k);
    const c0x = x0 + vw / 2 / s0, c0y = y0 + vh / 2 / s0, c1x = tx + vw / 2 / ts, c1y = ty + vh / 2 / ts;
    ox = c0x + (c1x - c0x) * k - vw / 2 / s; oy = c0y + (c1y - c0y) * k - vh / 2 / s;
    dirty = true;
    if (k >= 1) { anim = null; clamp(); }
  };
}
function zoomAt(f, px, py) {
  const wx = ox + px / s, wy = oy + py / s;
  s = Math.min(maxS(), Math.max(minS(), s * f));
  ox = wx - px / s; oy = wy - py / s; clamp(); dirty = true;
}
function focusOn(g, a) {   // centre a frame at a readable size
  const x = L.r[g * 2], y = L.r[g * 2 + 1];
  const ts = Math.max(s, Math.min(maxS(), Math.min(vw, vh) * 0.32 / CW));
  go(ts, x + CW / 2 - vw / 2 / ts, y + CH / 2 - (vh + TOP) / 2 / ts, a);
}

/* ---------- draw ---------- */
function resize() {
  const ctr = L ? centreFrame() : -1;
  dpr = Math.min(2.5, window.devicePixelRatio || 1);
  vw = innerWidth; vh = innerHeight;
  cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
  TOP = document.querySelector('.top').getBoundingClientRect().height;
  if (!F.length) return;
  const fitted = !L || s <= fitS() * 1.05;
  layout();
  if (fitted || ctr < 0) fit(false); else { const ts = s; go(ts, L.r[ctr * 2] + CW / 2 - vw / 2 / ts, L.r[ctr * 2 + 1] + CH / 2 - vh / 2 / ts, false); }
  if (cur >= 0) placeLift(false);
  dirty = true;
}
function centreFrame() {
  const wx = ox + vw / 2 / s, wy = oy + vh / 2 / s; let b = -1, bd = 1e18;
  for (let g = 0; g < F.length; g++) { const dx = L.r[g * 2] + CW / 2 - wx, dy = L.r[g * 2 + 1] + CH / 2 - wy, d = dx * dx + dy * dy; if (d < bd) { bd = d; b = g; } }
  return b;
}
function draw() {
  want.length = 0;
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx.fillStyle = '#0a0b0d'; cx.fillRect(0, 0, vw, vh);
  cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high';
  const bw = CW * s, bh = CH * s, dev = bw * dpr;
  const tier = dev <= 100 ? 0 : dev <= 300 ? 1 : 2;
  const x0 = ox - CW, x1 = ox + vw / s, y0 = oy - CH, y1 = oy + vh / s;
  const oa = bw < 7 ? .2 : bw < 18 ? .36 : bw < 40 ? .55 : .72;
  const lw = bw < 30 ? 1 / dpr * Math.max(1, dpr * .75) : 1;
  const showNum = bw >= 58, fs = Math.max(8.5, Math.min(12.5, bw * .072));
  const vis = [];
  for (let g = 0; g < F.length; g++) {
    const wx = L.r[g * 2], wy = L.r[g * 2 + 1];
    if (wx < x0 || wx > x1 || wy < y0 || wy > y1) continue;
    vis.push(g);
  }
  // atlases first (needed for tier 0 and as a fallback)
  for (const g of vis) {
    const x = F[g], f = films[x.f];
    const sx = (wxS(g)), sy = (wyS(g));
    let drawn = false;
    if (tier >= 1) {
      const src = (tier === 2 ? 'media/l/' : 'media/s/') + f.slug + '/' + x.id + '.webp';
      let im = img(src);
      if (!im && tier === 2) im = img('media/s/' + f.slug + '/' + x.id + '.webp');
      if (im) { drawContain(im, 0, 0, im.naturalWidth, im.naturalHeight, sx, sy, bw, bh); drawn = true; }
    }
    if (!drawn) {
      const at = img(f.atlas.src);
      if (at) {
        const j = x.j, a = f.atlas;
        cx.drawImage(at, (j % a.cols) * a.cw, ((j / a.cols) | 0) * a.ch, a.cw, a.ch, sx, sy, bw, bh);
      } else { cx.fillStyle = '#141619'; cx.fillRect(sx, sy, bw, bh); }
    }
  }
  // veil for non-highlighted films
  if (hi !== null) {
    cx.fillStyle = 'rgba(10,11,13,.72)';
    for (const g of vis) if (F[g].f !== hi) cx.fillRect(wxS(g) - 1, wyS(g) - 1, bw + 2, bh + 2);
  }
  // outlines
  cx.lineWidth = lw;
  cx.strokeStyle = `rgba(${RED},${hi !== null ? oa * .35 : oa})`;
  cx.beginPath();
  for (const g of vis) if (hi === null || F[g].f !== hi) { const sx = wxS(g), sy = wyS(g); cx.rect(snap(sx) + lw / 2, snap(sy) + lw / 2, snap(bw) - lw, snap(bh) - lw); }
  cx.stroke();
  if (hi !== null) {
    cx.lineWidth = Math.max(lw, bw > 40 ? 1.5 : 1); cx.strokeStyle = `rgba(${RED},1)`; cx.beginPath();
    for (const g of vis) if (F[g].f === hi) { const sx = wxS(g), sy = wyS(g); cx.rect(snap(sx) + .5, snap(sy) + .5, snap(bw) - 1, snap(bh) - 1); }
    cx.stroke();
  }
  if (hov >= 0 && cur < 0) {
    cx.lineWidth = 1.5; cx.strokeStyle = '#fff'; cx.strokeRect(wxS(hov), wyS(hov), bw, bh);
  }
  if (cur >= 0) { cx.lineWidth = 2; cx.strokeStyle = `rgb(${RED})`; cx.strokeRect(wxS(cur) - 1, wyS(cur) - 1, bw + 2, bh + 2); }
  // numerals: red tag in the top-left corner, like the boxed sheet
  if (showNum) {
    cx.font = `500 ${fs}px ${MONO}`; cx.textBaseline = 'middle';
    const th = Math.round(fs + 5), tw = cx.measureText('0000').width + 7;
    for (const g of vis) {
      const dim = hi !== null && F[g].f !== hi;
      const sx = snap(wxS(g)), sy = snap(wyS(g));
      cx.fillStyle = dim ? 'rgba(120,36,30,.8)' : `rgb(${RED})`;
      cx.fillRect(sx, sy, tw, th);
      cx.fillStyle = dim ? 'rgba(255,255,255,.45)' : '#fff';
      cx.fillText(pad4(F[g].n), sx + 3.5, sy + th / 2 + .5);
    }
  } else if (bw >= 14 && hi !== null) { /* no numerals when tiny */ }
  // film headers (by-film order)
  if (mode === 'film') {
    const hs = HEAD * s;
    for (const h of L.heads) {
      const sy = (h.y - oy) * s; if (sy > vh || sy + hs < -2) continue;
      const f = films[h.k], on = hi === h.k;
      const sx = (PAD - ox) * s, ex = (L.W - PAD - ox) * s;
      cx.strokeStyle = on ? `rgba(${RED},.9)` : 'rgba(255,255,255,.12)'; cx.lineWidth = 1;
      cx.beginPath(); cx.moveTo(sx, snap(sy + hs * .82) + .5); cx.lineTo(ex, snap(sy + hs * .82) + .5); cx.stroke();
      const ts = Math.min(15, hs * .36);
      if (ts >= 6.5) {
        cx.textBaseline = 'alphabetic';
        cx.font = `400 ${ts}px "Julius Sans One",sans-serif`;
        cx.fillStyle = on ? '#fff' : (hi !== null ? 'rgba(238,240,242,.45)' : 'rgba(238,240,242,.86)');
        const label = f.title.toLowerCase();
        const lx = Math.max(sx, 12), rx = Math.min(ex, vw - 12);
        if (rx - lx < ts * 6) continue;
        cx.fillText(label, lx, sy + hs * .66, Math.max(10, rx - lx - ts * 11));
        cx.font = `400 ${Math.max(6, ts * .78)}px ${MONO}`;
        cx.fillStyle = on ? `rgb(${RED})` : 'rgba(150,157,162,.9)';
        const rng = pad4(f.frames[0].n) + '–' + pad4(f.frames[f.frames.length - 1].n);
        const w = cx.measureText(rng).width; cx.fillText(rng, rx - w, sy + hs * .66);
      }
    }
  }
  pump();
  let a = 1e9, z = -1;
  for (const g of vis) { const sx = wxS(g), sy = wyS(g); if (sx + bw > 0 && sx < vw && sy + bh > TOP && sy < vh) { a = Math.min(a, F[g].n); z = Math.max(z, F[g].n); } }
  $('lvl').textContent = z > 0 ? pad4(a) + '–' + pad4(z) : '';
}
const wxS = g => (L.r[g * 2] - ox) * s, wyS = g => (L.r[g * 2 + 1] - oy) * s;
const snap = v => Math.round(v * dpr) / dpr;
function drawContain(im, sx, sy, sw, sh, dx, dy, dw, dh) {
  const r = Math.min(dw / sw, dh / sh), w = sw * r, h = sh * r;
  cx.fillStyle = '#050506'; cx.fillRect(dx, dy, dw, dh);
  cx.drawImage(im, sx, sy, sw, sh, dx + (dw - w) / 2, dy + (dh - h) / 2, w, h);
}
function loop(t) {
  if (anim) anim(t);
  if (glide) glide(t);
  if (dirty) { dirty = false; draw(); }
  requestAnimationFrame(loop);
}

/* ---------- hit test ---------- */
function hit(px, py) {
  const wx = ox + px / s, wy = oy + py / s;
  for (let g = 0; g < F.length; g++) {
    const x = L.r[g * 2], y = L.r[g * 2 + 1];
    if (wx >= x && wx <= x + CW && wy >= y && wy <= y + CH) return g;
  }
  return -1;
}

/* ---------- input ---------- */
const P = new Map(); let pinch = null, tap = null, glide = null, hov = -1, vel = [0, 0, 0];
vp.addEventListener('pointerdown', e => {
  vp.setPointerCapture(e.pointerId); anim = null; glide = null;
  P.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (P.size === 1) tap = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false };
  if (P.size === 2) { const [a, b] = [...P.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; tap = null; }
});
vp.addEventListener('pointermove', e => {
  if (!P.has(e.pointerId)) {
    if (e.pointerType === 'mouse') { const h = hit(e.clientX, e.clientY); if (h !== hov) { hov = h; dirty = true; } }
    return;
  }
  const p = P.get(e.pointerId), dx = e.clientX - p.x, dy = e.clientY - p.y;
  p.x = e.clientX; p.y = e.clientY;
  if (P.size === 1) {
    if (tap && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) > 7) { tap.moved = true; vp.classList.add('drag'); }
    if (!tap || tap.moved) {
      ox -= dx / s; oy -= dy / s; clamp(); dirty = true;
      const t = performance.now(); vel = [dx, dy, t];
    }
  } else if (P.size === 2 && pinch) {
    const [a, b] = [...P.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    ox -= (mx - pinch.mx) / s; oy -= (my - pinch.my) / s;
    zoomAt(d / pinch.d, mx, my);
    pinch = { d, mx, my };
  }
});
function up(e) {
  if (!P.has(e.pointerId)) return;
  P.delete(e.pointerId); vp.classList.remove('drag');
  if (P.size === 1) { const [a] = [...P.values()]; pinch = null; tap = null; vel = [0, 0, 0]; a && (a.x = a.x); }
  if (P.size) return;
  pinch = null;
  if (tap && !tap.moved && e.type === 'pointerup' && performance.now() - tap.t < 600) {
    const g = hit(e.clientX, e.clientY); if (g >= 0) openLift(g, true);
  } else if (tap && tap.moved && !RM.matches && performance.now() - vel[2] < 60) {
    let vx = vel[0], vy = vel[1];
    glide = () => { vx *= .92; vy *= .92; ox -= vx / s; oy -= vy / s; clamp(); dirty = true; if (Math.abs(vx) + Math.abs(vy) < .3) glide = null; };
  }
  tap = null;
}
vp.addEventListener('pointerup', up); vp.addEventListener('pointercancel', up);
vp.addEventListener('pointerleave', () => { if (hov >= 0) { hov = -1; dirty = true; } });
vp.addEventListener('wheel', e => {
  e.preventDefault(); anim = null; glide = null;
  const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vh : 1;
  if (!e.ctrlKey && (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY))) {
    ox += (e.deltaX || e.deltaY) * k / s; clamp(); dirty = true; return;
  }
  zoomAt(Math.exp(-e.deltaY * k * (e.ctrlKey ? .01 : .0018)), e.clientX, e.clientY);
}, { passive: false });
vp.addEventListener('dblclick', e => e.preventDefault());
['gesturestart', 'gesturechange'].forEach(t => document.addEventListener(t, e => e.preventDefault()));

/* ---------- lifted frame ---------- */
const lt = $('lt'), fig = $('ltfig'), lo = $('ltlo'), hiImg = $('lthi');
let pushed = false, liftRect = null;
function liftTarget(g) {
  const x = F[g]; const ar = x.w / x.h;
  const narrow = vw < 560;
  const aw = vw - (narrow ? 24 : 150), ah = vh - (narrow ? 190 : 170);
  const bw = CW * s;
  let w = Math.max(3 * bw, Math.min(aw, narrow ? aw : 900));   // at least ~3x the box
  w = Math.min(w, aw, 1280);
  let h = w / ar; if (h > ah) { h = ah; w = h * ar; }
  return { w, h, x: (vw - w) / 2, y: Math.max(TOP + 26, (vh - h) / 2 - (narrow ? 30 : 16)) };
}
function placeLift(animate) {
  const t = liftTarget(cur); liftRect = t;
  fig.style.width = t.w + 'px'; fig.style.height = t.h + 'px';
  fig.classList.remove('anim');
  fig.style.transform = `translate(${t.x}px,${t.y}px)`;
  if (animate && !RM.matches) {
    // FLIP from the box on the field
    const bx = wxS(cur), by = wyS(cur), bw = CW * s, bh = CH * s;
    const r = Math.min(bw / t.w, bh / t.h);
    fig.style.transform = `translate(${bx + (bw - t.w * r) / 2}px,${by + (bh - t.h * r) / 2}px) scale(${r})`;
    fig.getBoundingClientRect();
    fig.classList.add('anim');
    fig.style.transform = `translate(${t.x}px,${t.y}px)`;
  }
}
function fillLift() {
  const x = F[cur], f = films[x.f], n = pad4(x.n);
  const lsrc = 'media/s/' + f.slug + '/' + x.id + '.webp', hsrc = 'media/l/' + f.slug + '/' + x.id + '.webp';
  lo.src = lsrc; hiImg.classList.remove('on'); hiImg.onload = () => hiImg.classList.add('on'); hiImg.src = hsrc;
  $('lttag').textContent = n;
  $('ltnum').textContent = 'no. ' + n + ' / ' + pad4(F.length);
  $('lttitle').textContent = f.title;
  $('lttitle').setAttribute('aria-pressed', hi === x.f ? 'true' : 'false');
  $('lttc').textContent = 'frame ' + x.i + ' of ' + f.frames.length + ' · ' + x.tc;
  fig.setAttribute('aria-label', 'Frame ' + n + ', ' + f.title + ', ' + x.tc);
  // preload neighbours (user may step; nothing steps by itself)
  [cur - 1, cur + 1].forEach(k => { if (k >= 0 && k < F.length) { const y = F[k]; new Image().src = 'media/l/' + films[y.f].slug + '/' + y.id + '.webp'; } });
}
function openLift(g, animate, fromHash) {
  const was = cur >= 0; cur = g;
  // make sure the box is on screen behind the lift
  const sx = wxS(g), sy = wyS(g);
  if (sx < 0 || sy < TOP || sx + CW * s > vw || sy + CH * s > vh) focusOn(g, false);
  lt.hidden = false; fillLift(); placeLift(animate && !was);
  const h = '#n=' + pad4(F[g].n) + (mode === 'all' ? '&order=continuous' : '');
  if (!fromHash) {
    if (!was && !pushed) { history.pushState({ lift: 1 }, '', h); pushed = true; }
    else history.replaceState(history.state, '', h);
  }
  dirty = true; $('ltx').focus({ preventScroll: true });
}
function step(d) {
  if (cur < 0) return; const g = cur + d; if (g < 0 || g >= F.length) return;
  openLift(g, false);
}
function closeLift(fromPop) {
  if (cur < 0) return;
  const g = cur; cur = -1; lt.hidden = true; dirty = true;
  const sx = wxS(g), sy = wyS(g);
  if (sx < 0 || sy < TOP || sx + CW * s > vw || sy + CH * s > vh) focusOn(g, false);
  if (!fromPop) { if (pushed) { pushed = false; history.back(); } else history.replaceState(null, '', location.pathname + (mode === 'all' ? '#order=continuous' : '')); }
  else pushed = false;
}
$('ltx').onclick = () => closeLift(); $('ltbg').onclick = () => closeLift();
$('ltprev').onclick = () => step(-1); $('ltnext').onclick = () => step(1);
$('lttitle').onclick = () => { setHi(hi === F[cur].f ? null : F[cur].f); $('lttitle').setAttribute('aria-pressed', hi === F[cur].f ? 'true' : 'false'); };
// swipe between neighbours on the lifted frame
let sw = null;
fig.addEventListener('pointerdown', e => { sw = { x: e.clientX, y: e.clientY, id: e.pointerId }; });
fig.addEventListener('pointerup', e => {
  if (!sw || sw.id !== e.pointerId) return;
  const dx = e.clientX - sw.x, dy = e.clientY - sw.y; sw = null;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) step(dx < 0 ? 1 : -1);
  else if (dy > 70 && Math.abs(dy) > Math.abs(dx) * 1.3) closeLift();
});
fig.style.touchAction = 'none';
addEventListener('popstate', () => { if (cur >= 0) closeLift(true); else readHash(); });


/* ---------- modes, highlight, films list ---------- */
function setMode(m, keep) {
  if (m === mode) return;
  const ctr = cur >= 0 ? cur : centreFrame(); const fitted = s <= fitS() * 1.05;
  mode = m; layout();
  document.querySelectorAll('.modes button').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === m ? 'true' : 'false'));
  if (fitted) fit(false); else { go(s, L.r[ctr * 2] + CW / 2 - vw / 2 / s, L.r[ctr * 2 + 1] + CH / 2 - vh / 2 / s, false); }
  if (!keep && cur < 0) history.replaceState(null, '', location.pathname + (m === 'all' ? '#order=continuous' : ''));
  dirty = true;
}
document.querySelectorAll('.modes button').forEach(b => b.onclick = () => setMode(b.dataset.mode));
function setHi(k) {
  hi = k; dirty = true;
  document.querySelectorAll('#filmlist button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.k === k || (b.dataset.k === '' && k === null))));
}
const fl = $('films'), fb = $('filmsbtn');
fb.onclick = () => { fl.hidden = !fl.hidden; fb.setAttribute('aria-expanded', String(!fl.hidden)); };
function buildList() {
  const ol = $('filmlist'); ol.innerHTML = '';
  const none = document.createElement('li'); none.className = 'none';
  none.innerHTML = '<button type="button" data-k="" aria-pressed="true"><span class="r">0001–' + pad4(F.length) + '</span><span class="t">all films</span></button>';
  ol.appendChild(none);
  films.forEach((f, k) => {
    const li = document.createElement('li'); const b = document.createElement('button'); b.type = 'button'; b.dataset.k = k;
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = '<span class="r"></span><span class="t"></span>';
    b.querySelector('.r').textContent = pad4(f.frames[0].n) + '–' + pad4(f.frames[f.frames.length - 1].n);
    b.querySelector('.t').textContent = f.title;
    li.appendChild(b); ol.appendChild(li);
  });
  ol.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.k === '') { setHi(null); return; }
    const k = +b.dataset.k; setHi(k);
    const f = films[k], a = f.frames[0].g, z = f.frames[f.frames.length - 1].g;
    const x0 = PAD, y0 = L.r[a * 2 + 1] - (mode === 'film' ? HEAD : 0), y1 = L.r[z * 2 + 1] + CH;
    const ts = Math.min(maxS(), Math.max(fitS(), Math.min((vw - 20) / L.W, (vh - TOP - 30) / (y1 - y0))));
    go(ts, L.W / 2 - vw / 2 / ts, (y0 + y1) / 2 - (vh + TOP) / 2 / ts, true);
    fl.hidden = true; fb.setAttribute('aria-expanded', 'false');
  };
}
$('fit').onclick = () => { glide = null; fit(true); };

addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (cur >= 0) closeLift(); else if (!fl.hidden) { fl.hidden = true; fb.setAttribute('aria-expanded', 'false'); } else if (hi !== null) setHi(null); return; }
  if (cur >= 0) {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); step(L.cols); }
    if (e.key === 'ArrowUp') { e.preventDefault(); step(-L.cols); }
    return;
  }
  if (e.target.closest && e.target.closest('button')) return;
  const P2 = 60;
  if (e.key === '+' || e.key === '=') zoomAt(1.4, vw / 2, vh / 2);
  else if (e.key === '-' || e.key === '_') zoomAt(1 / 1.4, vw / 2, vh / 2);
  else if (e.key === '0') fit(true);
  else if (e.key === 'ArrowRight') { ox += P2 / s; clamp(); dirty = true; }
  else if (e.key === 'ArrowLeft') { ox -= P2 / s; clamp(); dirty = true; }
  else if (e.key === 'ArrowDown') { oy += P2 / s; clamp(); dirty = true; }
  else if (e.key === 'ArrowUp') { oy -= P2 / s; clamp(); dirty = true; }
});

/* ---------- deep links: #n=0142, #order=continuous, #film=slug ---------- */
function readHash() {
  const q = new URLSearchParams(location.hash.slice(1));
  const o = q.get('order'); setMode(o === 'continuous' ? 'all' : 'film', true);
  const fs = q.get('film'); if (fs) { const k = films.findIndex(f => f.slug === fs); if (k >= 0) setHi(k); }
  const n = parseInt(q.get('n'), 10);
  if (n >= 1 && n <= F.length) { focusOn(n - 1, false); openLift(n - 1, false, true); }
  else if (cur >= 0) closeLift(true);
}

/* ---------- boot ---------- */
fetch('data/index.json').then(r => r.json()).then(d => {
  D = d; films = d.films;
  films.forEach((f, k) => f.frames.forEach((x, j) => { x.f = k; x.j = j; x.g = F.length; F.push(x); }));
  $('count').textContent = d.count.toLocaleString('en-US') + ' frames · ' + films.length + ' films · 0001–' + pad4(d.count);
  buildList(); resize();
  films.forEach(f => img(f.atlas.src)); pump();
  if (location.hash) readHash();
  requestAnimationFrame(loop);
});
addEventListener('resize', resize);
if (document.fonts) document.fonts.ready.then(() => { dirty = true; });
})();
