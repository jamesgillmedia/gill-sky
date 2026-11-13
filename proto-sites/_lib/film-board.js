/* Film board: loose floating map snaps into site-3d board; counts on pinch-in.
   Desktop: wheel / two-finger scroll zooms continuously and settles softly;
   double-click steps out one level. Primary path opens the film player page. */
(function (global) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function easeOut(u) { u = clamp(u, 0, 1); return 1 - Math.pow(1 - u, 3); }

  function mount(canvas, opts) {
    opts = opts || {};
    var mediaRoot = opts.mediaRoot || '';
    var films = (opts.films || []).slice();
    var onOpen = opts.onOpen || function () {};
    var onLevel = opts.onLevel || function () {};
    var accent = opts.accent || '150,220,255';
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    var g = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1;
    // level: 0 = loose map, 1 = chapter, 2 = site-3d board
    var level = 0, levelT = 0, levelFrom = 0, levelAnim = null;
    var zoom = 1, zoomV = 0, zoomTarget = 1;
    var panX = 0, panY = 0;
    var imgs = {};
    var tiles = [];
    var pinch = null;
    var drag = null;
    var raf = 0;
    var lastT = 0;
    var showCounts = false;

    // Hand-placed asymmetric loose map (deterministic). Avoids even grid-for-grid's-sake.
    var LOOSE = [
      [-0.62,-0.38],[-0.18,-0.52],[0.41,-0.44],[0.72,-0.12],
      [-0.78,0.05],[-0.32,0.18],[0.12,-0.08],[0.55,0.22],
      [-0.48,0.48],[0.02,0.42],[0.38,0.55],[-0.08,0.68],
      [0.68,0.48],[-0.68,0.72],[0.22,-0.68],[-0.42,-0.18],
      [0.88,-0.32],[-0.92,-0.22],[0.48,-0.22],[-0.22,0.32],
      [0.15,0.12],[-0.55,-0.62],[0.78,0.08],[-0.12,-0.28],
      [0.32,0.28],[-0.72,0.32],[0.58,0.68],[-0.28,0.58],
      [0.05,-0.42],[0.92,0.28],[-0.85,0.55],[0.25,0.72],
      [-0.05,0.05],[0.65,-0.55],[-0.35,0.05],[0.45,0.05],
      [-0.6,-0.05],[0.1,0.55]
    ];
    films.forEach(function (f, i) {
      var im = new Image();
      im.decoding = 'async';
      im.src = mediaRoot + f.thumb;
      imgs[f.slug] = im;
      var p = LOOSE[i % LOOSE.length];
      var seed = (i * 2654435761) >>> 0;
      var rot = (((seed * 3) & 0xffff) / 0xffff - 0.5) * 0.22;
      // slight deterministic jitter so repeats of LOOSE don't stack
      var jx = (((seed >> 3) & 255) / 255 - 0.5) * 0.08;
      var jy = (((seed >> 11) & 255) / 255 - 0.5) * 0.08;
      tiles.push({
        f: f, i: i,
        lx: p[0] + jx, ly: p[1] + jy,
        rot: rot,
        col: 0, row: 0
      });
    });

    function layoutBoard() {
      var cols = W < 520 ? 2 : W < 900 ? 3 : 4;
      var gap = W < 520 ? 10 : 14;
      var pad = 28;
      var maxW = Math.min(W - pad * 2, 920);
      var tw = (maxW - gap * (cols - 1)) / cols;
      var th = tw / 2.39;
      tiles.forEach(function (t, i) {
        t.col = i % cols;
        t.row = (i / cols) | 0;
        t.bw = tw; t.bh = th;
        t.bx = -maxW / 2 + t.col * (tw + gap) + tw / 2;
        t.by = -((Math.ceil(tiles.length / cols) * (th + gap + 28)) / 2) + t.row * (th + gap + 28) + th / 2;
      });
      return { cols: cols, tw: tw, th: th, maxW: maxW, rows: Math.ceil(tiles.length / cols) };
    }

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = canvas.clientWidth || innerWidth;
      H = canvas.clientHeight || innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      layoutBoard();
    }

    function setLevel(L, immediate) {
      L = clamp(L | 0, 0, 2);
      if (L === level && !levelAnim) { onLevel(level, showCounts); return; }
      if (immediate || reduced) {
        level = L; levelT = L; levelAnim = null;
        showCounts = level >= 2;
        zoomTarget = level === 0 ? 1 : level === 1 ? 1.35 : 1.85;
        zoom = zoomTarget; zoomV = 0;
        onLevel(level, showCounts);
        return;
      }
      levelFrom = levelT;
      levelAnim = { from: levelT, to: L, t0: performance.now(), dur: 780 };
      level = L;
      showCounts = L >= 2;
      zoomTarget = L === 0 ? 1 : L === 1 ? 1.35 : 1.85;
      onLevel(level, showCounts);
    }

    function hit(mx, my) {
      var spec = layoutBoard();
      var u = (levelT);
      for (var i = tiles.length - 1; i >= 0; i--) {
        var t = tiles[i];
        var lx = t.lx * Math.min(W, H) * 0.42;
        var ly = t.ly * Math.min(W, H) * 0.38;
        var x = lerp(lx, t.bx, easeOut(clamp((u - 0.35) / 0.65, 0, 1)));
        var y = lerp(ly, t.by, easeOut(clamp((u - 0.35) / 0.65, 0, 1)));
        var sc = lerp(0.72, 1, easeOut(u));
        var w = (t.bw || spec.tw) * sc, h = (t.bh || spec.th) * sc;
        var sx = (mx - W / 2 - panX) / zoom;
        var sy = (my - H / 2 - panY) / zoom;
        if (sx > x - w / 2 && sx < x + w / 2 && sy > y - h / 2 && sy < y + h / 2) return t;
      }
      return null;
    }

    function paint(now) {
      now = now || performance.now();
      var dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016;
      lastT = now;

      if (levelAnim) {
        var u = (now - levelAnim.t0) / levelAnim.dur;
        if (u >= 1) { levelT = levelAnim.to; levelAnim = null; }
        else levelT = lerp(levelAnim.from, levelAnim.to, easeOut(u));
      }

      // soft settle toward zoomTarget
      var k = reduced ? 1 : 1 - Math.exp(-dt * 7.5);
      zoomV += (zoomTarget - zoom) * 18 * dt;
      zoomV *= Math.exp(-dt * 9);
      zoom += zoomV * dt + (zoomTarget - zoom) * k * 0.35;
      if (Math.abs(zoomTarget - zoom) < 0.001 && Math.abs(zoomV) < 0.001) { zoom = zoomTarget; zoomV = 0; }

      g.clearRect(0, 0, W, H);
      // night field
      var grd = g.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
      grd.addColorStop(0, 'rgba(18,28,46,.55)');
      grd.addColorStop(1, 'rgba(4,7,11,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, W, H);

      var spec = layoutBoard();
      var uL = levelT;
      var snap = easeOut(clamp((uL - 0.35) / 0.65, 0, 1));

      g.save();
      g.translate(W / 2 + panX, H / 2 + panY);
      g.scale(zoom, zoom);

      // board rim when near/at board
      if (uL > 1.15) {
        var a = clamp((uL - 1.15) / 0.85, 0, 1);
        var bw = spec.maxW + 36, bh = spec.rows * (spec.th + 42) + 70;
        g.strokeStyle = 'rgba(' + accent + ',' + (0.18 + 0.35 * a) + ')';
        g.lineWidth = 1;
        g.strokeRect(-bw / 2, -bh / 2 - 18, bw, bh);
        if (showCounts && a > 0.4) {
          g.fillStyle = 'rgba(238,243,245,' + (0.55 + 0.4 * a) + ')';
          g.font = '400 13px "Julius Sans One",sans-serif';
          g.textAlign = 'center';
          g.fillText('FILM', 0, -bh / 2 + 8);
          g.font = '300 11px Poppins,sans-serif';
          g.fillStyle = 'rgba(201,211,214,' + (0.5 + 0.4 * a) + ')';
          var nf = films.filter(function (f) { return f.kind === 'film'; }).length;
          var nr = films.filter(function (f) { return f.kind === 'reel'; }).length;
          var label = nf + ' films' + (nr ? ' + demo reel' : '');
          g.fillText(label, 0, -bh / 2 + 26);
        }
      }

      tiles.forEach(function (t) {
        var lx = t.lx * Math.min(W, H) * 0.42;
        var ly = t.ly * Math.min(W, H) * 0.38;
        var x = lerp(lx, t.bx, snap);
        var y = lerp(ly, t.by, snap);
        var rot = t.rot * (1 - snap);
        var sc = lerp(0.72, 1, snap);
        var w = (t.bw || spec.tw) * sc, h = (t.bh || spec.th) * sc;
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.fillStyle = 'rgba(8,12,20,.85)';
        g.fillRect(-w / 2, -h / 2, w, h);
        var im = imgs[t.f.slug];
        if (im && im.complete && im.naturalWidth) {
          g.drawImage(im, -w / 2, -h / 2, w, h);
        } else {
          g.fillStyle = 'rgba(' + accent + ',.12)';
          g.fillRect(-w / 2, -h / 2, w, h);
        }
        // no colour grade on photos elsewhere; film thumbs as-is
        if (snap < 0.85) {
          g.strokeStyle = 'rgba(' + accent + ',' + (0.12 + 0.2 * (1 - snap)) + ')';
          g.strokeRect(-w / 2, -h / 2, w, h);
        }
        if (uL > 1.4 && t.f.title) {
          g.fillStyle = 'rgba(238,243,245,.78)';
          g.font = '300 10px Poppins,sans-serif';
          g.textAlign = 'left';
          var title = t.f.title;
          if (g.measureText(title).width > w - 4) {
            while (title.length > 4 && g.measureText(title + '…').width > w - 4) title = title.slice(0, -1);
            title += '…';
          }
          g.fillText(title, -w / 2, h / 2 + 14);
          if (t.f.role) {
            g.fillStyle = 'rgba(85,218,161,.8)';
            g.fillText(t.f.role, -w / 2, h / 2 + 26);
          }
        }
        g.restore();
      });
      g.restore();

      raf = requestAnimationFrame(paint);
    }

    function deeper() {
      if (level < 2) setLevel(level + 1);
    }
    function outOne() {
      if (level > 0) setLevel(level - 1);
      else { zoomTarget = 1; zoomV = 0; }
    }

    // wheel / trackpad continuous zoom with soft settle; ctrl+wheel = pinch analog
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      var dy = e.deltaY;
      if (e.ctrlKey) {
        // trackpad pinch
        if (dy < -2) deeper();
        else if (dy > 2) outOne();
        return;
      }
      zoomTarget = clamp(zoomTarget * Math.exp(-dy * 0.0018), 0.55, 2.8);
      // crossing thresholds steps level softly
      if (zoomTarget > 1.55 && level < 2) setLevel(2);
      else if (zoomTarget > 1.2 && level < 1) setLevel(1);
      else if (zoomTarget < 0.95 && level > 0) setLevel(0);
      else if (zoomTarget < 1.25 && level > 1) setLevel(1);
    }, { passive: false });

    canvas.addEventListener('dblclick', function (e) {
      e.preventDefault();
      outOne();
    });

    canvas.addEventListener('pointerdown', function (e) {
      canvas.setPointerCapture(e.pointerId);
      if (!drag) drag = {};
      drag[e.pointerId] = { x: e.clientX, y: e.clientY, t: performance.now() };
      var ids = Object.keys(drag);
      if (ids.length === 2) {
        var a = drag[ids[0]], b = drag[ids[1]];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), done: 0 };
      }
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!drag || !drag[e.pointerId]) return;
      var p = drag[e.pointerId];
      var dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      var ids = Object.keys(drag);
      if (ids.length === 2 && pinch) {
        var a = drag[ids[0]], b = drag[ids[1]];
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        var r = d / (pinch.d || 1);
        if (!pinch.done && r > 1.18) { pinch.done = 1; deeper(); }
        else if (!pinch.done && r < 0.84) { pinch.done = 1; outOne(); }
        return;
      }
      if (Math.hypot(dx, dy) > 1) {
        panX += dx; panY += dy;
        p.moved = 1;
      }
    });
    function up(e) {
      if (!drag || !drag[e.pointerId]) return;
      var p = drag[e.pointerId];
      var moved = p.moved;
      var dt = performance.now() - p.t;
      delete drag[e.pointerId];
      if (Object.keys(drag).length < 2) pinch = null;
      if (!moved && dt < 450 && level >= 1) {
        var t = hit(e.clientX, e.clientY);
        if (t) onOpen(t.f);
      } else if (!moved && dt < 450 && level === 0) {
        deeper();
      }
    }
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);

    addEventListener('resize', resize);
    resize();
    raf = requestAnimationFrame(paint);

    return {
      setLevel: setLevel,
      deeper: deeper,
      out: outOne,
      level: function () { return level; },
      destroy: function () { cancelAnimationFrame(raf); }
    };
  }

  global.GSFilmBoard = { mount: mount };
})(window);
