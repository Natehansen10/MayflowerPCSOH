/**
 * THE BUILD FILE — MAIN BACKEND
 * ---------------------------------------------------------------------------
 * A Google Apps Script bound to a Google Sheet. Free. No third-party service.
 *
 * What it does:
 *   1. Receives every submission from the Build File site.
 *   2. Scores it and writes it to the Leads sheet.
 *   3. Emails the prospect their Preliminary Build Brief.
 *   4. Alerts Curtis and Dave immediately on a live prospect.
 *   5. Schedules a months-long follow-up cadence and prepares each email as a
 *      Gmail draft on the day it is due.
 *
 * Setup: see docs/RUNBOOK.md. Run setup() once, then Deploy > New deployment >
 * Web app > Execute as ME > Who has access: ANYONE.
 */

var LEAD_HEADERS = [
  "Received", "Tier", "Score", "Name", "Email", "Phone",
  "Wants walk", "Skyridge lots", "Role", "Lot status", "Timeline",
  "Community", "Sq ft", "Finish", "Site", "Project range", "Months",
  "Saved details", "Notes", "Why it scored", "Status", "Owner", "Next touch", "Last touch", "ID"
];

/* ===========================================================================
   ENTRY POINTS
   ======================================================================== */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.type === "config") { recordSignal(data); return ok({ ok: true }); }
    return ok(handleLead(data));
  } catch (err) {
    logError("doPost", err, e && e.postData ? e.postData.contents : "");
    return ok({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.key !== SETTINGS.CONSOLE_KEY) {
    return wrap(p.callback, { ok: false, error: "unauthorized" });
  }
  return wrap(p.callback, { ok: true, leads: readLeads(200), stats: quickStats() });
}

function ok(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function wrap(callback, obj) {
  if (callback) {
    return ContentService.createTextOutput(callback + "(" + JSON.stringify(obj) + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ok(obj);
}

/* ===========================================================================
   LEADS
   ======================================================================== */

function handleLead(d) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = sheetNamed(ss, SETTINGS.SHEET_LEADS, LEAD_HEADERS);

  // Idempotent: the site retries queued submissions, so the same lead can
  // legitimately arrive more than once.
  if (d.id && findRowById(sheet, d.id)) return { ok: true, duplicate: true };

  var scored = scoreServerSide(d);
  var a = d.answers || {};
  var est = d.est || {};

  var row = [
    new Date(),
    scored.tier,
    scored.score,
    d.name || "",
    d.email || "",
    d.phone || "",
    d.wantsWalk ? "YES" : "",
    d.wantsLots ? "yes" : "",
    label(ROLES, a.role),
    label(LOT_STATUS, a.lotStatus),
    label(TIMELINES, a.timeline),
    label(COMMUNITIES, a.community),
    est.sqft || a.sqft || "",
    est.tier || a.tier || "",
    est.site || a.site || "",
    est.totalRange || "",
    est.monthsLow ? est.monthsLow + "-" + est.monthsHigh : "",
    (d.saved || []).join(", "),
    d.notes || "",
    (scored.why || []).join(" · "),
    "New",
    "",
    "",
    "",
    d.id || ""
  ];
  sheet.appendRow(row);
  formatLastRow(sheet, scored.tier);

  try { if (d.email) sendBrief(d, scored); } catch (err) { logError("sendBrief", err, d.email); }
  try { alertOwners(d, scored); }           catch (err) { logError("alertOwners", err, d.email); }
  try { scheduleFollowUps(d, scored); }     catch (err) { logError("scheduleFollowUps", err, d.email); }

  return { ok: true, tier: scored.tier };
}

function recordSignal(d) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = sheetNamed(ss, SETTINGS.SHEET_SIGNALS,
    ["When", "Community", "Sq ft", "Finish", "Site", "Lot status", "Timeline", "Role", "Range", "Score"]);
  var a = d.answers || {}, est = d.est || {};
  sheet.appendRow([
    new Date(), label(COMMUNITIES, a.community), est.sqft || a.sqft || "",
    est.tier || a.tier || "", est.site || a.site || "",
    label(LOT_STATUS, a.lotStatus), label(TIMELINES, a.timeline), label(ROLES, a.role),
    est.totalRange || "", d.score || ""
  ]);
}

/* ===========================================================================
   SCORING — mirrors assets/js/pricing.js. Keep the two in step.
   ======================================================================== */

var ROLES = {
  "self": ["Building for themselves", 25],
  "agent-client": ["Agent, here with a client", 16],
  "agent": ["Real estate agent", 6],
  "industry": ["In the trade", 0],
  "admiring": ["Admiring the house", 0]
};
var LOT_STATUS = {
  "own": ["Owns the lot", 25], "contract": ["Under contract on a lot", 22],
  "looking": ["Actively looking", 12], "none": ["No lot yet", 3]
};
var TIMELINES = {
  "now": ["Ready now", 25], "6mo": ["Within six months", 20],
  "12mo": ["Within a year", 12], "exploring": ["Exploring", 4]
};
var COMMUNITIES = {
  "skyridge": ["Skyridge", 0], "promontory": ["Promontory", 0], "victory": ["Victory Ranch", 0],
  "deervalley": ["Deer Valley / Empire Pass", 0], "tuhaye": ["Tuhaye / Hideout", 0],
  "oldtown": ["Old Town Park City", 0], "other": ["Wasatch Back", 0], "unknown": ["No lot chosen", 0]
};

function label(map, key) { return (map[key] && map[key][0]) || (key || ""); }
function pts(map, key)   { return (map[key] && map[key][1]) || 0; }

function scoreServerSide(d) {
  var a = d.answers || {}, est = d.est || {};
  var score = 0, why = [];

  var mid = ((est.totalLow || 0) + (est.totalHigh || 0)) / 2;
  var bp = 0;
  if      (mid >= 8000000) bp = 35;
  else if (mid >= 5500000) bp = 30;
  else if (mid >= 4000000) bp = 24;
  else if (mid >= 2750000) bp = 16;
  else if (mid >= 1500000) bp = 8;
  if (bp) { score += bp; why.push("Configured " + (est.totalRange || "")); }

  score += pts(ROLES, a.role);
  if (pts(ROLES, a.role) >= 16) why.push(label(ROLES, a.role));
  score += pts(LOT_STATUS, a.lotStatus);
  if (pts(LOT_STATUS, a.lotStatus) >= 22) why.push(label(LOT_STATUS, a.lotStatus));
  score += pts(TIMELINES, a.timeline);
  if (pts(TIMELINES, a.timeline) >= 20) why.push(label(TIMELINES, a.timeline));

  if (d.wantsWalk) { score += 15; why.push("ASKED TO WALK A LOT"); }
  if (d.phone)     { score += 5; }
  var saved = (d.saved || []).length;
  if (saved) { score += Math.min(saved * 2, 10); if (saved >= 3) why.push("Saved " + saved + " details"); }
  if (d.notes && d.notes.length > 40) { score += 5; why.push("Wrote a real note"); }

  score = Math.max(0, Math.min(100, Math.round(score)));

  var tier = "C";
  if (a.role === "industry") tier = "T";
  else if (a.role === "agent" || a.role === "agent-client") tier = score >= 55 ? "B" : "R";
  else if (score >= 70) tier = "A";
  else if (score >= 45) tier = "B";

  return { score: score, tier: tier, why: why };
}

/* ===========================================================================
   OWNER ALERTS
   ======================================================================== */

function alertOwners(d, s) {
  if (s.tier !== "A" && s.tier !== "B") return;
  var a = d.answers || {}, est = d.est || {};

  var subject = (s.tier === "A" ? "LIVE PROSPECT" : "Good lead") + " — " +
    (d.name || "unknown") + " · " + (est.totalRange || "") + (d.wantsWalk ? " · WANTS A WALK" : "");

  var body =
    (d.name || "") + "  (" + s.tier + " / " + s.score + ")\n" +
    (d.email || "") + (d.phone ? "   " + d.phone : "") + "\n\n" +
    "Configured: " + (est.sqft || "") + " sf, " + (est.tier || "") + " finish, " +
    label(COMMUNITIES, a.community) + ", " + (est.site || "") + " site\n" +
    "Range: " + (est.totalRange || "") + " over " + (est.monthsLow || "") + "-" + (est.monthsHigh || "") + " months\n" +
    "Lot: " + label(LOT_STATUS, a.lotStatus) + "\n" +
    "Timeline: " + label(TIMELINES, a.timeline) + "\n" +
    "Role: " + label(ROLES, a.role) + "\n" +
    (d.wantsWalk ? "\n>>> ASKED TO WALK A LOT OR A HOME. Call within 24 hours. <<<\n" : "") +
    ((d.saved || []).length ? "\nSaved details: " + d.saved.join(", ") + "\n" : "") +
    (d.notes ? "\nTheir note:\n" + d.notes + "\n" : "") +
    "\nWhy it scored: " + (s.why || []).join(" · ") +
    "\n\nSpreadsheet: " + SpreadsheetApp.getActiveSpreadsheet().getUrl();

  SETTINGS.OWNER_EMAILS.forEach(function (to) {
    if (to) MailApp.sendEmail({ to: to, subject: subject, body: body, name: "Build File" });
  });

  if (SETTINGS.OWNER_SMS && s.tier === "A") {
    MailApp.sendEmail({
      to: SETTINGS.OWNER_SMS,
      subject: "",
      body: "A-lead: " + (d.name || "") + " " + (d.phone || d.email || "") + " " +
            (est.totalRange || "") + (d.wantsWalk ? " WANTS WALK" : "")
    });
  }
}

/* ===========================================================================
   SHEET PLUMBING
   ======================================================================== */

function sheetNamed(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold").setBackground("#42403A").setFontColor("#ECECE4");
    sh.setFrozenRows(1);
  }
  return sh;
}

function findRowById(sheet, id) {
  var idCol = LEAD_HEADERS.indexOf("ID") + 1;
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var vals = sheet.getRange(2, idCol, last - 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) if (vals[i][0] === id) return i + 2;
  return 0;
}

function formatLastRow(sheet, tier) {
  var r = sheet.getLastRow();
  var colors = { A: "#836F4E", B: "#96865F", C: "#ECECE4", R: "#96BBDA", T: "#EEEDE5" };
  var rng = sheet.getRange(r, 2, 1, 2);
  rng.setBackground(colors[tier] || "#ECECE4");
  if (tier === "A" || tier === "B") rng.setFontColor("#FFFFFF").setFontWeight("bold");
}

function readLeads(limit) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETTINGS.SHEET_LEADS);
  if (!sh || sh.getLastRow() < 2) return [];
  var n = Math.min(limit, sh.getLastRow() - 1);
  var start = sh.getLastRow() - n + 1;
  var vals = sh.getRange(start, 1, n, LEAD_HEADERS.length).getValues();
  return vals.map(function (r) {
    var o = {};
    LEAD_HEADERS.forEach(function (h, i) {
      o[h] = (r[i] instanceof Date) ? r[i].toISOString() : r[i];
    });
    return o;
  }).reverse();
}

