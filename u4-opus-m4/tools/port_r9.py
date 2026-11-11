#!/usr/bin/env python3
"""Item J: port r9's full-page film pages and its All Work index into m4's look.
r9/ is only READ (never written). Output goes to u4-opus-m4 only:
  - film/<slug>/index.html: m4's own page plus, from r9, the kicker, the by line / credits when m4 lacks them, a non-YouTube
    Watch link when m4 has none, the stills row (local media/pro2/frames copies only), ‹ prev / next › in r9's film order,
    and Index · About · Contact links. Pages that exist only in r9 (reel-20) are created from r9's text.
  - work/index.html: r9's All Work index (Films, Commercials, Reels, Practice, Sound) as m4 thumbnail groups, every link mapped
    to its m4 page or sky hash.
Idempotent: everything it adds sits between <!--r9:...--> markers and is replaced on a re-run. Never links to YouTube.
Run: python3 tools/port_r9.py   (from u4-opus-m4/, with ../r9 next to it)"""
import html, re, sys
from pathlib import Path

M4 = Path(__file__).resolve().parent.parent
R9 = M4.parent / "r9"
REMOTE = "https://jamesgillmedia.github.io/gilljames/site-v3-pro2/"
YT = re.compile(r"youtube\.com|youtu\.be|youtube-nocookie", re.I)
e = lambda s: html.escape(s or "", quote=True)
txt = lambda s: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s or ""))).strip()


def local(url):
    """map an r9 remote media URL to the m4 copy; None if m4 doesn't have it"""
    if not url or not url.startswith(REMOTE):
        return None
    rel = url[len(REMOTE):]
    for cand in ("media/pro2/" + rel,):
        if (M4 / cand).is_file():
            return cand
    return None


def r9_film(slug):
    s = (R9 / "film" / slug / "index.html").read_text(encoding="utf-8")
    art = re.search(r'<article class="sheet">(.*?)</article>', s, re.S).group(1)
    g = lambda pat: (re.search(pat, art, re.S) or [None, None])[1]
    d = {
        "slug": slug,
        "kicker": txt(g(r'<p class="kicker">(.*?)</p>')),
        "title": txt(g(r"<h1>(.*?)</h1>")),
        "by": txt(g(r'<p class="by">(.*?)</p>')),
        "credits": [(txt(a), txt(b)) for a, b in re.findall(r'<td class="l">(.*?)</td><td class="r">(.*?)</td>', art)],
        "watch": None,
        "stills": [],
        "prev": None, "next": None,
    }
    w = re.search(r'<a class="watch" href="([^"]+)"[^>]*>(.*?)</a>', art)
    if w and not YT.search(w.group(1)):
        d["watch"] = html.unescape(w.group(1))
    st = re.search(r'<div class="stills"[^>]*>(.*?)</div>', art, re.S)
    if st:
        for src in re.findall(r'<img src="([^"]+)"', st.group(1)):
            l = local(src)
            if l:
                d["stills"].append(l)
    pg = re.search(r'<nav class="pager"[^>]*>(.*?)</nav>', art, re.S)
    if pg:
        for cls, href, label in re.findall(r'<a class="(prev|next)" href="([^"]+)">(.*?)</a>', pg.group(1)):
            d[cls] = (href.strip("./").split("/")[-1] or href, txt(label).strip("‹› ").strip())
    return d


def strip_old(s):
    return re.sub(r"<!--r9:(\w+)-->.*?<!--/r9:\1-->", "", s, flags=re.S)


def block(name, inner):
    return f"<!--r9:{name}-->{inner}<!--/r9:{name}-->" if inner else ""


