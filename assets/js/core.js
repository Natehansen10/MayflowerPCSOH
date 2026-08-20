/* =============================================================================
   Core — storage, lead submission (with offline queue), small UI helpers.
   No dependencies. Works from file:// or any static host.
   ========================================================================== */

const MF = (() => {
  const K_SAVED = "mf.saved.v1";
  const K_PLAN  = "mf.plan.v1";
  const K_QUEUE = "mf.queue.v1";
  const K_SENT  = "mf.sent.v1";

  /* ---- storage (never throws — private browsing, full disk, etc.) -------- */
  function get(k, fallback) {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { return false; }
  }

  /* ---- saved stations ---------------------------------------------------- */
  const saved = {
    all:   () => get(K_SAVED, []),
    has:   s  => get(K_SAVED, []).indexOf(s) > -1,
    toggle(s) {
      const a = get(K_SAVED, []);
      const i = a.indexOf(s);
      if (i > -1) a.splice(i, 1); else a.push(s);
      set(K_SAVED, a);
      return i === -1;
    }
  };

  const plan = {
    get:  () => get(K_PLAN, null),
    set:  v  => set(K_PLAN, v),
    clear:() => { try { localStorage.removeItem(K_PLAN); } catch (e) {} }
  };

  /* ---- lead submission ---------------------------------------------------
     Cell service inside a full house on a busy showcase weekend is unreliable.
     Every lead is written to the device first, then transmitted. Anything that
     fails is retried on the next page load, when the device comes back online,
     and once more via sendBeacon when the page is hidden. A lead is never lost
     because a bar of signal wasn't there.
  ------------------------------------------------------------------------- */
  function queueAdd(payload) {
    const q = get(K_QUEUE, []);
    q.push({ id: payload.id, tries: 0, payload });
    set(K_QUEUE, q);
  }
  function queueDrop(id) {
    set(K_QUEUE, get(K_QUEUE, []).filter(i => i.id !== id));
    const s = get(K_SENT, []); s.push(id); set(K_SENT, s.slice(-50));
  }

  function post(payload) {
    const url = (typeof CONFIG !== "undefined" && CONFIG.endpoint) || "";
    if (!url) return Promise.reject(new Error("no-endpoint"));
    // text/plain keeps this a "simple" request — no CORS preflight, which
    // Google Apps Script web apps do not answer.
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow"
    }).then(r => {
      if (!r.ok) throw new Error("http-" + r.status);
      return r.text();
    });
  }

  function flush() {
    const q = get(K_QUEUE, []);
    if (!q.length || !navigator.onLine) return;
    q.forEach(item => {
      if (item.tries > 8) return;
      item.tries++;
      post(item.payload).then(() => queueDrop(item.id)).catch(() => {});
    });
    set(K_QUEUE, get(K_QUEUE, []));
  }

  function beacon() {
    const url = (typeof CONFIG !== "undefined" && CONFIG.endpoint) || "";
    const q = get(K_QUEUE, []);
    if (!url || !q.length || !navigator.sendBeacon) return;
    q.forEach(item => {
      try {
        navigator.sendBeacon(url, new Blob([JSON.stringify(item.payload)],
          { type: "text/plain;charset=utf-8" }));
      } catch (e) {}
    });
  }

  /* Returns a promise that resolves true if transmitted, false if queued.
     Either way the lead is durably stored on the device.                    */
  function submit(payload) {
    payload.id = payload.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
    payload.ts = new Date().toISOString();
    payload.ua = navigator.userAgent.slice(0, 180);
    queueAdd(payload);
    return post(payload)
      .then(() => { queueDrop(payload.id); return true; })
      .catch(() => false);
  }

  function pending() { return get(K_QUEUE, []).length; }

  /* ---- UI helpers -------------------------------------------------------- */
  let toastEl, toastTimer;
  function toast(msg, ms) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    requestAnimationFrame(() => toastEl.classList.add("on"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("on"), ms || 2200);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function qs(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function station(slug) {
    return STATIONS.find(s => s.slug === slug) || null;
  }

  /* ---- shared chrome ----------------------------------------------------- */
  function footer() {
    const el = document.querySelector("[data-footer]");
    if (!el) return;
    el.innerHTML =
      '<div class="wrap">' +
      '<img src="assets/img/logo.png" alt="Mayflower Luxury Homes">' +
      '<p>' + esc(CONFIG.event.name) + '</p>' +
      '<p><a href="' + esc(CONFIG.contact.website) + '">mayflowerluxuryhomes.com</a> &nbsp;·&nbsp; ' +
      '<a href="mailto:' + esc(CONFIG.contact.curtis.email) + '">' + esc(CONFIG.contact.curtis.email) + '</a></p>' +
      '<p class="tiny" style="margin-top:1.2rem;max-width:44ch;margin-inline:auto">' +
      'Figures shown throughout are preliminary planning ranges for a home of the type described. ' +
      'They are not a bid, an estimate, or an offer.</p>' +
      '</div>';
  }

  function boot() {
    footer();
    flush();
    window.addEventListener("online", flush);
    window.addEventListener("pagehide", beacon);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") beacon();
    });
  }

  return { saved, plan, submit, flush, pending, toast, esc, qs, station, boot, get, set };
})();

document.addEventListener("DOMContentLoaded", MF.boot);
