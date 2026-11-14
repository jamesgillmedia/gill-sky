/* Shared error / offline state: Gill's own joio cups, seen from above, taking turns in a quiet collage.
   The cups are the cutouts from preview-objects-gallery (alpha only, pixels untouched). They are never tilted, graded or tinted:
   each frame only swaps which cups are on the table. Reduce Motion keeps the first frame still.

   GJ_FAILSAFE.show(host, opts) -> { el, destroy() }
     host   element to fill (it should be position:relative or absolute with a size)
     opts   reason   'offline' | 'timeout' | 'network' | 'http'   (picks the copy)
            onRetry  function called by the Retry button
            board    Studio board URL (defaults to GJ_FAILSAFE.BOARD)
            alone    optional URL for an "open alone" link
   GJ_FAILSAFE.warm()     fetches the cups into memory so the collage still draws once the connection is gone (cached() says how many of the six are in)
   GJ_FAILSAFE.probe(url) HEAD check -> Promise<{ok, reason}>; 'cors' first, then 'no-cors' (opaque answer = reachable)
   GJ_FAILSAFE.COPY       the messages */
(function (w) {
  'use strict';

  var BOARD = 'https://jamesgillmedia.github.io/gilljames/previews/';
  var BASE = (function () {
    var s = document.currentScript;
    try { return new URL('cups/', s && s.src ? s.src : location.href).href; } catch (e) { return 'cups/'; }
  })();
  var ASPECT = { top: 617 / 640, ash: 1, clay: 347 / 354, ash2: 500 / 504, stone: 539 / 640, cream: 441 / 430 };
  var LABEL = {
    top: 'joio.co cup from above', ash: 'ashy bowl from above', clay: 'unfired clay cup from above',
    ash2: 'ashy bowl, second shot', stone: 'wide grey bowl from above', cream: 'cream-glazed cup from above'
  };
  /* cx, cy: centre as % of the stage; w: width as % of the stage (the stage is 16:10) */
  var FRAMES = [
    [['top', 28, 52, 36], ['cream', 60, 34, 24], ['ash', 78, 66, 26], ['clay', 54, 78, 17]],
    [['stone', 34, 48, 42], ['ash2', 72, 42, 30], ['clay', 62, 80, 16], ['cream', 16, 80, 18]],
    [['ash', 24, 46, 30], ['top', 56, 56, 36], ['cream', 84, 34, 20], ['ash2', 80, 78, 20]]
  ];
  var COPY = {
    offline: ["You're offline.", 'This preview needs a connection. It will come back on its own when you do.'],
    timeout: ['This one is taking a while.', 'The connection may be slow. Give it another go, or look in on the Studio board.'],
    network: ["This preview isn't reachable right now.", 'Nothing is lost. Try again in a moment.'],
    http: ["This preview has gone quiet.", 'The page did not answer. Try again, or find the current ones on the Studio board.']
  };
  var CACHE = {}, warmed = false;

  function rm() {
    try { return !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function url(k) { return CACHE[k] || (BASE + k + '.webp'); }

  function warm() {
    if (warmed || !w.fetch) return;
    warmed = true;
    Object.keys(ASPECT).forEach(function (k) {
      fetch(BASE + k + '.webp').then(function (r) { return r.ok ? r.blob() : null; }).then(function (b) {
        if (b) CACHE[k] = URL.createObjectURL(b);
      }).catch(function () { warmed = false; });
    });
  }

  function probe(target, ms) {
    ms = ms || 10000;
    function head(mode) {
      var ctl = w.AbortController ? new AbortController() : null;
      var t = setTimeout(function () { if (ctl) ctl.abort(); }, ms);
      return fetch(target, { method: 'HEAD', mode: mode, cache: 'no-store', signal: ctl ? ctl.signal : undefined })
        .then(function (r) { clearTimeout(t); return r; }, function (e) { clearTimeout(t); throw e; });
    }
    if (!w.fetch) return Promise.resolve({ ok: true, reason: 'unchecked' });
    if (w.navigator && navigator.onLine === false) return Promise.resolve({ ok: false, reason: 'offline' });
    return head('cors').then(function (r) {
      return r.ok ? { ok: true } : { ok: false, reason: 'http', status: r.status };
    }, function () {
      return head('no-cors').then(function () { return { ok: true, reason: 'opaque' }; },
        function () { return { ok: false, reason: (w.navigator && navigator.onLine === false) ? 'offline' : 'network' }; });
    });
  }

  function show(host, opts) {
    opts = opts || {};
    warm();
    var reason = COPY[opts.reason] ? opts.reason : 'network';
    var root = el('div', 'gjf');
    root.setAttribute('role', 'status');
    root.setAttribute('aria-live', 'polite');
    root.setAttribute('data-reason', reason);

    var stage = el('div', 'gjf-stage');
    stage.setAttribute('role', 'img');
    stage.setAttribute('aria-label', 'Gill\u2019s joio cups, seen from above, taking turns on a dark table');
    var layers = FRAMES.map(function (fr, i) {
      var L = el('div', 'gjf-frame' + (i === 0 ? ' on' : ''));
      fr.forEach(function (c) {
        var cup = el('span', 'gjf-cup');
        var wd = c[3], ht = wd * ASPECT[c[0]] / 0.625;
        cup.style.width = wd + '%';
        cup.style.height = ht + '%';
        cup.style.left = (c[1] - wd / 2) + '%';
        cup.style.top = (c[2] - ht / 2) + '%';
        var im = new Image();
        im.alt = '';
        im.decoding = 'async';
        im.draggable = false;
        im.src = url(c[0]);
        im.setAttribute('data-cup', c[0]);
        cup.appendChild(im);
        L.appendChild(cup);
      });
      stage.appendChild(L);
      return L;
    });
    root.appendChild(stage);

    var msg = el('div', 'gjf-msg');
    msg.appendChild(el('p', 'gjf-h', COPY[reason][0]));
    msg.appendChild(el('p', 'gjf-p', COPY[reason][1]));
    var row = el('div', 'gjf-row');
    var retry = el('button', 'gjf-retry', 'Retry');
    retry.type = 'button';
    retry.addEventListener('click', function () { if (opts.onRetry) opts.onRetry(); });
    row.appendChild(retry);
    var board = el('a', 'gjf-link', 'Studio board');
    board.href = opts.board || BOARD;
    board.target = '_blank';
    board.rel = 'noopener';
    row.appendChild(board);
    if (opts.alone) {
      var alone = el('a', 'gjf-link', 'open alone');
      alone.href = opts.alone;
      alone.target = '_blank';
      alone.rel = 'noopener';
      row.appendChild(alone);
    }
    msg.appendChild(row);
    root.appendChild(msg);
    host.appendChild(root);

    var cur = 0, timer = 0;
    if (!rm()) {
      timer = setInterval(function () {
        layers[cur].classList.remove('on');
        cur = (cur + 1) % layers.length;
        layers[cur].classList.add('on');
      }, 3600);
    }
    try { retry.focus({ preventScroll: true }); } catch (e) { }
    return {
      el: root,
      destroy: function () {
        clearInterval(timer);
        if (root.parentNode) root.parentNode.removeChild(root);
      }
    };
  }

  w.GJ_FAILSAFE = { show: show, warm: warm, probe: probe, COPY: COPY, BOARD: BOARD, LABEL: LABEL, cached: function () { return Object.keys(CACHE).length; } };
})(window);
