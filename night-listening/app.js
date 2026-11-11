/* Night Listening — sky, gestures, and playback. No network calls. */
(function () {
  var SVG = "http://www.w3.org/2000/svg";

  function fmt(seconds) {
    var s = Math.max(0, Math.round(seconds));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function bounds(list) {
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (var i = 0; i < list.length; i++) {
      minX = Math.min(minX, list[i].x);
      minY = Math.min(minY, list[i].y);
      maxX = Math.max(maxX, list[i].x);
      maxY = Math.max(maxY, list[i].y);
    }
    return {
      minX: minX, minY: minY, maxX: maxX, maxY: maxY,
      cx: (minX + maxX) / 2, cy: (minY + maxY) / 2,
      w: Math.max(40, maxX - minX), h: Math.max(40, maxY - minY)
    };
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function coreSize(length) {
    var t = clamp((length - 163) / (268 - 163), 0, 1);
    return 9 + t * 11;
  }

  function resolveSrc(src) {
    if (!src) return "";
    if (/^(https?:|blob:|data:)/.test(src) || src.charAt(0) === "/") return src;
    var script = document.querySelector('script[src*="app.js"]');
    if (!script) return src;
    return new URL(src, new URL(script.getAttribute("src"), window.location.href)).href;
  }

  window.startNightListening = function (root) {
    if (!root || !window.NIGHT) return { destroy: function () {} };

    var songs = (window.NIGHT.songs || []).map(function (s, i) {
      var era = s.constellation;
      if (typeof era === "number") {
        era = ["", "Glass Hour", "North Water", "Low Lantern"][era] || "Era " + era;
      }
      return {
        id: s.id || "song-" + (i + 1),
        title: s.title || "Untitled",
        constellation: era || "Glass Hour",
        length: s.lengthSeconds != null ? s.lengthSeconds : s.length || 180,
        bpm: s.bpm || 80,
        src: s.audioSrc != null ? s.audioSrc : s.src || "",
        tone: s.tone || 92 + (i % 8) * 16,
        x: s.x,
        y: s.y
      };
    });

    var links = (window.NIGHT.links || []).slice();
    var buckets = {};
    var order = [];
    songs.forEach(function (s) {
      if (!buckets[s.constellation]) {
        buckets[s.constellation] = [];
        order.push(s.constellation);
      }
      buckets[s.constellation].push(s);
    });
    order.forEach(function (name, gi) {
      var list = buckets[name];
      var cx = 460 + (gi % 3) * 420;
      var cy = 400 + Math.floor(gi / 3) * 380;
      list.forEach(function (s, i) {
        if (s.x != null && s.y != null) return;
        var span = Math.max(1, list.length - 1);
        var a = -0.85 + (i / span) * 1.7;
        s.x = cx + Math.cos(a) * 130;
        s.y = cy + Math.sin(a) * 90;
      });
    });
    if (!links.length) {
      order.forEach(function (name) {
        var list = buckets[name];
        for (var i = 0; i < list.length - 1; i++) links.push([list[i].id, list[i + 1].id]);
        if (list.length > 2) links.push([list[list.length - 1].id, list[0].id]);
      });
    }

    var byId = {};
    songs.forEach(function (s) { byId[s.id] = s; });

    var groups = [];
    var groupMap = {};
    songs.forEach(function (s) {
      if (!groupMap[s.constellation]) {
        groupMap[s.constellation] = { name: s.constellation, songs: [] };
        groups.push(groupMap[s.constellation]);
      }
      groupMap[s.constellation].songs.push(s);
    });

    root.innerHTML = "";
    var night = document.createElement("main");
    night.id = "night";
    night.innerHTML =
      '<div class="viewport" id="viewport">' +
      '<div class="world" id="world">' +
      '<svg class="chart" viewBox="0 0 1800 1200" width="1800" height="1200">' +
      '<defs><radialGradient id="mist" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="#cbb892" stop-opacity="0.16"/>' +
      '<stop offset="55%" stop-color="#8ea0c4" stop-opacity="0.05"/>' +
      '<stop offset="100%" stop-color="#8ea0c4" stop-opacity="0"/>' +
      "</radialGradient></defs>" +
      '<ellipse cx="980" cy="640" rx="760" ry="210" fill="url(#mist)" transform="rotate(-16 980 640)"/>' +
      '<g class="dust" id="dust"></g>' +
      '<g id="lines" fill="none" stroke="#f3ead7" stroke-linecap="round" stroke-linejoin="round"></g>' +
      "</svg></div>" +
      '<div class="names" id="names"></div>' +
      '<div class="stars" id="stars"></div>' +
      '<div class="float-label" id="float"><div class="anchor">' +
      '<p class="float-title" id="float-title"></p>' +
      '<p class="float-time" id="float-time"></p></div></div>' +
      '<div class="vignette"></div></div>' +
      '<header class="mark"><p class="eyebrow">Lost Coffee · Mothers Moniker</p><h1>Night Listening</h1></header>' +
      '<button type="button" class="sky-reset" id="sky-reset" hidden>Whole sky</button>' +
      '<p class="hint" id="hint">Tap once to choose. Tap again to listen.</p>' +
      '<footer class="player" id="player" hidden>' +
      '<button type="button" class="play" id="play-btn" aria-label="Play">' +
      '<svg class="icon icon-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 5.4v13.2L18.8 12 8.2 5.4z" fill="currentColor"/></svg>' +
      '<svg class="icon icon-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.3v14H7zM13.7 5H17v14h-3.3z" fill="currentColor"/></svg>' +
      "</button>" +
      '<div class="now"><p class="now-title" id="now-title"></p><p class="now-era" id="now-era"></p></div>' +
      '<div class="scrub"><span class="time" id="elapsed">0:00</span>' +
      '<input id="progress" type="range" min="0" max="1000" value="0" aria-label="Progress"/>' +
      '<span class="time" id="total">0:00</span></div>' +
      '<div class="sliders">' +
      '<label class="slider">Volume<input id="volume" type="range" min="0" max="100" value="72" aria-label="Volume"/></label>' +
      '<label class="slider">Flash<input id="flash" type="range" min="0" max="100" value="70" aria-label="Flash"/></label>' +
      "</div></footer>" +
      '<div class="sr" id="live" aria-live="polite"></div>';
    root.appendChild(night);

    var viewport = night.querySelector("#viewport");
    var world = night.querySelector("#world");
    var dust = night.querySelector("#dust");
    var linesG = night.querySelector("#lines");
    var starsEl = night.querySelector("#stars");
    var namesEl = night.querySelector("#names");
    var floatEl = night.querySelector("#float");
    var floatTitle = night.querySelector("#float-title");
    var floatTime = night.querySelector("#float-time");
    var hint = night.querySelector("#hint");
    var skyReset = night.querySelector("#sky-reset");
    var player = night.querySelector("#player");
    var playBtn = night.querySelector("#play-btn");
    var nowTitle = night.querySelector("#now-title");
    var nowEra = night.querySelector("#now-era");
    var elapsedEl = night.querySelector("#elapsed");
    var totalEl = night.querySelector("#total");
    var progress = night.querySelector("#progress");
    var volumeInput = night.querySelector("#volume");
    var flashInput = night.querySelector("#flash");
    var live = night.querySelector("#live");

    var rand = mulberry32(20261110);
    for (var i = 0; i < 150; i++) {
      var c = document.createElementNS(SVG, "circle");
      c.setAttribute("cx", String(40 + rand() * 1720));
      c.setAttribute("cy", String(30 + rand() * 1140));
      var roll = rand();
      c.setAttribute("r", roll > 0.97 ? "1.7" : roll > 0.82 ? "1.1" : "0.55");
      c.setAttribute("fill", roll > 0.9 ? "#e4c48a" : "#f3ead7");
      c.setAttribute("opacity", String(0.18 + rand() * 0.55));
      dust.appendChild(c);
    }

    var lineEls = links.map(function (pair) {
      var line = document.createElementNS(SVG, "line");
      line.setAttribute("stroke-opacity", "0.42");
      linesG.appendChild(line);
      return { el: line, a: pair[0], b: pair[1] };
    });

    var starEls = {};
    var screenPos = {};
    songs.forEach(function (song) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "star";
      btn.dataset.id = song.id;
      btn.style.setProperty("--d", coreSize(song.length) + "px");
      btn.setAttribute("aria-label", song.title + ", " + fmt(song.length) + ", " + song.constellation);
      btn.setAttribute("aria-pressed", "false");
      var core = document.createElement("span");
      core.className = "core";
      btn.appendChild(core);
      starsEl.appendChild(btn);
      starEls[song.id] = btn;
      btn.addEventListener("click", function () { onStar(song); });
    });

    var nameEls = {};
    groups.forEach(function (g) {
      var p = document.createElement("p");
      p.className = "era";
      p.textContent = g.name;
      namesEl.appendChild(p);
      nameEls[g.name] = p;
    });

    var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    var reduced = mq.matches;
    var cam = { x: 900, y: 620, scale: 0.4 };
    var anchor = { x: 900, y: 620, scale: 0.4 };
    var mode = "sky";
    var anim = null;
    var vw = 1, vh = 1;
    var selectedId = null;
    var active = null;
    var playing = false;
    var pausedAt = 0;
    var shown = false;
    var volume = 0.72;
    var flash = 0.7;
    var scrubbing = false;
    var ctx = null;
    var master = null;
    var tone = null;
    var file = null;
    var fileMode = false;
    var raf = 0;
    var dead = false;
    var pointers = new Map();
    var pan = null;
    var pinch = null;
    var ignoreUntilUp = false;
    var wheelAcc = 0;
    var wheelTimer = 0;
    var t0 = performance.now();

    function say(text) { live.textContent = text; }

    function measure() {
      vw = viewport.clientWidth || window.innerWidth;
      vh = viewport.clientHeight || window.innerHeight;
    }

    function frameFor(list, pad) {
      measure();
      var b = bounds(list);
      var availW = Math.max(180, vw - 32);
      var availH = Math.max(180, vh - 168);
      var scale = Math.min(availW / (b.w + pad * 2), availH / (b.h + pad * 2));
      return { x: b.cx, y: b.cy, scale: clamp(scale, 0.22, 1.85) };
    }

    function skyFrame() { return frameFor(songs, 110); }
    function groupFrame(name) { return frameFor(groupMap[name].songs, 130); }
    function canonical() { return mode === "sky" ? skyFrame() : groupFrame(mode); }

    function prime() {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!ctx) {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = volume;
        master.connect(ctx.destination);
      }
      if (ctx.state !== "running") ctx.resume();
    }

    function clock() {
      if (fileMode && file && !file.paused) return file.currentTime || 0;
      if (!playing) return pausedAt;
      if (!tone) return pausedAt;
      return (performance.now() - tone.wallStart) / 1000;
    }

    function duration() {
      if (fileMode && file && isFinite(file.duration) && file.duration > 0) return file.duration;
      return active ? active.length : 0;
    }

    function stopTone() {
      if (!tone || !ctx) { tone = null; return; }
      var now = ctx.currentTime;
      try {
        tone.gain.gain.cancelScheduledValues(now);
        tone.gain.gain.setValueAtTime(Math.max(0.0001, tone.gain.gain.value), now);
        tone.gain.gain.linearRampToValueAtTime(0, now + 0.12);
        tone.oscs.forEach(function (o) { o.stop(now + 0.16); });
      } catch (err) {}
      tone = null;
    }

    function stopFile() {
      if (!file) return;
      file.pause();
      file.removeAttribute("src");
      file.load();
      file = null;
      fileMode = false;
    }

    function startTone(song, offset) {
      if (!ctx || !master) return;
      stopTone();
      var now = ctx.currentTime;
      var g = ctx.createGain();
      var loud = Math.min(0.24, 16 / song.tone);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(loud, now + 0.35);
      var filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 880;
      g.connect(filter);
      filter.connect(master);
      var partials = [
        { f: song.tone, type: "sine", v: 0.75 },
        { f: song.tone * 1.4983, type: "sine", v: 0.22 },
        { f: song.tone * 2, type: "triangle", v: 0.07 }
      ];
      var oscs = partials.map(function (p) {
        var o = ctx.createOscillator();
        o.type = p.type;
        o.frequency.value = p.f;
        var og = ctx.createGain();
        og.gain.value = p.v;
        o.connect(og);
        og.connect(g);
        o.start(now);
        return o;
      });
      var lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07;
      var lg = ctx.createGain();
      lg.gain.value = 6;
      lfo.connect(lg);
      lg.connect(oscs[1].detune);
      lfo.start(now);
      oscs.push(lfo);
      tone = { gain: g, oscs: oscs, wallStart: performance.now() - offset * 1000 };
    }

    function tryFile(song, offset) {
      var url = resolveSrc(song.src);
      if (!url) return;
      var el = new Audio();
      el.preload = "auto";
      el.volume = volume;
      el.setAttribute("playsinline", "");
      var settled = false;
      var giveUp = function () {
        if (settled || dead) return;
        settled = true;
        if (file === el) {
          stopFile();
          if (playing && active === song) startTone(song, clock());
        }
      };
      el.addEventListener("error", giveUp);
      el.addEventListener("canplay", function () {
        if (settled || dead || active !== song) return;
        settled = true;
        stopTone();
        try { el.currentTime = Math.min(offset, Math.max(0, (el.duration || song.length) - 0.05)); } catch (err) {}
        el.play().then(function () {
          if (dead || active !== song) { el.pause(); return; }
          file = el;
          fileMode = true;
          pausedAt = offset;
        }).catch(giveUp);
      }, { once: true });
      el.src = url;
      window.setTimeout(function () {
        if (!settled && el.readyState < 2) giveUp();
      }, 1400);
    }

    function showPlayer(song) {
      nowTitle.textContent = song.title;
      nowEra.textContent = song.constellation;
      totalEl.textContent = fmt(duration() || song.length);
      if (!shown) {
        player.hidden = false;
        requestAnimationFrame(function () { player.classList.add("is-on"); });
        shown = true;
      }
    }

    function paintTransport() {
      playBtn.classList.toggle("is-on", playing);
      playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
      night.dataset.playing = playing && active ? active.id : "";
      night.dataset.selected = selectedId || "";
      night.dataset.mode = mode;
    }

    function playSong(song, offset) {
      prime();
      stopFile();
      active = song;
      selectedId = song.id;
      pausedAt = offset || 0;
      playing = true;
      hint.classList.add("is-gone");
      startTone(song, pausedAt);
      if (song.src) tryFile(song, pausedAt);
      showPlayer(song);
      paintTransport();
      say("Playing " + song.title);
    }

    function pause() {
      if (!active) return;
      pausedAt = clamp(clock(), 0, duration() || active.length);
      playing = false;
      if (file) file.pause();
      stopTone();
      paintTransport();
      say("Paused");
    }

    function resume() {
      if (!active) return;
      playSong(active, pausedAt);
    }

    function onStar(song) {
      prime();
      if (selectedId !== song.id) {
        selectedId = song.id;
        hint.classList.add("is-gone");
        floatTitle.textContent = song.title;
        floatTime.textContent = fmt(song.length);
        say(song.title + ", " + fmt(song.length));
        paintTransport();
        return;
      }
      if (active === song && playing) { pause(); return; }
      if (active === song && !playing) { resume(); return; }
      playSong(song, 0);
    }

    function seekTo(t) {
      if (!active) return;
      var d = duration() || active.length;
      t = clamp(t, 0, d);
      pausedAt = t;
      if (fileMode && file) {
        try { file.currentTime = t; } catch (err) {}
      }
      if (tone) tone.wallStart = performance.now() - t * 1000;
    }

    function layout(now) {
      var time = ((now || performance.now()) - t0) / 1000;
      var driftX = reduced ? 0 : Math.sin(time * 0.045) * 18;
      var driftY = reduced ? 0 : Math.cos(time * 0.033) * 12;
      var tx = vw / 2 - cam.x * cam.scale + driftX;
      var ty = vh / 2 - cam.y * cam.scale + driftY;
      world.style.transform = "translate3d(" + tx + "px," + ty + "px,0) scale(" + cam.scale + ")";
      linesG.setAttribute("stroke-width", String(1.15 / cam.scale));
      lineEls.forEach(function (ln) {
        var a = byId[ln.a], b = byId[ln.b];
        if (!a || !b) return;
        ln.el.setAttribute("x1", a.x);
        ln.el.setAttribute("y1", a.y);
        ln.el.setAttribute("x2", b.x);
        ln.el.setAttribute("y2", b.y);
      });
      songs.forEach(function (song) {
        var sx = song.x * cam.scale + tx;
        var sy = song.y * cam.scale + ty;
        screenPos[song.id] = { x: sx, y: sy };
        var btn = starEls[song.id];
        btn.style.transform = "translate3d(" + sx + "px," + sy + "px,0) translate(-50%,-50%)";
        var core = btn.firstChild;
        var on = active === song && playing;
        btn.classList.toggle("is-selected", selectedId === song.id);
        btn.classList.toggle("is-playing", on);
        btn.setAttribute("aria-pressed", selectedId === song.id ? "true" : "false");
        if (on) {
          var beat = 60 / song.bpm;
          var phase = (clock() % beat) / beat;
          var env = Math.exp(-phase * 5.5);
          var amp = env * flash;
          if (reduced) {
            core.style.transform = "none";
            core.style.opacity = String(0.38 + 0.62 * amp);
          } else {
            core.style.opacity = "";
            core.style.transform = "scale(" + (1 + amp * 0.85) + ")";
          }
        } else {
          core.style.transform = "";
          core.style.opacity = "";
        }
      });
      night.classList.toggle("has-selection", !!selectedId);
      groups.forEach(function (g) {
        var b = bounds(g.songs);
        var nx = b.cx * cam.scale + tx;
        var ny = b.minY * cam.scale + ty - 18;
        var el = nameEls[g.name];
        el.style.transform = "translate3d(" + nx + "px," + ny + "px,0) translate(-50%,-100%)";
      });
      if (selectedId && screenPos[selectedId]) {
        var p = screenPos[selectedId];
        floatEl.style.transform = "translate3d(" + p.x + "px," + p.y + "px,0)";
        floatEl.classList.toggle("flip", p.x > vw * 0.58);
        floatEl.classList.add("on");
      } else {
        floatEl.classList.remove("on");
      }
      if (active) {
        var d = duration() || active.length;
        var t = clamp(clock(), 0, d);
        if (playing && t >= d - 0.04) {
          pausedAt = d;
          playing = false;
          if (file) file.pause();
          stopTone();
          paintTransport();
          t = d;
        }
        if (!scrubbing) {
          progress.value = String(d ? Math.round((t / d) * 1000) : 0);
          progress.style.setProperty("--p", (d ? (t / d) * 100 : 0) + "%");
          elapsedEl.textContent = fmt(t);
          totalEl.textContent = fmt(d);
        }
      }
    }

    function tick(now) {
      if (dead) return;
      if (anim) {
        var u = (now - anim.t0) / anim.ms;
        if (u >= 1 || anim.ms <= 0) {
          cam.x = anim.to.x;
          cam.y = anim.to.y;
          cam.scale = anim.to.scale;
          anchor = { x: cam.x, y: cam.y, scale: cam.scale };
          anim = null;
        } else {
          var e = ease(u);
          cam.x = anim.from.x + (anim.to.x - anim.from.x) * e;
          cam.y = anim.from.y + (anim.to.y - anim.from.y) * e;
          cam.scale = anim.from.scale + (anim.to.scale - anim.from.scale) * e;
        }
      }
      layout(now);
      raf = requestAnimationFrame(tick);
    }

    function go(next, nextMode) {
      anim = {
        from: { x: cam.x, y: cam.y, scale: cam.scale },
        to: next,
        t0: performance.now(),
        ms: reduced ? 0 : 720
      };
      mode = nextMode;
      night.dataset.mode = mode;
      skyReset.hidden = mode === "sky";
    }

    function zoomIn(sx, sy) {
      if (mode !== "sky" || anim) return;
      var wx = cam.x + (sx - vw / 2) / cam.scale;
      var wy = cam.y + (sy - vh / 2) / cam.scale;
      var best = groups[0];
      var bestD = Infinity;
      groups.forEach(function (g) {
        var b = bounds(g.songs);
        var d = Math.hypot(b.cx - wx, b.cy - wy);
        if (d < bestD) { best = g; bestD = d; }
      });
      go(groupFrame(best.name), best.name);
    }

    function zoomOut() {
      if (mode === "sky" || anim) return;
      go(skyFrame(), "sky");
    }

    function clampPan() {
      var maxX = (vw * 0.34) / cam.scale;
      var maxY = (vh * 0.34) / cam.scale;
      cam.x = clamp(cam.x, anchor.x - maxX, anchor.x + maxX);
      cam.y = clamp(cam.y, anchor.y - maxY, anchor.y + maxY);
    }

    function localPoint(e) {
      var rect = viewport.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function hit(sx, sy) {
      var best = null;
      var bestD = 26;
      songs.forEach(function (song) {
        var p = screenPos[song.id];
        if (!p) return;
        var d = Math.hypot(p.x - sx, p.y - sy);
        if (d < bestD) { best = song; bestD = d; }
      });
      return best;
    }

    function onDown(e) {
      if (e.target.closest && e.target.closest(".player, .sky-reset")) return;
      viewport.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      anim = null;
      if (pointers.size === 1) {
        ignoreUntilUp = false;
        pan = { x: e.clientX, y: e.clientY, camX: cam.x, camY: cam.y, moved: false };
        pinch = null;
      } else if (pointers.size === 2) {
        pan = null;
        var pts = Array.from(pointers.values());
        pinch = {
          dist: Math.max(8, Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)),
          scale: cam.scale,
          camX: cam.x,
          camY: cam.y,
          cx: (pts[0].x + pts[1].x) / 2,
          cy: (pts[0].y + pts[1].y) / 2
        };
      }
    }

    function onMove(e) {
      if (!pointers.has(e.pointerId) || ignoreUntilUp) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size >= 2 && pinch) {
        var pts = Array.from(pointers.values());
        var dist = Math.max(8, Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y));
        var ratio = dist / pinch.dist;
        var next = clamp(pinch.scale * ratio, 0.18, 2.4);
        var rect = viewport.getBoundingClientRect();
        var sx = pinch.cx - rect.left;
        var sy = pinch.cy - rect.top;
        var wx = pinch.camX + (sx - rect.width / 2) / pinch.scale;
        var wy = pinch.camY + (sy - rect.height / 2) / pinch.scale;
        cam.scale = next;
        cam.x = wx - (sx - vw / 2) / next;
        cam.y = wy - (sy - vh / 2) / next;
        var mx = (pts[0].x + pts[1].x) / 2;
        var my = (pts[0].y + pts[1].y) / 2;
        cam.x -= (mx - pinch.cx) / next;
        cam.y -= (my - pinch.cy) / next;
        viewport.classList.add("is-dragging");
        return;
      }
      if (!pan || pointers.size !== 1) return;
      var dx = e.clientX - pan.x;
      var dy = e.clientY - pan.y;
      if (Math.hypot(dx, dy) > 8) {
        pan.moved = true;
        viewport.classList.add("is-dragging");
      }
      cam.x = pan.camX - dx / cam.scale;
      cam.y = pan.camY - dy / cam.scale;
      clampPan();
    }

    function onUp(e) {
      var wasPinch = pointers.size >= 2;
      pointers.delete(e.pointerId);
      if (wasPinch && pointers.size < 2 && pinch) {
        var ratio = cam.scale / pinch.scale;
        var rect = viewport.getBoundingClientRect();
        var sx = pinch.cx - rect.left;
        var sy = pinch.cy - rect.top;
        pinch = null;
        pan = null;
        ignoreUntilUp = pointers.size > 0;
        viewport.classList.remove("is-dragging");
        if (ratio > 1.12 && mode === "sky") zoomIn(sx, sy);
        else if (ratio < 0.88 && mode !== "sky") zoomOut();
        else go(canonical(), mode);
        return;
      }
      if (pan && !pan.moved && pointers.size === 0 && !ignoreUntilUp) {
        var pt = localPoint(e);
        var song = hit(pt.x, pt.y);
        if (song) onStar(song);
      }
      if (pointers.size === 0) {
        pan = null;
        ignoreUntilUp = false;
        viewport.classList.remove("is-dragging");
      }
    }

    function onWheel(e) {
      if (e.target.closest && e.target.closest(".player, .sky-reset")) return;
      e.preventDefault();
      if (anim) return;
      wheelAcc += e.deltaY;
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(function () { wheelAcc = 0; }, 200);
      var pt = localPoint(e);
      if (wheelAcc < -70) { wheelAcc = 0; zoomIn(pt.x, pt.y); }
      else if (wheelAcc > 70) { wheelAcc = 0; zoomOut(); }
    }

    function onMotion() { reduced = mq.matches; }

    function onResize() {
      if (anim) return;
      var next = canonical();
      cam = { x: next.x, y: next.y, scale: next.scale };
      anchor = { x: next.x, y: next.y, scale: next.scale };
      measure();
    }

    volumeInput.addEventListener("input", function () {
      volume = Number(volumeInput.value) / 100;
      volumeInput.style.setProperty("--p", volumeInput.value + "%");
      if (master) master.gain.value = volume;
      if (file) file.volume = volume;
    });
    flashInput.addEventListener("input", function () {
      flash = Number(flashInput.value) / 100;
      flashInput.style.setProperty("--p", flashInput.value + "%");
    });
    volumeInput.style.setProperty("--p", "72%");
    flashInput.style.setProperty("--p", "70%");

    progress.addEventListener("pointerdown", function () { scrubbing = true; });
    progress.addEventListener("pointerup", function () { scrubbing = false; });
    progress.addEventListener("pointercancel", function () { scrubbing = false; });
    progress.addEventListener("input", function () {
      if (!active) return;
      var d = duration() || active.length;
      var t = (Number(progress.value) / 1000) * d;
      progress.style.setProperty("--p", progress.value / 10 + "%");
      elapsedEl.textContent = fmt(t);
      seekTo(t);
    });
    playBtn.addEventListener("click", function () {
      prime();
      if (!active) return;
      if (playing) pause();
      else resume();
    });
    skyReset.addEventListener("click", function () { zoomOut(); });

    viewport.addEventListener("pointerdown", onDown);
    viewport.addEventListener("pointermove", onMove);
    viewport.addEventListener("pointerup", onUp);
    viewport.addEventListener("pointercancel", onUp);
    viewport.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);
    if (mq.addEventListener) mq.addEventListener("change", onMotion);

    measure();
    var home = skyFrame();
    cam = { x: home.x, y: home.y, scale: home.scale };
    anchor = { x: home.x, y: home.y, scale: home.scale };
    layout(performance.now());
    raf = requestAnimationFrame(tick);

    return {
      destroy: function () {
        dead = true;
        cancelAnimationFrame(raf);
        window.clearTimeout(wheelTimer);
        viewport.removeEventListener("pointerdown", onDown);
        viewport.removeEventListener("pointermove", onMove);
        viewport.removeEventListener("pointerup", onUp);
        viewport.removeEventListener("pointercancel", onUp);
        viewport.removeEventListener("wheel", onWheel);
        window.removeEventListener("resize", onResize);
        if (mq.removeEventListener) mq.removeEventListener("change", onMotion);
        stopFile();
        stopTone();
        if (ctx) { ctx.close(); ctx = null; }
        root.innerHTML = "";
      }
    };
  };
})();
