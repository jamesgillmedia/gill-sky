# u4-opus-m3 · RULEBOOK checklist

Self-check at 390x844 in Chrome (Playwright, touch, device scale 2). The pinches are two-pointer touch gestures sent through the page's own pointer handlers. Every line was run with Reduce Motion emulated as `reduce`. The level walk and the motion frames were also run with `no-preference`. Screenshots are in `check/`, the side-by-side is `00-u3-vs-m3.png` and the walk is `m3-walk.mp4`.

## Must stay identical to u3

| # | Item | Result | Evidence |
|---|------|--------|----------|
| 1 | FAR sky: five chapters around ᑕᐣᓯ, the in-progress cluster, the poem, and a single GILL JAMES on arrival. | PASS | `check/01-far.jpg` |
| 2 | Header: u3's gradient bar, mark, chips, Reel/List/Contact and ‹. No solid strip and no depth dots. | PASS | `check/02-header.jpg`. The `<header>` markup and every `#bar` CSS rule match u3 byte for byte. 0% of the FAR header pixels differ from u3. |
| 3 | Camera, bloom (1 at lv>=1), water, parallax, fly-through and sketch-3d zoom, with the same choreography under Reduce Motion. | PASS | `check/03-motion.jpg` shows frames 150 ms and 400 ms into the same pinch with Reduce Motion on and off. There are no `prefers-reduced-motion` branches in js/css/html. |
| 4 | Minimap present. | PASS | `check/04-minimap.jpg` |

## Level path

| # | Item | Result | Evidence |
|---|------|--------|----------|
| 5 | FAR → MID at u3's fit.s×1.45, with no label collisions and nothing cut off at 390 wide. Outer stars may sit off-frame. | PASS | `check/05-mid.jpg`. The scripted check of every chapter found 0 thumbnail/thumbnail overlaps, 0 label/thumbnail, 0 label/label and 0 labels outside the safe width (film: 38 stars, 30 titles shown). The two Old Man Canyon works read "Back to the…" and "Phantoms &…", because titles that would truncate to the same text fall back to the work name. |
| 6 | MID → BOARD: the same camera pushes in toward the touch, the board is painted in the sky with a ring of night around it, and there's no scrim or scrolling overlay. | PASS | `check/06-board-in-sky.jpg` |
| 7 | Film: 2.39 strips, staggered 2-up, never overlapping, with title + role under each frame. "Just The Beginning" is credited to Gill James and Ryan. | PASS | `check/07-film.jpg`. 54 tiles, 0 overlaps (caption block included). |
| 8 | Photo: print stacks with slight rotation, cream mats, gaps and no overlap. | PASS | `check/08-photo.jpg`. 56 prints, 0 overlaps measured on the rotated outlines. |
| 9 | Sound: a dotted waveform with every peak labelled by song, lengths in m:ss ("1:20"), and no placeholder covers. | PASS | `check/09-sound.jpg`. The missing cover art is flagged on the board as "cover art: gap". The player and streaming entries under the waveform are plain text links in the peak-label type, with Lost Coffee on one line: "Lost Coffee · Spotify · Apple Music". The titles "=" and "ii" are the real song titles: they match pro2's `tracks.js` (from `lc_eq.wav` and `lc_ii.wav`) and the pro2 practice pages. |
| 10 | Objects: all 14 pro2 objects plus Spirit Eye with their imagery, captions under their own piece, plus Gill's Nov 9 object images and clips. | PASS | `check/10-objects.jpg` and `09-nov9.png`. 78 tiles, 0 overlaps. |
| 11 | About: text-led, Vancouver, no he/him; the calculator is one level below. | PASS | `check/11-about.jpg` |
| 12 | BOARD → WORK: the work grows out of the tapped tile, and its first frame is a real still. | PASS | `check/12-iris.jpg` |
| 13 | OUT: pinch-out, ‹, browser Back and Esc each go up exactly one level and agree. | PASS | `check/13-out.jpg`. In every chapter: work (step 3) → pinch-out → board (2); back in, then Back → board (2); Esc → MID (1); ‹ → FAR (0). The logs are identical with Reduce Motion on and off. |
| 14 | Zoom-out uses history.back()/replaceState, never pushState, and there's no hidden extra step. | PASS | `pushState` appears only in `pushStep()` (a step in) and in `seed()` (deep links). Evidence is the step counts in `check/13-out.jpg`. |
| 15 | Tapping ᑕᐣᓯ flies to FAR. | PASS | `check/14-mark.jpg`. From a work at step 3 it lands on FAR at step 0. |

## u3 bugs

| # | Item | Result | Evidence |
|---|------|--------|----------|
| C1 | popstate/hash on a booted page lands on FAR. | FIXED | `check/15-c1.jpg`. Setting `#photo/board` on a booted FAR page lands on the Photo board. A deep link to a song steps back through board, MID and FAR. |
| C2 | A work opens black. | FIXED | `check/16-c2.jpg`. The Demo Reel opens on `reel/a/001.webp` with its clip, not the near-black frame 000. Nov 9 clips use their posters. |
| C3 | Labels clipped on the left. | FIXED | `check/17-c3.jpg`. MID titles are clamped to 8 px from each edge. Board captions start inside the window padding. |
| C4 | The minimap sits on content or bio text. | FIXED | `check/18-c4.jpg`. It dims to 32% over boards, works and the bio, and stays full over the sky. |
| C6 | Unlabelled sound rows and placeholder covers. | FIXED | `check/09-sound.jpg` |
| — | Single GILL JAMES, tracks.js, About band, split titles. | PASS | `check/19-fixes.jpg` |

## Never

| Item | Result |
|------|--------|
| No `#board` overlay, `#bar.deep` or depth rail. | PASS. None of these exists in index.html, js or css. |
| No crammed constellation, rounded app cards, "list" pill or playlist cards. | PASS. See `check/05-mid.jpg` and `check/09-sound.jpg`. |
| Work only in `u4-opus-m3/`. | PASS. No other folder changed on this branch. |
| No YouTube, no BONSAI, no he/him, no Two-Spirit, no "award-winning". | PASS. Grep over js, html and json is clean. |
| No private photos, and nothing from vidA.mp4. | PASS. None of the banned filenames is in `media/nov9/` or anywhere it's referenced. |
| Files under 25 MB; works with JavaScript off. | PASS. The largest file is 1.6 MB. With JavaScript off, the index shows "Everything as a list" above the stage and the list page works (`check/20-nojs.jpg`). |

## Nov 9 media

- Objects: all 63 files are used (58 stills, plus 5 muted clips with posters).
  - Named ones sit right after the pro2 object the manifest names, and join that object's process grid.
  - The 15 marked "unknown" sit at the end with no caption and no title.
- Film: all 16 stills are at the end of the Film board, uncaptioned, and each opens as a still.
- Photo: all 17 stills are at the end of the Photo board.
- Other: the 2 files are not used. One is an orange graphic with the email in it, the other is the handwritten Lost Coffee lettering; neither fits a board.
