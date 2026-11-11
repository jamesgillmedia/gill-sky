# Objects in 3D: exploration note

Note only. No change to the live site comes from this file.

## Hard constraint (read first)

**The object galleries stay exactly as they are.** Same items, same order, same captions, same taps, same pinch and Back behaviour. The 3D view is an **extra layer** on top of a gallery: you enter it from a gallery or from an object (pinch in, or tap), and you leave it the same way you came, by pinch out, ‹ or Back, landing on the same spot in the gallery. A phone that cannot or will not run the 3D layer never loses anything, because the gallery is the page. Nothing is renamed, recaptioned, replaced or degraded to make room for it.

## (a) Feasibility

Yes, in two sizes.

- **2.5D (built, runs today).** A small stack of flat photo planes for one object, each placed at its own depth inside one CSS `perspective` box. One finger orbits (yaw and pitch, clamped), two fingers resize, the phone tilts it. It reads as a real object for a limited arc (about ±30° yaw, ±20° pitch), because the planes are photographs from fixed angles, not geometry. This is the "constellation of views" version: the object is a small constellation of its own photos.
- **True 3D.** A real model per object, orbitable through a full turn. Feasible on a phone with a small glTF, but it needs a model per object, and a model is only as good as the capture. Glass, steel and fine print (the joio cup, a scoop) are the hard cases.

The first prototype is already live as a standalone sketch (see (e)). It has two objects, the joio cup and the scoop.

## (b) What we can reuse

| Piece | Where | Use for 3D |
|---|---|---|
| sketch-3d feel (B4) | DESIGN-SPEC B4; gilljames `sketch-3d`, `sketch-3d-c` (read-only reference) | Free pinch and drag, a ring of night around the subject, "pull back home". Already folded into m4 as the world drifting under the finger and springing back. |
| Constellation pinch depth and layers | `js/depth.js` (`GJ_DEPTH`, `planIn`, `planOut`, `pinchIn`, `viewScale`) | The pinch-in and pinch-out pulse, one history step per layer, return to the same spot. The sketch uses the same pulse (`PL` and `viewScale`) so gallery to 3D feels like the other depth steps. |
| Depth levels | FAR, MID, BOARD, WORK (lv0, lv1, lv2) plus `filmLv`, `piece.lv` | A 3D view would be one more sub-level under WORK, entered from an object, never a new page. |
| Sky camera | `js/sky.js` (one camera, parallax, bloom) | Keep it as the backdrop. The 3D layer sits in `#layer` like the other sheets, so the sky stays visible and the camera is untouched. |
| History | `STEP`, `pushStep`, `onPop`, `syncHist` | One entry per layer, so Back leaves 3D first. The depth change must call `api.paint()` or the step is not pushed. |

## (c) Two routes and what each needs from Gill

### Route 1: 2.5D layered planes (recommended first)

- **Tech:** DOM or CSS 3D (`perspective`, `translateZ`, `rotateX/Y`). No engine, no new dependency, no bundle growth beyond the images. Works with the existing service-worker shell.
- **Per object, Gill supplies:** 3 to 5 photos on a plain or easily cut-out background, shot from slightly different angles (front, about 25° left, about 25° right, optionally above), same distance, same light, object centred. One extra "context" photo is useful for the card behind the object.
- **I do:** cut-outs (or use the background as a soft plate), depth ordering, caption and order unchanged from the gallery.
- **Cost:** about 400 KB to 1.5 MB per object after resizing. Instant to enter.
- **Limit:** a bounded arc; it does not turn all the way round.

### Route 2: true 3D (model per object)

- **Tech:** glTF or GLB with either `<model-viewer>` (easiest, ships its own three.js, around 200 to 300 KB gzipped from a CDN or vendored) or three.js directly (more control, so the sky look and the pinch pulse can match). Either way it is the first real dependency in m4, and it must be vendored under `u4-opus-m4/` so the shell and service worker own it.
- **Per object, Gill supplies one of:**
  - a photogrammetry or LiDAR scan (Polycam, Scaniverse, RealityScan): 40 to 120 overlapping photos around the object on a matte turntable, soft even light, no reflections; export GLB with textures; or
  - a model Gill already has.
  Glass, chrome, steel and anything shiny scan badly. Matte objects scan well.
