/* Night Listening — song archive.
   Replace any entry. Drop an audio file beside this page and set `src`
   (or `audioSrc`) to a relative path such as "audio/keel.mp3".
   An empty src plays a soft generated tone. */
window.NIGHT = {
  songs: [
    { id: "unlatched", title: "No Problem", constellation: "Glass Hour", length: 80, bpm: 85, src: "", tone: 110, x: 460, y: 340 },
    { id: "salt", title: "=", constellation: "Glass Hour", length: 308, bpm: 116, src: "", tone: 98, x: 330, y: 460 },
    { id: "room", title: "To Go", constellation: "Glass Hour", length: 103, bpm: 93, src: "", tone: 87, x: 590, y: 480 },
    { id: "paper", title: "Lost in Time", constellation: "Glass Hour", length: 216, bpm: 81, src: "", tone: 123, x: 480, y: 560 },
    { id: "keel", title: "ii", constellation: "North Water", length: 70, bpm: 63, src: "", tone: 82, x: 980, y: 300 },
    { id: "fog", title: "Gone Are the Days of Yesterday", constellation: "North Water", length: 120, bpm: 89, src: "", tone: 73, x: 860, y: 420 },
    { id: "current", title: "Devil's Palm Live", constellation: "North Water", length: 60, bpm: 123, src: "", tone: 98, x: 1120, y: 440 },
    { id: "low", title: "Silence", constellation: "North Water", length: 222, bpm: 148, src: "", tone: 110, x: 1000, y: 540 },
    { id: "cedar", title: "Cedar Smoke", constellation: "Low Lantern", length: 268, bpm: 60, src: "", tone: 65, x: 620, y: 820 },
    { id: "porch", title: "Porch Light", constellation: "Low Lantern", length: 191, bpm: 74, src: "", tone: 87, x: 480, y: 920 },
    { id: "nightbus", title: "Night Bus", constellation: "Low Lantern", length: 203, bpm: 88, src: "", tone: 98, x: 760, y: 900 },
    { id: "last", title: "Last Call for the Mountain", constellation: "Low Lantern", length: 234, bpm: 66, src: "", tone: 73, x: 640, y: 1020 }
  ],
  links: [
    ["unlatched", "salt"], ["salt", "room"], ["room", "paper"], ["paper", "unlatched"],
    ["keel", "fog"], ["fog", "current"], ["current", "low"], ["low", "keel"],
    ["cedar", "porch"], ["porch", "nightbus"], ["nightbus", "last"], ["last", "cedar"]
  ]
};
