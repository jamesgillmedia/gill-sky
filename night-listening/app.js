/* Night Listening — every song is a star. Plain JS, no dependencies. */
(function () {
  "use strict";

  var DATA = window.NIGHT_LISTENING || { constellations: [], songs: [] };
  var SONGS = DATA.songs;
  var ERAS = DATA.constellations;

  /* ---------- reduce motion ---------- */
  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var RM = !!(mq && mq.matches);
  if (mq) {
    var onMq = function () { RM = mq.matches; };
    if (mq.addEventListener) mq.addEventListener("change", onMq); else if (mq.addListener) mq.addListener(onMq);
  }

  /* ---------- elements ---------- */
  var canvas = document.getElementById("sky");
  var g = canvas.getContext("2d");
  var labelEl = document.getElementById("label");
  var labelT = labelEl.querySelector(".t");
  var labelD = labelEl.querySelector(".d");
  var hintEl = document.getElementById("hint");
  var erasEl = document.getElementById("eras");
  var srList = document.getElementById("srlist");
  var bar = document.getElementById("bar");
  var ppBtn = document.getElementById("pp");
  var bTitle = document.getElementById("btitle");
  var tCur = document.getElementById("tcur");
  var tLen = document.getElementById("tlen");
  var prog = document.getElementById("prog");
  var vol = document.getElementById("vol");
  var flash = document.getElementById("flash");
  var volV = document.getElementById("volv");
  var flashV = document.getElementById("flashv");

  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- layout ---------- */
  // Four-star shapes per constellation (world units), repeated if an era has more songs.
  var SHAPES = [
    [[-125, -35], [-35, -110], [60, -55], [125, 45], [20, 95], [-80, 70]],
    [[-105, 55], [-25, -85], [95, -45], [45, 105], [-60, -10], [140, 40]],
    [[-135, -20], [-45, 65], [50, -35], [135, 70], [-10, -115], [90, 120]]
  ];
  var CLOSED = [false, true, false];
  var CENTERS = {
    land: [[-430, -110], [0, 120], [430, -70]],
    port: [[-55, -440], [65, 0], [-45, 440]]
  };
  var stars = [];      // {i, song, era, wx, wy, r}
  var eraInfo = [];    // {id, name, cx, cy, idx:[star indexes], btn}
  var bbox = { x0: 0, y0: 0, x1: 0, y1: 0 };
  var mode = "";
  var minLen = Infinity, maxLen = 0;
  SONGS.forEach(function (s) { minLen = Math.min(minLen, s.lengthSec); maxLen = Math.max(maxLen, s.lengthSec); });

  function starRadius(len) {
    var t = maxLen > minLen ? (len - minLen) / (maxLen - minLen) : 0.5;
    return 2.6 + t * 4.4; // screen px at fit zoom
  }

  function buildLayout() {
    var centers = CENTERS[mode];
    stars = []; eraInfo = [];
    ERAS.forEach(function (e, k) {
      var c = centers[k % centers.length], shape = SHAPES[k % SHAPES.length];
      var info = { id: e.id, name: e.name, cx: c[0], cy: c[1], idx: [], k: k };
      eraInfo.push(info);
    });
    SONGS.forEach(function (s, i) {
      var k = 0;
      for (var j = 0; j < eraInfo.length; j++) if (eraInfo[j].id === s.constellation) k = j;
      var info = eraInfo[k], shape = SHAPES[k % SHAPES.length];
      var n = info.idx.length, p = shape[n % shape.length], ring = Math.floor(n / shape.length);
      var wx = info.cx + p[0] * (1 + ring * 0.35), wy = info.cy + p[1] * (1 + ring * 0.35);
      if (typeof s.x === "number") wx = s.x; if (typeof s.y === "number") wy = s.y;
      info.idx.push(i);
      stars.push({ i: i, song: s, era: k, wx: wx, wy: wy, r: starRadius(s.lengthSec) });
    });
    bbox = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    stars.forEach(function (st) {
      bbox.x0 = Math.min(bbox.x0, st.wx); bbox.y0 = Math.min(bbox.y0, st.wy);
      bbox.x1 = Math.max(bbox.x1, st.wx); bbox.y1 = Math.max(bbox.y1, st.wy);
    });
    eraInfo.forEach(function (e) {
      var y1 = -Infinity, sx = 0;
      e.idx.forEach(function (i) { y1 = Math.max(y1, stars[i].wy); sx += stars[i].wx; });
      e.lx = e.idx.length ? sx / e.idx.length : e.cx; e.ly = (e.idx.length ? y1 : e.cy) + 48;
      e.zx = e.cx; e.zy = e.cy + 10;
    });
    buildEraButtons();
    buildSrList();
  }

  /* ---------- camera ---------- */
  var W = 0, H = 0, DPR = 1, CY = 0, AVH = 0;
  var TOP = 64; // title area
  var cam = { cx: 0, cy: 0, s: 1 };
  var fitS = 1, minS = 1, maxS = 4;
  var tween = null;

  function fitScale() {
    var pad = 90;
    var bw = bbox.x1 - bbox.x0 + pad * 2, bh = bbox.y1 - bbox.y0 + pad * 2 + 60;
    return Math.min(W / bw, AVH / bh);
  }
  function clampCam() {
    cam.s = clamp(cam.s, minS, maxS);
    cam.cx = clamp(cam.cx, bbox.x0, bbox.x1);
    cam.cy = clamp(cam.cy, bbox.y0, bbox.y1);
  }
  function homeCam() {
    cam.cx = (bbox.x0 + bbox.x1) / 2; cam.cy = (bbox.y0 + bbox.y1) / 2 + 20; cam.s = fitS;
  }

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    var newMode = W < H * 0.9 ? "port" : "land";
    var barH = W < 700 ? 132 : 76; // room kept for the player bar
    AVH = H - TOP - barH; CY = TOP + AVH / 2;
    var changed = newMode !== mode;
    if (changed) { mode = newMode; buildLayout(); }
    var oldFit = fitS;
    fitS = fitScale(); minS = fitS * 0.85; maxS = fitS * 4.5;
    if (changed) homeCam(); else cam.s *= fitS / oldFit;
    clampCam();
    makeField();
  }

  var drift = { x: 0, y: 0 };
  function sxOf(wx) { return (wx - cam.cx) * cam.s + W / 2 + drift.x; }
  function syOf(wy) { return (wy - cam.cy) * cam.s + CY + drift.y; }
  function wxOf(sx) { return (sx - W / 2 - drift.x) / cam.s + cam.cx; }
  function wyOf(sy) { return (sy - CY - drift.y) / cam.s + cam.cy; }
  function zoomLevel() { return cam.s / fitS; }
  function screenR(st) { return st.r * Math.pow(zoomLevel(), 0.55); }

  function zoomAt(sx, sy, ns) {
    ns = clamp(ns, minS, maxS);
    var wx = wxOf(sx), wy = wyOf(sy);
    cam.s = ns;
    cam.cx = wx - (sx - W / 2 - drift.x) / ns;
    cam.cy = wy - (sy - CY - drift.y) / ns;
    clampCam();
  }

  function flyTo(cx, cy, s) {
    s = clamp(s, minS, maxS);
    if (RM) { cam.cx = cx; cam.cy = cy; cam.s = s; clampCam(); return; }
    tween = { t0: performance.now(), dur: 750, a: { cx: cam.cx, cy: cam.cy, s: cam.s }, b: { cx: cx, cy: cy, s: s } };
  }
  function stepTween(now) {
    if (!tween) return;
    var t = clamp((now - tween.t0) / tween.dur, 0, 1), e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    var a = tween.a, b = tween.b;
    // interpolate scale geometrically so the zoom feels even
    cam.s = a.s * Math.pow(b.s / a.s, e);
    cam.cx = a.cx + (b.cx - a.cx) * e; cam.cy = a.cy + (b.cy - a.cy) * e;
    clampCam();
    if (t >= 1) tween = null;
  }
  function zoomToEra(k) {
    var e = eraInfo[k]; if (!e) return;
    var near = zoomLevel() > 1.8 && Math.abs(cam.cx - e.zx) < 40 && Math.abs(cam.cy - e.zy) < 40;
    if (near) { flyTo((bbox.x0 + bbox.x1) / 2, (bbox.y0 + bbox.y1) / 2 + 20, fitS); return; }
    var s = Math.min(W / 420, AVH / 380);
    flyTo(e.zx, e.zy, Math.max(s, fitS * 2));
  }

  /* ---------- background field ---------- */
  var field = [];
  function rng(seed) { return function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
  var TILE = 1400;
  function makeField() {
    if (field.length) return;
    var r = rng(7);
    for (var i = 0; i < 300; i++) {
      field.push({ x: r() * TILE, y: r() * TILE, a: 0.08 + r() * 0.35, s: 0.4 + r() * 0.9, ph: r() * 6.283, sp: 0.15 + r() * 0.5, z: 0.1 + r() * 0.25 });
    }
  }

  /* ---------- selection / playback state ---------- */
  var sel = -1, hover = -1;
  var everSelected = false;

  function select(i) {
    if (sel === i) return;
    sel = i;
    if (i < 0) { labelEl.classList.remove("on"); return; }
    if (!everSelected) { everSelected = true; hintEl.classList.add("gone"); }
    labelEl.classList.remove("on");
    var s = SONGS[i];
    labelT.textContent = s.title; labelD.textContent = fmt(s.lengthSec);
    positionLabel();
    // let the fade restart
    requestAnimationFrame(function () { if (sel === i) labelEl.classList.add("on"); });
  }

  function tapStar(i) {
    if (sel !== i) { select(i); return; }
    if (player.cur === i) { player.toggle(); return; }
    player.play(i, 0);
  }

  /* ---------- audio ---------- */
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master = null, mediaEl = null, mediaNode = null;
  function volGain() { var v = vol.value / 100; return v * v; }

  function unlock() {
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
    if (!AC) return;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = volGain(); master.connect(ctx.destination);
      // a silent sample wakes iOS audio
      var b = ctx.createBuffer(1, 1, 22050), src = ctx.createBufferSource();
      src.buffer = b; src.connect(ctx.destination); src.start(0);
    }
    if (ctx.state === "suspended" && ctx.resume) ctx.resume();
  }
  ["touchend", "mouseup", "keydown", "click"].forEach(function (ev) {
    window.addEventListener(ev, unlock, { capture: true, passive: true });
  });

  var ROOTS = [110, 130.81, 146.83, 164.81, 98, 123.47, 116.54, 138.59, 103.83, 155.56, 87.31, 174.61];

  var player = {
    cur: -1, playing: false, off: 0, t0: 0, voice: null, sched: 0, nextBeat: 0, beatN: 0,
    song: function () { return SONGS[this.cur]; },
    usesTone: function () { var s = this.song(); return !s || !s.src; },
    duration: function () {
      var s = this.song(); if (!s) return 0;
      if (!this.usesTone() && mediaEl && isFinite(mediaEl.duration) && mediaEl.duration > 0) return mediaEl.duration;
      return s.lengthSec;
    },
    position: function () {
      if (this.cur < 0) return 0;
      if (!this.usesTone()) return mediaEl ? mediaEl.currentTime : 0;
      if (!this.playing || !ctx) return this.off;
      return this.off + (ctx.currentTime - this.t0);
    },
    beatPhase: function () {
      var s = this.song(); if (!s || !s.bpm) return 0;
      var b = this.position() * s.bpm / 60; return b - Math.floor(b);
    },
    play: function (i, offset) {
      unlock();
      this.stopVoice();
      if (mediaEl && this.cur !== i) { mediaEl.pause(); }
      this.cur = i; this.off = offset || 0;
      var s = SONGS[i];
      bTitle.textContent = s.title;
      if (s.src) this.playMedia(s, this.off); else this.playTone(s, i, this.off);
      this.playing = true;
      showBar(); syncButton();
    },
    playMedia: function (s, offset) {
      if (!mediaEl) {
        mediaEl = new Audio(); mediaEl.preload = "auto"; mediaEl.setAttribute("playsinline", "");
        mediaEl.addEventListener("ended", function () { player.ended(); });
        if (ctx) { try { mediaNode = ctx.createMediaElementSource(mediaEl); mediaNode.connect(master); } catch (e) { mediaNode = null; } }
      }
      if (mediaEl.getAttribute("data-src") !== s.src) { mediaEl.src = s.src; mediaEl.setAttribute("data-src", s.src); }
      if (!mediaNode) mediaEl.volume = vol.value / 100;
      try { mediaEl.currentTime = offset; } catch (e) {}
      var p = mediaEl.play(); if (p && p.catch) p.catch(function () { player.playing = false; syncButton(); });
    },
    playTone: function (s, i, offset) {
      if (!ctx) return;
      var t = ctx.currentTime + 0.03, root = ROOTS[i % ROOTS.length], left = s.lengthSec - offset;
      var out = ctx.createGain(), lp = ctx.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = 1400; lp.Q.value = 0.4;
      out.gain.setValueAtTime(0.0001, t);
      out.gain.exponentialRampToValueAtTime(1, t + 1.2);
      if (left > 3) { out.gain.setValueAtTime(1, t + left - 2.5); out.gain.exponentialRampToValueAtTime(0.0001, t + left); }
      lp.connect(out); out.connect(master);
      var oscs = [];
      [[root * 2, "sine", 0.045], [root * 3, "sine", 0.022], [root, "triangle", 0.03], [root * 2.006, "sine", 0.02]].forEach(function (d) {
        var o = ctx.createOscillator(), gg = ctx.createGain();
        o.type = d[1]; o.frequency.value = d[0]; gg.gain.value = d[2];
        o.connect(gg); gg.connect(lp); o.start(t); oscs.push(o);
      });
      this.voice = { out: out, lp: lp, oscs: oscs, root: root };
      this.t0 = t; this.off = offset;
      var beat = 60 / s.bpm, n = Math.ceil(offset / beat - 1e-6);
      this.beatN = n; this.nextBeat = t + (n * beat - offset);
      var self = this;
      this.sched = setInterval(function () { self.schedule(); }, 40);
      this.schedule();
    },
    schedule: function () {
      if (!this.voice || !ctx) return;
      var s = this.song(), beat = 60 / s.bpm, end = this.t0 + (s.lengthSec - this.off) - 0.3;
      while (this.nextBeat < ctx.currentTime + 0.25 && this.nextBeat < end) {
        var t = this.nextBeat, accent = this.beatN % 4 === 0;
        var o = ctx.createOscillator(), gg = ctx.createGain();
        o.type = "sine"; o.frequency.value = this.voice.root * (accent ? 4 : 6);
        gg.gain.setValueAtTime(0.0001, t);
        gg.gain.exponentialRampToValueAtTime(accent ? 0.05 : 0.025, t + 0.012);
        gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
        o.connect(gg); gg.connect(this.voice.lp); o.start(t); o.stop(t + 0.35);
        this.nextBeat += beat; this.beatN++;
      }
    },
    stopVoice: function () {
      clearInterval(this.sched); this.sched = 0;
      var v = this.voice; this.voice = null;
      if (v && ctx) {
        var t = ctx.currentTime;
        try { v.out.gain.cancelScheduledValues(t); v.out.gain.setValueAtTime(v.out.gain.value || 0.5, t); v.out.gain.exponentialRampToValueAtTime(0.0001, t + 0.08); } catch (e) {}
        v.oscs.forEach(function (o) { try { o.stop(t + 0.1); } catch (e) {} });
        setTimeout(function () { try { v.out.disconnect(); } catch (e) {} }, 300);
      }
    },
    pause: function () {
      if (!this.playing) return;
      if (this.usesTone()) { this.off = this.position(); this.stopVoice(); }
      else if (mediaEl) mediaEl.pause();
      this.playing = false; syncButton();
    },
    resume: function () {
      if (this.cur < 0) return;
      if (this.usesTone()) { this.play(this.cur, this.off >= this.duration() - 0.5 ? 0 : this.off); return; }
      unlock(); var p = mediaEl.play(); if (p && p.catch) p.catch(function () {});
      this.playing = true; syncButton();
    },
    toggle: function () { if (this.playing) this.pause(); else this.resume(); },
    seek: function (sec) {
      if (this.cur < 0) return;
      sec = clamp(sec, 0, Math.max(0, this.duration() - 0.25));
      if (this.usesTone()) { if (this.playing) this.play(this.cur, sec); else this.off = sec; }
      else if (mediaEl) { try { mediaEl.currentTime = sec; } catch (e) {} }
    },
    ended: function () {
      this.stopVoice(); this.playing = false; this.off = 0;
      if (mediaEl && !this.usesTone()) { try { mediaEl.currentTime = 0; } catch (e) {} }
      syncButton();
    },
    tick: function () {
      if (this.playing && this.usesTone() && this.position() >= this.duration()) this.ended();
    }
  };

  /* ---------- bar ---------- */
  function showBar() {
    if (!bar.hidden) return;
    bar.hidden = false;
    requestAnimationFrame(function () { bar.classList.add("on"); });
  }
  function syncButton() {
    ppBtn.classList.toggle("playing", player.playing);
    ppBtn.setAttribute("aria-label", player.playing ? "Pause" : "Play");
  }
  function setFill(el) { el.style.setProperty("--p", ((el.value - el.min) / (el.max - el.min) * 100) + "%"); }
  var seeking = false;
  ppBtn.addEventListener("click", function () { player.toggle(); });
  prog.addEventListener("input", function () {
    seeking = true; setFill(prog);
    tCur.textContent = fmt(prog.value / 1000 * player.duration());
  });
  prog.addEventListener("change", function () {
    player.seek(prog.value / 1000 * player.duration()); seeking = false;
  });
  ["pointerup", "touchend"].forEach(function (ev) { prog.addEventListener(ev, function () { setTimeout(function () { seeking = false; }, 50); }); });
  vol.addEventListener("input", function () {
    volV.textContent = vol.value; setFill(vol);
    if (master && ctx) master.gain.setTargetAtTime(volGain(), ctx.currentTime, 0.03);
    if (mediaEl && !mediaNode) mediaEl.volume = vol.value / 100;
  });
  flash.addEventListener("input", function () { flashV.textContent = flash.value; setFill(flash); });
  [prog, vol, flash].forEach(setFill);
  function updateBar() {
    if (player.cur < 0) return;
    var d = player.duration(), p = player.position();
    if (!seeking) { prog.value = d ? Math.round(p / d * 1000) : 0; setFill(prog); tCur.textContent = fmt(p); }
    tLen.textContent = fmt(d);
  }

  /* ---------- era buttons + accessible list ---------- */
  function buildEraButtons() {
    erasEl.innerHTML = "";
    eraInfo.forEach(function (e, k) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = e.name; b.setAttribute("aria-label", "Zoom to " + e.name);
      b.addEventListener("click", function () { zoomToEra(k); });
      erasEl.appendChild(b); e.btn = b;
    });
  }
  function buildSrList() {
    srList.innerHTML = "";
    stars.forEach(function (st) {
      var li = document.createElement("li"), b = document.createElement("button");
      b.type = "button";
      b.textContent = st.song.title + ", " + (ERAS[st.era] ? ERAS[st.era].name : "") + ", " + fmt(st.song.lengthSec) + ". Press once to select, again to play.";
      b.addEventListener("click", function () { tapStar(st.i); });
      li.appendChild(b); srList.appendChild(li);
    });
  }

  /* ---------- pointer input ---------- */
  var pts = new Map();
  var gest = null; // {type:'pan'|'pinch', ...}
  var downInfo = null;

  function hitStar(x, y) {
    var best = -1, bd = Infinity;
    stars.forEach(function (st) {
      var dx = sxOf(st.wx) - x, dy = syOf(st.wy) - y, d = Math.sqrt(dx * dx + dy * dy);
      var lim = Math.max(24, screenR(st) * 3.2);
      if (d < lim && d < bd) { bd = d; best = st.i; }
    });
    return best;
  }

  function startPinch() {
    var a = Array.from(pts.values());
    var d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1;
    var mx = (a[0].x + a[1].x) / 2, my = (a[0].y + a[1].y) / 2;
    gest = { type: "pinch", d0: d, s0: cam.s, wx: wxOf(mx), wy: wyOf(my) };
  }

  canvas.addEventListener("pointerdown", function (e) {
    tween = null;
    try { canvas.setPointerCapture(e.pointerId); } catch (er) {}
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) {
      downInfo = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false, multi: false };
      gest = { type: "pan", lx: e.clientX, ly: e.clientY };
    } else if (pts.size === 2) {
      if (downInfo) downInfo.multi = true;
      startPinch();
    }
  });
  canvas.addEventListener("pointermove", function (e) {
    if (!pts.has(e.pointerId)) {
      if (e.pointerType === "mouse") { hover = hitStar(e.clientX, e.clientY); canvas.classList.toggle("over", hover >= 0); }
      return;
    }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (gest && gest.type === "pan" && pts.size === 1) {
      if (downInfo && !downInfo.moved && Math.hypot(e.clientX - downInfo.x, e.clientY - downInfo.y) > 7) { downInfo.moved = true; canvas.classList.add("drag"); }
      if (downInfo && downInfo.moved) {
        cam.cx -= (e.clientX - gest.lx) / cam.s; cam.cy -= (e.clientY - gest.ly) / cam.s; clampCam();
      }
      gest.lx = e.clientX; gest.ly = e.clientY;
    } else if (gest && gest.type === "pinch" && pts.size >= 2) {
      var a = Array.from(pts.values());
      var d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1;
      var mx = (a[0].x + a[1].x) / 2, my = (a[0].y + a[1].y) / 2;
      cam.s = clamp(gest.s0 * d / gest.d0, minS, maxS);
      cam.cx = gest.wx - (mx - W / 2 - drift.x) / cam.s;
      cam.cy = gest.wy - (my - CY - drift.y) / cam.s;
      clampCam();
    }
  });
  function endPointer(e) {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    canvas.classList.remove("drag");
    if (pts.size === 1) {
      var p = pts.values().next().value; gest = { type: "pan", lx: p.x, ly: p.y };
      if (downInfo) downInfo.moved = true;
      return;
    }
    if (pts.size === 0) {
      if (e.type === "pointerup" && downInfo && !downInfo.moved && !downInfo.multi && performance.now() - downInfo.t < 700) {
        var i = hitStar(e.clientX, e.clientY);
        if (i >= 0) tapStar(i); else select(-1);
      }
      gest = null; downInfo = null;
    }
  }
  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);
  canvas.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { hover = -1; canvas.classList.remove("over"); } });

  canvas.addEventListener("wheel", function (e) {
    e.preventDefault(); tween = null;
    var k = e.ctrlKey ? 0.012 : 0.0016;
    var dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    zoomAt(e.clientX, e.clientY, cam.s * Math.exp(-dy * k));
  }, { passive: false });
  // stop Safari's own page pinch
  ["gesturestart", "gesturechange"].forEach(function (ev) { document.addEventListener(ev, function (e) { e.preventDefault(); }); });
  document.addEventListener("dblclick", function (e) { e.preventDefault(); });

  window.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" && e.target && /INPUT|BUTTON/.test(e.target.tagName)) return;
    if (e.key === " " && player.cur >= 0) { e.preventDefault(); player.toggle(); }
    else if (e.key === "+" || e.key === "=") zoomAt(W / 2, CY, cam.s * 1.25);
    else if (e.key === "-") zoomAt(W / 2, CY, cam.s / 1.25);
    else if (e.key === "Escape") { select(-1); flyTo((bbox.x0 + bbox.x1) / 2, (bbox.y0 + bbox.y1) / 2 + 20, fitS); }
  });

  /* ---------- drawing ---------- */
  function positionLabel() {
    if (sel < 0) return;
    var st = stars[sel], x = sxOf(st.wx), y = syOf(st.wy), r = screenR(st);
    var gap = r * 2.2 + 10, w = labelEl.offsetWidth || 80, left = x + gap + w > W - 10;
    labelEl.classList.toggle("left", left);
    var lx = left ? x - gap - w : x + gap;
    labelEl.style.transform = "translate(" + Math.round(lx) + "px," + Math.round(y - 18) + "px)";
  }

  function draw(now) {
    var t = now / 1000;
    stepTween(now);
    if (RM) { drift.x = 0; drift.y = 0; }
    else {
      drift.x = 16 * Math.sin(t * 6.283 / 74);
      drift.y = 11 * Math.sin(t * 6.283 / 97 + 1.3);
    }
    player.tick();

    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    var grd = g.createRadialGradient(W * 0.5, H * 0.38, 0, W * 0.5, H * 0.45, Math.max(W, H) * 0.85);
    grd.addColorStop(0, "#0a1430"); grd.addColorStop(0.55, "#050a1c"); grd.addColorStop(1, "#02030a");
    g.fillStyle = grd; g.fillRect(0, 0, W, H);

    // far field: parallax with the camera, slow drift; under reduce motion it only fades
    var z = zoomLevel();
    for (var i = 0; i < field.length; i++) {
      var f = field[i];
      var ox = -(cam.cx * cam.s) * f.z + drift.x * (1 + f.z * 4) + (RM ? 0 : t * 1.2 * f.z);
      var oy = -(cam.cy * cam.s) * f.z + drift.y * (1 + f.z * 4);
      var x = ((f.x + ox) % TILE + TILE) % TILE, y = ((f.y + oy) % TILE + TILE) % TILE;
      if (x > W + 2 || y > H + 2) continue;
      var tw = RM ? 0.55 + 0.45 * Math.sin(t * f.sp * 0.6 + f.ph) : 0.75 + 0.25 * Math.sin(t * f.sp + f.ph);
      g.globalAlpha = f.a * tw;
      g.fillStyle = "#e9e3d6";
      g.fillRect(x, y, f.s, f.s);
    }
    g.globalAlpha = 1;

    // constellation lines
    g.lineWidth = 1;
    eraInfo.forEach(function (e, k) {
      if (e.idx.length < 2) return;
      var playingHere = player.cur >= 0 && stars[player.cur].era === k;
      g.strokeStyle = "rgba(243,234,216," + (playingHere ? 0.2 : 0.11) + ")";
      g.beginPath();
      e.idx.forEach(function (si, n) {
        var x = sxOf(stars[si].wx), y = syOf(stars[si].wy);
        if (n === 0) g.moveTo(x, y); else g.lineTo(x, y);
      });
      if (CLOSED[k % CLOSED.length] && e.idx.length > 2) g.closePath();
      g.stroke();
      if (e.btn) {
        e.btn.style.left = Math.round(sxOf(e.lx)) + "px";
        e.btn.style.top = Math.round(syOf(e.ly) + 14 * Math.min(z, 2)) + "px";
      }
    });

    // stars
    var fl = flash.value / 100;
    stars.forEach(function (st) {
      var x = sxOf(st.wx), y = syOf(st.wy), r = screenR(st);
      if (x < -60 || y < -60 || x > W + 60 || y > H + 60) return;
      var isSel = st.i === sel, isPlay = st.i === player.cur && player.playing, isCur = st.i === player.cur;
      var base = isSel ? 1 : st.i === hover ? 0.92 : isCur ? 0.9 : 0.72;
      var pulse = 0;
      if (isPlay) {
        var ph = player.beatPhase();
        pulse = RM ? (0.5 + 0.5 * Math.cos(ph * 6.283)) * fl : Math.exp(-ph * 4.5) * fl;
      }
      var core = RM ? r : r * (1 + 0.4 * pulse);
      var halo = RM ? r * (isSel || isCur ? 4.5 : 3.2) : r * ((isSel || isCur ? 4.5 : 3.2) + 3 * pulse);
      var ha = (isSel ? 0.32 : isCur ? 0.26 : 0.14) + 0.45 * pulse;
      if (!RM && !isPlay) ha *= 0.9 + 0.1 * Math.sin(t * 0.7 + st.i);
      var hg = g.createRadialGradient(x, y, 0, x, y, halo);
      hg.addColorStop(0, "rgba(255,236,200," + ha.toFixed(3) + ")");
      hg.addColorStop(0.35, "rgba(255,226,180," + (ha * 0.35).toFixed(3) + ")");
      hg.addColorStop(1, "rgba(255,220,170,0)");
      g.fillStyle = hg; g.beginPath(); g.arc(x, y, halo, 0, 6.2832); g.fill();
      g.globalAlpha = Math.min(1, base + 0.3 * pulse);
      g.fillStyle = "#fff6e6"; g.beginPath(); g.arc(x, y, core, 0, 6.2832); g.fill();
      g.globalAlpha = 1;
      if (isSel) {
        g.strokeStyle = "rgba(255,240,215,0.35)"; g.lineWidth = 1;
        g.beginPath(); g.arc(x, y, r * 2.2 + 4, 0, 6.2832); g.stroke();
      }
    });

    positionLabel();
    updateBar();
    requestAnimationFrame(draw);
  }

  /* ---------- test hook (read-only) ---------- */
  window.__nl = {
    state: function () {
      return { sel: sel, cur: player.cur, playing: player.playing, pos: player.position(), dur: player.duration(),
        zoom: zoomLevel(), cam: { cx: cam.cx, cy: cam.cy, s: cam.s }, rm: RM, ctx: ctx ? ctx.state : null,
        vol: +vol.value, flash: +flash.value };
    },
    starAt: function (i) { var st = stars[i]; return { x: sxOf(st.wx), y: syOf(st.wy), r: screenR(st) }; }
  };

  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", function () { setTimeout(resize, 200); });
  resize();
  requestAnimationFrame(draw);
})();
