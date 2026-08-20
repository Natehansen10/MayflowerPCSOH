/* =============================================================================
   BUILD MODEL — the math behind "Plan Your Build".
   -----------------------------------------------------------------------------
   >>> EVERY NUMBER IN THIS FILE IS A PLACEHOLDER UNTIL CURTIS CONFIRMS IT.
   >>> These are the figures a prospect will see with Mayflower's name on them.
   >>> Review this file first. See docs/NUMBERS-TO-CONFIRM.md.

   The model is deliberately simple and conservative: it produces a RANGE, always
   states that it is preliminary, and never pretends to be a bid.
   ========================================================================== */

const MODEL = {

  /* Hard cost per conditioned square foot, by level of finish. ------------- */
  tiers: [
    {
      id: "refined",
      name: "Refined",
      psfLow: 525, psfHigh: 625,                                   // CONFIRM
      summary: "Clean mountain-modern. Honest materials, well detailed.",
      detail: "Painted and stained millwork with select custom cabinetry, engineered stone counters, quality domestic plumbing fixtures, hardwood and porcelain tile, standing-seam roof, a well-specified mechanical package."
    },
    {
      id: "signature",
      name: "Signature",
      psfLow: 650, psfHigh: 800,                                   // CONFIRM
      summary: "The level most of our Skyridge homes are built to.",
      detail: "Shop-built custom cabinetry throughout, natural stone counters and slab surfaces, architectural steel, Sub-Zero/Wolf-class appliances, wide-plank hardwood, imported fixtures, zoned hydronic heat, snowmelt, full home automation backbone."
    },
    {
      id: "legacy",
      name: "Legacy",
      psfLow: 850, psfHigh: 1100,                                  // CONFIRM
      summary: "No compromise. Bespoke everything, long lead times.",
      detail: "Fully bespoke millwork and metalwork, book-matched slab stone, custom steel windows and doors, integrated lighting design, wellness and spa systems, dedicated wine and media environments, and the trade partners who only do this level of work."
    }
  ],

  /* Community cost factor. Reflects access, terrain, design review, --------- */
  /* utility runs and what the local trade base charges to work there.        */
  communities: [
    { id: "skyridge",   name: "Skyridge",                     factor: 1.00 },  // CONFIRM
    { id: "promontory", name: "Promontory",                   factor: 1.03 },  // CONFIRM
    { id: "victory",    name: "Victory Ranch",                factor: 1.05 },  // CONFIRM
    { id: "deervalley", name: "Deer Valley / Empire Pass",    factor: 1.12 },  // CONFIRM
    { id: "tuhaye",     name: "Tuhaye / Hideout",             factor: 0.97 },  // CONFIRM
    { id: "oldtown",    name: "Old Town Park City",           factor: 1.08 },  // CONFIRM
    { id: "other",      name: "Elsewhere in the Wasatch Back", factor: 1.00 },
    { id: "unknown",    name: "Haven't chosen a lot yet",     factor: 1.00 }
  ],

  /* Site complexity. The single largest variable in a mountain build. ------- */
  sites: [
    { id: "gentle",  name: "Gentle",  blurb: "Near-flat, straightforward access, utilities at the street", factor: 0.96, siteWorkLow: 260000, siteWorkHigh: 400000 },   // CONFIRM
    { id: "moderate",name: "Moderate",blurb: "Some slope, a walkout lower level, modest retaining",        factor: 1.00, siteWorkLow: 420000, siteWorkHigh: 640000 },   // CONFIRM
    { id: "steep",   name: "Steep",   blurb: "Significant grade, engineered retaining, tight access",      factor: 1.09, siteWorkLow: 680000, siteWorkHigh: 1050000 },  // CONFIRM
    { id: "unknown", name: "Not sure",blurb: "We'll walk it with you and tell you which one it is",        factor: 1.00, siteWorkLow: 420000, siteWorkHigh: 640000 }
  ],

  timelines: [
    { id: "now",      name: "Ready to start now",        score: 25 },
    { id: "6mo",      name: "Within six months",         score: 20 },
    { id: "12mo",     name: "Within a year",             score: 12 },
    { id: "exploring",name: "Exploring, no date yet",    score: 4  }
  ],

  lotStatus: [
    { id: "own",      name: "I own the lot",             score: 25 },
    { id: "contract", name: "Under contract on a lot",   score: 22 },
    { id: "looking",  name: "Actively looking",          score: 12 },
    { id: "none",     name: "Haven't started looking",   score: 3  }
  ],

  roles: [
    { id: "self",     name: "Building for myself or my family", score: 25 },
    { id: "agent-client", name: "An agent, here with a client", score: 16 },
    { id: "agent",    name: "A real estate agent",              score: 6  },
    { id: "industry", name: "In the trade — builder, designer, supplier", score: 0 },
    { id: "admiring", name: "Just admiring the house",          score: 0  }
  ],

  /* Everything above hard cost. -------------------------------------------- */
  softCostPct:    0.11,   // design, engineering, survey, permits, fees        // CONFIRM
  contingencyPct: 0.06,   // owner contingency we recommend carrying           // CONFIRM

  sqft: { min: 3500, max: 14000, step: 250, default: 6500 },

  /* Schedule, in months. ---------------------------------------------------- */
  schedule: {
    designLow: 4, designHigh: 7,                                    // CONFIRM
    permitLow: 2, permitHigh: 4,                                    // CONFIRM
    buildBase: 11,                       // months at 4,000 sf      // CONFIRM
    buildPerThousandSf: 0.95,            // added months per 1,000 sf over 4,000
    tierAdd: { refined: 0, signature: 1.5, legacy: 3.5 },           // CONFIRM
    siteAdd: { gentle: 0, moderate: 0.5, steep: 2, unknown: 0.5 }   // CONFIRM
  }
};

