#!/usr/bin/env python3
"""Generate u1/data.json and the static pages from the pro2 lists, copy.js, and r3 slugs.

One file is the source. Pages work with JavaScript off. Media the sky uses
lives under u2/media so a page does not depend on github.io.
"""
import html
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = Path("/tmp/src/gilljames")
W7 = (SRC / "site-v3-pro3/w7/index.html").read_text(encoding="utf-8")
PRO2 = "https://jamesgillmedia.github.io/gilljames/site-v3-pro2/"
SITE = "https://jamesgillmedia.github.io/gilljames/"
EMAIL = "imjamesgill@gmail.com"

FILM_SLUG = {
    "reel": "demo-reel", "w0": "reel-2026", "w1": "cinematography-demo-reel-2025",
    "w2": "celebraciones", "w3": "stay-gold", "w4": "legends", "w5": "drift",
    "w6": "golden-moment-directors-cut", "w7": "cover-with-love-isabelle",
    "w8": "no-place-like-home", "w9": "the-smell-needs-to-go", "w10": "brew-bar-coffee-teaser",
    "w11": "explorers", "w12": "sun-kissed", "w13": "sleepwalker", "w15": "reel-24",
    "w16": "repeat-feat-jessie-reyez", "w17": "flower-crown", "w18": "backward-fall",
    "w19": "s18", "w20": "back-to-the-start", "w21": "lets-grow-good-together",
    "w22": "weird-kid", "w23": "veronas-obsession", "w24": "obedience-gets-you-nowhere",
    "w25": "fire", "w26": "modern-man", "w27": "phantoms-and-friends", "w28": "summer-is-here",
    "w29": "eat-well", "w30": "buddy-time-grandpas-story", "w31": "hike", "w32": "canoe",
    "w33": "mandie", "w34": "just-the-beginning", "w35": "ltl-dstryr", "w36": "journeys-x-todd",
}
ROLES = {
    "weird-kid": "Director · Director of Photography",
    "sleepwalker": "Director of Photography",
    "celebraciones": "Cinematographer", "legends": "Cinematographer",
    "stay-gold": "Cinematographer", "drift": "Cinematographer",
    "golden-moment-directors-cut": "Cinematographer", "s18": "Cinematographer",
    "just-the-beginning": "Cinematographer",
}
YEARS = {"reel-2026": 2026, "cinematography-demo-reel-2025": 2025, "reel-24": 2024}
SOUND_SLUG = {"wave": "waveform", "w1": "mothers-moniker", "w2": "lost-coffee",
              "w3": "lost-coffee-apple-music", "w4": "to-go"}
PROGRESS = {"w9", "w11", "w12", "w13"}  # carve, design board, wireframe, materials
CASE = {"one-with-the-devil", "weird-kid", "legends", "drift", "sleepwalker",
        "stay-gold", "golden-moment-directors-cut"}
ALSO = {
    "legends": ["film/drift"], "drift": ["film/legends"],
    "stay-gold": ["film/golden-moment-directors-cut"],
    "golden-moment-directors-cut": ["film/stay-gold"],
}
POEM = [
    "I am Gill", "I am James", "I am an artist", "a Cree voice rising",
    "weaving sound into the unseen", "Indigenous kin, my culture’s pulse",
    "visual arts", "Fine art and music", "are rivers I swim, a daily drift",
    "a lifelong hum", "Artistry a starfield I chase", "All my relations,",
    "in all my creations", "their breath in every chord I make and everything",
    "I create.",
]
BIO = [
    "Gill James (he/him) is a Cree-Métis artist based in Vancouver.",
    "After graduating from UBC Film Production in 2014, building on a design and advertising background from OCAD, he spent more than a decade as a cinematographer and producer. His cinematography on One With the Devil — Leo Award, Best Cinematography in a Short Drama (2015); Canadian Society of Cinematographers Award. Further Leo nominations for Arc (2015) and Backward Fall (2014).",
    "He makes objects, spaces, light and sound as one practice. Spirit Eye of skwácháýs, a public art concept recognized with Best Public Art Concept and Council's Choice within the BIDC Public Art Intensive. He is developing a yellow cedar piece staged with light, sound and film. He makes music as Mothers Moniker and Lost Coffee.",
    "Outside the studio, he does trail stewardship. Time on the trails shapes how he thinks about place, material and light.",
]
BIDC = "recognized with Best Public Art Concept and Council's Choice within the BIDC Public Art Intensive"