function quickStats() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETTINGS.SHEET_LEADS);
  var out = { total: 0, A: 0, B: 0, C: 0, R: 0, T: 0, walks: 0 };
  if (!sh || sh.getLastRow() < 2) return out;
  var vals = sh.getRange(2, 2, sh.getLastRow() - 1, 6).getValues();  // Tier..Wants walk
  vals.forEach(function (r) {
    out.total++;
    if (out[r[0]] !== undefined) out[r[0]]++;
    if (r[5] === "YES") out.walks++;
  });
  return out;
}

function logError(where, err, extra) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = sheetNamed(ss, "Errors", ["When", "Where", "Error", "Detail"]);
    sh.appendRow([new Date(), where, String(err), String(extra).slice(0, 500)]);
  } catch (e) {}
}

/* ===========================================================================
   ONE-TIME SETUP
   ======================================================================== */

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  sheetNamed(ss, SETTINGS.SHEET_LEADS, LEAD_HEADERS);
  sheetNamed(ss, SETTINGS.SHEET_SIGNALS,
    ["When", "Community", "Sq ft", "Finish", "Site", "Lot status", "Timeline", "Role", "Range", "Score"]);
  sheetNamed(ss, SETTINGS.SHEET_LOG,
    ["Due", "Email", "Name", "Tier", "Touch", "Subject", "Status", "Prepared"]);
  sheetNamed(ss, "Errors", ["When", "Where", "Error", "Detail"]);

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "dailyFollowUps") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("dailyFollowUps").timeBased().atHour(6).everyDays(1).create();

  SpreadsheetApp.getUi().alert(
    "Build File is set up.\n\n" +
    "Sheets created and the daily follow-up job is scheduled for 6am.\n\n" +
    "Next: Deploy > New deployment > Web app, execute as yourself, access " +
    "\"Anyone\", then paste the URL into assets/js/content.js as CONFIG.endpoint."
  );
}

function testLead() {
  handleLead({
    id: "test-" + Date.now(), type: "lead",
    name: "Test Prospect", email: SETTINGS.REPLY_TO, phone: "435-555-0199",
    wantsWalk: true, wantsLots: true,
    notes: "We own a lot in Skyridge and have schematic drawings from our architect. Looking to break ground next spring.",
    answers: { community: "skyridge", sqft: 7100, tier: "signature", site: "moderate",
               lotStatus: "own", timeline: "6mo", role: "self" },
    saved: ["mechanical", "great-room", "site"],
    est: { sqft: 7100, tier: "Signature", community: "Skyridge", site: "Moderate", psf: "650-800",
           totalLow: 5920000, totalHigh: 7440000, siteLow: 420000, siteHigh: 640000,
           softLow: 554000, softHigh: 695000, contLow: 353000, contHigh: 443000,
           hardLow: 5040000, hardHigh: 6320000,
           totalRange: "$5.92M – $7.44M", monthsLow: 22, monthsHigh: 29, buildMonths: 16 }
  });
}
