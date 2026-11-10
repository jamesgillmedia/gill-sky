# u4-opus · m3 · u3 with the board level restored

m3 starts again from an exact copy of u3. It is not built on m2.

## What is the same as u3
- The sky, water, camera, chapter dive and constellations.
- The top bar, with the chips, Reel, Hire, List and Contact.
- The minimap.
- Navigation: a tap selects, a pinch goes deeper, and a pinch out or back goes up one level.
- History and the breadcrumb.

A scripted pass with Reduce Motion emulated went through Film, Photo, Objects and Sound. At every step its log of the level, the open piece, the breadcrumb and the back button is identical to u3's.

## What changed (only this)
1. **The board.** Pinching into a chapter opens the same window in the sky that u3 opens. It used to hold a single column of full-width heroes; now it holds pro2's board: a multi-column grid of thumbnails with titles and a caption line (type · length, or Gill's role in mint). Each medium keeps a small difference of its own:
   - Film: 16:9 tiles, with a few larger ones.
   - Photo: prints at their own ratio in staggered columns, slightly tilted.
   - Objects: square cut-outs, slightly off-line, with one large one.
   - Sound: dotted waveform cards, with the player card across the top.
   - About: text rows (bio, contact, joio.co, the poem).
2. **About has a board.** The calculator bio is now one pinch below it, not the chapter itself. Pinching out of layer 1 still goes through the moon grid, and now lands back on the About board, one level up.
3. **Four fixes carried over:**
   - one "GILL JAMES" on arrival;
   - the song player data (`player/js/tracks.js`), which uses the MP3s in this folder and has no YouTube links;
   - the black band at the top of the About calculator;
   - piece titles shown as the client small, with the name large on one line.

## Files
- `00-u3-vs-m3.png`: u3 (top row) against m3 (bottom row) at 390x844, for the sky and each chapter's level.
- `01`–`08`: m3 at 390x844 (the sky, each board, the About bio, Film frames).
- `m3-walk.mp4`, recorded with Reduce Motion emulated:
  - Film: board, piece, frames, then back up to the sky;
  - Photo: board, then back;
  - About: board, the bio, a layer deeper, then back through the moon grid to the board and the sky.

## Waiting for
Gill's review, before anything else is built.
