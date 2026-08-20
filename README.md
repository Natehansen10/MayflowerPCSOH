# The Build File

A mobile experience for the **Park City Showcase of Homes 2026**, built to move a
small number of very qualified prospects from *walked through the house* toward
*under contract to build with Mayflower.*

The idea in one line: **most builders hand you a brochure — hand them the file
instead.** Eight decisions in the showcase home, each with its real cost, the
reasoning behind it, and what went wrong. Then let a visitor configure their own
build and see a real range, a real schedule, and what the money actually does.

The strategy behind it is in **[docs/PLAYBOOK.md](docs/PLAYBOOK.md)**.
Setup and operating instructions are in **[docs/RUNBOOK.md](docs/RUNBOOK.md)**.

---

## What's here

**In the house** — eight printed placards, each with its own QR code, set beside
the thing it describes. Including the mechanical room, with a price on it.

**On the phone** — a station page per placard: the decision, the cost band, the
trade partner, and a "what we'd rather you hear from us" paragraph about what
went wrong. Visitors can save details to their file as they walk.

**Before they leave** — *Plan Your Build*: six questions producing a preliminary
cost range, a design-to-move-in schedule, and a month-by-month draw curve.
Preliminary and clearly labeled as such, which is still more than any competitor
will tell them before a contract.

**After** — every submission is scored and tiered, the prospect gets a
personalized brief within a minute, the owners get an alert on a live one, and a
months-long follow-up cadence is scheduled. Each morning the day's touches are
prepared as Gmail drafts in Curtis's voice, with a digest of who to call.

---

## Files

```
index.html            The build file: hero, the eight stations, who built it
station.html          One station, driven by ?s=<slug>
plan.html             The configurator, the brief, and the capture
owner.html            Owner console — who to call, on a phone. ?key=…
sw.js                 Offline cache. The house may have no signal.

assets/js/content.js  >> Everything visitors read. Edit this one.
assets/js/pricing.js  >> The estimator's math. Confirm before going live.
assets/js/plan.js     Configurator logic, brief rendering, capture
assets/js/core.js     Storage, submission, offline queue, retry
assets/css/app.css    Mayflower brand palette and type

backend/apps-script/  Google Apps Script backend (free, no third-party service)
  Config.gs           >> Emails, phone, console key. Edit this one.
  Code.gs             Intake, scoring, sheet writes, owner alerts
  Brief.gs            The prospect's Preliminary Build Brief email
  Nurture.gs          The follow-up cadence and the daily draft job

print/placards.html   Print-ready placards, generated
print/qr/             Generated QR codes

tools/make-qr.py      Regenerate the QR codes and placards for a given site URL
tools/confirm-list.py Regenerate the checklist of placeholder numbers
tools/test-backend.js Run the whole backend offline, without Google

docs/RUNBOOK.md       Setup, showcase-week operations, troubleshooting
docs/PLAYBOOK.md      Why it's built this way, and the twelve months after
docs/NUMBERS-TO-CONFIRM.md   Generated. Every placeholder figure, by file and line.
```

---

## Before it goes live

**The numbers in this repo are placeholders.** They are realistic for a Park City
custom home at this level and none of them are Mayflower's actual figures.

```bash
python3 tools/confirm-list.py     # what still needs a real number
```

Work that list to zero. Then follow `docs/RUNBOOK.md`.

## Running it locally

```bash
python3 -m http.server 8099       # then open http://localhost:8099
node tools/test-backend.js        # exercises the backend with no Google account
```

## What it costs to run

Nothing. Static hosting on GitHub Pages or Cloudflare Pages, and a Google Apps
Script bound to a spreadsheet you already own. No CRM, no email platform, no form
service, no subscription that can quietly lapse and take the lead list with it.
