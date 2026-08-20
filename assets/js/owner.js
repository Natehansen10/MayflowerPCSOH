/* Owner console: who to call, ranked. Called by owner.html and by the
   single-file preview build.                                              */
function renderOwner() {
  var e = MF.esc;
  var key = MF.qs("key") || "";
  var filter = "hot";
  var data = null;

  var ACTION = {
    A: "Call today. Do not email this one.",
    B: "Personal email within 48 hours.",
    C: "Nurture. No action needed.",
    R: "Agent. Offer a build range for their listings.",
    T: "Trade. Be courteous, spend nothing."
  };

  function load() {
    /* The single-file preview ships a sample dataset so the console can be
       looked at before any real lead exists.                                 */
    if (window.MF_DEMO) { data = window.MF_DEMO; render(); return; }
    if (!CONFIG.endpoint || !key) {
      show('<div class="disc">Open this page as <code>owner.html?key=YOUR_CONSOLE_KEY</code>, ' +
           'and make sure <code>CONFIG.endpoint</code> is set in assets/js/content.js.</div>');
      return;
    }
    var cb = "mfcb" + Date.now();
    window[cb] = function (res) {
      delete window[cb];
      if (!res.ok) { show('<div class="disc">' + e(res.error || "Error") + '</div>'); return; }
      data = res; render();
    };
    var s = document.createElement("script");
    s.src = CONFIG.endpoint + (CONFIG.endpoint.indexOf("?") > -1 ? "&" : "?") +
            "key=" + encodeURIComponent(key) + "&callback=" + cb;
    s.onerror = function () { show('<div class="disc">Could not reach the backend.</div>'); };
    document.body.appendChild(s);
  }

  function show(html) { document.getElementById("body").innerHTML = html; }

  function render() {
    var st = data.stats || {};
    var html = '<div class="stats">' +
      stat(st.total || 0, "Leads") + stat(st.A || 0, "Live") +
      stat(st.walks || 0, "Want a walk") + stat(st.B || 0, "Warm") + '</div>';

    html += '<div class="filters">' +
      ["hot", "all", "walks", "agents"].map(function (f) {
        return '<button data-f="' + f + '" class="' + (f === filter ? "on" : "") + '">' + f + '</button>';
      }).join("") + '</div>';

    var rows = (data.leads || []).filter(function (l) {
      if (filter === "hot") return l.Tier === "A" || l.Tier === "B";
      if (filter === "walks") return l["Wants walk"] === "YES";
      if (filter === "agents") return l.Tier === "R";
      return true;
    }).sort(function (a, b) {
      var t = "ABRCT".indexOf(a.Tier) - "ABRCT".indexOf(b.Tier);
      return t !== 0 ? t : (b.Score || 0) - (a.Score || 0);
    });

    html += rows.length ? rows.map(card).join("") :
      '<p class="muted small">Nothing here yet.</p>';

    show(html);
    document.querySelectorAll(".filters button").forEach(function (b) {
      b.addEventListener("click", function () { filter = b.dataset.f; render(); });
    });
  }

  function stat(n, l) { return '<div><b>' + n + '</b><span>' + l + '</span></div>'; }

  function card(l) {
    var tel = String(l.Phone || "").replace(/[^0-9+]/g, "");
    var when = l.Received ? new Date(l.Received).toLocaleDateString(undefined,
      { month: "short", day: "numeric" }) : "";
    return '<div class="lead ' + e(l.Tier) + '">' +
      '<div class="top"><h3>' + e(l.Name || "(no name)") + '</h3>' +
      '<span class="badge">' + e(l.Tier) + ' · ' + e(l.Score) + '</span></div>' +
      '<p class="meta">' + e(l["Project range"] || "") +
        (l["Sq ft"] ? " · " + e(l["Sq ft"]) + " sf" : "") +
        (l.Community ? " · " + e(l.Community) : "") +
        (l.Finish ? " · " + e(l.Finish) : "") + '</p>' +
      '<p class="meta muted">' + e(l["Lot status"] || "") + " · " + e(l.Timeline || "") +
        " · " + when + '</p>' +
      (l["Wants walk"] === "YES" ? '<p class="todo">Asked to walk a lot.</p>' : '') +
      '<p class="todo">' + e(ACTION[l.Tier] || "") + '</p>' +
      (l.Notes ? '<p class="note">' + e(l.Notes) + '</p>' : '') +
      (l["Why it scored"] ? '<p class="why">' + e(l["Why it scored"]) + '</p>' : '') +
      '<div class="acts">' +
        (tel ? '<a href="tel:' + tel + '">Call</a><a href="sms:' + tel + '">Text</a>' : '') +
        (l.Email ? '<a href="mailto:' + e(l.Email) + '">Email</a>' : '') +
      '</div></div>';
  }

  document.getElementById("refresh").addEventListener("click", function (ev) {
    ev.preventDefault(); show('<p class="muted small">Loading…</p>'); load();
  });

  load();
}
