# u4-opus · m2 · the board level

## What changed since m1
- **Every category has a board again.** The levels are now sky › category (constellation) › **board** › piece › deeper. Tapping and pinching both go one level deeper, and the back button goes up exactly one level.
- **The constellation shows its own work.** Its dots become small thumbnails in place, each with a clear label. Film shows 2.39 strips, Photo shows tilted prints and Objects shows cut-outs.
- **A board for each medium, each with a different shape:**
  - Film: offset 2.39 strips at different depths, with side captions (type · length · role).
  - Photo: a two-column stack of tilted prints on paper, with a contact sheet on the list flip.
  - Objects: cut-outs on an off-kilter grid with soft shadows.
  - Sound: song covers with dotted waveforms and an inline play button. The player rail stays on the sound constellation.
  - About: a text index (bio, poem, contact, joio.co, Hire) and the client line.
- **A list flip on every board.** It shows the same work as a plain list.
- **Where am I.** The breadcrumb follows every level (film › board › piece › frames …), with a row of depth dots under it.
- **The top bar no longer covers the work.** Below the sky it becomes a solid strip with only back, the breadcrumb and Hire. Full-bleed pictures, Sound and About start under it.
- **The song player works.** `player/js/tracks.js` is generated from sound-sketch, uses the MP3s in this folder and has no YouTube links.
- **About:** the black band at the top of the calculator is gone (the crop now skips the dark strip in the video), and the text panel is lighter.
- **Links into a board work.** For example `#film/board` and `#sound/board`, including a hash typed into the address bar.

## Files
- `01-sky` … `11-about-bio`: 390x844 screenshots, taken with Reduce Motion emulated.
- `m2-walk.mp4`: sky › film › board › piece › back, then each board, recorded with Reduce Motion emulated.

## What's next
- Depth inside each medium per UNDERSTANDING.md: Film frames › the frame › the field; Photo contact sheet › print › grain; Sound inside the waveform › among the stars; Objects close-up › process › joio with Spirit Eye beside it.
- The remaining u3 bugs:
  - the black beat on Demo Reel;
  - the Weird Kid title wrap;
  - the empty black fields;
  - the Demo Reel caption;
  - the dark first Sound cover.
- Pages that work with JavaScript off for each board, offline caching, and a test as an installed app.
