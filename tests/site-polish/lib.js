/* Shared helpers for the site-polish checks: a static server that behaves like GitHub Pages (directory index, trailing-slash redirect),
   a Playwright launcher, and a tiny assert/report layer. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..', '..');
const BASE = 'https://jamesgillmedia.github.io/gill-sky/';
const CHROME = process.env.CHROME || '/usr/local/bin/google-chrome';
const ART = process.env.ARTIFACTS || '/opt/cursor/artifacts';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.m4a': 'audio/mp4', '.mp3': 'audio/mpeg',
};

function serve(port = 0) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let u = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
      let f = path.join(ROOT, u);
      if (!f.startsWith(ROOT)) { res.writeHead(403).end(); return; }
      fs.stat(f, (e, st) => {
        if (!e && st.isDirectory()) {
          if (!u.endsWith('/')) { res.writeHead(301, { Location: u + '/' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '') }).end(); return; }
          f = path.join(f, 'index.html');
        }
        fs.stat(f, (e2, st2) => {
          if (e2 || !st2.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404'); return; }
          const type = TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream';
          const hdr = { 'Content-Type': type, 'Content-Length': st2.size, 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' };
          const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
          if (range && req.method !== 'HEAD') {
            const a = range[1] ? +range[1] : 0, b = range[2] ? Math.min(+range[2], st2.size - 1) : st2.size - 1;
            res.writeHead(206, { ...hdr, 'Content-Range': `bytes ${a}-${b}/${st2.size}`, 'Content-Length': b - a + 1 });
            fs.createReadStream(f, { start: a, end: b }).pipe(res);
            return;
          }
          res.writeHead(200, hdr);
          if (req.method === 'HEAD') { res.end(); return; }
          fs.createReadStream(f).pipe(res);
        });
      });
    });
    srv.listen(port, '127.0.0.1', () => resolve({ srv, origin: 'http://127.0.0.1:' + srv.address().port + '/' }));
  });
}

function launch() {
  const { chromium } = require('playwright-core');
  return chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });
}

const VIEWS = {
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true },
  desktop: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
};

const results = [];
let group = '';
function setGroup(g) { group = g; console.log('\n== ' + g); }
function check(name, ok, detail) {
  const line = (ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  ' + detail : '');
  console.log('  ' + line);
  results.push({ group, name, ok: !!ok, detail: detail || '' });
  return !!ok;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function jpegSize(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

function get(origin, rel, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request(origin + rel.replace(/^\//, ''), { method }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
    req.end();
  });
}

module.exports = { ROOT, BASE, ART, serve, launch, VIEWS, check, setGroup, results, sleep, jpegSize, get, fs, path, zlib };
