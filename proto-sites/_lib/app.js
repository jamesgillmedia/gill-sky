/* Shared continuous-zoom shell for proto-sites.
   Density: sparse far → dense at snap → one thing.
   Categories keep own forms. Mark → list · contact · tune. */
(function () {
  'use strict';

  var MEDIA = '../../u4-opus-m4/';
  var DATA_URL = '../_lib/data.json';
  var DIR = document.documentElement.getAttribute('data-dir') || 'ember';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var data = null;
  var board = null;
  var wave = null;
  var rooms = null;
  var markMode = 'full'; // full on opener → partial mid-journey
  var journey = 0; // 0 opener, 1 mid, 2 deep
  var filmOpen = null;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function paintMark() {
    var cv = $('#markCv');
    if (!cv || !window.GSMark) return;
    var dpr = Math.min(2, devicePixelRatio || 1);
    var W = cv.clientWidth || innerWidth, H = cv.clientHeight || innerHeight;
    cv.width = Math.floor(W * dpr); cv.height = Math.floor(H * dpr);
    var g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    var mode = journey === 0 ? 'full' : (journey === 1 ? 'partial' : 'partial');
    var scale = Math.min(W, H) / (journey === 0 ? 520 : 680);
    var rgb = getComputedStyle(document.documentElement).getPropertyValue('--mark-rgb').trim() || '238,243,245';
    GSMark.draw(g, {
      mode: mode,
      scale: scale,
      x: W * 0.5,
      y: H * (DIR === 'plumb' ? 0.36 : 0.42),
      rgb: rgb,
      lineW: DIR === 'chart' ? 0.95 : 1.2
    });
    markMode = mode;
  }

  function setJourney(j) {
    journey = Math.max(0, Math.min(2, j | 0));
    document.documentElement.setAttribute('data-journey', String(journey));
    paintMark();
    var hint = $('#hint');
    if (hint) {
      if (journey === 0) hint.innerHTML = '<b>pinch in</b> · wheel to dive';
      else if (journey === 1) hint.innerHTML = '<b>keep going</b> · film snaps to board';
      else hint.innerHTML = showBoardCountsHint();
    }
  }

  function showBoardCountsHint() {
    return '<b>film board</b> · tap a work · double-click steps out';
  }

  function openPanel(id) {
    $all('.panel').forEach(function (p) { p.classList.toggle('on', p.id === id); });
  }
  function closePanels() {
    $all('.panel').forEach(function (p) { p.classList.remove('on'); });
  }

  function openMarkMenu(on) {
    var m = $('#markMenu');
    if (!m) return;
    m.classList.toggle('on', on !== false ? !m.classList.contains('on') : false);
    if (on === false) m.classList.remove('on');
  }

  /* —— Film player (primary path from board/menu) —— */
  function openFilmPlayer(film) {
    filmOpen = film;
    var player = $('#player');
    if (!player) return;
    player.classList.add('on');
    $('#playerTitle').textContent = film.title;
    var role = $('#playerRole');
    role.textContent = film.role || '';
    role.hidden = !film.role;
    var meta = $('#playerMeta');
    meta.textContent = film.meta || '';
    var frame = $('#playerFrame');
    frame.innerHTML = '';
    // Prefer native reel when this is reel-2026; otherwise still. No YouTube/Vimeo.
    var vidSrc = null;
    if (film.slug === 'reel-2026' || film.slug === 'demo-reel') {
      vidSrc = MEDIA + 'media/v3/media/reel/reel-v7-720.mp4';
    }
    if (vidSrc) {
      var v = document.createElement('video');
      v.controls = true; v.playsInline = true; v.preload = 'metadata';
      v.poster = MEDIA + (film.big || film.thumb);
      v.src = vidSrc;
      frame.appendChild(v);
      v.play().catch(function () {});
    } else {
      var img = document.createElement('img');
      img.alt = '';
      img.src = MEDIA + (film.big || film.thumb);
      frame.appendChild(img);
    }
  }

  function closeFilmPlayer() {
    var frame = $('#playerFrame');
    if (frame) {
      $all('video', frame).forEach(function (v) { try { v.pause(); } catch (e) {} });
      frame.innerHTML = '';
    }
    $('#player').classList.remove('on');
    filmOpen = null;
  }

  /* —— Photo B: dark night sky, no shelf, no grade —— */
  function buildPhoto() {
    var grid = $('#photoGrid');
    if (!grid || !data) return;
    grid.innerHTML = '';
    data.photos.forEach(function (p) {
      var fig = document.createElement('figure');
      var img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = p.title === 'untitled' ? '' : p.title;
      img.width = p.w; img.height = p.h;
      img.src = MEDIA + p.thumb;
      fig.appendChild(img);
      grid.appendChild(fig);
    });
  }

  /* —— Objects: rings (category-own form) —— */
  function buildObjects() {
    var host = $('#objectsView');
    if (!host || !data) return;
    host.innerHTML = '';
    var cv = document.createElement('canvas');
    cv.className = 'objects-cv';
    host.appendChild(cv);
    var list = document.createElement('ul');
    list.className = 'objects-list';
    data.objects.forEach(function (o) {
      var li = document.createElement('li');
      li.textContent = o.title;
      list.appendChild(li);
    });
    host.appendChild(list);

    function paint() {
      var dpr = Math.min(2, devicePixelRatio || 1);
      var W = host.clientWidth || innerWidth, H = Math.max(280, host.clientHeight || 360);
      cv.width = Math.floor(W * dpr); cv.height = Math.floor(H * dpr);
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      var g = cv.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      var cx = W / 2, cy = H * 0.42;
      var n = data.objects.length;
      var rgb = getComputedStyle(document.documentElement).getPropertyValue('--obj-rgb').trim() || '255,236,205';
      for (var i = 0; i < n; i++) {
        var r = 36 + i * Math.min(28, (Math.min(W, H) * 0.28) / n);
        g.beginPath();
        g.strokeStyle = 'rgba(' + rgb + ',' + (0.18 + (i / n) * 0.45) + ')';
        g.lineWidth = 1 + (i === n - 1 ? 0.6 : 0);
        // asymmetric arcs, not full orbit rings as a layout of items
        var a0 = -Math.PI * 0.75 + i * 0.11;
        var a1 = a0 + Math.PI * 1.35;
        g.arc(cx, cy, r, a0, a1);
        g.stroke();
        var o = data.objects[i];
        var im = new Image();
        im.src = MEDIA + o.thumb;
        (function (img, ang, rr, idx) {
          img.onload = function () {
            var x = cx + Math.cos(ang) * rr;
            var y = cy + Math.sin(ang) * rr;
            var s = 28 + (idx % 3) * 6;
            g.save();
            g.beginPath(); g.arc(x, y, s / 2, 0, Math.PI * 2); g.clip();
            g.drawImage(img, x - s / 2, y - s / 2, s, s);
            g.restore();
          };
        })(im, a0 + 0.2 + i * 0.33, r, i);
      }
    }
    paint();
    addEventListener('resize', paint);
  }

  /* —— Spaces: Spirit Eye light/dial —— */
  function buildSpaces() {
    var host = $('#spacesView');
    if (!host || !data) return;
    host.innerHTML = '';
    var dial = document.createElement('div');
    dial.className = 'spaces-dial';
    var light = document.createElement('div');
    light.className = 'spaces-light';
    dial.appendChild(light);
    var knob = document.createElement('input');
    knob.type = 'range'; knob.min = '0'; knob.max = '100'; knob.value = '42';
    knob.className = 'spaces-knob';
    knob.setAttribute('aria-label', 'Spirit Eye light');
    var label = document.createElement('p');
    label.className = 'spaces-lab';
    function sync() {
      var v = parseInt(knob.value, 10) / 100;
      light.style.setProperty('--glow', String(0.2 + v * 0.8));
      light.style.setProperty('--spread', (40 + v * 80) + '%');
      var sp = data.spaces[Math.min(data.spaces.length - 1, Math.floor(v * data.spaces.length))] || data.spaces[0];
      label.textContent = sp ? sp.title : '';
      if (sp && sp.thumb) {
        light.style.backgroundImage = 'radial-gradient(circle at 50% 45%, rgba(255,248,230,var(--glow)), transparent var(--spread)), url(' + MEDIA + sp.thumb + ')';
      }
    }
    knob.addEventListener('input', sync);
    host.appendChild(dial);
    host.appendChild(knob);
    host.appendChild(label);
    var ul = document.createElement('ul');
    ul.className = 'spaces-list';
    data.spaces.forEach(function (s) {
      var li = document.createElement('li');
      li.textContent = s.title + (s.meta ? ' · ' + s.meta : '');
      ul.appendChild(li);
    });
    host.appendChild(ul);
    sync();
  }

  /* —— About: calculator form —— */
  function buildAbout() {
    var host = $('#aboutView');
    if (!host || !data) return;
    host.innerHTML = '';
    var calc = document.createElement('div');
    calc.className = 'about-calc';
    var display = document.createElement('div');
    display.className = 'about-display';
    display.textContent = 'ᑕᐣᓯ';
    calc.appendChild(display);
    var keys = ['bio', 'list', 'mail', 'poem'];
    var pad = document.createElement('div');
    pad.className = 'about-pad';
    keys.forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = k;
      b.addEventListener('click', function () {
        if (k === 'bio') {
          display.textContent = (data.poem && data.poem[0]) || 'Gill';
          openPanel('panelAboutBody');
        } else if (k === 'list') openPanel('panelList');
        else if (k === 'mail') location.href = 'mailto:' + (data.email || 'imjamesgill@gmail.com');
        else if (k === 'poem') {
          display.textContent = (data.poem || []).slice(0, 3).join(' · ');
        }
      });
      pad.appendChild(b);
    });
    calc.appendChild(pad);
    host.appendChild(calc);
    var body = $('#aboutBody');
    if (body && data.poem) {
      body.innerHTML = data.poem.map(function (line) {
        return '<p>' + line.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</p>';
      }).join('');
    }
  }

  /* —— Tile-by-tile explore (NOT primary menu path) —— */
  function openExplore() {
    var ex = $('#explore');
    if (!ex || !data) return;
    ex.classList.add('on');
    var host = $('#exploreTiles');
    host.innerHTML = '';
    var picks = data.films.slice(0, 12);
    var cols = innerWidth < 520 ? 2 : 3;
    picks.forEach(function (f, i) {
      var t = document.createElement('button');
      t.type = 'button';
      t.className = 'tile';
      t.style.width = (100 / cols) + '%';
      t.style.height = (100 / Math.ceil(picks.length / cols)) + '%';
      t.style.left = ((i % cols) * (100 / cols)) + '%';
      t.style.top = (((i / cols) | 0) * (100 / Math.ceil(picks.length / cols))) + '%';
      var img = document.createElement('img');
      img.alt = ''; img.src = MEDIA + f.thumb;
      t.appendChild(img);
      t.addEventListener('click', function () {
        ex.classList.remove('on');
        openFilmPlayer(f);
      });
      host.appendChild(t);
      var delay = reduced ? 0 : 80 + i * 70;
      setTimeout(function () { t.classList.add('on'); }, delay);
    });
  }

  function buildList() {
    var host = $('#listLinks');
    if (!host || !data) return;
    host.innerHTML = '';
    var items = [
      { label: 'Film', sub: data.films.length + ' works', go: function () { closePanels(); if (board) board.setLevel(2); setJourney(2); } },
      { label: 'Photo', sub: data.photos.length + ' photographs', go: function () { closePanels(); $('#photoView').classList.add('on'); } },
      { label: 'Sound', sub: data.tracks.length + ' tracks', go: function () { closePanels(); $('#soundDock').scrollIntoView({ block: 'nearest' }); } },
      { label: 'Objects', sub: data.objects.length + ' pieces', go: function () { closePanels(); openPanel('panelObjects'); } },
      { label: 'Spaces', sub: data.spaces.length + '', go: function () { closePanels(); openPanel('panelSpaces'); } },
      { label: 'About', sub: '', go: function () { closePanels(); openPanel('panelAbout'); } },
      { label: 'Explore tiles', sub: 'from elsewhere', go: function () { closePanels(); openExplore(); } }
    ];
    items.forEach(function (it) {
      var a = document.createElement('a');
      a.href = '#';
      a.innerHTML = '<b></b><span></span>';
      a.querySelector('b').textContent = it.label;
      a.querySelector('span').textContent = it.sub;
      a.addEventListener('click', function (e) { e.preventDefault(); it.go(); openMarkMenu(false); });
      host.appendChild(a);
    });
  }

  function applyRooms(state) {
    rooms = state || (window.GSTune && GSTune.load()) || {};
    document.documentElement.style.setProperty('--room-film', rooms.film || 0.7);
    document.documentElement.style.setProperty('--room-sound', rooms.sound || 0.65);
    document.documentElement.style.setProperty('--room-objects', rooms.objects || 0.58);
    document.documentElement.style.setProperty('--room-spaces', rooms.spaces || 0.55);
    document.documentElement.style.setProperty('--room-photo', rooms.photo || 0.7);
    var dock = $('#soundDock');
    if (dock) dock.style.opacity = String(0.35 + (rooms.sound || 0.65) * 0.65);
  }

  function wire() {
    $('#markHit').addEventListener('click', function (e) {
      e.stopPropagation();
      openMarkMenu();
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#markMenu') && !e.target.closest('#markHit')) openMarkMenu(false);
    });
    $('#btnList').addEventListener('click', function () { openMarkMenu(false); openPanel('panelList'); });
    $('#btnContact').addEventListener('click', function () { openMarkMenu(false); openPanel('panelContact'); });
    $('#btnTune').addEventListener('click', function () { openMarkMenu(false); openPanel('panelTune'); });
    $all('.panel .close').forEach(function (b) {
      b.addEventListener('click', closePanels);
    });
    $('#playerBack').addEventListener('click', closeFilmPlayer);
    $('#photoClose').addEventListener('click', function () { $('#photoView').classList.remove('on'); });
    $('#exploreClose').addEventListener('click', function () { $('#explore').classList.remove('on'); });
    $('#doorExplore').addEventListener('click', openExplore);
    // Menu path: Film goes straight to board→player, not tile reveal
    $('#navFilm').addEventListener('click', function (e) {
      e.preventDefault();
      closePanels();
      if (board) board.setLevel(2);
      setJourney(2);
    });
    $('#navPhoto').addEventListener('click', function (e) {
      e.preventDefault();
      $('#photoView').classList.add('on');
    });
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if ($('#player').classList.contains('on')) closeFilmPlayer();
        else if ($('#explore').classList.contains('on')) $('#explore').classList.remove('on');
        else if ($('#photoView').classList.contains('on')) $('#photoView').classList.remove('on');
        else closePanels();
      }
    });
    addEventListener('resize', paintMark);
  }

  function boot(json) {
    data = json;
    document.getElementById('contactMail').href = 'mailto:' + (data.email || 'imjamesgill@gmail.com');
    document.getElementById('contactMail').textContent = data.email || 'imjamesgill@gmail.com';
    buildList();
    buildPhoto();
    buildObjects();
    buildSpaces();
    buildAbout();
    wire();
    applyRooms(GSTune.load());
    GSTune.mount($('#tuneMount'), applyRooms);

    wave = GSWave.mount($('#waveMount'), {
      mediaRoot: MEDIA,
      tracks: data.tracks,
      rgb: getComputedStyle(document.documentElement).getPropertyValue('--wave-rgb').trim() || '170,210,255'
    });

    board = GSFilmBoard.mount($('#boardCv'), {
      mediaRoot: MEDIA,
      films: data.films,
      accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '150,220,255',
      onOpen: function (film) { openFilmPlayer(film); },
      onLevel: function (level) {
        if (level === 0) setJourney(0);
        else if (level === 1) setJourney(1);
        else setJourney(2);
      }
    });

    setJourney(0);
    paintMark();
  }

  fetch(DATA_URL).then(function (r) { return r.json(); }).then(boot).catch(function (err) {
    console.error(err);
    $('#hint').textContent = 'could not load data';
  });
})();
