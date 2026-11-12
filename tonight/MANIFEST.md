# tonight · integrated view — MANIFEST

Built Thu Nov 12 2026, 3:01–4:10 AM PT (America/Vancouver), local only. Nothing pushed, no git writes.
Root on the box: `/workspace/tonight-integrated/` (served for QA at `http://127.0.0.1:8970/tonight/`).
Planned branch: `preview-tonight` from main `39e02f4d4cd81ec86cf26f439939e827f4c946d3`, every file under `tonight/`.

Every piece is a **copy**; no source folder or branch was edited. Recopy any piece with `tools/refresh.sh <piece>`
(or `tools/refresh.sh <piece> --src <path>`), which re-applies the integration fixes, rewrites the integration pages and runs `tools/scan.sh`.

## How it fits together
1. `index.html` — the opener, full screen. Quiet toggle bottom-right: **snow on water** (default) · **moon and water** (remembered on the device).
   The shared control at top centre reads **enter the constellation** here.
2. `hub/` — the constellation hub. About figure (ᑕᐣᓯ along the signature centrelines + four-star crescent, v3.2/v3.3 design data) on top,
   then six categories, each with its picked figure: **film, photos, objects, spaces, about, sound**. Small switches top-right:
   opener snow / moon / snow-water mark, and **mark 1 · 2 · 3** (the three mark constellation options, pinch-only passage).
3. Every piece carries the same **constellation** control (top centre, same pill) back to `hub/` (`_tn/back.css`, `_tn/back.js`).
   It hides itself inside iframes so it never doubles up.
4. `film/` — Film section page; `spaces/` — Spaces page. The tiled moon-water page also gained a Spaces chapter (see below).

## Pieces
| piece (refresh name) | path in tonight/ | copied from | status |
|---|---|---|---|
| opener-snow | `openers/snow/` | `/workspace/publish-previews/snow-opener/snow-opener` (package of `/workspace/opener-snowwater`) | final |
| opener-moon | `openers/moon/` | `/workspace/amb/opener-sketch/u4-opus-m4/_sketch/opener` (moon-and-water opener sketch of main `u4-opus-m4/_sketch/opener`, with the ambience pill) | final (ambience defaults unchanged; corrected values from 3:32 AM not yet received) |
| opener-mark-snowwater | `openers/mark-snowwater/` | `/workspace/publish-previews/moon-opener/moon-opener` (package of `/workspace/mark-snowwater`) | final |
| marks | `marks/opt1-fewer/`, `opt2-spread/`, `opt3-shallow/` | `/workspace/mark-options` (index.html + only the media they load) | final (pinch-only transition per `/workspace/share/mark-pinch/CHANGES.md`) |
| (generated) hub | `hub/` | `tools/gen_pages.py`; figures from `/workspace/tiled-moon-v3/index.html` (= `constellations-v32/points.json`) | new |
| red-light | `red-light/` | `/workspace/red-light-gallery-baseline/` (READY per parent 3:28 AM) | final |
| photo-lab | `photo-lab/` | `/workspace/llp-scroll-baseline/lab-lens-preview/photo-lab` (scroll/gestures = main 39e02f4) | final |
| lens-room | `lens-room/` | `/workspace/film-lens-room-A` — **version A + deck** (Gill picked A, 3:49 AM): css/lens.css, css/deck.css, js/app.js, js/films.js and media byte-identical to the build, index.html identical except the `_tn` back line. Its 3 posters celebraciones, backward-fall, lets-grow-good-together stay dark plates as in the build. Replaces the v4.1 restore (+ 3:45 leak patch), which is backed up at `/workspace/tonight-integrated-lens-v41-bak/`. Hub → lens room → back checked on phone and desktop, 0 errors / 0 4xx | final |
| horizon | `horizon/` | `/workspace/horizon-reel-v2` (its `stills-zoom/` link now points at the shared `../stills/`) | final |
| stills | `stills/` | `/workspace/publish-previews/stills-zoom/stills-zoom` (package of `/workspace/stills-zoom`, 9 proxies re-encoded < 20 MB). The **one** shared stills index: hub, Film section, Horizon reel and tiled moon all use it | final |
| archive | `archive/` | `/workspace/archive-index` (with the boxes / dim / hide switch, CHANGES 3:13 AM) | final |
| objects | `objects/` | `/workspace/amb/objects-c` (objects-nav rings + side dial, glow pill). Its "m4 board" link → `../hub/#objects` | final |
| forest-garden | `spaces/forest-garden/` | `/workspace/amb/se-garden` (fibre optics + day–night first in the dial plate) | final |
| sound | `sound/` | `/workspace/tiled-moon-v3/rooms/sound` (= `/workspace/constellations-restore/sound`, waveform constellation + invert, 5 tracks trimmed) | final |
| bio | `about/bio/` | `/workspace/tiled-moon-v3/rooms/bio` (= `/workspace/amb/bio`, trimmed to the bio route) | final |
| tiled-moon | `tiled-moon/` | `/workspace/tiled-moon-v3` without its `rooms/` (doors rewired to the shared pieces) | final |
| fable-m4 | `fable-m4/` | gill-sky `fable-m4-run` **9c2d3e822e7cf248c21786a58a8e5608a4eb443b** `fable-m4/` | final |
| film-m4 | `film/m4/` | `/workspace/gs-fms/u4-opus-m4` = local commit **7e62b43ad5126ac292da1e73350f56fde5c5f40c** (branch film-morning-scope) + the privacy deletions in that worktree; `_sketch/` taken from main 39e02f4 | final |
| film-m2 | `film/m2/` | gill-sky main **39e02f4** `u4-opus-m2/` | final |