def localize(url):
    hosts = (
        ("https://jamesgillmedia.github.io/gilljames/site-v3-pro2/", "media/pro2/"),
        ("https://jamesgillmedia.github.io/gilljames/site-v3/", "media/v3/"),
        ("https://jamesgillmedia.github.io/gilljames/site-v2/", "media/v2/"),
    )
    for host, prefix in hosts:
        if url.startswith(host):
            return prefix + url[len(host):]
    return url


def abs_url(path):
    if not path:
        return ""
    if path.startswith("http://") or path.startswith("https://") or path.startswith("mailto:"):
        return localize(path)
    if path.startswith("../audio/"):
        return "media/pro2/audio/" + path[len("../audio/"):]
    if path.startswith("../site-v3/"):
        return "media/v3/" + path[len("../site-v3/"):]
    if path.startswith("../"):
        return "media/v3/" + path[3:]
    return "media/pro2/" + path


def credits_from_copy():
    js = r"""
const fs = require("fs");
const s = fs.readFileSync(process.argv[1], "utf8");
global.window = {};
eval(s);
const out = {};
for (const [k, c] of Object.entries(window.GJ_COPY.credits)) {
  const lines = [];
  if (c.dir) lines.push("dir. " + c.dir);
  if (c.prod) lines.push(c.prod);
  if (c.agency) lines.push(c.agency);
  if (c.cam) lines.push(c.cam);
  if (c.b) lines.push(c.b);
  out[k] = lines;
}
process.stdout.write(JSON.stringify(out));
"""
    raw = subprocess.check_output(["node", "-e", js, str(SRC / "site-v3-pro2/js/copy.js")], text=True)
    data = json.loads(raw)
    data["w34"] = data.get("w34", []) + ["joint effort with Ryan"]
    return data


def tracks():
    js = r"""
const fs = require("fs");
const s = fs.readFileSync(process.argv[1], "utf8");
global.window = {};
eval(s);
const out = [];
for (const [k, t] of Object.entries(window.TRACKS)) {
  const peaks = t.peaks || [], n = 96, slim = [];
  for (let i = 0; i < n; i++) {
    const a = Math.floor(i / n * peaks.length);
    const b = Math.max(a + 1, Math.floor((i + 1) / n * peaks.length));
    let m = 0;
    for (let j = a; j < b; j++) m = Math.max(m, peaks[j] || 0);
    slim.push(+m.toFixed(3));
  }
  out.push({k, title: t.title, artist: t.artist, file: t.file, dur: t.dur, star: t.star, peaks: slim});
}
process.stdout.write(JSON.stringify(out));
"""
    raw = subprocess.check_output(["node", "-e", js, str(SRC / "site-v3-pro2/js/tracks.js")], text=True)
    rows = json.loads(raw)
    for t in rows:
        t["file"] = abs_url(t["file"])
    return rows


