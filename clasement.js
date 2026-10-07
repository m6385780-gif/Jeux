/* Classement mondial pour Carré Rush.
   1) Déploie worker.js (Cloudflare Worker + KV) et colle son URL ci-dessous.
   2) Ajoute <script src="classement.js"></script> après le.js dans le HTML.
   3) Dans finalize() de le.js, ajoute la ligne de hook (voir instructions). */
(function () {
  var API_URL = ""; // ex. "https://carre-rush.tonnom.workers.dev"
  var MODES = { facile: "Facile", normale: "Normale", difficile: "Difficile" };
  var NAME_KEY = "carre-rush-name";

  var css = document.createElement("style");
  css.textContent =
    ".wb{background:var(--panel);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:10px}" +
    ".wb h2{margin:0;font-family:var(--display);font-weight:800;font-size:.95rem}" +
    ".wb-tabs{display:flex;gap:6px}" +
    ".wb-tabs .sbtn{flex:1}" +
    ".wb-name{display:flex;gap:6px;align-items:center;font-size:.8rem;font-weight:700;color:var(--muted)}" +
    ".wb-name input{flex:1;min-width:0;font:inherit;font-weight:700;color:var(--ink);background:var(--cell);border:2px solid transparent;border-radius:8px;padding:6px 10px}" +
    ".wb-name input:focus-visible{outline:3px solid var(--sky);outline-offset:2px}" +
    ".wb ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;font-variant-numeric:tabular-nums}" +
    ".wb li{display:grid;grid-template-columns:2rem 1fr auto;gap:8px;background:var(--cell);border-radius:8px;padding:6px 10px;font-size:.85rem;font-weight:700}" +
    ".wb li.me{box-shadow:inset 0 0 0 2px var(--amber)}" +
    ".wb li b{font-family:var(--display);color:var(--amber)}" +
    ".wb li span:first-child{color:var(--muted)}" +
    ".wb li span:nth-child(2){overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    ".wb-msg{margin:0;font-size:.78rem;font-weight:700;color:var(--muted);min-height:1.1em}";
  document.head.appendChild(css);

  var box = document.createElement("section");
  box.className = "wb";
  box.setAttribute("aria-label", "Classement mondial");
  box.innerHTML =
    "<h2>Classement mondial</h2>" +
    '<div class="wb-tabs" role="group" aria-label="Mode du classement"></div>' +
    '<label class="wb-name">Pseudo <input id="wbName" type="text" maxlength="16" autocomplete="off" spellcheck="false" placeholder="3 à 16 caractères"></label>' +
    "<ol id=\"wbList\"></ol>" +
    '<p class="wb-msg" id="wbMsg" aria-live="polite"></p>';
  var hint = document.querySelector(".hint");
  hint.parentNode.insertBefore(box, hint);

  var tabs = box.querySelector(".wb-tabs");
  var list = box.querySelector("#wbList");
  var msg = box.querySelector("#wbMsg");
  var nameInput = box.querySelector("#wbName");
  var view = "facile";

  function currentMode() {
    var b = document.querySelector(".mode[aria-pressed='true']");
    return b ? b.getAttribute("data-mode") : "facile";
  }

  function getName() {
    var n = "";
    try { n = localStorage.getItem(NAME_KEY) || ""; } catch (e) {}
    return n;
  }
  function cleanName(s) {
    return String(s || "").replace(/[^\p{L}\p{N} _.\-]/gu, "").trim().slice(0, 16);
  }
  nameInput.value = getName();
  nameInput.addEventListener("change", function () {
    var n = cleanName(nameInput.value);
    nameInput.value = n;
    try { localStorage.setItem(NAME_KEY, n); } catch (e) {}
    render(lastRows);
  });

  Object.keys(MODES).forEach(function (m) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "sbtn";
    b.textContent = MODES[m];
    b.setAttribute("data-m", m);
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () { setView(m); });
    tabs.appendChild(b);
  });

  var lastRows = [];

  function render(rows) {
    lastRows = rows || [];
    list.innerHTML = "";
    var me = cleanName(nameInput.value).toLowerCase();
    lastRows.forEach(function (r, i) {
      var li = document.createElement("li");
      if (me && String(r.name).toLowerCase() === me) li.className = "me";
      var a = document.createElement("span"); a.textContent = i + 1;
      var n = document.createElement("span"); n.textContent = r.name;
      var s = document.createElement("b"); s.textContent = r.score;
      li.appendChild(a); li.appendChild(n); li.appendChild(s);
      list.appendChild(li);
    });
  }

  function setMsg(t) { msg.textContent = t || ""; }

  function load() {
    if (!API_URL) {
      render([]);
      setMsg("Classement non configuré : renseigne API_URL dans classement.js.");
      return Promise.resolve();
    }
    setMsg("Chargement…");
    return fetch(API_URL.replace(/\/$/, "") + "/scores?mode=" + view)
      .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
      .then(function (d) {
        render(d.scores);
        setMsg(d.scores.length ? "" : "Aucun score pour l'instant : sois le premier !");
      })
      .catch(function () { setMsg("Classement indisponible pour le moment."); });
  }

  function setView(m) {
    view = m;
    var bs = tabs.children;
    for (var i = 0; i < bs.length; i++) {
      bs[i].setAttribute("aria-pressed", bs[i].getAttribute("data-m") === m ? "true" : "false");
    }
    load();
  }

  function submit(score, mode) {
    if (!API_URL || !(score > 0)) return;
    var name = cleanName(nameInput.value);
    if (name.length < 3) {
      setView(mode);
      setMsg("Entre un pseudo (3 caractères min.) pour publier tes scores.");
      return;
    }
    setMsg("Envoi du score…");
    fetch(API_URL.replace(/\/$/, "") + "/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, score: score, mode: mode })
    })
      .then(function (r) { if (!r.ok) throw new Error(); })
      .then(function () { setView(mode); })
      .catch(function () { setMsg("Score non envoyé (serveur injoignable)."); });
  }

  // Détection automatique de la fin de partie : le jeu affiche le score final
  // dans #ovScore (il le rend visible en écrivant le score), donc pas besoin de toucher à le.js.
  var ovScore = document.getElementById("ovScore");
  var overlayEl = document.getElementById("overlay");
  new MutationObserver(function () {
    if (ovScore.hidden || overlayEl.hidden) return;
    var s = parseInt(ovScore.textContent, 10);
    if (s > 0) submit(s, currentMode());
  }).observe(ovScore, { attributes: true, attributeFilter: ["hidden"], childList: true, characterData: true, subtree: true });

  // suit le mode choisi dans le jeu
  document.getElementById("modes").addEventListener("click", function () {
    setTimeout(function () { setView(currentMode()); }, 0);
  });

  setView(currentMode());
})();
