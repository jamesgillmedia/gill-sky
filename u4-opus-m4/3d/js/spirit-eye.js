/* Spirit Eye of skwácháýs: the anchor at the centre of the 3D sky.
   FIRST-SAVE PLACEHOLDER: one deck image + title + credit. Gill is still choosing the presentation concept,
   so everything about the anchor lives in this one module; replace it without touching main.js.
   Interface: SE.data (text + image), SE.mount(THREE, scene) -> {group, radius, update(now, camDist)}, SE.fallback(el). */
const BASE = new URL('../', import.meta.url).href; /* 3d/ */
export const data = {
  title: 'Spirit Eye of skwácháýs',
  /* quoted exactly from Gill's Spirit Eye PDF (SpiritEye.pdf, Jul 11 2025), page 1 */
  byline: 'joshua ngenda & gill james',
  /* exact wording, as on m4's bio and Spirit Eye page (BIDC + Joshua Ngenda credit) */
  credit: "Spirit Eye of skwácháýs, a public art concept co-created with Joshua Ngenda, was recognized with Best Public Art Concept and Council's Choice within the BIDC Public Art Intensive.",
  /* deck image: Spirit Eye PDF page 9 (1219x761 original), metadata stripped, webp */
  img: BASE + 'media/spirit-eye/lens-1200.webp',
  imgSmall: BASE + 'media/spirit-eye/lens-600.webp',
  aspect: 1200 / 749,
  page: BASE + '../space/spirit-eye/'
};
export function mount(THREE, scene, glowTex) {
  const g = new THREE.Group(); scene.add(g);
  const W = 9, H = W / data.aspect;
  const mat = new THREE.MeshBasicMaterial({ color: 0x1a2230, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat); plane.renderOrder = 3; g.add(plane);
  new THREE.TextureLoader().load(data.img, tx => { tx.colorSpace = THREE.SRGBColorSpace; mat.map = tx; mat.color.set(0xffffff); mat.needsUpdate = true; });
  const edge = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([[-1, -1], [1, -1], [1, 1], [-1, 1]].map(p => new THREE.Vector3(p[0] * W / 2, p[1] * H / 2, .01))),
    new THREE.LineBasicMaterial({ color: 0xbff5df, transparent: true, opacity: .35, depthWrite: false, fog: false })); g.add(edge);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x5fd9c0, transparent: true, opacity: .32, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  glow.scale.set(W * 2.6, W * 2.6, 1); glow.position.z = -.3; g.add(glow);
  return { group: g, radius: W / 2, w: W, h: H, plane: plane,
    update(now, camDist) { plane.material.opacity = 1; edge.material.opacity = .2 + .2 * Math.min(1, camDist / 40); } };
}
export function fallback(el) {
  el.innerHTML = '';
  const f = document.createElement('figure'); f.className = 'se-fb';
  const im = document.createElement('img'); im.src = data.imgSmall; im.srcset = data.imgSmall + ' 600w, ' + data.img + ' 1200w'; im.sizes = '(max-width:700px) 92vw, 600px'; im.alt = data.title;
  const h = document.createElement('h1'); h.textContent = data.title;
  const b = document.createElement('p'); b.className = 'by'; b.textContent = data.byline;
  const p = document.createElement('p'); p.textContent = data.credit;
  const a = document.createElement('a'); a.href = data.page; a.textContent = 'open ›';
  f.append(im, h, b, p, a); el.appendChild(f);
}
