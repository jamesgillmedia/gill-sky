# Framing audit: Film stills at 390x844 portrait

Scope: every Film-section still in m4 (999 film-still entries across 34 films, 995 unique image files; the same frame can appear in the reel and in its own film). Method: each still was rendered through the same full-screen portrait window the site uses (a cover crop shows about 26% of a 16:9 frame, about 20% of a 2.35:1 frame, centred, or the per-still span where one exists), and people and faces were located with an offline person detector (EfficientDet-lite0) plus a face detector (BlazeFace) run over several tiles of each frame. A shot is listed when a detected main subject (the largest person, plus anyone about as large) leaves that window at the side. Contact sheets with the boxes drawn were spot-checked by eye.

## Counts

| | shots (film entries) | unique stills |
|---|---|---|
| head, face or body cut by the portrait crop | 653 | 651 |
| of which fixable by reframing (yes) | 590 | 588 |
| not fixable by reframing (no) | 63 | 63 |
| already inside the window (ok) | 41 | 41 |
| no person or face detected (landscape, object, hands, silhouette; not listed, see caveats) | 305 | 303 |

Per film (entries): cut / ok / no subject

| film | cut | ok | no subject | stills |
|---|---|---|---|---|
| reel-2026 | 130 | 6 | 65 | 201 |
| cinematography-demo-reel-2025 | 37 | 4 | 19 | 60 |
| one-with-the-devil | 7 | 2 | 3 | 12 |
| stay-gold | 8 | 0 | 4 | 12 |
| legends | 0 | 0 | 9 | 9 |
| drift | 4 | 0 | 11 | 15 |
| golden-moment-directors-cut | 12 | 1 | 2 | 15 |
| cover-with-love-isabelle | 11 | 1 | 3 | 15 |
| no-place-like-home | 4 | 0 | 1 | 5 |
| the-smell-needs-to-go | 10 | 1 | 1 | 12 |
| brew-bar-coffee-teaser | 0 | 1 | 5 | 6 |
| explorers | 14 | 2 | 5 | 21 |
| sun-kissed | 13 | 0 | 11 | 24 |
| sleepwalker | 14 | 1 | 12 | 27 |
| repeat-feat-jessie-reyez | 17 | 0 | 10 | 27 |
| flower-crown | 2 | 0 | 2 | 4 |
| backward-fall | 40 | 1 | 4 | 45 |
| s18 | 7 | 0 | 2 | 9 |
| back-to-the-start | 19 | 0 | 2 | 21 |
| lets-grow-good-together | 39 | 2 | 19 | 60 |
| weird-kid | 24 | 10 | 12 | 46 |
| veronas-obsession | 25 | 0 | 23 | 48 |
| obedience-gets-you-nowhere | 10 | 0 | 2 | 12 |
| fire | 4 | 0 | 1 | 5 |
| modern-man | 32 | 0 | 10 | 42 |
| phantoms-and-friends | 22 | 5 | 6 | 33 |
| summer-is-here | 22 | 0 | 5 | 27 |
| eat-well | 4 | 0 | 17 | 21 |
| buddy-time-grandpas-story | 9 | 0 | 0 | 9 |
| canoe | 1 | 1 | 4 | 6 |
| mandie | 56 | 1 | 3 | 60 |
| just-the-beginning | 17 | 0 | 4 | 21 |
| ltl-dstryr | 31 | 1 | 7 | 39 |
| journeys-x-todd | 8 | 1 | 21 | 30 |

Films with no stills at all (nothing to audit): demo-reel, celebraciones, reel-24, hike.

## Caveats

- "Fixable by reframing" means a per-still portrait span (js/framing.js) can bring the head and face fully inside the window, by centring on the subject and, where the subject is wider than the window, widening the window up to a letterbox. It never changes landscape.
- Where a group or a wide body is wider than the window, the fix keeps the head and face in frame first; shoulders and arms can still leave the frame. Those rows say "body cut" and are still counted as yes.
- Reel moment stills are the posters of short clips; the framing is applied to the clip and its poster together, so a subject that moves inside a clip can still drift out of a fixed span.
- Detection is automatic. It misses silhouettes, small or far figures, hands and objects (the "no subject" group), and can place a face on a non-face. Rows are therefore listed as detected, not as hand-verified one by one; the sheets were checked on samples from every film.

## Not fixable by reframing (63 shots)

| film | shot | what is cut | fixable | why not |
|---|---|---|---|---|
| reel-2026 | pro2/reel/a/023.webp | head/face cut at the side | no | face touches the source edge (the source frame itself cuts it) |
| reel-2026 | pro2/reel/a/039.webp | body cut at the side | no | person at the source edge (the source frame itself cuts it) |
| reel-2026 | pro2/reel/b/089.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| reel-2026 | pro2/reel/c/116.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| reel-2026 | pro2/reel/c/128.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| reel-2026 | pro2/reel/c/131.webp | head/face cut at the side | no | head touches the source top (the source frame itself cuts it) |
| reel-2026 | pro2/reel/c/133.webp | head/face cut at the side | no | head touches the source top (the source frame itself cuts it) |
| reel-2026 | pro2/reel/d/160.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| reel-2026 | pro2/reel/e/193.webp | head/face cut at the side | no | head touches the source top (the source frame itself cuts it) |
| cinematography-demo-reel-2025 | pro2/frames/01/18.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| cinematography-demo-reel-2025 | pro2/frames/01/31.webp | head/face cut at the side | no | head touches the source top (the source frame itself cuts it) |
| cinematography-demo-reel-2025 | pro2/frames/01/57.webp | body cut at the side | no | person at the source edge (the source frame itself cuts it) |
| cinematography-demo-reel-2025 | pro2/frames/01/61.webp | body cut at the side (head in frame) | no | head touches the source top (the source frame itself cuts it) |
| cinematography-demo-reel-2025 | pro2/frames/01/66.webp | head/face cut at the side | no | head touches the source top (the source frame itself cuts it) |
| stay-gold | pro2/frames/03/11.webp | head/face cut at the side | no | face touches the source edge (the source frame itself cuts it) |
| cover-with-love-isabelle | pro2/frames/07/02.webp | head/face cut at the side | no | head touches the source top (the source frame itself cuts it) |
| cover-with-love-isabelle | pro2/frames/07/03.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| the-smell-needs-to-go | pro2/frames/09/15.webp | body cut at the side | no | person at the source edge (the source frame itself cuts it) |
| explorers | pro2/frames/11/16.webp | body cut at the side | no | person at the source edge (the source frame itself cuts it) |
| sleepwalker | pro2/frames/13/07.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| repeat-feat-jessie-reyez | pro2/frames/16/00.webp | head/face cut at the side | no | head touches the source top (the source frame itself cuts it) |
| flower-crown | pro2/frames/17/01.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| backward-fall | pro2/frames/18/38.webp | head/face cut at the side | no | face touches the source edge; head touches the source top (the source frame itself cuts it) |
| backward-fall | pro2/frames/18/62.webp | head/face cut at the side | no | head touches the source top (the source frame itself cuts it) |
| backward-fall | pro2/frames/18/65.webp | head/face cut at the side | no | head touches the source top (the source frame itself cuts it) |
| backward-fall | pro2/frames/18/70.webp | head/face cut at the side | no | face touches the source edge; head touches the source top (the source frame itself cuts it) |
| back-to-the-start | pro2/frames/20/03.webp | body cut at the side | no | person at the source edge (the source frame itself cuts it) |
| lets-grow-good-together | pro2/frames/21/15.webp | body cut at the side | no | person at the source edge (the source frame itself cuts it) |
| lets-grow-good-together | pro2/frames/21/46.webp | body cut at the side | no | person at the source edge (the source frame itself cuts it) |
| lets-grow-good-together | pro2/frames/21/55.webp | body cut at the side | no | person at the source edge (the source frame itself cuts it) |
| lets-grow-good-together | pro2/frames/21/57.webp | body cut at the side | no | person at the source edge (the source frame itself cuts it) |
| weird-kid | pro2/frames/22/36.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| weird-kid | pro2/frames/22/67.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| veronas-obsession | pro2/frames/23/06.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| veronas-obsession | pro2/frames/23/13.webp | body cut at the side | no | person at the source edge (the source frame itself cuts it) |
| veronas-obsession | pro2/frames/23/19.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| veronas-obsession | pro2/frames/23/24.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| veronas-obsession | pro2/frames/23/47.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| veronas-obsession | pro2/frames/23/49.webp | body cut at the side | no | head above the source top; person at the source edge (the source frame itself cuts it) |
| obedience-gets-you-nowhere | pro2/frames/24/11.webp | head/face cut at the side | no | face touches the source edge (the source frame itself cuts it) |
| obedience-gets-you-nowhere | pro2/frames/24/19.webp | body cut at the side | no | person at the source edge (the source frame itself cuts it) |
| modern-man | pro2/frames/26/17.webp | head/face cut at the side | no | face touches the source edge; head touches the source top (the source frame itself cuts it) |
| modern-man | pro2/frames/26/26.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| modern-man | pro2/frames/26/33.webp | head/face cut at the side | no | head touches the source top (the source frame itself cuts it) |
| phantoms-and-friends | pro2/frames/27/10.webp | body cut at the side | no | person at the source edge (the source frame itself cuts it) |
| phantoms-and-friends | pro2/frames/27/52.webp | body cut at the side | no | person at the source edge (the source frame itself cuts it) |
| summer-is-here | pro2/frames/28/03.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| summer-is-here | pro2/frames/28/16.webp | body cut at the side | no | person at the source edge (the source frame itself cuts it) |
| summer-is-here | pro2/frames/28/17.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| summer-is-here | pro2/frames/28/25.webp | body cut at the side | no | person at the source edge (the source frame itself cuts it) |
| summer-is-here | pro2/frames/28/28.webp | body cut at the side | no | person at the source edge (the source frame itself cuts it) |
| eat-well | pro2/frames/29/10.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| eat-well | pro2/frames/29/17.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| eat-well | pro2/frames/29/20.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| buddy-time-grandpas-story | pro2/frames/30/02.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| buddy-time-grandpas-story | pro2/frames/30/07.webp | body cut at the side | no | person at the source edge (the source frame itself cuts it) |
| mandie | pro2/frames/33/20.webp | head/face cut at the side | no | face touches the source edge; head touches the source top (the source frame itself cuts it) |
| mandie | pro2/frames/33/21.webp | body cut at the side | no | head above the source top (the source frame itself cuts it) |
| mandie | pro2/frames/33/28.webp | head/face cut at the side | no | head touches the source top (the source frame itself cuts it) |
| mandie | pro2/frames/33/60.webp | head/face cut at the side | no | face touches the source edge (the source frame itself cuts it) |
| ltl-dstryr | pro2/frames/35/04.webp | body cut at the side | no | person at the source edge (the source frame itself cuts it) |
| ltl-dstryr | pro2/frames/35/35.webp | body cut at the side (head in frame) | no | head touches the source top (the source frame itself cuts it) |
| ltl-dstryr | pro2/frames/35/39.webp | head/face cut at the side | no | head touches the source top (the source frame itself cuts it) |

