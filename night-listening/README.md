# Night Listening

Twelve songs as stars. Three constellations, one for each era.

Tap a star once to select it. Tap the same star again to play. Scroll or pinch apart to enter the constellation under your fingers. Pinch together, scroll back, or tap **Whole sky** to return. Drag to pan.

Nothing here phones home. No account, no analytics, no external media.

## Run

Open `index.html` in a browser. No install, no build. Every song plays a quiet generated tone until you add real audio.

## Replace the songs

Edit the `songs` array in `songs.js`.

| Field | Meaning |
| --- | --- |
| `id` | Unique name. Lines in `links` refer to these. |
| `title` | Shown beside the star and on the player. |
| `constellation` | Era name (or `1` / `2` / `3`). Songs that share a name are one figure. |
| `length` | Duration in seconds. Also `lengthSeconds`. Sets the label and star size. |
| `bpm` | How fast the star pulses while the song plays. |
| `src` | Audio path relative to this folder, e.g. `audio/keel.mp3`. Also `audioSrc`. Leave `""` for the tone. |
| `tone` | Pitch in Hz of the fallback tone. |
| `x`, `y` | Position in the sky. Optional — missing positions are placed automatically. |

`links` is a list of `[id, id]` pairs. Each pair becomes a faint line.

Put files in an `audio` folder next to `index.html`, then set `src`. If a file is missing or will not play, the tone continues.
