/* Objects · stills gallery takes on variant B (preview only, dev switch G1 / G2 / G3).
   G1 lit case      B's case on a shelf. Gill's own joio cups, seen from above and cut out of his photographs, stand on the shelf as
                    markers and make the way down to the rings and the board. A light picker: warm key, soft top, gallery spot, window.
   G2 light table   the stills laid out like a contact sheet on a lightbox, cups from above lying on the table. Four light presets.
   G3 shop wall     the stills hung on a wall under three adjustable spots; under every piece an empty shop slot (no invented prices or titles).

   Light is only ever the room and the case: the wall, the table, the frame, the shelf and the cast shadows. It is drawn behind the photographs;
   nothing is laid over a photograph, no filter, no blend mode, no tint. The cups are cutouts (alpha only, _build/cutout_joio.py); their pixels are the photographs' own.
   Everything here is dark-room material: if the colour mode (Red) is ever loaded into this room its twin rules cover the chrome; photographs stay true colour.
   Motion is the same with Reduce Motion on: nothing here reads prefers-reduced-motion.

   Host contract (js/front.js): OBJ_GAL.plan(V, host) -> boxes for G2 / G3; OBJ_GAL.chrome(V, host) after every layout; OBJ_GAL.off() when another variant is chosen. */
(function () {
  'use strict';
  var CUT = { top: [640, 617], ash: [501, 501], clay: [354, 347], ash2: [504, 500], stone: [640, 539], cream: [430, 441] };
  var CUP_LABEL = { top: 'joio.co cup from above', ash: 'ashy bowl from above', clay: 'unfired clay cup from above', ash2: 'ashy bowl, second shot', stone: 'wide grey bowl from above', cream: 'cream-glazed cup from above' };
  var MK = ['top', 'cream', 'ash', 'clay', 'stone', 'ash2', 'cream', 'top'];
  var gal = null, fg = null, ui = {}, curV = null, savedPl = null, fdownHTML = null, hostRef = null, scrollBound = false;

  function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }
  function qs(k) { var m = location.search.match(new RegExp('[?&]' + k + '=([^&#]*)')); return m ? decodeURIComponent(m[1]) : null }
  function rd(k) { try { return localStorage.getItem(k) } catch (e) { return null } }
  function wr(k, v) { try { localStorage.setItem(k, v) } catch (e) { } }
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n }

  /* a real cup: the cutout photograph in a wrapper that carries the shadow and the slow sway (the image itself is untouched) */
  function cup(k, w, rot, seed, tag, cls) {
    var d = CUT[k], h = w * d[1] / d[0];
    var n = el(tag || 'span', 'cup' + (cls ? ' ' + cls : ''));
    n.style.width = w.toFixed(1) + 'px'; n.style.height = h.toFixed(1) + 'px';
    n.style.setProperty('--r', rot.toFixed(1)); n.style.setProperty('--d', (15 + hash(seed) * 11).toFixed(1) + 's'); n.style.setProperty('--ph', (-hash(seed + 9) * 20).toFixed(1) + 's');
    n.innerHTML = '<img alt="" decoding="async" draggable="false" src="media/cut/' + k + '.webp">';
    n.dataset.k = k; return n;
  }
  function place(n, cx, cy) { n.style.left = (cx - parseFloat(n.style.width) / 2).toFixed(1) + 'px'; n.style.top = (cy - parseFloat(n.style.height) / 2).toFixed(1) + 'px'; return n }

  /* ---------------- lighting state, kept on this device; ?l=key,spot (G1) · ?l=warm (G2) · ?l=s1,s3 (G3) · ?lv=60 sets a level / spread ---------------- */
  var DEF = { G1: { key: 1, top: 0, spot: 1, win: 0, lv: 100 }, G2: { p: 'day' }, G3: { s1: 1, s2: 1, s3: 1, spr: 50 } };
  var ST = {};
  function loadState(V) {
    var s = JSON.parse(JSON.stringify(DEF[V])), raw = rd('gj.objgal.' + V);
    if (raw) { try { var o = JSON.parse(raw); for (var k in s) if (o[k] != null) s[k] = o[k] } catch (e) { } }
    var l = qs('l'), lv = qs('lv');
    if (l != null) {
      var toks = l.split(',').filter(Boolean);
      if (V === 'G1') ['key', 'top', 'spot', 'win'].forEach(function (k) { s[k] = toks.indexOf(k) >= 0 ? 1 : 0 });
      if (V === 'G2') { var p = toks[0]; if (['day', 'warm', 'dim', 'off'].indexOf(p) >= 0) s.p = p }
      if (V === 'G3') ['s1', 's2', 's3'].forEach(function (k) { s[k] = toks.indexOf(k) >= 0 ? 1 : 0 });
    }
    if (lv != null && isFinite(+lv)) { if (V === 'G1') s.lv = +lv; if (V === 'G3') s.spr = +lv }
    return s;
  }
  function save(V) { wr('gj.objgal.' + V, JSON.stringify(ST[V])) }

  function applyLight(V, host) {
    var f = host.front, s = ST[V];
    if (V === 'G1') {
      var m = s.lv / 100;
      f.style.setProperty('--k', s.key ? m : 0); f.style.setProperty('--t', s.top ? m : 0);
      f.style.setProperty('--s', s.spot ? m : 0); f.style.setProperty('--w', s.win ? m : 0);
      f.style.setProperty('--lit', Math.max(s.key ? m : 0, s.top ? m : 0, s.spot ? m : 0, s.win ? m : 0));
    } else if (V === 'G2') {
      f.setAttribute('data-p', s.p);
    } else if (V === 'G3') {
      ['s1', 's2', 's3'].forEach(function (k) { f.style.setProperty('--' + k, s[k] ? 1 : 0) });
      f.style.setProperty('--spr', (s.spr / 100).toFixed(2));
    }
  }

  /* the light picker is the room's own AMBX plate (glass pill, LED switches, thin sliders), one per take, bottom left */
  function makePicker(V, host) {
    if (ui[V] || !window.AMBX) return;
    var s = ST[V], C;
    function sw(k, label, aria) { return { type: 'sw', k: k, label: label, aria: aria, get: function () { return !!s[k] }, toggle: function () { s[k] = s[k] ? 0 : 1; save(V); applyLight(V, host) } } }
    function pre(k, label) { return { type: 'sw', k: k, label: label, aria: 'light the table: ' + label, get: function () { return s.p === k }, toggle: function () { s.p = k; save(V); applyLight(V, host) } } }
    var defs = {
      G1: { title: 'light', aria: 'gallery light: warm key, soft top light, gallery spot, window', sliders: [
        sw('key', 'warm key', 'warm key light from the upper left'), sw('top', 'soft top', 'soft light from above'), sw('spot', 'spot', 'dim gallery spot on the case'), sw('win', 'window', 'off-camera window light'),
        { k: 'lv', label: 'level', min: 0, max: 100, def: 100, aria: 'how strong the room light is', read: function () { return s.lv }, write: function (v) { s.lv = v; save(V) }, apply: function (v) { s.lv = v; applyLight(V, host) } }] },
      G2: { title: 'table', aria: 'light table: day, warm, dim or off', sliders: [pre('day', 'day'), pre('warm', 'warm'), pre('dim', 'dim'), pre('off', 'off')] },
      G3: { title: 'spots', aria: 'wall spots: three spots and how wide they open', sliders: [
        sw('s1', 'left', 'left spot'), sw('s2', 'middle', 'middle spot'), sw('s3', 'right', 'right spot'),
        { k: 'spr', label: 'spread', min: 0, max: 100, def: 50, aria: 'how wide the spots open', read: function () { return s.spr }, write: function (v) { s.spr = v; save(V) }, apply: function (v) { s.spr = v; applyLight(V, host) } }] }
    }[V];
    C = AMBX.create({ room: 'objects-gal-' + V.toLowerCase(), title: defs.title, cls: 'sk-glass obj-light', aria: defs.aria, sliders: defs.sliders, where: function () { return V === 'G1' ? 'light on the room and the case' : V === 'G2' ? 'light on the table' : 'light on the wall' },
      onReset: function () { var d = DEF[V]; for (var k in d) s[k] = d[k]; save(V); applyLight(V, host); C.refresh() } });
    ui[V] = C; C.el.classList.add('g-ui'); C.el.hidden = true;
  }
  function syncUI(V, host) {
    Object.keys(ui).forEach(function (k) { ui[k].el.hidden = k !== V || host.board.scrollTop > 40; if (k !== V && ui[k].isOpen()) ui[k].open(false) });
    if (ui[V]) ui[V].refresh();
  }

  /* ---------------- plans: where every still goes in G2 and G3 ---------------- */
  var TOP = 92, BOT = 58;
  function plan(V, host) {
    var W = host.W, H = host.H, land = host.land, n = host.els.length, out = [], i;
    if (V === 'G1') return null;
    if (V === 'G2') {
      var cols = land ? 5 : 3, rows = land ? 2 : 3, px = land ? Math.max(48, W * .05) : 12, pad = land ? 26 : 14, hd = 24, lab = 18, gap = land ? 16 : 10;
      var pw = W - 2 * px, ph = H - TOP - BOT, aw = pw - 2 * pad, ah = ph - 2 * pad - hd;
      var ih = (ah - rows * lab - (rows - 1) * gap) / rows, iw = Math.min((aw - (cols - 1) * gap) / cols, ih * .8); ih = iw / .8;
      var gx = Math.min((aw - cols * iw) / Math.max(1, cols - 1), iw * .55), gy = Math.min((ah - rows * (ih + lab)) / Math.max(1, rows - 1), 26);
      var tw = cols * iw + (cols - 1) * gx, th = rows * (ih + lab) + (rows - 1) * gy;
      var x0 = px + pw / 2 - tw / 2, y0 = TOP + pad + hd + Math.max(0, (ah - th) / 2);
      host._g2 = { panel: { x: px, y: TOP, w: pw, h: ph }, cols: cols, rows: rows, iw: iw, ih: ih, gx: gx, gy: gy, lab: lab, x0: x0, y0: y0, pad: pad };
      for (i = 0; i < n; i++) {
        var c = i % cols, r = Math.floor(i / cols);
        out.push({ x: x0 + c * (iw + gx) + iw / 2, y: y0 + r * (ih + lab + gy) + ih / 2, w: iw, h: ih, z: 10, lab: 1, show: true, rot: (hash(i + 3) - .5) * 2.2 });
      }
      return out;
    }
    /* G3: salon hang. Fractions of the wall (x of W, row of the free height), sizes as a share of a base width. */
    var tp = land ? TOP : 108, wy = tp, wh = H - tp - BOT, slot = 20, P3;
    if (land) {
      var base = Math.min(W * .15, (wh / 2 - slot - 22) * .8 * 1.0);
      P3 = [[.145, 0, 1.0], [.335, 0, 1.12], [.54, 0, .92], [.74, 0, 1.06], [.22, 1, 1.1], [.43, 1, .94], [.63, 1, 1.12], [.83, 1, .96]];
      for (i = 0; i < n; i++) { var q = P3[i], w = base * q[2], h = w / .8, rowH = wh / 2, cy = wy + q[1] * rowH + (rowH - slot - 12) / 2 + (hash(i + 20) - .5) * 14;
        out.push({ x: q[0] * W, y: cy, w: w, h: h, z: 10, lab: 0, show: true, rot: 0 }) }
    } else {
      var b2 = Math.min(W * .28, (wh / 3 - slot - 18) * .8);
      P3 = [[.20, 0, 1.0], [.52, 0, 1.12], [.82, 0, .9], [.34, 1, 1.06], [.70, 1, 1.0], [.17, 2, .94], [.47, 2, 1.1], [.80, 2, .98]];
      for (i = 0; i < n; i++) { var q2 = P3[i], w2 = b2 * q2[2], h2 = w2 / .8, rh = wh / 3, cy2 = wy + q2[1] * rh + (rh - slot - 10) / 2 + 4 + (hash(i + 20) - .5) * 12;
        out.push({ x: q2[0] * W, y: cy2, w: w2, h: h2, z: 10, lab: 0, show: true, rot: 0 }) }
    }
    host._g3 = { top: wy, bottom: wy + wh };
    return out;
  }

  /* ---------------- chrome: the room, the case, the cups, the slots ---------------- */
  function ensure(host) {
    if (gal) return;
    gal = el('div', 'gal'); gal.setAttribute('aria-hidden', 'true'); host.front.insertBefore(gal, host.fx);
    fg = el('div', 'gal-fg'); host.front.insertBefore(fg, host.fx.nextSibling);
    ['pointerdown', 'pointermove', 'pointerup'].forEach(function (t) { fg.addEventListener(t, function (e) { e.stopPropagation() }) });
  }
  function goDown(host) { var r = document.getElementById('rings'), t = r ? r.closest('section') : null; if (t) host.board.scrollTo({ top: t.offsetTop - 60, behavior: 'smooth' }) }
  function setLabels(host, mode) {
    host.els.forEach(function (e, i) {
      var pl = e.el.querySelector('.pl'); if (!pl) return;
      if (!pl.dataset.t) pl.dataset.t = pl.textContent;
      pl.textContent = mode === 'num' ? ('0' + (i + 1)).slice(-2) : pl.dataset.t;
    });
  }
  function joio(host, i) { return host.P[i].b.meta === 'joio.co' }

  function chrome(V, host) {
    ensure(host); hostRef = host;
    var entering = curV !== V;
    if (entering) { curV = V; if (!ST[V]) ST[V] = loadState(V); makePicker(V, host) }
    gal.innerHTML = ''; fg.innerHTML = '';
    var W = host.W, H = host.H, land = host.land, els = host.els;
    gal.className = 'gal ' + V.toLowerCase(); fg.className = 'gal-fg ' + V.toLowerCase();
    setLabels(host, V === 'G2' ? 'num' : 'title');
    gal.appendChild(el('div', 'g-wall'));
    if (V === 'G1') chromeG1(host, W, H, land, els);
    else if (V === 'G2') chromeG2(host, W, H, land, els);
    else chromeG3(host, W, H, land, els);
    if (entering) {
      ['--k', '--t', '--s', '--w', '--lit', '--s1', '--s2', '--s3'].forEach(function (p) { host.front.style.setProperty(p, 0) });
      host.front.classList.remove('g-enter'); void host.front.offsetWidth; host.front.classList.add('g-enter');
      setTimeout(function () { host.front.classList.remove('g-enter') }, 1300);
      requestAnimationFrame(function () { requestAnimationFrame(function () { if (curV === V) applyLight(V, host) }) });
    } else applyLight(V, host);
    syncUI(V, host);
    if (!scrollBound) { scrollBound = true; host.board.addEventListener('scroll', function () { if (curV && hostRef) syncUI(curV, hostRef) }, { passive: true }) }
    var fd = host.fdown; if (fdownHTML == null) fdownHTML = fd.innerHTML;
    if (V === 'G1') {
      fd.innerHTML = ''; fd.classList.add('g-door');
      var cl = el('span', 'g-cl'); [['cream', 62, -12, 0], ['ash', 78, 8, 1], ['clay', 48, 24, 2]].forEach(function (a, j) { var c = cup(a[0], a[1], a[2], 40 + j, 'span'); c.style.position = 'relative'; c.style.marginLeft = j ? '-14px' : '0'; cl.appendChild(c) });
      fd.appendChild(cl); fd.appendChild(el('span', 'g-dt', 'the rings and the board ↓'));
    } else { fd.classList.remove('g-door'); fd.innerHTML = fdownHTML }
  }

  function lights(V) {
    var h = '';
    if (V === 'G1') h = '<div class="l l-key"></div><div class="l l-top"></div><div class="l l-win"><i></i></div><div class="l l-spot"><i></i><b></b></div>';
    gal.insertAdjacentHTML('beforeend', h);
  }

  /* ---- G1 ---- */
  function chromeG1(host, W, H, land, els) {
    lights('G1');
    var c = els[host.cur], pad = land ? 16 : 12;
    var cs = el('div', 'g-case'); cs.style.left = (c.bx - c.w / 2 - pad) + 'px'; cs.style.top = (c.by - c.h / 2 - pad) + 'px'; cs.style.width = (c.w + 2 * pad) + 'px'; cs.style.height = (c.h + 2 * pad) + 'px';
    gal.appendChild(cs);
    var sy = c.by + c.h / 2 + pad + (land ? 58 : 52);
    var sh = el('div', 'g-shelf'); sh.style.top = sy + 'px'; sh.style.left = (W * (land ? .22 : .04)) + 'px'; sh.style.right = (W * (land ? .22 : .04)) + 'px'; gal.appendChild(sh);
    gal.appendChild(Object.assign(el('div', 'g-pool'), { style: 'left:' + (c.bx - c.w * .8) + 'px;top:' + (sy - 12) + 'px;width:' + (c.w * 1.6) + 'px' }));
    var n = els.length, span = W * (land ? .56 : .92) - 20, step = span / (n - 1), sx = W / 2 - span / 2;
    for (var i = 0; i < n; i++) {
      var on = i === host.cur, k = MK[i], base = (land ? 34 : 29) * (.8 + hash(i + 50) * .45) * (on ? 1.28 : 1);
      var b = el('button', 'g-mk' + (on ? ' on' : '')); b.type = 'button'; b.setAttribute('aria-label', host.P[i].b.title + (on ? ' (in the case)' : ': bring to the case')); b.setAttribute('aria-pressed', String(on));
      var cp = cup(k, base, (hash(i + 70) - .5) * 70, 60 + i, 'span'); cp.style.position = 'relative';
      b.appendChild(cp); b.style.left = (sx + i * step) + 'px'; b.style.top = (sy - base * (CUT[k][1] / CUT[k][0]) * .5 - 2 - (on ? 6 : 0)) + 'px';
      b.style.width = base + 'px'; b.style.height = base + 'px';
      (function (ii) { b.addEventListener('click', function (e) { e.stopPropagation(); if (ii !== host.cur) host.cur = ii }) })(i);
      fg.appendChild(b);
    }
  }

  /* ---- G2 ---- */
  function chromeG2(host, W, H, land, els) {
    var g = host._g2, p = g.panel;
    var t = el('div', 'g-table'); t.style.left = p.x + 'px'; t.style.top = p.y + 'px'; t.style.width = p.w + 'px'; t.style.height = p.h + 'px';
    t.innerHTML = '<div class="g-bloom"></div><div class="g-surf"></div><div class="g-hd"><b>objects</b><span>' + els.length + ' stills · contact sheet</span></div>';
    gal.appendChild(t);
    var slots = g.cols * g.rows, order = ['clay', 'stone', 'ash2'];
    for (var s = els.length; s < slots; s++) {
      var c = s % g.cols, r = Math.floor(s / g.cols), cx = g.x0 + c * (g.iw + g.gx) + g.iw / 2, cy = g.y0 + r * (g.ih + g.lab + g.gy) + g.ih / 2;
      var k = order[(s - els.length) % order.length], wd = g.iw * (k === 'clay' ? .8 : k === 'stone' ? 1.0 : .92);
      var b = el('button', 'g-cupbtn'); b.type = 'button'; b.setAttribute('aria-label', 'the rings and the board'); place(b, cx, cy); b.style.width = g.iw + 'px'; b.style.height = g.iw + 'px'; b.style.left = (cx - g.iw / 2) + 'px'; b.style.top = (cy - g.iw / 2) + 'px';
      var cp = cup(k, wd, (hash(s + 5) - .5) * 40, 80 + s, 'span'); cp.style.position = 'absolute'; cp.style.left = ((g.iw - wd) / 2) + 'px'; cp.style.top = ((g.iw - wd * CUT[k][1] / CUT[k][0]) / 2) + 'px';
      b.appendChild(cp); b.addEventListener('click', function (e) { e.stopPropagation(); goDown(host) }); fg.appendChild(b);
    }
  }

  /* ---- G3 ---- */
  function chromeG3(host, W, H, land, els) {
    var g = host._g3, rail = el('div', 'g-rail'); rail.style.top = (g.top - 8) + 'px'; gal.appendChild(rail);
    var skirt = el('div', 'g-skirt'); skirt.style.top = (g.bottom + 6) + 'px'; gal.appendChild(skirt);
    var sx = [W * .2, W * .5, W * .8];
    for (var s = 0; s < 3; s++) {
      var beam = el('div', 'g-beam b' + (s + 1)); beam.style.left = sx[s] + 'px'; beam.style.top = (g.top - 6) + 'px'; beam.style.height = (g.bottom - g.top + 40) + 'px'; beam.style.setProperty('--bw', (W * (land ? .24 : .34)) + 'px');
      beam.innerHTML = '<i></i>'; gal.appendChild(beam);
      var head = el('button', 'g-head h' + (s + 1)); head.type = 'button'; head.setAttribute('aria-label', 'spot ' + (s + 1)); head.style.left = sx[s] + 'px'; head.style.top = (g.top - 14) + 'px';
      head.innerHTML = '<i></i>'; (function (k) { head.addEventListener('click', function (e) { e.stopPropagation(); var st = ST.G3, key = 's' + k; st[key] = st[key] ? 0 : 1; save('G3'); applyLight('G3', host); if (ui.G3) ui.G3.refresh() }) })(s + 1);
      fg.appendChild(head);
    }
    els.forEach(function (e, i) {
      var spot = e.bx < W / 3 ? 1 : e.bx < W * 2 / 3 ? 2 : 3;
      e.el.setAttribute('data-spot', spot); e.el.style.setProperty('--ps', 'var(--s' + spot + ')');
      var fr = el('div', 'g-fr'); fr.style.left = (e.bx - e.w / 2 - 4) + 'px'; fr.style.top = (e.by - e.h / 2 - 4) + 'px'; fr.style.width = (e.w + 8) + 'px'; fr.style.height = (e.h + 8) + 'px'; fr.style.setProperty('--ps', 'var(--s' + spot + ')');
      gal.appendChild(fr);
      var sy = e.by + e.h / 2 + 11, lk = joio(host, i);
      var sl = el(lk ? 'a' : 'span', 'g-slot' + (lk ? ' on' : ''));
      if (lk) { sl.href = 'https://www.joioco.com'; sl.target = '_blank'; sl.rel = 'noopener'; sl.setAttribute('aria-label', 'joio.co ceramics shop (opens the shop)') } else sl.setAttribute('aria-hidden', 'true');
      sl.style.left = (e.bx - 21) + 'px'; sl.style.top = (sy + 3) + 'px';
      var k = MK[i], cw = 15 * (.85 + hash(i + 9) * .4), cp = cup(k, cw, (hash(i + 33) - .5) * 80, 120 + i, 'i'); cp.style.position = 'relative';
      sl.appendChild(cp); fg.appendChild(sl);
      var th = el('div', 'g-thread'); th.style.left = e.bx + 'px'; th.style.top = (e.by + e.h / 2 + 3) + 'px'; th.style.height = '8px'; gal.appendChild(th);
    });
  }

  function off() {
    if (!gal) return;
    gal.innerHTML = ''; fg.innerHTML = ''; gal.className = 'gal'; curV = null;
    Object.keys(ui).forEach(function (k) { ui[k].el.hidden = true; if (ui[k].isOpen()) ui[k].open(false) });
    if (hostRef) {
      setLabels(hostRef, 'title'); hostRef.fdown.classList.remove('g-door'); if (fdownHTML != null) hostRef.fdown.innerHTML = fdownHTML;
      ['--k', '--t', '--s', '--w', '--lit', '--s1', '--s2', '--s3', '--spr'].forEach(function (p) { hostRef.front.style.removeProperty(p) }); hostRef.front.removeAttribute('data-p');
      hostRef.els.forEach(function (e) { e.el.removeAttribute('data-spot'); e.el.style.removeProperty('--ps') });
    }
  }

  window.OBJ_GAL = { plan: plan, chrome: chrome, off: off, cuts: CUT, labels: CUP_LABEL };
})();