/* =============================================================================
   PURE FUNCTIONS — no DOM, no side effects.
   ========================================================================== */

function byId(list, id) { return list.find(x => x.id === id) || list[0]; }

function estimate(input) {
  const tier  = byId(MODEL.tiers, input.tier);
  const comm  = byId(MODEL.communities, input.community);
  const site  = byId(MODEL.sites, input.site);
  const sf    = Math.max(MODEL.sqft.min, Math.min(MODEL.sqft.max, Number(input.sqft) || MODEL.sqft.default));

  const f = comm.factor * site.factor;

  const shellLow  = sf * tier.psfLow  * f;
  const shellHigh = sf * tier.psfHigh * f;

  const siteLow  = site.siteWorkLow  * comm.factor;
  const siteHigh = site.siteWorkHigh * comm.factor;

  const hardLow  = shellLow  + siteLow;
  const hardHigh = shellHigh + siteHigh;

  const softLow  = hardLow  * MODEL.softCostPct;
  const softHigh = hardHigh * MODEL.softCostPct;

  const contLow  = (hardLow  + softLow)  * MODEL.contingencyPct;
  const contHigh = (hardHigh + softHigh) * MODEL.contingencyPct;

  const totalLow  = hardLow  + softLow  + contLow;
  const totalHigh = hardHigh + softHigh + contHigh;

  const s = MODEL.schedule;
  const buildMonths = s.buildBase
    + Math.max(0, (sf - 4000) / 1000) * s.buildPerThousandSf
    + (s.tierAdd[tier.id] || 0)
    + (s.siteAdd[site.id] || 0);

  return {
    sf, tier, community: comm, site,
    psfLow:  Math.round(tier.psfLow  * f),
    psfHigh: Math.round(tier.psfHigh * f),
    shell: [shellLow, shellHigh],
    sitework: [siteLow, siteHigh],
    hard: [hardLow, hardHigh],
    soft: [softLow, softHigh],
    contingency: [contLow, contHigh],
    total: [totalLow, totalHigh],
    months: {
      design: [s.designLow, s.designHigh],
      permit: [s.permitLow, s.permitHigh],
      build:  [Math.round(buildMonths), Math.round(buildMonths + 2)],
      totalLow:  s.designLow  + s.permitLow  + Math.round(buildMonths),
      totalHigh: s.designHigh + s.permitHigh + Math.round(buildMonths + 2)
    },
    draws: drawCurve(Math.round(buildMonths), (hardLow + hardHigh) / 2)
  };
}

