# Film room · progress

Playback media for this preview is `tonight/media/film/<slug>/` (URL `/media/film/<slug>/`).

## TODO

The full-length player files need real hosting, not YouTube and not Vimeo: Weird Kid `player-1080p` (2048×1080, 144–184 MB) and One With the Devil `player-720p` (1280×720, 81–148 MB). The H.264 masters are over GitHub's 100 MB limit, so this preview stands in with the muted 720p hero loop (`loop-720.*`).

## Film room package

Featured order is One With the Devil, Weird Kid, Back to the Start, Backward Fall, BMW Legends. A board three or more columns wide gives One With the Devil a 2×2 lead tile. Featured films open in the stills player (`js/filmplayer.js`): local stills dissolve, then role, awards, and the other featured cards. The board and any work without stills keep the muted codec ladder (AV1, then VP9, then H.264). One With the Devil does not use its AAC clip as the hero. Weird Kid stays featured second; its 6.51s 1366×720 muted loop remains the board stand-in.

## Sketch nav and motion

The About calibre layer (stars gathering into the mark, and the 09_landscape thumbnail on desktop) is deferred to the Fable 3D pass, because that pass owns the sky depth and the stills that would have to move with it.

The player is a full-size state. A slim To Go bar sits under Film at full brightness. Tapping it grows the player from the touch point. A downward swipe shrinks it back into the bar. A featured card grows the next film from the card. The first still is up at once, and the entrance bokeh is capped. The mark steps up one level. The drawer is the separate control beside the mark. Esc on the sky leaves for the hub. A/B/C stays hidden unless `?dev=1`. Titles and Film chrome (Hire, role lines, the now-playing pill) use `#e8e4dc`. Reduce Motion keeps the same 1.2 s dissolve. Backward Fall carries the Leo Award for Best Student Production (2014, producer). Back to the Start stays `Co-director · Cinematographer · Producer`.

## Spaces · drawing mat, captions, and the hint line

On a phone, a plant caption hangs under the photograph on a dark plate `rgba(4,7,11,.82)` in `#e8e4dc`. The photo keeps true colour (`keepTrue`) and draws after the additive shafts, so Red still lights plan lines and fibre ends and leaves the photographs alone.

The ecosystem card on a narrow screen ends above Back and Next, scrolls inside itself, and fades its last line.

Plan drawings sit smaller on a `#04070b` mat with a soft vignette. The dev row `gj.spaces.line` is `sheet` (the launch look) or `night line` (warm-white lines on the mat). Red keeps its own linework either way.

Gallery sheets and the drifting tiles fade in from `#04070b`. One hint line reads `the mark closes the sheet · next wraps to the start`, then leaves. The mark and crumb keep a `#04070b` text-shadow so the top bar stays readable over the garden.

`tonight/fable-m4/versions/se-a/` carries the same sheet, caption, card, and fade. The live room is `tonight/spaces/forest-garden/`.
