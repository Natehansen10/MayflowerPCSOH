#!/usr/bin/env python3
"""
Generate the QR codes and the print-ready placards for the house.

    pip install segno
    python3 tools/make-qr.py https://buildfile.mayflowerluxuryhomes.com

Writes:
    print/qr/*.svg      one QR per station, plus the entry sign and the planner
    print/placards.html open in Chrome, Cmd/Ctrl-P, print to heavy card stock

Re-run it any time the site URL changes. The QR codes are plain URLs with no
tracking redirect, so they keep working forever and nothing breaks if a service
goes away.
"""
import html, json, os, re, subprocess, sys

BASE = (sys.argv[1] if len(sys.argv) > 1 else "https://example.com").rstrip("/")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QR_DIR = os.path.join(ROOT, "print", "qr")
os.makedirs(QR_DIR, exist_ok=True)

# pull the station list straight out of content.js so the two never drift
dump = subprocess.run(
    ["node", "-e",
     "const s=require('fs').readFileSync('assets/js/content.js','utf8');"
     "const r=eval(s+';({CONFIG,STATIONS})');"
     "console.log(JSON.stringify({config:r.CONFIG,stations:r.STATIONS}))"],
    cwd=ROOT, capture_output=True, text=True, check=True)
data = json.loads(dump.stdout)
CONFIG, STATIONS = data["config"], data["stations"]

try:
    import segno
except ImportError:
    sys.exit("Run: pip install segno")

INK = "#42403A"

def qr(url, name):
    path = os.path.join(QR_DIR, name + ".svg")
    segno.make(url, error="h").save(path, scale=10, border=2, dark=INK, light=None)
    return path

targets = [("entry", BASE + "/index.html"), ("plan", BASE + "/plan.html")]
targets += [(s["slug"], BASE + "/station.html?s=" + s["slug"]) for s in STATIONS]
for name, url in targets:
    qr(url, name)
    print("  qr/%-12s %s" % (name + ".svg", url))

def svg_inline(name):
    """Inline the QR and swap its fixed pixel size for a viewBox, so the print
    stylesheet can size it in inches without clipping."""
    with open(os.path.join(QR_DIR, name + ".svg")) as f:
        s = f.read()
    s = s[s.index("<svg"):]
    m = re.search(r'width="(\d+)"\s+height="(\d+)"', s)
    if m:
        s = s.replace(m.group(0), 'viewBox="0 0 %s %s"' % (m.group(1), m.group(2)))
    return s

e = html.escape

def cost_block(s):
    """The number goes on the physical card too. Someone who never scans still
    walks away having seen what it cost."""
    c = s.get("cost")
    if not c:
        return ('<div class="costline"><p class="clabel">The whole file</p>'
                '<p class="cnum">Open</p></div>')
    return (f'<div class="costline"><p class="clabel">{e(c["label"])}</p>'
            f'<p class="cnum">{e(c["range"])}</p></div>')

cards = []
for s in STATIONS:
    cards.append(f"""
  <section class="card">
    <div class="head">
      <img class="logo" src="../assets/img/logo.png" alt="">
      <span class="num">{e(s['number'])}</span>
    </div>
    <p class="where">{e(s['where'])} &middot; Detail {e(s['number'])} of {len(STATIONS):02d}</p>
    <h2>{e(s['title'])}</h2>
    <p class="lede">{e(s['lede'])}</p>
    <p class="body">{e(s['preview'])}</p>
    {cost_block(s)}
    <div class="qrwrap">
      <div class="qr">{svg_inline(s['slug'])}</div>
      <p class="scan">Scan to read this one.<br>About a minute.</p>
    </div>
  </section>""")

entry = f"""
  <section class="card sign">
    <img class="logo big" src="../assets/img/logo.png" alt="">
    <p class="where">{e(CONFIG['event']['name'])}</p>
    <h1>The Build File</h1>
    <p class="lede big">Most builders hand you a brochure.<br>We'd rather hand you the file.</p>
    <p class="body"><b>1.</b> Eight decisions in this home are marked with a placard, numbered 01 to 08
    in the order you'll pass them.<br>
    <b>2.</b> Scan any placard to read what it cost, why we chose it, and what went wrong.<br>
    <b>3.</b> Save the ones that matter to you. They stay on your phone.<br>
    <b>4.</b> Before you leave, scan the last card to see what a home like this would cost you.</p>
    <div class="qrwrap">
      <div class="qr">{svg_inline('entry')}</div>
      <p class="scan">Start here.</p>
    </div>
    <p class="foot">{e(CONFIG['home']['name'])} &middot; {e(str(CONFIG['home']['sqft']))} sf &middot;
      {e(str(CONFIG['home']['monthsToBuild']))} months &middot; Mayflower Luxury Homes</p>
  </section>"""