## Fixable shots (590)

| film | shot | what is cut | fixable | proposed span (left, right) |
|---|---|---|---|---|
| reel-2026 | pro2/reel/a/000.webp | body cut at the side | yes | 0.74, 0.99 |
| reel-2026 | pro2/reel/a/002.webp | body cut at the side | yes | 0.57, 0.98 |
| reel-2026 | pro2/reel/a/006.webp | body cut at the side | yes | 0.19, 0.98 |
| reel-2026 | pro2/reel/a/008.webp | body cut at the side | yes | 0.37, 0.92 |
| reel-2026 | pro2/reel/a/009.webp | body cut at the side (head in frame) | yes | 0.33, 0.71 |
| reel-2026 | pro2/reel/a/010.webp | body cut at the side | yes | 0.00, 0.87 |
| reel-2026 | pro2/reel/a/011.webp | head/face cut at the side | yes | 0.41, 0.78 |
| reel-2026 | pro2/reel/a/015.webp | body cut at the side | yes | 0.21, 0.50 |
| reel-2026 | pro2/reel/a/016.webp | body cut at the side | yes | 0.20, 0.51 |
| reel-2026 | pro2/reel/a/017.webp | body cut at the side | yes | 0.55, 0.77 |
| reel-2026 | pro2/reel/a/018.webp | head/face cut at the side | yes | 0.30, 0.79 |
| reel-2026 | pro2/reel/a/019.webp | head/face cut at the side | yes | 0.50, 0.75 |
| reel-2026 | pro2/reel/a/020.webp | head/face cut at the side | yes | 0.27, 0.61 |
| reel-2026 | pro2/reel/a/021.webp | body cut at the side | yes | 0.52, 0.66 |
| reel-2026 | pro2/reel/a/024.webp | body cut at the side | yes | 0.51, 0.69 |
| reel-2026 | pro2/reel/a/025.webp | head/face cut at the side | yes | 0.47, 0.77 |
| reel-2026 | pro2/reel/a/026.webp | head/face cut at the side | yes | 0.43, 0.88 |
| reel-2026 | pro2/reel/a/031.webp | head/face cut at the side | yes | 0.17, 0.46 |
| reel-2026 | pro2/reel/a/032.webp | body cut at the side | yes | 0.35, 0.52 |
| reel-2026 | pro2/reel/a/033.webp | body cut at the side | yes | 0.70, 0.99 |
| reel-2026 | pro2/reel/a/041.webp | head/face cut at the side | yes | 0.09, 0.69 |
| reel-2026 | pro2/reel/a/043.webp | body cut at the side | yes | 0.03, 1.00 |
| reel-2026 | pro2/reel/a/044.webp | head/face cut at the side | yes | 0.50, 0.85 |
| reel-2026 | pro2/reel/b/047.webp | head/face cut at the side | yes | 0.36, 0.93 |
| reel-2026 | pro2/reel/b/049.webp | body cut at the side | yes | 0.30, 0.73 |
| reel-2026 | pro2/reel/b/050.webp | head/face cut at the side | yes | 0.01, 0.60 |
| reel-2026 | pro2/reel/b/053.webp | head/face cut at the side | yes | 0.51, 0.99 |
| reel-2026 | pro2/reel/b/054.webp | body cut at the side | yes | 0.22, 0.65 |
| reel-2026 | pro2/reel/b/055.webp | head/face cut at the side | yes | 0.22, 0.73 |
| reel-2026 | pro2/reel/b/056.webp | body cut at the side | yes | 0.46, 0.97 |
| reel-2026 | pro2/reel/b/057.webp | body cut at the side (head in frame) | yes | 0.36, 0.64 |
| reel-2026 | pro2/reel/b/058.webp | body cut at the side (head in frame) | yes | 0.37, 0.64 |
| reel-2026 | pro2/reel/b/060.webp | head/face cut at the side | yes | 0.13, 0.60 |
| reel-2026 | pro2/reel/b/062.webp | head/face cut at the side | yes | 0.16, 0.36 |
| reel-2026 | pro2/reel/b/064.webp | body cut at the side | yes | 0.53, 0.80 |
| reel-2026 | pro2/reel/b/066.webp | body cut at the side (head in frame) | yes | 0.19, 0.55 |
| reel-2026 | pro2/reel/b/067.webp | head/face cut at the side | yes | 0.68, 0.94 |
| reel-2026 | pro2/reel/b/068.webp | body cut at the side | yes | 0.24, 0.63 |
| reel-2026 | pro2/reel/b/069.webp | head/face cut at the side | yes | 0.16, 0.55 |
| reel-2026 | pro2/reel/b/070.webp | body cut at the side | yes | 0.21, 0.79 |
| reel-2026 | pro2/reel/b/073.webp | body cut at the side | yes | 0.33, 0.66 |
| reel-2026 | pro2/reel/b/074.webp | body cut at the side | yes | 0.25, 0.46 |
| reel-2026 | pro2/reel/b/076.webp | body cut at the side | yes | 0.20, 1.00 |
| reel-2026 | pro2/reel/b/077.webp | body cut at the side | yes | 0.06, 0.37 |
| reel-2026 | pro2/reel/b/079.webp | body cut at the side | yes | 0.30, 0.57 |
| reel-2026 | pro2/reel/b/080.webp | head/face cut at the side | yes | 0.00, 0.61 |
| reel-2026 | pro2/reel/b/081.webp | body cut at the side | yes | 0.47, 0.98 |
| reel-2026 | pro2/reel/b/082.webp | head/face cut at the side | yes | 0.07, 0.59 |
| reel-2026 | pro2/reel/b/083.webp | body cut at the side | yes | 0.17, 0.79 |
| reel-2026 | pro2/reel/b/084.webp | body cut at the side (head in frame) | yes | 0.25, 0.57 |
| reel-2026 | pro2/reel/b/087.webp | head/face cut at the side | yes | 0.47, 0.73 |
| reel-2026 | pro2/reel/b/088.webp | body cut at the side (head in frame) | yes | 0.31, 0.67 |
| reel-2026 | pro2/reel/c/090.webp | body cut at the side | yes | 0.36, 0.69 |
| reel-2026 | pro2/reel/c/092.webp | head/face cut at the side | yes | 0.56, 0.88 |
| reel-2026 | pro2/reel/c/093.webp | body cut at the side | yes | 0.34, 0.59 |
| reel-2026 | pro2/reel/c/095.webp | body cut at the side | yes | 0.48, 0.68 |
| reel-2026 | pro2/reel/c/096.webp | body cut at the side | yes | 0.13, 0.49 |
| reel-2026 | pro2/reel/c/097.webp | body cut at the side (head in frame) | yes | 0.34, 0.68 |
| reel-2026 | pro2/reel/c/098.webp | body cut at the side | yes | 0.01, 0.50 |
| reel-2026 | pro2/reel/c/099.webp | body cut at the side | yes | 0.00, 0.60 |
| reel-2026 | pro2/reel/c/102.webp | body cut at the side | yes | 0.19, 0.49 |
| reel-2026 | pro2/reel/c/104.webp | head/face cut at the side | yes | 0.17, 0.66 |
| reel-2026 | pro2/reel/c/105.webp | body cut at the side | yes | 0.18, 0.49 |
| reel-2026 | pro2/reel/c/106.webp | body cut at the side | yes | 0.14, 0.92 |
| reel-2026 | pro2/reel/c/108.webp | head/face cut at the side | yes | 0.03, 0.97 |
| reel-2026 | pro2/reel/c/109.webp | body cut at the side | yes | 0.18, 0.99 |
| reel-2026 | pro2/reel/c/110.webp | body cut at the side | yes | 0.21, 0.99 |
| reel-2026 | pro2/reel/c/111.webp | body cut at the side | yes | 0.40, 0.94 |
| reel-2026 | pro2/reel/c/112.webp | body cut at the side | yes | 0.01, 0.96 |
| reel-2026 | pro2/reel/c/113.webp | head/face cut at the side | yes | 0.19, 0.41 |
| reel-2026 | pro2/reel/c/114.webp | body cut at the side | yes | 0.00, 0.99 |
| reel-2026 | pro2/reel/c/117.webp | head/face cut at the side | yes | 0.46, 0.99 |
| reel-2026 | pro2/reel/c/118.webp | head/face cut at the side | yes | 0.00, 0.53 |
| reel-2026 | pro2/reel/c/119.webp | body cut at the side | yes | 0.00, 0.84 |
| reel-2026 | pro2/reel/c/120.webp | body cut at the side | yes | 0.20, 0.47 |
| reel-2026 | pro2/reel/c/121.webp | head/face cut at the side | yes | 0.01, 0.46 |
| reel-2026 | pro2/reel/c/123.webp | head/face cut at the side | yes | 0.07, 0.66 |
| reel-2026 | pro2/reel/c/124.webp | head/face cut at the side | yes | 0.39, 0.85 |
| reel-2026 | pro2/reel/c/125.webp | body cut at the side | yes | 0.14, 0.99 |
| reel-2026 | pro2/reel/c/126.webp | head/face cut at the side | yes | 0.18, 1.00 |
| reel-2026 | pro2/reel/c/127.webp | body cut at the side | yes | 0.01, 0.75 |
| reel-2026 | pro2/reel/c/129.webp | body cut at the side | yes | 0.26, 0.93 |
| reel-2026 | pro2/reel/c/130.webp | body cut at the side | yes | 0.11, 0.82 |
| reel-2026 | pro2/reel/d/135.webp | body cut at the side | yes | 0.45, 0.78 |
| reel-2026 | pro2/reel/d/136.webp | body cut at the side (head in frame) | yes | 0.30, 0.80 |
| reel-2026 | pro2/reel/d/137.webp | body cut at the side (head in frame) | yes | 0.34, 0.70 |
| reel-2026 | pro2/reel/d/139.webp | body cut at the side | yes | 0.59, 0.94 |
| reel-2026 | pro2/reel/d/140.webp | body cut at the side | yes | 0.28, 0.80 |
| reel-2026 | pro2/reel/d/142.webp | body cut at the side | yes | 0.00, 0.77 |
| reel-2026 | pro2/reel/d/143.webp | body cut at the side | yes | 0.02, 0.58 |
| reel-2026 | pro2/reel/d/144.webp | head/face cut at the side | yes | 0.40, 0.92 |
| reel-2026 | pro2/reel/d/147.webp | body cut at the side | yes | 0.50, 0.99 |
| reel-2026 | pro2/reel/d/148.webp | head/face cut at the side | yes | 0.03, 0.96 |
| reel-2026 | pro2/reel/d/151.webp | head/face cut at the side | yes | 0.29, 0.67 |
| reel-2026 | pro2/reel/d/152.webp | head/face cut at the side | yes | 0.29, 0.79 |
| reel-2026 | pro2/reel/d/154.webp | body cut at the side (head in frame) | yes | 0.33, 0.73 |
| reel-2026 | pro2/reel/d/158.webp | body cut at the side (head in frame) | yes | 0.38, 0.63 |
| reel-2026 | pro2/reel/d/159.webp | head/face cut at the side | yes | 0.31, 0.80 |
| reel-2026 | pro2/reel/d/162.webp | body cut at the side | yes | 0.54, 0.75 |
| reel-2026 | pro2/reel/d/163.webp | body cut at the side | yes | 0.21, 0.80 |
| reel-2026 | pro2/reel/d/166.webp | head/face cut at the side | yes | 0.04, 0.30 |
| reel-2026 | pro2/reel/d/170.webp | body cut at the side | yes | 0.01, 0.99 |
| reel-2026 | pro2/reel/d/171.webp | body cut at the side | yes | 0.00, 0.97 |
| reel-2026 | pro2/reel/d/172.webp | body cut at the side | yes | 0.00, 0.59 |
| reel-2026 | pro2/reel/d/173.webp | head/face cut at the side | yes | 0.51, 0.99 |
| reel-2026 | pro2/reel/d/175.webp | head/face cut at the side | yes | 0.08, 0.88 |
| reel-2026 | pro2/reel/d/176.webp | head/face cut at the side | yes | 0.22, 0.43 |
| reel-2026 | pro2/reel/d/177.webp | body cut at the side | yes | 0.14, 0.74 |
| reel-2026 | pro2/reel/d/178.webp | body cut at the side | yes | 0.01, 0.99 |
| reel-2026 | pro2/reel/d/179.webp | body cut at the side | yes | 0.01, 0.74 |
| reel-2026 | pro2/reel/e/182.webp | head/face cut at the side | yes | 0.12, 1.00 |
| reel-2026 | pro2/reel/e/183.webp | body cut at the side | yes | 0.32, 0.99 |
| reel-2026 | pro2/reel/e/189.webp | body cut at the side (head in frame) | yes | 0.22, 0.71 |
| reel-2026 | pro2/reel/e/191.webp | head/face cut at the side | yes | 0.18, 0.81 |
| reel-2026 | pro2/reel/e/192.webp | body cut at the side | yes | 0.17, 0.99 |
| reel-2026 | pro2/reel/e/195.webp | head/face cut at the side | yes | 0.15, 0.70 |
| reel-2026 | pro2/reel/e/196.webp | head/face cut at the side | yes | 0.40, 0.75 |
| reel-2026 | pro2/reel/e/197.webp | body cut at the side | yes | 0.10, 0.60 |
| reel-2026 | pro2/reel/e/198.webp | head/face cut at the side | yes | 0.20, 0.77 |
| reel-2026 | pro2/reel/e/199.webp | head/face cut at the side | yes | 0.30, 1.00 |
| reel-2026 | pro2/reel/e/200.webp | body cut at the side | yes | 0.37, 0.58 |
| cinematography-demo-reel-2025 | pro2/frames/01/00.webp | body cut at the side (head in frame) | yes | 0.37, 0.67 |
| cinematography-demo-reel-2025 | pro2/frames/01/01.webp | head/face cut at the side | yes | 0.12, 0.61 |
| cinematography-demo-reel-2025 | pro2/frames/01/02.webp | body cut at the side | yes | 0.16, 0.78 |
| cinematography-demo-reel-2025 | pro2/frames/01/03.webp | body cut at the side | yes | 0.34, 0.68 |
| cinematography-demo-reel-2025 | pro2/frames/01/05.webp | body cut at the side | yes | 0.53, 0.79 |
| cinematography-demo-reel-2025 | pro2/frames/01/09.webp | head/face cut at the side | yes | 0.06, 0.43 |
| cinematography-demo-reel-2025 | pro2/frames/01/10.webp | head/face cut at the side | yes | 0.46, 1.00 |
| cinematography-demo-reel-2025 | pro2/frames/01/11.webp | head/face cut at the side | yes | 0.17, 0.79 |
| cinematography-demo-reel-2025 | pro2/frames/01/13.webp | head/face cut at the side | yes | 0.14, 0.43 |
| cinematography-demo-reel-2025 | pro2/frames/01/16.webp | head/face cut at the side | yes | 0.20, 0.74 |
| cinematography-demo-reel-2025 | pro2/frames/01/19.webp | body cut at the side | yes | 0.27, 0.93 |
| cinematography-demo-reel-2025 | pro2/frames/01/21.webp | body cut at the side (head in frame) | yes | 0.29, 0.66 |
| cinematography-demo-reel-2025 | pro2/frames/01/23.webp | body cut at the side | yes | 0.42, 0.75 |
| cinematography-demo-reel-2025 | pro2/frames/01/24.webp | body cut at the side (head in frame) | yes | 0.34, 0.60 |
| cinematography-demo-reel-2025 | pro2/frames/01/25.webp | body cut at the side (head in frame) | yes | 0.45, 0.99 |
| cinematography-demo-reel-2025 | pro2/frames/01/26.webp | body cut at the side | yes | 0.04, 0.96 |
| cinematography-demo-reel-2025 | pro2/frames/01/27.webp | head/face cut at the side | yes | 0.40, 0.89 |
| cinematography-demo-reel-2025 | pro2/frames/01/29.webp | head/face cut at the side | yes | 0.03, 0.95 |
| cinematography-demo-reel-2025 | pro2/frames/01/30.webp | body cut at the side | yes | 0.21, 1.00 |
| cinematography-demo-reel-2025 | pro2/frames/01/38.webp | body cut at the side | yes | 0.44, 0.82 |
| cinematography-demo-reel-2025 | pro2/frames/01/39.webp | body cut at the side | yes | 0.28, 0.59 |
| cinematography-demo-reel-2025 | pro2/frames/01/46.webp | body cut at the side | yes | 0.56, 0.79 |
| cinematography-demo-reel-2025 | pro2/frames/01/49.webp | head/face cut at the side | yes | 0.07, 0.30 |
| cinematography-demo-reel-2025 | pro2/frames/01/51.webp | body cut at the side | yes | 0.01, 0.99 |
| cinematography-demo-reel-2025 | pro2/frames/01/52.webp | body cut at the side | yes | 0.22, 0.50 |
| cinematography-demo-reel-2025 | pro2/frames/01/55.webp | head/face cut at the side | yes | 0.07, 0.86 |
| cinematography-demo-reel-2025 | pro2/frames/01/56.webp | head/face cut at the side | yes | 0.26, 0.44 |
| cinematography-demo-reel-2025 | pro2/frames/01/62.webp | head/face cut at the side | yes | 0.04, 0.58 |
| cinematography-demo-reel-2025 | pro2/frames/01/64.webp | body cut at the side (head in frame) | yes | 0.11, 0.60 |
| cinematography-demo-reel-2025 | pro2/frames/01/67.webp | body cut at the side | yes | 0.32, 0.71 |
| cinematography-demo-reel-2025 | pro2/frames/01/68.webp | body cut at the side | yes | 0.58, 0.80 |
| cinematography-demo-reel-2025 | pro2/frames/01/70.webp | body cut at the side | yes | 0.34, 0.58 |
| one-with-the-devil | owtd/stills/01 | body cut at the side | yes | 0.02, 0.92 |
| one-with-the-devil | owtd/stills/03 | body cut at the side (head in frame) | yes | 0.51, 0.93 |
| one-with-the-devil | owtd/stills/04 | body cut at the side (head in frame) | yes | 0.16, 0.58 |
| one-with-the-devil | owtd/stills/05 | body cut at the side (head in frame) | yes | 0.50, 0.96 |
| one-with-the-devil | owtd/stills/06 | body cut at the side (head in frame) | yes | 0.17, 0.58 |
| one-with-the-devil | owtd/stills/07 | body cut at the side (head in frame) | yes | 0.00, 0.69 |
| one-with-the-devil | owtd/stills/12 | body cut at the side (head in frame) | yes | 0.07, 0.60 |
| stay-gold | pro2/frames/03/01.webp | head/face cut at the side | yes | 0.64, 0.86 |
| stay-gold | pro2/frames/03/05.webp | body cut at the side | yes | 0.23, 1.00 |
| stay-gold | pro2/frames/03/06.webp | body cut at the side | yes | 0.20, 0.52 |
| stay-gold | pro2/frames/03/07.webp | body cut at the side (head in frame) | yes | 0.34, 0.67 |
| stay-gold | pro2/frames/03/13.webp | head/face cut at the side | yes | 0.10, 0.62 |
| stay-gold | pro2/frames/03/15.webp | body cut at the side | yes | 0.19, 0.50 |
| stay-gold | pro2/frames/03/16.webp | body cut at the side | yes | 0.26, 0.98 |
| drift | pro2/frames/05/07.webp | body cut at the side | yes | 0.37, 0.48 |
| drift | pro2/frames/05/19.webp | head/face cut at the side | yes | 0.20, 0.61 |
| drift | pro2/frames/05/28.webp | body cut at the side | yes | 0.01, 0.49 |
| drift | pro2/frames/05/31.webp | head/face cut at the side | yes | 0.30, 0.50 |
| golden-moment-directors-cut | pro2/frames/06/04.webp | body cut at the side | yes | 0.00, 0.95 |
| golden-moment-directors-cut | pro2/frames/06/08.webp | body cut at the side | yes | 0.00, 0.50 |
| golden-moment-directors-cut | pro2/frames/06/09.webp | body cut at the side (head in frame) | yes | 0.36, 0.79 |
| golden-moment-directors-cut | pro2/frames/06/11.webp | body cut at the side (head in frame) | yes | 0.20, 0.81 |
| golden-moment-directors-cut | pro2/frames/06/12.webp | body cut at the side | yes | 0.03, 0.95 |
| golden-moment-directors-cut | pro2/frames/06/14.webp | body cut at the side | yes | 0.01, 0.59 |
| golden-moment-directors-cut | pro2/frames/06/16.webp | head/face cut at the side | yes | 0.17, 0.57 |
| golden-moment-directors-cut | pro2/frames/06/17.webp | head/face cut at the side | yes | 0.11, 0.52 |
| golden-moment-directors-cut | pro2/frames/06/18.webp | head/face cut at the side | yes | 0.20, 0.56 |
| golden-moment-directors-cut | pro2/frames/06/19.webp | head/face cut at the side | yes | 0.01, 0.43 |
| golden-moment-directors-cut | pro2/frames/06/21.webp | body cut at the side | yes | 0.38, 0.58 |
| golden-moment-directors-cut | pro2/frames/06/23.webp | head/face cut at the side | yes | 0.00, 1.00 |
| cover-with-love-isabelle | pro2/frames/07/00.webp | head/face cut at the side | yes | 0.20, 0.72 |
| cover-with-love-isabelle | pro2/frames/07/07.webp | head/face cut at the side | yes | 0.52, 0.98 |
| cover-with-love-isabelle | pro2/frames/07/08.webp | body cut at the side (head in frame) | yes | 0.24, 0.77 |
| cover-with-love-isabelle | pro2/frames/07/12.webp | body cut at the side | yes | 0.01, 0.97 |
| cover-with-love-isabelle | pro2/frames/07/13.webp | head/face cut at the side | yes | 0.00, 1.00 |
| cover-with-love-isabelle | pro2/frames/07/14.webp | head/face cut at the side | yes | 0.49, 0.70 |
| cover-with-love-isabelle | pro2/frames/07/16.webp | body cut at the side (head in frame) | yes | 0.20, 0.60 |
| cover-with-love-isabelle | pro2/frames/07/18.webp | head/face cut at the side | yes | 0.16, 0.73 |
| cover-with-love-isabelle | pro2/frames/07/19.webp | head/face cut at the side | yes | 0.07, 0.40 |
| no-place-like-home | pro2/frames/08/00.webp | head/face cut at the side | yes | 0.05, 0.96 |
| no-place-like-home | pro2/frames/08/01.webp | body cut at the side | yes | 0.00, 0.98 |
| no-place-like-home | pro2/frames/08/02.webp | head/face cut at the side | yes | 0.00, 1.00 |
| no-place-like-home | pro2/frames/08/03.webp | body cut at the side | yes | 0.23, 0.99 |
| the-smell-needs-to-go | pro2/frames/09/01.webp | head/face cut at the side | yes | 0.22, 0.76 |
| the-smell-needs-to-go | pro2/frames/09/03.webp | body cut at the side (head in frame) | yes | 0.01, 0.59 |
| the-smell-needs-to-go | pro2/frames/09/04.webp | head/face cut at the side | yes | 0.46, 0.90 |
| the-smell-needs-to-go | pro2/frames/09/09.webp | body cut at the side | yes | 0.23, 1.00 |
| the-smell-needs-to-go | pro2/frames/09/10.webp | head/face cut at the side | yes | 0.45, 0.80 |
| the-smell-needs-to-go | pro2/frames/09/11.webp | head/face cut at the side | yes | 0.55, 0.89 |
| the-smell-needs-to-go | pro2/frames/09/13.webp | head/face cut at the side | yes | 0.00, 0.58 |
| the-smell-needs-to-go | pro2/frames/09/14.webp | head/face cut at the side | yes | 0.26, 0.45 |
| the-smell-needs-to-go | pro2/frames/09/17.webp | body cut at the side | yes | 0.02, 0.80 |
| explorers | pro2/frames/11/02.webp | body cut at the side | yes | 0.40, 0.95 |
| explorers | pro2/frames/11/04.webp | body cut at the side | yes | 0.00, 0.50 |
| explorers | pro2/frames/11/05.webp | body cut at the side (head in frame) | yes | 0.29, 0.63 |
| explorers | pro2/frames/11/06.webp | head/face cut at the side | yes | 0.22, 0.50 |
| explorers | pro2/frames/11/08.webp | body cut at the side | yes | 0.14, 0.35 |
| explorers | pro2/frames/11/09.webp | body cut at the side | yes | 0.14, 0.80 |
| explorers | pro2/frames/11/12.webp | body cut at the side (head in frame) | yes | 0.49, 0.66 |
| explorers | pro2/frames/11/15.webp | head/face cut at the side | yes | 0.03, 0.60 |
| explorers | pro2/frames/11/17.webp | body cut at the side | yes | 0.00, 0.60 |
| explorers | pro2/frames/11/18.webp | body cut at the side | yes | 0.50, 0.79 |
| explorers | pro2/frames/11/19.webp | head/face cut at the side | yes | 0.07, 0.34 |
| explorers | pro2/frames/11/20.webp | body cut at the side | yes | 0.81, 0.98 |
| explorers | pro2/frames/11/21.webp | body cut at the side | yes | 0.27, 0.56 |
| sun-kissed | pro2/frames/12/00.webp | body cut at the side | yes | 0.00, 0.85 |
| sun-kissed | pro2/frames/12/01.webp | body cut at the side | yes | 0.01, 0.49 |
| sun-kissed | pro2/frames/12/04.webp | head/face cut at the side | yes | 0.09, 0.87 |
| sun-kissed | pro2/frames/12/06.webp | head/face cut at the side | yes | 0.52, 1.00 |
| sun-kissed | pro2/frames/12/07.webp | body cut at the side | yes | 0.18, 0.99 |
| sun-kissed | pro2/frames/12/12.webp | body cut at the side | yes | 0.01, 0.84 |
| sun-kissed | pro2/frames/12/16.webp | body cut at the side | yes | 0.63, 0.96 |
| sun-kissed | pro2/frames/12/17.webp | body cut at the side | yes | 0.01, 0.83 |
| sun-kissed | pro2/frames/12/19.webp | head/face cut at the side | yes | 0.04, 0.44 |
| sun-kissed | pro2/frames/12/21.webp | head/face cut at the side | yes | 0.00, 0.89 |
| sun-kissed | pro2/frames/12/25.webp | head/face cut at the side | yes | 0.38, 0.83 |
| sun-kissed | pro2/frames/12/26.webp | body cut at the side | yes | 0.20, 0.99 |
| sun-kissed | pro2/frames/12/27.webp | head/face cut at the side | yes | 0.18, 1.00 |
| sleepwalker | pro2/frames/13/03.webp | body cut at the side | yes | 0.04, 0.49 |
| sleepwalker | pro2/frames/13/09.webp | body cut at the side | yes | 0.45, 0.79 |
| sleepwalker | pro2/frames/13/12.webp | body cut at the side | yes | 0.17, 0.61 |
| sleepwalker | pro2/frames/13/13.webp | body cut at the side | yes | 0.20, 0.79 |
| sleepwalker | pro2/frames/13/14.webp | body cut at the side | yes | 0.19, 0.59 |
| sleepwalker | pro2/frames/13/16.webp | head/face cut at the side | yes | 0.32, 0.74 |
| sleepwalker | pro2/frames/13/19.webp | body cut at the side | yes | 0.21, 0.99 |
| sleepwalker | pro2/frames/13/20.webp | body cut at the side | yes | 0.37, 0.77 |
| sleepwalker | pro2/frames/13/24.webp | body cut at the side | yes | 0.17, 0.79 |
| sleepwalker | pro2/frames/13/28.webp | body cut at the side | yes | 0.31, 0.59 |
| sleepwalker | pro2/frames/13/29.webp | body cut at the side | yes | 0.41, 0.81 |
| sleepwalker | pro2/frames/13/31.webp | head/face cut at the side | yes | 0.18, 0.59 |
| sleepwalker | pro2/frames/13/32.webp | body cut at the side | yes | 0.12, 0.87 |
| repeat-feat-jessie-reyez | pro2/frames/16/05.webp | head/face cut at the side | yes | 0.37, 0.58 |
| repeat-feat-jessie-reyez | pro2/frames/16/06.webp | body cut at the side (head in frame) | yes | 0.30, 0.68 |
| repeat-feat-jessie-reyez | pro2/frames/16/07.webp | body cut at the side | yes | 0.47, 0.99 |
| repeat-feat-jessie-reyez | pro2/frames/16/08.webp | body cut at the side (head in frame) | yes | 0.36, 0.68 |
| repeat-feat-jessie-reyez | pro2/frames/16/09.webp | body cut at the side | yes | 0.28, 0.72 |
| repeat-feat-jessie-reyez | pro2/frames/16/10.webp | body cut at the side (head in frame) | yes | 0.28, 0.75 |
| repeat-feat-jessie-reyez | pro2/frames/16/18.webp | body cut at the side | yes | 0.52, 0.69 |
| repeat-feat-jessie-reyez | pro2/frames/16/20.webp | head/face cut at the side | yes | 0.02, 0.48 |
| repeat-feat-jessie-reyez | pro2/frames/16/21.webp | body cut at the side | yes | 0.48, 0.79 |
| repeat-feat-jessie-reyez | pro2/frames/16/22.webp | body cut at the side | yes | 0.12, 0.82 |
| repeat-feat-jessie-reyez | pro2/frames/16/23.webp | head/face cut at the side | yes | 0.23, 0.69 |
| repeat-feat-jessie-reyez | pro2/frames/16/25.webp | body cut at the side | yes | 0.02, 0.73 |
| repeat-feat-jessie-reyez | pro2/frames/16/28.webp | head/face cut at the side | yes | 0.21, 0.63 |
| repeat-feat-jessie-reyez | pro2/frames/16/29.webp | body cut at the side (head in frame) | yes | 0.29, 0.70 |
| repeat-feat-jessie-reyez | pro2/frames/16/34.webp | body cut at the side (head in frame) | yes | 0.36, 0.67 |
| repeat-feat-jessie-reyez | pro2/frames/16/36.webp | body cut at the side | yes | 0.00, 0.79 |
| flower-crown | pro2/frames/17/00.webp | head/face cut at the side | yes | 0.31, 0.78 |
| backward-fall | pro2/frames/18/01.webp | body cut at the side (head in frame) | yes | 0.26, 0.65 |
| backward-fall | pro2/frames/18/02.webp | head/face cut at the side | yes | 0.50, 0.97 |
| backward-fall | pro2/frames/18/07.webp | body cut at the side | yes | 0.01, 0.50 |
| backward-fall | pro2/frames/18/10.webp | head/face cut at the side | yes | 0.01, 0.41 |
| backward-fall | pro2/frames/18/13.webp | head/face cut at the side | yes | 0.09, 0.58 |
| backward-fall | pro2/frames/18/14.webp | head/face cut at the side | yes | 0.38, 0.97 |
| backward-fall | pro2/frames/18/15.webp | head/face cut at the side | yes | 0.22, 0.44 |
| backward-fall | pro2/frames/18/17.webp | body cut at the side | yes | 0.26, 0.84 |
| backward-fall | pro2/frames/18/18.webp | body cut at the side (head in frame) | yes | 0.20, 0.76 |
| backward-fall | pro2/frames/18/20.webp | head/face cut at the side | yes | 0.17, 0.80 |
| backward-fall | pro2/frames/18/21.webp | head/face cut at the side | yes | 0.26, 0.94 |
| backward-fall | pro2/frames/18/23.webp | head/face cut at the side | yes | 0.52, 0.82 |
| backward-fall | pro2/frames/18/24.webp | head/face cut at the side | yes | 0.12, 0.52 |
| backward-fall | pro2/frames/18/26.webp | body cut at the side | yes | 0.10, 0.42 |
| backward-fall | pro2/frames/18/27.webp | body cut at the side | yes | 0.01, 0.71 |
| backward-fall | pro2/frames/18/32.webp | head/face cut at the side | yes | 0.10, 0.80 |
| backward-fall | pro2/frames/18/33.webp | body cut at the side | yes | 0.01, 0.92 |
| backward-fall | pro2/frames/18/35.webp | body cut at the side | yes | 0.40, 0.97 |
| backward-fall | pro2/frames/18/37.webp | head/face cut at the side | yes | 0.23, 0.80 |
| backward-fall | pro2/frames/18/39.webp | head/face cut at the side | yes | 0.08, 0.34 |
| backward-fall | pro2/frames/18/40.webp | body cut at the side (head in frame) | yes | 0.32, 0.78 |
| backward-fall | pro2/frames/18/41.webp | body cut at the side | yes | 0.25, 0.63 |
| backward-fall | pro2/frames/18/45.webp | head/face cut at the side | yes | 0.00, 0.58 |
| backward-fall | pro2/frames/18/46.webp | head/face cut at the side | yes | 0.10, 0.47 |
| backward-fall | pro2/frames/18/50.webp | body cut at the side | yes | 0.53, 0.77 |
| backward-fall | pro2/frames/18/51.webp | head/face cut at the side | yes | 0.06, 0.56 |
| backward-fall | pro2/frames/18/52.webp | head/face cut at the side | yes | 0.48, 1.00 |
| backward-fall | pro2/frames/18/54.webp | body cut at the side | yes | 0.56, 0.87 |
| backward-fall | pro2/frames/18/57.webp | body cut at the side (head in frame) | yes | 0.26, 0.71 |
| backward-fall | pro2/frames/18/60.webp | body cut at the side | yes | 0.22, 0.39 |
| backward-fall | pro2/frames/18/61.webp | body cut at the side | yes | 0.00, 1.00 |
| backward-fall | pro2/frames/18/64.webp | body cut at the side | yes | 0.12, 0.38 |
| backward-fall | pro2/frames/18/66.webp | head/face cut at the side | yes | 0.05, 1.00 |
| backward-fall | pro2/frames/18/67.webp | body cut at the side | yes | 0.20, 0.99 |
| backward-fall | pro2/frames/18/69.webp | head/face cut at the side | yes | 0.14, 1.00 |
| backward-fall | pro2/frames/18/71.webp | head/face cut at the side | yes | 0.00, 0.76 |
| s18 | pro2/frames/19/01.webp | body cut at the side | yes | 0.59, 0.94 |
| s18 | pro2/frames/19/02.webp | body cut at the side | yes | 0.09, 0.81 |
| s18 | pro2/frames/19/05.webp | body cut at the side | yes | 0.08, 0.91 |
| s18 | pro2/frames/19/07.webp | body cut at the side | yes | 0.09, 0.58 |
| s18 | pro2/frames/19/08.webp | body cut at the side | yes | 0.57, 0.73 |
| s18 | pro2/frames/19/09.webp | body cut at the side | yes | 0.42, 0.99 |
| s18 | pro2/frames/19/11.webp | body cut at the side | yes | 0.51, 0.97 |
| back-to-the-start | pro2/frames/20/01.webp | body cut at the side | yes | 0.40, 0.95 |
| back-to-the-start | pro2/frames/20/05.webp | body cut at the side | yes | 0.40, 0.64 |
| back-to-the-start | pro2/frames/20/08.webp | body cut at the side | yes | 0.10, 0.76 |
| back-to-the-start | pro2/frames/20/11.webp | body cut at the side (head in frame) | yes | 0.40, 0.60 |
| back-to-the-start | pro2/frames/20/22.webp | body cut at the side | yes | 0.55, 0.99 |
| back-to-the-start | pro2/frames/20/26.webp | body cut at the side | yes | 0.35, 0.65 |
| back-to-the-start | pro2/frames/20/27.webp | body cut at the side | yes | 0.47, 0.78 |
| back-to-the-start | pro2/frames/20/29.webp | body cut at the side | yes | 0.20, 0.73 |
| back-to-the-start | pro2/frames/20/30.webp | body cut at the side | yes | 0.07, 0.58 |
| back-to-the-start | pro2/frames/20/32.webp | head/face cut at the side | yes | 0.51, 0.80 |
| back-to-the-start | pro2/frames/20/33.webp | head/face cut at the side | yes | 0.20, 0.54 |
| back-to-the-start | pro2/frames/20/34.webp | head/face cut at the side | yes | 0.06, 0.49 |
| back-to-the-start | pro2/frames/20/40.webp | head/face cut at the side | yes | 0.33, 0.83 |
| back-to-the-start | pro2/frames/20/47.webp | head/face cut at the side | yes | 0.36, 0.97 |
| back-to-the-start | pro2/frames/20/48.webp | head/face cut at the side | yes | 0.50, 0.97 |
| back-to-the-start | pro2/frames/20/58.webp | body cut at the side (head in frame) | yes | 0.45, 0.79 |
| back-to-the-start | pro2/frames/20/61.webp | body cut at the side | yes | 0.03, 0.98 |
| back-to-the-start | pro2/frames/20/65.webp | body cut at the side (head in frame) | yes | 0.40, 0.72 |
| lets-grow-good-together | pro2/frames/21/01.webp | body cut at the side | yes | 0.14, 0.43 |
| lets-grow-good-together | pro2/frames/21/03.webp | body cut at the side | yes | 0.11, 0.58 |
| lets-grow-good-together | pro2/frames/21/04.webp | body cut at the side | yes | 0.23, 0.83 |
| lets-grow-good-together | pro2/frames/21/06.webp | body cut at the side | yes | 0.04, 0.91 |
| lets-grow-good-together | pro2/frames/21/07.webp | body cut at the side | yes | 0.02, 0.86 |
| lets-grow-good-together | pro2/frames/21/08.webp | body cut at the side | yes | 0.02, 0.98 |
| lets-grow-good-together | pro2/frames/21/16.webp | body cut at the side | yes | 0.00, 0.98 |
| lets-grow-good-together | pro2/frames/21/17.webp | body cut at the side | yes | 0.00, 1.00 |
| lets-grow-good-together | pro2/frames/21/18.webp | body cut at the side | yes | 0.22, 0.54 |
| lets-grow-good-together | pro2/frames/21/19.webp | head/face cut at the side | yes | 0.49, 0.73 |
| lets-grow-good-together | pro2/frames/21/20.webp | body cut at the side (head in frame) | yes | 0.48, 0.70 |
| lets-grow-good-together | pro2/frames/21/22.webp | body cut at the side | yes | 0.01, 0.99 |
| lets-grow-good-together | pro2/frames/21/28.webp | head/face cut at the side | yes | 0.05, 0.59 |
| lets-grow-good-together | pro2/frames/21/29.webp | body cut at the side | yes | 0.13, 0.91 |
| lets-grow-good-together | pro2/frames/21/31.webp | head/face cut at the side | yes | 0.40, 1.00 |
| lets-grow-good-together | pro2/frames/21/32.webp | body cut at the side | yes | 0.29, 0.70 |
| lets-grow-good-together | pro2/frames/21/33.webp | body cut at the side | yes | 0.32, 0.38 |
| lets-grow-good-together | pro2/frames/21/38.webp | body cut at the side | yes | 0.00, 0.45 |
| lets-grow-good-together | pro2/frames/21/40.webp | body cut at the side | yes | 0.00, 0.96 |
| lets-grow-good-together | pro2/frames/21/41.webp | head/face cut at the side | yes | 0.07, 0.60 |
| lets-grow-good-together | pro2/frames/21/42.webp | body cut at the side | yes | 0.01, 0.59 |
| lets-grow-good-together | pro2/frames/21/43.webp | body cut at the side | yes | 0.21, 0.75 |
| lets-grow-good-together | pro2/frames/21/44.webp | head/face cut at the side | yes | 0.18, 0.46 |
| lets-grow-good-together | pro2/frames/21/50.webp | body cut at the side | yes | 0.21, 0.59 |
| lets-grow-good-together | pro2/frames/21/51.webp | body cut at the side | yes | 0.20, 0.59 |
| lets-grow-good-together | pro2/frames/21/52.webp | body cut at the side | yes | 0.03, 0.96 |
| lets-grow-good-together | pro2/frames/21/53.webp | head/face cut at the side | yes | 0.40, 0.90 |
| lets-grow-good-together | pro2/frames/21/58.webp | head/face cut at the side | yes | 0.26, 0.73 |
| lets-grow-good-together | pro2/frames/21/59.webp | body cut at the side | yes | 0.55, 0.83 |
| lets-grow-good-together | pro2/frames/21/64.webp | body cut at the side (head in frame) | yes | 0.31, 0.85 |
| lets-grow-good-together | pro2/frames/21/65.webp | body cut at the side | yes | 0.00, 0.99 |
| lets-grow-good-together | pro2/frames/21/66.webp | body cut at the side (head in frame) | yes | 0.37, 0.65 |
| lets-grow-good-together | pro2/frames/21/68.webp | body cut at the side (head in frame) | yes | 0.32, 0.65 |
| lets-grow-good-together | pro2/frames/21/70.webp | body cut at the side (head in frame) | yes | 0.32, 0.67 |
| lets-grow-good-together | pro2/frames/21/71.webp | body cut at the side | yes | 0.23, 0.71 |
| weird-kid | pro2/frames/22/01.webp | body cut at the side | yes | 0.14, 0.98 |
| weird-kid | pro2/frames/22/03.webp | body cut at the side (head in frame) | yes | 0.42, 0.82 |
| weird-kid | pro2/frames/22/04.webp | body cut at the side | yes | 0.36, 0.82 |
| weird-kid | pro2/frames/22/10.webp | head/face cut at the side | yes | 0.20, 0.55 |
| weird-kid | pro2/frames/22/12.webp | body cut at the side (head in frame) | yes | 0.17, 0.74 |
| weird-kid | pro2/frames/22/13.webp | body cut at the side (head in frame) | yes | 0.35, 0.66 |
| weird-kid | pro2/frames/22/15.webp | head/face cut at the side | yes | 0.40, 0.94 |
| weird-kid | pro2/frames/22/18.webp | body cut at the side (head in frame) | yes | 0.26, 0.54 |
| weird-kid | pro2/frames/22/23.webp | body cut at the side | yes | 0.45, 0.70 |
| weird-kid | pro2/frames/22/37.webp | body cut at the side (head in frame) | yes | 0.34, 0.74 |
| weird-kid | pro2/frames/22/41.webp | body cut at the side | yes | 0.28, 0.59 |
| weird-kid | pro2/frames/22/43.webp | body cut at the side | yes | 0.58, 0.89 |
| weird-kid | pro2/frames/22/48.webp | body cut at the side | yes | 0.52, 0.65 |
| weird-kid | pro2/frames/22/51.webp | body cut at the side (head in frame) | yes | 0.44, 0.80 |
| weird-kid | pro2/frames/22/52.webp | head/face cut at the side | yes | 0.47, 0.96 |
| weird-kid | pro2/frames/22/53.webp | body cut at the side | yes | 0.40, 0.77 |
| weird-kid | pro2/frames/22/59.webp | body cut at the side | yes | 0.05, 0.58 |
| weird-kid | pro2/frames/22/62.webp | body cut at the side | yes | 0.29, 0.54 |
| weird-kid | pro2/frames/22/64.webp | body cut at the side | yes | 0.24, 0.86 |
| weird-kid | pro2/frames/22/68.webp | body cut at the side | yes | 0.00, 0.41 |
| weird-kid | pro2/reel/a/019.webp | head/face cut at the side | yes | 0.50, 0.75 |
| weird-kid | pro2/reel/c/090.webp | body cut at the side | yes | 0.36, 0.69 |
| veronas-obsession | pro2/frames/23/05.webp | head/face cut at the side | yes | 0.46, 0.88 |
| veronas-obsession | pro2/frames/23/08.webp | body cut at the side | yes | 0.03, 0.98 |
| veronas-obsession | pro2/frames/23/12.webp | body cut at the side | yes | 0.01, 0.54 |
| veronas-obsession | pro2/frames/23/15.webp | body cut at the side (head in frame) | yes | 0.24, 0.68 |
| veronas-obsession | pro2/frames/23/16.webp | body cut at the side | yes | 0.30, 0.73 |
| veronas-obsession | pro2/frames/23/17.webp | head/face cut at the side | yes | 0.22, 0.91 |
| veronas-obsession | pro2/frames/23/18.webp | body cut at the side | yes | 0.36, 0.65 |
| veronas-obsession | pro2/frames/23/20.webp | body cut at the side | yes | 0.16, 0.95 |
| veronas-obsession | pro2/frames/23/26.webp | body cut at the side | yes | 0.04, 0.79 |
| veronas-obsession | pro2/frames/23/29.webp | head/face cut at the side | yes | 0.21, 0.57 |
| veronas-obsession | pro2/frames/23/35.webp | body cut at the side | yes | 0.41, 1.00 |
| veronas-obsession | pro2/frames/23/38.webp | head/face cut at the side | yes | 0.24, 1.00 |
| veronas-obsession | pro2/frames/23/43.webp | head/face cut at the side | yes | 0.38, 0.87 |
| veronas-obsession | pro2/frames/23/44.webp | head/face cut at the side | yes | 0.37, 0.91 |
| veronas-obsession | pro2/frames/23/50.webp | head/face cut at the side | yes | 0.35, 0.81 |
| veronas-obsession | pro2/frames/23/51.webp | head/face cut at the side | yes | 0.28, 0.73 |
| veronas-obsession | pro2/frames/23/53.webp | body cut at the side | yes | 0.49, 1.00 |
| veronas-obsession | pro2/frames/23/54.webp | head/face cut at the side | yes | 0.51, 0.99 |
| veronas-obsession | pro2/frames/23/59.webp | body cut at the side | yes | 0.00, 0.98 |
| obedience-gets-you-nowhere | pro2/frames/24/02.webp | head/face cut at the side | yes | 0.50, 0.99 |
| obedience-gets-you-nowhere | pro2/frames/24/07.webp | body cut at the side | yes | 0.00, 1.00 |
| obedience-gets-you-nowhere | pro2/frames/24/10.webp | head/face cut at the side | yes | 0.01, 0.59 |
| obedience-gets-you-nowhere | pro2/frames/24/15.webp | body cut at the side | yes | 0.00, 0.55 |
| obedience-gets-you-nowhere | pro2/frames/24/16.webp | head/face cut at the side | yes | 0.01, 0.44 |
| obedience-gets-you-nowhere | pro2/frames/24/20.webp | body cut at the side | yes | 0.20, 0.61 |
| obedience-gets-you-nowhere | pro2/frames/24/21.webp | body cut at the side | yes | 0.00, 0.42 |
| obedience-gets-you-nowhere | pro2/frames/24/23.webp | head/face cut at the side | yes | 0.11, 0.92 |
| fire | pro2/frames/25/00.webp | body cut at the side | yes | 0.02, 0.96 |
| fire | pro2/frames/25/01.webp | body cut at the side | yes | 0.01, 0.73 |
| fire | pro2/frames/25/02.webp | body cut at the side | yes | 0.18, 0.60 |
| fire | pro2/frames/25/04.webp | body cut at the side (head in frame) | yes | 0.17, 0.59 |
| modern-man | pro2/frames/26/00.webp | body cut at the side (head in frame) | yes | 0.27, 0.74 |
| modern-man | pro2/frames/26/01.webp | head/face cut at the side | yes | 0.11, 0.60 |
| modern-man | pro2/frames/26/03.webp | body cut at the side | yes | 0.52, 0.78 |
| modern-man | pro2/frames/26/06.webp | body cut at the side | yes | 0.20, 0.80 |
| modern-man | pro2/frames/26/07.webp | body cut at the side | yes | 0.11, 0.95 |
| modern-man | pro2/frames/26/11.webp | head/face cut at the side | yes | 0.07, 0.31 |
| modern-man | pro2/frames/26/12.webp | body cut at the side | yes | 0.20, 0.80 |
| modern-man | pro2/frames/26/13.webp | head/face cut at the side | yes | 0.50, 0.75 |
| modern-man | pro2/frames/26/14.webp | head/face cut at the side | yes | 0.52, 0.99 |
| modern-man | pro2/frames/26/18.webp | body cut at the side | yes | 0.01, 0.97 |
| modern-man | pro2/frames/26/19.webp | body cut at the side | yes | 0.01, 0.97 |
| modern-man | pro2/frames/26/21.webp | body cut at the side | yes | 0.01, 0.48 |
| modern-man | pro2/frames/26/22.webp | body cut at the side | yes | 0.01, 0.41 |
| modern-man | pro2/frames/26/23.webp | head/face cut at the side | yes | 0.05, 0.58 |
| modern-man | pro2/frames/26/24.webp | head/face cut at the side | yes | 0.00, 0.48 |
| modern-man | pro2/frames/26/25.webp | body cut at the side | yes | 0.26, 0.84 |
| modern-man | pro2/frames/26/27.webp | head/face cut at the side | yes | 0.36, 0.85 |
| modern-man | pro2/frames/26/28.webp | body cut at the side | yes | 0.56, 0.81 |
| modern-man | pro2/frames/26/29.webp | body cut at the side | yes | 0.58, 0.84 |
| modern-man | pro2/frames/26/30.webp | head/face cut at the side | yes | 0.46, 1.00 |
| modern-man | pro2/frames/26/31.webp | head/face cut at the side | yes | 0.56, 0.82 |
| modern-man | pro2/frames/26/32.webp | head/face cut at the side | yes | 0.20, 0.78 |
| modern-man | pro2/frames/26/35.webp | body cut at the side | yes | 0.30, 0.71 |
| modern-man | pro2/frames/26/40.webp | head/face cut at the side | yes | 0.73, 1.00 |
| modern-man | pro2/frames/26/42.webp | body cut at the side | yes | 0.50, 0.89 |
| modern-man | pro2/frames/26/43.webp | body cut at the side | yes | 0.00, 0.99 |
| modern-man | pro2/frames/26/44.webp | body cut at the side | yes | 0.03, 0.96 |
| modern-man | pro2/frames/26/45.webp | head/face cut at the side | yes | 0.19, 0.68 |
| modern-man | pro2/frames/26/46.webp | head/face cut at the side | yes | 0.00, 0.60 |
| phantoms-and-friends | pro2/frames/27/00.webp | body cut at the side | yes | 0.01, 0.99 |
| phantoms-and-friends | pro2/frames/27/02.webp | head/face cut at the side | yes | 0.69, 1.00 |
| phantoms-and-friends | pro2/frames/27/05.webp | head/face cut at the side | yes | 0.61, 0.97 |
| phantoms-and-friends | pro2/frames/27/07.webp | body cut at the side | yes | 0.14, 0.22 |
| phantoms-and-friends | pro2/frames/27/12.webp | body cut at the side | yes | 0.23, 0.30 |
| phantoms-and-friends | pro2/frames/27/15.webp | body cut at the side | yes | 0.34, 0.48 |
| phantoms-and-friends | pro2/frames/27/19.webp | body cut at the side | yes | 0.20, 0.49 |
| phantoms-and-friends | pro2/frames/27/21.webp | body cut at the side | yes | 0.37, 0.78 |
| phantoms-and-friends | pro2/frames/27/25.webp | body cut at the side | yes | 0.29, 0.80 |
| phantoms-and-friends | pro2/frames/27/27.webp | head/face cut at the side | yes | 0.51, 0.97 |
| phantoms-and-friends | pro2/frames/27/30.webp | body cut at the side | yes | 0.12, 0.52 |
| phantoms-and-friends | pro2/frames/27/34.webp | head/face cut at the side | yes | 0.21, 0.80 |
| phantoms-and-friends | pro2/frames/27/36.webp | head/face cut at the side | yes | 0.27, 0.75 |
| phantoms-and-friends | pro2/frames/27/40.webp | body cut at the side | yes | 0.01, 0.73 |
| phantoms-and-friends | pro2/frames/27/41.webp | body cut at the side | yes | 0.13, 0.50 |
| phantoms-and-friends | pro2/frames/27/42.webp | body cut at the side | yes | 0.29, 0.50 |
| phantoms-and-friends | pro2/frames/27/46.webp | head/face cut at the side | yes | 0.56, 0.99 |
| phantoms-and-friends | pro2/frames/27/47.webp | body cut at the side | yes | 0.41, 0.74 |
| phantoms-and-friends | pro2/frames/27/48.webp | body cut at the side (head in frame) | yes | 0.31, 0.63 |
| phantoms-and-friends | pro2/frames/27/50.webp | body cut at the side | yes | 0.69, 0.84 |
| summer-is-here | pro2/frames/28/00.webp | body cut at the side | yes | 0.29, 0.60 |
| summer-is-here | pro2/frames/28/01.webp | body cut at the side | yes | 0.41, 0.99 |
| summer-is-here | pro2/frames/28/02.webp | head/face cut at the side | yes | 0.52, 0.99 |
| summer-is-here | pro2/frames/28/05.webp | body cut at the side | yes | 0.40, 0.97 |
| summer-is-here | pro2/frames/28/06.webp | body cut at the side | yes | 0.43, 0.99 |
| summer-is-here | pro2/frames/28/08.webp | head/face cut at the side | yes | 0.14, 0.82 |
| summer-is-here | pro2/frames/28/09.webp | head/face cut at the side | yes | 0.00, 0.68 |
| summer-is-here | pro2/frames/28/10.webp | body cut at the side (head in frame) | yes | 0.36, 0.98 |
| summer-is-here | pro2/frames/28/11.webp | body cut at the side (head in frame) | yes | 0.29, 0.78 |
| summer-is-here | pro2/frames/28/12.webp | body cut at the side | yes | 0.28, 0.99 |
| summer-is-here | pro2/frames/28/13.webp | body cut at the side | yes | 0.43, 1.00 |
| summer-is-here | pro2/frames/28/14.webp | body cut at the side | yes | 0.01, 0.59 |
| summer-is-here | pro2/frames/28/19.webp | head/face cut at the side | yes | 0.24, 0.57 |
| summer-is-here | pro2/frames/28/20.webp | body cut at the side | yes | 0.05, 0.41 |
| summer-is-here | pro2/frames/28/23.webp | body cut at the side | yes | 0.00, 0.91 |
| summer-is-here | pro2/frames/28/24.webp | body cut at the side | yes | 0.04, 0.99 |
| summer-is-here | pro2/frames/28/26.webp | body cut at the side (head in frame) | yes | 0.44, 0.83 |
| eat-well | pro2/frames/29/12.webp | body cut at the side | yes | 0.00, 0.60 |
| buddy-time-grandpas-story | pro2/frames/30/00.webp | head/face cut at the side | yes | 0.50, 0.87 |
| buddy-time-grandpas-story | pro2/frames/30/04.webp | body cut at the side (head in frame) | yes | 0.32, 0.61 |
| buddy-time-grandpas-story | pro2/frames/30/05.webp | head/face cut at the side | yes | 0.40, 0.96 |
| buddy-time-grandpas-story | pro2/frames/30/06.webp | body cut at the side (head in frame) | yes | 0.41, 0.69 |
| buddy-time-grandpas-story | pro2/frames/30/09.webp | head/face cut at the side | yes | 0.15, 0.74 |
| buddy-time-grandpas-story | pro2/frames/30/10.webp | body cut at the side | yes | 0.13, 0.59 |
| buddy-time-grandpas-story | pro2/frames/30/11.webp | head/face cut at the side | yes | 0.00, 1.00 |
| canoe | pro2/frames/32/03.webp | body cut at the side | yes | 0.00, 0.98 |
| mandie | pro2/frames/33/02.webp | body cut at the side | yes | 0.01, 0.77 |
| mandie | pro2/frames/33/04.webp | head/face cut at the side | yes | 0.07, 0.90 |
| mandie | pro2/frames/33/05.webp | body cut at the side | yes | 0.23, 0.53 |
| mandie | pro2/frames/33/07.webp | body cut at the side | yes | 0.29, 0.58 |
| mandie | pro2/frames/33/08.webp | head/face cut at the side | yes | 0.00, 0.96 |
| mandie | pro2/frames/33/09.webp | head/face cut at the side | yes | 0.00, 0.49 |
| mandie | pro2/frames/33/10.webp | head/face cut at the side | yes | 0.29, 0.86 |
| mandie | pro2/frames/33/11.webp | head/face cut at the side | yes | 0.23, 0.49 |
| mandie | pro2/frames/33/12.webp | head/face cut at the side | yes | 0.00, 1.00 |
| mandie | pro2/frames/33/13.webp | head/face cut at the side | yes | 0.00, 0.50 |
| mandie | pro2/frames/33/14.webp | body cut at the side (head in frame) | yes | 0.06, 0.68 |
| mandie | pro2/frames/33/15.webp | body cut at the side | yes | 0.20, 0.99 |
| mandie | pro2/frames/33/16.webp | head/face cut at the side | yes | 0.18, 0.87 |
| mandie | pro2/frames/33/17.webp | body cut at the side | yes | 0.16, 0.85 |
| mandie | pro2/frames/33/18.webp | body cut at the side | yes | 0.34, 0.43 |
| mandie | pro2/frames/33/19.webp | head/face cut at the side | yes | 0.16, 0.47 |
| mandie | pro2/frames/33/22.webp | head/face cut at the side | yes | 0.12, 0.60 |
| mandie | pro2/frames/33/23.webp | body cut at the side | yes | 0.20, 0.78 |
| mandie | pro2/frames/33/24.webp | head/face cut at the side | yes | 0.23, 0.43 |
| mandie | pro2/frames/33/25.webp | body cut at the side | yes | 0.51, 0.80 |
| mandie | pro2/frames/33/27.webp | body cut at the side | yes | 0.08, 0.59 |
| mandie | pro2/frames/33/29.webp | head/face cut at the side | yes | 0.40, 0.80 |
| mandie | pro2/frames/33/31.webp | head/face cut at the side | yes | 0.44, 0.99 |
| mandie | pro2/frames/33/32.webp | head/face cut at the side | yes | 0.46, 0.87 |
| mandie | pro2/frames/33/37.webp | head/face cut at the side | yes | 0.17, 0.37 |
| mandie | pro2/frames/33/38.webp | head/face cut at the side | yes | 0.23, 0.78 |
| mandie | pro2/frames/33/39.webp | head/face cut at the side | yes | 0.51, 0.99 |
| mandie | pro2/frames/33/40.webp | head/face cut at the side | yes | 0.50, 0.98 |
| mandie | pro2/frames/33/41.webp | body cut at the side | yes | 0.00, 0.58 |
| mandie | pro2/frames/33/42.webp | head/face cut at the side | yes | 0.04, 0.47 |
| mandie | pro2/frames/33/43.webp | body cut at the side | yes | 0.00, 0.98 |
| mandie | pro2/frames/33/44.webp | head/face cut at the side | yes | 0.20, 0.81 |
| mandie | pro2/frames/33/45.webp | head/face cut at the side | yes | 0.42, 0.96 |
| mandie | pro2/frames/33/47.webp | head/face cut at the side | yes | 0.00, 1.00 |
| mandie | pro2/frames/33/49.webp | body cut at the side | yes | 0.57, 0.85 |
| mandie | pro2/frames/33/50.webp | head/face cut at the side | yes | 0.54, 0.93 |
| mandie | pro2/frames/33/51.webp | head/face cut at the side | yes | 0.53, 0.87 |
| mandie | pro2/frames/33/52.webp | head/face cut at the side | yes | 0.07, 1.00 |
| mandie | pro2/frames/33/54.webp | body cut at the side | yes | 0.30, 0.62 |
| mandie | pro2/frames/33/55.webp | body cut at the side | yes | 0.38, 0.74 |
| mandie | pro2/frames/33/56.webp | head/face cut at the side | yes | 0.23, 0.71 |
| mandie | pro2/frames/33/57.webp | head/face cut at the side | yes | 0.06, 0.49 |
| mandie | pro2/frames/33/58.webp | head/face cut at the side | yes | 0.06, 0.37 |
| mandie | pro2/frames/33/61.webp | head/face cut at the side | yes | 0.03, 1.00 |
| mandie | pro2/frames/33/62.webp | head/face cut at the side | yes | 0.27, 0.96 |
| mandie | pro2/frames/33/64.webp | body cut at the side (head in frame) | yes | 0.18, 0.78 |
| mandie | pro2/frames/33/65.webp | body cut at the side | yes | 0.04, 0.24 |
| mandie | pro2/frames/33/66.webp | head/face cut at the side | yes | 0.10, 0.98 |
| mandie | pro2/frames/33/67.webp | head/face cut at the side | yes | 0.21, 0.87 |
| mandie | pro2/frames/33/68.webp | body cut at the side | yes | 0.24, 0.81 |
| mandie | pro2/frames/33/69.webp | head/face cut at the side | yes | 0.30, 0.80 |
| mandie | pro2/frames/33/71.webp | head/face cut at the side | yes | 0.01, 0.59 |
| just-the-beginning | pro2/frames/34/01.webp | body cut at the side | yes | 0.27, 0.81 |
| just-the-beginning | pro2/frames/34/04.webp | body cut at the side | yes | 0.01, 0.96 |
| just-the-beginning | pro2/frames/34/05.webp | body cut at the side | yes | 0.11, 0.99 |
| just-the-beginning | pro2/frames/34/07.webp | head/face cut at the side | yes | 0.50, 0.83 |
| just-the-beginning | pro2/frames/34/08.webp | body cut at the side (head in frame) | yes | 0.36, 0.95 |
| just-the-beginning | pro2/frames/34/10.webp | body cut at the side | yes | 0.21, 0.80 |
| just-the-beginning | pro2/frames/34/11.webp | body cut at the side | yes | 0.04, 0.33 |
| just-the-beginning | pro2/frames/34/12.webp | body cut at the side | yes | 0.34, 0.70 |
| just-the-beginning | pro2/frames/34/15.webp | body cut at the side (head in frame) | yes | 0.30, 0.70 |
| just-the-beginning | pro2/frames/34/17.webp | body cut at the side (head in frame) | yes | 0.32, 0.64 |
| just-the-beginning | pro2/frames/34/18.webp | head/face cut at the side | yes | 0.03, 0.59 |
| just-the-beginning | pro2/frames/34/21.webp | body cut at the side | yes | 0.12, 0.86 |
| just-the-beginning | pro2/frames/34/23.webp | body cut at the side | yes | 0.28, 0.70 |
| just-the-beginning | pro2/frames/34/26.webp | body cut at the side | yes | 0.15, 0.78 |
| just-the-beginning | pro2/frames/34/31.webp | head/face cut at the side | yes | 0.10, 0.74 |
| just-the-beginning | pro2/frames/34/33.webp | head/face cut at the side | yes | 0.00, 1.00 |
| just-the-beginning | pro2/frames/34/34.webp | body cut at the side | yes | 0.24, 0.49 |
| ltl-dstryr | pro2/frames/35/09.webp | head/face cut at the side | yes | 0.36, 0.76 |
| ltl-dstryr | pro2/frames/35/16.webp | head/face cut at the side | yes | 0.22, 0.46 |
| ltl-dstryr | pro2/frames/35/20.webp | head/face cut at the side | yes | 0.18, 0.76 |
| ltl-dstryr | pro2/frames/35/22.webp | head/face cut at the side | yes | 0.29, 0.81 |
| ltl-dstryr | pro2/frames/35/23.webp | head/face cut at the side | yes | 0.31, 0.84 |
| ltl-dstryr | pro2/frames/35/25.webp | head/face cut at the side | yes | 0.20, 0.65 |
| ltl-dstryr | pro2/frames/35/26.webp | head/face cut at the side | yes | 0.36, 0.76 |
| ltl-dstryr | pro2/frames/35/28.webp | head/face cut at the side | yes | 0.20, 0.57 |
| ltl-dstryr | pro2/frames/35/31.webp | body cut at the side | yes | 0.04, 1.00 |
| ltl-dstryr | pro2/frames/35/32.webp | head/face cut at the side | yes | 0.11, 0.55 |
| ltl-dstryr | pro2/frames/35/36.webp | head/face cut at the side | yes | 0.08, 0.52 |
| ltl-dstryr | pro2/frames/35/38.webp | head/face cut at the side | yes | 0.45, 0.84 |
| ltl-dstryr | pro2/frames/35/42.webp | body cut at the side (head in frame) | yes | 0.31, 0.67 |
| ltl-dstryr | pro2/frames/35/47.webp | head/face cut at the side | yes | 0.01, 0.60 |
| ltl-dstryr | pro2/frames/35/48.webp | head/face cut at the side | yes | 0.05, 0.47 |
| ltl-dstryr | pro2/frames/35/52.webp | head/face cut at the side | yes | 0.51, 0.84 |
| ltl-dstryr | pro2/frames/35/53.webp | head/face cut at the side | yes | 0.04, 1.00 |
| ltl-dstryr | pro2/frames/35/54.webp | head/face cut at the side | yes | 0.36, 0.98 |
| ltl-dstryr | pro2/frames/35/56.webp | head/face cut at the side | yes | 0.03, 1.00 |
| ltl-dstryr | pro2/frames/35/57.webp | head/face cut at the side | yes | 0.00, 0.59 |
| ltl-dstryr | pro2/frames/35/58.webp | head/face cut at the side | yes | 0.11, 1.00 |
| ltl-dstryr | pro2/frames/35/59.webp | head/face cut at the side | yes | 0.19, 0.60 |
| ltl-dstryr | pro2/frames/35/61.webp | head/face cut at the side | yes | 0.40, 0.99 |
| ltl-dstryr | pro2/frames/35/63.webp | head/face cut at the side | yes | 0.36, 1.00 |
| ltl-dstryr | pro2/frames/35/67.webp | head/face cut at the side | yes | 0.53, 0.80 |
| ltl-dstryr | pro2/frames/35/68.webp | head/face cut at the side | yes | 0.05, 1.00 |
| ltl-dstryr | pro2/frames/35/69.webp | body cut at the side | yes | 0.85, 0.99 |
| ltl-dstryr | pro2/frames/35/71.webp | head/face cut at the side | yes | 0.32, 0.85 |
| journeys-x-todd | pro2/frames/36/01.webp | body cut at the side | yes | 0.41, 0.80 |
| journeys-x-todd | pro2/frames/36/16.webp | body cut at the side | yes | 0.66, 0.99 |
| journeys-x-todd | pro2/frames/36/17.webp | head/face cut at the side | yes | 0.01, 0.54 |
| journeys-x-todd | pro2/frames/36/18.webp | head/face cut at the side | yes | 0.00, 0.58 |
| journeys-x-todd | pro2/frames/36/19.webp | body cut at the side (head in frame) | yes | 0.01, 0.59 |
| journeys-x-todd | pro2/frames/36/31.webp | head/face cut at the side | yes | 0.51, 0.97 |
| journeys-x-todd | pro2/frames/36/35.webp | head/face cut at the side | yes | 0.00, 0.96 |
| journeys-x-todd | pro2/frames/36/38.webp | head/face cut at the side | yes | 0.51, 1.00 |
