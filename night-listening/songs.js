/* Night Listening — song data.
   Placeholder titles and numbers. Replace with real songs (see README.md).
   title      : shown beside the star and in the player bar
   constellation : which era/album group (must match an id below)
   lengthSec  : song length in seconds (sets star size; used for test tones)
   bpm        : tempo for the star's pulse
   src        : path to an audio file (e.g. "audio/song-01.mp3"). Leave "" to play a quiet test tone.
*/
window.NIGHT_LISTENING = {
  constellations: [
    { id: "I",   name: "Era I"   },
    { id: "II",  name: "Era II"  },
    { id: "III", name: "Era III" }
  ],
  songs: [
    { title: "Song 01", constellation: "I",   lengthSec: 214, bpm: 84,  src: "" },
    { title: "Song 02", constellation: "I",   lengthSec: 287, bpm: 92,  src: "" },
    { title: "Song 03", constellation: "I",   lengthSec: 168, bpm: 76,  src: "" },
    { title: "Song 04", constellation: "I",   lengthSec: 241, bpm: 100, src: "" },
    { title: "Song 05", constellation: "II",  lengthSec: 302, bpm: 70,  src: "" },
    { title: "Song 06", constellation: "II",  lengthSec: 195, bpm: 110, src: "" },
    { title: "Song 07", constellation: "II",  lengthSec: 256, bpm: 88,  src: "" },
    { title: "Song 08", constellation: "II",  lengthSec: 179, bpm: 96,  src: "" },
    { title: "Song 09", constellation: "III", lengthSec: 333, bpm: 64,  src: "" },
    { title: "Song 10", constellation: "III", lengthSec: 222, bpm: 120, src: "" },
    { title: "Song 11", constellation: "III", lengthSec: 270, bpm: 80,  src: "" },
    { title: "Song 12", constellation: "III", lengthSec: 150, bpm: 104, src: "" }
  ]
};