### Film section (`film/`, Gill 3:02 AM)
| item | opens | source | status |
|---|---|---|---|
| (1) native Scope player in the 2.39 frame, one layer deeper than the morning film page, no Vimeo/YouTube | `film/m4/#film` → a film → hero tap / play | 7e62b43 | final |
| (2) m2 still-and-moving layers | `film/m2/#film` | main 39e02f4 `u4-opus-m2` (Vimeo "Watch ↗" links removed) | final as its own piece — **not composed underneath the Scope player** |
| (3) zoom-in on stills | `stills/` (and Horizon reel pinch-in) | stills package | final as its own piece — **not composed underneath the Scope player** |
| (4) m4 benchmark artful card flow (5503e73) | `fable-m4/#film` | fable-m4 9c2d3e8 (foundation byte-identical to 5503e73 + security fixes) | final (copy; r3/r9 sources untouched) |
| (5) cards star inside Film, never auto-swipes | `fable-m4/#film/cards`, `film/m4/#film/cards` | 9c2d3e8 / 7e62b43 | final |
| (6) no-auto-swipe board (still until swiped/dragged) | same boards | 56b3773 behaviour in both | final |
| lens room from Film | `film/` page row + tiled-moon film door | — | linked from the Film section page; not inserted inside the Scope player or the film pages |

