/* Debug panel. Off unless the URL has ?debug=1 (remembered for this tab; ?debug=0 clears it).
   Self-contained: reads window.__u1 / GJ_DEPTH read-only, never drives the sky. */
(function () {
  var on = false, q = /[?&]debug=([^&]*)/.exec(location.search);
  try {
    if (q) { if (q[1] === '0') sessionStorage.removeItem('gjdbg'); else sessionStorage.setItem('gjdbg', '1'); }
    on = !!sessionStorage.getItem('gjdbg');
  } catch (e) { on = !!q && q[1] !== '0'; }
  if (!on) return;

  var css = '#gjdbg{position:fixed;z-index:70;right:0;bottom:0;pointer-events:none;font:300 11px/1.4 Poppins,system-ui,sans-serif;color:#dfe8f2}' +
    '#gjdbg .tab{position:fixed;right:8px;bottom:max(8px,env(safe-area-inset-bottom));width:30px;height:30px;border-radius:50%;pointer-events:auto;cursor:pointer;border:1px solid rgba(255,255,255,.28);background:rgba(10,16,24,.28);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#cfe0f2;font:400 10px/28px "Julius Sans One",Poppins,sans-serif;text-align:center;transition:opacity .25s ease-out}' +
    '#gjdbg.open .tab{opacity:0;pointer-events:none}' +
    '#gjdbg .sheet{position:fixed;overflow:auto;overscroll-behavior:contain;background:rgba(10,16,24,.5);-webkit-backdrop-filter:blur(12px) saturate(1.1);backdrop-filter:blur(12px) saturate(1.1);border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:10px 12px 12px;left:8px;right:8px;bottom:max(8px,env(safe-area-inset-bottom));max-height:40vh;transform:translateY(calc(100% + 24px));opacity:0;pointer-events:none;transition:transform .25s ease-out,opacity .25s ease-out}' +
    '#gjdbg.open .sheet{transform:none;opacity:1;pointer-events:auto}' +
    '@media (orientation:landscape) and (min-width:560px){#gjdbg .sheet{left:auto;right:max(8px,env(safe-area-inset-right));width:min(330px,42vw);max-height:68vh;transform:translateX(calc(100% + 24px))}}' +
    '#gjdbg h4{margin:0 0 6px;font:400 10px "Julius Sans One",Poppins,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#9fb6cc}' +
    '#gjdbg .r{display:flex;justify-content:space-between;gap:10px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,.07)}' +
    '#gjdbg .r b{font-weight:300;color:#9fb6cc}#gjdbg .r span{text-align:right;word-break:break-word}' +
    '#gjdbg a.go{display:block;margin-top:10px;padding:9px 12px;text-align:center;border-radius:16px;border:1px solid rgba(85,218,161,.55);color:#55DAA1;text-decoration:none;background:rgba(85,218,161,.1);letter-spacing:.08em}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var root = document.createElement('div'); root.id = 'gjdbg';
  root.innerHTML = '<div class="tab" role="button" aria-label="debug">dbg</div><div class="sheet"><h4>m4 debug</h4><div id="gjdbgrows"></div><a class="go" href="_versions/">builds</a></div>';
  document.body.appendChild(root);
  ['pointerdown', 'pointermove', 'touchstart', 'touchmove', 'mousedown', 'wheel', 'click'].forEach(function (t) {
    root.addEventListener(t, function (e) { e.stopPropagation(); });
  });

  var tab = root.querySelector('.tab'), rows = document.getElementById('gjdbgrows'), tm = 0, open = false;
  function set(v) { open = v; root.classList.toggle('open', v); clearTimeout(tm); if (v) tm = setTimeout(function () { set(false); }, 8000); }
  tab.addEventListener('click', function () { set(true); });
  document.addEventListener('pointerdown', function (e) { if (open && !root.contains(e.target)) set(false); }, true);
  root.querySelector('.sheet').addEventListener('pointerdown', function () { if (open) set(true); });

  var frames = 0, fps = 0, last = performance.now(), ft = 0;
  (function loop(t) { frames++; ft = t - (loop.p || t); loop.p = t; if (t - last > 500) { fps = frames * 1000 / (t - last); frames = 0; last = t; if (open) paint(); } requestAnimationFrame(loop); })(performance.now());

  function row(k, v) { return '<div class="r"><b>' + k + '</b><span>' + v + '</span></div>'; }
  function paint() {
    var u = window.__u1 || {}, d = {}, h = '';
    try { d = (window.GJ_DEPTH && GJ_DEPTH.state && GJ_DEPTH.state()) || {}; } catch (e) {}
    function pick(o, k) { try { var v = typeof o[k] === 'function' ? o[k]() : o[k]; return v == null ? '-' : (typeof v === 'object' ? JSON.stringify(v).slice(0, 80) : v); } catch (e) { return '-'; } }
    ['phase', 'cur', 'step', 'sel', 'ready'].forEach(function (k) { if (k in u) h += row(k, pick(u, k)); });
    Object.keys(d).slice(0, 14).forEach(function (k) { h += row('depth.' + k, pick(d, k)); });
    h += row('fps', fps.toFixed(0) + ' / ' + ft.toFixed(1) + ' ms');
    h += row('viewport', innerWidth + ' x ' + innerHeight + ' @' + (devicePixelRatio || 1));
    h += row('reduce motion', matchMedia('(prefers-reduced-motion: reduce)').matches ? 'on' : 'off');
    h += row('history', history.length);
    rows.innerHTML = h;
  }
  paint();
  new MutationObserver(function () { if (open) paint(); }).observe(root, { attributes: true, attributeFilter: ['class'] });
})();
