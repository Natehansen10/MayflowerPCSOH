#!/usr/bin/env python3
"""
Build a single-file version of the whole site: dist/preview.html.

    python3 tools/build-preview.py

Every page, stylesheet, script and photograph is inlined into one HTML file with
a hash router, so the experience can be looked at on a phone without hosting
anything. This is for review only. The real site is the separate files, which is
what gets deployed and what the QR codes point at.
"""
import base64, json, mimetypes, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()

# ---- images -> data URIs -------------------------------------------------
assets = {}
for dirpath, _, files in os.walk("assets/img"):
    for fn in files:
        path = os.path.join(dirpath, fn).replace("\\", "/")
        mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
        with open(path, "rb") as f:
            assets[path] = "data:%s;base64,%s" % (mime, base64.b64encode(f.read()).decode())

def inline_assets(text):
    # longest paths first so a prefix never eats a longer name
    for path in sorted(assets, key=len, reverse=True):
        text = text.replace(path, assets[path])
    return text

# ---- page markup ---------------------------------------------------------
def page_body(fn):
    """Everything between <body> and the first <script>: nav, main, footer."""
    s = read(fn)
    body = s[s.index("<body>") + len("<body>"):]
    return body[:body.index("<script")].strip()

PAGES = {
    "home":    page_body("index.html"),
    "station": page_body("station.html"),
    "plan":    page_body("plan.html"),
    "owner":   page_body("owner.html"),
}

CSS = read("assets/css/app.css") + "\n" + (
    # owner.html carries its own block; lift it in
    re.search(r"<style>(.*?)</style>", read("owner.html"), re.S).group(1))

JS = "\n".join(read("assets/js/" + f) for f in
               ["content.js", "pricing.js", "core.js", "home.js",
                "station-page.js", "plan.js", "owner.js"])

# ---- sample leads, so the console can be seen before one exists ------------
DEMO = {"ok": True,
  "stats": {"total": 137, "A": 9, "B": 24, "C": 88, "R": 14, "T": 2, "walks": 11},
  "leads": [
    {"Received": "2026-08-29T18:12:00Z", "Tier": "A", "Score": 92,
     "Name": "Jonathan Reese", "Email": "j.reese@example.com", "Phone": "435-555-0134",
     "Wants walk": "YES", "Role": "Building for themselves", "Lot status": "Owns the lot",
     "Timeline": "Within six months", "Community": "Skyridge", "Sq ft": 7250,
     "Finish": "Signature", "Site": "Steep", "Project range": "$6.84M – $8.67M",
     "Notes": "We own lot 42 and have schematics from our architect. Want to break ground in spring.",
     "Why it scored": "Configured $6.84M – $8.67M · Building for themselves · Owns the lot · ASKED TO WALK A LOT · Saved 4 details"},
    {"Received": "2026-08-30T15:40:00Z", "Tier": "A", "Score": 78,
     "Name": "Priya Raman", "Email": "praman@example.com", "Phone": "801-555-0177",
     "Wants walk": "YES", "Role": "Building for themselves", "Lot status": "Under contract on a lot",
     "Timeline": "Ready now", "Community": "Promontory", "Sq ft": 8500,
     "Finish": "Legacy", "Site": "Moderate", "Project range": "$10.9M – $14.1M",
     "Notes": "Closing on the lot in three weeks. Interviewing three builders.",
     "Why it scored": "Configured $10.9M – $14.1M · Under contract on a lot · Ready now · ASKED TO WALK A LOT"},
    {"Received": "2026-08-29T13:05:00Z", "Tier": "B", "Score": 61,
     "Name": "Mark Delaney", "Email": "mdelaney@example.com", "Phone": "",
     "Wants walk": "", "Role": "Building for themselves", "Lot status": "Actively looking",
     "Timeline": "Within a year", "Community": "Victory Ranch", "Sq ft": 6000,
     "Finish": "Signature", "Site": "Not sure", "Project range": "$5.12M – $6.44M",
     "Notes": "", "Why it scored": "Configured $5.12M – $6.44M · Building for themselves"},
    {"Received": "2026-08-30T11:22:00Z", "Tier": "R", "Score": 34,
     "Name": "Sara Whitfield", "Email": "swhitfield@example.com", "Phone": "435-555-0190",
     "Wants walk": "", "Role": "Agent, here with a client", "Lot status": "Actively looking",
     "Timeline": "Within a year", "Community": "Skyridge", "Sq ft": 5500,
     "Finish": "Refined", "Site": "Moderate", "Project range": "$3.68M – $4.44M",
     "Notes": "Two buyers circling dirt in Skyridge. Would like build ranges I can hand them.",
     "Why it scored": "Agent, here with a client"},
    {"Received": "2026-08-29T16:48:00Z", "Tier": "C", "Score": 27,
     "Name": "Tom Bracken", "Email": "tbracken@example.com", "Phone": "",
     "Wants walk": "", "Role": "Admiring the house", "Lot status": "No lot yet",
     "Timeline": "Exploring", "Community": "No lot chosen", "Sq ft": 4500,
     "Finish": "Refined", "Site": "Not sure", "Project range": "$2.94M – $3.57M",
     "Notes": "", "Why it scored": ""}
  ]}