/* Monthly construction draw curve — an S-curve, which is how a real build
   actually spends: slow through foundation, heavy through framing/mechanical,
   tapering through finishes. Used to show a prospect their capital timing.   */
function drawCurve(months, hardCostMid) {
  const pts = [];
  let sum = 0;
  for (let m = 1; m <= months; m++) {
    const x = m / months;
    // bell-ish weighting, peak around 55% through the build
    const w = Math.exp(-Math.pow((x - 0.55) / 0.28, 2)) + 0.18;
    pts.push(w); sum += w;
  }
  let cum = 0;
  return pts.map((w, i) => {
    const amt = (w / sum) * hardCostMid;
    cum += amt;
    return { month: i + 1, amount: amt, cumulative: cum };
  });
}

/* =============================================================================
   LEAD SCORING
   The client computes this for routing hints. The Apps Script backend
   RE-COMPUTES it authoritatively from the raw answers — keep the two in sync.
   ========================================================================== */

function scoreLead(input, est) {
  let score = 0;
  const why = [];

  const total = est ? (est.total[0] + est.total[1]) / 2 : 0;
  let budgetPts = 0;
  if      (total >= 8000000) budgetPts = 35;
  else if (total >= 5500000) budgetPts = 30;
  else if (total >= 4000000) budgetPts = 24;
  else if (total >= 2750000) budgetPts = 16;
  else if (total >= 1500000) budgetPts = 8;
  if (budgetPts) { score += budgetPts; why.push(`Configured a ${fmtMoney(total, 1)} project`); }

  const role = byId(MODEL.roles, input.role);
  score += role.score;
  if (role.score >= 16) why.push(role.name);

  const lot = byId(MODEL.lotStatus, input.lotStatus);
  score += lot.score;
  if (lot.score >= 22) why.push(lot.name);

  const tl = byId(MODEL.timelines, input.timeline);
  score += tl.score;
  if (tl.score >= 20) why.push(tl.name);

  if (input.wantsWalk) { score += 15; why.push("Asked to walk a lot or a home with us"); }
  if (input.phone)     { score += 5; }
  const saved = (input.saved || []).length;
  if (saved) { score += Math.min(saved * 2, 10); if (saved >= 3) why.push(`Saved ${saved} build details`); }
  if (input.notes && input.notes.trim().length > 40) { score += 5; why.push("Wrote us a real note"); }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let tier = "C";
  if (role.id === "industry") tier = "T";                 // trade / competitor
  else if (role.id === "agent" || role.id === "agent-client") tier = score >= 55 ? "B" : "R";  // R = agent referral track
  else if (score >= 70) tier = "A";
  else if (score >= 45) tier = "B";

  return { score, tier, why };
}

const TIER_MEANING = {
  A: "Live prospect. Curtis calls within 24 hours.",
  B: "Real, not yet urgent. Personal email within 48 hours, then nurture.",
  C: "Early or unqualified. Long nurture, low effort.",
  R: "Agent. Referral-partner track.",
  T: "Trade or competitor. Courteous, no nurture."
};

/* ---- formatting helpers -------------------------------------------------- */
function fmtMoney(n, decimals) {
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(decimals === undefined ? 2 : decimals).replace(/\.00$/, "") + "M";
  return "$" + Math.round(n / 1000) + "K";
}
function fmtRange(pair, decimals) {
  return fmtMoney(pair[0], decimals) + " – " + fmtMoney(pair[1], decimals);
}
