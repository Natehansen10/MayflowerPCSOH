/* The home page: hero, the eight stations, the team. Called by index.html and
   by the single-file preview build.                                          */
function renderHome() {
  var h = CONFIG.home;
  document.getElementById("ev").textContent = CONFIG.event.name;
  document.getElementById("herosub").textContent =
    h.name + " · " + h.sqft.toLocaleString() + " sf · " + h.monthsToBuild + " months · " + h.community;

  var img = document.getElementById("heroimg");
  img.onload = function () { img.classList.add("on"); };
  img.src = h.hero;

  var list = document.getElementById("stations");
  list.innerHTML = STATIONS.map(function (s) {
    return '<li><a class="' + (MF.saved.has(s.slug) ? "saved" : "") + '" href="station.html?s=' + s.slug + '">' +
      '<span class="st-num">' + s.number + '</span>' +
      '<span class="st-txt"><strong>' + MF.esc(s.title) + '</strong><span>' + MF.esc(s.where) + '</span></span>' +
      '<span class="st-mark">&#9679;</span></a></li>';
  }).join("");

  var t = CONFIG.contact;
  document.getElementById("team").innerHTML = [t.curtis, t.dave].map(function (p) {
    return '<figure><img src="' + p.photo + '" alt="' + MF.esc(p.name) + '" loading="lazy">' +
      '<figcaption><b>' + MF.esc(p.name) + '</b><span>' + MF.esc(p.role) + '</span></figcaption></figure>';
  }).join("");

  document.getElementById("callcurtis").href = "tel:" + t.curtis.phone.replace(/[^0-9+]/g, "");
}
