/* Dotted star-chart waveform + player bar. Uses real tracks from data. */
(function (global) {
  'use strict';

  function mmss(s) {
    s = Math.max(0, s | 0);
    return (s / 60 | 0) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
  }

  function mount(root, opts) {
    opts = opts || {};
    var mediaRoot = opts.mediaRoot || '';
    var tracks = opts.tracks || [];
    if (!tracks.length) { root.textContent = ''; return null; }

    var audio = new Audio();
    audio.preload = 'metadata';
    var i = 0, playing = false, raf = 0;

    root.innerHTML = '';
    root.classList.add('gs-wave');
    var bar = document.createElement('div');
    bar.className = 'gs-wave-bar';
    var play = document.createElement('button');
    play.type = 'button'; play.className = 'gs-wave-play'; play.textContent = 'play';
    play.setAttribute('aria-pressed', 'false');
    var lab = document.createElement('div');
    lab.className = 'gs-wave-lab';
    var t1 = document.createElement('p'); t1.className = 'l1';
    var t2 = document.createElement('p'); t2.className = 'l2';
    lab.appendChild(t1); lab.appendChild(t2);
    var prev = document.createElement('button'); prev.type = 'button'; prev.className = 'gs-wave-nav'; prev.textContent = '‹'; prev.setAttribute('aria-label', 'previous track');
    var next = document.createElement('button'); next.type = 'button'; next.className = 'gs-wave-nav'; next.textContent = '›'; next.setAttribute('aria-label', 'next track');
    bar.appendChild(play); bar.appendChild(lab); bar.appendChild(prev); bar.appendChild(next);
    var canvas = document.createElement('canvas');
    canvas.className = 'gs-wave-cv';
    canvas.setAttribute('aria-label', 'star-chart waveform');
    root.appendChild(canvas);
    root.appendChild(bar);

    function cur() { return tracks[i]; }

    function setTrack(n) {
      i = ((n % tracks.length) + tracks.length) % tracks.length;
      var tr = cur();
      audio.src = mediaRoot + tr.file;
      t1.innerHTML = '<b></b> <span></span>';
      t1.querySelector('b').textContent = tr.title;
      t1.querySelector('span').textContent = tr.artist;
      t2.textContent = '0:00 / ' + mmss(tr.dur);
      paint(0);
      if (playing) audio.play().catch(function () {});
    }

    function paint(progress) {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var w = root.clientWidth || 320, h = Math.max(72, Math.min(140, Math.round(w * 0.22)));
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      var g = canvas.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      var peaks = cur().peaks || [];
      var N = Math.min(peaks.length, Math.max(48, Math.floor(w / 6)));
      var rgb = opts.rgb || '170,210,255';
      var star = cur().star | 0;
      var starJ = Math.round((star / Math.max(1, peaks.length - 1)) * (N - 1));
      for (var j = 0; j < N; j++) {
        var pk = peaks[Math.min(peaks.length - 1, Math.floor(j * peaks.length / N))] || 0.2;
        var x = 8 + j * (w - 16) / Math.max(1, N - 1);
        var y = h * 0.82 - pk * (h * 0.62);
        var lit = j / N <= progress;
        var isStar = Math.abs(j - starJ) < 1;
        var r = isStar ? 2.6 : 1.35;
        g.beginPath();
        g.fillStyle = lit
          ? (isStar ? 'rgba(255,210,180,.95)' : 'rgba(' + rgb + ',.85)')
          : (isStar ? 'rgba(255,210,180,.45)' : 'rgba(' + rgb + ',.28)');
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
        if (j > 0 && j % 8 === 0) {
          g.strokeStyle = 'rgba(' + rgb + ',.08)';
          g.beginPath(); g.moveTo(x, 6); g.lineTo(x, h - 6); g.stroke();
        }
      }
      // progress hairline
      var px = 8 + progress * (w - 16);
      g.strokeStyle = 'rgba(' + rgb + ',.35)';
      g.beginPath(); g.moveTo(px, 4); g.lineTo(px, h - 4); g.stroke();
    }

    function tick() {
      var tr = cur();
      var p = (audio.duration && isFinite(audio.duration)) ? audio.currentTime / audio.duration : (tr.dur ? audio.currentTime / tr.dur : 0);
      t2.textContent = mmss(audio.currentTime) + ' / ' + mmss(tr.dur || audio.duration || 0);
      paint(Math.max(0, Math.min(1, p)));
      if (playing) raf = requestAnimationFrame(tick);
    }

    play.addEventListener('click', function () {
      if (audio.paused) {
        playing = true; play.textContent = 'pause'; play.setAttribute('aria-pressed', 'true');
        audio.play().catch(function () {}); tick();
      } else {
        playing = false; play.textContent = 'play'; play.setAttribute('aria-pressed', 'false');
        audio.pause(); cancelAnimationFrame(raf); paint(audio.duration ? audio.currentTime / audio.duration : 0);
      }
    });
    prev.addEventListener('click', function () { setTrack(i - 1); });
    next.addEventListener('click', function () { setTrack(i + 1); });
    canvas.addEventListener('click', function (e) {
      var rect = canvas.getBoundingClientRect();
      var u = (e.clientX - rect.left) / rect.width;
      if (audio.duration) audio.currentTime = Math.max(0, Math.min(1, u)) * audio.duration;
      paint(u);
    });
    audio.addEventListener('ended', function () {
      setTrack(i + 1);
      playing = true; play.textContent = 'pause'; play.setAttribute('aria-pressed', 'true');
      audio.play().catch(function () {}); tick();
    });
    addEventListener('resize', function () {
      var p = audio.duration ? audio.currentTime / audio.duration : 0;
      paint(p);
    });

    setTrack(0);
    return {
      play: function () { play.click(); },
      audio: audio,
      destroy: function () { playing = false; audio.pause(); cancelAnimationFrame(raf); }
    };
  }

  global.GSWave = { mount: mount };
})(window);
