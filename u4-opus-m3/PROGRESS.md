# u4-opus-m3 · progress

Read this first if you are picking the work up in a fresh run.

## Rules for this folder
- Work only in `u4-opus-m3/` on branch `cursor/u4-opus-5d75`. Commit and push to that branch after every small step. **Never push to main, and never publish** until Gill says so.
- The sky, camera, top bar, breadcrumb, ᑕᐣᓯ mark, fly-through and pinch levels stay exactly as in u3. The only additions are the chapter board and its fixes.
- Hard rules from the brief still apply:
  - real media only;
  - no YouTube;
  - no prefers-reduced-motion branches;
  - files under 25 MB;
  - never edit u1, u2, u3, u4-opus-m1, u4-opus-m2 or any other existing folder.

## Done
- Started as an exact copy of u3, not built on m2.
- The board sits inside u3's own canvas window (`boardSpec()` and `tileRect()` in `js/sky.js`). It is reached by pinching into a chapter, and you pinch out to go up a level. It uses pro2's density: a multi-column grid of thumbnails, titles and a caption line.
- Each board:
  - Film: 16:9 tiles with a few 2x2 tiles.
  - Photo: straight prints at their own ratio, in staggered columns.
  - Objects: all 14 pro2 objects plus Spirit Eye (`OBJECT_ORDER` in `js/depth.js`). Each tile opens that object's own piece.
  - Sound: plain tiles with the cover, title and length (m:ss, set at 10.5px).
  - About: text rows. The calculator bio is one pinch below the About board, and pinching out through the moon grid comes back to the board.
- Four fixes carried over:
  - one "GILL JAMES" on arrival;
  - `player/js/tracks.js` (from sound-sketch, using local MP3s, no YouTube);
  - the black band at the top of the About calculator;
  - split piece titles (`titleHtml` in `js/depth.js`).

## Checks
- Run the scripts in `/tmp/shots` (cmp-u3.json and cmp-u4-opus-m3.json) and compare their logs. If they are gone, rebuild them as Playwright at 390x844, `reduced_motion='reduce'`, with a pinch into each chapter, a pinch into the first tile, one more pinch, then three back presses, logging the level, id, breadcrumb and back button at each step. The two logs must be identical.
- `_progress/` holds the u3-vs-m3 side-by-side, the board PNGs, `m3-walk.mp4` and `NOTES.md`.

## Next
- Place the new images and clips from Gill on the Objects board and wherever else they fit, once they arrive.
- Wait for Gill's review before anything is published.
