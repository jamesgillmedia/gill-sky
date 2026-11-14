# gill-sky
New constellation site builds for gilljames

## Site polish

Shared pieces live in `shared/`, share images in `og/`, the tour in `tour/`.

| What | Where |
| --- | --- |
| Error / offline state (rotating joio cups, message, Retry, Studio board link) | `shared/offline-collage/` (`demo.html` shows it on its own: `?reason=offline`, `timeout`, `network`, `http`) |
| Tour analytics (off by default) | `shared/analytics/` |
| Keyboard focus ring and the active-mode indicator | `shared/a11y.css` |
| Quiet links between pages | `shared/site-links.css` (markup is written into each page by `tools/site-polish/meta.py`) |
| Photo alt text for the labs' script-drawn pictures | `shared/photo-alts.js` |
| Tour stops: `tour/<stop>/index.html`, shared `tour/tour.js`, `tour/tour.css`, `tour/stops.js` | `tour/` |
| `sitemap.xml`, `sitemap-images.xml`, `robots.txt` | repo root |

### Tour analytics

Analytics records one event per tour stop view (`tour_stop`, with the stop number, slug and title). It is **disabled by default**: with no provider
configured it makes no network calls and writes nothing.

To turn it on, edit `shared/analytics/config.js`:

```js
window.GJ_ANALYTICS_CONFIG = {
  provider: 'goatcounter',                                  // 'goatcounter' | 'plausible' | 'custom'
  endpoint: 'https://YOUR-CODE.goatcounter.com/count',      // plausible: 'https://plausible.io/api/event'
  domain: ''                                                // plausible only: 'jamesgillmedia.github.io'
};
```

- `goatcounter`: a GET image beacon with `p` (path of the stop), `t` (stop title) and `e` (event name).
- `plausible`: a POST of `{name, url, domain, props:{stop, slug, title}}` (sendBeacon, falling back to fetch).
- `custom`: the same JSON as Plausible, POSTed to any URL you run.
- Do Not Track is honoured for provider sends.

Debug without any account: open any tour page with `?analytics=debug`. Every stop view is logged to the console (`[analytics:debug]`), counted in
`localStorage` under `gj.analytics.counts` (read it with `GJ_ANALYTICS.counts()`, clear it with `GJ_ANALYTICS.reset()`), and nothing is sent, even if a provider
is configured. Debug mode lasts for the tab; `?analytics=off` leaves it.

### Rebuilding generated files

```
python3 tools/site-polish/build_tour.py     # tour/index.html and the nine tour/<stop>/index.html from tour/stops.js
python3 tools/site-polish/alts.py           # photo titles and alt text (text lives in tools/site-polish/photo_alts.py)
NODE_PATH=... node tools/site-polish/og_shots.js   # first-frame screenshots of the canvas pages (repo served on :8080)
python3 tools/site-polish/og_images.py      # og/*.jpg, 1200x630 (needs Pillow)
python3 tools/site-polish/meta.py           # share tags, links and shared css in the existing pages (idempotent, between marker comments)
python3 tools/site-polish/sitemap.py        # sitemap.xml, sitemap-images.xml, robots.txt
```

### Checks

```
npm i playwright-core pngjs                       # Chrome at /usr/local/bin/google-chrome, or CHROME=...
node tests/site-polish/run.js                     # all groups: errors blank a11y analytics og sitemap images links
node tests/site-polish/run.js links               # one group
```

The runner serves the repo itself, stubs the pinned previews the tour frames, and writes screenshots to `$ARTIFACTS` (default `/opt/cursor/artifacts`).
