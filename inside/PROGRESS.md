# inside/ · progress

Read this first if you are picking the work up in a fresh run.

Live: https://jamesgillmedia.github.io/gill-sky/inside/ (GitHub Pages from `main`, ~1-2 min after a push).

## Rules (from Gill, via the brief; RULEBOOK.md + DESIGN-SPEC.md win)
- Work ONLY in `inside/`. Never edit `u4-opus-m4/` (another builder is in it), the repo root, `_sketch/`, `night-listening/` or any other folder.
- m4 is read at runtime, read-only: `../u4-opus-m4/data.json`, `js/nov9.js`, `js/frames.js`, `js/reelshots.js`, `js/joio.js`, its media and fonts. Nothing is copied.
- Commit + push to `main` after every small step; `git pull --rebase` first; never force-push. Update this file each step.
- Same palette / type / top bar / star glow as m4. No `prefers-reduced-motion` branch anywhere (motion identical with Reduce Motion).
- Never link to YouTube. Banned / held files are filtered in `js/data.js` (`BANNED`), plus vidA.mp4.
- No invented titles or facts: only m4's data. Two-tap rule: first tap selects (mint ring + title), second tap opens.

## Architecture
- `index.html`: m4's top bar markup (mark, chips, Reel / List / Contact, ‹), crumb, piece caption, mini-map. Three.js 0.160 from jsDelivr via importmap.
- `js/data.js`: loads m4 data, ban filter, m4's constellation shapes/angles (SH / ANG / ANGP) and placeChapter, plus a z depth per star.
- `js/app.js`: renderer, starfield, constellations, projected HTML labels, free camera (drag = drift, pinch / wheel = zoom at the touch point, twist = turn, shift/right-drag = orbit, inertia, eased flights), levels + history, two-tap picking, mini-map.
- `js/board.js`: chapter boards in the sky (stars fly into a dense grid).
- `js/room.js`: Inside rooms (camera passes through the piece into its room).
- `models/models.json`: GLB swap point for Inside (empty until the mesh-from-photos experiment delivers).
- `_qa/qa.py`: Playwright run, iPhone 390x844 + desktop 1440x900, Reduce Motion on/off, console errors + 4xx log, screenshots.

## Levels and gestures
| level | hash | in | out |
|---|---|---|---|
| far sky | (none) | tap a chapter twice, or pinch/scroll toward it | - |
| constellation | `#film` | free flight sets it (replaceState) | pinch/scroll out, ‹, Esc, Back |
| board | `#film/board` | pinch deep into a constellation, or tap a star twice | pinch out, ‹, Esc, Back, double-tap sky |
| piece | `#film/<slug>` | tap a tile twice / pinch on it | same, one level |
| inside | `#film/<slug>/inside` | pinch in on the piece, tap it, or "go inside" | pinch out, ‹, Esc, Back: camera returns exactly where it was |
ᑕᐣᓯ mark and the mini-map fly to the far sky in one move.

## Log
| step | commit | what | next |
|---|---|---|---|
| 1 | (this) | Milestone 1: free-floating 3D sky from m4 data (five chapters, in-progress ring, ᑕᐣᓯ centre, m4 glow/labels/top bar/mini-map), drift / pinch / scroll / twist / inertia, constellation level from free flight, QA script | boards |
