/* B · R10 + Reflection. One night sky over dark water: the sky (R10's world.js) shows where you are, the water shows the work.
   This file is a navigation and presentation layer only. Content comes from R10's own #data lists and m4/data.json; the
   work pages are R10's own (window.__one). Motion is identical with Reduce Motion on (nothing here reads the media query). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s) }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)) };
  function el(t, c, kids, at) { var e = document.createElement(t); if (c) e.className = c; if (at) for (var k in at) { if (k === 'on') e.addEventListener('click', at[k]); else if (at[k] != null) e.setAttribute(k, at[k]) }
    (kids || []).forEach(function (x) { if (x == null) return; e.appendChild(typeof x === 'string' ? document.createTextNode(x) : x) }); return e }
  var ORDER = ['film', 'photo', 'objects', 'space', 'sound', 'about'];
  var HZ = window.__reflHZ, W = window.__world, O = function () { return window.__one };
  var DATA = null; fetch('m4/data.json').then(function (r) { return r.json() }).then(function (d) { DATA = d; if (cur.lv >= 1) build(cur.k, true) }).catch(function () {});

  /* ---------- R10's content, read from its own hidden lists ---------- */
  var CH = {};
  $$('#data section.ch').forEach(function (s) {
    var k = s.getAttribute('data-k');
    CH[k] = { k: k, nm: ($('.head .nm', s) || {}).textContent || k, items: $$('li.it', s).map(function (li, i) {
      var j = {}; try { j = JSON.parse(li.getAttribute('data-j') || '{}') } catch (e) {}
      var a = $('a.tile', li), img = $('img', li);
      return { k: k, w: li.getAttribute('data-k'), id: li.getAttribute('data-id'), th: img ? img.getAttribute('data-src') : '', big: li.getAttribute('data-big') || '',
        t: ($('.cap b', li) || {}).textContent || '', m: ($('.cap small', li) || {}).textContent || '', href: a ? a.getAttribute('href') : '', ww: j.w || 0, hh: j.h || 0, n: i + 1 };
    }) };
  });
  function count(k) { var e = $('.entries .sl[data-k="' + k + '"] small'); return e ? e.textContent : '' }
  function open(it) {
    if (!it) return;
    if (/^(mailto:|https?:)/.test(it.href || '')) { window.open(it.href, it.href.indexOf('mailto:') === 0 ? '_self' : '_blank', 'noopener'); return }
    if (O() && it.id) O().openId(it.id);
  }

  /* ---------- the layer: water, horizon, mirror, reflections, board, legend ---------- */
  var root = el('div', 'rf', [], { id: 'refl' });
  var water = el('div', 'rf-water'), mir = el('canvas', 'rf-mirror', [], { 'aria-hidden': 'true' }), line = el('div', 'rf-line', [], { 'aria-hidden': 'true' });
  var refl = el('div', 'rf-refl', [], { 'aria-label': 'what is in each chapter' }), board = el('div', 'rf-board', [], { role: 'region', 'aria-label': 'board' });
  var legend = el('p', 'rf-legend', ['tap a name to choose it, again to open · pinch or tap goes deeper · ‹ goes up · LIST shows every work']);
  root.append(water, mir, line, refl, board, legend); document.body.appendChild(root);

  /* bar: the mark, one crumb line (R10's), then LIST · REEL · HIRE */
  var bar = $('.wn'), acts = el('div', 'rf-acts');
  var listB = el('button', 'rf-a', ['list'], { type: 'button', 'aria-pressed': 'false', on: function () { listToggle() } });
  var reelB = el('button', 'rf-a', ['reel'], { type: 'button', on: function () { listToggle(false); open(CH.film.items[0]) } });
  var hireB = el('button', 'rf-a', ['hire'], { type: 'button', 'aria-expanded': 'false', on: function () { hire.hidden = !hire.hidden; hireB.setAttribute('aria-expanded', String(!hire.hidden)) } });
  acts.append(listB, reelB, hireB); bar.appendChild(acts);
  var hire = el('div', 'rf-hire', [el('p', 'h', ['Hire']), el('p', '', ['Film, objects, space and sound.']), el('p', '', [el('a', '', ['imjamesgill@gmail.com'], { href: 'mailto:imjamesgill@gmail.com' })]),
    el('button', 'rf-x', ['close'], { type: 'button', on: function () { hire.hidden = true; hireB.setAttribute('aria-expanded', 'false') } })], { role: 'dialog', 'aria-label': 'Hire' });
  hire.hidden = true; document.body.appendChild(hire);

  /* ---------- LIST: the same map as a plain index (Atlas) ---------- */
  var list = el('div', 'rf-list', [], { role: 'region', 'aria-label': 'every work, as a list' }); list.hidden = true; document.body.appendChild(list);
  function buildList() {
    if (list.firstChild) return;
    list.appendChild(el('p', 'rf-lh', ['every work · ', el('span', '', ['tap one to open it'])]));
    list.appendChild(el('button', 'rf-li se', ['Spirit Eye', el('small', '', ['public art concept · 32 pages'])], { type: 'button', on: function () { listToggle(false); spiritEye() } }));
    ORDER.forEach(function (k) {
      var c = CH[k]; if (!c) return;
      list.appendChild(el('h3', '', [c.nm, el('small', '', [count(k)])]));
      var ol = el('ol', k === 'photo' ? 'ph' : '');
      c.items.forEach(function (it) {
        var lab = it.t || ('№ ' + String(it.n).padStart(2, '0'));
        var b = el('button', 'rf-li', [k === 'photo' ? el('img', '', [], { src: it.th, alt: '', loading: 'lazy' }) : null, el('span', '', [lab]), it.m ? el('small', '', [it.m]) : null], { type: 'button', on: function () { listToggle(false); open(it) } });
        ol.appendChild(el('li', '', [b]));
      });
      list.appendChild(ol);
    });
  }
  function listToggle(on) { if (on == null) on = list.hidden; if (on) buildList(); list.hidden = !on; listB.setAttribute('aria-pressed', String(on)); listB.classList.toggle('on', on); document.documentElement.classList.toggle('rf-list-on', on) }
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !list.hidden) { e.stopImmediatePropagation(); listToggle(false) } }, true);
  function spiritEye() { var b = $('#ring button[data-k="brief"]'); if (b) b.click() }

  /* ---------- the reflections at FAR: each chapter in its own shape, faint (<= 30%), under its own stars ---------- */
  function pick(k, n) { var L = (CH[k] || { items: [] }).items.filter(function (i) { return i.th }); var o = []; for (var i = 0; i < L.length && o.length < n; i += Math.max(1, Math.floor(L.length / n))) o.push(L[i]); return o }
  function peaksOf(i) { return DATA && DATA.tracks && DATA.tracks[i] ? DATA.tracks[i].peaks : null }
  function wavePath(w, h, pk, step) { var p = [], n = pk.length; for (var i = 0; i < n; i += step) p.push([i / (n - 1) * w, h - pk[i] * h]); return p }
  var RF = {};
  function mkRefl(k) {
    var r = el('button', 'rf-r rf-' + k, [], { type: 'button', 'aria-label': (CH[k] ? CH[k].nm : k) + ', in the water', on: function () { W.goTo({ lv: 1, k: k }) } });
    if (k === 'film') pick('film', 3).forEach(function (it, i) { r.appendChild(el('i', 'st', [el('img', '', [], { src: it.th, alt: '' })], { style: 'margin-left:' + (i % 2 ? 14 : 0) + 'px' })) });
    else if (k === 'photo') [0, 1].forEach(function (s) { var st = el('i', 'stack'); pick('photo', 6).slice(s * 3, s * 3 + 3).forEach(function (it, j) { st.appendChild(el('img', '', [], { src: it.th, alt: '', style: 'transform:rotate(' + [-7, 4, -2][j] + 'deg)' })) }); r.appendChild(st) });
    else if (k === 'objects') ['specimen-joio-cup', 'specimen-scoop'].forEach(function (w) { var it = CH.objects.items.filter(function (x) { return x.w === w })[0]; if (it) r.appendChild(el('i', 'cut', [el('img', '', [], { src: it.th, alt: '' })])) });
    else if (k === 'space') { var it = pick('space', 1)[0]; if (it) r.appendChild(el('i', 'st', [el('img', '', [], { src: it.th, alt: '' })])) }
    else if (k === 'sound') { r.appendChild(el('canvas', 'wv', [], { width: 240, height: 60 })) }
    else if (k === 'about') { for (var i = 0; i < 4; i++) r.appendChild(el('i', 'tl', [], { style: 'width:' + [92, 80, 86, 60][i] + '%' })) }
    refl.appendChild(r); RF[k] = r; return r;
  }
  ORDER.forEach(mkRefl);
  /* Spirit Eye: the public-art landmark, a light on the far shore (not a sixth constellation) */
  var seL = el('button', 'rf-se', [el('i'), el('span', '', ['Spirit Eye'])], { type: 'button', 'aria-label': 'Spirit Eye, the landmark on the far shore', on: function () { spiritEye() } }); refl.appendChild(seL);
  function drawWave(cv, pk, dots) {
    var g = cv.getContext('2d'), w = cv.width, h = cv.height; g.clearRect(0, 0, w, h); if (!pk) return;
    var P = wavePath(w - 8, h - 14, pk, dots ? 2 : 1); g.fillStyle = 'rgba(255,190,180,.95)';
    P.forEach(function (p) { g.beginPath(); g.arc(p[0] + 4, p[1] + 7, dots ? 1.6 : 1.2, 0, 7); g.fill() });
  }

  /* ---------- the board at the surface, in each chapter's own shape ---------- */
  var built = '';
  function head(k) { return el('div', 'rb-h', [el('b', '', [CH[k].nm]), el('small', '', [count(k)])]) }
  function item(it, cls, kids) { return el('button', 'rb-it ' + (cls || ''), kids, { type: 'button', 'data-id': it.id, on: function (e) { e.stopPropagation(); if (board.classList.contains('pv')) { W.in(); return } open(it) } }) }
  function capt(it) { return el('span', 'cap', [el('b', '', [it.t]), it.m ? el('small', '', [it.m]) : null]) }
  function build(k, force) {
    if (!CH[k] || (built === k && !force)) return; built = k; board.innerHTML = ''; board.setAttribute('data-k', k); board.scrollTop = 0;
    var c = CH[k], wrap = el('div', 'rb rbk-' + k); wrap.appendChild(head(k));
    if (k === 'film') {
      var g = el('div', 'rb-film');
      c.items.forEach(function (it, i) { g.appendChild(item(it, i % 2 ? 'odd' : '', [el('span', 'f239', [el('img', '', [], { src: it.th, alt: '', loading: 'lazy' })]), capt(it)])) });
      wrap.appendChild(g);
    } else if (k === 'photo') {
      var L = c.items, N = 8, g2 = el('div', 'rb-stacks');
      for (var s = 0; s * N < L.length; s++) (function (s) {
        var part = L.slice(s * N, s * N + N), st = el('div', 'stk'), pile = el('button', 'pile', [], { type: 'button', 'aria-label': 'prints ' + (s * N + 1) + ' to ' + (s * N + part.length) + ', tap to fan out' });
        part.slice(0, 3).forEach(function (it, j) { pile.appendChild(el('img', '', [], { src: it.th, alt: '', loading: 'lazy', style: 'transform:rotate(' + [-6, 5, -1][j] + 'deg) translate(' + [-6, 7, 0][j] + 'px,' + [4, -3, 0][j] + 'px)' })) });
        var sheet = el('div', 'rfsheet'); sheet.hidden = true;
        part.forEach(function (it) { sheet.appendChild(item(it, 'pr', [el('img', '', [], { src: it.th, alt: '', loading: 'lazy' })])) });
        pile.addEventListener('click', function (e) { e.stopPropagation(); if (board.classList.contains('pv')) { W.in(); return } var on = sheet.hidden; $$('.rb-stacks .rfsheet', board).forEach(function (x) { x.hidden = true; x.parentNode.classList.remove('fan') }); sheet.hidden = !on; st.classList.toggle('fan', on); if (on) st.scrollIntoView({ block: 'nearest' }) });
        st.append(pile, el('span', 'lab', ['prints ' + (s * N + 1) + '–' + (s * N + part.length)]), sheet); g2.appendChild(st);
      })(s);
      /* shop door: prints, a quiet labelled state, nothing for sale */
      g2.appendChild(el('div', 'stk door', [el('span', 'pile ghost', [el('i', '', ['prints'])]), el('span', 'lab', ['prints · shop coming'])], { 'aria-label': 'prints shop, coming' }));
      wrap.appendChild(g2);
    } else if (k === 'sound') {
      var sc = el('div', 'rb-sound'), cv = el('canvas', 'wl', [], { width: 720, height: 220 }), names = el('div', 'peaks');
      sc.append(cv, names); wrap.appendChild(sc);
      var tr = DATA && DATA.tracks || [];
      requestAnimationFrame(function () { drawLine(cv, names, tr) });
      var rows = el('div', 'rb-rows'); c.items.forEach(function (it) { rows.appendChild(item(it, 'row', [el('img', '', [], { src: it.th, alt: '', loading: 'lazy' }), capt(it)])) }); wrap.appendChild(rows);
    } else if (k === 'objects') {
      var shore = el('div', 'rb-shore');
      c.items.forEach(function (it) {
        var cut = /^specimen-/.test(it.w) && /cut-/.test(it.th);
        shore.appendChild(item(it, cut ? 'cut' : 'disc', [el('span', 'pc', [el('img', '', [], { src: it.th, alt: '', loading: 'lazy' })]), el('span', 'pc mirror', [el('img', '', [], { src: it.th, alt: '' })], { 'aria-hidden': 'true' }), el('span', 'cap', [el('b', '', [it.t])])]));
      });
      wrap.appendChild(shore);
      wrap.appendChild(el('p', 'rb-gap', ['cut-out keys needed · the round crops stand in for the photographed pieces']));
      /* shop door: the joio.co link R10 already carries, and a labelled "shop · coming" state */
      wrap.appendChild(el('div', 'rb-door', [el('span', 'post', [el('b', '', ['joio.co']), el('small', '', ['ceramics · shop coming'])]), el('a', 'go', ['joio.co ↗'], { href: 'https://www.joioco.com', target: '_blank', rel: 'noopener' })]));
      wrap.appendChild(el('button', 'rb-land', [el('b', '', ['Spirit Eye']), el('small', '', ['the landmark on the far shore · 32 pages'])], { type: 'button', on: function (e) { e.stopPropagation(); if (board.classList.contains('pv')) { W.in(); return } spiritEye() } }));
    } else if (k === 'about') {
      var ab = el('div', 'rb-about', [el('p', 'sig', ['ᑕᐣᓯ'], { lang: 'cr' }), el('p', 'who', ['GILL JAMES · Vancouver'])]);
      ((DATA && DATA.bio) || []).forEach(function (p) { ab.appendChild(el('p', 'bio', [p])) });
      var ln = el('p', 'links'); c.items.forEach(function (it) { if (it.w === 'bio') return; ln.appendChild(item(it, 'lk', [it.t])) }); ab.appendChild(ln);
      wrap.appendChild(ab);
    } else {
      var gg = el('div', 'rb-grid'); c.items.forEach(function (it) { gg.appendChild(item(it, '', [el('span', 'f239', [el('img', '', [], { src: it.th, alt: '', loading: 'lazy' })]), capt(it)])) }); wrap.appendChild(gg);
    }
    board.appendChild(wrap);
  }
  function drawLine(cv, names, tr) {
    var r = cv.getBoundingClientRect(); if (!r.width) return; var dpr = Math.min(2, devicePixelRatio || 1); cv.width = r.width * dpr; cv.height = r.height * dpr;
    var g = cv.getContext('2d'); g.scale(dpr, dpr); var w = r.width, h = r.height, n = tr.length; names.innerHTML = '';
    tr.forEach(function (t, i) {
      var x0 = i / n * w, x1 = (i + 1) / n * w, pk = t.peaks, best = 0;
      var X = function (j) { return x0 + (x1 - x0 - 10) * j / (pk.length - 1) + 5 }, Y = function (j) { var a = 0, n2 = 0; for (var q = Math.max(0, j - 2); q <= Math.min(pk.length - 1, j + 2); q++) { a += pk[q]; n2++ } return h * .9 - (a / n2) * h * .48 };
      g.strokeStyle = 'rgba(255,182,176,.18)'; g.lineWidth = 1; g.beginPath(); for (var j = 0; j < pk.length; j += 3) { if (j) g.lineTo(X(j), Y(j)); else g.moveTo(X(j), Y(j)) } g.stroke();
      for (var j = 0; j < pk.length; j += 3) { g.fillStyle = 'rgba(255,205,195,' + (.4 + pk[j] * .5) + ')'; g.beginPath(); g.arc(X(j), Y(j), 1.3 + pk[j] * .9, 0, 7); g.fill(); if (pk[j] > pk[best]) best = j }
      var bx = X(best), by = Y(best);
      var b = el('button', 'pk', [el('i'), el('span', '', [t.title])], { type: 'button', style: 'left:' + (bx / w * 100).toFixed(2) + '%;top:' + (by - 8) + 'px', on: function (e) { e.stopPropagation(); if (board.classList.contains('pv')) { W.in(); return } open(CH.sound.items[0]) } });
      if (i % 2) b.classList.add('lo'); names.appendChild(b);
    });
  }

  /* ---------- the one camera: horizon, mirror and layers follow R10's depth ---------- */
  var cur = { lv: 0, k: null }, hz = HZ(0), target = HZ(0), last = 0, legendT = 0, cvSky = $('#world canvas.wc'), started = !window.__reflArrive;
  var mg = mir.getContext('2d');
  function frame(t) {
    var dt = Math.min(.1, (t - (last || t)) / 1000); last = t;
    var s = W.state(), br = O() && O().brief ? O().brief().on : false, lv = s.layer || s.lv >= 3 ? 3 : s.lv;
    if (lv !== cur.lv || s.k !== cur.k) { cur = { lv: lv, k: s.k }; if (lv >= 1 && s.k) build(s.k); document.documentElement.setAttribute('data-rf', lv); }
    target = HZ(lv); hz += (target - hz) * Math.min(1, dt / .11); if (Math.abs(target - hz) < .0005) hz = target;
    var H = innerHeight, Wd = innerWidth, y = Math.round(hz * H);
    root.style.setProperty('--hz', y + 'px');
    /* reflections show at FAR; the board is a faint preview at the chapter and the surface itself at the board */
    var far = lv === 0 && started && !br;
    refl.classList.toggle('on', far);
    board.classList.toggle('on', lv === 1 || lv === 2); board.classList.toggle('pv', lv === 1);
    if (far) placeRefl(y, H);
    mirror(y, H, Wd);
    root.classList.toggle('under', lv >= 3 || br);
    requestAnimationFrame(frame);
  }
  function placeRefl(y, H) {
    var sz = innerHeight < 520 ? 70 : Math.min(innerWidth < 700 ? 100 : 150, innerWidth * .24), boxes = [];
    ORDER.map(function (k) { var p = W.pos(k); return p && RF[k] ? { k: k, p: p, dy: Math.max(0, y - p[1]) } : null }).filter(Boolean)
      .sort(function (a, b) { return a.dy - b.dy }).forEach(function (o) {
        var r = RF[o.k], h = r.offsetHeight || 50, x = Math.round(Math.max(8, Math.min(innerWidth - sz - 8, o.p[0] - sz / 2))), ry = y + (innerHeight < 520 ? 8 : 26) + o.dy * (innerHeight < 520 ? .25 : .5);
        for (var g = 0; g < 8; g++) { var hit = boxes.filter(function (b) { return x < b.x + b.w + 6 && x + sz + 6 > b.x && ry < b.y + b.h + 6 && ry + h + 6 > b.y })[0]; if (!hit) break; ry = hit.y + hit.h + 8 }
        ry = Math.min(ry, H - h - 12); boxes.push({ x: x, y: ry, w: sz, h: h });
        r.style.transform = 'translate(' + x + 'px,' + Math.round(ry) + 'px)'; r.style.width = sz + 'px';
      });
    var se = W.pos('objects'); if (se) seL.style.transform = 'translate(' + Math.round(Math.min(innerWidth - 120, Math.max(innerWidth * .62, se[0] + 30))) + 'px,' + (y - 13) + 'px)';
  }
  var mT = 0;
  function mirror(y, H, Wd) {
    if (performance.now() - mT < 60) return; mT = performance.now();
    var dpr = Math.min(2, devicePixelRatio || 1), mh = Math.max(0, H - y);
    if (mir.width !== Math.round(Wd * dpr) || mir.height !== Math.round(mh * dpr)) { mir.width = Math.round(Wd * dpr); mir.height = Math.max(1, Math.round(mh * dpr)) }
    mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, mir.width, mir.height); if (y < 8 || !cvSky) return;
    var sh = Math.min(y, mh / .62) * (cvSky.width / Wd);
    mg.setTransform(1, 0, 0, -1, 0, Math.min(mh, y * .62) * dpr);
    try { mg.drawImage(cvSky, 0, (y * (cvSky.width / Wd)) - sh, cvSky.width, sh, 0, 0, mir.width, Math.min(mh, y * .62) * dpr) } catch (e) {}
  }
  /* sound reflection and legend */
  function waveRefl() { var c = $('.rf-sound canvas', refl); if (c && DATA) { var pk = [].concat.apply([], (DATA.tracks || []).slice(0, 3).map(function (t) { return t.peaks.slice(0, 40) })); drawWave(c, pk, true) } else setTimeout(waveRefl, 300) }
  waveRefl();
  function showLegend() { legend.classList.add('on'); clearTimeout(legendT); legendT = setTimeout(function () { legend.classList.remove('on') }, 7000) }

  /* ---------- gestures on the water: pinch-out goes up one level, pinch-in on the preview goes deeper ---------- */
  var pz = null;
  board.addEventListener('touchstart', function (e) { if (e.touches.length === 2) { var a = e.touches[0], b = e.touches[1]; pz = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), done: 0 } } }, { passive: true });
  board.addEventListener('touchmove', function (e) { if (!pz || e.touches.length !== 2 || pz.done) return; var a = e.touches[0], b = e.touches[1], d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    if (d / pz.d < .75) { pz.done = 1; W.out() } else if (d / pz.d > 1.3) { pz.done = 1; if (cur.lv === 1) W.in() } }, { passive: true });
  board.addEventListener('touchend', function () { pz = null });
  board.addEventListener('click', function (e) { if (board.classList.contains('pv') && e.target === board) W.in() });
  board.addEventListener('wheel', function (e) { if (e.ctrlKey) { e.preventDefault(); if (e.deltaY > 0) W.out() } }, { passive: false });

  /* ---------- the arrival, kept as it is: dotted mark, Gill's poem, snow, the moon path, then "touch the water" ---------- */
  var STROKES = [[[-58.5, -96], [-156.5, -95], [-203.5, -61], [-213.5, 1], [-203.5, 63], [-156.5, 97], [-58.5, 97]], [[-26.5, -97], [25.5, -94], [44.5, -51], [25.5, -8], [-26.5, -5]], [[99.5, 105], [99.5, 20], [149.5, 15], [191.5, -11], [211.5, -55], [214.5, -105]]];
  var POEM = ['I am Gill', 'I am James', 'I am an artist', 'a Cree voice rising', 'weaving sound into the unseen', 'Indigenous kin, my culture’s pulse', 'visual arts', 'Fine art and music', 'are rivers I swim, a daily drift', 'a lifelong hum', 'Artistry a starfield I chase', 'All my relations,', 'in all my creations', 'their breath in every chord I make and everything', 'I create.'];
  function arrival() {
    var A = el('div', 'ra', [], { id: 'rarr', role: 'dialog', 'aria-label': 'Gill James' });
    var wa = el('div', 'ra-water'), moon = el('div', 'ra-moon'), path = el('div', 'ra-path'), dust = el('div', 'ra-dust'), cv = el('canvas', 'ra-mark', [], { 'aria-hidden': 'true' });
    for (var i = 0; i < 46; i++) dust.appendChild(el('i', '', [], { style: 'left:' + (Math.random() * 100).toFixed(1) + '%;animation-delay:-' + (Math.random() * 14).toFixed(1) + 's;animation-duration:' + (9 + Math.random() * 8).toFixed(1) + 's;opacity:' + (.25 + Math.random() * .5).toFixed(2) }));
    var gj = el('span', 'gj'); 'gill james'.split('').forEach(function (ch, i) { gj.appendChild(el('i', '', [ch === ' ' ? '\u00a0' : ch], { style: 'animation-delay:' + (i * .16).toFixed(2) + 's' })) });
    var po = el('div', 'ra-poem', [gj].concat(POEM.map(function (l) { return el('span', 'ln', [l]) })).concat([el('span', 'sig', ['ᑕᐣᓯ'], { lang: 'cr' })]));
    var dive = el('button', 'ra-dive', ['touch the water'], { type: 'button' }), foot = el('p', 'ra-foot', ['© 2025 joioco · ', el('a', '', ['imjamesgill@gmail.com'], { href: 'mailto:imjamesgill@gmail.com' })]);
    A.append(wa, path, moon, dust, cv, po, dive, foot); document.body.appendChild(A);
    document.documentElement.classList.add('rf-arr');
    var t0 = performance.now(), go = false;
    function layout() { var M = __markAt(innerWidth, innerHeight); A.style.setProperty('--ptop', Math.round(M.y + 105 * M.s + innerHeight * .03) + 'px'); A.classList.toggle('land', innerWidth > innerHeight * 1.1); return M }
    function draw() {
      if (!A.isConnected) return; var M = layout(), dpr = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; var g = cv.getContext('2d'); g.scale(dpr, dpr);
      var k = Math.min(1, (performance.now() - t0 - 900) / 1100); k = k < 0 ? 0 : 1 - Math.pow(1 - k, 2);
      var dimA = 1 - .4 * Math.max(0, Math.min(1, (performance.now() - t0 - 2000) / 600));
      if (go) dimA *= Math.max(0, 1 - (performance.now() - go) / 500);
      var tot = 0, segs = []; STROKES.forEach(function (st) { for (var i = 1; i < st.length; i++) { var l = Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]); segs.push([st[i - 1], st[i], l, tot]); tot += l } });
      g.fillStyle = 'rgba(232,236,240,' + (.92 * dimA) + ')';
      for (var d = 0; d < tot * k; d += 7.2) { var s = segs[0]; for (var j = 0; j < segs.length; j++) if (d >= segs[j][3] && d < segs[j][3] + segs[j][2]) { s = segs[j]; break } var u = (d - s[3]) / s[2], x = M.x + (s[0][0] + (s[1][0] - s[0][0]) * u) * M.s, y = M.y + (s[0][1] + (s[1][1] - s[0][1]) * u) * M.s; g.beginPath(); g.arc(x, y, 1.7, 0, 7); g.fill() }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
    setTimeout(function () { A.classList.add('on') }, 30); setTimeout(function () { A.classList.add('seq') }, 1900);
    function touch(e) {
      if (go) return; go = performance.now();
      var x = e && e.clientX != null ? e.clientX : innerWidth / 2, y = e && e.clientY != null ? e.clientY : innerHeight * .7;
      for (var i = 0; i < 3; i++) A.appendChild(el('i', 'ra-rip', [], { style: 'left:' + x + 'px;top:' + y + 'px;animation-delay:' + (i * .22) + 's' }));
      A.classList.add('go');
      setTimeout(function () { started = true; document.documentElement.classList.remove('rf-arr'); if (window.__reflGo) window.__reflGo(); A.classList.add('out') }, 650);
      setTimeout(function () { A.remove(); showLegend() }, 650 + 3300);
    }
    dive.addEventListener('click', function (e) { e.stopPropagation(); touch(e) });
    wa.addEventListener('pointerup', touch);
    addEventListener('keydown', function k(e) { if (go) { removeEventListener('keydown', k); return } if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); touch() } });
    window.__reflTouch = touch;
  }
  if (window.__reflArrive) arrival(); else setTimeout(showLegend, 600);
  window.__refl = { state: function () { return { lv: cur.lv, k: cur.k, hz: +hz.toFixed(3), list: !list.hidden, board: built, arrival: !!$('#rarr') } }, list: listToggle, touch: function () { window.__reflTouch && window.__reflTouch() } };
  requestAnimationFrame(frame);
})();
