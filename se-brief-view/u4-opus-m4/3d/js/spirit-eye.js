/* Spirit Eye of skwácháýs · brief mode (local branch se-brief, from se-full-pdf 1890325).
   The whole Spirit Eye PDF (32 pages, Jul 11 2025) read as a project brief, in the PDF's own order:
   - sections are the PDF's own headings (a page without a heading stays in the section before it; pp.26-32 carry the title);
     a persistent bar shows the section and p. n / 32; page 1 and the closing page list the sections, tappable to jump.
   - every page's words sit on a calm, high-contrast reading panel, all at once, the moment the page arrives (no staggered reveals);
     the page plates sit beside (wide) or above (tall) the panel and open full size on tap. Text is fitted, never scrolled.
   - one drag / swipe / wheel gesture / key / button = exactly one page. The world stays behind as atmosphere: a short glide
     within a place, a short dissolve between places (no flythroughs). The light lands through the eye once, briefly, on p.16.
   - pp.26-32 (the seven black-and-white drawings at the end of the PDF) are one gallery stop: a grid in PDF order; tap one to open
     it large, Back (or tap) returns to the grid at that drawing.
   - after the gallery a closing page recaps the brief (title, sections, credit) and the six chapters open.
   Nothing auto-advances; silent; Reduce Motion is the same. Every brief word comes from js/se-pages.js (verbatim PDF text)
   or BUDGET below (the p.24 table, transcribed from the PDF's table image). UI copy is limited to functional hints. */
import { PAGES } from './se-pages.js';
const BASE = new URL('../', import.meta.url).href; /* 3d/ */
const IMG = n => BASE + 'media/spirit-eye/s2/' + n + '.webp';
const PIMG = (n, small) => BASE + 'media/spirit-eye/pdf/' + n + (small ? '-s' : '') + '.webp';
export const data = { title: 'spirit eye', byline: 'joshua ngenda & gill james', page: BASE + '../space/spirit-eye/' };
/* PDF p.24: the budget table is an image in the PDF; these rows are its exact words (see media/spirit-eye/pdf/p24t.webp) */
const BUDGET = { rows: [['Materials', '100,000'], ['Fabrication', '180,000'], ['Design Development', '80,000'], ['Community Engagement', '200,000'], ['Administration', '50,000'], ['Engineering', '300,000'], ['Site Preparation and installation', '100,000'], ['Public Artists', '200,000'], ['Project Manager', '100,000'], ['Infrastructure', '5.5 million'], ['Contingency', '100,000']], foot: '1.3 million public art + 5.5 million infrastructure' };
/* PDF elements: the images embedded in the PDF, extracted as separate pieces (pdfimages, sRGB, metadata stripped; media/spirit-eye/el/).
   [file, w, h]. Pages listed in WORLD place theirs in the 3d world instead of beside the text. */
const EL = {"3":[["p03-1",1050,1400]],"4":[["p04-1",1122,1400]],"6":[["p06-1",768,572]],"8":[["p08-1",881,700],["p08-2",667,667],["p08-3",667,663],["p08-4",933,700],["p08-5",1400,1400],["p08-6",1050,1400]],"10":[["p10-1",1400,807],["p10-2",1400,980],["p10-3",1400,989]],"11":[["p11-1",1400,1050]],"18":[["p18-1",1400,1079],["p18-2",820,1400],["p18-3",1400,654],["p18-4",1400,980]],"19":[["p19-1",1400,790],["p19-2",1400,788],["p19-3",1400,782],["p19-4",1400,789],["p19-5",1400,786],["p19-6",1039,1400]],"20":[["p20-1",1400,788]],"21":[["p21-1",934,1400],["p21-2",1200,1000],["p21-3",1014,1400],["p21-4",700,904],["p21-5",1000,720],["p21-6",1308,1400],["p21-7",1400,927],["p21-8",500,553]],"22":[["p22-1",1290,724],["p22-2",1400,794],["p22-3",933,1400],["p22-4",1400,933],["p22-5",1400,1045],["p22-6",768,1024],["p22-7",1400,933],["p22-8",980,980]],"23":[["p23-1",639,852],["p23-2",1400,788],["p23-3",750,1000],["p23-4",1400,1050],["p23-5",1050,1400],["p23-6",1000,666],["p23-7",838,627],["p23-8",1045,1400]]};
const WORLD = { 21: 1, 22: 1, 23: 1 }; /* the plants grow in the underground garden */
const EIMG = (n, small) => BASE + 'media/spirit-eye/el/' + n + (small ? '-s' : '') + '.webp';
const TITLE = PAGES[0].h, BYLINE = PAGES[0].by, GALLERY = 'gallery';
/* ---------- the brief's sections, from the PDF's own headings ---------- */
export const SECTIONS = []; /* {h, a, b} page range */
PAGES.forEach(pg => { const last = SECTIONS[SECTIONS.length - 1];
  const h = pg.n >= 26 ? GALLERY : pg.h; /* pp.26-32 have no heading or captions in the PDF: a neutral UI label */
  if (h && (!last || last.h !== h || pg.n >= 26 && last.a < 26)) SECTIONS.push({ h: h, a: pg.n, b: pg.n }); else last.b = pg.n });
