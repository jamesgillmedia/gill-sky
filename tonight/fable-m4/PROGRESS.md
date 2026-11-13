# Film room · progress

Playback media for this preview is `tonight/media/film/<slug>/` (URL `/media/film/<slug>/`).

## TODO

The full-length player files need real hosting, not YouTube and not Vimeo: Weird Kid `player-1080p` (2048×1080, 144–184 MB) and One With the Devil `player-720p` (1280×720, 81–148 MB). The H.264 masters are over GitHub's 100 MB limit, so this preview stands in with the muted 720p hero loop (`loop-720.*`).

## Film room package

Featured order is One With the Devil, Weird Kid, Back to the Start, Backward Fall, BMW Legends. A board three or more columns wide gives One With the Devil a 2×2 lead tile. Featured films open in the stills player (`js/filmplayer.js`): local stills dissolve, then role, awards, and the other featured cards. The board and any work without stills keep the muted codec ladder (AV1, then VP9, then H.264). One With the Devil does not use its AAC clip as the hero. Weird Kid stays featured second; its 6.51s 1366×720 muted loop remains the board stand-in.
