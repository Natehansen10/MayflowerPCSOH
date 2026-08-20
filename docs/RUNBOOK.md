# Runbook

Everything needed to get The Build File live, and how to run it during the seven
days of the showcase. Written for two people who are also building houses.

Total setup time if nothing goes wrong: **about two hours**, plus whatever it
takes to replace the placeholder numbers.

---

## Accounts you need

| What | Cost | Why |
|---|---|---|
| The Google account for `curtis@mayflowerluxuryhomes.com` | already have it | Runs the backend, holds the leads, sends the email. |
| GitHub *(or Cloudflare Pages / Netlify)* | free | Hosts the site. |

That's the whole list. No CRM, no email platform, no form service, no monthly
anything. If a vendor ever disappears, the site is fifteen static files and the
lead data is a spreadsheet you own.

**One real limit to know about:** Google caps how much mail a script can send per
day — **1,500 recipients/day on Google Workspace, but only 100/day on a free
`@gmail.com` account.** Each lead sends one brief plus one alert per owner, so
three emails. On Workspace that's roughly 400 leads a day before you'd hit the
ceiling, which is far more than the showcase will produce. If Mayflower's mail is
*not* on Workspace, set `OWNER_EMAILS` to Curtis only and it goes to about 50
leads a day.

---

## Step 1 — Replace the numbers  *(do this first, it's the long pole)*

Open `docs/NUMBERS-TO-CONFIRM.md`. Every placeholder in the project is listed
there with its file and line. Work top to bottom.

The two files that matter:

- **`assets/js/content.js`** — everything a visitor reads in the house. The
  facts, the cost bands, the honest lines. Get these right or take them out. A
  wrong number on a placard three feet from the thing it describes is worse than
  no placard.
- **`assets/js/pricing.js`** — the math behind the estimator. Read it line by
  line. The defaults are plausible Park City numbers; they are not *your*
  numbers. Curtis should sanity-check by running a build he actually priced
  through the configurator and seeing whether the range lands where it should.

As you replace each value, delete its `// CONFIRM` comment, then run:

```bash
python3 tools/confirm-list.py
```

The checklist shrinks. When it says zero, you're clear.

> **On the honest lines.** Every station has a "What we'd rather you hear from
> us" paragraph — the change orders you ate, the rock you hit, the stair you
> redrew. These are the highest-value words on the whole site and the reason it
> can't be copied by a competitor with a better photographer. Use real stories.
> If a story isn't true, cut the line rather than inventing one.

---

## Step 2 — Put the site online

**Option A — GitHub Pages (free, no new account):**

1. In the repo on github.com: **Settings → Pages → Build and deployment →
   Source: GitHub Actions**. Do this once, before anything else. It is the step
   that has to happen in the browser; nothing else here can do it for you.
2. Push the branch. `.github/workflows/pages.yml` builds and publishes it.
3. Watch the **Actions** tab. The run has two jobs: *build* checks the content
   file and packages the site, *deploy* publishes it.
4. A minute later it's live at `https://<user>.github.io/<repo>/`.

> If a job named *explain* fails, step 1 hasn't been done yet. GitHub does not
> allow a workflow to switch its own repository's Pages source on, so this is
> the one thing that has to be clicked in the browser. The failure prints the
> exact setting. Change it, re-run the workflow from the Actions tab — no new
> commit is needed — and the deploy runs.
>
> If the repository is private, Pages additionally requires a plan that
> includes private Pages sites; making it public is the other way there.

Every later push to that branch republishes automatically. **Regenerate the QR
codes with the live URL** once you have it (Step 4), or the placards will point
somewhere that doesn't exist.

**Option B — Cloudflare Pages or Netlify (free, prettier URL):**

Drag the project folder onto the dashboard's upload area, then point a subdomain
like `buildfile.mayflowerluxuryhomes.com` at it. Do this if you want the URL on
the placards to look like Mayflower.

Either way, **the site must be served over HTTPS** or the offline caching won't
work. Both options give you that automatically.

---

## Step 3 — Stand up the backend

1. Go to <https://sheets.new> and name the spreadsheet **Build File — Showcase 2026**.
2. **Extensions → Apps Script.**
3. Delete the starter `Code.gs` content. Create four files matching
   `backend/apps-script/` — `Config.gs`, `Code.gs`, `Brief.gs`, `Nurture.gs` —
   and paste each one in.
