# about-calc-3d · the bio calculator as a 3D model (proto-shell module)

    ?m=about-calc-3d&at=about/board            night
    ?m=about-calc-3d&at=about/board&theme=red  red mode

A sibling of `?m=about-calc`. Nothing in about-calc, the core, or the bio was changed.

## How it is built
- **Page** = about-calc A (the m4 / tonight bio): the full-screen calculator, grain, Gill's seven layers, rail and moon grid, with the same
  tap, double tap, Back, Esc, pinch and wheel. It reuses `../about-calc/calc.css`, `layers.js` and `media/` (no copies).
- **Model** (`model.js`) = geometry measured from the clip (360 × 640, frame at 8 s), in video pixels, as the calculator sits in the photo
  (upside down, turned about 3.5°): the face plate; six keys as raised (+6), rounded, tapered caps; the green display as a window set back (−7)
  with sloped walls; the name plate as a shallow step (−2); the light case rim raised (+3); the case side and the dark behind it set back (−20);
  the OFF / ON slide on the side; the body's thickness (30) behind the frame. three.js r160 (the copy the 3D rooms already ship,
  `tonight/fable-m4/objects-3d/vendor/`).
- **Skin** = the glitch canvas, projected from the rest camera (projective texturing in a small ShaderMaterial, no colour management, no tone
  mapping). The rest camera frames the same crop as the 2D page (`calcCrop`), so at rest every surface shows exactly the pixel it covers in
  the flat picture. Flat surfaces are never shaded; walls and the body's edge pick up a soft light only while the model is turned, fading to
  nothing at rest.
- **Glitch** = the bio's own `drawGlitch` (tonight/about/bio/js/sky.js @ 324a4c53), verbatim, with `gj.noflash` and `gj.glitch`. It runs on
  the canvas the model wears, so the bands, RGB split, scanlines, mosh and the display's green flicker move across the 3D surfaces, and the
  layer zoom (1 + 0.3 per layer) is the same CSS transform as the bio. The bio's controls are here as a quiet "light" pill (bottom left, only
  while the bio is open): stop flashing (pauses the clip and holds the glitch) and the glitch slider 0-100, with the same keys, so anything
  Gill set on the bio carries over. They are also in the tune menu. `window.GJ_BIOCTL` is the bio's API.
- **Turn** = one finger or the mouse turns the model (default 24°, tune "turn amount"); let go and it springs back on the site's critically
  damped tilt spring (`sstep`, w = tokens motion.springs.tiltBlend = 9, about 0.6 s, as the constellation blend). Tap / double tap / a second
  finger / the wheel are handed to the shell, so the ladder works exactly as on the 2D page (checked: tap = deeper, double tap = out,
  pinch-in = deeper, pinch-out leaves to About MID, Esc = back).
- **Red**: the model is the photo, so Red never tints it. Words, rail and the light pill follow Red through the core's module-stylesheet mapping.
- No WebGL: the flat 2D glitch canvas shows and the page is the 2D bio.

## Rough
- The clip is hand-held. The relief is measured on the frame at 8 s; from 2 s on it moves only a few pixels, but the first second (the wide
  shot) does not line up with the keys. At rest this never shows (the skin is projected); it only shows as a slightly off key edge while turned.
- The model only exists where the photo does: turned far, you see its edge and the night behind it, not the rest of the calculator.
- Untested on a real phone. In software rendering (swiftshader) it runs at about 32 fps on a phone viewport and 26 fps at 1440 (2D: 59 / 53).
