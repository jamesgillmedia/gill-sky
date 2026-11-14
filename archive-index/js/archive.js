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
// box chrome: 'boxes' (full red outlines + tags), 'dim' (~28% outlines/tags, no red fill), 'hide' (none)
const BOXK = 'archive-index-boxes', BOXV = ['boxes', 'dim', 'hide'];
let bx = 'boxes';
try { const v = localStorage.getItem(BOXK); if (BOXV.includes(v)) bx = v; } catch (e) {}

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
  // outlines (box chrome: boxes / dim / hide)
  const BA = bx === 'dim' ? .28 : 1;
  if (bx !== 'hide') {
  cx.lineWidth = lw;
  cx.strokeStyle = `rgba(${RED},${(hi !== null ? oa * .35 : oa) * BA})`;
  cx.beginPath();
  for (const g of vis) if (hi === null || F[g].f !== hi) { const sx = wxS(g), sy = wyS(g); cx.rect(snap(sx) + lw / 2, snap(sy) + lw / 2, snap(bw) - lw, snap(bh) - lw); }
  cx.stroke();
  if (hi !== null) {
    cx.lineWidth = Math.max(lw, bw > 40 ? 1.5 : 1); cx.strokeStyle = `rgba(${RED},${BA})`; cx.beginPath();
    for (const g of vis) if (F[g].f === hi) { const sx = wxS(g), sy = wyS(g); cx.rect(snap(sx) + .5, snap(sy) + .5, snap(bw) - 1, snap(bh) - 1); }
    cx.stroke();
  }
  if (hov >= 0 && cur < 0) {
    cx.lineWidth = 1.5; cx.strokeStyle = `rgba(255,255,255,${bx === 'dim' ? .45 : 1})`; cx.strokeRect(wxS(hov), wyS(hov), bw, bh);
  }
  if (cur >= 0) { cx.lineWidth = 2; cx.strokeStyle = `rgba(${RED},${BA})`; cx.strokeRect(wxS(cur) - 1, wyS(cur) - 1, bw + 2, bh + 2); }
  }
  // numerals: red tag in the top-left corner, like the boxed sheet
  if (showNum && bx !== 'hide') {
    cx.font = `500 ${fs}px ${MONO}`; cx.textBaseline = 'middle';
    const th = Math.round(fs + 5), tw = cx.measureText('0000').width + 7;
    for (const g of vis) {
      const dim = hi !== null && F[g].f !== hi;
      const sx = snap(wxS(g)), sy = snap(wyS(g));
      if (bx === 'dim') {   // no red fill: faint red numeral on a dark chip
        cx.fillStyle = 'rgba(10,11,13,.35)'; cx.fillRect(sx, sy, tw, th);
        cx.fillStyle = `rgba(${RED},${dim ? .14 : .3})`;
      } else {
        cx.fillStyle = dim ? 'rgba(120,36,30,.8)' : `rgb(${RED})`;
        cx.fillRect(sx, sy, tw, th);
        cx.fillStyle = dim ? 'rgba(255,255,255,.45)' : '#fff';
      }
      cx.fillText(pad4(F[g].n), sx + 3.5, sy + th / 2 + .5);
    }
  }
  // film headers (by-film order)
  if (mode === 'film') {
    const hs = HEAD * s;
    for (const h of L.heads) {
      const sy = (h.y - oy) * s; if (sy > vh || sy + hs < -2) continue;
      const f = films[h.k], on = hi === h.k;
      const sx = (PAD - ox) * s, ex = (L.W - PAD - ox) * s;
      const redOn = on && bx === 'boxes';
      cx.strokeStyle = redOn ? `rgba(${RED},.9)` : on ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.12)'; cx.lineWidth = 1;
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
        cx.fillStyle = redOn ? `rgb(${RED})` : on ? '#fff' : 'rgba(150,157,162,.9)';
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
  if (dirty) { dirty = false; if (!(cur >= 0 && bgA >= .995)) draw(); }
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

/* ---------- the room: lifted frame under the site's camera ----------
   One object, one opaque room. The camera reuses site-3d's critically damped
   spring (sstep) and its weights, FOV 60, fable-m4's 960 ms ease-out push,
   and the moon opener's exponential lag. Nothing here advances on its own
   except a very slow idle drift (off under Reduce Motion). */
const lt = $('lt'), fig = $('ltfig'), box = $('ltbox'), lo = $('ltlo'), hiImg = $('lthi'), ltbg = $('ltbg');
const chrome = [...lt.querySelectorAll('.lt-ch')];
const outside = ['.top', '.films', '.corner', '#vp'].map(q => document.querySelector(q));
let pushed = false, closing = null;

const TAN30 = Math.tan(Math.PI / 6);                       // FOV 60 (site-3d PerspectiveCamera)
const WTS = () => RM.matches ? { REL: 14, FLY: 9, GLIDE: 8, SOFT: 6 } : { REL: 9.5, FLY: 5.6, GLIDE: 4.6, SOFT: 3.2 };
function S(x, w) { return { x, t: x, v: 0, w }; }
function sstep(q, dt) { const w = q.w, e = q.x - q.t, k = Math.exp(-w * dt), c = q.v + w * e; q.x = q.t + (e + c * dt) * k; q.v = (q.v - w * c * dt) * k; }
const YAW = .62, PIT = .36, ZMIN = .75, ZMAX = 2.2;           // angle clamp keeps the frame in view (see fitScale)
const RAWK = 2.2, KRAD = .0045;                                            // radians per dragged px
const IDLE_MS = 3500, DRIFT_Y = .2, DRIFT_P = .045, DRIFT_WY = .06, DRIFT_WP = .043;  // site-3d idle yaw .012 rad/s peak
const cam = { yaw: S(0, 9.5), pit: S(0, 9.5), zoom: S(1, 4.6) };
let uy = 0, upv = 0, drift = 0, lastIn = 0, interacting = false, ent = null, bgA = 0, chA = 0, rect = null, roomT = 0, wheelT = 0;
const clampN = (v, a, b) => Math.min(b, Math.max(a, v));
const easeOut3 = u => 1 - Math.pow(1 - u, 3), easeIO3 = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
// fable-m4 depth.js push, peak scaled down from its 1.1 knee so the frame arrives with a breath, not a jolt
function bump(e) { const f = e < .38 ? 1 + .1 * (1 - Math.pow(1 - e / .38, 2)) : 1.1 - .1 * easeOut3((e - .38) / .62); return 1 + (f - 1) * .5; }

function fitScale(w, h, P, aw, ah) {   // scale so the worst clamped orbit corner still sits inside the room
  let worst = 1;
  for (const sy of [-1, 1]) for (const sp of [-1, 1]) {
    const yw = sy * YAW, pt = sp * PIT, cy = Math.cos(yw), sny = Math.sin(yw), cp = Math.cos(pt), snp = Math.sin(pt);
    for (const px of [-.5, .5]) for (const py of [-.5, .5]) {
      const X = px * w, Y = py * h, X1 = X * cy, Z1 = -X * sny, Y2 = Y * cp - Z1 * snp, Z2 = Y * snp + Z1 * cp, k = P / (P - Z2);
      worst = Math.max(worst, Math.abs(X1 * k) / (aw / 2), Math.abs(Y2 * k) / (ah / 2));
    }
  }
  return 1 / worst;
}
function liftTarget(g) {
  const x = F[g], ar = x.w / x.h, narrow = vw < 560;
  const mx = narrow ? 22 : 96, my = narrow ? 104 : 88;
  const aw = vw - mx * 2, ah = vh - my * 2, P = (vh / 2) / TAN30;
  let w = Math.min(aw, 1280), h = w / ar; if (h > ah) { h = ah; w = h * ar; }
  const f = fitScale(w, h, P, aw, ah); w *= f; h *= f;
  return { w, h, x: (vw - w) / 2, y: (vh - h) / 2, P };
}
function placeLift(animate) {
  rect = liftTarget(cur);
  fig.style.width = rect.w + 'px'; fig.style.height = rect.h + 'px';
  fig.style.transform = `translate(${rect.x}px,${rect.y}px)`;
  if (animate && !RM.matches) {
    const bw = CW * s, bh = CH * s;
    ent = { t0: performance.now(), dur: 960, r: Math.min(bw / rect.w, bh / rect.h), dx: wxS(cur) + bw / 2 - vw / 2, dy: wyS(cur) + bh / 2 - vh / 2, out: false };
  }
  roomPaint(0);
}
function fillLift() {
  const x = F[cur], f = films[x.f], n = pad4(x.n);
  const lsrc = 'media/s/' + f.slug + '/' + x.id + '.webp', hsrc = 'media/l/' + f.slug + '/' + x.id + '.webp';
  lo.src = lsrc; hiImg.classList.remove('on'); hiImg.onload = () => hiImg.classList.add('on'); hiImg.src = hsrc;
  $('ltnum').textContent = n + ' / ' + pad4(F.length);
  $('lttitle').textContent = f.title;
  $('lttitle').setAttribute('aria-pressed', hi === x.f ? 'true' : 'false');
  $('lttc').textContent = 'frame ' + x.i + ' of ' + f.frames.length + ' · ' + x.tc;
  fig.setAttribute('aria-label', 'Frame ' + n + ', ' + f.title + ', ' + x.tc);
  [cur - 1, cur + 1].forEach(k => { if (k >= 0 && k < F.length) { const y = F[k]; new Image().src = 'media/l/' + films[y.f].slug + '/' + y.id + '.webp'; } });
}
function poseHome(w) { uy = upv = 0; drift = 0; cam.yaw.t = cam.pit.t = 0; cam.zoom.t = 1; cam.yaw.w = cam.pit.w = cam.zoom.w = w; lastIn = performance.now(); }
function setInert(on) { outside.forEach(el => { if (el) { if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert'); } }); }
function openLift(g, animate, fromHash) {
  const was = cur >= 0; cur = g; closing = null;
  const sx = wxS(g), sy = wyS(g);
  if (sx < 0 || sy < TOP || sx + CW * s > vw || sy + CH * s > vh) focusOn(g, false);
  lt.hidden = false; setInert(true);
  if (!was) { bgA = 0; chA = 0; ent = null; cam.yaw.x = cam.pit.x = 0; cam.yaw.v = cam.pit.v = 0; cam.zoom.x = 1; cam.zoom.v = 0; }
  poseHome(WTS().GLIDE);
  fillLift(); placeLift(animate && !was);
  const h = hashFor(F[g].n);
  if (!fromHash) {
    if (!was && !pushed) { history.pushState({ lift: 1 }, '', h); pushed = true; }
    else history.replaceState(history.state, '', h);
  }
  dirty = true; wake(); lt.focus({ preventScroll: true });
}
function step(d) {
  if (cur < 0) return; const g = cur + d; if (g < 0 || g >= F.length) return;
  openLift(g, false);
}
function closeLift(fromPop) {
  if (cur < 0) return;
  const g = cur; cur = -1; dirty = true;
  const sx = wxS(g), sy = wyS(g);
  if (sx < 0 || sy < TOP || sx + CW * s > vw || sy + CH * s > vh) focusOn(g, false);
  if (!fromPop) { if (pushed) { pushed = false; history.back(); } else history.replaceState(null, '', location.pathname + hashFor(0)); }
  else pushed = false;
  setInert(false);
  const bw = CW * s, bh = CH * s;
  if (RM.matches || !rect) { lt.hidden = true; ent = null; return; }
  closing = { t0: performance.now(), dur: 520 };      // contract: same push in reverse, r10 cubic ease-in-out
  ent = { r: Math.min(bw / rect.w, bh / rect.h), dx: wxS(g) + bw / 2 - vw / 2, dy: wyS(g) + bh / 2 - vh / 2, out: true };
  wake();
}

/* camera tick: springs, idle drift, enter / contract, room + chrome easing */
function roomPaint(e) {
  if (!rect) return;
  const P = rect.P, z = clampN(cam.zoom.x, ZMIN * .9, ZMAX * 1.05), dz = P * (1 - 1 / z);
  let pre = '';
  if (ent) {
    const k = e;
    const sc = (ent.r + (1 - ent.r) * k) * (ent.out ? 1 : bump(k));
    pre = `translate3d(${ent.dx * (1 - k)}px,${ent.dy * (1 - k)}px,0) scale(${sc}) `;
  }
  box.style.transform = `${pre}perspective(${P}px) translateZ(${dz}px) rotateX(${cam.pit.x}rad) rotateY(${cam.yaw.x}rad)`;
}
function lag(cur0, target, rate, dt) { return cur0 + (target - cur0) * (1 - Math.exp(-dt * rate)); }   // moon opener: k = 1-exp(-dt*rate)
let last = 0, raf = 0;
function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(roomTick); } }
function roomTick(t) {
  raf = 0;
  const live = cur >= 0, dt = Math.min(.05, Math.max(.001, (t - last) / 1000)); last = t;
  const rm = RM.matches;
  if (live) {
    const idle = !interacting && t - lastIn > IDLE_MS;
    let dy = 0, dp = 0;
    if (idle && !rm) { drift += dt; dy = DRIFT_Y * Math.sin(DRIFT_WY * drift); dp = DRIFT_P * Math.sin(DRIFT_WP * drift); }
    cam.yaw.t = YAW * Math.tanh((uy + dy) / YAW); cam.pit.t = PIT * Math.tanh((upv + dp) / PIT);   // soft walls: slows into the clamp
    if (idle && !rm) { cam.yaw.w = cam.pit.w = WTS().SOFT; }
    sstep(cam.yaw, dt); sstep(cam.pit, dt); sstep(cam.zoom, dt);
    cam.yaw.x = clampN(cam.yaw.x, -YAW, YAW); cam.pit.x = clampN(cam.pit.x, -PIT, PIT);
    bgA = lag(bgA, 1, rm ? 22 : 14, dt);
    chA = lag(chA, interacting ? .22 : 1, rm ? 22 : 3.4, dt);
    if (ent && !ent.out) { const u = Math.min(1, (t - ent.t0) / ent.dur); ent.e = easeOut3(u); if (u >= 1) ent = null; }
    roomPaint(ent ? ent.e : 1);
  } else if (closing) {
    const u = Math.min(1, (t - closing.t0) / closing.dur), e = 1 - easeIO3(u);
    bgA = lag(bgA, 0, 14, dt); chA = lag(chA, 0, 14, dt);
    roomPaint(e);
    if (u >= 1) { closing = null; ent = null; lt.hidden = true; bgA = chA = 0; }
  }
  ltbg.style.opacity = bgA >= .995 ? 1 : bgA.toFixed(3);
  const co = chA >= .995 ? 1 : chA.toFixed(3); chrome.forEach(el => el.style.opacity = co);
  if (live || closing) raf = requestAnimationFrame(roomTick);
}
function bumpIn() { lastIn = performance.now(); drift = 0; }
function absorbDrift() {   // fold the current drift offset into the user's pose so hand-over is continuous
  if (drift > 0 && !RM.matches) { uy = clampN(uy + DRIFT_Y * Math.sin(DRIFT_WY * drift), -RAWK * YAW, RAWK * YAW); upv = clampN(upv + DRIFT_P * Math.sin(DRIFT_WP * drift), -RAWK * PIT, RAWK * PIT); }
  drift = 0;
}

/* gestures: one finger / drag orbits, pinch / wheel dollies */
const LP = new Map(); let lpinch = null, ltap = null, lvel = [0, 0], lmoveT = 0;
lt.style.touchAction = 'none';
lt.addEventListener('pointerdown', e => {
  if (e.target.closest('button')) return;
  absorbDrift(); bumpIn(); interacting = true; document.body.classList.add('lt-touched');
  lt.setPointerCapture(e.pointerId); LP.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const W = WTS(); cam.yaw.w = cam.pit.w = W.REL; cam.zoom.w = W.REL;
  if (LP.size === 1) { ltap = { x: e.clientX, y: e.clientY, moved: false, bg: e.target === ltbg }; lvel = [0, 0]; }
  if (LP.size === 2) { const [a, b] = [...LP.values()]; lpinch = Math.hypot(a.x - b.x, a.y - b.y); ltap = null; }
  wake();
});
lt.addEventListener('pointermove', e => {
  const p = LP.get(e.pointerId); if (!p) return;
  const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; bumpIn();
  if (LP.size === 1) {
    if (ltap && !ltap.moved && Math.hypot(e.clientX - ltap.x, e.clientY - ltap.y) > 6) { ltap.moved = true; lt.classList.add('drag'); }
    if (ltap && ltap.moved) {
      const t = performance.now(), dts = Math.max(.008, (t - lmoveT) / 1000); lmoveT = t;
      uy = clampN(uy + dx * KRAD, -RAWK * YAW, RAWK * YAW); upv = clampN(upv - dy * KRAD, -RAWK * PIT, RAWK * PIT);
      lvel = [lvel[0] * .6 + (dx * KRAD / dts) * .4, lvel[1] * .6 + (-dy * KRAD / dts) * .4];
    }
  } else if (LP.size === 2 && lpinch) {
    const [a, b] = [...LP.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
    cam.zoom.t = clampN(cam.zoom.t * (d / lpinch), ZMIN, ZMAX); lpinch = d;
  }
  wake();
});
function settleZoom() {   // soft detent back to the fit, site-3d's W_SOFT, only when you let go close to it
  if (Math.abs(Math.log(cam.zoom.t)) < .1) { cam.zoom.t = 1; }
  cam.zoom.w = WTS().SOFT;
}
function lup(e) {
  if (!LP.has(e.pointerId)) return;
  LP.delete(e.pointerId); lt.classList.remove('drag');
  if (LP.size === 1) { lpinch = null; ltap = null; lvel = [0, 0]; return; }
  if (LP.size) return;
  const W = WTS(); lpinch = null; interacting = false; bumpIn();
  if (ltap && !ltap.moved && ltap.bg && e.type === 'pointerup') closeLift();
  else if (ltap && ltap.moved && !RM.matches && performance.now() - lmoveT < 80) {
    uy = clampN(uy + lvel[0] * .3, -RAWK * YAW, RAWK * YAW); upv = clampN(upv + lvel[1] * .3, -RAWK * PIT, RAWK * PIT);   // slow inertia that settles
  }
  cam.yaw.w = cam.pit.w = W.SOFT; settleZoom(); ltap = null; wake();
}
lt.addEventListener('pointerup', lup); lt.addEventListener('pointercancel', lup);
lt.addEventListener('wheel', e => {
  e.preventDefault(); absorbDrift(); bumpIn();
  const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vh : 1;
  cam.zoom.w = WTS().GLIDE; cam.zoom.t = clampN(cam.zoom.t * Math.exp(-(e.deltaY || 0) * k * (e.ctrlKey ? .01 : .0018)), ZMIN, ZMAX);
  clearTimeout(wheelT); wheelT = setTimeout(settleZoom, 350);   // r10 wheel: 350 ms quiet
  document.body.classList.add('lt-touched'); wake();
}, { passive: false });
lt.addEventListener('dblclick', e => { if (e.target.closest('button')) return; e.preventDefault(); poseHome(WTS().GLIDE); wake(); });

$('ltx').onclick = () => closeLift(); $('ltmark').onclick = () => closeLift();
$('ltprev').onclick = () => step(-1); $('ltnext').onclick = () => step(1);
$('lttitle').onclick = () => { setHi(hi === F[cur].f ? null : F[cur].f); $('lttitle').setAttribute('aria-pressed', hi === F[cur].f ? 'true' : 'false'); };
addEventListener('popstate', () => { if (cur >= 0) closeLift(true); else readHash(); });


/* ---------- modes, highlight, films list ---------- */
function setMode(m, keep) {
  if (m === mode) return;
  const ctr = cur >= 0 ? cur : centreFrame(); const fitted = s <= fitS() * 1.05;
  mode = m; layout();
  document.querySelectorAll('.modes:not(.boxsw) button').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === m ? 'true' : 'false'));
  if (fitted) fit(false); else { go(s, L.r[ctr * 2] + CW / 2 - vw / 2 / s, L.r[ctr * 2 + 1] + CH / 2 - vh / 2 / s, false); }
  if (!keep && cur < 0) history.replaceState(null, '', location.pathname + hashFor(0));
  dirty = true;
}
document.querySelectorAll('.modes:not(.boxsw) button').forEach(b => b.onclick = () => setMode(b.dataset.mode));
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
    // frame the film's own boxes (short films sit in the first columns, not across the whole width)
    let x0 = 1e9, x1 = -1e9;
    for (let g = a; g <= z; g++) { x0 = Math.min(x0, L.r[g * 2]); x1 = Math.max(x1, L.r[g * 2] + CW); }
    const y0 = L.r[a * 2 + 1] - (mode === 'film' ? HEAD : 0), y1 = L.r[z * 2 + 1] + CH;
    const ts = Math.min(maxS() * .5, Math.max(fitS(), Math.min((vw - 40) / (x1 - x0), (vh - TOP - 40) / (y1 - y0))));
    go(ts, (x0 + x1) / 2 - vw / 2 / ts, (y0 + y1) / 2 - (vh + TOP) / 2 / ts, true);
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
    if (e.key === '+' || e.key === '=') { cam.zoom.w = WTS().GLIDE; cam.zoom.t = clampN(cam.zoom.t * 1.25, ZMIN, ZMAX); bumpIn(); wake(); }
    if (e.key === '-' || e.key === '_') { cam.zoom.w = WTS().GLIDE; cam.zoom.t = clampN(cam.zoom.t / 1.25, ZMIN, ZMAX); bumpIn(); wake(); }
    if (e.key === '0') { poseHome(WTS().GLIDE); wake(); }
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
function hashFor(n) {
  const q = [];
  if (n) q.push('n=' + pad4(n));
  if (mode === 'all') q.push('order=continuous');
  if (bx !== 'boxes') q.push('boxes=' + bx);
  return q.length ? '#' + q.join('&') : '';
}
function setBoxes(v, fromHash) {
  if (!BOXV.includes(v)) return;
  bx = v; document.body.dataset.boxes = v; dirty = true;
  try { localStorage.setItem(BOXK, v); } catch (e) {}
  document.querySelectorAll('.boxsw button').forEach(b => b.setAttribute('aria-pressed', b.dataset.boxes === v ? 'true' : 'false'));
  if (!fromHash) history.replaceState(history.state, '', location.pathname + hashFor(cur >= 0 ? F[cur].n : 0));
}
document.querySelectorAll('.boxsw button').forEach(b => b.onclick = () => setBoxes(b.dataset.boxes));
setBoxes(bx, true);
function readHash() {
  const q = new URLSearchParams(location.hash.slice(1));
  const bq = q.get('boxes'); if (bq) setBoxes(bq, true);
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
