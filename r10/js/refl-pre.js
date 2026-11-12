/* B · R10 + Reflection (Sketch Artist Concept 1, 11 Nov 2026). Runs after one-pre.js, before world.js.
   The sky is fitted above the horizon; the water below shows the work. The horizon is the depth gauge:
   sky ~50% -> chapter ~36% -> board at the surface ~7% -> work under (above the top). */
(function () {
  var land = function () { return innerHeight < 520 };
  var HZ = window.__reflHZ = function (lv) {
    var L = land() ? [0.72, 0.56, 0, -0.06] : [0.5, 0.36, 0.07, -0.06];
    return L[Math.max(0, Math.min(3, lv | 0))];
  };
  try { delete window.__oneBot } catch (e) {}
  Object.defineProperty(window, '__oneBot', { configurable: true, get: function () { return Math.round(innerHeight * (1 - HZ(0)) + 6 - 74) }, set: function () {} });
  window.__oneFarF = function () { return 0 };
  window.__reflMid = function (W, H) { return Math.round(H * (HZ(0) - HZ(1)) - 40) };
  /* the arrival's dotted mark and the fly-in's mark are the same mark, in the same place */
  window.__markAt = function (W, H) {
    if (W > H * 1.1) return { s: Math.min(Math.min(W, H) * .42 / 250, W * .36 / 428), x: W * .27, y: H * .47 };
    return { s: Math.min(W * .80 / 428, H * .17 / 210), x: W / 2, y: H * .135 + 105 * Math.min(W * .80 / 428, H * .17 / 210) };
  };
  var q = location.search, h = location.hash.replace(/^#\/?/, '');
  window.__reflArrive = !h && !/[?&]arrive=0/.test(q);
  if (window.__reflArrive) window.__reflHold = true;
})();
