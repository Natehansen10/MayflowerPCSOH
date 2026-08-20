/**
 * THE NURTURE ENGINE
 * ---------------------------------------------------------------------------
 * A $6.5M custom home takes six to eighteen months to sell. The showcase is
 * the top of that funnel, not the end of it. This is the part that wins the
 * contract — and the part a two-person company reliably forgets to do.
 *
 * How it works: on capture, a cadence of follow-ups is scheduled by date. Every
 * morning at 6am the due ones are turned into Gmail DRAFTS in Curtis's voice,
 * personalized with what that person actually configured, and a digest lands in
 * his inbox listing what to send and who to call. He reads, edits a line, hits
 * send. Two minutes a day, all year.
 *
 * Nothing is sent to a prospect automatically unless SETTINGS.NURTURE_MODE is
 * changed to "send". Draft mode is strongly recommended: at this price point a
 * prospect can tell the difference between a person and a sequence.
 *
 * >>> EVERY TEMPLATE BELOW IS A DRAFT FOR CURTIS TO APPROVE. Anything marked
 * >>> [CONFIRM] needs a real fact, number, or decision before first use.
 */

var CADENCE = {
  A: [1, 4, 14, 45, 90, 150, 240, 330],
  B: [2, 21, 60, 120, 210, 330],
  C: [3, 45, 120, 240],
  R: [2, 30, 90, 180],
  T: []
};

