/* =============================================================================
   THE BUILD FILE — CONTENT & CONFIGURATION
   -----------------------------------------------------------------------------
   This is the only file Curtis or Dave should need to edit for normal changes.
   Everything visitors read lives here. Plain text, no code knowledge required.

   >>> ITEMS MARKED  // CONFIRM  ARE PLACEHOLDERS. Replace with real Mayflower
   >>> numbers before the site goes live. See docs/NUMBERS-TO-CONFIRM.md.
   ========================================================================== */

const CONFIG = {
  /* ---- The showcase home -------------------------------------------------- */
  home: {
    name: "The Skyridge Residence",         // CONFIRM: what you want it called
    address: "205 Skyridge Drive, Park City, UT",  // CONFIRM: real address
    community: "Skyridge Mountain Community",
    year: 2026,
    sqft: 7100,                              // CONFIRM
    beds: 5,                                 // CONFIRM
    baths: 6,                                // CONFIRM
    lotAcres: 0.62,                          // CONFIRM
    elevation: "6,900 ft",                   // CONFIRM
    monthsToBuild: 16,                       // CONFIRM
    valueLabel: "$6.5M",                     // CONFIRM
    hero: "assets/img/home-2.jpg"
  },

  /* ---- Contact ------------------------------------------------------------ */
  contact: {
    curtis:      { name: "Curtis", role: "Owner", phone: "435-555-0100", email: "curtis@mayflowerluxuryhomes.com", photo: "assets/img/team/curtis.jpg" },   // CONFIRM phone
    dave:        { name: "Dave",   role: "Owner", phone: "435-555-0101", email: "dave@mayflowerluxuryhomes.com",   photo: "assets/img/team/dave.jpg" },     // CONFIRM phone + email
    website: "https://mayflowerluxuryhomes.com"
  },

  /* ---- Backend ------------------------------------------------------------ */
  /* Paste your Google Apps Script Web App URL here after deploying it.
     See docs/RUNBOOK.md, Step 3. Leave as "" to run the site in demo mode
     (nothing is sent anywhere; submissions queue locally).                    */
  endpoint: "",

  /* ---- Event -------------------------------------------------------------- */
  event: {
    name: "Park City Showcase of Homes 2026",
    dates: "August 28–30 & September 4–7, 2026"
  }
};

/* =============================================================================
   STATIONS — one per QR placard in the house.
   Order here = order of the placards and the "next" navigation.
   ========================================================================== */