### Spaces (Gill 3:08 AM; 4:16 AM: Spaces is one concept, Spirit Eye of skwácháýs)
| item | path | source | status |
|---|---|---|---|
| Spirit Eye of skwácháýs · se-a / se-b / se-c | `fable-m4/versions/se-a/`, `se-b/`, `se-c/` | fable-m4-run 9c2d3e8 | final |
| Spirit Eye · the forest garden (se-a restored effects; fibre, day–night) | `spaces/forest-garden/` | amb/se-garden | final |
| Spaces constellation figure | `_tn/spaces-glyph.svg` (eye: two lids, pupil star, faint inner stars) | new | **draft, new, for Gill to judge** |
| Spaces tile image | `_tn/spaces-tile.webp` = Forest Garden gallery render p29 (dome interior), re-encoded, no metadata | child-check 0 faces; eye-checked: no people | new |
| `spaces/` page | titled **Spirit Eye of skwácháýs**, the three versions + its forest garden; credit line "joshua ngenda & gill james · Trillium Park, Skwácháýs" (from the se pages' own text) | `tools/gen_pages.py` | new |

Hub card "spaces · spirit eye"; tiled-moon chapter count reads "Spirit Eye", summary "Spirit Eye of skwácháýs · se-a · se-b · se-c · the forest garden"; the whole-sky label reads "spaces · Spirit Eye".
Nothing else is in Spaces; nothing from `/workspace/intake-nov12` is used.

Spaces was added to: `hub/index.html` (category + figure), `spaces/index.html` (new), `tiled-moon/index.html` (new `#spaces` chapter after Objects with the draft glyph,
Forest Garden door removed from Objects, a **spaces** button in the whole-sky label row, a spaces entry in the sky's constellation nav, a **spaces** tab in the bottom tabs),
`tiled-moon/v3/idle-tiles.js` (ORDER film, photos, objects, **spaces**, about, sound), `tiled-moon/v3/tiles-menu.js` (film, photo, objects, **spaces**, sound, about — the menu's own existing order kept),
`tiled-moon/v3/tiles/spaces.webp`,
`tiled-moon/js/sheet.js` (Gill 3:57 AM: whole-sky canvas — Spaces is a sixth chapter constellation drawn from the same draft figure with the same stars/lines/glow as the others;
the six chapters now sit on an even hexagon around ᑕᐣᓯ: about −90°, photo −30°, objects 30°, **spaces 90°**, sound 150°, film 210° (was a pentagon); Spaces has no works yet, so like About a tap zooms to its constellation and then opens its chapter;
sky bounds widened for the new bottom figure), `tiled-moon/js/dive.js` (an empty chapter no longer writes an empty line path, which was a console error),
`film/m4/3d-sky/main.js` (the 3D constellation already had a "Space" cluster with m4's own 4 cards; it is now labelled **Spaces** and drawn as the same draft figure,
same glow stars + line material as the other five; its cards are unchanged). Separate tiles-to-mark builds in `/workspace/tiles-to-mark/shared/m4/3d-sky` were **not** edited.
Everything is applied by `tools/pieces.py` (`spaces_tiled`, `spaces_sheet`, `spaces_3dsky`), so `tools/refresh.sh tiled-moon film-m4` re-applies it.

### Missing (not found, not faked)
| piece | note |
|---|---|
| Reel 2026 boxes | no standalone build found. The archive index's red numbered boxes are described there as "in the style of the Reel 2026 #16 boxed sheet". |
| commercial amendment | no page or build found in /workspace, /workspace/share, publish-* or the named branches. |

## Integration fixes applied to copies
- Shared back control injected into every full HTML page (`_tn/back.*`).
- Service workers replaced by a no-op (`_tn/sw-noop.js`) so nothing touches caches on the shared preview origin.
- 11 film posters plated dark (same file name and size) wherever they appear as posters: the 8 (buddy-time, cover-with-love-isabelle, explorers, flower-crown, mandie, no-place-like-home, the-smell-needs-to-go, weird-kid) plus celebraciones, backward-fall, lets-grow-good-together (as in tiled-moon-v3). Swept film frames stay (approved).
- Vimeo/YouTube URLs removed (m2 film pages and data).
- Spirit Eye budget page (PDF p.24) removed from `film/m4/3d` (page entry + images).
- `film/m4` Reel 2026 full reel re-encoded to fit the 19.8 MB part limit (same picture and sound, lower bitrate, metadata stripped).
- Build notes (`*.md`) and m2's `build.py` removed from pieces.
- `film/m4/js/inner.js`: the three held studio photos taken out of the cedar shot list and the hand-carved-piece card falls back to the cup photo — the same change as main c778a32 / 9c7a154 (fixed a 404).
- Banned-file scan: `tools/scan.sh` (fails on any hit).
