/* One station page, driven by its slug. Called by station.html and by the
   single-file preview build.                                                 */
function renderStation(slug) {
  slug = slug || MF.qs("s") || STATIONS[0].slug;
  var i = STATIONS.findIndex(function (x) { return x.slug === slug; });
  if (i < 0) i = 0;
  var s = STATIONS[i];
  var prev = STATIONS[i - 1], next = STATIONS[i + 1];
  var e = MF.esc;

  document.title = s.title + " — Mayflower Build File";

  var html = '';

  html += '<div class="st-hero"><img src="' + s.photo + '" alt="">' +
          '<div class="cap"><div class="wrap"><span class="eyebrow">' + s.number + ' &nbsp;/&nbsp; ' + e(s.where) + '</span></div></div></div>';

  html += '<section class="section"><div class="wrap">';
  html += '<h1>' + e(s.title) + '</h1>';
  html += '<p class="lede">' + e(s.lede) + '</p>';
  html += s.body.map(function (p) { return '<p>' + e(p) + '</p>'; }).join("");

  if (s.facts && s.facts.length) {
    html += '<dl class="facts">' + s.facts.map(function (f) {
      return '<div><dt>' + e(f[0]) + '</dt><dd>' + e(f[1]) + '</dd></div>';
    }).join("") + '</dl>';
  }

  if (s.cost) {
    html += '<div class="cost"><span class="eyebrow">' + e(s.cost.label) + '</span>' +
            '<div class="num">' + e(s.cost.range) + '</div>' +
            (s.cost.note ? '<p class="note">' + e(s.cost.note) + '</p>' : '') + '</div>';
  }

  if (s.honest) {
    html += '<div class="honest"><span class="eyebrow">What we\'d rather you hear from us</span><p>' + e(s.honest) + '</p></div>';
  }

  html += '<div class="savebar"><button class="save' + (MF.saved.has(s.slug) ? " on" : "") + '" id="save">' +
          '<span id="savetxt">' + (MF.saved.has(s.slug) ? "Saved to your file" : "Save this detail") + '</span></button></div>';
  html += '<p class="tiny">' + e(s.ask) + ' Curtis or Dave are reachable all week — and what you save here comes with your build brief.</p>';

  html += '<div class="btn-row" style="margin-top:2.2rem"><a class="btn" href="plan.html">Plan your build</a></div>';

  html += '<div class="stnav">' +
    (prev ? '<a href="station.html?s=' + prev.slug + '">&#8592; ' + e(prev.where) + '</a>' : '<a href="index.html">&#8592; All details</a>') +
    (next ? '<a href="station.html?s=' + next.slug + '">' + e(next.where) + ' &#8594;</a>' : '<a href="plan.html">Plan your build &#8594;</a>') +
    '</div>';

  html += '</div></section>';

  document.getElementById("main").innerHTML = html;

  var btn = document.getElementById("save");
  btn.addEventListener("click", function () {
    var on = MF.saved.toggle(s.slug);
    btn.classList.toggle("on", on);
    document.getElementById("savetxt").textContent = on ? "Saved to your file" : "Save this detail";
    MF.toast(on ? "Saved. It'll be in your build brief." : "Removed from your file.");
  });

  window.scrollTo(0, 0);
}