const STATIONS = [
  {
    slug: "arrival",
    number: "01",
    where: "Entry",
    title: "What you're standing in",
    photo: "assets/img/home-7.jpg",
    lede: "Sixteen months, forty-one trade partners, about eleven thousand individual decisions. Here is the whole file, open.",
    body: [
      "Most builders will show you a finished house and talk about craftsmanship. We'd rather show you the numbers, the schedule and the decisions — including the ones that got harder than we expected.",
      "There are eight of these placards through the home. Each one covers a real decision made on this build: what it cost, why we chose it, and what it will mean to the owner in twenty years. Scan them as you go."
    ],
    facts: [
      ["Conditioned area", "7,100 sf"],            // CONFIRM
      ["Site to substantial completion", "16 months"],  // CONFIRM
      ["Trade partners on site", "41"],            // CONFIRM
      ["Change orders, owner-initiated", "22"],    // CONFIRM
      ["Change orders, builder error", "3"]        // CONFIRM
    ],
    cost: null,
    honest: "Three change orders on this build were our mistake, not the owner's. We ate them. We'd rather tell you that up front than have you find out on your own house.",  // CONFIRM
    ask: "Ask us about the three we got wrong."
  },
  {
    slug: "great-room",
    number: "02",
    where: "Great Room",
    title: "Glass at 6,900 feet",
    photo: "assets/img/home-8.jpg",
    lede: "The wall you're looking through is the single most expensive decision in this house — and the one most likely to be quietly value-engineered by a builder trying to win on price.",
    body: [
      "Twenty-eight feet of clear span with no visible structure takes a steel moment frame, engineered and shop-drawn before framing starts. That work happens months before anyone sees a wall, which is exactly why it gets cut from a low bid.",
      "The glazing is a thermally-broken aluminum system with triple glazing on the west elevation. At this elevation, with this much south and west exposure, a standard dual-pane package would have cost roughly a third less and made this room uncomfortable four months a year."
    ],
    facts: [
      ["Clear span", "28 ft"],                     // CONFIRM
      ["Glazing", "Triple, thermally broken"],     // CONFIRM
      ["Structure", "Steel moment frame"],
      ["Lead time on the glass package", "22 weeks"]  // CONFIRM
    ],
    cost: { label: "Structure + glazing package on this home", range: "$610,000 – $680,000", note: "About 9% of hard cost." },  // CONFIRM
    honest: "The glass package arrived two weeks late and pushed interior trim. It did not move the completion date, because the schedule had float built in for exactly this.",  // CONFIRM
    ask: "Ask us what a low bid usually cuts here."
  },
  {
    slug: "kitchen",
    number: "03",
    where: "Kitchen & Pantry",
    title: "Where allowances go to die",
    photo: "assets/img/home-4.jpg",
    lede: "Almost every custom-home cost overrun you've ever heard about started as an allowance that was set too low to win the job.",
    body: [
      "An allowance is a placeholder — a number in your contract for something not yet chosen. Set it honestly and your budget holds. Set it low and the contract looks cheaper than the house will ever be.",
      "We price cabinetry, appliances, counters and plumbing fixtures off actual selections and actual quotes before you sign, not off a number that makes the bid look good. When we do carry an allowance, we tell you what it will realistically buy."
    ],
    facts: [
      ["Cabinetry", "Custom, shop-built, rift white oak"],  // CONFIRM
      ["Appliance package", "Sub-Zero / Wolf"],             // CONFIRM
      ["Counters", "Book-matched quartzite"],               // CONFIRM
      ["Lead time, cabinetry", "18 weeks from approved shop drawings"]  // CONFIRM
    ],
    cost: { label: "Kitchen + pantry, complete", range: "$385,000 – $440,000", note: "Cabinetry is roughly half of it." },  // CONFIRM
    honest: "The tile in the pantry came in over what we budgeted. We showed the difference as its own line on the draw rather than burying it in the total.",
    ask: "Ask us to show you a real allowance schedule."
  },
  {
    slug: "primary",
    number: "04",
    where: "Primary Suite",
    title: "The waterproofing you'll never see",
    photo: "assets/img/home-5.jpg",
    lede: "A wet room fails in year seven, not year one. By then the builder is long gone and it's your problem.",
    body: [
      "Every wet area in this house is a bonded waterproof membrane over sloped mud bed, flood-tested and photographed before a single tile went down. Those photos are in the owner's closeout file.",
      "The alternative — a foam board system installed fast by whoever is cheapest that month — is code-legal, meaningfully cheaper, and the reason tile guys stay busy tearing out ten-year-old showers."
    ],
    facts: [
      ["Wet areas flood-tested", "6 of 6"],
      ["Radiant heat", "Hydronic, zoned per room"],  // CONFIRM
      ["Documentation", "Photographed pre-tile"]
    ],
    cost: { label: "Delta over a standard shower system, per wet area", range: "$3,500 – $6,000", note: "Six wet areas on this home." },  // CONFIRM
    honest: "This is the least glamorous line item in the house and the one we argue hardest to protect when a budget gets tight.",
    ask: "Ask to see the pre-tile photos."
  },
  {
    slug: "stair",
    number: "05",
    where: "Stair & Steel",
    title: "Drawn twice, built once",
    photo: "assets/img/home-6.jpg",
    lede: "This stair was drawn three times and fabricated once. That ratio is the whole job.",
    body: [
      "Architectural steel and fine millwork live or die on shop drawings — the fabricator's own drawings, which we review against the architect's intent and the as-built field conditions before anything is cut.",
      "The cost of a third round of shop drawings is a few thousand dollars and two weeks. The cost of finding the problem after fabrication is a rebuilt stair and an owner who stops trusting you."
    ],
    facts: [
      ["Shop drawing rounds", "3"],                 // CONFIRM
      ["Field-verified before fabrication", "Yes"],
      ["Fabricator", "Local, Heber Valley"]         // CONFIRM
    ],
    cost: { label: "Stair, steel and glass rail, installed", range: "$140,000 – $175,000" },  // CONFIRM
    honest: "The first version cleared code and looked wrong in the space. We rebuilt the drawing set on our dime before the steel was cut.",  // CONFIRM
    ask: "Ask how we review shop drawings."
  },
  {
    slug: "mechanical",
    number: "06",
    where: "Mechanical Room",
    title: "The eighteen percent nobody photographs",
    photo: "assets/img/home-1.jpg",
    lede: "You are standing in the most important room in this house. It is also the one every builder walks guests past without stopping.",
    body: [
      "Roughly eighteen cents of every dollar in a mountain-modern home at this elevation goes into systems you will never see: hydronic heat, snowmelt, air handling with real filtration, water treatment, humidification, backup power, the panel and the low-voltage backbone.",
      "This room is labeled, laid out on a plan, and every component is in the owner's closeout binder with model numbers, service intervals and the sub who installed it. Ten years from now, when something fails on a Sunday in February, that binder is worth more than the kitchen."
    ],
    facts: [
      ["Systems share of hard cost", "≈18%"],       // CONFIRM
      ["Heat", "Hydronic radiant, 9 zones"],        // CONFIRM
      ["Snowmelt", "Drive, walks, entry"],
      ["Water", "Whole-house treatment + softening"],
      ["Backup", "Automatic standby generator"]     // CONFIRM
    ],
    cost: { label: "Mechanical, electrical, plumbing and low-voltage", range: "$1.05M – $1.25M", note: "On a home of this size at this elevation." },  // CONFIRM
    honest: "When a bid comes in surprisingly low on a mountain home, this room is almost always where the money was taken out.",
    ask: "Ask to see a closeout binder."
  },
  {
    slug: "envelope",
    number: "07",
    where: "Deck & Exterior",
    title: "Snow, water, and twenty winters",
    photo: "assets/img/home-3.jpg",
    lede: "Park City has two seasons that matter to a building: freeze and thaw. Everything outside this wall is designed for the transition between them.",
    body: [
      "Ice damming, snow load, wind-driven water and thermal cycling do more damage to homes here than anything else. The details that prevent it — self-adhered underlayment, real flashing at every penetration, a drainage plane behind the siding, a ventilated roof assembly — add cost and are invisible when finished.",
      "The deck is structurally separated and drained so that water and snowmelt never sit against the building. It costs more to build a deck that way. It's the difference between resealing it and rebuilding it."
    ],
    facts: [
      ["Roof assembly", "Ventilated, standing seam"],   // CONFIRM
      ["Snow load design", "Per county, plus drift"],
      ["Siding", "Rainscreen, drained and back-vented"],
      ["Deck", "Structurally separated, drained"]
    ],
    cost: { label: "Exterior envelope, roof and decks", range: "$890,000 – $1.02M" },  // CONFIRM
    honest: "We have replaced other builders' decks in this valley that were nine years old. That is a preventable expense.",
    ask: "Ask about ice damming on your lot's orientation."
  },
  {
    slug: "site",
    number: "08",
    where: "Garage & Site",
    title: "The lot decides the budget",
    photo: "assets/img/skyridge-2.jpg",
    lede: "Two identical houses on two different Skyridge lots can differ by seven figures before anyone picks a countertop.",
    body: [
      "Slope, rock, access, utility runs, retaining, drainage and how much of the year you can actually work — this is where a build budget is won or lost, and it is settled before design ever starts.",
      "If you own a lot, we will walk it with you and give you a real range before you commission a design. If you don't own one yet, walk it with us first. The cheapest hour anyone spends on a custom home is the one standing on dirt with a builder who will tell you the truth."
    ],
    facts: [
      ["Site work on this home", "$740,000"],       // CONFIRM
      ["Excavation", "Rock encountered at 6 ft"],   // CONFIRM
      ["Retaining", "Engineered, 2 walls"],         // CONFIRM
      ["Drive", "Snowmelted, heated apron"]
    ],
    cost: { label: "Site, excavation, retaining, utilities and flatwork", range: "$620,000 – $860,000", note: "Highly lot-dependent. This is the single biggest variable in your budget." },  // CONFIRM
    honest: "We hit rock at six feet on this lot. It added about $80,000 and eleven days. The owner knew the day we found it, not on the next draw.",  // CONFIRM
    ask: "Bring us your lot. We'll walk it."
  }
];