- **I do:** simplify to under about 150k triangles and a 2k texture, compress (Draco or meshopt, KTX2), target under 2 MB per object, lazy-load only when 3D is entered.
- **Limit:** every object needs real asset work, and a bad scan is worse than the 2.5D version. The gallery remains the fallback per object: no model, no 3D entry, nothing else changes.

**Recommendation:** ship Route 1 for every object that has the photos, and add Route 2 only for the few objects that scan cleanly and earn it.

## (d) Phone performance and Reduce Motion parity

**Performance**
- 2.5D: 3 to 5 composited layers with `will-change: transform`. Holds 60 fps on mid phones. Each frame is transforms only, with no layout and no repaint of the images.
- True 3D: one WebGL canvas. Cap `devicePixelRatio` at 2, render only while there is input or inertia (stop the loop at rest), dispose the model and the context on exit so the sky and the gallery get the memory back, and lazy-load so the cost is paid only on entry.
- Both: skip entering 3D if the device reports very low memory (`navigator.deviceMemory` where available) or if WebGL context creation fails. The gallery stays.

**Reduce Motion parity (project rule: motion identical with Reduce Motion on)**
- There is no Reduce Motion branch anywhere in m4, and the 3D layer does not add one. The enter, orbit, resize, inertia and tilt are the same with the setting on or off.
- Anything that does not need motion stays out: no auto-spin, no idle drift. Everything moves only because a finger or the phone moved it, so there is nothing for the setting to turn off.

## Phone tilt

- **Existing code:** m4 itself has none. Search of `js/` finds no `deviceorientation` or `DeviceOrientationEvent`. The only DeviceOrientation code in the repo is the one I wrote in the objects sketch: `enableTilt()`, `disableTilt()` and `onOri()` in `u4-opus-m4/_sketch/objects/index.html`, state in `tilt` (`x`, `y`, `w`, `tx`, `ty`, `ref`, `on`).
- **iOS permission:** Safari 13+ gates `DeviceOrientationEvent.requestPermission()` behind a user gesture, so tilt cannot start by itself. The sketch shows a small "tilt" button on touch devices, and the tap calls `requestPermission()` and only then adds the listener. Android and desktop have no prompt and listen directly. Denied or unsupported: the button simply does nothing and the object still orbits by finger.
- **Touch wins:** a blend weight `tilt.w` eases to 0 while any finger is down (`kw = 1 - exp(-dt * 14)` toward 0) and back to 1 after release (`exp(-dt * 2.2)`), so a finger always owns the object and tilt takes over softly afterwards.
- **Smoothing and limits:**
  - The first reading becomes the neutral pose (`tilt.ref`), so the object is centred wherever the phone happens to be held.
  - Beta and gamma are remapped by `screen.orientation.angle` (0, 90, 180, 270), so tilt is correct in portrait and landscape.
  - The offset is divided by 28° and clamped to ±1, then eased with `1 - exp(-dt * 7)`.
  - Tilt adds at most about ±20° of yaw and ±14° of pitch on top of the finger orbit.
- **Desktop fallback:** `pointermove` with `pointerType === 'mouse'` drives the same `tilt.tx / ty` from the cursor position (−1 to 1 across the view), so hover gives a parallax look on desktop and the tilt button is hidden when the device has no touch.
- **Reduce Motion parity:** same as above. Tilt is the user moving the phone, so it behaves identically on and off.
- **To carry into m4 proper:** keep tilt opt-in via the button, keep the sketch's neutral-pose logic, and add a re-centre on double-tap.

## (e) First prototype

Built as a standalone sketch, never touching the galleries: `u4-opus-m4/_sketch/objects/` (live under `/u4-opus-m4/_sketch/objects/`). It has the joio cup and the scoop, a gallery layer (layer 1) and a 3D constellation layer (layer 2) entered by pinch in or tap and left by pinch out, ‹ or Back to the same spot, one-finger orbit, two-finger resize, tilt, the Option 1 and 2 switch, and a `?debug=1` panel. That sketch is now owned by the second builder, so changes to it go through them.

## Open questions for Gill

1. Which objects get 3D first, and are photos from several angles available for each (Route 1)?
2. Is a full turn ever wanted (Route 2, needs scans), or is the bounded arc enough?
3. Tilt: opt-in by a small button (current), or ask on first entry to 3D?
