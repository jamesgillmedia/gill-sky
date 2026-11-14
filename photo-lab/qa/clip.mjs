// Records a short phone walkthrough of the darkroom: safelight toggle, horizon scrub, sheet, day, constellation, camera back.
//   node clip.mjs [--url http://host/photo-lab/] [--out dir]    -> <out>/darkroom-phone.webm (+ .mp4 when ffmpeg exists)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { devices } from 'playwright-core';
import { serve } from './serve.mjs';
import { launch } from './palette-audit.mjs';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('out', '/tmp/photo-lab-qa');
fs.mkdirSync(OUT, { recursive: true });
let srv, base = arg('url');
if (!base) { srv = await serve(); base = `http://127.0.0.1:${srv.port}/photo-lab/`; }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await launch();
const dev = devices['iPhone 14'];
const tmp = path.join(OUT, '_video');
fs.rmSync(tmp, { recursive: true, force: true });
const ctx = await browser.newContext({ ...dev, recordVideo: { dir: tmp, size: { width: 390, height: 664 } } });
await ctx.addInitScript(() => { if (!sessionStorage.getItem('qa-init')) { sessionStorage.setItem('qa-init', '1'); try { localStorage.setItem('gj-photo-lab-safelight', '0'); } catch (e) {} } });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
const pinch = async (dir, sel) => {
  const r = await page.evaluate((s) => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height * 0.45 }; }, sel);
  const a0 = 40, a1 = dir === 'in' ? 130 : 12, pts = (a) => [{ x: r.x - a, y: r.y, id: 1 }, { x: r.x + a, y: r.y, id: 2 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(a0) });
  for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(a0 + (a1 - a0) * i / 10) }); await wait(30); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
};
const drag = async (x0, y0, x1, y1, steps = 14) => { await page.mouse.move(x0, y0); await page.mouse.down(); for (let i = 1; i <= steps; i++) { await page.mouse.move(x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps); await wait(16); } await page.mouse.up(); };
const stand = () => page.evaluate(() => { const b = document.querySelector('.fm.cur').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });

await page.goto(base, { waitUntil: 'load' }); await wait(2200);
await page.tap('#safe'); await wait(2400);               // the lamp goes on: room changes, photographs do not
await drag(300, 420, 90, 420); await wait(900);          // scrub the horizon
await drag(90, 420, 330, 420); await wait(1000);
await page.tap('#sheetBtn'); await wait(1800);          // contact sheet
await page.evaluate(() => document.getElementById('sc').scrollTo({ top: 700, behavior: 'smooth' })); await wait(1500);
await page.locator('.cell').nth(14).tap(); await wait(1500);
const s = await stand(); await page.touchscreen.tap(s.x, s.y); await wait(2000);   // the day
await page.evaluate(() => document.getElementById('dsc').scrollTo({ top: 900, behavior: 'smooth' })); await wait(1800);
await page.keyboard.press('Escape'); await wait(1500);
await pinch('out', '#sky'); await wait(2600);            // constellation
await pinch('in', '#cstl'); await wait(2200);            // sheet
await pinch('in', '#sheet'); await wait(1800);           // horizon
await page.tap('#cam'); await wait(2200);                // camera back
await page.keyboard.press('Escape'); await wait(1200); await page.keyboard.press('Escape'); await wait(1400);
for (let i = 0; i < 2; i++) { await page.keyboard.press('Escape'); await wait(900); }
await wait(1200);
await page.tap('#safe'); await wait(2000);               // lamp off again for comparison
const v = page.video();
await ctx.close();
const webm = path.join(OUT, 'darkroom-phone.webm');
fs.copyFileSync(await v.path(), webm);
fs.rmSync(tmp, { recursive: true, force: true });
try { execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', webm, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-movflags', '+faststart', path.join(OUT, 'darkroom-phone.mp4')]); } catch (e) { console.log('ffmpeg unavailable; webm only'); }
console.log('clip written to', OUT);
await browser.close();
if (srv) srv.server.close();
