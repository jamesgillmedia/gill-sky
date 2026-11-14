/* Alt text for the photo labs' photographs. The labs draw their pictures with script and label them "photograph 07" / "print 07";
   this swaps that generic alt for a literal description (shared/photo-alts.js, written by tools/site-polish/alts.py).
   It only ever sets the alt attribute: no picture is touched. Pictures the labs mark decorative (alt="") stay decorative. */
(function () {
  'use strict';
  var A = {
 "p01": "A bundle of dried plants tied with string, lying on a pale ground",
 "p02": "A hand holding a dark bowl seen from above, black and white",
 "p03": "A pencil drawing of long fine strands gathered at a stitched band",
 "p04": "A pencil drawing of long strands gathered under a dark rim",
 "p05": "The front of a dark car at night with both headlights lit",
 "p06": "The inside rim of a bowl, a crescent of light around a dark opening",
 "p07": "A dark bowl on a table in soft grey light, black and white",
 "p08": "A water surface with small flecks of light, black and white",
 "p09": "A hand holding a dark bowl toward the camera, black and white",
 "p10": "A hand holding a small pale bowl, black and white",
 "p11": "A hand holding an upright dark carved paddle against a wall striped with window shadows, black and white",
 "p12": "A dark wooden paddle in window light with its shadow beside it",
 "p13": "A hand holding a long dark spoon against a wall of window shadows",
 "p14": "Two hands working in soil and dry grass, in blue light",
 "p15": "A hand holding a small copper-coloured spoon by its handle against window shadows",
 "p16": "A hand holding a long dark spoon with window shadows on the wall",
 "p17": "A hand holding a small grey cup planted with a green sprig and a dark cone-like plant",
 "p18": "A hand wearing a brass bracelet holding a pale wooden paddle",
 "p19": "A hand holding a cup with its pale inside turned toward the camera",
 "p20": "A hand holding a speckled glazed cup",
 "p21": "A hand holding a small black cup with moss growing from it, in a stripe of sunlight",
 "p22": "A small cup with moss on the corner of a dark wooden table",
 "p23": "A face in a car rear-view mirror with blurred traffic lights behind",
 "p24": "A hand holding a black cup with tall moss, over a wooden table",
 "p25": "A hand holding a pale glazed bowl seen from above",
 "p26": "A hand holding a ceramic spoon with a dark carved handle",
 "p27": "A black cup with feathery green moss held up in a hand",
 "p28": "One hand holding a small glazed dish with the other hand above it",
 "p29": "A hand holding a pale ceramic scoop with a dark handle",
 "p30": "A hand holding a small pale cup seen from slightly above",
 "p31": "A shallow wooden tray on a wood floor with a hand at one edge and a straw broom behind",
 "p32": "A figure in violet and blue light inside a wide dark frame",
 "p33": "A close view of a hand holding the end of a dark carved wooden paddle",
 "p34": "A speckled grey cup with coffee on a terrazzo table, bowls behind it",
 "p35": "A close view of a mottled grey and cream glazed cup in a hand",
 "p36": "A hand holding a mottled cup with liquid inside, seen from above",
 "p37": "A latte in a glass beside a dark wooden tray on pale fleece in sunlight",
 "p38": "A latte in a glass beside the slatted edge of a dark wooden tray on pale fleece",
 "p39": "A small dark wooden tray with a latte, seen from above on pale fleece with a band of shadow",
 "p40": "A close portrait of a bearded man in a dark hat in warm light",
 "p41": "A pencil drawing of long fine strands gathered at a stitched band",
 "p42": "A figure in shiny armour-like clothing in red and orange smoke with a glowing orange light",
 "p43": "A water surface with small flecks of light, black and white",
 "p44": "Looking up into a dark stone arch with a bright spot of light, black and white",
 "p45": "A close view of a green eye and eyebrow in yellow light",
 "p46": "A figure in deep blue light with red glowing shapes and streaks of white light",
 "p47": "A close portrait of a bearded man looking at the camera",
 "p48": "Looking straight up through tall conifer trees in mist, black and white",
 "p49": "A man in a pale straw hat and a v-neck shirt in profile, in sepia tones",
 "p50": "A dark forest path between tall trees",
 "p51": "A dark forest with a narrow stream running through it",
 "p52": "A misty forest with a stream and bare trees in green-grey light",
 "p53": "Four lit candles of different heights in holders on a dark wooden table",
 "p54": "A room with a curved slatted screen, a blue shelf and a stool, lit warmly",
 "p55": "A soft red and orange blur with two small round shapes",
 "p56": "A high-contrast black and white drawn-looking portrait of a bearded man with wide eyes",
 "p57": "A soft pink gradient",
 "p58": "A pink swirled drink seen from above in a cup with a brass rim",
 "p59": "A single dried red rose on its stem, on white",
 "p60": "A soft pale yellow gradient",
 "p61": "A soft yellow blur with a pale rounded shape at the right",
 "p62": "A pink poster with a green ring around an orange disc and a small \"co\" mark at the lower left",
 "p63": "A dark frame with a glowing ring in rainbow colours and a thin white sketched arc and line",
 "p64": "A grid of small blue-grey half-lit moon tiles on a dark ground",
 "p65": "Red flowers on long stems against a glowing white-blue arc, with glitch lines",
 "p66": "A pale rendered cup on a table against a teal-to-pink gradient",
 "p67": "A dark blurred blue-grey rounded shape on a dark ground"
};
  var GENERIC = /^(photograph|print) \d+/;
  var SRC = /\/p(\d\d)\.webp(?:\?|$)/;
  function fix(im) {
    var a = im.getAttribute('alt');
    if (a == null || !GENERIC.test(a)) return;
    var m = SRC.exec(im.getAttribute('src') || '');
    if (!m || !A['p' + m[1]]) return;
    var t = A['p' + m[1]];
    if (a !== t) im.setAttribute('alt', t);
  }
  function scan(n) {
    if (n.nodeType !== 1) return;
    if (n.tagName === 'IMG') fix(n);
    else if (n.querySelectorAll) [].forEach.call(n.querySelectorAll('img'), fix);
  }
  function start() {
    scan(document.documentElement);
    new MutationObserver(function (list) {
      list.forEach(function (r) {
        if (r.type === 'attributes') fix(r.target);
        else [].forEach.call(r.addedNodes, scan);
      });
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'alt'] });
  }
  if (document.documentElement) start(); else document.addEventListener('DOMContentLoaded', start);
})();
