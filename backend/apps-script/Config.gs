/**
 * THE BUILD FILE — BACKEND CONFIGURATION
 * ---------------------------------------------------------------------------
 * Edit this file first. Everything else can be left alone.
 */

var SETTINGS = {

  // Who gets the "hot lead" alert the moment it comes in.
  OWNER_EMAILS: ["curtis@mayflowerluxuryhomes.com", "dave@mayflowerluxuryhomes.com"],  // CONFIRM Dave's address

  // Optional: a phone-carrier email-to-text address, so Tier A leads buzz a
  // pocket during the showcase. Verizon 4355550100@vtext.com, AT&T @txt.att.net,
  // T-Mobile @tmomail.net. Leave "" to switch text alerts off.
  OWNER_SMS: "",

  // Name and reply-to on everything the prospect receives.
  FROM_NAME: "Curtis — Mayflower Luxury Homes",
  REPLY_TO:  "curtis@mayflowerluxuryhomes.com",
  CURTIS_PHONE: "435-555-0100",   // CONFIRM
  SITE_URL: "https://mayflowerluxuryhomes.com",

  // Public URL of the deployed Build File site (used for links in emails).
  BUILD_FILE_URL: "",             // e.g. https://buildfile.mayflowerluxuryhomes.com

  // Shared secret for the owner console. Change it to anything you like.
  CONSOLE_KEY: "change-me-before-the-show",

  // Send the prospect's brief automatically? Recommended: true.
  // If false, a Gmail draft is created for Curtis to send by hand instead.
  AUTO_SEND_BRIEF: true,

  // Nurture: create Gmail DRAFTS for Curtis to review and send (recommended,
  // keeps the personal touch), or send them automatically.
  NURTURE_MODE: "draft",          // "draft" | "send" | "off"

  SHEET_LEADS:   "Leads",
  SHEET_SIGNALS: "Signals",
  SHEET_LOG:     "Follow-ups"
};
