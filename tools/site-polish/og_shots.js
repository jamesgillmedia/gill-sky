#!/usr/bin/env node
/* First-frame captures for the share images of canvas pages (1200x630, no grading: a plain screenshot).
   Serve the repo root first (python3 -m http.server 8080), then:
     NODE_PATH=/path/to/node_modules node tools/site-polish/og_shots.js [name ...]
   Env: BASE (default http://127.0.0.1:8080/), CHROME (default /usr/local/bin/google-chrome), OUT (default /tmp/og-shots).
   og_images.py turns these PNGs into the optimized jpgs in og/. */
const { chromium } = require('playwright-core');
const fs = require('fs');
const BASE = process.env.BASE || 'http://127.0.0.1:8080/';
const CHROME = process.env.CHROME || '/usr/local/bin/google-chrome';
const OUT = process.env.OUT || '/tmp/og-shots';

const SHOTS = {
  home: { path: 'tonight/fable-m4/', click: '#dive', wait: 7000 },
  contact: { path: 'tonight/fable-m4/contact/', wait: 1500 },
  list: { path: 'tonight/fable-m4/list/', wait: 2500 },
  player: { path: 'tonight/fable-m4/player/', wait: 3500 },
  'photo-lab': { path: 'photo-lab/', wait: 4000 },
  darkroom: { path: 'tonight/photo-lab/', wait: 4000 },
  archive: { path: 'tonight/archive/', wait: 5000 },
  objects: { path: 'tonight/objects/', wait: 4000 },
  'objects-3d': { path: 'tonight/fable-m4/objects-3d/', wait: 5000 },
  'film-board': { path: 'tonight/fable-m4/#/film/board', click: '#dive', wait: 8000 },
  'contact-sheet': { path: 'photo-lab/', click: '#sheetBtn', wait: 4500 },
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SHOTS);
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader'] });
  for (const n of names) {
    const s = SHOTS[n];
    const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(BASE + s.path, { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    if (s.click) await page.click(s.click, { timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(s.wait);
    await page.screenshot({ path: `${OUT}/${n}.png` });
    console.log('shot', n);
    await ctx.close();
  }
  await browser.close();
})();
