# tile-reveal

Tile-by-tile reveal entry (the 4:23 moment). Dark night-sky language. Film tiles from `tonight/tiled-moon/img/films/` and a few special thumbs under `tonight/film/m4/media/`.

## Missing / odd assets

| Issue | Detail |
| --- | --- |
| **No `14` in live film chapter** | Numbered film thumbs jump `13` → `15` (REEL ‘24). `tonight/tiled-moon/img/films/14-400.webp` and `14-720.webp` exist but are **orphaned** — not referenced by any card in `u4-opus-m4/data.json`. |
| **Non-numbered thumbs** | `demo-reel` → `media/pro2/reel/a/001.webp`; `reel-2026` → `media/v3/media/reel/thumb.jpg`; `one-with-the-devil` → `media/owtd/stills/09_landscape.jpg`. |
| **Labelled 4×5, assets 16∶9** | `fire`, `hike`, `canoe` meta says `IG (4x5)` but tiled-moon thumbs are **400×225 / 720×405** (~1.78). Showing them as landscape tiles mismatches the stated ratio. |
| **`data.json` w/h often 0** | Most film cards have `media.w`/`media.h` = 0; only `one-with-the-devil` carries 1920×1080. Aspect must come from the image file, not the card. |
| **`01-720.webp` odd size** | `01-720.webp` is 584×328 (not 720-wide); `01-400.webp` is a clean 400×225. Prefer `-400` for grid density. |

## Serving

Serve from repo root so `../../tonight/...` resolves (e.g. `python3 -m http.server` at `/agent/repos/gill-sky`).
