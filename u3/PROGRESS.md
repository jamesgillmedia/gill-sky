# u3 progress

u3 is a copy of u2. u2 is not edited.

## How a version copies

Copy this folder to make the next one. `build.py` writes only into the folder you pass (`python3 u4/build.py u4`). Data and media paths are relative to that folder. The shell cache and the “seen the arrival” memory use the folder’s own path, so two versions on the same site do not share them. This file stays in the folder as the checkpoint. A rebuild does not replace it.

## Milestone 1

The folder came up as u2, with its own shell cache. Rough arrival and sky: `u3-rough-arrival.png`, `u3-rough-sky.png`.

## Milestone 2

Close-ups, the nine fixes, the depth budget, the gaps, and the song player. The rulebook is `RULEBOOK.md`.

- Arrival: the poem sits above the footer, and “touch the water” clears the footer and the bottom safe area.
- One With the Devil: the award line wraps.
- About: a dark band sits behind the calculator text.
- Hire stays in the top bar at every depth in the sky. It is still hidden on arrival and the landings.
- In progress is a brighter ring with a soft label.
- Sound is a dotted chart. A mint pill shows each song’s length from the file (To Go 1:20, Gone Are the Days 1:20, No Problem 1:20, Lost in Time 1:30, = 1:30, ii 1:10).
- Weird Kid keeps “dir. Gill James & Kiesza”. That line is in the published credits.
- Photo labels that were “photograph 22” are “untitled”. The files have no EXIF place or date. Slugs are unchanged.
- The objects board opens on the joio cup from above, not the wood-fired pizza.
- Song pages use the sound-sketch player. The native audio element stays for when JavaScript is off, and it preloads metadata so the length is the file’s length. The waveform page was pointing at `media/pro2/audio/` inside its own folder, so those files could not load. They now point at `../../media/pro2/audio/`.

### Depth

- Film, Weird Kid: framed hero, frame wall, full-bleed still, neighbouring frames, Kiesza, credits as a list. Six levels.
- Film, other pieces with frames: hero, wall, full-bleed, the frame field, credits. Five levels.
- Photo: loose stacks, contact sheet, one print full-bleed with a slow push, grain crops of that print. Four levels under the board. The print that opens is the one under your finger, chosen before the zoom moves the sheet.
- Sound: dotted star chart, the player, inside the waveform, then among the stars as the audio moves. Four levels. Pinching out reverses that order.
- Objects: board (a cup), the object close-up, process and the joio clips, full-bleed clip with Spirit Eye beside it. Four levels.
- About: seven calculator layers, then the moon grid. Eight levels. Pinching out from the moon returns to layer 7. Pinching out from layer 1 is the moon-grid exit: the grid plays, then it fades back to the sky.
- Opening a chapter flies into that constellation until the outer nodes leave the screen, then the spring eases to a stop. The work window still fills the phone. A pinch scales from the spot you touched. Weird Kid’s frames bloom into the mosaic.

Stars frame sound only. Film credits are a list on the still. The sky itself is still night water.

### Gaps

Filled only from files already in the folder. Nothing was drawn or written to stand in.

- Sound, far. Filled. The chart uses the covers already on the songs (`waveform-480.webp`, `purple.webp`, `moonloop.webp`, `to-go-480.webp`) and the measured peaks (`togo`, `gone`, `lostintime`, `noproblem`, `player`). Every song on the chart has peaks, so the quiet line “no waveform for this song” was not needed. A sine stand-in is no longer drawn when peaks are missing.
- Objects, far. Filled. The board and the sky nodes use the real stills: the cup (`cup-top-960.webp`), Spirit Eye (`spirit-eye.webp`), the carved piece, and the studio. No star ring around them.
- Objects, middle. joio is filled with the studio clips `c/05`, `c/13`, `c/16`, `c/12`, `c/07`, `c/02` and the stills beside them. Spirit Eye is filled with the one plan in the repo, `spirit-eye.webp`. There is no rest of a deck, so the three text-only cards were removed and nothing was added. The design board, the wireframe, and the materials board have a single still and no process set, so that level is left empty: “no process pictures for this piece”. The old nine-crop stand-in is gone.
- Objects, deepest. joio plays `c/05.mp4`, with Spirit Eye beside it. Spirit Eye and the design board have no clip, so they push the still that exists (`spirit-eye.webp`, `boards-960.webp`). A piece with neither still nor clip says “no moving picture of this piece”. No piece in the folder is in that state.
- About, deepest. Filled with `media/about/moon-grid.mp4`. It plays. If that file fails, the slot says “no picture of the moon grid”.

### Fits the artist

- Arrival and the sky: kept the night water, the poem, and “touch the water”. The client line stays small at the bottom. Hire stays one quiet card: film, objects, space and sound.
- Film: the picture and the published credits lead. Removed the empty “Related” line, the “Frames” heading, the stock word “credit”, and Weird Kid’s doubled “Director · Director of Photography” line, because the published credits already say it. Stars do not frame the films.
- Photo: the prints lead. Removed “untitled” from the picture, and the orientation words portrait, landscape, and square. There was no real place or year to put in their place. The browser tab still says untitled, so nothing is invented.
- Objects: the cup is the door, then the clips. Removed the clip count and “open the page”. The pizza stays later in the feed, because it is a real clip. Spirit Eye stays beside the close-up.
- Sound: one part of the sky, not the headline. Kept the dotted chart, the lengths, and the player. Removed “Listen”, the licensing slogan, and “player · 6 tracks”. Spotify and Apple Music stay as the places the songs already live.
- About: the calculator and the locked layers stay, word for word, including the poem. No pronouns line. Vancouver only. Jack Taylor is not in that locked text, so his name was not added. The dark band is there so the green display does not eat the sentence.

## Still open

- The snow-on-dark-water arrival video. The old file still returns 403, so the arrival keeps the still water.
- Full-length cuts of Sleepwalker, Back to the Start, Weird Kid, and Phantoms and Friends.