exitcard = f"""
  <section class="card sign">
    <img class="logo big" src="../assets/img/logo.png" alt="">
    <p class="where">Before you go</p>
    <h1>What would yours cost?</h1>
    <p class="lede big">Seven questions. Four minutes.<br>A preliminary range, and a real schedule.</p>
    <p class="body">Answer seven questions and the range appears on your screen, along with a
    design-to-move-in schedule and a month-by-month picture of when the money is spent. No email
    required to see it. Ask for the written version and Curtis sends it himself.</p>
    <div class="qrwrap">
      <div class="qr">{svg_inline('plan')}</div>
      <p class="scan">Plan your build.</p>
    </div>
    <p class="foot">mayflowerluxuryhomes.com &middot; {e(CONFIG['contact']['curtis']['phone'])}</p>
  </section>"""

doc = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Build File — placards to print</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&family=Roboto+Serif:opsz,wght@8..144,400&display=swap" rel="stylesheet">
<style>
  @page {{ size: letter; margin: 0.4in; }}
  body {{ margin:0; background:#8a8a82; font-family:"Montserrat","Segoe UI",sans-serif; color:#575E67; }}
  .card {{
    width: 5in; height: 7in; background:#ECECE4; padding: 0.55in 0.5in;
    box-sizing:border-box; display:flex; flex-direction:column;
    margin: 0.25in auto; page-break-after: always; position:relative;
  }}
  .head {{ display:flex; justify-content:space-between; align-items:flex-start; }}
  .logo {{ height: 34px; }}
  .logo.big {{ height: 46px; margin-bottom: 0.35in; }}
  .num {{ font-family:"Roboto Serif",Georgia,serif; font-size: 15pt; color:#836F4E; }}
  .where {{ font-size: 7.5pt; letter-spacing:.22em; text-transform:uppercase; color:#836F4E;
           margin: 0.42in 0 0.1in; }}
  h1,h2 {{ font-family:"Roboto Serif",Georgia,serif; font-weight:400; color:#64645D; margin:0;
          line-height:1.18; letter-spacing:-.01em; }}
  h2 {{ font-size: 21pt; }}
  h1 {{ font-size: 28pt; }}
  .lede {{ font-family:"Roboto Serif",Georgia,serif; font-size: 11.5pt; line-height:1.5;
          color:#64645D; margin: 0.16in 0 0; }}
  .lede.big {{ font-size: 13pt; }}
  .body {{ font-size: 9.5pt; line-height:1.65; margin: 0.16in 0 0; }}
  .costline {{ margin-top:auto; border-top:1px solid rgba(66,64,58,.16); padding-top: 0.22in; }}
  .clabel {{ font-size: 7pt; letter-spacing:.2em; text-transform:uppercase; color:#836F4E; margin:0 0 0.06in; }}
  .cnum {{ font-family:"Roboto Serif",Georgia,serif; font-size: 19pt; color:#64645D; margin:0; }}
  .qrwrap {{ display:flex; align-items:center; gap: 0.22in; margin-top: 0.24in; }}
  .sign .qrwrap {{ margin-top:auto; border-top:1px solid rgba(66,64,58,.16); padding-top: 0.24in; }}
  .qr svg {{ width: 1.25in; height: 1.25in; display:block; }}
  .scan {{ font-size: 8.5pt; line-height:1.5; color:#A79E86; margin:0; }}
  .foot {{ font-size: 7pt; letter-spacing:.12em; text-transform:uppercase; color:#A79E86;
           margin: 0.18in 0 0; }}
  .sign {{ text-align:left; }}
  @media print {{ body {{ background:#fff; }} .card {{ margin:0 auto; box-shadow:none; }} }}
  @media screen {{ .card {{ box-shadow: 0 10px 40px rgba(0,0,0,.28); }} }}
</style></head>
<body>
{entry}
{''.join(cards)}
{exitcard}
</body></html>"""

out = os.path.join(ROOT, "print", "placards.html")
with open(out, "w") as f:
    f.write(doc)
print("\n  print/placards.html  (%d cards: entry + %d stations + exit)" % (len(STATIONS) + 2, len(STATIONS)))
print("  Open it in Chrome and print to 5x7 heavy stock, or letter and trim.")
