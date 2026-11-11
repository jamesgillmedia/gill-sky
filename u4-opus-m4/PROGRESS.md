# u4-opus-m4 · progress

Read this first if you are picking the work up in a fresh run.

## Rules for this folder (merge run, approved by Gill, spec wins)
- `_spec/DESIGN-SPEC.md` is the source of truth; `RULEBOOK.md` is older and loses where they conflict.
- Work only in `u4-opus-m4/`. Every small step is committed and pushed to branch `cursor/u4-opus-5d75` AND to `main` (this folder only). Pages redeploys https://jamesgillmedia.github.io/gill-sky/u4-opus-m4/ in about 1-2 min. No review gate.
- The first published m4 stays recoverable at main `2d77656`. No frozen copy.
- Never touch the gill-sky root, any other folder, or the gilljames repo (read-only reference).
- Real media and copy only; no YouTube; no `prefers-reduced-motion` branches; no private/held files (spec section 4); never vidA.mp4 after 9 s; the bio is verbatim.

## Merge run log (step, commit, what changed, what is next)
Step 0 commit (spec added before any code change): `e195ff7b5df79ac89c39988f4d0f880c02775e3e`

| Step | Commit | What changed | Next |
|---|---|---|---|
| 0 | `e195ff7` | `_spec/DESIGN-SPEC.md` + `spec-img/` added, no code touched | A |

LOGROWS

## Level path
- FAR (`#`): the single GILL JAMES sky.
- MID (`#film`): the chapter's constellation at u3's fit×1.45.
- BOARD (`#film/board`): the same camera pushed in, with the board painted in the sky.
- WORK (`#film/<slug>`): the piece, with its own inner steps.
- Every step in is one history entry. Pinch-out, ‹, browser Back and Esc each go up exactly one step. Tapping ᑕᐣᓯ (shown beside ‹ at every deep level) flies to FAR in one move with `history.go(-STEP)`.

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
- Every line passes. See `_progress/CHECKLIST.md`, which has one screenshot per line in `_progress/check/`, plus `00-u3-vs-m4.png` and `m4-walk.mp4`.
- Done:
  - airy MID;
  - Film 2-up 2.39 strips;
  - Photo mats and gaps;
  - the Sound star-chart;
  - C1, C2, C3, C4 and C6;
  - the noscript list link lifted above the stage.
- m4 is published at `/gill-sky/u4-opus-m4/` as a new folder on main.

## Possible next steps (only if Gill asks)
- The JS-off list pages don't show the Nov 9 media yet.
- Cover art for the songs is still a gap.

## Checks
- `/tmp/shots/drive.py plan.json` runs Playwright at 390x844 with Reduce Motion emulated. The `__u1` hooks are cur, step, tiles (all board tiles with their centres), rects (the board layout, for overlap checks), mid (MID thumbnails and label boxes), zoom, pinchIn(x,y) and pinchOut(). `overlap.py`, `midcheck.py`, `mkwalk.py` and `build_progress.py` in `/tmp/shots` rebuild the checks and `_progress/`; if they are gone, rebuild them from `CHECKLIST.md`.