def parse_section(key):
    m = re.search(rf'<section class="ch[^"]*" id="{key}".*?</section>', W7)
    if not m:
        raise SystemExit("missing section " + key)
    items = []
    for li in re.findall(r"<li class=\"it[^\"]*\"[^>]*>.*?</li>", m.group(0)):
        km = re.search(r'data-k="([^"]+)"', li)
        jm = re.search(r'data-j="([^"]*)"', li)
        bm = re.search(r'data-big="([^"]*)"', li)
        pvm = re.search(r'data-pv="([^"]*)"', li)
        scm = re.search(r'data-sc="([^"]*)"', li)
        im = re.search(r'data-src="([^"]+)"', li)
        cap = re.search(r"<b>(.*?)</b>", li)
        sm = re.search(r"<small>(.*?)</small>", li)
        j = {}
        if jm:
            j = json.loads(html.unescape(jm.group(1)))
        items.append({
            "k": km.group(1),
            "j": j,
            "big": bm.group(1) if bm else "",
            "pv": pvm.group(1) if pvm else "",
            "sc": scm.group(1) if scm else "",
            "thumb": im.group(1) if im else "",
            "title": html.unescape(cap.group(1)) if cap else "",
            "meta": html.unescape(sm.group(1)) if sm else "",
            "joio": 'data-joio="1"' in li,
        })
    return items


