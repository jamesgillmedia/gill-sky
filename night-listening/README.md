# Night Listening

A small listening page: every song is a star in a slowly drifting night sky.
Three faint constellations stand for albums or eras.

- Tap a star once to select it (its title and length fade in).
- Tap the same star again to play. Tap it again to pause.
- While a song plays, its star pulses with the song's BPM. The bar at the
  bottom has play/pause, a seekable progress line, `vol` (0–100) and
  `flash` (0–100, how strong the pulse is).
- Pinch or scroll to zoom into a constellation and back out. Drag to pan.
  Tap an era name to fly to it; tap it again to return to the whole sky.
  Desktop keys: space play/pause, + / − zoom, Esc back to the whole sky.
- Reduce Motion (system setting): same layout and controls; the drift and
  the pulse become plain opacity fades.

Plain HTML, CSS and JavaScript. No frameworks, no build step, no external
fonts, links or tracking.

## Run it locally

Any static file server works (audio needs http, not `file://`):

```
cd night-listening
python3 -m http.server 8000
```

Then open http://localhost:8000/ . On a phone on the same Wi-Fi, use the
computer's local IP instead of `localhost`.

## Swap in real songs

1. Put the audio files in a folder here, e.g. `night-listening/audio/`.
   MP3 or AAC (`.m4a`) play everywhere, including iPhone Safari.
2. Edit `songs.js`. Each song is one line:

   ```js
   { title: "Song 01", constellation: "I", lengthSec: 214, bpm: 84, src: "audio/song-01.mp3" }
   ```

   - `title`: shown beside the star and in the player bar.
   - `constellation`: the `id` of its era in the `constellations` list at
     the top of `songs.js`. Rename eras with their `name` field.
   - `lengthSec`: length in seconds. It sets the star's size (longer = bigger).
     With a real file, the bar uses the file's own length once it loads.
   - `bpm`: tempo for the pulse.
   - `src`: path to the file. Leave it `""` and the song plays a quiet
     generated test tone (a soft pad with a tick on each beat) instead.
   - Optional `x` / `y`: place a star by hand (world units, roughly −500…500).
3. Up to six songs per era fit the built-in shapes; more spill into a wider ring.

## Notes

- Audio only starts from a tap, as iOS requires.
- On iPhone, test tones use Web Audio. Older iOS versions mute Web Audio
  when the silent switch is on; real files (`src`) play through an audio
  element and are not affected the same way.