var TOUCHES = {

  /* ---- Tier A — live prospect ------------------------------------------- */
  "A-1": {
    subject: "Following up from the showcase",
    body:
      "{first},\n\n" +
      "Thanks for going through the build file on Saturday. You laid out {sqft} sf in {community} " +
      "at the {tier} level, which put you in the {range} range.\n\n" +
      "{walkline}\n\n" +
      "Either way, the most useful hour I can give you is standing on the lot. Bring the plans if you have " +
      "them, or nothing at all. What day works?\n\n" +
      "Thanks.\nCurtis"
  },
  "A-2": {
    subject: "The allowance schedule I mentioned",
    body:
      "{first},\n\n" +
      "Attached is the allowance schedule from a home we finished in Skyridge this year, with the owner's " +
      "name taken off. [CONFIRM: attach the redacted schedule before sending.]\n\n" +
      "Look at what each line actually buys. Most of the cost overruns you hear about in custom homes start " +
      "as an allowance that was set low to win the job. Compare this against anything else you're given.\n\n" +
      "Happy to walk you through any line on it.\n\n" +
      "Thanks.\nCurtis"
  },
  "A-3": {
    subject: "How we handle the money",
    body:
      "{first},\n\n" +
      "One thing worth knowing before you talk to anyone else.\n\n" +
      "We bill monthly on a draw, with every subcontractor invoice attached as backup and our fee shown as " +
      "its own line. You see what each trade charged us. Lien releases come with each draw, so you always " +
      "know the job is clear.\n\n" +
      "On a home in your range that's about {buildMonths} draws. I've attached a sample so you can see what " +
      "one looks like. [CONFIRM: attach a sample draw sheet.]\n\n" +
      "Thanks.\nCurtis"
  },
  "A-4": {
    subject: "What went wrong on the showcase house",
    body:
      "{first},\n\n" +
      "We hit rock at six feet on the showcase lot. It added about $80,000 and eleven days. " +
      "[CONFIRM: real figures.]\n\n" +
      "The owner knew the day we found it, with three options and what each one cost. Not on the next draw, " +
      "and not at the end.\n\n" +
      "Every mountain build has one of these. The only question is whether your builder tells you the day it " +
      "happens. Ask anyone you're considering how they handled the last one.\n\n" +
      "Thanks.\nCurtis"
  },
  "A-5": {
    subject: "Lots",
    body:
      "{first},\n\n" +
      "[CONFIRM: replace with what is actually available and worth mentioning right now.]\n\n" +
      "If you want, I'll walk two or three of them with you in an afternoon and tell you what each one would " +
      "cost to build on. That number moves more than anything you'd pick inside the house.\n\n" +
      "Let me know what week works.\n\n" +
      "Thanks.\nCurtis"
  },
  "A-6": {
    subject: "If you want to be in for the {season} season",
    body:
      "{first},\n\n" +
      "Working backward from a {season} move-in: about {buildMonths} months of construction, two to four " +
      "months of permitting and bidding before that, and four to seven months of design before that.\n\n" +
      "That means design has to start by roughly {designStart} to make it. I'm not trying to rush you. " +
      "I'd rather tell you the date than have you find out you missed it.\n\n" +
      "If that timeline still works for you, let's get an hour on the calendar.\n\n" +
      "Thanks.\nCurtis"
  },
  "A-7": {
    subject: "Three people who can tell you what we're like",
    body:
      "{first},\n\n" +
      "If you're getting close to picking a builder, call our last three owners directly. Not a reference " +
      "list we curated. The last three, in order. [CONFIRM: get their permission first, then list names " +
      "and numbers here.]\n\n" +
      "Ask them what went wrong and how we handled it. That's the only question that matters.\n\n" +
      "Thanks.\nCurtis"
  },
  "A-8": {
    subject: "A year since the showcase",
    body:
      "{first},\n\n" +
      "It's been a year since you walked the Skyridge house. We finished another one down the road that I " +
      "think is closer to what you described. [CONFIRM: which home.]\n\n" +
      "If you're still thinking about building, I'd be glad to walk you through it. If you've moved on or " +
      "gone another direction, tell me and I'll stop emailing you. No hard feelings either way.\n\n" +
      "Thanks.\nCurtis"
  },

  /* ---- Tier B — real, not yet urgent ------------------------------------ */
  "B-1": {
    subject: "Your build brief",
    body:
      "{first},\n\n" +
      "Thanks for spending time with the build file at the showcase. Your brief should have come through. " +
      "{sqft} sf in {community}, {range}.\n\n" +
      "No rush on our end. When you get closer, the most useful thing I can do is walk the lot with you " +
      "before you commission a design. That hour is free and it's where the budget actually gets set.\n\n" +
      "I'll send you something worth reading every couple of months in the meantime.\n\n" +
      "Thanks.\nCurtis"
  },
  "B-2": {
    subject: "The mechanical room",
    body:
      "{first},\n\n" +
      "The thing most people miss when they compare builders: about eighteen cents of every dollar in a " +
      "mountain home at this elevation goes into systems nobody photographs. Hydronic heat, snowmelt, air " +
      "handling, water treatment, backup power.\n\n" +
      "When a bid comes in surprisingly low here, that's almost always where the money came out. It doesn't " +
      "show up until the first February.\n\n" +
      "Worth asking about on any bid you get, including ours.\n\n" +
      "Thanks.\nCurtis"
  },
  "B-3": {
    subject: "What the ground costs",
    body:
      "{first},\n\n" +
      "Two identical houses on two different lots in the same community can differ by seven figures before " +
      "anyone picks a countertop. Slope, rock, access, utility runs, retaining, drainage.\n\n" +
      "If you're looking at lots, walk them with a builder before you buy one. I'll do it for free whether " +
      "or not you ever build with us. It's the cheapest hour anyone spends on a custom home.\n\n" +
      "Thanks.\nCurtis"
  },
  "B-4": {
    subject: "Where costs are this year",
    body:
      "{first},\n\n" +
      "[CONFIRM: one honest paragraph on what's actually happening with labor, materials and trade " +
      "availability in the Wasatch Back right now, with a real number in it.]\n\n" +
      "The range I sent you in the fall is still roughly right for what you described, adjusted for the " +
      "above. If you want an updated one, say the word.\n\n" +
      "Thanks.\nCurtis"
  },
  "B-5": {
    subject: "Still thinking about it?",
    body:
      "{first},\n\n" +
      "It's been about seven months since the showcase. Are you still planning to build?\n\n" +
      "If yes, I'd like to get an hour with you before you're too far into design. That's when I can " +
      "actually save you money. If not, just tell me and I'll take you off the list.\n\n" +
      "Thanks.\nCurtis"
  },
  "B-6": {
    subject: "A year on",
    body:
      "{first},\n\n" +
      "A year since the Park City showcase. If building is still on the table, I'd be glad to pick it back " +
      "up. If it isn't, tell me and I'll stop.\n\n" +
      "Thanks.\nCurtis"
  },

  /* ---- Tier C — early ---------------------------------------------------- */
  "C-1": {
    subject: "Your build brief",
    body:
      "{first},\n\n" +
      "Thanks for going through the build file. Your brief is in your inbox.\n\n" +
      "If you ever get to the point of looking at lots or talking to an architect, call me before you do " +
      "either one. That's the moment I'm actually useful.\n\n" +
      "Thanks.\nCurtis"
  },
  "C-2": {
    subject: "What a custom home actually costs here",
    body:
      "{first},\n\n" +
      "[CONFIRM: a short, genuinely useful piece on Park City build costs, what the per-square-foot " +
      "numbers include and what they don't.]\n\n" +
      "No pitch. If it's useful, keep it.\n\n" +
      "Thanks.\nCurtis"
  },
  "C-3": {
    subject: "Before you buy a lot",
    body:
      "{first},\n\n" +
      "If you're anywhere near buying a lot up here, walk it with a builder first. Slope, rock and access " +
      "will move your build budget more than anything you choose inside the house.\n\n" +
      "I'll do it for free whether or not you ever build with us.\n\n" +
      "Thanks.\nCurtis"
  },
  "C-4": {
    subject: "Should I keep emailing you?",
    body:
      "{first},\n\n" +
      "It's been about eight months since the showcase. If building in Park City is still something you're " +
      "thinking about, I'll keep sending you the occasional useful thing. If it isn't, reply with one word " +
      "and I'll take you off the list.\n\n" +
      "Thanks.\nCurtis"
  },

  /* ---- Agents ------------------------------------------------------------ */
  "R-1": {
    subject: "Good to meet you at the showcase",
    body:
      "{first},\n\n" +
      "Thanks for coming through the Skyridge house.\n\n" +
      "If you have a buyer looking at dirt, I'm glad to walk lots with them and give a real build range " +
      "before they write an offer. It usually helps the deal. Most buyers stall because nobody will tell " +
      "them what building on it will actually cost.\n\n" +
      "[CONFIRM: how you want to describe working with agents on referrals.]\n\n" +
      "Send them my way any time.\n\n" +
      "Thanks.\nCurtis"
  },
  "R-2": {
    subject: "Build ranges for your lot listings",
    body:
      "{first},\n\n" +
      "Offer that stands: send me any lot you have listed or are showing, and I'll give you a build range " +
      "for it you can hand a buyer. No charge and no obligation on either side.\n\n" +
      "It answers the question that kills most lot deals.\n\n" +
      "Thanks.\nCurtis"
  },
  "R-3": {
    subject: "What we've got going",
    body:
      "{first},\n\n" +
      "[CONFIRM: two lines on current projects, anything nearing completion a buyer could see, and any " +
      "capacity for next year.]\n\n" +
      "If you've got someone circling a lot, let's walk it.\n\n" +
      "Thanks.\nCurtis"
  },
  "R-4": {
    subject: "Still worth staying in touch",
    body:
      "{first},\n\n" +
      "Checking whether you've got anyone building. Same offer as before. Send me a lot, I'll give you a " +
      "range your buyer can use.\n\n" +
      "Thanks.\nCurtis"
  }
};

