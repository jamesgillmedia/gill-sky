/* Preview tour shell. One script serves tour/ and every tour/<stop>/ page; each of those is a real static index.html
   (prev, next, menu and the link row are already in the markup), and this script frames the stop's preview.

   Loading: the frame area stays blank until the preview has loaded, then it appears whole (no spinner, no fade).
   Failures: offline, a load timeout, or a failed HEAD check show the shared joio-cups state with Retry and the Studio board.
   Old links: tour/#1 .. tour/#9 redirect to the clean paths. */
(function () {
  'use strict';
  var STOPS = window.GJ_TOUR_STOPS || [], N = STOPS.length;
  var script = document.currentScript;
  var ROOT = new URL('.', script.src).href;
  var HOME = new URL('../tonight/fable-m4/', ROOT).href;
  var LOAD_TIMEOUT = 15000;
  var MEDIA_WAIT = 4000;

  var legacy = /^#(\d+)$/.exec(location.hash || '');
  if (legacy && +legacy[1] >= 1 && +legacy[1] <= N) {
    location.replace(ROOT + STOPS[+legacy[1] - 1].slug + '/');
    return;
  }

  var $ = function (id) { return document.getElementById(id); };
  var view = $('view'), menu = $('menu'), mbtn = $('menubtn'), lab = $('label'), alone = $('alone');
  var prevA = $('prev'), nextA = $('next'), isIndex = document.body.getAttribute('data-index') === '1';
  var cur = -1, token = 0, timers = [], failed = null, frame = null;

  function stopUrl(i) { return ROOT + STOPS[i].slug + '/'; }
  function wrap(i) { return ((i % N) + N) % N; }

  function startIndex() {
    var n = parseInt(document.body.getAttribute('data-stop'), 10);
    return n >= 1 && n <= N ? n - 1 : 0;
  }

  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }

  function clearView() {
    clearTimers();
    if (failed) { failed.destroy(); failed = null; }
    if (frame && frame.parentNode) frame.parentNode.removeChild(frame);
    frame = null;
  }

  function fail(reason, i, mine) {
    if (mine !== token) return;
    clearTimers();
    if (frame && frame.parentNode) frame.parentNode.removeChild(frame);
    frame = null;
    if (failed) failed.destroy();
    failed = window.GJ_FAILSAFE.show(view, {
      reason: reason,
      alone: STOPS[i].url,
      onRetry: function () { load(i); }
    });
    view.setAttribute('data-state', 'error');
    view.setAttribute('data-reason', reason);
  }

  /* Same-origin frames can be asked whether their pictures and clips are in; cross-origin ones can only say "loaded". */
  function mediaReady(f, done) {
    var t0 = Date.now(), d = null;
    try { d = f.contentDocument; d && d.readyState; } catch (e) { d = null; }
    if (!d) { done(); return; }
    (function poll() {
      var ok = true;
      try {
        [].forEach.call(d.querySelectorAll('img'), function (im) { if (!im.complete) ok = false; });
        [].forEach.call(d.querySelectorAll('video'), function (v) { if (v.readyState < 2 && !v.error && v.preload !== 'none') ok = false; });
      } catch (e) { ok = true; }
      if (ok || Date.now() - t0 > MEDIA_WAIT) done(); else later(poll, 80);
    })();
  }

  function load(i) {
    var mine = ++token, it = STOPS[i];
    clearView();
    view.setAttribute('data-state', 'loading');
    view.removeAttribute('data-reason');
    if (navigator.onLine === false) { fail('offline', i, mine); return; }

    var f = document.createElement('iframe');
    f.title = it.title;
    f.setAttribute('allow', 'fullscreen; autoplay; accelerometer; gyroscope; clipboard-write');
    frame = f;
    var loaded = false, probed = false;

    function show() {
      if (mine !== token || !loaded || !probed) return;
      clearTimers();
      mediaReady(f, function () {
        if (mine !== token) return;
        f.classList.add('on');
        view.setAttribute('data-state', 'ready');
      });
    }
    f.addEventListener('load', function () {
      if (mine !== token) return;
      loaded = true;
      show();
    });
    later(function () { fail(navigator.onLine === false ? 'offline' : 'timeout', i, mine); }, LOAD_TIMEOUT);

    window.GJ_FAILSAFE.probe(it.url).then(function (r) {
      if (mine !== token) return;
      if (!r.ok) { fail(r.reason, i, mine); return; }
      probed = true;
      show();
    });

    f.src = it.url;
    view.appendChild(f);
  }

  function paint(i) {
    var it = STOPS[i], p = wrap(i - 1), n = wrap(i + 1);
    lab.firstChild.textContent = (i + 1) + ' of ' + N;
    lab.lastChild.textContent = it.title;
    alone.href = it.url;
    document.title = it.title + ' \u00b7 ' + (i + 1) + ' of ' + N + ' \u00b7 Gill James preview tour';
    prevA.href = stopUrl(p);
    prevA.setAttribute('aria-label', 'Previous preview: ' + STOPS[p].title);
    nextA.href = stopUrl(n);
    nextA.setAttribute('aria-label', 'Next preview: ' + STOPS[n].title);
    [].forEach.call(menu.children, function (a, k) {
      if (k === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }

  function render(i) {
    if (i === cur) return;
    cur = i;
    paint(i);
    load(i);
    if (window.GJ_ANALYTICS) GJ_ANALYTICS.track('tour_stop', { stop: i + 1, of: N, slug: STOPS[i].slug, title: STOPS[i].title });
  }

  function go(i) {
    i = wrap(i);
    var u = stopUrl(i);
    if (location.href.split('#')[0] !== u) history.replaceState(null, '', u);
    render(i);
  }

  function setMenu(open, focusBack) {
    menu.classList.toggle('open', open);
    mbtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      var c = menu.querySelector('[aria-current="true"]') || menu.firstChild;
      if (c) c.focus();
    } else if (focusBack) mbtn.focus();
  }

  function plain(e) { return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey; }

  prevA.addEventListener('click', function (e) { if (plain(e)) { e.preventDefault(); go(cur - 1); } });
  nextA.addEventListener('click', function (e) { if (plain(e)) { e.preventDefault(); go(cur + 1); } });
  [].forEach.call(menu.children, function (a, k) {
    a.addEventListener('click', function (e) { if (plain(e)) { e.preventDefault(); go(k); setMenu(false, true); } });
  });
  mbtn.addEventListener('click', function (e) { e.stopPropagation(); setMenu(!menu.classList.contains('open')); });
  document.addEventListener('click', function (e) { if (!menu.contains(e.target) && e.target !== mbtn) setMenu(false); });
  window.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'Escape') { if (menu.classList.contains('open')) { setMenu(false, true); e.preventDefault(); } return; }
    var t = e.target;
    if (t && t.closest && t.closest('input,textarea,select')) return;
    if (e.key === 'ArrowLeft') { go(cur - 1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { go(cur + 1); e.preventDefault(); }
  });
  window.addEventListener('hashchange', function () {
    var m = /^#(\d+)$/.exec(location.hash || '');
    if (m && +m[1] >= 1 && +m[1] <= N) location.replace(ROOT + STOPS[+m[1] - 1].slug + '/');
  });
  window.addEventListener('online', function () { if (failed && cur >= 0) load(cur); });
  window.addEventListener('offline', function () { if (cur >= 0 && view.getAttribute('data-state') === 'loading') fail('offline', cur, token); });

  var sx = 0, sy = 0, st = 0, tracking = false, strip = $('strip');
  strip.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) { tracking = false; return; }
    tracking = true; sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now();
  }, { passive: true });
  strip.addEventListener('touchend', function (e) {
    if (!tracking) return; tracking = false;
    var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - st < 700) {
      go(cur + (dx < 0 ? 1 : -1));
      setTimeout(function () { document.activeElement && document.activeElement.blur && document.activeElement.blur(); }, 0);
    }
  }, { passive: true });

  window.GJ_FAILSAFE.warm();
  render(startIndex());
  window.GJ_TOUR = { stops: STOPS, go: go, root: ROOT, home: HOME, get current() { return cur; } };
})();