const SEC_OF_PAGE = n => SECTIONS.find(x => n >= x.a && n <= x.b);
/* camera places (atmosphere only): [pos, look, whorl-relative (pushed back on narrow screens)] */
const SECT = {
  arrival: [[0, 13, 7.5], [0, .6, 0], 1], land: [[-9, 3.2, 9], [0, 1.2, -3], 1], makers: [[-12, 5.5, -8], [0, 1.2, 0], 1],
  eye: [[0, 3.4, 1.2], [0, -4, -.3], 0], sun: [[12, 6, -10], [0, 1.2, 0], 1], water: [[15, 1.3, 13], [-6, 1.5, -12], 1],
  column: [[.8, -9, 1.6], [0, -24, 0], 0], light: [[5.6, -27.5, 10.5], [0, -36.6, 0], 0], garden: [[8, -35, 11], [0, -34, 0], 0],
  surface: [[-14, 4, 12], [0, 1, 0], 1], sketches: [[0, 8, 26], [0, .6, 0], 1], sky: [[0, 11, 44], [0, .6, 0], 1]
};
const SECT_OF = n => n === 1 ? 'arrival' : n === 2 ? 'land' : n <= 4 ? 'makers' : n === 5 ? 'eye' : n <= 9 ? 'sun' : n <= 14 ? 'water' : n === 15 ? 'column' : n === 16 ? 'light' : n <= 23 ? 'garden' : n <= 25 ? 'surface' : 'sketches';
const GAL_A = 26; /* pp.26-32: the black-and-white drawings, one gallery stop */
export const STEPS = [];
PAGES.forEach(pg => { if (pg.n < GAL_A) STEPS.push({ k: 'page', n: pg.n, pg: pg, sec: SECT_OF(pg.n), bs: SEC_OF_PAGE(pg.n) }) });
STEPS.push({ k: 'gallery', n: GAL_A, n2: PAGES.length, pages: PAGES.filter(p => p.n >= GAL_A), sec: 'sketches', bs: SEC_OF_PAGE(GAL_A) });
STEPS.push({ k: 'end', sec: 'sky', bs: { h: TITLE } });
const STEP_OF_PAGE = n => STEPS.findIndex(st => st.n === n || (st.k === 'gallery' && n >= st.n && n <= st.n2));
const NS = STEPS.length, UNLOCK = NS - 1, LIGHT = STEPS.findIndex(x => x.n === 16);
const SEC_START = SECTIONS.map(x => STEP_OF_PAGE(x.a)).concat([UNLOCK]);
const EASE = bez(0.22, 1, 0.36, 1), T_GLIDE = 700, T_FADE = 560, T_ENTER = 1200, T_BEAT = 2600;
function bez(x1, y1, x2, y2) {
  const cb = (t, a, b) => 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t, dcb = (t, a, b) => 3 * a * (1 - t) * (1 - t) + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
  return x => { if (x <= 0) return 0; if (x >= 1) return 1; let t = x; for (let i = 0; i < 8; i++) { const d = cb(t, x1, x2) - x, s = dcb(t, x1, x2); if (Math.abs(d) < 1e-5 || !s) break; t -= d / s } return cb(Math.max(0, Math.min(1, t)), y1, y2) };
}
const clampS = x => Math.max(0, Math.min(NS - 1, x));
const esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const range = s => 'p. ' + s.a + (s.b > s.a ? '–' + s.b : '');
function contents(cls) { return `<ol class="toc ${cls || ''}">` + SECTIONS.slice(1).map(s => `<li><button type="button" data-go="${STEP_OF_PAGE(s.a)}"><span>${esc(s.h)}</span><i>${range(s)}</i></button></li>`).join('') + '</ol>' }
/* the reading panel for one step: only PDF words (plus functional hints) */
export function readHTML(st) {
  let o = '';
  if (st.k === 'end') return `<h2 class="ttl">${esc(TITLE)}</h2><p class="by">${esc(BYLINE)}</p>` + contents('end') + `<p class="hint">the six chapters are open · tap one, or <button type="button" class="room">3d room ›</button></p>`;
  const pg = st.pg; if (!pg) return '';
  if (pg.n === 1) return `<h2 class="ttl">${esc(pg.h)}</h2><p class="by">${esc(pg.by)}</p>` + contents() + '<p class="hint">swipe, scroll or press › · one page at a time · the six chapters open after page 32</p>';
  if (pg.h) o += `<h2>${esc(pg.h)}</h2>`;
  (pg.sub || []).forEach(x => o += `<p class="sub">${esc(x)}</p>`);
  /* pg.note (p.25's form prompt) sits under a white box in the PDF and is not visible there, so it is not shown */
  (pg.p || []).forEach((x, k) => { const L = !k && lead(x); if (L) o += `<p><span class="lead">${esc(L)}</span>${esc(x.slice(L.length))}</p>`; else o += `<p>${esc(x)}</p>` });
  if (pg.pairs) o += '<dl class="pairs">' + pg.pairs.map(x => `<dt>${esc(x[0])}</dt>` + (x[1] ? `<dd>${esc(x[1])}</dd>` : '')).join('') + '</dl>';
  if (pg.list) o += '<ul class="cv">' + pg.list.map(x => `<li>${esc(x)}</li>`).join('') + '</ul>';
  if (pg.plants) o += '<ul class="plants">' + pg.plants.map(x => `<li>${esc(x)}</li>`).join('') + '</ul>';
  if (pg.n === 24) o += '<div class="budget" role="table">' + BUDGET.rows.map(r => `<div class="r" role="row"><span role="cell">${esc(r[0])}</span><span role="cell">${esc(r[1])}</span></div>`).join('') + `<div class="r f" role="row"><span role="cell">${esc(BUDGET.foot)}</span></div></div>`;
  if (o) o += `<p class="fullp"><button type="button" class="full" data-f="${pg.img[0][0]}" data-n="${pg.n}">full page ⤢</button></p>`;
  return o;
}
/* the key statement: the first sentence of a page's first paragraph, set large when it is short enough to read at a glance (same words, same order) */
function lead(x) { const m = x.match(/^(.{40,190}?[.!?])\s/); return m ? m[1] : (x.length <= 190 && x.length >= 40 ? x : '') }
const platesOf = st => st.k === 'gallery' ? st.pages.map(p => p.img[0].concat([p.n])) : !st.pg || WORLD[st.pg.n] ? [] : EL[st.pg.n] ? EL[st.pg.n].map(x => x.concat([st.pg.n, 'el'])) : st.pg.img.filter(x => x[0] !== st.pg.pimg).map(x => x.concat([st.pg.n]));
export function mount(THREE, scene, ctx) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const g = new THREE.Group(); scene.add(g);
  const LOADER = new THREE.TextureLoader();
  const tex = (url, cb) => LOADER.load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (cb) cb(t) });
  /* ---------- one camera pose per step; pages in the same place orbit a little around its look point ---------- */
  const POSE = [], SUBD = .13;
  function layoutPath(aspect) {
    const K = Math.max(1, Math.min(1.9, 1 / (aspect * 1.25)));
    POSE.length = 0;
    STEPS.forEach((st, i) => {
      let first = i; while (first > 0 && STEPS[first - 1].sec === st.sec) first--; let last = i; while (last < NS - 1 && STEPS[last + 1].sec === st.sec) last++;
      const S = SECT[st.sec], m = last - first + 1, j = i - first, p = V(...S[0]), l = V(...S[1]), a = (j - (m - 1) / 2) * SUBD;
      const ox = p.x - l.x, oz = p.z - l.z; p.x = l.x + ox * Math.cos(a) - oz * Math.sin(a); p.z = l.z + ox * Math.sin(a) + oz * Math.cos(a);
      if (S[2]) p.sub(l).multiplyScalar(K).add(l);
      if (Math.abs(l.x - p.x) < 1e-3 && Math.abs(l.z - p.z) < 1e-3) l.z -= .01;
      POSE.push({ p: p, l: l });
    });
  }
  const ang = s => Math.PI / 2 - s / NS * 6.283; /* the sun: once around the whorl over the whole brief, clockwise seen from above */
  /* ---------- the place ---------- */
  const water = new THREE.Mesh(new THREE.RingGeometry(6.68, 70, 96, 1), new THREE.MeshBasicMaterial({ color: 0x0b1d28, transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: true }));
  water.rotation.x = -Math.PI / 2; water.renderOrder = 1; g.add(water);
  for (let r = 9; r < 46; r += 5.5) { const pts = []; for (let j = 0; j <= 120; j++) { const a = j / 120 * 6.283; pts.push(V(Math.cos(a) * r, .02, Math.sin(a) * r)) }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x6fa5b8, transparent: true, opacity: .12 * (1 - r / 52), depthWrite: false }))) }
  /* the whorl: housing ring + plan drawing (PDF p.7) as the dial face, nine sector ticks, the sun mark */
  const whorl = new THREE.Group(); g.add(whorl);
  const housing = new THREE.Mesh(new THREE.RingGeometry(5.35, 6.7, 96), new THREE.MeshBasicMaterial({ color: 0xa8bcc4, transparent: true, opacity: .92, side: THREE.DoubleSide, depthWrite: false }));
  housing.rotation.x = -Math.PI / 2; housing.position.y = .62; housing.renderOrder = 3; whorl.add(housing);
  const faceM = new THREE.MeshBasicMaterial({ color: 0x223040, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: false });
  const face = new THREE.Mesh(new THREE.CircleGeometry(5.36, 96), faceM); face.rotation.x = -Math.PI / 2; face.position.y = .6; face.renderOrder = 2; whorl.add(face);
  tex(IMG('p07-plan-dial'), t => { faceM.map = t; faceM.color.set(0xffffff); faceM.needsUpdate = true });
  const tickPts = []; for (let i = 0; i < NS; i++) { const a = ang(i), r0 = 6.75, r1 = i === LIGHT ? 7.9 : SEC_START.includes(i) ? 7.45 : 7.05; tickPts.push(V(Math.cos(a) * r0, .64, -Math.sin(a) * r0), V(Math.cos(a) * r1, .64, -Math.sin(a) * r1)) }
  whorl.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tickPts), new THREE.LineBasicMaterial({ color: 0xe6eef2, transparent: true, opacity: .7, depthWrite: false })));
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: ctx.glowTex, color: 0xffd58a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  sun.scale.set(2.6, 2.6, 1); sun.renderOrder = 6; whorl.add(sun);
  const sunCore = new THREE.Sprite(new THREE.SpriteMaterial({ map: ctx.glowTex, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  sunCore.scale.set(.8, .8, 1); sunCore.renderOrder = 7; whorl.add(sunCore);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: ctx.glowTex, color: 0x5fd9c0, transparent: true, opacity: .22, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  halo.scale.set(26, 26, 1); halo.position.y = .2; whorl.add(halo);
  /* underground: the cave, the column, fibre optics, the beam and where it lands */
  const under = new THREE.Group(); g.add(under);
  const cave = new THREE.Mesh(new THREE.CylinderGeometry(26, 26, 44, 48, 1, true), new THREE.MeshBasicMaterial({ color: 0x06090b, side: THREE.BackSide }));
  cave.position.y = -22; under.add(cave);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(26, 64), new THREE.MeshBasicMaterial({ color: 0x0d120e })); floor.rotation.x = -Math.PI / 2; floor.position.y = -38; under.add(floor);
  const ceil = new THREE.Mesh(new THREE.RingGeometry(2.7, 26, 64), new THREE.MeshBasicMaterial({ color: 0x080b0d, side: THREE.DoubleSide })); ceil.rotation.x = -Math.PI / 2; ceil.position.y = -.05; under.add(ceil);
  const column = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 38, 40, 1, true), new THREE.MeshBasicMaterial({ color: 0x9fb4bd, transparent: true, opacity: .08, side: THREE.DoubleSide, depthWrite: false }));
  column.position.y = -19; g.add(column);
  const hoops = []; for (let y = -3; y > -38; y -= 5) { const pts = []; for (let j = 0; j <= 64; j++) { const a = j / 64 * 6.283; pts.push(V(Math.cos(a) * 2.6, y, Math.sin(a) * 2.6)) } hoops.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xa8bcc4, transparent: true, opacity: .22, depthWrite: false }))) }
  hoops.forEach(h => g.add(h));
  const fib = []; for (let i = 0; i < 46; i++) { const a = i * 2.39996, r = .25 + Math.sqrt(i / 46) * 1.15; fib.push(V(Math.cos(a) * r, .3, Math.sin(a) * r), V(Math.cos(a) * r * 1.25, -37.6, Math.sin(a) * r * 1.25)) }
  const fibers = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(fib), new THREE.LineBasicMaterial({ color: 0xd8fbff, transparent: true, opacity: .18, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(fibers);
  const UB = { uI: { value: .4 } };
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 3.4, 37.6, 48, 24, true), new THREE.ShaderMaterial({ uniforms: UB, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying float vY;varying vec3 vN;varying vec3 vV;void main(){vY=uv.y;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
    fragmentShader: 'uniform float uI;varying float vY;varying vec3 vN;varying vec3 vV;void main(){float f=abs(dot(vN,vV));float core=pow(f,1.6);float a=uI*core*(.35+.65*vY)*(.55+.45*smoothstep(0.,.08,vY));gl_FragColor=vec4(vec3(1.,.95,.82)*a,1.);}' }));
  beam.position.y = -18.8; beam.renderOrder = 8; g.add(beam);
  const poolTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(255,248,226,1)'); gr.addColorStop(.18, 'rgba(255,236,190,.85)'); gr.addColorStop(.45, 'rgba(255,214,150,.28)'); gr.addColorStop(1, 'rgba(255,214,150,0)'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t })();
  const pool = new THREE.Mesh(new THREE.CircleGeometry(7.5, 64), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  pool.rotation.x = -Math.PI / 2; pool.position.y = -37.9; pool.renderOrder = 9; g.add(pool);
  const eyeGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: ctx.glowTex, color: 0xfff0cc, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  eyeGlow.position.y = -.6; eyeGlow.scale.set(5, 5, 1); g.add(eyeGlow);
  /* motes held in the light (fixed in place: still at rest) */
  const MN = 420, mp = new Float32Array(MN * 3); for (let i = 0; i < MN; i++) { const y = -Math.random() * 37.4, r = (1.2 + (3.3 - 1.2) * (-y / 37.6)) * Math.sqrt(Math.random()), a = Math.random() * 6.283; mp[i * 3] = Math.cos(a) * r; mp[i * 3 + 1] = y; mp[i * 3 + 2] = Math.sin(a) * r }
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const motes = new THREE.Points(mg, new THREE.PointsMaterial({ color: 0xfff4da, size: .07, transparent: true, opacity: .6, depthWrite: false, blending: THREE.AdditiveBlending })); g.add(motes);
  /* ---------- PDF elements placed in the world: the plant photos (pp.21-23) grow in the underground garden ----------
     each page's photos are laid out in the open part of the screen at that page's resting pose (fixed in the world, so they
     shift with a little parallax as the camera moves between garden pages); the other pages' plants stay faint, behind. */
  const WP = [], DUMMY = new THREE.PerspectiveCamera(), PD = 8, FOV = 60; let camRef = null;
  Object.keys(WORLD).forEach(n => { n = +n; const i = STEPS.findIndex(s => s.n === n); (EL[n] || []).forEach((e, k) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    m.renderOrder = 20; m.visible = false; m.userData = { n: n, i: i, f: e[0], ar: e[1] / e[2], k: k, loaded: false }; g.add(m); WP.push(m) }) });
  function justify(ar, w, h, gap) {
    const n = ar.length; let best = null;
    for (let r = 1; r <= n; r++) { const per = Math.ceil(n / r), rows = []; for (let i = 0; i < n; i += per) rows.push(ar.slice(i, i + per).map((a, k) => [a, i + k]));
      let hs = rows.map(row => (w - gap * (row.length - 1)) / row.reduce((s, q) => s + q[0], 0)); const tot = hs.reduce((a, b) => a + b, 0);
      const k = Math.min(1, (h - gap * (rows.length - 1)) / tot); hs = hs.map(x => x * k);
      const area = rows.reduce((s, row, j) => s + row.reduce((t, q) => t + q[0] * hs[j] * hs[j], 0), 0); if (!best || area > best.area) best = { area, rows, hs } }
    const out = []; let y = (h - (best.hs.reduce((a, b) => a + b, 0) + gap * (best.rows.length - 1))) / 2;
    best.rows.forEach((row, j) => { const rw = row.reduce((s, q) => s + q[0] * best.hs[j], 0) + gap * (row.length - 1); let x = (w - rw) / 2;
      row.forEach(q => { const ww = q[0] * best.hs[j]; out[q[1]] = [x, y, ww, best.hs[j]]; x += ww + gap }); y += best.hs[j] + gap });
    return out;
  }
  function placeWorld() {
    const W = innerWidth, H = innerHeight, row = W >= H * 1.1, aspect = W / H, hh = PD * Math.tan(FOV * Math.PI / 360), hw = hh * aspect;
    const tb = TXT.getBoundingClientRect(), rd = TXT.querySelector('.read'), rr = rd && WORLD[STEPS[at].n] ? rd.getBoundingClientRect() : null;
    /* the open rect beside (wide) or above (tall) the reading panel */
    const rect = row ? { x: tb.left, y: tb.top + 4, w: (rr ? rr.left : tb.left + tb.width * .5) - tb.left - 16, h: tb.height - 8 }
                     : { x: tb.left, y: tb.top, w: tb.width, h: (rr ? rr.top : tb.top + tb.height * .45) - tb.top - 12 };
    const fwd = V(0, 0, 0), right = V(0, 0, 0), up = V(0, 0, 0);
    Object.keys(WORLD).forEach(n => { n = +n; const ms = WP.filter(m => m.userData.n === n); if (!ms.length || !POSE.length) return; const i = ms[0].userData.i, P = POSE[i];
      DUMMY.position.copy(P.p); DUMMY.up.set(0, 1, 0); DUMMY.lookAt(P.l); const q = DUMMY.quaternion;
      fwd.set(0, 0, -1).applyQuaternion(q); right.set(1, 0, 0).applyQuaternion(q); up.set(0, 1, 0).applyQuaternion(q);
      const L = justify(ms.map(m => m.userData.ar), Math.max(80, rect.w), Math.max(80, rect.h), 8);
      ms.forEach((m, k) => { const b = L[k], px = rect.x + b[0] + b[2] / 2, py = rect.y + b[1] + b[3] / 2, nx = px / W * 2 - 1, ny = 1 - py / H * 2;
        const dz = ((k * 37) % 5) / 4 * 1.4, d = PD + dz, s = d / PD; /* a little depth per photo, same size on screen */
        m.position.copy(P.p).addScaledVector(fwd, d).addScaledVector(right, nx * hw * s).addScaledVector(up, ny * hh * s); m.quaternion.copy(q);
        m.scale.set(b[2] / W * 2 * hw * s, b[3] / H * 2 * hh * s, 1) }) });
  }
  function worldUpdate(a, act, cam) { camRef = cam; const garden = STEPS[a].sec === 'garden';
    WP.forEach(m => { const t = !act || !garden ? 0 : m.userData.n === STEPS[a].n ? 1 : .12; m.material.opacity += (t - m.material.opacity) * .18; if (Math.abs(t - m.material.opacity) < .005) m.material.opacity = t;
      m.visible = m.material.opacity > .005; if (garden && !m.userData.loaded) { m.userData.loaded = true; tex(EIMG(m.userData.f, true), tt => { m.material.map = tt; m.material.needsUpdate = true }) } }) }
  const RC = new THREE.Raycaster(), NV = new THREE.Vector2();
  function pickWorld(x, y) { if (!camRef) return null; const vis = WP.filter(m => m.visible && m.material.opacity > .5); if (!vis.length) return null;
    NV.set(x / innerWidth * 2 - 1, 1 - y / innerHeight * 2); RC.setFromCamera(NV, camRef); const h = RC.intersectObjects(vis, false)[0]; return h ? h.object.userData : null }
  /* ---------- brief state ---------- */
  let at = 0, active = true, unlocked = !!ctx.unlocked, reached = unlocked ? NS - 1 : 0, trans = null, enter = null, beat = null, settleAt = performance.now();
  let drag = null, pinch = null, wheelAcc = 0, wheelT = 0, wheelLock = false, wheelLockT = 0, wheelHinted = false;
  const pts = new Map();
  const TXT = ctx.text, DIAL = ctx.dial, PROG = ctx.prog, CV = document.getElementById('c');
  const small = () => innerWidth < 700;
  /* veil: calms the world behind the reading layer; also carries the short dissolve between places */
  const VEIL = document.createElement('div'); VEIL.id = 'seveil'; document.body.insertBefore(VEIL, TXT);
  /* hint: one short functional line, shown where navigation is held or limited, then gone */
  const HINT = document.createElement('div'); HINT.id = 'sehint'; HINT.setAttribute('role', 'status'); document.body.appendChild(HINT);
  let hintTO = 0;
  function hint(s, ms) { HINT.textContent = s; HINT.classList.add('on'); clearTimeout(hintTO); hintTO = setTimeout(() => HINT.classList.remove('on'), ms || 2600); log('hint', s) }
  /* full-size viewer: the whole PDF plate (or a gallery drawing), on demand; tap, Back or Esc returns to where you were */
  const LB = document.createElement('div'); LB.id = 'selb'; LB.hidden = true;
  LB.innerHTML = '<img alt="" draggable="false"><p class="cap"></p><button type="button" class="x" aria-label="close">×</button><p class="hint">tap, ‹ back or esc to return</p>'; document.body.appendChild(LB);
  let lbFrom = null;
  function openLB(f, label, from, isEl) { const im = LB.querySelector('img'); im.src = isEl ? EIMG(f, false) : PIMG(f, false); LB.querySelector('.cap').textContent = label || ''; LB.hidden = false; lbFrom = from || null; html().classList.add('selb'); log('lb', f) }
  function closeLB() { if (LB.hidden) return false; LB.hidden = true; html().classList.remove('selb'); if (lbFrom) { try { lbFrom.focus({ preventScroll: true }) } catch (e) {} lbFrom.classList.add('was'); setTimeout(() => lbFrom && lbFrom.classList.remove('was'), 1200) } log('lb', 0); return true }
  const html = () => document.documentElement;
  ['pointerdown', 'pointerup', 'pointermove', 'wheel', 'touchstart', 'touchmove'].forEach(t => LB.addEventListener(t, e => { e.stopPropagation(); if (t === 'touchmove') e.preventDefault() }, { passive: false }));
  LB.addEventListener('click', e => { e.stopPropagation(); closeLB() });
  /* ---------- the reading layer: plates (or the gallery grid) + the reading panel ---------- */
  function plateHTML(st) {
    const P = platesOf(st);
    if (st.k === 'gallery') return '<div class="grid">' + P.map(x => `<button type="button" class="cell" data-f="${x[0]}" data-n="${x[3]}" aria-label="open p. ${x[3]} full size"><img src="${PIMG(x[0], true)}" width="${x[1]}" height="${x[2]}" alt="" draggable="false"><i>p. ${x[3]}</i></button>`).join('') + '</div>';
    return P.map(x => `<button type="button" class="plate${x[4] ? ' el' : ''}" data-f="${x[0]}" data-n="${st.n}"${x[4] ? ' data-el="1"' : ''} data-ar="${(x[1] / x[2]).toFixed(4)}" aria-label="open full size"><img src="${x[4] ? EIMG(x[0], small()) : PIMG(x[0], small())}" width="${x[1]}" height="${x[2]}" alt="" draggable="false"></button>`).join('');
  }
  const st0 = () => STEPS[at];
  function render(i) {
    const st = STEPS[i], R = readHTML(st), P = plateHTML(st);
    TXT.dataset.k = st.k; TXT.dataset.n = st.n || ''; TXT.dataset.np = platesOf(st).length;
    const cap = !R && st.k === 'page' ? `<p class="pcap">${esc(st.bs.h)} · p. ${st.n} / 32</p>` : '', beatLab = i === LIGHT ? '<p class="beatlab">light beat</p>' : '';
    TXT.innerHTML = (P ? `<div class="plates">${P}</div>` : '') + (R ? `<div class="read">${R}</div>` : '') + cap + beatLab;
    TXT.classList.toggle('noread', !R); TXT.classList.toggle('noplate', !P); TXT.classList.toggle('side', i === LIGHT); TXT.classList.toggle('world', !!(st.n && WORLD[st.n]));
    TXT.style.animation = 'none'; void TXT.offsetWidth; TXT.style.animation = '';
    fit(); progress(); log('text', st.n || st.k);
  }
  /* fit the words to the panel (never a scrollbar): start at a comfortable size, step down only if a long page needs it */
  const rdq = () => TXT.querySelector('.read');
  function fit() {
    const W = innerWidth, H = innerHeight, row = W >= H * 1.1;
    TXT.classList.toggle('row', row); TXT.classList.toggle('col', !row);
    const rd = TXT.querySelector('.read');
    TXT.classList.remove('wide', 'w2', 'w3'); TXT.classList.toggle('cols', !!(rdq() && rdq().querySelector('p:not(.by):not(.sub):not(.hint):not(.fullp):not(.note)')));
    if (rd) { const f0 = H < 500 ? 15.5 : W < 700 ? 16.5 : 18, over = () => rd.scrollHeight > rd.clientHeight + 1 || rd.scrollWidth > rd.clientWidth + 1;
      const shrink = min => { let fs = f0; rd.style.fontSize = fs + 'px'; while (over() && fs > min) { fs -= .5; rd.style.fontSize = fs + 'px' } return fs };
      let fs = shrink(14);
      /* still too long: first a wider panel beside narrower plates, then the panel takes the whole width (in columns when wide);
         the plate is always one tap away (full page ⤢) */
      if (over() && row) { TXT.classList.add('w2'); fs = shrink(13.5) }
      if (over() && row) { TXT.classList.remove('w2'); TXT.classList.add('w3'); fs = shrink(13) }
      if (over() && !row) { TXT.classList.add('wide'); fs = shrink(13) }
      if (over()) fs = shrink(12);
      TXT.dataset.fs = fs; TXT.dataset.over = over() ? 1 : 0 }
    const gr = TXT.querySelector('.grid'); if (gr) layoutGrid(gr);
    const pw = TXT.querySelector('.plates'); if (pw && !gr) layoutPlates(pw);
    placeWorld();
  }
  /* plates / elements: justified rows that fill the plate area without cropping (tries 1..n rows, keeps the largest) */
  function layoutPlates(pw) {
    const bs = [...pw.querySelectorAll('.plate')]; if (!bs.length) return; const ar = bs.map(b => +b.dataset.ar), n = ar.length, gap = 8;
    pw.style.display = 'block'; const box = pw.getBoundingClientRect(); pw.style.display = '';
    let best = null;
    for (let r = 1; r <= n; r++) { const per = Math.ceil(n / r), rows = []; for (let i = 0; i < n; i += per) rows.push(ar.slice(i, i + per).map((a, k) => [a, i + k]));
      let hs = rows.map(row => (box.width - gap * (row.length - 1)) / row.reduce((s, q) => s + q[0], 0)); const tot = hs.reduce((a, b) => a + b, 0) + gap * (rows.length - 1);
      const k = Math.min(1, (box.height - gap * (rows.length - 1)) / Math.max(1, tot - gap * (rows.length - 1))); hs = hs.map(h => h * k);
      const area = rows.reduce((s, row, j) => s + row.reduce((t, q) => t + q[0] * hs[j] * hs[j], 0), 0); if (!best || area > best.area) best = { area, rows, hs } }
    best.rows.forEach((row, j) => row.forEach(q => { const b = bs[q[1]]; b.style.width = Math.floor(q[0] * best.hs[j]) + 'px'; b.style.height = Math.floor(best.hs[j]) + 'px' }));
    pw.dataset.rows = best.rows.length;
  }
  /* gallery: 2 columns on a phone, 3 on a tall tablet, 4 when wide; cells sized so the whole grid fits without scrolling */
  function layoutGrid(gr) {
    const box = gr.parentNode.getBoundingClientRect(), n = gr.children.length, W = innerWidth, H = innerHeight;
    const c = W < 600 ? 2 : W < H * 1.1 ? 3 : 4, r = Math.ceil(n / c), gap = 10, capH = 20, ar = 2200 / 1238;
    const cw = Math.max(60, Math.min((box.width - gap * (c - 1)) / c, ((box.height - gap * (r - 1)) / r - capH) * ar));
    gr.style.gridTemplateColumns = `repeat(${c}, ${Math.floor(cw)}px)`; gr.dataset.cols = c;
  }
  function progress() {
    const st = STEPS[at], sec = PROG.querySelector('.sec'), t = PROG.querySelector('.t');
    sec.textContent = st.bs ? st.bs.h : '';
    t.textContent = st.k === 'gallery' ? 'pp. ' + st.n + '–' + st.n2 + ' / 32' : st.n ? 'p. ' + st.n + ' / 32' : '32 / 32 · end';
    PROG.dataset.step = at; PROG.classList.toggle('first', !at); PROG.classList.toggle('last', at >= NS - 1);
  }
  /* mini dial (DOM): one tick per section + the sun; tap a tick to go to that section */
  DIAL.innerHTML = '<i class="sun"></i>' + SEC_START.map(i => `<b data-i="${i}" class="${i === LIGHT ? 'lt' : ''}" style="--a:${(-ang(i) + Math.PI / 2).toFixed(4)}rad"></b>`).join('');
  const dSun = DIAL.querySelector('.sun');
  DIAL.addEventListener('pointerdown', e => e.stopPropagation());
  DIAL.addEventListener('click', e => { const b = e.target.closest('b[data-i]'); if (b) goTo(+b.dataset.i) });
  PROG.querySelector('.pv').addEventListener('click', () => go(-1));
  PROG.addEventListener('pointerdown', e => e.stopPropagation());
  /* gestures on the reading layer: a drag anywhere steps one page; taps open plates / jump from the contents */
  TXT.addEventListener('pointerdown', e => { if (!active || !e.target.closest('.plates,.read')) return; e.stopPropagation(); try { TXT.setPointerCapture(e.pointerId) } catch (x) {} down(e) });
  TXT.addEventListener('pointermove', e => { if (active) move(e) });
  TXT.addEventListener('pointerup', e => { if (active) up(e) });
  TXT.addEventListener('pointercancel', e => { pts.delete(e.pointerId); pinch = null; if (drag && drag.id === e.pointerId) { drag = null; snapBack() } });
  ['touchstart', 'touchmove'].forEach(t => TXT.addEventListener(t, e => { if (e.target.closest('.plates,.read')) e.preventDefault() }, { passive: false }));
  TXT.addEventListener('click', e => e.preventDefault());
  /* the wheel over the reading layer steps too (same one-gesture rule as over the world) */
  TXT.addEventListener('wheel', e => { if (!active) return; e.preventDefault(); wheel(e) }, { passive: false });
  /* ---------- moving: one gesture = one page ---------- */
  function go(d) { if (closeLB() && d < 0) return; if (enter) return;
    const t = at + d; if (t < 0) { hint('this is page 1 · › or swipe for the next page'); return } if (t > NS - 1) { hint('this is the end of the brief · 3d room › opens the six chapters'); return }
    goTo(t) }
  function goTo(t) { t = clampS(t); closeLB(); if (t === at && !trans) return; const from = at; at = t; if (at > reached) reached = at;
    const cut = STEPS[from].sec !== STEPS[at].sec || Math.abs(from - at) > 1;
    trans = { kind: cut ? 'fade' : 'glide', p0: cp.clone(), l0: cl.clone(), t0: performance.now(), d: cut ? T_FADE : T_GLIDE, v0: veilX, jumped: false };
    beat = null; render(at); log('go', [from, at]);
    if (at === UNLOCK && !unlocked) { unlocked = true; ctx.onUnlock(); log('unlock', 1) } }
  function snapBack() { TXT.style.setProperty('--dx', '0px'); TXT.style.setProperty('--dy', '0px'); TXT.classList.remove('drag') }
  function down(e) {
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) { drag = null; snapBack(); const a = [...pts.values()]; pinch = { d0: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y), done: false }; return }
    if (pts.size > 2 || enter) return;
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: 0, t0: performance.now(), tgt: e.target, smp: [[performance.now(), e.clientX, e.clientY]] };
  }
  function move(e) {
    const p = pts.get(e.pointerId); if (p) { p.x = e.clientX; p.y = e.clientY }
    if (pinch && pts.size >= 2) { const a = [...pts.values()], d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y), k = pinch.d0 > 0 ? d / pinch.d0 : 1;
      if (!pinch.done && k < .72) { pinch.done = true; if (!LB.hidden) closeLB(); else if (unlocked) leave(); else hint('the 3d room opens after the last page · swipe to keep reading') }
      if (!pinch.done && k > 1.35) { pinch.done = true; const pl = TXT.querySelector('.plate,.cell'); const st = STEPS[at]; if (st.pg) openLB(st.pg.img[0][0], 'p. ' + st.n + ' / 32', null); else if (pl) openLB(pl.dataset.f, 'p. ' + pl.dataset.n + ' / 32', pl) } return }
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0; drag.moved = Math.max(drag.moved, Math.abs(dx), Math.abs(dy)); if (drag.moved < 6) return;
    drag.smp.push([performance.now(), e.clientX, e.clientY]); if (drag.smp.length > 8) drag.smp.shift();
    /* the page follows the finger a little (never more than one page; nothing moves until you let go) */
    const hz = Math.abs(dx) >= Math.abs(dy); TXT.classList.add('drag');
    TXT.style.setProperty('--dx', (hz ? Math.max(-48, Math.min(48, dx * .3)) : 0) + 'px'); TXT.style.setProperty('--dy', (hz ? 0 : Math.max(-36, Math.min(36, dy * .25))) + 'px');
    if (!drag.hinted && Math.max(Math.abs(dx), Math.abs(dy)) > Math.min(innerWidth, innerHeight) * .7) { drag.hinted = true; hint('one page per swipe') }
  }
  function up(e) {
    pts.delete(e.pointerId); if (pinch) { if (pts.size < 2) pinch = null; return }
    if (!drag || drag.id !== e.pointerId) return; const D = drag; drag = null; snapBack(); const now = performance.now();
    if (D.moved < 8 && now - D.t0 < 450) { tap(e.clientX, e.clientY, D.tgt); return }
    const dx = e.clientX - D.x0, dy = e.clientY - D.y0, hz = Math.abs(dx) >= Math.abs(dy), d = hz ? dx : dy;
    const sm = D.smp.filter(q => now - q[0] < 120), v = sm.length > 1 ? ((hz ? sm[sm.length - 1][1] - sm[0][1] : sm[sm.length - 1][2] - sm[0][2]) / Math.max(1, sm[sm.length - 1][0] - sm[0][0])) : 0;
    if (Math.abs(d) >= 44 || (Math.abs(d) >= 16 && Math.abs(v) > .35)) { go(d < 0 ? 1 : -1); log('drag', [d < 0 ? 1 : -1, at]) } else log('drag', [0, at]);
  }
  function tap(x, y, tgt) {
    const el = tgt && tgt.closest ? tgt : null;
    const pl = el && el.closest('.plate,.cell,.full'); if (pl) { openLB(pl.dataset.f, 'p. ' + pl.dataset.n + ' / 32', pl, !!pl.dataset.el); return }
    const wp = pickWorld(x, y); if (wp) { openLB(wp.f, 'p. ' + wp.n + ' / 32', null, true); return }
    const jb = el && el.closest('[data-go]'); if (jb) { goTo(+jb.dataset.go); return }
    if (el && el.closest('.room')) { leave(); return }
    if (unlocked && ctx.pickCluster) { const C = ctx.pickCluster(x, y); if (C) { leave(C); return } }
    log('tap', at)
  }
  function wheel(e) { if (enter || !LB.hidden) return; if (e.ctrlKey) { if (e.deltaY > 2) { if (unlocked) leave(); else if (!wheelHinted) { wheelHinted = true; hint('the 3d room opens after the last page') } } return }
    /* one wheel / trackpad gesture = one page: after a page, the wheel waits until it has been quiet for 260 ms */
    const now = performance.now(); if (now - wheelT > 260) { wheelAcc = 0; wheelLock = false } wheelT = now;
    if (wheelLock) { if (now - wheelLockT > 900 && !wheelHinted) { wheelHinted = true; hint('one page per scroll · pause, then scroll again') } return }
    wheelAcc += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(wheelAcc) > 70) { go(Math.sign(wheelAcc)); wheelLock = true; wheelLockT = now; wheelHinted = false } }
  function key(e) { if (enter) return;
    if (!LB.hidden) { if (['Escape', 'Enter', ' ', 'Backspace'].includes(e.key)) { e.preventDefault(); closeLB() } return }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); if (e.repeat) hint('one page per key press'); else go(1) }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); if (e.repeat) hint('one page per key press'); else go(-1) }
    else if (e.key === 'Escape') { if (unlocked) leave(); else hint('the 3d room opens after the last page · keep reading, or home') }
    else if (e.key === 'Home') home() }
  function leave(C) { if (!active) return; active = false; closeLB(); drag = trans = null; pts.clear(); pinch = null; snapBack(); ctx.onLeave(C || null); log('leave', C ? C.k : 'sky') }
  function enterFrom(pos, look, a) { active = true; enter = { p: pos.clone(), l: look.clone(), t0: performance.now() }; if (a != null) at = clampS(a); trans = null; render(at); log('enter', at) }
  /* ᑕᐣᓯ inside Spirit Eye: once the chapters are open, out to the 3d room; before that, back to page 1 (and say why) */
  function home() { if (unlocked) { leave(); return } hint('the 3d room opens after the last page · back to page 1'); if (at !== 0) goTo(0) }
  /* ---------- per frame ---------- */
  const cp = V(0, 0, 0), cl = V(0, 0, 0), lastCam = { p: V(0, 0, 0), l: V(0, 0, 0) };
  let veilX = 0, sunS = 0, offX = 0, offY = 0, lastT = performance.now(), started = false;
  function update(now, cam) {
    const dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
    if (!started) { started = true; cp.copy(POSE[at].p); cl.copy(POSE[at].l); render(at) }
    let fadeV = 0;
    if (trans) { const u = Math.min(1, (now - trans.t0) / trans.d), P = POSE[at];
      if (trans.kind === 'glide') { const k = EASE(u); cp.lerpVectors(trans.p0, P.p, k); cl.lerpVectors(trans.l0, P.l, k) }
      else { const mid = .42; if (u < mid) fadeV = trans.v0 + (1 - trans.v0) * (u / mid); else { if (!trans.jumped) { trans.jumped = true; cp.copy(P.p); cl.copy(P.l) } fadeV = 1 - (u - mid) / (1 - mid) } }
      if (u >= 1) { cp.copy(P.p); cl.copy(P.l); trans = null; settleAt = now; fadeV = 0 } }
    else if (active && !enter) { cp.copy(POSE[at].p); cl.copy(POSE[at].l) }
    /* the light beat: once, short and quiet, each time p.16 arrives (it never holds or blocks the page) */
    const rest = !trans && !enter && active;
    if (rest && at === LIGHT && !beat && now - settleAt < 400) beat = { t0: now };
    if (at !== LIGHT) beat = null;
    let B = 0; if (beat) { const u = (now - beat.t0) / T_BEAT; B = u >= 1 ? 0 : Math.sin(Math.PI * Math.min(1, u)) ** 2; if (u >= 1) beat.done = true }
    const nearL = at === LIGHT ? .7 : (Math.abs(at - LIGHT) === 1 ? .5 : .38);
    const L = Math.min(1, nearL + .55 * B);
    /* veil: the world calmer behind pages, clear on the closing page and while the light lands */
    const vBase = !active ? 0 : at === UNLOCK ? .08 : at === LIGHT ? .22 - .16 * B : WORLD[st0().n] ? .1 : .36;
    veilX += (vBase - veilX) * Math.min(1, dt * 6); VEIL.style.opacity = Math.max(veilX, fadeV).toFixed(3);
    const a = ang(sunS); sunS += (at - sunS) * Math.min(1, dt * 5); sun.position.set(Math.cos(a) * 7.6, .9, -Math.sin(a) * 7.6); sunCore.position.copy(sun.position);
    const above = cam.position.y > 0 ? .55 : 1; UB.uI.value = (.32 + .5 * L) * above; pool.material.opacity = .35 + .4 * L; eyeGlow.material.opacity = .5 + .5 * L; fibers.material.opacity = .12 + .26 * L; motes.material.opacity = .25 + .65 * L;
    if (active || enter) {
      let p = cp, l = cl;
      if (enter) { const u = Math.min(1, (now - enter.t0) / T_ENTER), k = EASE(u); p = cp.clone().lerpVectors(enter.p, POSE[at].p, k); l = cl.clone().lerpVectors(enter.l, POSE[at].l, k); if (u >= 1) { enter = null; settleAt = now; cp.copy(POSE[at].p); cl.copy(POSE[at].l) } }
      cam.position.copy(p); cam.up.set(0, 1, 0); cam.lookAt(l); lastCam.p.copy(p); lastCam.l.copy(l);
    }
    /* keep the world's focus in the open part of the screen (beside / above the reading layer) */
    const W = innerWidth, H = innerHeight, row = W >= H * 1.1, st = STEPS[at];
    let tx = 0, ty = 0; if (active && st.k === 'page' && !WORLD[st.n]) { if (at === LIGHT) { if (row) tx = -W * .23; else ty = -H * .2 } else if (row) tx = TXT.classList.contains('noread') ? 0 : W * .22; else ty = TXT.classList.contains('noplate') ? 0 : H * .16 }
    if (active && at === UNLOCK) { if (row) tx = W * .2; else ty = H * .2 }
    offX += (tx - offX) * Math.min(1, dt * 5); offY += (ty - offY) * Math.min(1, dt * 5);
    if (Math.abs(offX) > .5 || Math.abs(offY) > .5) cam.setViewOffset(W, H, offX, offY, W, H); else if (cam.view && cam.view.enabled) cam.clearViewOffset();
    const camY = cam.position.y;
    under.visible = camY < .4; ceil.visible = camY < .4;
    faceM.opacity = Math.max(.18, Math.min(1, (Math.hypot(cam.position.x, cam.position.y - .6, cam.position.z) - 2.2) / 7)); housing.material.opacity = .5 + .42 * faceM.opacity;
    water.material.opacity = camY < 0 ? .98 : .9;
    halo.material.opacity = .22 * (active ? 1 : .6);
    worldUpdate(at, active, cam);
    const ds = DIAL.dataset; if (ds.s !== sunS.toFixed(3)) { ds.s = sunS.toFixed(3); dSun.style.transform = `rotate(${(-a + Math.PI / 2).toFixed(4)}rad) translateY(-19px)`;
      const cur = SEC_START.filter(x => x <= at).pop(); DIAL.querySelectorAll('b').forEach(b => b.classList.toggle('on', +b.dataset.i === cur)) }
  }
  const LOG = []; function log(k, v) { LOG.push([Math.round(performance.now()), k, v]); if (LOG.length > 400) LOG.shift() }
  function resize(aspect) { layoutPath(aspect); if (!trans && active) { cp.copy(POSE[at].p); cl.copy(POSE[at].l) } fit() }
  if (document.fonts) document.fonts.ready.then(() => fit());
  return { group: g, get active() { return active }, get unlocked() { return unlocked }, update, down, move, up, wheel, key, enterFrom, leave, resize, home, log: LOG, NS, STEPS, closeLB, get lbOpen() { return !LB.hidden },
    hit(x, y, cam) { const v = V(0, .6, 0).project(cam); if (v.z > 1) return false; const sx = (v.x + 1) / 2 * innerWidth, sy = (1 - v.y) / 2 * innerHeight; const e = V(6.7, .6, 0).project(cam), r = Math.hypot((e.x + 1) / 2 * innerWidth - sx, (1 - e.y) / 2 * innerHeight - sy); return Math.hypot(x - sx, y - sy) < Math.max(40, r) },
    st: () => { const st = STEPS[at]; return { stop: at, n: st.n || null, n2: st.n2 || null, k: st.k, sec: st.bs ? st.bs.h : null, rest: !trans && !enter, active, unlocked, reached, trans: !!trans, enter: !!enter, beat: beat ? +((performance.now() - beat.t0) / T_BEAT).toFixed(2) : null, lb: !LB.hidden, NS, fs: +TXT.dataset.fs || null } },
    go: d => go(d), jump: i => goTo(i) };
}
/* ---------- no WebGL: the brief as one simple page ---------- */
export function fallback(el) {
  el.innerHTML = '<div class="se-seq">' + STEPS.map(st => {
    if (st.k === 'end') return `<section class="se-s se-end"><div class="read">${readHTML(st).replace(/<p class="hint">[\s\S]*<\/p>$/, '')}</div></section>`;
    const P = platesOf(st), R = readHTML(st).replace(/<p class="hint">[^<]*<\/p>/, '').replace(/<p class="fullp">[\s\S]*?<\/p>/, '');
    const lab = st.k === 'gallery' ? 'pp. ' + st.n + '–' + st.n2 + ' / 32' : 'p. ' + st.n + ' / 32';
    const ims = (st.pg && WORLD[st.pg.n] ? EL[st.pg.n].map(x => x.concat([st.n, 'el'])) : P).map(x => `<img src="${x[4] ? EIMG(x[0], true) : PIMG(x[0], true)}" width="${x[1]}" height="${x[2]}" alt="" loading="lazy">`).join('');
    const light = st.n === 16 ? '<div class="se-light" aria-hidden="true"><div class="beam"></div></div>' : '';
    return `<section class="se-s${st.k === 'gallery' ? ' gal' : ''}" data-n="${st.n}"><p class="pn">${st.bs ? st.bs.h + ' · ' : ''}${lab}</p><div class="ims">${ims}</div>${light}${R ? '<div class="read">' + R + '</div>' : ''}</section>`;
  }).join('') + '</div>';
  el.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { const s = el.querySelectorAll('.se-s')[+b.dataset.go]; if (s) s.scrollIntoView() }));
}
