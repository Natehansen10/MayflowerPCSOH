/**
 * THE PRELIMINARY BUILD BRIEF
 * ---------------------------------------------------------------------------
 * What the prospect receives within a minute of finishing the configurator.
 * Written to read like Curtis wrote it, because the follow-up that comes after
 * it is genuinely from him.
 *
 * Email clients don't load Google Fonts, so this uses the brand fallback stack
 * (Georgia for headings, a system sans for body) and the brand palette.
 */

function sendBrief(d, s) {
  var subject = "Your build brief, " + (d.est && d.est.totalRange ? d.est.totalRange : "Mayflower");
  var html = briefHtml(d, s);
  var plain = briefPlain(d, s);

  var opts = {
    to: d.email,
    subject: subject,
    htmlBody: html,
    body: plain,
    name: SETTINGS.FROM_NAME,
    replyTo: SETTINGS.REPLY_TO
  };

  if (SETTINGS.AUTO_SEND_BRIEF) {
    MailApp.sendEmail(opts);
  } else {
    GmailApp.createDraft(d.email, subject, plain, { htmlBody: html, name: SETTINGS.FROM_NAME });
  }
}

function briefPlain(d, s) {
  var e = d.est || {}, a = d.answers || {};
  return [
    (d.name || "").split(" ")[0] + ",",
    "",
    "Attached below is the preliminary range for the home you laid out at the showcase.",
    "",
    e.sqft + " sf, " + e.tier + " finish, " + label(COMMUNITIES, a.community) + ", " + e.site + " site.",
    "Total project: " + e.totalRange + ". Roughly " + e.monthsLow + " to " + e.monthsHigh +
      " months from the first design meeting to move-in.",
    "",
    "That range is built from what homes like this have actually cost us to build in this valley. It is not a bid. A real number takes a real design on a real lot, and we will give you one of those at no charge once you have both.",
    "",
    "The single biggest variable is the ground. Two identical houses on two different lots can differ by seven figures before anyone picks a countertop. If you own a lot, I will walk it with you and give you a real range before you spend a dollar on design.",
    "",
    "Reply to this email or call me at " + SETTINGS.CURTIS_PHONE + ".",
    "",
    "Thanks.",
    "Curtis"
  ].join("\n");
}