NEW_PAGE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,maximum-scale=1,user-scalable=no">
<title>{title} · Gill James</title>
<meta name="theme-color" content="#04070b">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="ᑕᐣᓯ">
<link rel="manifest" href="../../manifest.webmanifest">
<link rel="apple-touch-icon" href="../../icons/apple-touch-icon.png">
<link rel="icon" href="../../icons/icon-192.png">
<link rel="stylesheet" href="../../css/page.css">
</head><body>
<header class="top"><a class="sig" href="../../" lang="cr">ᑕᐣᓯ</a>
<p class="crumb">{title}</p>
<nav class="links"><a href="../../list/">List</a><a href="../../contact/">Contact</a></nav></header>
<main><h1>{title}</h1></main>
</body></html>
"""


def port_film(d, made):
    p = M4 / "film" / d["slug"] / "index.html"
    if not p.is_file():
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(NEW_PAGE.format(title=e(d["title"])), encoding="utf-8")
        made.append(d["slug"])
    s = strip_old(p.read_text(encoding="utf-8"))
    main = re.search(r"<main>(.*?)</main>", s, re.S)
    body = main.group(1)
    plain = txt(body).lower()
    head = ""
    if d["kicker"] and d["kicker"].lower() not in plain:
        head = block("kicker", f'<p class="kicker">{e(d["kicker"])}</p>')
    extra = []
    if d["by"] and not all(part.strip().lower() in plain for part in d["by"].split(" · ")):
        extra.append(f'<p class="by">{e(d["by"])}</p>')
    if d["credits"] and 'class="file"' not in body:
        extra.append('<dl class="file">' + "".join(f"<dt>{e(a)}</dt><dd>{e(b)}</dd>" for a, b in d["credits"]) + "</dl>")
    if d["watch"] and "Watch" not in body:
        extra.append(f'<p class="rel"><a href="{e(d["watch"])}">Watch ↗</a></p>')
    if d["stills"]:
        extra.append(f'<div class="stills" role="group" aria-label="Stills from {e(d["title"])}">' +
                     "".join(f'<img src="../../{e(x)}" alt="" loading="lazy">' for x in d["stills"]) + "</div>")
    pager = '<nav class="pager" aria-label="Films">' + (
        f'<a class="prev" href="../{e(d["prev"][0])}/">‹ {e(d["prev"][1])}</a>' if d["prev"] else "<span></span>") + (
        f'<a class="next" href="../{e(d["next"][0])}/">{e(d["next"][1])} ›</a>' if d["next"] else "<span></span>") + "</nav>"
    foot = '<nav class="foot" aria-label="Site"><a href="../../work/">Index</a><a href="../../about/bio/">About</a><a href="../../contact/">Contact</a></nav>'
    tail = block("extra", "".join(extra)) + block("pager", pager if (d["prev"] or d["next"]) else "") + block("foot", foot)
    s = s[:main.start(1)] + head + body + tail + s[main.end(1):]
    s = s.replace('<nav class="links"><a href="../../list/">List</a>',
                  '<nav class="links"><!--r9:idx--><a href="../../work/">Index</a><!--/r9:idx--><a href="../../list/">List</a>', 1)
    assert not YT.search(s), d["slug"]
    p.write_text(s, encoding="utf-8")


# r9 All Work -> m4 links
PRACTICE = {"../practice/joio/": "../objects/joio/", "../practice/carving/": "../objects/hand-carved-piece/",
            "../practice/space/": "../#space", "../stills/": "../#photo"}
SOUND = {"": "../sound/waveform/", "to-go": "../sound/to-go/", "gone": "../sound/mothers-moniker/",
         "no-problem": "../sound/lost-coffee-apple-music/", "lost-in-time": "../sound/lost-coffee/",
         "equals": "../sound/waveform/", "ii": "../sound/waveform/"}


def m4_href(href):
    if href.startswith("../film/"):
        return href
    if href == "../#reel":
        return "../#film/demo-reel"
    if href in PRACTICE:
        return PRACTICE[href]
    if href.startswith("../practice/sound/"):
        return SOUND.get(href.split("#", 1)[1] if "#" in href else "", "../sound/waveform/")
    return None


def port_index():
    s = (R9 / "work" / "index.html").read_text(encoding="utf-8")
    groups = []
    for sec in re.findall(r'<section class="constel"[^>]*>(.*?)</section>', s, re.S):
        h = txt(re.search(r"<h2[^>]*>(.*?)</h2>", sec).group(1))
        cells = []
        for a in re.findall(r'<a class="node"[^>]*>.*?</a>', sec, re.S):
            href = re.search(r'href="([^"]+)"', a).group(1)
            to = m4_href(href)
            if not to:
                continue
            if to.startswith("../film/") and not (M4 / to[3:] / "index.html").is_file():
                continue
            t = txt((re.search(r'<span class="t">(.*?)</span>', a) or [None, ""])[1])
            role = txt((re.search(r'<span class="role">(.*?)</span>', a) or [None, ""])[1])
            im = re.search(r'<img src="([^"]+)"', a)
            th = local(im.group(1)) if im else None
            img = f'<img src="../{e(th)}" alt="" loading="lazy">' if th else '<span class="noimg" aria-hidden="true"></span>'
            cells.append(f'<li><a href="{e(to)}">{img}<b>{e(t)}</b>' + (f"<small>{e(role)}</small>" if role else "") + "</a></li>")
        groups.append(f'<section class="group"><h2>{e(h)}</h2><ul class="works">{"".join(cells)}</ul></section>')
    body = "<h1>All work</h1>" + "".join(groups)
    doc = NEW_PAGE.replace("../../", "../").format(title="All work").replace("<main><h1>All work</h1></main>", f"<main>{body}</main>")
    doc = doc.replace('<nav class="links"><a href="../list/">List</a>', '<nav class="links"><a href="../list/">List</a>', 1)
    assert not YT.search(doc)
    (M4 / "work").mkdir(exist_ok=True)
    (M4 / "work" / "index.html").write_text(doc, encoding="utf-8")
    return sum(g.count("<li>") for g in groups)


def main():
    if not R9.is_dir():
        raise SystemExit("no r9 next to u4-opus-m4")
    slugs = sorted(p.name for p in (R9 / "film").iterdir() if (p / "index.html").is_file())
    made = []
    for sl in slugs:
        port_film(r9_film(sl), made)
    # m4-only film pages (no r9 twin) still get the Index · About · Contact links
    for p in sorted((M4 / "film").iterdir()):
        if p.name in slugs or not (p / "index.html").is_file():
            continue
        port_film({"slug": p.name, "kicker": "", "title": "", "by": "", "credits": [], "watch": None, "stills": [], "prev": None, "next": None}, made)
    n = port_index()
    # LIST links the All Work index
    lp = M4 / "list" / "index.html"
    s = strip_old(lp.read_text(encoding="utf-8"))
    s = s.replace("<main>", '<main><!--r9:all--><p class="allwork"><a href="../work/">All work ›</a></p><!--/r9:all-->', 1)
    lp.write_text(s, encoding="utf-8")
    print(f"films {len(slugs)} new {made} index cells {n}")


if __name__ == "__main__":
    main()