/* ===========================================================================
   SCHEDULING
   ======================================================================== */

function scheduleFollowUps(d, s) {
  var days = CADENCE[s.tier] || [];
  if (!days.length || SETTINGS.NURTURE_MODE === "off" || !d.email) return;

  var sh = sheetNamed(SpreadsheetApp.getActiveSpreadsheet(), SETTINGS.SHEET_LOG,
    ["Due", "Email", "Name", "Tier", "Touch", "Subject", "Status", "Prepared"]);

  var rows = days.map(function (offset, i) {
    var key = s.tier + "-" + (i + 1);
    var t = TOUCHES[key];
    if (!t) return null;
    var due = new Date();
    due.setDate(due.getDate() + offset);
    return [due, d.email, d.name || "", s.tier, key, merge(t.subject, d, s), "Scheduled", ""];
  }).filter(function (r) { return r; });

  if (rows.length) {
    sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }
  storeLead(d, s);
}

/* The follow-up sheet holds only what's needed to send. The lead details used
   for merge fields are stashed in script properties, keyed by email.         */
function storeLead(d, s) {
  try {
    PropertiesService.getScriptProperties().setProperty(
      "lead:" + d.email.toLowerCase(),
      JSON.stringify({ name: d.name, answers: d.answers, est: d.est, saved: d.saved,
                       wantsWalk: d.wantsWalk, notes: d.notes, tier: s.tier, at: new Date().toISOString() })
    );
  } catch (e) { logError("storeLead", e, d.email); }
}

