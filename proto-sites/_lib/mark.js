/* Fusion star mark — full on opener; mid-journey partial (key vertices full, rest faint). Deterministic. */
(function (global) {
  'use strict';
  var STROKES = [
    [[-58.5, -96], [-156.5, -95], [-203.5, -61], [-213.5, 1], [-203.5, 63], [-156.5, 97], [-58.5, 97]],
    [[-26.5, -97], [25.5, -94], [44.5, -51], [25.5, -8], [-26.5, -5]],
    [[99.5, 105], [99.5, 20], [149.5, 15], [191.5, -11], [211.5, -55], [214.5, -105]]
  ];

  function keyIndex(stroke) {
    var keys = {};
    keys[0] = 1;
    keys[stroke.length - 1] = 1;
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, i;
    for (i = 0; i < stroke.length; i++) {
      minX = Math.min(minX, stroke[i][0]); maxX = Math.max(maxX, stroke[i][0]);
      minY = Math.min(minY, stroke[i][1]); maxY = Math.max(maxY, stroke[i][1]);
    }
    for (i = 0; i < stroke.length; i++) {
      var p = stroke[i];
      if (p[0] === minX || p[0] === maxX || p[1] === minY || p[1] === maxY) keys[i] = 1;
    }
    return keys;
  }

  function draw(ctx, opts) {
    opts = opts || {};
    var mode = opts.mode || 'full'; // full | partial | ghost
    var scale = opts.scale || 1;
    var cx = opts.x || 0, cy = opts.y || 0;
    var rgb = opts.rgb || '238,243,245';
    var lineW = (opts.lineW || 1.15) * scale;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    STROKES.forEach(function (stroke) {
      var keys = keyIndex(stroke);
      ctx.beginPath();
      stroke.forEach(function (p, i) {
        if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
      });
      if (mode === 'full') {
        ctx.strokeStyle = 'rgba(' + rgb + ',.92)';
        ctx.lineWidth = lineW;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();
      } else if (mode === 'ghost') {
        ctx.strokeStyle = 'rgba(' + rgb + ',.12)';
        ctx.lineWidth = lineW * 0.7;
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(' + rgb + ',.14)';
        ctx.lineWidth = lineW * 0.55;
        ctx.stroke();
      }
      stroke.forEach(function (p, i) {
        var key = !!keys[i];
        var r = (key ? 3.2 : 1.6) * (mode === 'full' ? 1 : 0.9);
        var a = mode === 'full' ? (key ? 0.95 : 0.55)
          : mode === 'partial' ? (key ? 0.95 : 0.12)
          : (key ? 0.35 : 0.08);
        ctx.beginPath();
        ctx.fillStyle = 'rgba(' + rgb + ',' + a + ')';
        ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    ctx.restore();
  }

  function bounds() {
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    STROKES.forEach(function (s) {
      s.forEach(function (p) {
        minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
        minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
      });
    });
    return { minX: minX, maxX: maxX, minY: minY, maxY: maxY, w: maxX - minX, h: maxY - minY };
  }

  global.GSMark = { draw: draw, strokes: STROKES, bounds: bounds, keyIndex: keyIndex };
})(window);