function briefHtml(d, s) {
  var e = d.est || {}, a = d.answers || {};
  var first = (d.name || "").split(" ")[0];

  var ink = "#42403A", bg = "#ECECE4", paper = "#F6F5F0",
      bronze = "#836F4E", warm = "#A79E86", head = "#64645D", body = "#575E67";
  var serif = "Georgia,'Times New Roman',serif";
  var sans = "'Segoe UI',Helvetica,Arial,sans-serif";

  function money(n) {
    if (!n) return "";
    return n >= 1000000 ? "$" + (n / 1000000).toFixed(2).replace(/\.00$/, "") + "M"
                        : "$" + Math.round(n / 1000) + "K";
  }
  function rng(lo, hi) { return money(lo) + " &ndash; " + money(hi); }
  function line(l, v, note) {
    return '<tr><td style="padding:11px 0;border-bottom:1px solid rgba(66,64,58,.08);font:400 15px ' + sans + ';color:' + body + '">' +
      l + (note ? '<div style="font-size:12px;color:' + warm + ';padding-top:3px">' + note + '</div>' : '') +
      '</td><td align="right" style="padding:11px 0;border-bottom:1px solid rgba(66,64,58,.08);font:500 15px ' + sans + ';color:' + ink + ';white-space:nowrap">' + v + '</td></tr>';
  }

  var savedList = "";
  if ((d.saved || []).length) {
    /* Keep these in step with the titles in assets/js/content.js. */
    var names = {
      "arrival": "01 · Start here: how to read this house",
      "great-room": "02 · The window wall: steel and glass",
      "kitchen": "03 · How the kitchen allowances were set",
      "primary": "04 · Waterproofing behind the tile",
      "stair": "05 · Shop drawings, and the stair they saved",
      "mechanical": "06 · The mechanical room, priced",
      "envelope": "07 · Snow, water, and twenty winters",
      "site": "08 · Why the lot sets the budget"
    };
    savedList =
      '<p style="font:400 13px ' + sans + ';letter-spacing:.16em;text-transform:uppercase;color:' + bronze + ';margin:34px 0 10px">You saved</p>' +
      '<p style="font:400 15px ' + sans + ';color:' + body + ';line-height:1.8;margin:0">' +
      d.saved.map(function (k) { return names[k] || k; }).join("<br>") + '</p>';
  }

  return '' +
  '<div style="background:' + bg + ';padding:0;margin:0">' +
  '<div style="max-width:600px;margin:0 auto;background:' + bg + ';padding:36px 26px 46px">' +

    '<p style="font:400 12px ' + sans + ';letter-spacing:.22em;text-transform:uppercase;color:' + warm + ';margin:0 0 30px">Mayflower Luxury Homes</p>' +

    '<p style="font:400 16px ' + sans + ';color:' + body + ';line-height:1.75;margin:0 0 18px">' + esc(first) + ',</p>' +

    '<p style="font:400 16px ' + sans + ';color:' + body + ';line-height:1.75;margin:0 0 18px">' +
      'Here is the preliminary range for the home you laid out at the showcase. Everything below comes from what homes like this have actually cost us to build in this valley.</p>' +

    '<table width="100%" cellpadding="0" cellspacing="0" style="background:' + paper + ';margin:30px 0"><tr><td style="padding:28px 24px;text-align:center">' +
      '<p style="font:400 12px ' + sans + ';letter-spacing:.2em;text-transform:uppercase;color:' + bronze + ';margin:0 0 12px">Preliminary range</p>' +
      '<p style="font:400 30px ' + serif + ';color:' + head + ';margin:0;line-height:1.2">' + esc(e.totalRange || "") + '</p>' +
      '<p style="font:400 13px ' + sans + ';color:' + warm + ';margin:14px 0 0;line-height:1.6">' +
        esc(String(e.sqft || "")) + ' sf &middot; ' + esc(e.tier || "") + ' finish &middot; ' +
        esc(label(COMMUNITIES, a.community)) + ' &middot; ' + esc(String(e.site || "").toLowerCase()) + ' site<br>' +
        esc(e.psf || "") + ' per square foot of hard cost</p>' +
    '</td></tr></table>' +

    '<p style="font:400 12px ' + sans + ';letter-spacing:.16em;text-transform:uppercase;color:' + bronze + ';margin:34px 0 4px">Where it goes</p>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(66,64,58,.14);margin-bottom:6px">' +
      line("Home: shell, systems and finishes", rng(e.hardLow - e.siteLow, e.hardHigh - e.siteHigh)) +
      line("Site, excavation, retaining and flatwork", rng(e.siteLow, e.siteHigh), "The most lot-dependent line here.") +
      line("Design, engineering, permits and fees", rng(e.softLow, e.softHigh)) +
      line("Contingency we&rsquo;d recommend carrying", rng(e.contLow, e.contHigh), "Homes that don&rsquo;t carry it borrow it later.") +
      '<tr><td style="padding:14px 0;font:400 16px ' + serif + ';color:' + head + '">Total project</td>' +
      '<td align="right" style="padding:14px 0;font:400 16px ' + serif + ';color:' + head + ';white-space:nowrap">' + esc(e.totalRange || "") + '</td></tr>' +
    '</table>' +
    '<p style="font:400 12px ' + sans + ';color:' + warm + ';margin:0 0 6px">Excludes land, furnishings, and any club or HOA initiation.</p>' +

    '<p style="font:400 12px ' + sans + ';letter-spacing:.16em;text-transform:uppercase;color:' + bronze + ';margin:34px 0 8px">How long</p>' +
    '<p style="font:400 22px ' + serif + ';color:' + head + ';margin:0 0 8px">' +
      esc(String(e.monthsLow || "")) + ' to ' + esc(String(e.monthsHigh || "")) + ' months</p>' +
    '<p style="font:400 15px ' + sans + ';color:' + body + ';line-height:1.75;margin:0">' +
      'Four to seven months of design, two to four of permitting and bidding, then about ' +
      esc(String(e.buildMonths || "")) + ' months of construction. Design starts long before a shovel moves, which is why &ldquo;next spring&rdquo; usually means starting now.</p>' +

    savedList +

    '<table width="100%" cellpadding="0" cellspacing="0" style="margin:34px 0"><tr>' +
      '<td style="border-left:2px solid #96BBDA;background:rgba(150,187,218,.13);padding:16px 18px;font:400 14px ' + sans + ';color:' + body + ';line-height:1.7">' +
      '<strong style="color:' + ink + '">Read this part.</strong> That range is a planning number, not a bid, an estimate, or an offer. ' +
      'Nobody should make a purchase decision on it alone. A real number takes a real design on a real lot.</td>' +
    '</tr></table>' +

    '<p style="font:400 16px ' + sans + ';color:' + body + ';line-height:1.75;margin:0 0 18px">' +
      'The single biggest variable in that number is the ground. Two identical houses on two different lots can differ by seven figures before anyone picks a countertop.</p>' +

    '<p style="font:400 16px ' + sans + ';color:' + body + ';line-height:1.75;margin:0 0 18px">' +
      'If you own a lot, I will walk it with you and give you a real range before you spend a dollar on design. If you don&rsquo;t own one yet, walk it with me before you buy. No charge, and I will tell you if I think the lot is a mistake.</p>' +

    '<p style="font:400 16px ' + sans + ';color:' + body + ';line-height:1.75;margin:0 0 18px">' +
      'Reply to this email or call me at <a href="tel:' + esc(SETTINGS.CURTIS_PHONE.replace(/[^0-9+]/g, "")) + '" style="color:' + bronze + '">' + esc(SETTINGS.CURTIS_PHONE) + '</a>. I answer my own phone.</p>' +

    '<p style="font:400 16px ' + sans + ';color:' + body + ';line-height:1.75;margin:0 0 4px">Thanks.</p>' +
    '<p style="font:400 16px ' + sans + ';color:' + body + ';line-height:1.75;margin:0">Curtis</p>' +

    '<p style="border-top:1px solid rgba(66,64,58,.14);margin:40px 0 0;padding-top:20px;font:400 12px ' + sans + ';color:' + warm + ';line-height:1.7">' +
      'Mayflower Luxury Homes &middot; Park City, Utah<br>' +
      '<a href="' + esc(SETTINGS.SITE_URL) + '" style="color:' + warm + '">mayflowerluxuryhomes.com</a></p>' +

  '</div></div>';
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