function loadLead(email) {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty("lead:" + String(email).toLowerCase());
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

/* ===========================================================================
   THE DAILY JOB
   ======================================================================== */

function dailyFollowUps() {
  if (SETTINGS.NURTURE_MODE === "off") return;

  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETTINGS.SHEET_LOG);
  if (!sh || sh.getLastRow() < 2) return;

  var n = sh.getLastRow() - 1;
  var vals = sh.getRange(2, 1, n, 8).getValues();
  var today = new Date(); today.setHours(23, 59, 59);
  var prepared = [];

  for (var i = 0; i < vals.length; i++) {
    var r = vals[i];
    if (r[6] !== "Scheduled") continue;
    if (!(r[0] instanceof Date) || r[0] > today) continue;

    var email = r[1], name = r[2], tier = r[3], key = r[4];
    var t = TOUCHES[key];
    if (!t) { sh.getRange(i + 2, 7).setValue("No template"); continue; }

    var lead = loadLead(email);
    var d = { name: name || lead.name, email: email, answers: lead.answers, est: lead.est,
              saved: lead.saved, wantsWalk: lead.wantsWalk };
    var subject = merge(t.subject, d, { tier: tier });
    var body = merge(t.body, d, { tier: tier });

    try {
      if (SETTINGS.NURTURE_MODE === "send") {
        MailApp.sendEmail({ to: email, subject: subject, body: body,
                            name: SETTINGS.FROM_NAME, replyTo: SETTINGS.REPLY_TO });
        sh.getRange(i + 2, 7).setValue("Sent");
      } else {
        GmailApp.createDraft(email, subject, body, { name: SETTINGS.FROM_NAME });
        sh.getRange(i + 2, 7).setValue("Drafted");
      }
      sh.getRange(i + 2, 8).setValue(new Date());
      prepared.push({ name: d.name, email: email, tier: tier, subject: subject,
                      range: (lead.est && lead.est.totalRange) || "", walk: lead.wantsWalk });
    } catch (err) {
      logError("dailyFollowUps", err, email);
      sh.getRange(i + 2, 7).setValue("Failed");
    }
  }

  if (prepared.length) sendDigest(prepared);
}

function sendDigest(items) {
  var mode = SETTINGS.NURTURE_MODE === "send" ? "sent" : "waiting in your Gmail drafts";
  var lines = items.map(function (p) {
    return "  " + p.tier + "  " + (p.name || p.email) + (p.range ? "  (" + p.range + ")" : "") +
      (p.walk ? "  [asked to walk a lot]" : "") + "\n      " + p.subject;
  }).join("\n\n");

  var body =
    items.length + " follow-up" + (items.length === 1 ? "" : "s") + " " + mode + " this morning.\n\n" +
    lines + "\n\n" +
    "Read them before they go. Anything marked [CONFIRM] needs a real number or a real attachment.\n\n" +
    SpreadsheetApp.getActiveSpreadsheet().getUrl();

  SETTINGS.OWNER_EMAILS.forEach(function (to) {
    if (to) MailApp.sendEmail({ to: to, subject: "Follow-ups for today (" + items.length + ")",
                                body: body, name: "Build File" });
  });
}

/* ===========================================================================
   MERGE FIELDS
   ======================================================================== */

function merge(tpl, d, s) {
  var e = (d && d.est) || {}, a = (d && d.answers) || {};
  var first = String((d && d.name) || "").trim().split(" ")[0] || "there";

  var now = new Date();
  var season = (now.getMonth() >= 3 && now.getMonth() <= 8) ? "ski" : "summer";
  var designStart = new Date(now.getTime());
  designStart.setMonth(designStart.getMonth() + 2);
  var months = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

  var walkline = (d && d.wantsWalk)
    ? "You asked to walk a lot. I'd like to do that. An hour, no charge, and I'll tell you straight if I think a lot is a mistake."
    : "The one thing I'd offer: bring me a lot, or a lot you're considering, and I'll walk it with you and give you a real range before you spend anything on design.";

  var map = {
    "{first}": first,
    "{sqft}": e.sqft ? Number(e.sqft).toLocaleString() : "the size you described",
    "{tier}": e.tier || "the level",
    "{community}": label(COMMUNITIES, a.community) || "Park City",
    "{range}": e.totalRange || "the range we sent",
    "{months}": e.monthsLow ? (e.monthsLow + " to " + e.monthsHigh) : "twenty-some",
    "{buildMonths}": e.buildMonths || "sixteen",
    "{walkline}": walkline,
    "{season}": season,
    "{designStart}": months[designStart.getMonth()] + " " + designStart.getFullYear()
  };

  var out = String(tpl);
  Object.keys(map).forEach(function (k) {
    out = out.split(k).join(map[k]);
  });
  return out;
}
