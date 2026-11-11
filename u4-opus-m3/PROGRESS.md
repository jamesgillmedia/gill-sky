# u4-opus-m3 · progress

Read this first if you are picking the work up in a fresh run.

## Rules for this folder
- Work only in `u4-opus-m3/` on branch `cursor/u4-opus-5d75`. Commit and push to that branch after every small step. **Never push to main, and never publish** until Gill says so.
- `RULEBOOK.md` (from `u4-spec.tgz`) overrides earlier steers. The far sky, top bar, camera, bloom, water, parallax, fly-through and minimap stay as in u3. Motion is the same with Reduce Motion on or off.
- Hard rules from the brief still apply:
  - real media only, with no invented titles;
  - no YouTube;
  - no prefers-reduced-motion branches;
  - files under 25 MB;
  - never edit u1, u2, u3, u4-opus-m1, u4-opus-m2 or any other existing folder.

## Level path
- FAR (`#`): the single GILL JAMES sky.
- MID (`#film`): the chapter's constellation at u3's fit×1.45.
- BOARD (`#film/board`): the same camera pushed in, with the board painted in the sky.
- WORK (`#film/<slug>`): the piece, with its own inner steps.
- Every step in is one history entry. Pinch-out, ‹, browser Back and Esc each go up exactly one step. Tapping ᑕᐣᓯ flies to FAR.

## Done
- Started as an exact copy of u3, not built on m2.
- The board is drawn in u3's canvas (`boardSpec()`, `tileRect()` and `drawWindow()` in `js/sky.js`).
- Objects board: the 14 pro2 objects plus Spirit Eye (`OBJECT_ORDER` in `js/depth.js`).
- Photo board: keeps u3's slight print rotation.
- Sound board: keeps u3's dotted rows.
- "Just The Beginning" is credited to Gill James and Ryan; every BONSAI wording is removed.
- Fixes carried over:
  - one "GILL JAMES" on arrival;
  - `player/js/tracks.js`;
  - the About band;
  - split titles.
- Nov 9 media from Gill (`media/nov9/`, plus `js/nov9.js` built by `tools/make_nov9.py` from `media/nov9/manifest.json`):
  - The 63 object files (58 stills and 5 muted clips with posters) are their own tiles and pieces. Each sits right after the pro2 object the manifest names, and also appears in that object's process grid. The 15 marked "unknown" go at the end with no captions.
  - The 16 film stills go at the end of the Film board, uncaptioned, and each opens as a still.
  - The 17 photo stills go at the end of the Photo board.
  - The 2 "other" files (an orange graphic with the email, and the Lost Coffee lettering) are not used, because they don't fit a board.
  - The Nov 9 items are not in the sky layout, so FAR and MID are unchanged.

## RULEBOOK status
- Every line passes. See `_progress/CHECKLIST.md`, which has one screenshot per line in `_progress/check/`, plus `00-u3-vs-m3.png` and `m3-walk.mp4`.
- Done:
  - airy MID;
  - Film 2-up 2.39 strips;
  - Photo mats and gaps;
  - the Sound star-chart;
  - C1, C2, C3, C4 and C6;
  - the noscript list link lifted above the stage.
- Waiting for Gill's review. Nothing is published, and main is untouched.

## Possible next steps (only if Gill asks)
- The JS-off list pages don't show the Nov 9 media yet.
- Cover art for the songs is still a gap.

## Checks
- `/tmp/shots/drive.py plan.json` runs Playwright at 390x844 with Reduce Motion emulated. The `__u1` hooks are cur, step, tiles (all board tiles with their centres), rects (the board layout, for overlap checks), mid (MID thumbnails and label boxes), zoom, pinchIn(x,y) and pinchOut(). `overlap.py`, `midcheck.py`, `mkwalk.py` and `build_progress.py` in `/tmp/shots` rebuild the checks and `_progress/`; if they are gone, rebuild them from `CHECKLIST.md`.