4. Open `Config.gs` and set the emails, Curtis's phone, `BUILD_FILE_URL`, and a
   `CONSOLE_KEY` of your choosing.
5. Run **`setup`** from the function dropdown. Approve the permissions when
   Google asks (it will warn about an unverified app; it's your own script).
6. Run **`testLead`**. Check that a brief arrives in Curtis's inbox and looks
   right on a phone, and that the Leads tab has a row on it.
7. **Deploy → New deployment → Web app.**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Copy the Web app URL.
8. Paste that URL into `assets/js/content.js` as `CONFIG.endpoint`, then
   redeploy the site.

> Any time you edit the Apps Script afterward you must **Deploy → Manage
> deployments → edit → New version**, or the change won't go live.

Test the whole path end to end from your own phone before you print anything.

---

## Step 4 — Print the placards

```bash
pip install segno
python3 tools/make-qr.py https://YOUR-SITE-URL
```

That regenerates every QR code and rebuilds `print/placards.html`: an entry
sign, eight station cards, and an exit card. Open it in Chrome and print to
5×7 heavy stock — a print shop in Kimball Junction can do it in a day on
120lb cover for very little.

Mount them on small brass or matte-black easels. One per station, set close to
the thing it describes and low enough to read without stooping. The mechanical
room card is the one people will remember; give it a real easel, not a table
tent.

**Scan every printed QR code with an actual phone before they go in the house.**

---

## Step 5 — Rehearse

Walk the house with the placards in place and your phone in your hand. Time it.
Look for the two failure modes:

- A card sitting somewhere people don't stop.
- A page that reads like marketing instead of like a builder telling the truth.

Fix the copy in `content.js` and redeploy. It takes two minutes.

---

## During the showcase

**Every morning, before the doors open:** open `owner.html?key=YOUR_CONSOLE_KEY`
on your phone and add it to your home screen. That's the whole dashboard.

**Your job in the house is not to pitch.** The placards do the explaining. Stand
near the mechanical room, and when someone lingers, say one of these:

> "That room is about eighteen percent of the cost of this house. Nobody ever
> photographs it."

> "Scan that. It tells you what it cost and why. Ask me anything it doesn't
> answer."

Then stop talking. The people who ask a follow-up question are the ones worth
your afternoon.

**Twice a day** — lunch and close — open the console:

- **A leads:** call them. Today. Not an email.
- **Anyone who asked to walk a lot:** call them within 24 hours, no exceptions.
  That checkbox is the single strongest buying signal on the whole site.
- **B leads:** leave them to the follow-up drafts.
- Everything else: ignore it until Monday.

**Every morning at 6am** a digest lands in your inbox listing the follow-ups
prepared as Gmail drafts for that day. Read each one, fix anything marked
`[CONFIRM]`, attach what it asks for, and send. Ten minutes with coffee.

---

## After the showcase

The event is the beginning of the sales cycle, not the end. See
`docs/PLAYBOOK.md` for what the next twelve months look like.

Two rules that matter more than anything else on this page:

1. **Never let a Tier A lead go more than 24 hours without a human voice.**
2. **Never let the drafts pile up.** The system is only worth having if the
   drafts get read and sent. A week of ignored drafts is worse than no system,
   because it teaches you to ignore the inbox item.

---

## If something breaks

**Leads aren't arriving.** Check `CONFIG.endpoint` in `content.js` is the Web app
URL. Check the deployment is set to "Anyone". Check the **Errors** tab in the
spreadsheet. Nothing is lost while you fix it — every submission is stored on the
visitor's phone and retried automatically when signal returns.

**No cell service in the house.** Expected, and handled. Pages are cached after
first load and submissions queue on the device. Ask the showcase organizer about
guest wifi; if there is any, put the network name on the entry sign.

**The estimator is producing numbers Curtis doesn't like.** Change
`assets/js/pricing.js` and redeploy. It takes a minute, and it can be done in the
middle of the show.

**Emails aren't sending.** You've likely hit the daily Google quota (see the top
of this page). Set `OWNER_EMAILS` to one address and `AUTO_SEND_BRIEF` stays on.
The leads are still captured either way — only the mail stops.

**Someone abusive or spammy fills the form.** Delete the row. There's no cost to
a bad lead in this system.
