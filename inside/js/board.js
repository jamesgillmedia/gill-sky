/* Chapter boards in the 3D sky. Milestone 1 stand-in: no board yet, the camera only flies close to the constellation. */
let E = null, K = null;
export const Board = {
  init(env) { E = env; },
  snapshot() { return null; }, close() { K = null; }, open(k) { K = k; }, key() { return K; },
  cam() { const c = E.D.chapters[K]; return {T: new E.camera.position.constructor(c.cx, c.cy, c.cz), dist: 260, yaw: 0, pitch: 0}; },
  pieceCam(it) { const p = it && (it._home || null); return {T: p ? p.clone() : new E.camera.position.constructor(), dist: 120, yaw: 0, pitch: 0}; },
  tileOf() { return null; }, labels() {}, has() { return false; }, posOf(it) { return it._home; }, bloom() { return 0; },
  pick() { return null; }, select() {}, focus() {}, grab() {}, pinch() {}, drag() {}, release() {}, wheel() {},
  step() {}, relayout() {}, resize() {}
};
