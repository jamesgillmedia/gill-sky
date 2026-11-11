# _sketch progress

Owner: second builder, `u4-opus-m4/_sketch/` only. One row per push.

| # | SHA | What | Live |
|---|-----|------|------|
| 0 | `e5a0944` | PLAN.md and this file. No code. | n/a |
| 1 | `6322a09` | objects: icon size slider runs 50-200% (`?icon=` is a percent) with a px readout in the state list and the number box. | objects/ |
| 2 | `23fe72d` | objects: debug panel opens from a small visible corner tab or `?debug=1` (the hidden triple-tap is gone). Panel code now lives in `_src/debug.js` + `_src/debug.css`, and `_src/build.py` inlines the same module into both sketches. Also: text size slider (`?txt=`), double-tap reset on a slider no longer gets overwritten, the top bar sits inside the filtered view so Brightness/Contrast reach it, lighter frost. | objects/ |
| 3 | (this commit) | grain: one pre-generated 256px noise tile, moved by a random translate3d every animation frame (a composited transform, no canvas redraw, no regeneration), overlay blend, overlay sits above the view and below the panel. Checked at 390x844 (dpr 3, headless): fps readout 58-60 with grain 100, brightness and contrast on, in the 3D layer. No phone hardware here, so a real-device check is still open. | objects/ |