SHELL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>The Build File — preview</title>
<meta name="theme-color" content="#ECECE4">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&family=Roboto+Serif:opsz,wght@8..144,400&display=swap" rel="stylesheet">
<style>
__CSS__

/* preview chrome only — not part of the real site */
#pvbar{position:sticky;top:0;z-index:60;background:#42403A;color:#ECECE4;
  font-family:var(--sans);font-size:.7rem;letter-spacing:.06em;padding:.55rem 1rem;
  display:flex;gap:.9rem;align-items:center;justify-content:center;flex-wrap:wrap;text-align:center}
#pvbar b{font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#A79E86}
#pvbar a{color:#96BBDA;text-decoration:none;border-bottom:1px solid rgba(150,187,218,.4)}
#pvbar .sp{opacity:.55}
.bar{top:33px}
</style>
</head>
<body>

<div id="pvbar">
  <b>Preview</b>
  <span>Every figure is a placeholder.</span>
  <span class="sp">·</span>
  <a href="#/">Build file</a>
  <a href="#/plan">Plan your build</a>
  <a href="#/owner">Owner console</a>
</div>

<div id="app"></div>

<script>
var PAGES = __PAGES__;
window.MF_DEMO = __DEMO__;
</script>
<script>
__JS__
</script>
<script>
/* Hash router. The deployed site is separate pages; this exists only so the
   whole thing can be reviewed from one file.                                 */
(function () {
  var app = document.getElementById("app");

  function show(name, arg) {
    app.innerHTML = PAGES[name];
    if (name === "home")    renderHome();
    if (name === "station") renderStation(arg);
    if (name === "plan")    renderPlan();
    if (name === "owner")   renderOwner();
    if (window.MF) MF.boot();
    window.scrollTo(0, 0);
  }

  function route() {
    var h = location.hash.replace(/^#\\/?/, "");
    if (h.indexOf("s/") === 0) return show("station", h.slice(2));
    if (h === "plan")  return show("plan");
    if (h === "owner") return show("owner");
    show("home");
  }

  /* Turn the site's real links into hash routes. */
  function toHash(href) {
    if (!href) return null;
    if (href.indexOf("station.html") > -1) {
      var m = href.match(/[?&]s=([^&]+)/);
      return "#/s/" + (m ? m[1] : "arrival");
    }
    if (href.indexOf("plan.html") > -1)  return "#/plan";
    if (href.indexOf("owner.html") > -1) return "#/owner";
    if (href.indexOf("index.html") > -1) return "#/";
    return null;
  }

  window.MF_ROUTE = function (url) {
    var h = toHash(url);
    if (h) { if (location.hash === h) route(); else location.hash = h; }
  };

  document.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest("a");
    if (!a) return;
    var h = toHash(a.getAttribute("href"));
    if (h) { ev.preventDefault(); window.MF_ROUTE(a.getAttribute("href")); }
  });

  window.addEventListener("hashchange", route);
  route();
})();
</script>
</body>
</html>
"""

out = (SHELL
  .replace("__CSS__", inline_assets(CSS))
  .replace("__PAGES__", json.dumps({k: inline_assets(v) for k, v in PAGES.items()}))
  .replace("__DEMO__", json.dumps(DEMO))
  .replace("__JS__", inline_assets(JS)))

os.makedirs("dist", exist_ok=True)
with open("dist/preview.html", "w", encoding="utf-8") as f:
    f.write(out)

# A second copy for publishing as a Claude Artifact, which supplies its own
# document skeleton: title first, then styles and content, no <html>/<body>.
art = out[out.index("<title>"):].replace(
    "<title>The Build File — preview</title>", "<title>The Build File</title>", 1)
art = art[:art.index("</head>")] + art[art.index("<body>") + len("<body>"):]
art = art.replace("</body>\n</html>", "").replace(
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n', "").replace(
    '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&family=Roboto+Serif:opsz,wght@8..144,400&display=swap" rel="stylesheet">\n<style>',
    "<style>\n@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&family=Roboto+Serif:opsz,wght@8..144,400&display=swap');")
art = art.replace('<meta name="theme-color" content="#ECECE4">\n', "")
with open("dist/preview-artifact.html", "w", encoding="utf-8") as f:
    f.write(art)

for name in ("dist/preview.html", "dist/preview-artifact.html"):
    kb = os.path.getsize(name) // 1024
    print("%-28s %.1f MB" % (name, kb / 1024))
    if kb > 16 * 1024:
        sys.exit("Too large to publish. Re-run the photo optimizer at a smaller width.")
print("%d photographs inlined" % len(assets))
