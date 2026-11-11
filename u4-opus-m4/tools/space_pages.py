#!/usr/bin/env python3
"""Item K: static pages + LIST section for the Space chapter, from data.json (no build.py rerun; see PROGRESS item J).
  - space/<slug>/index.html for every Space card in data.json, plus Spirit Eye (moved from Objects).
  - objects/<board>/ pages for the three moved boards become a short redirect to space/<board>/.
  - list/index.html: the three boards leave the objects group; a space group follows objects (idempotent <!--space--> markers).
Run from u4-opus-m4/: python3 tools/space_pages.py"""
import html, json, re
from pathlib import Path
M4 = Path(__file__).resolve().parent.parent
e = lambda s: html.escape(s or "", quote=True)
HEAD = (M4 / "film/stay-gold/index.html").read_text(encoding="utf-8").split("<main>")[0]
CEDAR_CAP = {}

def page(slug, title, body):
    h = re.sub(r"<title>.*?</title>", f"<title>{e(title)} · Gill James</title>", HEAD)
    h = re.sub(r'<p class="crumb">.*?</p>', f'<p class="crumb">space · {e(title)}</p>', h)
    foot = '<nav class="foot" aria-label="Site"><a href="../../work/">Index</a><a href="../../about/bio/">About</a><a href="../../contact/">Contact</a></nav>'
    p = M4 / "space" / slug / "index.html"
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(h + f"<main>{body}{foot}</main>\n</body></html>\n", encoding="utf-8")

def main():
    d = json.loads((M4 / "data.json").read_text(encoding="utf-8"))
    sp = [c for c in d["chapters"] if c["k"] == "space"][0]
    cells = []
    for c in sp["cards"]:
        m = c["media"]
        body = f'<p class="kicker">space</p><h1>{e(c["title"])}</h1>' + (f'<p class="meta">{e(c["meta"])}</p>' if c["meta"] else "")
        body += f'<figure class="hero"><img src="../../{e(m["big"])}" alt="{e(c["title"])}"></figure>'
        if c.get("body"):
            body += f'<div class="prose"><p>{e(c["body"])}</p></div>'
        if c.get("shots"):
            body += '<div class="stills" role="group" aria-label="' + e(c["title"]) + '">' + "".join(
                f'<figure><img src="../../{e(s["src"])}" alt="" loading="lazy"><figcaption>{e(s.get("title", ""))}</figcaption></figure>' for s in c["shots"]) + "</div>"
        page(c["slug"], c["title"], body)
        cells.append((c["slug"], m["thumb"] or m["big"], c["title"], c["meta"]))
    # Spirit Eye (its data lives in js/inner.js; same words, moved from Objects)
    se = ("Spirit Eye of skwácháýs", "public art concept",
          "Spirit Eye of skwácháýs. A public art concept recognized with Best Public Art Concept and Council's Choice within the BIDC Public Art Intensive.")
    page("spirit-eye", se[0], f'<p class="kicker">space</p><h1>{e(se[0])}</h1><p class="role">{e(se[1])}</p>'
         f'<figure class="hero"><img src="../../media/pro2/img/objects/spirit-eye.webp" alt="{e(se[0])}"></figure><div class="prose"><p>{e(se[2])}</p></div>')
    cells.insert(1, ("spirit-eye", "media/pro2/img/objects/spirit-eye.webp", se[0], se[1]))
    for b in ("design-board", "wireframe-board", "materials-board"):
        p = M4 / "objects" / b / "index.html"
        p.write_text(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>moved · Gill James</title>'
                     f'<meta http-equiv="refresh" content="0;url=../../space/{b}/"><link rel="canonical" href="../../space/{b}/"></head>'
                     f'<body><p><a href="../../space/{b}/">This board is in Space now ›</a></p></body></html>\n', encoding="utf-8")
    lp = M4 / "list" / "index.html"
    s = re.sub(r"<!--space-->.*?<!--/space-->", "", lp.read_text(encoding="utf-8"), flags=re.S)
    for b in ("design-board", "wireframe-board", "materials-board"):
        s = re.sub(r'<li><a href="\.\./objects/' + b + r'/">.*?</li>', "", s, flags=re.S)
    grp = ('<!--space--><section class="group"><h2>space</h2><ul class="works sq">' + "".join(
        f'<li><a href="../space/{e(sl)}/"><img src="../{e(src)}" alt=""><b>{e(t)}</b>' + (f"<small>{e(mt)}</small>" if mt else "") + "</a></li>"
        for sl, src, t, mt in cells) + "</ul></section><!--/space-->")
    i = s.index('<section class="group"><h2>sound</h2>')
    s = s[:i] + grp + s[i:]
    lp.write_text(s, encoding="utf-8")
    print("space pages", len(cells))

if __name__ == "__main__":
    main()
