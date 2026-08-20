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
   STATIONS — one per placard in the house, in walking order.
   Order here = the order of the placards, the numbers on them, and the
   "next" navigation on the phone. Each station needs:

     title    what the detail is, in plain words
     preview  the one line a visitor reads before deciding to open it
     lede     the opening line on the page itself
     body     two short paragraphs
     facts    the specifics, as label/value pairs
     cost     what it cost on this home (or null)
     honest   what went wrong, and what we did about it
     ask      the question we'd like them to ask us in person
   ========================================================================== */

const STATIONS = [
  {
    slug: "arrival",
    number: "01",
    where: "Entry",
    title: "Start here: how to read this house",
    preview: "What this home is, how the eight marked details work, and what it took to build.",
    photo: "assets/img/home-7.jpg",
    lede: "Sixteen months, forty-one trade partners, and about eleven thousand decisions. Eight of those decisions are open for you to read as you walk.",
    body: [
      "Most builders show you a finished house and talk about craftsmanship. We would rather show you the numbers, the schedule and the reasoning — including the parts that got harder than we expected.",
      "There are eight placards through the home, numbered in the order you'll pass them. Each one covers one real decision on this build: what it cost, why we chose it, and what it means to the owner in twenty years. Scan the code on the placard, or tap the detail from the list on your phone. Anything worth keeping, save — it comes with you at the end."
    ],
    facts: [
      ["Conditioned area", "7,100 sf"],            // CONFIRM
      ["Site to substantial completion", "16 months"],  // CONFIRM
      ["Trade partners on site", "41"],            // CONFIRM
      ["Change orders, owner-initiated", "22"],    // CONFIRM
      ["Change orders, builder error", "3"]        // CONFIRM
    ],
    cost: null,
    honest: "Three change orders on this build were our mistake, not the owner's. We absorbed the cost. We would rather tell you that at the front door than have you discover it on your own house.",  // CONFIRM
    ask: "Ask us about the three we got wrong."
  },
  {
    slug: "great-room",
    number: "02",
    where: "Great Room",
    title: "The window wall: steel and glass",
    preview: "Why a 28-foot clear span needs a steel frame, and what the structure and glazing cost.",
    photo: "assets/img/home-8.jpg",
    lede: "The wall you are looking through is the most expensive decision in this house, and the first one a builder quietly reduces to win on price.",
    body: [
      "Twenty-eight feet of clear span with no visible structure takes a steel moment frame, engineered and shop-drawn before framing starts. That work happens months before anyone sees a wall, which is exactly why it gets cut from a low bid.",
      "The glazing is a thermally broken aluminum system, triple-glazed on the west elevation. At this elevation with this much south and west exposure, a standard dual-pane package would have cost roughly a third less and made this room uncomfortable four months a year."
    ],
    facts: [
      ["Clear span", "28 ft"],                     // CONFIRM
      ["Glazing", "Triple, thermally broken"],     // CONFIRM
      ["Structure", "Steel moment frame"],
      ["Lead time on the glass package", "22 weeks"]  // CONFIRM
    ],
    cost: { label: "Structure and glazing package on this home", range: "$610,000 – $680,000", note: "About 9% of hard cost." },  // CONFIRM
    honest: "The glass package arrived two weeks late and pushed interior trim. It did not move the completion date, because the schedule carried float for exactly this.",  // CONFIRM
    ask: "Ask us what a low bid usually cuts here."
  },
  {
    slug: "kitchen",
    number: "03",
    where: "Kitchen & Pantry",
    title: "How the kitchen allowances were set",
    preview: "What an allowance is, how we price one before you sign, and what this kitchen cost.",
    photo: "assets/img/home-4.jpg",
    lede: "Most custom-home budget overruns begin as an allowance that was set too low to win the job.",
    body: [
      "An allowance is a placeholder — a number in your contract for something you have not chosen yet. Set it honestly and your budget holds. Set it low and the contract looks cheaper than the house will ever be.",
      "We price cabinetry, appliances, counters and plumbing fixtures against actual selections and actual quotes before you sign. When we do carry an allowance, we tell you plainly what it will buy."
    ],
    facts: [
      ["Cabinetry", "Custom, shop-built, rift white oak"],  // CONFIRM
      ["Appliance package", "Sub-Zero / Wolf"],             // CONFIRM
      ["Counters", "Book-matched quartzite"],               // CONFIRM
      ["Lead time, cabinetry", "18 weeks from approved shop drawings"]  // CONFIRM
    ],
    cost: { label: "Kitchen and pantry, complete", range: "$385,000 – $440,000", note: "Cabinetry is roughly half of it." },  // CONFIRM
    honest: "The pantry tile came in over what we had budgeted. We showed the difference as its own line on the draw rather than burying it in the total.",
    ask: "Ask us to show you a real allowance schedule."
  },
  {
    slug: "primary",
    number: "04",
    where: "Primary Suite",
    title: "Waterproofing behind the tile",
    preview: "The wet-area detail you cannot inspect once tile is down, and what it adds per bathroom.",
    photo: "assets/img/home-5.jpg",
    lede: "A wet room fails in year seven, not year one. By then the builder is long gone and it is the owner's problem.",
    body: [
      "Every wet area in this house is a bonded waterproof membrane over a sloped mud bed, flood-tested and photographed before a single tile went down. Those photos are in the owner's closeout file.",
      "The alternative — a foam board system installed quickly by whoever is cheapest that month — is code-legal, meaningfully cheaper, and the reason tile crews stay busy tearing out ten-year-old showers."
    ],
    facts: [
      ["Wet areas flood-tested", "6 of 6"],
      ["Radiant heat", "Hydronic, zoned per room"],  // CONFIRM
      ["Documentation", "Photographed pre-tile"]
    ],
    cost: { label: "Added cost over a standard shower system, per wet area", range: "$3,500 – $6,000", note: "Six wet areas on this home." },  // CONFIRM
    honest: "This is the least glamorous line item in the house and the one we argue hardest to protect when a budget gets tight.",
    ask: "Ask to see the pre-tile photos."
  },
  {
    slug: "stair",
    number: "05",
    where: "Stair & Steel",
    title: "Shop drawings, and the stair they saved",
    preview: "How steel and millwork are reviewed before anything is cut, and what this stair cost.",
    photo: "assets/img/home-6.jpg",
    lede: "This stair was drawn three times and fabricated once. That ratio is the whole job.",
    body: [
      "Architectural steel and fine millwork live or die on shop drawings — the fabricator's own drawings, which we review against the architect's intent and the as-built field conditions before anything is cut.",
      "A third round of shop drawings costs a few thousand dollars and two weeks. Finding the same problem after fabrication costs a rebuilt stair and an owner who has stopped trusting you."
    ],
    facts: [
      ["Shop drawing rounds", "3"],                 // CONFIRM
      ["Field-verified before fabrication", "Yes"],
      ["Fabricator", "Local, Heber Valley"]         // CONFIRM
    ],
    cost: { label: "Stair, steel and glass rail, installed", range: "$140,000 – $175,000" },  // CONFIRM
    honest: "The first version cleared code and looked wrong in the space. We rebuilt the drawing set at our cost before the steel was cut.",  // CONFIRM
    ask: "Ask how we review shop drawings."
  },
  {
    slug: "mechanical",
    number: "06",
    where: "Mechanical Room",
    title: "The mechanical room, priced",
    preview: "The systems you never see — roughly 18% of the budget — and the binder that documents them.",
    photo: "assets/img/home-1.jpg",
    lede: "This is the most important room in the house, and the one most builders walk their guests straight past.",
    body: [
      "Roughly eighteen cents of every dollar in a mountain-modern home at this elevation goes into systems you will never see: hydronic heat, snowmelt, air handling with real filtration, water treatment, humidification, backup power, the electrical panel and the low-voltage backbone.",
      "This room is labeled, laid out on a plan, and every component is recorded in the owner's closeout binder with model numbers, service intervals and the trade partner who installed it. Ten years from now, when something fails on a Sunday in February, that binder is worth more than the kitchen."
    ],
    facts: [
      ["Systems share of hard cost", "≈18%"],       // CONFIRM
      ["Heat", "Hydronic radiant, 9 zones"],        // CONFIRM
      ["Snowmelt", "Drive, walks, entry"],
      ["Water", "Whole-house treatment and softening"],
      ["Backup", "Automatic standby generator"]     // CONFIRM
    ],
    cost: { label: "Mechanical, electrical, plumbing and low-voltage", range: "$1.05M – $1.25M", note: "On a home of this size at this elevation." },  // CONFIRM
    honest: "When a bid on a mountain home comes in surprisingly low, this room is almost always where the money was taken out.",
    ask: "Ask to see a closeout binder."
  },
  {
    slug: "envelope",
    number: "07",
    where: "Deck & Exterior",
    title: "Snow, water, and twenty winters",
    preview: "The roof, siding and deck details built for freeze and thaw, and what the envelope cost.",
    photo: "assets/img/home-3.jpg",
    lede: "Park City has two seasons that matter to a building: freeze and thaw. Everything outside this wall is designed for the transition between them.",
    body: [
      "Ice damming, snow load, wind-driven water and thermal cycling do more damage to homes here than anything else. The details that prevent it — self-adhered underlayment, real flashing at every penetration, a drainage plane behind the siding, a ventilated roof assembly — add cost and disappear from view when the house is finished.",
      "The deck is structurally separated and drained so water and snowmelt never sit against the building. It costs more to build a deck that way. It is the difference between resealing it and rebuilding it."
    ],
    facts: [
      ["Roof assembly", "Ventilated, standing seam"],   // CONFIRM
      ["Snow load design", "Per county, plus drift"],
      ["Siding", "Rainscreen, drained and back-vented"],
      ["Deck", "Structurally separated, drained"]
    ],
    cost: { label: "Exterior envelope, roof and decks", range: "$890,000 – $1.02M" },  // CONFIRM
    honest: "We have replaced decks in this valley that were nine years old and built by someone else. That is a preventable expense.",
    ask: "Ask about ice damming on your lot's orientation."
  },
  {
    slug: "site",
    number: "08",
    where: "Garage & Site",
    title: "Why the lot sets the budget",
    preview: "Slope, rock, access and utilities — the biggest variable in your number, and it is settled before design starts.",
    photo: "assets/img/skyridge-2.jpg",
    lede: "Two identical houses on two different Skyridge lots can differ by seven figures before anyone chooses a countertop.",
    body: [
      "Slope, rock, access, utility runs, retaining, drainage and how much of the year you can actually work — this is where a build budget is won or lost, and it is settled before design ever starts.",
      "If you own a lot, we will walk it with you and give you a real range before you commission a design. If you do not own one yet, walk it with us before you buy. The cheapest hour anyone spends on a custom home is the one standing on dirt with a builder who will tell them the truth."
    ],
    facts: [
      ["Site work on this home", "$740,000"],       // CONFIRM
      ["Excavation", "Rock encountered at 6 ft"],   // CONFIRM
      ["Retaining", "Engineered, 2 walls"],         // CONFIRM
      ["Drive", "Snowmelted, heated apron"]
    ],
    cost: { label: "Site, excavation, retaining, utilities and flatwork", range: "$620,000 – $860,000", note: "Highly lot-dependent, and the single biggest variable in your budget." },  // CONFIRM
    honest: "We hit rock at six feet on this lot. It added about $80,000 and eleven days. The owner knew the day we found it, not on the next draw.",  // CONFIRM
    ask: "Bring us your lot. We'll walk it."
  }
];