def slug_for(chapter, it):
    if chapter == "film":
        return FILM_SLUG[it["k"]]
    if chapter == "sound":
        return SOUND_SLUG[it["k"]]
    if chapter == "about":
        return it["k"]
    if it.get("joio"):
        return "joio"
    title = it["title"]
    s = title.lower()
    s = s.replace("&", " and ")
    s = re.sub(r"[’']", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or it["k"]


def card(chapter, it, creds):
    slug = slug_for(chapter, it)
    j = it["j"]
    kind = "work"
    if chapter == "film" and it["k"] == "reel":
        kind = "reel"
    elif chapter == "film":
        kind = "film"
    elif chapter == "photo":
        kind = "photo"
    elif chapter == "objects" and it["joio"]:
        kind = "joio"
    elif chapter == "objects":
        kind = "object"
    elif chapter == "sound" and it["k"] == "wave":
        kind = "player"
    elif chapter == "sound":
        kind = "sound"
    elif it["k"] == "bio":
        kind = "bio"
    elif it["k"] == "poem":
        kind = "poem"
    elif it["k"] == "contact":
        kind = "contact"
    elif it["k"] == "joio":
        kind = "link"
    frames = [abs_url(f) for f in j.get("frames") or []]
    media = {
        "thumb": abs_url(it["thumb"]),
        "big": abs_url(it["big"]),
        "clip": abs_url(it["sc"] or it["pv"]),
        "pv": abs_url(it["pv"]),
        "frames": frames,
        "url": j.get("url") or "",
        "embed": j.get("embed") or "",
        "w": j.get("w") or 0,
        "h": j.get("h") or 0,
    }
    role = ROLES.get(slug, "")
    year = YEARS.get(slug)
    credits = list(creds.get(it["k"], [])) if chapter == "film" else []
    if slug == "just-the-beginning" and "joint effort with Ryan" not in credits:
        credits.append("joint effort with Ryan")
    return {
        "id": f"{chapter}/{slug}",
        "chapter": chapter,
        "k": it["k"],
        "slug": slug,
        "title": it["title"],
        "role": role,
        "year": year,
        "meta": it["meta"],
        "kind": kind,
        "media": media,
        "credits": credits,
        "related": [],
        "also": ALSO.get(slug, []),
        "in_progress": chapter == "objects" and it["k"] in PROGRESS,
        "body": "",
        "isNew": it["k"] == "reel" or it["joio"] or it["k"] == "wave",
    }


def owtd():
    stills = sorted((ROOT / "media/owtd/stills").glob("*.jpg"))
    frames = ["media/owtd/stills/" + p.name for p in stills]
    return {
        "id": "film/one-with-the-devil",
        "chapter": "film",
        "k": "owtd",
        "slug": "one-with-the-devil",
        "title": "One With the Devil",
        "role": "Cinematographer",
        "year": 2015,
        "meta": "short · 2015",
        "kind": "film",
        "media": {
            "thumb": frames[8] if len(frames) > 8 else frames[0],
            "big": frames[8] if len(frames) > 8 else frames[0],
            "clip": "media/owtd/one-with-the-devil-clip.mp4",
            "pv": "media/owtd/one-with-the-devil-clip.mp4",
            "frames": frames,
            "url": "",
            "embed": "",
            "w": 1920,
            "h": 1080,
        },
        "credits": [
            "dir. Drew Pollins",
            "Leo Award, Best Cinematography in a Short Drama (2015)",
            "Canadian Society of Cinematographers Award",
        ],
        "related": [],
        "also": [],
        "in_progress": False,
        "body": "",
        "isNew": False,
    }


def wire_related(by_id):
    bio = by_id["about/bio"]
    bio["related"] = []
    bio["body"] = "\n\n".join(BIO)
    by_id["about/poem"]["body"] = "\n".join(POEM)
    by_id["about/contact"]["body"] = EMAIL
    by_id["about/joio"]["related"] = []
    # Cross-chapter only. Film-to-film stays in "also". About is not a thread.
    # photograph 23 is the file named redcar. No work is titled railing or next firing.
    pairs = [
        ("film/legends", "photo/photograph-23"),
        ("objects/latte-in-a-joio-co-cup", "sound/to-go"),
    ]
    for a, b in pairs:
        if a in by_id and b in by_id:
            by_id[a]["related"] = [b]
            by_id[b]["related"] = [a]


def e(s):
    return html.escape(s or "", quote=True)


PAGE_CSS = """
@font-face{font-family:Poppins;font-weight:300;font-display:swap;src:url(../media/pro2/fonts/poppins-300.woff2) format("woff2")}
@font-face{font-family:"Julius Sans One";font-display:swap;src:url(../media/pro2/fonts/julius-sans-one.woff2) format("woff2")}
@font-face{font-family:Syl;font-weight:700;font-display:swap;src:url(../media/pro2/fonts/noto-canadian-aboriginal-subset.woff2) format("woff2");unicode-range:U+1400-167F}
:root{--bg:#04070b;--ink:#eef3f5;--dim:#c9d3d6;--meta:#93a1a6;--mint:#55DAA1;--line:rgba(255,255,255,.14);
 --st:env(safe-area-inset-top,0px);--sb:env(safe-area-inset-bottom,0px);--sl:env(safe-area-inset-left,0px);--sr:env(safe-area-inset-right,0px)}
*{box-sizing:border-box}html{background:var(--bg);color:var(--ink);overscroll-behavior:none}
body{margin:0;overscroll-behavior:none;touch-action:manipulation;font:300 15px/1.55 Poppins,Syl,system-ui,sans-serif;background:
 radial-gradient(1px 1px at 12% 18%,#fff,transparent),radial-gradient(1px 1px at 70% 8%,#fff,transparent),
 radial-gradient(ellipse at 50% 0,#13202e,var(--bg) 70%) fixed}
a,button{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
a{color:inherit}
.top{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:10px;
 padding:calc(8px + var(--st)) max(14px,var(--sr)) 8px max(14px,var(--sl));
 background:linear-gradient(#04070bf0,#04070b00)}
.top a{text-decoration:none;min-height:44px;display:inline-grid;place-items:center}
.sig{font:700 22px/1 Syl,sans-serif;text-shadow:1px 0 rgba(10,189,240,.7),-1px 0 rgba(254,1,1,.55)}
.crumb{flex:1;margin:0;font-size:12px;letter-spacing:.08em;color:var(--dim)}
.links{display:flex;gap:12px;font-size:12px;letter-spacing:.12em;text-transform:uppercase}
main{max-width:980px;margin:0 auto;padding:8px max(16px,var(--sr)) calc(48px + var(--sb)) max(16px,var(--sl))}
h1{margin:8px 0 0;font:400 clamp(28px,6vw,52px)/1.05 "Julius Sans One",sans-serif;letter-spacing:.04em}
.role{margin:6px 0 0;color:var(--mint);letter-spacing:.12em;font-size:12px;text-transform:uppercase}
.meta{margin:6px 0 0;color:var(--meta);font-size:13px}
.hero{margin:18px 0 0;background:#000;border-radius:4px;overflow:hidden}
.hero img,.hero video{display:block;width:100%;height:auto;max-height:78vh;object-fit:contain;background:#000}
.frame239{aspect-ratio:2.39/1;background:#000;display:grid}
.frame239 img,.frame239 video{width:100%;height:100%;object-fit:contain}
.prose p{max-width:62ch}
.file{display:grid;grid-template-columns:max-content 1fr;gap:6px 16px;margin:18px 0}
.file dt{color:var(--meta);font-size:11px;letter-spacing:.12em;text-transform:uppercase}
.file dd{margin:0}
.frames{list-style:none;margin:18px 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}
.frames img{width:100%;aspect-ratio:2.39/1;object-fit:cover;display:block;border-radius:2px;background:#0d151c}
.rel a,.also a{color:var(--mint);text-decoration:none}
.pull{margin:28px 0;padding-left:14px;border-left:2px solid var(--mint);font:400 clamp(18px,3vw,26px)/1.3 "Julius Sans One",sans-serif}
.group{margin:28px 0 0}
.group h2{font:400 13px/1 "Julius Sans One",sans-serif;letter-spacing:.22em;text-transform:uppercase;color:var(--dim)}
.works{list-style:none;margin:10px 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.works a{text-decoration:none;display:block}
.works img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;border-radius:2px;background:#101820}
.works.sq img{aspect-ratio:1}
.works b{display:block;margin-top:4px;font-weight:300;font-size:13px}
.works small{color:var(--meta);font-size:11px}
.poem span{display:block}
.poem .sig{font-family:Syl,sans-serif;font-weight:700;font-size:22px;margin-top:10px}
.joio{list-style:none;margin:14px 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}
.joio video,.joio img{width:100%;display:block;background:#000;border-radius:2px}
audio{width:min(100%,520px);margin:8px 0}
"""


def page(rel, title, crumb, body, depth):
    up = "../" * depth
    doc = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,maximum-scale=1,user-scalable=no">
<title>{e(title)} · Gill James</title>
<meta name="theme-color" content="#04070b">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="ᑕᐣᓯ">
<link rel="manifest" href="{up}manifest.webmanifest">
<link rel="apple-touch-icon" href="{up}icons/apple-touch-icon.png">
<link rel="stylesheet" href="{up}css/page.css">
</head><body>
<header class="top"><a class="sig" href="{up}" lang="cr">ᑕᐣᓯ</a>
<p class="crumb">{e(crumb)}</p>
<nav class="links"><a href="{up}list/">List</a><a href="{up}contact/">Contact</a></nav></header>
<main>{body}</main>
</body></html>
"""
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(doc, encoding="utf-8")


def loc(src, depth):
    if not src:
        return ""
    if src.startswith(("http://", "https://", "mailto:")):
        return src
    return ("../" * depth) + src


def work_body(c, by_id, depth=2):
    m = c["media"]
    bits = []
    role = f'<p class="role">{e(c["role"])}</p>' if c["role"] else ""
    meta = c["meta"] or ""
    year = f' · {c["year"]}' if c["year"] and str(c["year"]) not in meta else ""
    bits.append(f'<h1>{e(c["title"])}</h1>{role}<p class="meta">{e(meta)}{year}</p>')
    if c["kind"] == "film" and (m["clip"] or m["big"]):
        inner = ""
        if m["clip"]:
            poster = f' poster="{e(loc(m["big"], depth))}"' if m["big"] else ""
            inner = f'<video controls playsinline preload="metadata"{poster} src="{e(loc(m["clip"], depth))}"></video>'
        elif m["big"]:
            inner = f'<img src="{e(loc(m["big"], depth))}" alt="{e(c["title"])}">'
        cls = "hero frame239" if c["kind"] == "film" else "hero"
        bits.append(f'<figure class="{cls}">{inner}</figure>')
        if m["url"]:
            bits.append(f'<p class="rel"><a href="{e(m["url"])}">Watch ↗</a></p>')
    elif c["kind"] == "reel":
        bits.append(f'<figure class="hero frame239"><img src="{e(loc(m["big"] or m["thumb"], depth))}" alt=""></figure>')
        bits.append('<p class="meta">201 shots. The filmstrip drifts in the sky, one shot at a time.</p>')
    elif c["kind"] in ("photo", "object", "joio") and (m["big"] or m["thumb"]):
        bits.append(f'<figure class="hero"><img src="{e(loc(m["big"] or m["thumb"], depth))}" alt="{e(c["title"])}"></figure>')
    elif c["kind"] == "player":
        bits.append('<p class="meta">Six tracks. Licensing only — no picture locked to the music.</p>')
        for t in TRACKS:
            bits.append(f'<p><b>{e(t["title"])}</b> · {e(t["artist"])}<br><audio controls preload="none" src="{e(t["file"])}"></audio></p>')
        bits.append(f'<p class="rel"><a href="mailto:{EMAIL}?subject=music%20licensing">licensing · {EMAIL}</a></p>')
    elif c["kind"] == "sound":
        if m["big"]:
            bits.append(f'<figure class="hero frame239"><img src="{e(loc(m["big"], depth))}" alt=""></figure>')
        if m["embed"]:
            bits.append(f'<p class="rel"><a href="{e(m["url"] or m["embed"])}">Listen ↗</a></p>')
    elif c["kind"] == "bio":
        bits.append('<div class="prose">' + "".join(f"<p>{e(p)}</p>" for p in BIO) + "</div>")
    elif c["kind"] == "poem":
        spans = "".join(f"<span>{e(line)}</span>" for line in POEM)
        bits.append(f'<p class="poem">{spans}<span class="sig" lang="cr">ᑕᐣᓯ</span></p>')
    elif c["kind"] == "contact":
        bits.append(f'<p><a href="mailto:{EMAIL}">{EMAIL}</a></p>')
    elif c["kind"] == "link":
        bits.append('<p><a href="https://www.joioco.com">joio.co ↗</a></p>')
    if c["slug"] in CASE and m["frames"]:
        imgs = "".join(f'<li><img src="{e(loc(src, depth))}" alt="{e(c["title"])}"></li>' for src in m["frames"])
        bits.append(f'<h2>Frames</h2><ol class="frames">{imgs}</ol>')
    if c["slug"] == "legends":
        bits.append('<blockquote class="pull"><p>“What are legends made of?”</p><cite>On-screen line in BMW Legends, as titled in the Reel 2026 shot list.</cite></blockquote>')
    if c["credits"]:
        rows = "".join(f"<dt>credit</dt><dd>{e(line)}</dd>" for line in c["credits"])
        bits.append(f"<dl class=\"file\">{rows}</dl>")
    links = []
    for rid in c["related"]:
        o = by_id.get(rid)
        if o and o["chapter"] != c["chapter"] and o["chapter"] != "about" and c["chapter"] != "about":
            links.append(f'<a href="../../{o["chapter"]}/{o["slug"]}/">{e(o["title"])}</a>')
    bits.append('<p class="rel">Related' + (" · " + " · ".join(links) if links else "") + "</p>")
    if c["also"]:
        links = []
        for rid in c["also"]:
            o = by_id.get(rid)
            if o:
                links.append(f'<a href="../../{o["chapter"]}/{o["slug"]}/">{e(o["title"])}</a>')
        if links:
            bits.append('<p class="also">also · ' + " · ".join(links) + "</p>")
    if c["kind"] == "joio":
        raw = (ROOT / "js/joio.js").read_text(encoding="utf-8")
        raw = raw.split("=", 1)[1].rsplit(";", 1)[0]
        clips = json.loads(raw)
        cells = []
        base = "../../media/pro2/joio/"
        for clip in clips:
            src = base + clip["f"]
            if clip["k"] == "v":
                cells.append(f'<li><video muted loop playsinline autoplay preload="metadata" poster="{e(src)}" src="{e(base + clip["v"])}"></video></li>')
            else:
                cells.append(f'<li><img src="{e(src)}" alt=""></li>')
        bits.append(f'<ol class="joio">{"".join(cells)}</ol>')
    return "\n".join(bits)


def main():
    global TRACKS
    creds = credits_from_copy()
    TRACKS = tracks()
    names = {"film": "film", "photo": "photo", "objects": "objects", "sound": "sound", "about": "about"}
    tints = {"film": "150,220,255", "photo": "170,245,212", "objects": "255,236,205",
             "sound": "255,182,176", "about": "214,222,236"}
    chapters = []
    by_id = {}
    for key in ("film", "photo", "objects", "sound", "about"):
        cards = [card(key, it, creds) for it in parse_section(key)]
        if key == "film":
            cards.insert(3, owtd())
        for c in cards:
            by_id[c["id"]] = c
        chapters.append({"k": key, "nm": names[key], "tint": tints[key], "cards": cards})
    wire_related(by_id)
    data = {"chapters": chapters, "poem": POEM, "bio": BIO, "email": EMAIL, "tracks": TRACKS, "bidc": BIDC}
    (ROOT / "data.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    (ROOT / "css").mkdir(exist_ok=True)
    (ROOT / "css/page.css").write_text(PAGE_CSS, encoding="utf-8")
    for ch in chapters:
        for c in ch["cards"]:
            body = work_body(c, by_id)
            page(f'{c["chapter"]}/{c["slug"]}/index.html', c["title"], c["title"], body, 2)
    # list
    groups = []
    for ch in chapters:
        sq = " sq" if ch["k"] in ("photo", "objects") else ""
        cells = []
        for c in ch["cards"]:
            src = loc(c["media"]["thumb"] or c["media"]["big"], 1)
            img = f'<img src="{e(src)}" alt="">' if src else ""
            role = e(c["role"]) if c["role"] else e(c["meta"])
            cells.append(f'<li><a href="../{c["chapter"]}/{c["slug"]}/">{img}<b>{e(c["title"])}</b><small>{role}</small></a></li>')
        groups.append(f'<section class="group"><h2>{e(ch["nm"])}</h2><ul class="works{sq}">{"".join(cells)}</ul></section>')
    page("list/index.html", "List", "List", "".join(groups), 1)
    page("contact/index.html", "Contact", "Contact",
         f'<h1>Contact</h1><p><a href="mailto:{EMAIL}">{EMAIL}</a></p>'
         f'<p class="meta">licensing · {EMAIL}</p><p><a href="https://www.joioco.com">joio.co ↗</a></p>', 1)
    scan()
    n = sum(len(ch["cards"]) for ch in chapters)
    prog = [c["id"] for ch in chapters for c in ch["cards"] if c["in_progress"]]
    print(f"cards {n} progress {prog}")


def scan():
    bad = ["Two-Spirit", "Joshua", "award-winning", "Retail Revolution", "they/them",
           "Norway House", "IMG_1936", "IMG_1188", "IMG_1189",
           "IMG_6405", "IMG_6606", "IMG_6612", "22179A95", "Best Student"]
    hits = []
    for p in ROOT.rglob("*"):
        if p.suffix not in {".html", ".json", ".css", ".js"}:
            continue
        if p.name in ("reelshots.js", "joio.js"):
            continue
        text = p.read_text(encoding="utf-8", errors="replace")
        for word in bad:
            if word.lower() in text.lower():
                hits.append(f"{p.relative_to(ROOT)} :: {word}")
    if hits:
        raise SystemExit("public-text scan failed:\n" + "\n".join(hits))


if __name__ == "__main__":
    main()
