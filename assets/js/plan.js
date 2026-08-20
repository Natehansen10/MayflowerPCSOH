/* =============================================================================
   Plan Your Build — the configurator, the brief, and the capture.
   ========================================================================== */
function renderPlan() {
  var e = MF.esc;
  var answers = MF.plan.get() || {
    community: null, sqft: MODEL.sqft.default, tier: null,
    site: null, lotStatus: null, timeline: null, role: null
  };
  var stepIndex = 0;

  /* ---- step definitions -------------------------------------------------- */
  var steps = [
    {
      key: "community",
      q: "Where are you building?",
      sub: "Or where you'd like to. The community changes the number more than most people expect.",
      render: function () { return optList("community", MODEL.communities.map(function (c) {
        return { id: c.id, title: c.name };
      })); }
    },
    {
      key: "sqft",
      q: "How big, roughly?",
      sub: "Conditioned square feet — living space, not garage or covered deck.",
      render: function () {
        return '<div class="sfbox">' +
          '<div class="sfval"><span id="sfv">' + answers.sqft.toLocaleString() + '</span><span>sf</span></div>' +
          '<input type="range" id="sf" min="' + MODEL.sqft.min + '" max="' + MODEL.sqft.max +
          '" step="' + MODEL.sqft.step + '" value="' + answers.sqft + '">' +
          '<div class="scale"><span>' + MODEL.sqft.min.toLocaleString() + '</span>' +
          '<span>' + MODEL.sqft.max.toLocaleString() + '+</span></div></div>' +
          '<p class="tiny">For reference, the home you\'re standing in is ' +
          CONFIG.home.sqft.toLocaleString() + ' sf.</p>' +
          '<button class="btn" id="sfnext" style="margin-top:1.6rem">Continue</button>';
      },
      after: function () {
        var sl = document.getElementById("sf"), out = document.getElementById("sfv");
        sl.addEventListener("input", function () {
          answers.sqft = Number(sl.value);
          out.textContent = answers.sqft.toLocaleString();
        });
        document.getElementById("sfnext").addEventListener("click", function () {
          save(); go(stepIndex + 1);
        });
      }
    },
    {
      key: "tier",
      q: "What level of finish?",
      sub: "Read the materials, not the labels. This is the difference between a good house and an expensive one.",
      render: function () { return optList("tier", MODEL.tiers.map(function (t) {
        return { id: t.id, title: t.name, sub: t.summary, detail: t.detail };
      })); }
    },
    {
      key: "site",
      q: "What does the ground look like?",
      sub: "The single biggest variable in a mountain build, and the one settled before design even starts.",
      render: function () { return optList("site", MODEL.sites.map(function (s) {
        return { id: s.id, title: s.name, sub: s.blurb };
      })); }
    },
    {
      key: "lotStatus",
      q: "Where are you with a lot?",
      sub: null,
      render: function () { return optList("lotStatus", MODEL.lotStatus.map(function (l) {
        return { id: l.id, title: l.name };
      })); }
    },
    {
      key: "timeline",
      q: "When would you want to start?",
      sub: "Design and permitting run six to eleven months before a shovel moves, so \"now\" means starting design.",
      render: function () { return optList("timeline", MODEL.timelines.map(function (t) {
        return { id: t.id, title: t.name };
      })); }
    },
    {
      key: "role",
      q: "Last one — who are we talking to?",
      sub: "So we send you something useful instead of something generic.",
      render: function () { return optList("role", MODEL.roles.map(function (r) {
        return { id: r.id, title: r.name };
      })); }
    }
  ];

  function optList(key, items) {
    return '<div class="opts">' + items.map(function (it) {
      return '<button class="opt' + (answers[key] === it.id ? " on" : "") + '" data-k="' + key + '" data-v="' + it.id + '">' +
        '<b>' + e(it.title) + '</b>' +
        (it.sub ? '<small>' + e(it.sub) + '</small>' : '') +
        (it.detail ? '<em>' + e(it.detail) + '</em>' : '') +
        '</button>';
    }).join("") + '</div>';
  }

  function save() { MF.plan.set(answers); }

  /* ---- navigation -------------------------------------------------------- */
  function renderProgress() {
    document.getElementById("prog").innerHTML =
      steps.map(function (_, i) { return '<i class="' + (i <= stepIndex ? "on" : "") + '"></i>'; }).join("");
  }

  function go(i) {
    if (i >= steps.length) return showResult();
    stepIndex = i;
    var s = steps[i];
    var host = document.getElementById("steps");
    host.innerHTML =
      '<div class="step on">' +
      '<p class="qnum">Question ' + (i + 1) + ' of ' + steps.length + '</p>' +
      '<p class="q">' + e(s.q) + '</p>' +
      (s.sub ? '<p class="qsub">' + e(s.sub) + '</p>' : '<div style="height:1.4rem"></div>') +
      s.render() +
      (i > 0 ? '<button class="btn ghost" id="back" style="margin-top:.4rem">Back</button>' : '') +
      '</div>';

    host.querySelectorAll(".opt").forEach(function (b) {
      b.addEventListener("click", function () {
        answers[b.dataset.k] = b.dataset.v;
        save();
        host.querySelectorAll('[data-k="' + b.dataset.k + '"]').forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        setTimeout(function () { go(stepIndex + 1); }, 170);
      });
    });
    if (s.after) s.after();
    var back = document.getElementById("back");
    if (back) back.addEventListener("click", function () { go(stepIndex - 1); });

    /* The explanation earns its space on the first screen and is in the way on
       every screen after it.                                                 */
    var intro = document.getElementById("planintro");
    if (intro) intro.style.display = i === 0 ? "" : "none";

    renderProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---- the brief --------------------------------------------------------- */
  function showResult() {
    document.getElementById("steps").style.display = "none";
    document.getElementById("prog").style.display = "none";
    var intro = document.getElementById("planintro");
    if (intro) intro.style.display = "none";
    var r = document.getElementById("result");
    r.style.display = "block";

    var est = estimate(answers);
    var sc = scoreLead({
      role: answers.role, lotStatus: answers.lotStatus, timeline: answers.timeline,
      saved: MF.saved.all()
    }, est);

    var savedStations = MF.saved.all()
      .map(function (s) { return MF.station(s); })
      .filter(Boolean);

    var html = '';

    html += '<div class="headline"><span class="eyebrow">Preliminary range</span>' +
      '<div class="big">' + fmtRange(est.total) + '</div>' +
      '<p class="sub">' + est.sf.toLocaleString() + ' sf · ' + e(est.tier.name) + ' finish · ' +
      e(est.community.name) + ' · ' + e(est.site.name.toLowerCase()) + ' site<br>' +
      '$' + est.psfLow.toLocaleString() + '–$' + est.psfHigh.toLocaleString() +
      ' per square foot of hard cost</p></div>';

    html += '<p>That is the number a builder will usually not give you until you have paid an architect. It is a range, it is preliminary, and the ground under your lot can move it. It is still close enough to plan around.</p>';

    /* --- breakdown --- */
    html += '<span class="eyebrow">Where it goes</span><div class="bd">';
    html += row("Home — shell, systems and finishes", fmtRange(est.shell));
    html += row("Site, excavation, retaining and flatwork", fmtRange(est.sitework),
      "The most lot-dependent line on this page.");
    html += row("Design, engineering, permits and fees", fmtRange(est.soft),
      "About " + Math.round(MODEL.softCostPct * 100) + "% of hard cost.");
    html += row("Contingency we'd recommend carrying", fmtRange(est.contingency),
      Math.round(MODEL.contingencyPct * 100) + "%. Homes that don't carry it borrow it later.");
    html += '<div class="row total"><span>Total project</span><span>' + fmtRange(est.total) + '</span></div>';
    html += '</div><p class="tiny">Excludes land, furnishings, and any HOA or club initiation.</p>';

    /* --- schedule --- */
    html += '<hr class="rule"><span class="eyebrow">How long</span>' +
      '<h2 style="margin:.7rem 0 .3rem">' + est.months.totalLow + ' to ' + est.months.totalHigh + ' months</h2>' +
      '<p class="small muted" style="margin-bottom:1.6rem">From the first design meeting to the day you move in.</p>';

    var maxM = est.months.totalHigh;
    html += '<div class="gantt">' +
      bar("Design", est.months.design, 0, maxM, "var(--warm)") +
      bar("Permitting & bidding", est.months.permit, est.months.design[0], maxM, "var(--tan)") +
      bar("Construction", est.months.build, est.months.design[0] + est.months.permit[0], maxM, "var(--bronze)") +
      '</div>';

    /* --- draw curve --- */
    html += '<hr class="rule"><span class="eyebrow">What the money does</span>' +
      '<h2 style="margin:.7rem 0 .3rem">Monthly draws</h2>' +
      '<p class="small muted" style="margin-bottom:.5rem">Construction spends on a curve, not a straight line. Months ' +
        peakWindow(est) + ' are the heavy ones. That is when framing, structure and mechanical all land at once.</p>' +
      drawChart(est) +
      '<p class="tiny">Peak month around ' + fmtMoney(Math.max.apply(null, est.draws.map(function (d) { return d.amount; })), 1) + '.</p>';

    /* --- disclaimer --- */
    html += '<div class="disc"><strong>Read this part.</strong> These figures are a planning range built from what homes like this have actually cost us to build in this valley, adjusted for what you told us. They are not a bid, an estimate, or an offer, and no one should make a purchase decision on them alone. A real number requires a real design and a real lot. We will give you one of those for free once you have both.</div>';

    if (savedStations.length) {
      html += '<hr class="rule"><span class="eyebrow">Saved to your file</span><ul class="st-list" style="margin-top:1rem">' +
        savedStations.map(function (s) {
          return '<li><a href="station.html?s=' + s.slug + '"><span class="st-num">' + s.number + '</span>' +
            '<span class="st-txt"><span class="st-where">' + e(s.where) + '</span>' +
            '<strong>' + e(s.title) + '</strong></span></a></li>';
        }).join("") + '</ul>';
    }

    /* --- capture --- */
    html += '<hr class="rule"><span class="eyebrow">Keep it</span>' +
      '<h2 style="margin:.7rem 0 1rem">We\'ll send you the full brief</h2>' +
      '<p>A written version of everything above, plus the allowance schedule and draw structure we would actually use on a home like this. It arrives within a few minutes, from Curtis directly, and we don\'t pass your details to anyone else.</p>' +
      '<form id="cap" novalidate style="margin-top:1.8rem">' +
      field("name", "Name", "text", "name") +
      field("email", "Email", "email", "email") +
      field("phone", "Mobile (optional)", "tel", "tel") +
      '<label class="check" id="walkw"><input type="checkbox" id="walk"><span class="box"></span>' +
      '<span><b>I\'d like to walk a lot or another Mayflower home</b>' +
      '<small>Curtis or Dave, an hour, no charge. This is the one that actually matters.</small></span></label>' +
      '<label class="check" id="lotsw"><input type="checkbox" id="lots"><span class="box"></span>' +
      '<span><b>Tell me when Skyridge lots come available</b>' +
      '<small>A short note when something worth knowing about comes up. Not a newsletter.</small></span></label>' +
      '<div class="field" style="margin-top:1.1rem"><label for="notes">Anything you want us to know</label>' +
      '<textarea id="notes" placeholder="The lot, the architect, what you\'re trying to build, what you\'re worried about."></textarea></div>' +
      '<button class="btn" type="submit" id="send" style="margin-top:.6rem">Send me the brief</button>' +
      '<p class="tiny" style="margin-top:1rem">We don\'t sell or share this. If you\'d rather just talk, Curtis is at ' +
      '<a href="tel:' + CONFIG.contact.curtis.phone.replace(/[^0-9+]/g, "") + '">' + e(CONFIG.contact.curtis.phone) + '</a>.</p>' +
      '</form>';

    html += '<div class="btn-row" style="margin-top:2.4rem"><button class="btn ghost" id="redo">Start over</button></div>';

    r.innerHTML = html;
    window.scrollTo({ top: 0, behavior: "smooth" });

    /* anonymous signal — tells Curtis what visitors are configuring even when
       they don't hand over an email. No personal data in this one.          */
    MF.submit({ type: "config", answers: answers, est: briefNumbers(est), score: sc.score, tier: sc.tier });

    wireCapture(est, sc);
  }

  /* the stretch of months carrying at least 80% of the peak draw */
  function peakWindow(est) {
    var peak = Math.max.apply(null, est.draws.map(function (d) { return d.amount; }));
    var hot = est.draws.filter(function (d) { return d.amount >= peak * 0.8; });
    var a = hot[0].month, b = hot[hot.length - 1].month;
    return a === b ? String(a) : a + " through " + b;
  }

  function row(label, val, sub) {
    return '<div class="row"><span>' + e(label) + (sub ? '<small>' + e(sub) + '</small>' : '') +
      '</span><span>' + e(val) + '</span></div>';
  }

  function bar(label, months, offset, max, color) {
    var left = (offset / max) * 100;
    var span = months[1] - months[0];
    return '<div class="g"><div class="glabel"><b>' + e(label) + '</b><span>' +
      months[0] + '–' + months[1] + ' months</span></div>' +
      '<div class="gbar"><i style="left:' + left.toFixed(1) + '%;width:' +
      Math.min(100 - left, ((months[1]) / max) * 100).toFixed(1) + '%;background:' + color +
      ';opacity:' + (span > 0 ? ".55" : "1") + '"></i>' +
      '<i style="left:' + left.toFixed(1) + '%;width:' +
      Math.min(100 - left, ((months[0]) / max) * 100).toFixed(1) + '%;background:' + color + '"></i></div></div>';
  }

  function drawChart(est) {
    var d = est.draws, W = 100, H = 40, pad = 1;
    var max = Math.max.apply(null, d.map(function (x) { return x.amount; }));
    var bw = (W - pad * 2) / d.length;
    var bars = d.map(function (x, i) {
      var h = (x.amount / max) * (H - 6);
      return '<rect x="' + (pad + i * bw + bw * 0.14).toFixed(2) + '" y="' + (H - h).toFixed(2) +
        '" width="' + (bw * 0.72).toFixed(2) + '" height="' + h.toFixed(2) +
        '" fill="#836F4E" opacity="' + (0.45 + 0.5 * (x.amount / max)).toFixed(2) + '"/>';
    }).join("");
    var cum = d.map(function (x, i) {
      return (pad + i * bw + bw / 2).toFixed(2) + "," + (H - (x.cumulative / est.draws[d.length - 1].cumulative) * (H - 6)).toFixed(2);
    }).join(" ");
    return '<svg class="chart" viewBox="0 0 100 44" preserveAspectRatio="none" role="img" ' +
      'aria-label="Monthly construction draw curve over ' + d.length + ' months">' +
      bars +
      '<polyline points="' + cum + '" fill="none" stroke="#96BBDA" stroke-width=".6" vector-effect="non-scaling-stroke"/>' +
      '<line x1="0" y1="' + H + '" x2="100" y2="' + H + '" stroke="rgba(66,64,58,.18)" stroke-width=".3"/>' +
      '<text x="0" y="43.5" font-size="2.4" fill="#A79E86">Month 1</text>' +
      '<text x="100" y="43.5" font-size="2.4" fill="#A79E86" text-anchor="end">Month ' + d.length + '</text>' +
      '</svg>';
  }

  function field(id, label, type, ac) {
    return '<div class="field" id="f_' + id + '"><label for="' + id + '">' + e(label) + '</label>' +
      '<input id="' + id + '" type="' + type + '" autocomplete="' + ac + '"' +
      (type === "email" ? ' inputmode="email"' : '') + '>' +
      '<div class="errmsg">Please check this.</div></div>';
  }

  function briefNumbers(est) {
    return {
      sqft: est.sf, tier: est.tier.name, community: est.community.name, site: est.site.name,
      psf: est.psfLow + "-" + est.psfHigh,
      totalLow: Math.round(est.total[0]), totalHigh: Math.round(est.total[1]),
      hardLow: Math.round(est.hard[0]), hardHigh: Math.round(est.hard[1]),
      siteLow: Math.round(est.sitework[0]), siteHigh: Math.round(est.sitework[1]),
      softLow: Math.round(est.soft[0]), softHigh: Math.round(est.soft[1]),
      contLow: Math.round(est.contingency[0]), contHigh: Math.round(est.contingency[1]),
      totalRange: fmtRange(est.total),
      monthsLow: est.months.totalLow, monthsHigh: est.months.totalHigh,
      buildMonths: est.months.build[0]
    };
  }

  /* ---- capture form ------------------------------------------------------ */
  function wireCapture(est, sc) {
    /* The <input> is inside the <label>, so the browser toggles it natively on
       click. Only mirror that state into the class — never toggle by hand, or
       a label click cancels itself out.                                      */
    ["walkw", "lotsw"].forEach(function (id) {
      var w = document.getElementById(id);
      var cb = w.querySelector("input");
      cb.addEventListener("change", function () { w.classList.toggle("on", cb.checked); });
    });

    document.getElementById("redo").addEventListener("click", function () {
      MF.plan.clear();
      MF.navTo("plan.html");
    });

    document.getElementById("cap").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = document.getElementById("name").value.trim();
      var email = document.getElementById("email").value.trim();
      var phone = document.getElementById("phone").value.trim();
      var ok = true;

      setErr("name", !name);   if (!name) ok = false;
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      setErr("email", !emailOk); if (!emailOk) ok = false;
      if (!ok) { MF.toast("Just the name and email, then it's yours."); return; }

      var payload = {
        type: "lead",
        name: name, email: email, phone: phone,
        wantsWalk: document.getElementById("walk").checked,
        wantsLots: document.getElementById("lots").checked,
        notes: document.getElementById("notes").value.trim(),
        answers: answers,
        saved: MF.saved.all(),
        est: briefNumbers(est),
        home: CONFIG.home.name,
        event: CONFIG.event.name
      };
      var s2 = scoreLead({
        role: answers.role, lotStatus: answers.lotStatus, timeline: answers.timeline,
        wantsWalk: payload.wantsWalk, phone: phone, saved: payload.saved, notes: payload.notes
      }, est);
      payload.score = s2.score;
      payload.tier = s2.tier;
      payload.why = s2.why;

      var btn = document.getElementById("send");
      btn.disabled = true;
      btn.textContent = "Sending…";

      MF.submit(payload).then(function (sent) { thanks(payload, sent); });
    });
  }

  function setErr(id, bad) {
    document.getElementById("f_" + id).classList.toggle("err", !!bad);
  }

  function thanks(p, sent) {
    var r = document.getElementById("result");
    var walk = p.wantsWalk;
    var hot = p.tier === "A" || p.tier === "B";
    var c = CONFIG.contact.curtis;

    r.innerHTML =
      '<div class="headline"><span class="eyebrow">' + (sent ? "Sent" : "Saved") + '</span>' +
      '<div class="big">Thank you, ' + e(p.name.split(" ")[0]) + '.</div>' +
      '<p class="sub">' + (sent
        ? "Your brief is on its way to " + e(p.email) + "."
        : "Saved. It will send the moment your phone finds signal again — keep this page open a minute if you can.") +
      '</p></div>' +
      '<p>' + (walk
        ? "You asked to walk a lot. That's the part we're actually good at. " + e(c.name) +
          " will call you within a day to find an hour that works — bring the lot, the plans, or nothing at all."
        : hot
          ? e(c.name) + " will follow up personally in the next day or so. Not a sequence, an actual email from him."
          : "We'll send you something worth reading every month or two. Nothing more than that unless you ask.") +
      '</p>' +
      '<p>If you\'d rather not wait, he\'s at <a href="tel:' + c.phone.replace(/[^0-9+]/g, "") + '">' + e(c.phone) +
      '</a> and he answers his own phone.</p>' +
      '<hr class="rule">' +
      '<div class="btn-row"><a class="btn" href="index.html">Back to the build file</a>' +
      '<a class="btn ghost" href="tel:' + c.phone.replace(/[^0-9+]/g, "") + '">Call ' + e(c.name) + '</a></div>';
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---- start ------------------------------------------------------------- */
  go(0);
}
