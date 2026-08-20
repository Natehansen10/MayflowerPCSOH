/* Offline harness: stubs enough of the Google Apps Script runtime to run the
   backend end-to-end and prove the logic works before it's pasted into Apps
   Script. Run: node tools/test-backend.js                                    */
const fs = require("fs");

const sheets = {};
function Sheet(name, headers) {
  this.name = name; this.rows = headers ? [headers] : [];
}
Sheet.prototype.appendRow = function (r) { this.rows.push(r); };
Sheet.prototype.getLastRow = function () { return this.rows.length; };
Sheet.prototype.setFrozenRows = function () {};
Sheet.prototype.getRange = function (r, c, nr, nc) {
  const self = this;
  nr = nr || 1; nc = nc || 1;
  return {
    getValues: () => { const o = []; for (let i = 0; i < nr; i++) {
        const row = self.rows[r - 1 + i] || []; o.push(row.slice(c - 1, c - 1 + nc)); } return o; },
    setValues: v => { v.forEach((row, i) => {
        while (self.rows.length < r - 1 + i) self.rows.push([]);
        self.rows[r - 1 + i] = row; }); },
    setValue: v => { const row = self.rows[r - 1] || (self.rows[r - 1] = []); row[c - 1] = v; },
    setFontWeight() { return this; }, setBackground() { return this; },
    setFontColor() { return this; }
  };
};

const mails = [], drafts = [];
global.SpreadsheetApp = {
  getActiveSpreadsheet: () => ({
    getSheetByName: n => sheets[n] || null,
    insertSheet: n => (sheets[n] = new Sheet(n)),
    getUrl: () => "https://docs.google.com/spreadsheets/TEST"
  }),
  getUi: () => ({ alert: m => console.log("[UI ALERT]\n" + m) })
};
global.MailApp = { sendEmail: o => mails.push(o) };
global.GmailApp = { createDraft: (to, subj, body, o) => drafts.push({ to, subj, body, o }) };
global.ContentService = {
  MimeType: { JSON: "json", JAVASCRIPT: "js" },
  createTextOutput: t => ({ setMimeType: () => t })
};
const props = {};
global.PropertiesService = { getScriptProperties: () => ({
  setProperty: (k, v) => (props[k] = v), getProperty: k => props[k] || null }) };
global.ScriptApp = {
  getProjectTriggers: () => [],
  newTrigger: () => ({ timeBased: () => ({ atHour: () => ({ everyDays: () => ({ create() {} }) }) }) })
};

eval(["Config.gs", "Code.gs", "Brief.gs", "Nurture.gs"]
  .map(f => fs.readFileSync(__dirname + "/../backend/apps-script/" + f, "utf8"))
  .join("\n;\n"));

/* --- run ---------------------------------------------------------------- */
console.log("== setup ==");
setup();

console.log("\n== A-tier lead ==");
testLead();

const leads = sheets[SETTINGS.SHEET_LEADS];
console.log("Leads rows:", leads.rows.length - 1);
const row = leads.rows[1];
console.log("Tier:", row[1], "Score:", row[2], "Name:", row[3], "Range:", row[15]);
console.log("Why:", row[19]);

console.log("\nEmails out:", mails.length);
mails.forEach(m => console.log("  ->", m.to, "|", (m.subject || "(no subject)").slice(0, 70)));

const brief = mails.find(m => /build brief/i.test(m.subject || ""));
console.log("\nBrief HTML bytes:", brief.htmlBody.length);
if (/undefined|NaN|\{[a-z]+\}/.test(brief.htmlBody)) {
  console.log("!! BRIEF HAS UNRESOLVED CONTENT");
  console.log(brief.htmlBody.match(/.{0,60}(undefined|NaN|\{[a-z]+\}).{0,60}/g));
} else console.log("Brief clean: no undefined/NaN/unmerged tokens");
fs.writeFileSync("/tmp/brief.html", brief.htmlBody);

console.log("\n== follow-up schedule ==");
const log = sheets[SETTINGS.SHEET_LOG];
log.rows.slice(1).forEach(r =>
  console.log("  " + r[0].toISOString().slice(0, 10) + "  " + r[4] + "  " + r[5]));

console.log("\n== simulate the daily job, one year forward ==");
/* Rather than faking the clock, walk the due dates backwards — this exercises
   the real "is it due yet" branch in dailyFollowUps().                       */
const orig = log.rows.slice(1).map(r => r[0].getTime());
let total = 0;
[2, 5, 15, 46, 91, 151, 241, 331].forEach(d => {
  log.rows.slice(1).forEach((r, i) => { r[0] = new Date(orig[i] - d * 864e5); });
  const before = drafts.length;
  dailyFollowUps();
  const made = drafts.length - before;
  total += made;
  if (made) console.log("  day " + d + ": " + made + " draft(s) — " +
    drafts.slice(before).map(x => x.subj).join(" | "));
});
console.log("Total drafts over the year:", total);

const bad = drafts.filter(d => /\{[a-z]+\}/i.test(d.body) || /undefined/.test(d.body));
console.log(bad.length ? "!! unmerged tokens in: " + bad.map(b => b.subj) : "All merge fields resolved.");
console.log("\nSample draft:\n----------------\n" + drafts[0].subj + "\n\n" + drafts[0].body + "\n----------------");
console.log("\nDigest emails to owners:", mails.filter(m => /Follow-ups for today/.test(m.subject || "")).length);

console.log("\n== duplicate submission (retry from a queued phone) ==");
const n0 = leads.rows.length;
handleLead({ id: leads.rows[1][24], answers: {}, est: {}, email: "x@y.com" });
console.log("Rows before/after:", n0 - 1, "/", leads.rows.length - 1, leads.rows.length === n0 ? "— deduped OK" : "— !! DUPLICATED");

console.log("\n== agent + trade routing ==");
[["agent","exploring","none"],["industry","exploring","none"],["self","12mo","looking"]].forEach(([role,tl,lot]) => {
  const s = scoreServerSide({ answers:{role,timeline:tl,lotStatus:lot}, est:{totalLow:3.2e6,totalHigh:4.1e6,totalRange:"$3.2M – $4.1M"} });
  console.log("  " + role.padEnd(10), "->", s.tier, s.score);
});

console.log("\n== console endpoint ==");
const r = doGet({ parameter: { key: SETTINGS.CONSOLE_KEY } });
const parsed = JSON.parse(r);
console.log("ok:", parsed.ok, "| leads:", parsed.leads.length, "| stats:", JSON.stringify(parsed.stats));
console.log("unauthorized:", JSON.parse(doGet({ parameter: { key: "wrong" } })).error);

console.log("\n== errors logged ==", (sheets.Errors ? sheets.Errors.rows.length - 1 : 0));
if (sheets.Errors) sheets.Errors.rows.slice(1).forEach(r => console.log("  !!", r[1], r[2]));
