/* Tiny, pluggable analytics. Off by default: with no provider configured this file makes no network calls and writes nothing.

   GJ_ANALYTICS.track(name, props)   props: { stop, slug, title, ... }
   GJ_ANALYTICS.counts()             the local debug counter  { "<name>:<slug>": n }
   GJ_ANALYTICS.reset()              clear the local counter
   GJ_ANALYTICS.mode                 'off' | 'on' | 'debug'

   ?analytics=debug   console.log every event, count it in localStorage (gj.analytics.counts), and send nothing. Sticky for the tab.
   ?analytics=off     leave debug mode.
   Do Not Track is honoured for provider sends. */
(function (w) {
  'use strict';
  var CFG = w.GJ_ANALYTICS_CONFIG || {};
  var KEY = 'gj.analytics.counts', MODE_KEY = 'gj.analytics.mode';

  function ls(op, k, v) {
    try { return op === 'get' ? localStorage.getItem(k) : op === 'set' ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) { return null; }
  }
  function ss(op, k, v) {
    try { return op === 'get' ? sessionStorage.getItem(k) : op === 'set' ? sessionStorage.setItem(k, v) : sessionStorage.removeItem(k); } catch (e) { return null; }
  }

  var q = /(?:^|[?&])analytics=(debug|off)(?:&|$)/.exec(location.search);
  if (q) { if (q[1] === 'debug') ss('set', MODE_KEY, 'debug'); else ss('del', MODE_KEY); }
  var debug = ss('get', MODE_KEY) === 'debug';
  var configured = !!(CFG.provider && CFG.endpoint);
  var mode = debug ? 'debug' : configured ? 'on' : 'off';

  function bump(name, props) {
    var raw = ls('get', KEY), map = {};
    try { map = raw ? JSON.parse(raw) : {}; } catch (e) { map = {}; }
    var k = name + (props && props.slug ? ':' + props.slug : '');
    map[k] = (map[k] || 0) + 1;
    ls('set', KEY, JSON.stringify(map));
    return map[k];
  }

  function send(name, props) {
    var path = location.pathname;
    var title = (props && props.title) || document.title;
    var dnt = (navigator.doNotTrack === '1' || w.doNotTrack === '1');
    if (dnt) return;
    if (CFG.provider === 'goatcounter') {
      var u = CFG.endpoint + '?p=' + encodeURIComponent(props && props.slug ? path.replace(/[^/]*\/?$/, '') + props.slug + '/' : path) +
        '&t=' + encodeURIComponent(title) + '&e=' + encodeURIComponent(name) + '&r=' + encodeURIComponent(document.referrer || '') + '&rnd=' + Math.random().toString(36).slice(2);
      var img = new Image(1, 1);
      img.src = u;
      return;
    }
    var body = JSON.stringify({ name: name, url: location.href, domain: CFG.domain || location.hostname, referrer: document.referrer || null, props: props || {} });
    if (navigator.sendBeacon && CFG.provider === 'plausible') {
      try { if (navigator.sendBeacon(CFG.endpoint, new Blob([body], { type: 'text/plain' }))) return; } catch (e) { }
    }
    if (w.fetch) fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: body, keepalive: true, mode: 'no-cors' }).catch(function () { });
  }

  function track(name, props) {
    if (mode === 'off') return;
    if (mode === 'debug') {
      var n = bump(name, props);
      try { console.log('[analytics:debug]', name, props || {}, '#' + n, configured ? '(provider "' + CFG.provider + '" configured; not sent in debug)' : '(no provider; nothing is sent)'); } catch (e) { }
      return;
    }
    send(name, props);
  }

  w.GJ_ANALYTICS = {
    mode: mode,
    track: track,
    counts: function () { try { return JSON.parse(ls('get', KEY) || '{}'); } catch (e) { return {}; } },
    reset: function () { ls('del', KEY); }
  };
})(window);
