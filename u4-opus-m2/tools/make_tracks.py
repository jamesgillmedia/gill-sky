"""Writes player/js/tracks.js from the sound-sketch track data, pointed at the audio in this folder."""
import json, os, re
here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open('/tmp/src/gilljames/sound-sketch/js/tracks.js').read()
T = json.loads(re.search(r'window\.TRACKS\s*=\s*(\{.*\})\s*;?\s*$', src, re.S).group(1))
for k, t in T.items():
    t.pop('src', None)
    name = os.path.splitext(os.path.basename(t['file']))[0]
    t['file'] = '../media/pro2/audio/' + name + '.mp3'
    assert os.path.exists(os.path.join(here, 'player', t['file'])), t['file']
out = os.path.join(here, 'player/js/tracks.js')
open(out, 'w').write('window.TRACKS=' + json.dumps(T, separators=(',', ':')) + ';\n')
print(out, list(T))
