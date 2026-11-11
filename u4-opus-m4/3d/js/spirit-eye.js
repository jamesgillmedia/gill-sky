/* Spirit Eye of skwácháýs · save 2 · Gill's mix of concepts C (Moves With the Sun) and A (Descent Through the Eye).
   C: the spindle whorl is a circular control above the water; dragging moves the sun mark around it, one sector per PDF section,
      and a release glides to the nearest section in ~0.5 s (cubic-bezier .22,1,.36,1). Nothing auto-advances.
   A: at the key sections the camera travels: into the eye, across the water, down the column of light, a held beat on the light
      itself (no text), into the garden, then back up to the circle.
   Text only at rest at a stop; it fades in after the camera settles. Silent (no audio until Gill supplies real sound).
   Every word below is quoted from Gill's Spirit Eye PDF (SpiritEye.pdf, Jul 11 2025) or, for the title / credit, from m4's approved
   wording. Ligatures written out (fl, fi). Kept as written: "the the", "people’s", "Tsleil- Waututh", "100’s", "deerlake", "Trillium park".
   Self-contained: main.js only calls mount(...) and the returned controller. Replace this file to change the anchor. */
const BASE = new URL('../', import.meta.url).href; /* 3d/ */
const IMG = n => BASE + 'media/spirit-eye/s2/' + n + '.webp';
export const data = {
  title: 'Spirit Eye of skwácháýs',
  byline: 'joshua ngenda & gill james',                     /* PDF p.1 */
  credit: "Spirit Eye of skwácháýs, a public art concept co-created with Joshua Ngenda, was recognized with Best Public Art Concept and Council's Choice within the BIDC Public Art Intensive.", /* m4 bio, exact */
  page: BASE + '../space/spirit-eye/'
};
/* sections in C's order; `light` is Gill's dedicated beat (no text) between materials and ecosystem */
export const STOPS = [
  { k: 'arrival', h: data.title, by: data.byline, p: [data.credit] },
  { k: 'land', h: 'LAND ACKNOWLEDGEMENT', p: ['the unceded, unsurrendered, and ancestral homelands of the hən̓q̓əmin̓əm̓ and Sḵwxw̱ú7mesh Sníchim speaking people’s of the xʷməθkʷəy̓əm (Musqueam), Sḵwxw̱ú7mesh Úxwumixw (Squamish Nation) and səlilwətaɬ (Tsleil- Waututh) peoples, and the the supernatural tunnels of Sínulhķaý'] },
  { k: 'site', h: 'SITE SIGNIFICANCE', sub: ['Skwácháýs', 'Place where water is drawn down into a whirlpool'],
    p: ['Trillium Park is located on the northern edge of Skwácháýs. Skwácháýs is a supernatural place of significance with mud pools being portals to the Spirit World with underground tunnels carved by Sínulhķaý / sʔi:ɬqəy̓ Connecting lakes and pools as far as deerlake and up into the interior.',
        'Trillium park was an intertidal mudflat. It was an area of mariculture and hunting such as clam gardening and duck hunting.'] },
  { k: 'description', h: 'DESCRIPTION', p: ['Centering art as infrastructure, the human need for light and nature, a forest garden that both sustains life and materials for creation.',
        'A giant lens floating on the ocean surface, reminiscent of a salish spindle whorl, moves with the sun and allows for water to pass over in stormy weather. Projects light underground through a large cluster of fibre optics'] },
  { k: 'statement', h: 'ARTIST STATEMENT', p: ['Incorporating the Skwxwú7mesh & xʷməθkʷəy̓əm legend of Sínulhķaý / sʔi:ɬqəy̓ the two headed serpent and the supernatural world.',
        'After having been blocked by city infrastructure for 100’s of years the spindle whorls reopen the ancestral portals to the underworld and the place where people reside.',
        'A supernatural place of healing and creation where the society relearns forgotten techniques and cultural practices ready to reemerge and caretake the world.'] },
  { k: 'materials', h: 'MATERIALS', pairs: [['protecting structure & whorl housing', 'concrete aggregate with steel reinforcements'], ['sky lens', 'composite glass fresnel prismatic lens & ground glass projection plate'], ['fiber optic cables'], ['adaptive forest garden installation (underground)']] },
  { k: 'light' },
  { k: 'ecosystem', h: 'ECOSYSTEM INTERACTIONS', sub: ['Subterranean Forest Garden Novel Ecosystem'],
    p: ['a forest garden ecosystem that takes elements of how the area existed prior to 1850 while also introducing non native plants that support life and creation.',
        'layered structure mimicking natural forest structure with large cedar cottonwood and fir trees around the outside, with an understory and inner wetland that maximizes biodiversity with an emphasis on plants that feed that community, support cultural practices and support creation.'],
    plants: ['Indigo - as a source of dye', 'hibiscus - culinary, medicinal, cosmetic', 'common camas- medicinal,', 'mullein - medicinal', 'kinnikinnnick- medicinal, cullinary', 'sweetgrass- ceremonial', 'rice- culinary', 'swamp lanterns- culinary, medicinal',
      'cattails - culinary, medicinal, art', 'cotton- clothing, materials', 'stinging nettle- medicinal, culinary, rope, cloth', 'devils club- medicinal', 'taro- culinary', 'yam- culinary', 'elderberry- medicinal', 'plantain- culinary, medicinal, fibre',
      'red cedar - clothing, art, building, ceremony', 'red alder- dye, tools', 'yew tree- tool handles', 'cottonwood- medicinal, ceremonial', 'fir tree- medicinal (bark, needles)', 'oregon grape- culinary, medicina', 'wild ginger- culinary, medicinal', 'salmon berry- culinary, medicinal, fibre'] },
  { k: 'community', h: 'COMMUNITY VALUE', list: ['Provide light to sustain life and creation', 'Opportunities for artists', 'Educating community', 'Intergenerational caretakers ie descendants of Cease Whyss', 'Place for cultural practice', 'Food sovereignty', 'Relearning traditional techniques and practices'] }
];
const NS = STOPS.length, UNLOCK = 8;
/* images per stop, placed relative to that stop's camera: [file, depth, right, up, width] (drawings from the PDF; s8-* from the Nov 11 pptx slide 8) */
const PLACE = {
  land: [['p02-behind-eye', 17, 0, 3.6, 9.5]],
  site: [['p12-scene3', 13, -3.2, 2.6, 6.2], ['p13-view2', 21, 4.4, 3.4, 7.2], ['p10-water', 30, -1.5, 5.6, 10]],
  description: [['s8-clouds', 46, 0, 10, 20], ['p09-scene4', 12, -3.4, 3.4, 5.4], ['p06-scale', 17, 4.4, 4.6, 6.4]],
  statement: [['p01-eye', 4.2, 0, .2, 4.6], ['p19-close-eye', 7.5, -.8, 1.3, 6.4], ['p05-side-eye', 11, 1.1, -.4, 8], ['p29-sketchlens', 15, -.6, .9, 10]],
  materials: [['s8-whorl', 7, -3.4, 2.6, 3.4], ['p15-whorl-top', 10, 3.6, 2.4, 5], ['p15-side2', 14, -3.8, -1.6, 6], ['p16-scene2', 20, 3.4, -3.2, 8]],
  ecosystem: [['p17-side-view', 15, -3.6, 4.2, 8]],
  community: [['p25-side-eye2', 24, -9.5, -4.2, 5.6], ['p31-sketch4', 27, 10, -4.6, 5.6]]
};
const EASE = bez(0.22, 1, 0.36, 1), T_GLIDE = 500, T_BACK = 300, T_ENTER = 1200;
function bez(x1, y1, x2, y2) {
  const cb = (t, a, b) => 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t, dcb = (t, a, b) => 3 * a * (1 - t) * (1 - t) + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
  return x => { if (x <= 0) return 0; if (x >= 1) return 1; let t = x; for (let i = 0; i < 8; i++) { const d = cb(t, x1, x2) - x, s = dcb(t, x1, x2); if (Math.abs(d) < 1e-5 || !s) break; t -= d / s } return cb(Math.max(0, Math.min(1, t)), y1, y2) };
}
const mod = (a, n) => ((a % n) + n) % n;
export function mount(THREE, scene, ctx) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const g = new THREE.Group(); scene.add(g);
  const LOADER = new THREE.TextureLoader();
  const tex = (f, cb) => LOADER.load(IMG(f), t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (cb) cb(t) });
  /* ---------- camera path: stops (and waypoints) ---------- */
  /* [pos, look, stop index or -1, whorl-relative (pushed back on narrow screens)] */
  const PATH = [
    [V(0, 13, 7.5), V(0, .6, 0), 0, 1],
    [V(-9, 3.2, 9), V(0, 1.2, -3), 1, 1],
    [V(15, 1.3, 13), V(-6, 1.5, -12), 2, 1],
    [V(12, 6, -10), V(0, 1.2, 0), 3, 1],
    [V(0, 3.4, 1.2), V(0, -4, -.3), 4, 0],
    [V(.8, -9, 1.6), V(0, -24, 0), 5, 0],
    [V(5.6, -27.5, 10.5), V(0, -36.6, 0), 6, 0],
    [V(8, -35, 11), V(0, -34, 0), 7, 0],
    [V(1.2, -20, 1.6), V(0, 2, 0), -1, 0],
    [V(.5, 2.4, 2.2), V(0, 8, 9), -1, 0],
    [V(0, 11, 44), V(0, .6, 0), 8, 1]
  ];
  let K = 1, P = [];
  function layoutPath(aspect) {
    K = Math.max(1, Math.min(1.9, 1 / (aspect * 1.25)));
    P = PATH.map(([p, l, s, rel]) => ({ p: rel ? l.clone().add(p.clone().sub(l).multiplyScalar(K)) : p.clone(), l: l.clone(), s: s }));
  }
  const SIDX = []; /* path index of each stop */
  PATH.forEach((q, i) => { if (q[2] >= 0) SIDX[q[2]] = i });
  function pathU(s) { const i = Math.floor(s), f = s - i, a = SIDX[mod(i, NS)], b0 = SIDX[mod(i + 1, NS)], b = b0 <= a ? b0 + P.length : b0; return a + f * (b - a) }
  function cr(p0, p1, p2, p3, t, out) { const t2 = t * t, t3 = t2 * t; return out.set(
    .5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    .5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    .5 * (2 * p1.z + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3)) }
  function poseAt(s, pos, look) { const u = pathU(s), i = Math.floor(u), t = u - i, n = P.length, q = j => P[mod(j, n)];
    cr(q(i - 1).p, q(i).p, q(i + 1).p, q(i + 2).p, t, pos); cr(q(i - 1).l, q(i).l, q(i + 1).l, q(i + 2).l, t, look) }
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
  tex('p07-plan-dial', t => { faceM.map = t; faceM.color.set(0xffffff); faceM.needsUpdate = true });
  const ang = s => Math.PI / 2 - s / NS * 6.283; /* clockwise seen from above */
  const tickPts = []; for (let i = 0; i < NS; i++) { const a = ang(i), r0 = 6.75, r1 = i === 6 ? 7.9 : 7.45; tickPts.push(V(Math.cos(a) * r0, .64, -Math.sin(a) * r0), V(Math.cos(a) * r1, .64, -Math.sin(a) * r1)) }
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
  /* ---------- drawings placed in depth, relative to each stop's camera ---------- */
  const planes = [];
  function placeAll(aspect) {
    planes.forEach(m => g.remove(m)); planes.length = 0;
    const pos = V(0, 0, 0), look = V(0, 0, 0), fwd = V(0, 0, 0), right = V(0, 0, 0), up = V(0, 0, 0), WUP = V(0, 1, 0), sx = Math.min(1, aspect / 1.05);
    STOPS.forEach((st, i) => (PLACE[st.k] || []).forEach(([f, d, x, y, w]) => {
      poseAt(i, pos, look); fwd.copy(look).sub(pos).normalize(); right.crossVectors(fwd, Math.abs(fwd.y) > .97 ? V(0, 0, -1) : WUP).normalize(); up.crossVectors(right, fwd).normalize();
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x1a2230, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
      const yy = sx < 1 && x ? y + Math.sign(x) * w * .3 * (1 - sx) : y; /* narrow screens: side-by-side drawings stack */
      m.position.copy(pos).addScaledVector(fwd, d).addScaledVector(right, x * sx).addScaledVector(up, yy); m.up.copy(up); m.lookAt(pos);
      m.userData = { stop: i, w: w * (sx < 1 ? .5 + .5 * sx : 1), f: f }; m.scale.set(m.userData.w, m.userData.w * .624, 1); m.renderOrder = 4; g.add(m); planes.push(m);
      tex(f, t => { m.material.map = t; m.material.color.set(0xffffff); m.material.needsUpdate = true; m.scale.y = m.userData.w * t.image.height / t.image.width });
    }));
  }
  /* ---------- state ---------- */
  let s = 0, active = true, unlocked = !!ctx.unlocked, drag = null, glide = null, settleAt = performance.now(), shown = -1, enter = null, wheelAcc = 0, wheelT = 0;
  const pts = new Map(); let pinch = null;
  const TXT = ctx.text, DIAL = ctx.dial;
  function stopNow() { return Math.abs(s - Math.round(s)) < 1e-4 ? mod(Math.round(s), NS) : -1 }
  function atRest() { return !drag && !glide && !enter && stopNow() >= 0 }
  function glideTo(t, dur) { glide = { s0: s, t: t, t0: performance.now(), d: dur }; hideText(); log('glide', mod(Math.round(t), NS)) }
  function hideText() { if (shown !== -1) { TXT.classList.remove('on'); shown = -1 } }
  function html(st) {
    const e = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    let o = '', i = 0; const d = () => ` style="transition-delay:${(i++ * .45).toFixed(2)}s"`;
    if (st.h) o += `<h2${d()}>${e(st.h)}</h2>`;
    if (st.by) o += `<p class="by"${d()}>${e(st.by)}</p>`;
    (st.sub || []).forEach(x => o += `<p class="sub"${d()}>${e(x)}</p>`);
    (st.p || []).forEach(x => o += `<p${d()}>${e(x)}</p>`);
    (st.pairs || []).forEach(x => o += `<p class="pair"${d()}><b>${e(x[0])}</b>${x[1] ? '<br>' + e(x[1]) : ''}</p>`);
    if (st.list) { o += '<ul class="cv">'; st.list.forEach(x => o += `<li${d()}>${e(x)}</li>`); o += '</ul>' }
    if (st.plants) { o += `<ul class="plants"${d()}>` + st.plants.map(x => `<li>${e(x)}</li>`).join('') + '</ul>' }
    return o;
  }
  function showText(i) {
    if (shown === i) return; shown = i; const st = STOPS[i];
    TXT.dataset.k = st.k; TXT.innerHTML = st.h ? html(st) : ''; TXT.scrollTop = 0; TXT.classList.remove('on'); void TXT.offsetWidth; if (st.h) TXT.classList.add('on'); tAct(); log('text', st.k);
  }
  /* mini dial (DOM): the same nine sectors + sun; tap a tick to glide there */
  DIAL.innerHTML = '<i class="sun"></i>' + STOPS.map((st, i) => `<b data-i="${i}" class="${st.k === 'light' ? 'lt' : ''}" style="--a:${(-ang(i) + Math.PI / 2).toFixed(4)}rad"></b>`).join('');
  const dSun = DIAL.querySelector('.sun');
  DIAL.addEventListener('pointerdown', e => e.stopPropagation());
  DIAL.addEventListener('click', e => { const b = e.target.closest('b[data-i]'); if (!b || enter) return; const i = +b.dataset.i, cur = Math.round(s), d = mod(i - cur + 4, NS) - 4; glideTo(cur + d, Math.min(900, T_GLIDE + 80 * (Math.abs(d) - 1))) });
  /* the text panel sits over the stage: a sideways drag on it still turns the circle; a vertical drag scrolls it only when it overflows */
  const fits = () => TXT.scrollHeight <= TXT.clientHeight + 1;
  const tAct = () => { TXT.style.touchAction = fits() ? 'none' : 'pan-y' };
  TXT.addEventListener('pointerdown', e => { if (!active) return; e.stopPropagation(); try { TXT.setPointerCapture(e.pointerId) } catch (x) {} down(e); if (drag) drag.txt = !fits() });
  TXT.addEventListener('pointermove', e => { if (active) move(e) });
  TXT.addEventListener('pointerup', e => { if (active) up(e) });
  TXT.addEventListener('pointercancel', e => { pts.delete(e.pointerId); pinch = null; if (drag && drag.id === e.pointerId) { const D = drag; drag = null; glideTo(D.s0, T_BACK) } });
  ['touchstart', 'touchmove'].forEach(t => TXT.addEventListener(t, e => { if (fits()) e.preventDefault() }, { passive: false }));
  /* ---------- input (called by main.js while Spirit Eye is active) ---------- */
  function down(e) {
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) { drag = null; const a = [...pts.values()]; pinch = { d0: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) }; if (!glide && stopNow() < 0) glideTo(Math.round(s), T_BACK); return }
    if (pts.size > 2 || enter) return;
    if (glide) { glide = null } const s0 = Math.round(s);
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, sStart: s, s0: s0, moved: 0, t0: performance.now(), smp: [[performance.now(), s]] };
  }
  function move(e) {
    const p = pts.get(e.pointerId); if (p) { p.x = e.clientX; p.y = e.clientY }
    if (pinch && pts.size >= 2) { const a = [...pts.values()], d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); if (pinch.d0 > 0 && d / pinch.d0 < .72 && unlocked) { pinch = null; leave() } return }
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0; drag.moved = Math.max(drag.moved, Math.abs(dx), Math.abs(dy)); if (drag.moved < 6) return;
    if (drag.txt && Math.abs(dy) > Math.abs(dx)) return; /* scrolling the text */
    const W = innerWidth, H = innerHeight, d = Math.abs(dx) >= Math.abs(dy) ? -dx / (W * .5) : -dy / (H * .36);
    s = drag.sStart + d; hideText(); drag.smp.push([performance.now(), s]); if (drag.smp.length > 8) drag.smp.shift();
  }
  function up(e) {
    const p = pts.get(e.pointerId); pts.delete(e.pointerId); if (pinch) { if (pts.size < 2) pinch = null; return }
    if (!drag || drag.id !== e.pointerId) return; const D = drag; drag = null; const now = performance.now();
    if (D.moved < 8 && now - D.t0 < 380) { tap(e.clientX, e.clientY); if (stopNow() < 0) glideTo(Math.round(s), T_BACK); return }
    const sm = D.smp.filter(q => now - q[0] < 100), v = sm.length > 1 ? (sm[sm.length - 1][1] - sm[0][1]) / Math.max(1, sm[sm.length - 1][0] - sm[0][0]) : 0, ds = s - D.s0;
    let t;
    if (Math.abs(v) > .0016) t = v > 0 ? Math.floor(s + 1e-6) + 1 : Math.ceil(s - 1e-6) - 1;
    else if (Math.abs(ds) >= .25) t = Math.abs(ds) < 1 ? D.s0 + Math.sign(ds) : Math.round(s);
    else t = D.s0;
    glideTo(t, t === D.s0 ? T_BACK : T_GLIDE);
  }
  function tap(x, y) { if (unlocked && ctx.pickCluster) { const C = ctx.pickCluster(x, y); if (C) { leave(C); return } } log('tap', stopNow()) }
  function wheel(e) { if (enter) return; if (e.ctrlKey) { if (e.deltaY > 2 && unlocked) leave(); return }
    const now = performance.now(); if (now - wheelT > 260) wheelAcc = 0; wheelT = now; wheelAcc += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(wheelAcc) > 70) { const base = glide ? Math.round(glide.t) : Math.round(s); glideTo(base + Math.sign(wheelAcc), T_GLIDE); wheelAcc = -1e5 * Math.sign(wheelAcc) } }
  function key(e) { if (enter) return; const base = glide ? Math.round(glide.t) : Math.round(s);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); glideTo(base + 1, T_GLIDE) } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); glideTo(base - 1, T_GLIDE) }
    else if (e.key === 'Escape' && unlocked) leave() }
  function leave(C) { if (!active) return; active = false; hideText(); drag = glide = null; pts.clear(); pinch = null; ctx.onLeave(C || null); log('leave', C ? C.k : 'sky') }
  function enterFrom(pos, look, at) { active = true; enter = { p: pos.clone(), l: look.clone(), t0: performance.now() }; if (at != null) s = at; hideText(); log('enter', Math.round(s)) }
  /* ---------- per frame ---------- */
  const cp = V(0, 0, 0), cl = V(0, 0, 0);
  let lastLog = -1;
  function update(now, cam) {
    if (glide) { const u = Math.min(1, (now - glide.t0) / glide.d); s = glide.s0 + (glide.t - glide.s0) * EASE(u); if (u >= 1) { s = glide.t; glide = null; settleAt = now; const i = stopNow(); if (i >= 0) { s = mod(Math.round(s), NS) } } }
    if (!drag && !glide && !enter && stopNow() < 0) glideTo(Math.round(s), T_BACK);
    const i = stopNow();
    if (i >= 0 && atRest()) { if (now - settleAt > 260) showText(i); if (i === UNLOCK && !unlocked) { unlocked = true; ctx.onUnlock(); log('unlock', 1) } }
    if (i !== lastLog && i >= 0 && atRest()) { lastLog = i; log('at', STOPS[i].k) }
    /* visuals that follow s (same with Reduce Motion: they are positions, not loops) */
    const a = ang(s); sun.position.set(Math.cos(a) * 7.6, .9, -Math.sin(a) * 7.6); sunCore.position.copy(sun.position);
    const sm = mod(s, NS), near = c => Math.max(0, 1 - Math.abs(sm - c) / 1.4);
    const L = Math.max(.38, near(6), .55 * near(5), .6 * near(7)); /* the light is strongest at its own beat */
    const above = cam.position.y > 0 ? .55 : 1; UB.uI.value = (.32 + .5 * L) * above; pool.material.opacity = .35 + .3 * L; eyeGlow.material.opacity = .5 + .5 * L; fibers.material.opacity = .12 + .22 * L; motes.material.opacity = .25 + .65 * L;
    if (active || enter) {
      poseAt(s, cp, cl);
      if (enter) { const u = Math.min(1, (now - enter.t0) / T_ENTER), k = EASE(u); cp.lerpVectors(enter.p, cp, k); cl.lerpVectors(enter.l, cl, k); if (u >= 1) { enter = null; settleAt = now } }
      cam.position.copy(cp); cam.up.set(0, 1, 0); if (Math.abs(cl.x - cp.x) < 1e-3 && Math.abs(cl.z - cp.z) < 1e-3) cl.z -= .01; cam.lookAt(cl);
    }
    const camY = cam.position.y, dC = cam.position.length();
    under.visible = camY < .4; ceil.visible = camY < .4;
    faceM.opacity = Math.max(.18, Math.min(1, (Math.hypot(cam.position.x, cam.position.y - .6, cam.position.z) - 2.2) / 7)); housing.material.opacity = .5 + .42 * faceM.opacity;
    water.material.opacity = camY < 0 ? .98 : .9;
    planes.forEach(m => { const d = Math.abs(sm - m.userData.stop), dd = Math.min(d, NS - d); m.material.opacity = active ? Math.max(0, 1 - dd / .9) : 0; m.visible = m.material.opacity > .01 });
    halo.material.opacity = .22 * (active ? 1 : .6);
    const dsun = DIAL.dataset; if (dsun.s !== sm.toFixed(3)) { dsun.s = sm.toFixed(3); dSun.style.transform = `rotate(${(-a + Math.PI / 2).toFixed(4)}rad) translateY(-19px)`; DIAL.querySelectorAll('b').forEach((b, j) => b.classList.toggle('on', j === i)) }
  }
  const LOG = []; function log(k, v) { LOG.push([Math.round(performance.now()), k, v]); if (LOG.length > 300) LOG.shift() }
  function resize(aspect) { layoutPath(aspect); placeAll(aspect) }
  return { group: g, get active() { return active }, get unlocked() { return unlocked }, update, down, move, up, wheel, key, enterFrom, leave, resize, log: LOG, NS,
    hit(x, y, cam) { const v = V(0, .6, 0).project(cam); if (v.z > 1) return false; const sx = (v.x + 1) / 2 * innerWidth, sy = (1 - v.y) / 2 * innerHeight; const e = V(6.7, .6, 0).project(cam), r = Math.hypot((e.x + 1) / 2 * innerWidth - sx, (1 - e.y) / 2 * innerHeight - sy); return Math.hypot(x - sx, y - sy) < Math.max(40, r) },
    st: () => ({ s: +s.toFixed(4), stop: stopNow(), k: stopNow() >= 0 ? STOPS[stopNow()].k : null, rest: atRest(), text: shown >= 0 ? STOPS[shown].k : null, active, unlocked, glide: !!glide, enter: !!enter }),
    go: d => glideTo((glide ? Math.round(glide.t) : Math.round(s)) + d, T_GLIDE) };
}
/* ---------- no WebGL: the sections as a simple sequence ---------- */
export function fallback(el) {
  const e = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const FIMG = { arrival: ['p07-plan-dial'], land: ['p02-behind-eye'], site: ['p12-scene3'], description: ['p09-scene4'], statement: ['p01-eye'], materials: ['p16-scene2'], ecosystem: ['p17-side-view'], community: ['p25-side-eye2'] };
  el.innerHTML = '<div class="se-seq">' + STOPS.map(st => {
    if (st.k === 'light') return '<section class="se-s light" aria-label="light"><div class="beam" aria-hidden="true"></div></section>';
    let o = `<section class="se-s" data-k="${st.k}">` + (FIMG[st.k] || []).map(f => `<img src="${IMG(f)}" alt="" loading="lazy">`).join('');
    if (st.h) o += `<h2>${e(st.h)}</h2>`; if (st.by) o += `<p class="by">${e(st.by)}</p>`;
    (st.sub || []).forEach(x => o += `<p class="sub">${e(x)}</p>`); (st.p || []).forEach(x => o += `<p>${e(x)}</p>`);
    (st.pairs || []).forEach(x => o += `<p class="pair"><b>${e(x[0])}</b>${x[1] ? '<br>' + e(x[1]) : ''}</p>`);
    if (st.list) o += '<ul class="cv">' + st.list.map(x => `<li>${e(x)}</li>`).join('') + '</ul>';
    if (st.plants) o += '<ul class="plants">' + st.plants.map(x => `<li>${e(x)}</li>`).join('') + '</ul>';
    if (st.k === 'arrival') o += `<p><a href="${data.page}">open ›</a></p>`;
    return o + '</section>';
  }).join('') + '</div>';
}
