(function () {
  "use strict";

  /* =====================================================================
     SOMMAIRE
     1. Configuration (modes, déblocages, niveaux)
     2. Éléments du DOM
     3. État du jeu
     4. Stockage (localStorage)
     5. XP et niveaux
     6. Interface : thèmes, modes, légende, XP
     7. Son
     8. Confettis
     9. Plateau : apparition et clic des carrés
    10. Défi des touches Z / Q / S / D
    11. Défi du levier (molette)
    12. Personnage qui court
    13. Déroulement d'une partie (start, tick, finish, lettres, score)
    14. Remise à zéro et code secret
    15. Initialisation
     ===================================================================== */


  /* =====================================================================
     1. CONFIGURATION
     ===================================================================== */

  var DURATION = 30000;
  var DEFAULT_COLORS = ["#ff5d73", "#3ddbb0", "#5ab0ff"];

  var MODES = {
    facile: {
      life: [2300, 1400], gap: [1200, 800],
      trap: 0, trapFrom: 0, gold: 0.12, burst: 0, armor: 0, miss: 0,
      clock: 0.06, bomb: 0.03, star: 0.05, freeze: 0.03,
      letter: 0.20, letterGoal: 3, letterMax: 3, letterBonus: 50,
      key: { every: 10000, win: 3000 },
      lever: { win: 5000, boost: 8000 }
    },
    normale: {
      life: [1500, 750], gap: [900, 380],
      trap: 0.14, trapFrom: 4000, gold: 0.10, burst: 0.15, armor: 0.08, miss: 0,
      clock: 0.05, bomb: 0.04, star: 0.05, freeze: 0.03,
      letter: 0.20, letterGoal: 5, letterMax: 6, letterBonus: 100,
      key: { every: 8000, win: 2200 },
      lever: { win: 4000, boost: 7000 }
    },
    difficile: {
      life: [1000, 480], gap: [650, 300],
      trap: 0.24, trapFrom: 2000, gold: 0.08, burst: 0.3, armor: 0.16, miss: 1,
      clock: 0.04, bomb: 0.04, star: 0.04, freeze: 0.03,
      letter: 0.25, letterGoal: 10, letterMax: 11, letterBonus: 500,
      key: { every: 6000, win: 1600 },
      lever: { win: 3000, boost: 6000 }
    }
  };

  var MODE_LABEL = { facile: "Facile", normale: "Normale", difficile: "Difficile" };

  // Niveau minimum pour jouer chaque mode
  var UNLOCK = { facile: 1, normale: 5, difficile: 11 };

  // Niveau minimum pour chaque fonctionnalité
  var FEATURE = {
    gold: 2, keys: 3, letter: 4, clock: 6, lever: 7,
    armor: 8, runner: 9, bomb: 9, burst: 10, star: 12, freeze: 13
  };

  // Niveau minimum pour chaque thème
  var SKIN_LEVEL = { classique: 1, neon: 3, foret: 7, braise: 10 };

  // Liste affichée pour « Prochain déblocage » et à la fin de partie
  var UNLOCKS = [
    { lvl: 2, name: "Carrés dorés" },
    { lvl: 3, name: "Lettres Z, Q, S, D" },
    { lvl: 3, name: "Thème Néon" },
    { lvl: 4, name: "Lettres cachées" },
    { lvl: 5, name: "Mode Normale" },
    { lvl: 6, name: "Carrés horloge" },
    { lvl: 7, name: "Levier" },
    { lvl: 7, name: "Thème Forêt" },
    { lvl: 8, name: "Carrés blindés" },
    { lvl: 9, name: "Personnage" },
    { lvl: 9, name: "Carrés bombe" },
    { lvl: 10, name: "Rafales" },
    { lvl: 10, name: "Thème Braise" },
    { lvl: 11, name: "Mode Difficile" },
    { lvl: 12, name: "Carrés étoile" },
    { lvl: 13, name: "Carrés gel" }
  ];

  var SQ_LETTERS = ["a", "e", "k", "m", "p", "r", "t", "w"];
  var KEYS = ["z", "q", "s", "d"];

  var SENS = { basse: 350, normale: 200, haute: 100 };

  var RUNNER_CHANCE = 0.15;
  var RUNNER_TIME = 20000;
  var RUNNER = {
    facile:    { speed: 280, gap: [1.3, 2.2], wide: 18, bonus: 100 },
    normale:   { speed: 340, gap: [1.0, 1.8], wide: 26, bonus: 150 },
    difficile: { speed: 420, gap: [0.8, 1.4], wide: 34, bonus: 200 }
  };
  var CW = 720;        // largeur du canvas du personnage
  var GROUND = 112;    // hauteur du sol
  var CHAR_X = 90;
  var CHAR_W = 30;
  var CHAR_H = 38;
  var GRAV = 2200;
  var JUMP_V = 640;

  var CODE = "311314f12";

  // Niveau maximum : celui que donne le code secret
  var TOP_LEVEL = 13;

  // Succès. Chaque test reçoit le bilan de la partie :
  // { score, maxCombo, clicks, accuracy, mode, claimed, runnerWon, boosted }
  var ACHIEVEMENTS = [
    { id: "first",    label: "Première partie",              test: function () { return true; } },
    { id: "score50",  label: "50 points en une partie",      test: function (g) { return g.score >= 50; } },
    { id: "score150", label: "150 points en une partie",     test: function (g) { return g.score >= 150; } },
    { id: "combo20",  label: "Série de 20",                  test: function (g) { return g.maxCombo >= 20; } },
    { id: "precise",  label: "Précision de 90 % (30 clics)", test: function (g) { return g.clicks >= 30 && g.accuracy >= 90; } },
    { id: "letters",  label: "Bonus des lettres gagné",      test: function (g) { return g.claimed; } },
    { id: "runner",   label: "Personnage mené au bout",      test: function (g) { return g.runnerWon; } },
    { id: "boost",    label: "Boost ×5 déclenché",           test: function (g) { return g.boosted; } },
    { id: "hard100",  label: "100 points en difficile",      test: function (g) { return g.mode === "difficile" && g.score >= 100; } }
  ];

  var KEY = {
    xp: "carre-rush-xp",
    bests: "carre-rush-bests",
    top: "carre-rush-top",
    mode: "carre-rush-mode",
    sens: "carre-rush-sens",
    skin: "carre-rush-skin",
    mute: "carre-rush-mute",
    ach: "carre-rush-ach",
    stats: "carre-rush-stats"
  };


  /* =====================================================================
     2. ÉLÉMENTS DU DOM
     ===================================================================== */

  function $(id) {
    return document.getElementById(id);
  }

  var board = $("board");
  var overlay = $("overlay");

  var el = {
    score: $("vScore"),
    time: $("vTime"),
    combo: $("vCombo"),
    best: $("vBest"),
    bar: $("bar"),
    title: $("ovTitle"),
    big: $("ovScore"),
    text: $("ovText"),
    legend: $("ovLegend"),
    btn: $("startBtn")
  };

  var modeBtns = document.querySelectorAll(".mode");
  var skinBtns = document.querySelectorAll(".skin");
  var sensBtns = document.querySelectorAll(".sbtn");
  var keycaps = document.querySelectorAll(".keycap");

  var legTrap = $("legTrap");
  var legArmor = $("legArmor");
  var legGold = $("legGold");
  var legClock = $("legClock");
  var legBomb = $("legBomb");
  var legStar = $("legStar");
  var legFreeze = $("legFreeze");

  var resetBtn = $("resetBtn");
  var muteBtn = $("muteBtn");
  var top5El = $("top5");

  var keysPanel = $("keysPanel");
  var keyMsg = $("keyMsg");
  var keyBar = $("keyBar");

  var leverPanel = $("leverPanel");
  var leverBody = $("leverBody");
  var leverHandle = $("leverHandle");
  var leverVal = $("leverVal");
  var leverMsg = $("leverMsg");
  var leverBar = $("leverBar");
  var ticksEl = $("ticks");
  var scoreStat = $("score");

  var runEl = $("runner");
  var runCanvas = $("runCanvas");
  var runCtx = runCanvas.getContext("2d");
  var runMsg = $("runMsg");
  var runBar = $("runBar");

  var claimBox = $("claim");
  var claimInput = $("claimInput");
  var claimMsg = $("claimMsg");
  var modesBox = $("modes");

  var achList = $("achList");
  var statsLine = $("statsLine");


  /* =====================================================================
     3. ÉTAT DU JEU
     ===================================================================== */

  // Progression (sauvegardée)
  var xpTotal = 0;
  var modeName = "facile";
  var mode = MODES.facile;
  var bests = { facile: 0, normale: 0, difficile: 0 };
  var best = 0;
  var skinName = "classique";
  var skinColors = DEFAULT_COLORS.slice();
  var sensName = "normale";
  var muted = false;

  // Partie en cours
  var playing = false;
  var score = 0;
  var combo = 0;
  var maxCombo = 0;
  var startAt = 0;
  var endAt = 0;
  var tickId = null;
  var spawnId = null;
  var cells = [];

  // Lettres cachées
  var letterCount = 0;
  var letterDone = false;
  var letterLog = [];
  var claimedBonus = false;
  var claimTries = 0;
  var claimNeed = 0;

  // Précision, gel et succès
  var clicks = 0;
  var hits = 0;
  var freezeUntil = 0;
  var freezeId = null;
  var flags = { runnerWon: false, boosted: false };
  var achieved = {};
  var stats = { games: 0, clicks: 0, hits: 0, bestCombo: 0 };

  // Défi des touches
  var keyActive = null;
  var keyPromptId = null;
  var keyExpireId = null;
  var keyMsgId = null;

  // Défi du levier
  var leverValue = 5;
  var leverTarget = null;
  var leverPromptId = null;
  var leverExpireId = null;
  var leverMsgId = null;
  var boostId = null;
  var boostUntil = 0;
  var wheelAcc = 0;
  var lastWheelEvt = 0;
  var lastWheelStep = 0;
  var commitId = null;

  // Personnage
  var runner = null;
  var runnerUsed = false;
  var runRollId = null;
  var runRaf = 0;
  var runHideId = null;

  // Divers
  var actx = null;
  var confCanvas = null;
  var confRaf = 0;
  var resetTimer = null;
  var codeBuffer = "";
  var MAX_XP = 0;
  for (var lv = 1; lv < TOP_LEVEL; lv++) {
    MAX_XP += xpNeed(lv);
  }


  /* =====================================================================
     4. STOCKAGE
     ===================================================================== */

  function load(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch (e) {}
  }

  function forget(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }

  function loadJSON(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function loadProgress() {
    xpTotal = parseInt(load(KEY.xp), 10) || 0;

    var level = levelInfo(xpTotal).level;
    var savedBests = loadJSON(KEY.bests, {});
    for (var k in bests) {
      bests[k] = parseInt(savedBests[k], 10) || 0;
    }

    var savedMode = load(KEY.mode);
    if (MODES[savedMode] && level >= UNLOCK[savedMode]) {
      modeName = savedMode;
      mode = MODES[savedMode];
    }
    best = bests[modeName];

    var savedSkin = load(KEY.skin);
    if (SKIN_LEVEL[savedSkin] && level >= SKIN_LEVEL[savedSkin]) {
      skinName = savedSkin;
    }

    var savedSens = load(KEY.sens);
    if (SENS[savedSens]) {
      sensName = savedSens;
    }

    muted = load(KEY.mute) === "1";

    achieved = loadJSON(KEY.ach, {});

    var savedStats = loadJSON(KEY.stats, {});
    stats = {
      games: parseInt(savedStats.games, 10) || 0,
      clicks: parseInt(savedStats.clicks, 10) || 0,
      hits: parseInt(savedStats.hits, 10) || 0,
      bestCombo: parseInt(savedStats.bestCombo, 10) || 0
    };
  }


  /* =====================================================================
     5. XP ET NIVEAUX
     ===================================================================== */

  function xpNeed(L) {
    return 100 + 40 * (L - 1);
  }

  function levelInfo(total) {
    var L = 1;
    var rem = total;
    while (rem >= xpNeed(L)) {
      rem -= xpNeed(L);
      L++;
    }
    return { level: L, cur: rem, need: xpNeed(L) };
  }

  function featureOn(name) {
    return levelInfo(xpTotal).level >= FEATURE[name];
  }


  /* =====================================================================
     6. INTERFACE : THÈMES, MODES, LÉGENDE, XP
     ===================================================================== */

  function updateLegend() {
    legTrap.hidden = mode.trap === 0;
    legArmor.hidden = mode.armor === 0 || !featureOn("armor");
    legGold.hidden = !featureOn("gold");
    legClock.hidden = !featureOn("clock");
    legBomb.hidden = !featureOn("bomb");
    if (legStar) legStar.hidden = !featureOn("star");
    if (legFreeze) legFreeze.hidden = !featureOn("freeze");
  }

  function readSkinColors() {
    var cs = getComputedStyle(document.documentElement);
    return ["--coral", "--mint", "--sky"].map(function (v, i) {
      return cs.getPropertyValue(v).trim() || DEFAULT_COLORS[i];
    });
  }

  function applySkin(name) {
    skinName = name;

    if (name === "classique") {
      document.documentElement.removeAttribute("data-skin");
    } else {
      document.documentElement.setAttribute("data-skin", name);
    }

    skinColors = readSkinColors();

    for (var j = 0; j < skinBtns.length; j++) {
      skinBtns[j].setAttribute(
        "aria-pressed",
        skinBtns[j].getAttribute("data-skin") === name ? "true" : "false"
      );
    }

    save(KEY.skin, name);
  }

  function refreshSkins() {
    var level = levelInfo(xpTotal).level;

    for (var j = 0; j < skinBtns.length; j++) {
      var name = skinBtns[j].getAttribute("data-skin");
      var locked = level < SKIN_LEVEL[name];
      var label = skinBtns[j].querySelector(".sl");

      skinBtns[j].disabled = locked;
      if (label) {
        label.textContent = locked ? "niv. " + SKIN_LEVEL[name] : "";
      }
    }

    if (level < SKIN_LEVEL[skinName]) {
      applySkin("classique");
    }
  }

  function setMode(name) {
    if (levelInfo(xpTotal).level < UNLOCK[name]) return;

    modeName = name;
    mode = MODES[name];
    best = bests[name];
    el.best.textContent = best;

    updateLegend();
    updateGoalUi();

    for (var j = 0; j < modeBtns.length; j++) {
      modeBtns[j].setAttribute(
        "aria-pressed",
        modeBtns[j].getAttribute("data-mode") === name ? "true" : "false"
      );
    }

    save(KEY.mode, name);
  }

  function setSens(name) {
    sensName = name;

    for (var j = 0; j < sensBtns.length; j++) {
      sensBtns[j].setAttribute(
        "aria-pressed",
        sensBtns[j].getAttribute("data-sens") === name ? "true" : "false"
      );
    }

    save(KEY.sens, name);
  }

  function nextUnlock(level) {
    for (var u = 0; u < UNLOCKS.length; u++) {
      if (UNLOCKS[u].lvl > level) return UNLOCKS[u];
    }
    return null;
  }

  function updateXpUi() {
    refreshSkins();

    var inf = levelInfo(xpTotal);

    $("xpLevel").textContent = "Niv. " + inf.level;
    $("xpFill").style.transform = "scaleX(" + inf.cur / inf.need + ")";
    $("xpText").textContent = inf.cur + " / " + inf.need + " XP";

    for (var q = 0; q < modeBtns.length; q++) {
      var name = modeBtns[q].getAttribute("data-mode");
      var locked = inf.level < UNLOCK[name];

      modeBtns[q].disabled = locked;
      modeBtns[q].querySelector(".ml").textContent =
        locked ? "niv. " + UNLOCK[name] : "";
    }

    if (keysPanel) keysPanel.classList.toggle("locked", !featureOn("keys"));
    if (leverPanel) leverPanel.classList.toggle("locked", !featureOn("lever"));

    var nx = nextUnlock(inf.level);
    $("nextUnlock").textContent = nx
      ? "Prochain déblocage : " + nx.name + " au niveau " + nx.lvl
      : "Tout est débloqué";

    idleKeyMsg();
    idleLeverMsg();
    updateLegend();
    updateGoalUi();
  }

  function mult() {
    return Math.min(4, 1 + Math.floor(combo / 5));
  }

  function boostOn() {
    return boostUntil > performance.now();
  }

  function boostFactor() {
    return boostOn() ? 5 : 1;
  }

  function updateGoalUi() {
    var g = $("letterGoal");
    if (!g) return;

    g.hidden = !featureOn("letter");
    g.classList.toggle("done", !!letterDone);

    if (letterDone) {
      g.textContent =
        "Objectif atteint : entre tes lettres à la fin pour +" +
        mode.letterBonus + " points";
      return;
    }

    g.textContent =
      "Lettres cachées trouvées : " + letterCount + " / " + mode.letterGoal +
      (mode.letterMax > mode.letterGoal ? " ou " + mode.letterMax : "") +
      " pour +" + mode.letterBonus +
      " points (lettres à entrer à la fin)";
  }

  function updateHud(remaining) {
    if (combo > maxCombo) {
      maxCombo = combo;
    }

    el.score.textContent = score;
    el.combo.textContent = "x" + mult();
    el.time.textContent = Math.max(0, Math.ceil(remaining / 1000));

    // La barre tient compte du temps gagné avec les carrés horloge
    var total = Math.max(DURATION, endAt - startAt);
    var f = Math.min(1, Math.max(0, remaining / total));

    el.bar.style.transform = "scaleX(" + f + ")";
    el.bar.classList.toggle("low", remaining < 8000);
  }

  function refreshHud() {
    updateHud(endAt - performance.now());
  }


  /* =====================================================================
     7. SON
     ===================================================================== */

  // Chaque note : [fréquence, durée, forme d'onde, volume, délai]
  var SOUNDS = {
    pop:   [[520, 0.07, "triangle"]],
    hit:   [[330, 0.06, "square", 0.04]],
    gold:  [[784, 0.09, "square", 0.05], [1175, 0.14, "square", 0.05, 0.08]],
    clock: [[660, 0.1, "sine", 0.08], [990, 0.18, "sine", 0.08, 0.09]],
    trap:  [[150, 0.25, "sawtooth", 0.07]],
    miss:  [[200, 0.08, "square", 0.03]],
    good:  [[600, 0.08, "triangle"], [900, 0.12, "triangle", 0.06, 0.07]],
    bad:   [[180, 0.3, "sawtooth", 0.06]],
    boost: [[440, 0.1, "square", 0.05], [660, 0.1, "square", 0.05, 0.1], [880, 0.2, "square", 0.05, 0.2]],
    level: [
      [523, 0.16, "triangle", 0.07, 0],
      [659, 0.16, "triangle", 0.07, 0.11],
      [784, 0.16, "triangle", 0.07, 0.22],
      [1047, 0.16, "triangle", 0.07, 0.33]
    ],
    win: [
      [784, 0.12, "triangle", 0.07],
      [988, 0.12, "triangle", 0.07, 0.12],
      [1319, 0.3, "triangle", 0.07, 0.24]
    ],
    end: [[400, 0.15, "triangle", 0.06], [300, 0.3, "triangle", 0.06, 0.15]]
  };

  function tone(freq, dur, type, vol, delay) {
    if (muted) return;

    try {
      if (!actx) {
        actx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (actx.state === "suspended") {
        actx.resume();
      }

      var osc = actx.createOscillator();
      var gain = actx.createGain();
      var t = actx.currentTime + (delay || 0);

      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(vol || 0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(gain);
      gain.connect(actx.destination);

      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch (e) {}
  }

  function sfx(name) {
    var notes = SOUNDS[name] || [];
    for (var i = 0; i < notes.length; i++) {
      tone(notes[i][0], notes[i][1], notes[i][2], notes[i][3], notes[i][4]);
    }
  }

  function showMute() {
    muteBtn.textContent = muted ? "Son coupé" : "Son activé";
    muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
  }


  /* =====================================================================
     8. CONFETTIS
     ===================================================================== */

  function confetti() {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    if (!confCanvas) {
      confCanvas = document.createElement("canvas");
      confCanvas.style.cssText =
        "position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:50";
      confCanvas.setAttribute("aria-hidden", "true");
      document.body.appendChild(confCanvas);
    }

    var W = (confCanvas.width = window.innerWidth);
    var H = (confCanvas.height = window.innerHeight);
    var cx = confCanvas.getContext("2d");
    var cols = ["#ff5d73", "#3ddbb0", "#5ab0ff", "#ffc233"];
    var parts = [];

    for (var i = 0; i < 130; i++) {
      parts.push({
        x: W / 2 + (Math.random() - 0.5) * 80,
        y: H * 0.35,
        vx: (Math.random() - 0.5) * 900,
        vy: -300 - Math.random() * 700,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 5,
        r: Math.random() * 6,
        vr: (Math.random() - 0.5) * 12,
        c: cols[i % 4]
      });
    }

    cancelAnimationFrame(confRaf);

    var t0 = performance.now();
    var last = t0;

    function frame(now) {
      var dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;

      cx.clearRect(0, 0, W, H);

      for (var j = 0; j < parts.length; j++) {
        var q = parts[j];

        q.vy += 1400 * dt;
        q.vx *= 0.99;
        q.x += q.vx * dt;
        q.y += q.vy * dt;
        q.r += q.vr * dt;

        cx.save();
        cx.translate(q.x, q.y);
        cx.rotate(q.r);
        cx.fillStyle = q.c;
        cx.fillRect(-q.w / 2, -q.h / 2, q.w, q.h);
        cx.restore();
      }

      if (now - t0 < 2400) {
        confRaf = requestAnimationFrame(frame);
      } else {
        cx.clearRect(0, 0, W, H);
      }
    }

    frame(t0);
  }


  /* =====================================================================
     9. PLATEAU : APPARITION ET CLIC DES CARRÉS
     ===================================================================== */

  function buildBoard() {
    for (var i = 0; i < 16; i++) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cell";
      btn.setAttribute("aria-label", "Case " + (i + 1));

      var sq = document.createElement("span");
      sq.className = "sq";

      btn.appendChild(sq);
      board.appendChild(btn);

      cells.push({ btn: btn, sq: sq, type: null, timer: null, hp: 1, letter: "" });

      btn.addEventListener("click", onCell.bind(null, i));
    }
  }

  function clearCell(c) {
    clearTimeout(c.timer);
    c.type = null;
    c.sq.className = "sq";
    c.sq.style.background = "";
  }

  function addTime(ms) {
    endAt += ms;
  }

  // Choisit le type d'un nouveau carré
  function pickType(elapsed) {
    var r = Math.random();

    if (mode.trap && elapsed > mode.trapFrom && r < mode.trap) {
      return "trap";
    }
    if (featureOn("gold") && r > 1 - mode.gold) {
      return "gold";
    }
    if (mode.armor && featureOn("armor") && elapsed > 3000 && Math.random() < mode.armor) {
      return "armor";
    }
    if (featureOn("letter") && elapsed > 3000 && Math.random() < mode.letter) {
      return "letter";
    }
    if (featureOn("bomb") && elapsed > 6000 && Math.random() < mode.bomb) {
      return "bomb";
    }
    if (featureOn("clock") && elapsed > 5000 && Math.random() < mode.clock) {
      return "clock";
    }
    if (featureOn("star") && elapsed > 4000 && Math.random() < mode.star) {
      return "star";
    }
    if (featureOn("freeze") && elapsed > 6000 && Math.random() < mode.freeze) {
      return "freeze";
    }
    return "normal";
  }

  function placeOne(elapsed, p) {
    var free = [];
    for (var i = 0; i < cells.length; i++) {
      if (!cells[i].type) free.push(i);
    }
    if (!free.length) return;

    var c = cells[free[Math.floor(Math.random() * free.length)]];
    var type = pickType(elapsed);

    var lifeFactor = type === "gold" ? 0.7 : type === "armor" ? 1.3 : 1;
    // Pendant le gel, les carrés restent plus longtemps
    var life =
      (mode.life[0] + (mode.life[1] - mode.life[0]) * p) *
      lifeFactor *
      (freezeOn() ? 1.5 : 1);

    c.type = type;
    c.hp = type === "armor" ? 2 : 1;

    if (type === "letter") {
      c.letter = SQ_LETTERS[Math.floor(Math.random() * SQ_LETTERS.length)];
    }

    c.sq.className = "sq on" + (type === "normal" ? "" : " " + type);

    c.sq.style.background =
      type === "normal" || type === "letter"
        ? skinColors[Math.floor(Math.random() * skinColors.length)]
        : "";

    c.sq.style.setProperty("--life", life + "ms");

    // Relance l'animation CSS
    c.sq.style.animation = "none";
    void c.sq.offsetWidth;
    c.sq.style.animation = "";

    c.timer = setTimeout(function () {
      clearCell(c);
    }, life);
  }

  function spawn() {
    if (!playing) return;

    // Temps réellement écoulé (le temps gagné ne rend pas le jeu plus facile)
    var elapsed = performance.now() - startAt;
    var p = Math.min(1, Math.max(0, elapsed / DURATION));

    placeOne(elapsed, p);

    if (mode.burst && featureOn("burst") && elapsed > 2000 && Math.random() < mode.burst) {
      placeOne(elapsed, p);
      if (p > 0.5 && Math.random() < 0.5) {
        placeOne(elapsed, p);
      }
    }

    // Pendant le gel, les carrés arrivent aussi plus lentement
    spawnId = setTimeout(
      spawn,
      (mode.gap[0] + (mode.gap[1] - mode.gap[0]) * p) * (freezeOn() ? 1.8 : 1)
    );
  }

  function popText(c, txt, neg) {
    var s = document.createElement("span");

    s.className = "pop" + (neg ? " neg" : "");
    s.textContent = txt;
    c.btn.appendChild(s);

    s.addEventListener("animationend", function () {
      s.remove();
    });

    setTimeout(function () {
      if (s.parentNode) s.remove();
    }, 800);
  }

  /* ----- Actions selon le type de carré touché ----- */

  function hitEmpty(c) {
    combo = 0;

    if (mode.miss) {
      score = Math.max(0, score - mode.miss);
      popText(c, "−" + mode.miss, true);
    }

    c.btn.classList.remove("miss");
    void c.btn.offsetWidth;
    c.btn.classList.add("miss");

    sfx("miss");
  }

  function hitLetter(c) {
    combo++;

    score += mult() * boostFactor();

    letterCount++;
    letterLog.push(c.letter);
    popText(c, c.letter.toUpperCase(), false);
    sfx("gold");

    if (!letterDone && letterCount >= mode.letterGoal) {
      letterDone = true;
      sfx("level");
    }

    updateGoalUi();
    clearCell(c);
  }

  // La bombe détruit tous les autres carrés : les lettres comptent +1
  // mais ne sont pas notées, car on n'a pas pu les lire.
  function hitBomb(c) {
    var total = 0;

    for (var i = 0; i < cells.length; i++) {
      var other = cells[i];
      if (other === c || !other.type) continue;

      if (other.type === "gold") {
        total += 5;
      } else if (other.type === "armor") {
        total += 3;
      } else if (other.type === "clock") {
        addTime(3000);
      } else if (other.type !== "trap" && other.type !== "bomb") {
        total += 1;
      }

      clearCell(other);
    }

    total *= boostFactor();

    combo++;
    score += total;

    popText(c, "+" + total, false);
    sfx("level");
    clearCell(c);
  }

  function hitArmorFirst(c) {
    c.hp--;
    c.sq.classList.add("hit");
    popText(c, "1/2", false);
    sfx("hit");
  }

  function hitTrap(c) {
    score = Math.max(0, score - 3);
    combo = 0;

    popText(c, "−3", true);
    sfx("trap");
    clearCell(c);
  }

  function hitClock(c) {
    addTime(3000);
    combo++;

    popText(c, "+3 s", false);
    sfx("clock");
    clearCell(c);
  }

  function freezeOn() {
    return freezeUntil > performance.now();
  }

  function clearFreeze() {
    clearTimeout(freezeId);
    freezeUntil = 0;
    board.classList.remove("frozen");
  }

  // Étoile : fait monter la série de 5 d'un coup
  function hitStar(c) {
    combo += 5;

    var gain = 2 * mult() * boostFactor();
    score += gain;

    popText(c, "Série +5", false);
    sfx("good");
    clearCell(c);
  }

  // Gel : ralentit l'apparition des carrés pendant 5 secondes
  function hitFreeze(c) {
    var dur = 5000;

    combo++;
    score += mult() * boostFactor();

    freezeUntil = performance.now() + dur;
    board.classList.add("frozen");

    clearTimeout(freezeId);
    freezeId = setTimeout(clearFreeze, dur);

    popText(c, "Gel 5 s", false);
    sfx("clock");
    clearCell(c);
  }

  // Carré normal, doré ou blindé (2e coup)
  function hitNormal(c) {
    var base = c.type === "gold" ? 5 : c.type === "armor" ? 3 : 1;

    combo++;

    var gain = base * mult() * boostFactor();
    score += gain;

    popText(c, "+" + gain, false);
    sfx(c.type === "gold" ? "gold" : "pop");
    clearCell(c);
  }

  function onCell(i) {
    if (!playing) return;

    var c = cells[i];

    // Précision : un clic dans le vide ou sur un piège est un clic raté
    clicks++;
    if (c.type && c.type !== "trap") hits++;

    switch (c.type) {
      case null:
        hitEmpty(c);
        break;
      case "letter":
        hitLetter(c);
        break;
      case "bomb":
        hitBomb(c);
        break;
      case "trap":
        hitTrap(c);
        break;
      case "clock":
        hitClock(c);
        break;
      case "star":
        hitStar(c);
        break;
      case "freeze":
        hitFreeze(c);
        break;
      case "armor":
        if (c.hp > 1) {
          hitArmorFirst(c);
        } else {
          hitNormal(c);
        }
        break;
      default:
        hitNormal(c);
    }

    refreshHud();
  }


  /* =====================================================================
     10. DÉFI DES TOUCHES Z / Q / S / D
     ===================================================================== */

  function setKeyMsg(text, cls) {
    keyMsg.textContent = text;
    keyMsg.className = "keys-msg " + (cls || "");
  }

  function idleKeyMsg() {
    if (!featureOn("keys")) {
      setKeyMsg("Verrouillé : niveau " + FEATURE.keys, "");
      return;
    }

    setKeyMsg(
      playing ? "Attends la prochaine lettre" : "Une lettre s'allumera pendant la partie",
      ""
    );
  }

  function flashKeyMsg(text, cls) {
    setKeyMsg(text, cls);
    clearTimeout(keyMsgId);
    keyMsgId = setTimeout(idleKeyMsg, 1200);
  }

  function endKey() {
    clearTimeout(keyExpireId);
    keyActive = null;

    for (var j = 0; j < keycaps.length; j++) {
      keycaps[j].classList.remove("on");
    }

    keyBar.classList.remove("run");
  }

  function clearKey() {
    clearTimeout(keyPromptId);
    clearTimeout(keyMsgId);
    endKey();
  }

  function scheduleKey() {
    clearTimeout(keyPromptId);
    if (!featureOn("keys")) return;
    keyPromptId = setTimeout(promptKey, mode.key.every);
  }

  function promptKey() {
    if (!playing) return;

    var letter = KEYS[Math.floor(Math.random() * KEYS.length)];
    keyActive = letter;

    for (var j = 0; j < keycaps.length; j++) {
      keycaps[j].classList.toggle(
        "on",
        keycaps[j].getAttribute("data-key") === letter
      );
    }

    keyBar.style.setProperty("--win", mode.key.win + "ms");
    keyBar.classList.remove("run");
    void keyBar.offsetWidth;
    keyBar.classList.add("run");

    clearTimeout(keyMsgId);
    setKeyMsg("Appuie sur " + letter.toUpperCase() + " !", "go");

    keyExpireId = setTimeout(function () {
      failKey("Trop lent");
    }, mode.key.win);
  }

  function failKey(why) {
    endKey();

    score = Math.max(0, score - 5);
    combo = 0;

    flashKeyMsg(why + " −5", "bad");
    sfx("bad");
    refreshHud();
    scheduleKey();
  }

  function pressKey(letter) {
    if (!playing || !keyActive) return;

    if (letter !== keyActive) {
      failKey("Mauvaise touche");
      return;
    }

    endKey();

    var gain = 10 * boostFactor();
    score += gain;

    flashKeyMsg("Bien joué +" + gain, "ok");
    sfx("good");
    refreshHud();
    scheduleKey();
  }


  /* =====================================================================
     11. DÉFI DU LEVIER (MOLETTE)
     ===================================================================== */

  function setLeverMsg(text, cls) {
    leverMsg.textContent = text;
    leverMsg.className = "keys-msg " + (cls || "");
  }

  function idleLeverMsg() {
    if (!featureOn("lever")) {
      setLeverMsg("Niveau " + FEATURE.lever, "");
      return;
    }

    if (boostOn()) return;

    setLeverMsg(playing ? "Attends le signal" : "Molette de la souris", "");
  }

  function flashLever(text, cls) {
    setLeverMsg(text, cls);
    clearTimeout(leverMsgId);
    leverMsgId = setTimeout(idleLeverMsg, 1200);
  }

  function markTarget(n) {
    for (var j = 0; j < ticksEl.children.length; j++) {
      ticksEl.children[j].classList.toggle("t", j === n);
    }
  }

  function clearTarget() {
    leverTarget = null;
    markTarget(-1);
  }

  function setLever(v) {
    leverValue = Math.max(0, Math.min(10, v));

    leverVal.textContent = leverValue;
    leverHandle.style.setProperty("--p", String(1 - leverValue / 10));
    leverBody.setAttribute("aria-valuenow", String(leverValue));
  }

  function scheduleLever() {
    clearTimeout(leverPromptId);
    if (!featureOn("lever")) return;
    leverPromptId = setTimeout(promptLever, 5000 + Math.random() * 7000);
  }

  function promptLever() {
    if (!playing) return;

    // Cible éloignée d'au moins 3 crans de la position actuelle
    var t;
    do {
      t = Math.floor(Math.random() * 11);
    } while (Math.abs(t - leverValue) < 3);

    leverTarget = t;
    markTarget(t);

    leverBar.className = "";
    leverBar.style.setProperty("--win", mode.lever.win + "ms");
    void leverBar.offsetWidth;
    leverBar.className = "run";

    clearTimeout(leverMsgId);
    setLeverMsg("Mets sur " + t + " !", "go");

    leverExpireId = setTimeout(function () {
      clearTarget();
      leverBar.className = "";
      flashLever("Raté", "bad");
      scheduleLever();
    }, mode.lever.win);
  }

  function startBoost() {
    var dur = mode.lever.boost;

    sfx("boost");
    flags.boosted = true;
    boostUntil = performance.now() + dur;

    leverBar.className = "";
    leverBar.style.setProperty("--win", dur + "ms");
    void leverBar.offsetWidth;
    leverBar.className = "run boosting";

    leverPanel.classList.add("boost");
    scoreStat.classList.add("boost");

    clearTimeout(leverMsgId);
    setLeverMsg("×5 : " + Math.ceil(dur / 1000) + " s", "ok");

    clearTimeout(boostId);
    boostId = setTimeout(endBoost, dur);
  }

  function endBoost() {
    boostUntil = 0;

    leverBar.className = "";
    leverPanel.classList.remove("boost");
    scoreStat.classList.remove("boost");

    idleLeverMsg();

    if (playing) scheduleLever();
  }

  function clearLever() {
    clearTimeout(leverPromptId);
    clearTimeout(leverExpireId);
    clearTimeout(leverMsgId);
    clearTimeout(boostId);
    clearTimeout(commitId);

    boostUntil = 0;
    clearTarget();

    leverBar.className = "";
    leverPanel.classList.remove("boost");
    scoreStat.classList.remove("boost");
  }

  function commitLever() {
    if (!playing || leverTarget === null) return;

    if (leverValue === leverTarget) {
      clearTimeout(leverExpireId);
      clearTarget();
      startBoost();
    }
  }

  function onWheel(e) {
    if (!playing || !featureOn("lever")) return;

    e.preventDefault();

    var d = e.deltaY;
    if (e.deltaMode === 1) d *= 40;
    else if (e.deltaMode === 2) d *= 400;

    var now = performance.now();

    if (now - lastWheelEvt > 250) wheelAcc = 0;
    lastWheelEvt = now;

    if (now - lastWheelStep < 90) return;

    wheelAcc += d;
    if (Math.abs(wheelAcc) < SENS[sensName]) return;

    var dir = wheelAcc > 0 ? 1 : -1;
    wheelAcc = 0;
    lastWheelStep = now;

    setLever(leverValue - dir);

    clearTimeout(commitId);
    commitId = setTimeout(commitLever, 350);
  }


  /* =====================================================================
     12. PERSONNAGE QUI COURT
     ===================================================================== */

  function fillRoundRect(x, y, w, h, r) {
    runCtx.beginPath();
    runCtx.moveTo(x + r, y);
    runCtx.arcTo(x + w, y, x + w, y + h, r);
    runCtx.arcTo(x + w, y + h, x, y + h, r);
    runCtx.arcTo(x, y + h, x, y, r);
    runCtx.arcTo(x, y, x + w, y, r);
    runCtx.closePath();
    runCtx.fill();
  }

  function drawRunner() {
    var c = runCtx;
    var st = runner || { h: 0, t: 0, scroll: 0, obstacles: [] };

    c.clearRect(0, 0, CW, runCanvas.height);

    // Sol
    c.fillStyle = "#9aa0cf";
    c.fillRect(0, GROUND, CW, 3);
    for (var x = -st.scroll; x < CW; x += 40) {
      c.fillRect(x, GROUND + 9, 18, 3);
    }

    // Obstacles
    c.fillStyle = "#ff5d73";
    for (var i = 0; i < st.obstacles.length; i++) {
      var o = st.obstacles[i];
      fillRoundRect(o.x, GROUND - o.h, o.w, o.h, 5);
    }

    // Personnage
    var top = GROUND - st.h - CHAR_H;
    var step = st.h > 0 ? 0 : Math.floor(st.t * 10) % 2;

    c.fillStyle = "#ffc233";
    fillRoundRect(CHAR_X, top, CHAR_W, CHAR_H - 8, 8);
    fillRoundRect(CHAR_X + 4, top + CHAR_H - 10, 8, 10, 3);
    fillRoundRect(CHAR_X + CHAR_W - 12, top + CHAR_H - 10 - (step ? 4 : 0), 8, 10, 3);

    // Yeux
    c.fillStyle = "#1a1530";
    c.fillRect(CHAR_X + 17, top + 8, 5, 7);
    c.fillRect(CHAR_X + 8, top + 8, 5, 7);
  }

  function abortRunner() {
    cancelAnimationFrame(runRaf);
    clearTimeout(runRollId);
    clearTimeout(runHideId);

    runner = null;
    runEl.hidden = true;
    runBar.className = "";
  }

  function scheduleRoll() {
    clearTimeout(runRollId);
    if (!featureOn("runner")) return;
    runRollId = setTimeout(rollRunner, 1000);
  }

  // Tire au sort l'apparition du personnage, chaque seconde,
  // tant qu'il reste assez de temps pour le défi complet.
  function rollRunner() {
    if (!playing || runnerUsed) return;
    if (endAt - performance.now() < RUNNER_TIME + 500) return;

    if (Math.random() < RUNNER_CHANCE) {
      startRunner();
    } else {
      scheduleRoll();
    }
  }

  function startRunner() {
    runnerUsed = true;
    clearTimeout(runHideId);

    var cfg = RUNNER[modeName];

    runner = {
      cfg: cfg,
      h: 0,
      vy: 0,
      obstacles: [],
      nextAt: 1.2,
      t: 0,
      last: performance.now(),
      scroll: 0
    };

    runEl.hidden = false;

    runMsg.textContent =
      "Un personnage ! Espace pour sauter, tiens 20 s : +" + cfg.bonus;
    runMsg.className = "keys-msg go";

    runBar.className = "";
    runBar.style.setProperty("--win", RUNNER_TIME + "ms");
    void runBar.offsetWidth;
    runBar.className = "run";

    runRaf = requestAnimationFrame(runLoop);
  }

  function endRunner(ok) {
    cancelAnimationFrame(runRaf);
    drawRunner();

    var cfg = runner.cfg;
    runner = null;
    runBar.className = "";

    if (ok) {
      flags.runnerWon = true;
      score += cfg.bonus;
      sfx("win");
      refreshHud();

      runMsg.textContent = "Bravo ! +" + cfg.bonus + " points";
      runMsg.className = "keys-msg ok";
    } else {
      sfx("trap");

      runMsg.textContent = "Touché ! Pas de bonus";
      runMsg.className = "keys-msg bad";
    }

    runHideId = setTimeout(function () {
      runEl.hidden = true;
    }, 2200);
  }

  function runLoop(now) {
    if (!runner) return;

    var dt = Math.min(0.05, Math.max(0, (now - runner.last) / 1000));
    runner.last = now;
    runner.t += dt;

    // Saut et gravité
    if (runner.vy !== 0 || runner.h > 0) {
      runner.vy -= GRAV * dt;
      runner.h += runner.vy * dt;

      if (runner.h <= 0) {
        runner.h = 0;
        runner.vy = 0;
      }
    }

    // Défilement du sol et des obstacles
    var sp = runner.cfg.speed;
    runner.scroll = (runner.scroll + sp * dt) % 40;

    for (var i = runner.obstacles.length - 1; i >= 0; i--) {
      runner.obstacles[i].x -= sp * dt;

      if (runner.obstacles[i].x + runner.obstacles[i].w < 0) {
        runner.obstacles.splice(i, 1);
      }
    }

    // Nouvel obstacle
    if (runner.t >= runner.nextAt) {
      runner.obstacles.push({
        x: CW + 10,
        w: 18 + Math.random() * (runner.cfg.wide - 6),
        h: 26 + Math.random() * 26
      });

      var g = runner.cfg.gap;
      runner.nextAt = runner.t + g[0] + (g[1] - g[0]) * Math.random();
    }

    // Collision
    for (var k = 0; k < runner.obstacles.length; k++) {
      var o = runner.obstacles[k];

      if (
        o.x < CHAR_X + CHAR_W - 6 &&
        o.x + o.w > CHAR_X + 6 &&
        runner.h < o.h - 4
      ) {
        endRunner(false);
        return;
      }
    }

    // Victoire
    if (runner.t * 1000 >= RUNNER_TIME) {
      endRunner(true);
      return;
    }

    drawRunner();
    runRaf = requestAnimationFrame(runLoop);
  }

  function doJump() {
    if (runner && runner.h === 0 && runner.vy === 0) {
      runner.vy = JUMP_V;
    }
  }


  /* =====================================================================
     13. DÉROULEMENT D'UNE PARTIE
     ===================================================================== */

  function start() {
    score = 0;
    combo = 0;
    maxCombo = 0;
    letterCount = 0;
    letterDone = false;
    letterLog = [];
    claimedBonus = false;
    clicks = 0;
    hits = 0;
    flags = { runnerWon: false, boosted: false };
    clearFreeze();
    playing = true;

    updateGoalUi();
    cells.forEach(clearCell);

    startAt = performance.now();
    endAt = startAt + DURATION;

    overlay.hidden = true;
    updateHud(DURATION);

    clearInterval(tickId);
    tickId = setInterval(tick, 100);

    clearTimeout(spawnId);
    spawnId = setTimeout(spawn, 300);

    clearKey();
    idleKeyMsg();
    scheduleKey();

    clearLever();
    setLever(5);
    idleLeverMsg();
    scheduleLever();

    abortRunner();
    runnerUsed = false;
    scheduleRoll();
  }

  function tick() {
    var remaining = endAt - performance.now();

    if (remaining <= 0) {
      finish();
      return;
    }

    if (boostOn()) {
      setLeverMsg(
        "×5 : " + Math.ceil((boostUntil - performance.now()) / 1000) + " s",
        "ok"
      );
    }

    updateHud(remaining);
  }

  function finish() {
    playing = false;

    clearInterval(tickId);
    clearTimeout(spawnId);

    cells.forEach(clearCell);

    clearKey();
    idleKeyMsg();

    clearLever();
    idleLeverMsg();

    abortRunner();
    clearFreeze();
    updateHud(0);

    if (letterDone && letterLog.length >= mode.letterGoal) {
      startClaim();
      return;
    }

    finalize();
  }

  /* ----- Saisie des lettres cachées ----- */

  function startClaim() {
    claimTries = 2;
    claimNeed = Math.min(letterLog.length, mode.letterMax);

    el.title.textContent = "Entre tes lettres";
    el.big.hidden = true;
    el.legend.hidden = true;
    modesBox.hidden = true;
    el.btn.hidden = true;
    top5El.hidden = true;

    el.text.textContent =
      "Tu as trouvé " + letterCount + " lettres cachées. Tape les " + claimNeed +
      " premières lettres que tu as trouvées, dans n'importe quel ordre, pour gagner +" +
      mode.letterBonus + " points.";

    claimInput.value = "";
    claimInput.maxLength = claimNeed;
    claimMsg.textContent = "";
    claimBox.hidden = false;
    overlay.hidden = false;

    claimInput.focus();
  }

  function endClaim(ok) {
    claimBox.hidden = true;
    modesBox.hidden = false;
    el.btn.hidden = false;

    if (ok) {
      claimedBonus = true;
      score += mode.letterBonus;
      el.score.textContent = score;
      sfx("level");
    }

    finalize();
  }

  function sortedLetters(arr) {
    return arr.slice().sort().join("");
  }

  function submitClaim() {
    var entered = sortedLetters(
      claimInput.value.toLowerCase().replace(/[^a-z]/g, "").split("")
    );
    var expected = sortedLetters(letterLog.slice(0, claimNeed));

    if (entered === expected) {
      endClaim(true);
      return;
    }

    claimTries--;
    sfx("bad");

    if (claimTries <= 0) {
      endClaim(false);
      return;
    }

    claimMsg.textContent = "Ce n'est pas ça. Il te reste 1 essai.";
    claimInput.select();
  }

  /* ----- Écran de fin ----- */

  function saveRecord() {
    var record = score > best;

    if (record) {
      best = score;
      bests[modeName] = best;
      el.best.textContent = best;
      save(KEY.bests, JSON.stringify(bests));
    }

    return record;
  }

  function addXp() {
    var before = levelInfo(xpTotal).level;

    xpTotal += score;
    save(KEY.xp, xpTotal);

    var after = levelInfo(xpTotal).level;
    updateXpUi();

    var note = "+" + score + " XP";

    for (var u = 0; u < UNLOCKS.length; u++) {
      if (UNLOCKS[u].lvl > before && UNLOCKS[u].lvl <= after) {
        note += ". " + UNLOCKS[u].name + " débloqué !";
      }
    }

    if (after > before) {
      note = "Niveau " + after + " ! " + note;

      setTimeout(function () {
        sfx("level");
        confetti();
      }, 700);
    }

    return note;
  }

  function updateTop5() {
    var tops = loadJSON(KEY.top, {});
    var list = tops[modeName] || [];

    if (score > 0) {
      list.push(score);
      list.sort(function (a, b) {
        return b - a;
      });
      list = list.slice(0, 5);

      tops[modeName] = list;
      save(KEY.top, JSON.stringify(tops));
    }

    top5El.textContent =
      "Top 5 " + MODE_LABEL[modeName] + " : " +
      (list.length ? list.join(" · ") : "aucun score");
    top5El.hidden = false;
  }

  /* ----- Statistiques et succès ----- */

  function accuracyPercent(h, c) {
    return c ? Math.round((h / c) * 100) : 0;
  }

  // Met à jour les statistiques ; renvoie l'ancien record de série
  function recordStats() {
    var previousBest = stats.bestCombo;

    stats.games++;
    stats.clicks += clicks;
    stats.hits += hits;
    if (maxCombo > stats.bestCombo) stats.bestCombo = maxCombo;

    save(KEY.stats, JSON.stringify(stats));
    return previousBest;
  }

  // Débloque les succès atteints ; renvoie la liste des nouveaux
  function unlockAchievements() {
    var report = {
      score: score,
      maxCombo: maxCombo,
      clicks: clicks,
      accuracy: accuracyPercent(hits, clicks),
      mode: modeName,
      claimed: claimedBonus,
      runnerWon: flags.runnerWon,
      boosted: flags.boosted
    };

    var fresh = [];

    ACHIEVEMENTS.forEach(function (a) {
      if (!achieved[a.id] && a.test(report)) {
        achieved[a.id] = true;
        fresh.push(a.label);
      }
    });

    if (fresh.length) save(KEY.ach, JSON.stringify(achieved));
    return fresh;
  }

  function renderAchievements() {
    if (achList) {
      achList.innerHTML = "";

      ACHIEVEMENTS.forEach(function (a) {
        var done = !!achieved[a.id];
        var li = document.createElement("li");

        li.className = done ? "done" : "";
        li.textContent = (done ? "✓ " : "○ ") + a.label;
        achList.appendChild(li);
      });
    }

    if (statsLine) {
      statsLine.textContent =
        "Parties : " + stats.games +
        " · Précision moyenne : " + accuracyPercent(stats.hits, stats.clicks) + " %" +
        " · Meilleure série : " + stats.bestCombo;
    }
  }

  // Texte ajouté à l'écran de fin : précision, record de série, nouveaux succès
  function progressNote() {
    var previousBest = recordStats();
    var fresh = unlockAchievements();

    var text = " Précision : " + accuracyPercent(hits, clicks) + " %.";

    if (previousBest > 0 && maxCombo > previousBest) {
      text += " Nouveau record de série !";
    }
    if (fresh.length) {
      text += " Succès débloqué : " + fresh.join(", ") + ".";
    }

    renderAchievements();
    return text;
  }

  function finalize() {
    var record = saveRecord();

    el.title.textContent = record ? "Nouveau record !" : "Temps écoulé";
    sfx(record ? "win" : "end");

    if (record && score > 0) confetti();

    el.big.hidden = false;
    el.big.textContent = score;

    el.text.textContent = record
      ? "Nouveau record en mode " + modeName + ". Tu peux faire mieux ?"
      : "Ton record en mode " + modeName + " est de " + best + " points.";

    var note = addXp();

    var bonusNote = claimedBonus
      ? " Bonus lettres : +" + mode.letterBonus + "."
      : letterDone ? " Bonus lettres perdu." : "";

    el.text.textContent +=
      " " + note + " Meilleure série : " + maxCombo + "." + bonusNote + progressNote();

    updateTop5();

    el.legend.hidden = true;
    el.btn.textContent = "Rejouer";
    overlay.hidden = false;
    el.btn.focus();
  }


  /* =====================================================================
     14. REMISE À ZÉRO ET CODE SECRET
     ===================================================================== */

  function disarmReset() {
    clearTimeout(resetTimer);
    resetBtn.classList.remove("arm");
    resetBtn.textContent = "Tout redémarrer";
  }

  function flashReset(text, ms) {
    resetBtn.textContent = text;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(disarmReset, ms);
  }

  function resetEverything() {
    for (var name in KEY) {
      forget(KEY[name]);
    }
    // On garde le réglage du son
    save(KEY.mute, muted ? "1" : "0");

    xpTotal = 0;
    bests = { facile: 0, normale: 0, difficile: 0 };

    letterCount = 0;
    letterDone = false;
    letterLog = [];
    claimedBonus = false;

    achieved = {};
    stats = { games: 0, clicks: 0, hits: 0, bestCombo: 0 };
    renderAchievements();

    updateXpUi();
    setMode("facile");
    applySkin("classique");
    setSens("normale");

    top5El.hidden = true;

    el.title.textContent = "Appuie sur les carrés";
    el.big.hidden = true;
    el.text.textContent =
      "30 secondes pour marquer. Chaque point devient de l'XP, qui débloque peu à peu des carrés spéciaux, les lettres, le levier, le personnage, les rafales et les modes de difficulté.";
    el.legend.hidden = false;
    el.btn.textContent = "Jouer";
  }

  function onResetClick() {
    // Pas de remise à zéro pendant la partie ni pendant la saisie des lettres
    if (playing || !claimBox.hidden) {
      flashReset("Impossible pendant la partie", 1800);
      return;
    }

    if (!resetBtn.classList.contains("arm")) {
      resetBtn.classList.add("arm");
      flashReset("Confirmer : tout effacer ?", 4000);
      return;
    }

    resetEverything();
    disarmReset();
    flashReset("Tout est remis à zéro", 1800);
  }

  function isTyping(e) {
    return !!(e.target && e.target.tagName === "INPUT");
  }

  function onSecretCode(e) {
    if (playing || isTyping(e)) return;
    if (e.ctrlKey || e.metaKey || e.altKey || !e.key || e.key.length !== 1) return;

    codeBuffer = (codeBuffer + e.key.toLowerCase()).slice(-CODE.length);
    if (codeBuffer !== CODE) return;

    codeBuffer = "";

    if (xpTotal < MAX_XP) {
      xpTotal = MAX_XP;
    }
    save(KEY.xp, xpTotal);

    updateXpUi();
    $("nextUnlock").textContent =
      "Code accepté : niveau maximum, tout est débloqué";
  }


  /* =====================================================================
     15. INITIALISATION
     ===================================================================== */

  function bindEvents() {
    // Modes, thèmes, sensibilité
    for (var a = 0; a < modeBtns.length; a++) {
      modeBtns[a].addEventListener("click", function () {
        setMode(this.getAttribute("data-mode"));
      });
    }

    for (var b = 0; b < skinBtns.length; b++) {
      skinBtns[b].addEventListener("click", function () {
        applySkin(this.getAttribute("data-skin"));
      });
    }

    for (var c = 0; c < sensBtns.length; c++) {
      sensBtns[c].addEventListener("click", function () {
        setSens(this.getAttribute("data-sens"));
      });
    }

    // Son et remise à zéro
    muteBtn.addEventListener("click", function () {
      muted = !muted;
      save(KEY.mute, muted ? "1" : "0");
      showMute();
    });

    resetBtn.addEventListener("click", onResetClick);

    // Touches Z / Q / S / D (clavier et clic)
    document.addEventListener("keydown", function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || isTyping(e)) return;

      var k = (e.key || "").toLowerCase();
      if (KEYS.indexOf(k) > -1) pressKey(k);
    });

    for (var d = 0; d < keycaps.length; d++) {
      keycaps[d].addEventListener("click", function () {
        pressKey(this.getAttribute("data-key"));
      });
    }

    // Code secret
    document.addEventListener("keydown", onSecretCode);

    // Levier
    document.querySelector(".play").addEventListener("wheel", onWheel, { passive: false });

    // Personnage : saut
    document.addEventListener("keydown", function (e) {
      if (!playing || (e.code !== "Space" && e.key !== " ")) return;

      e.preventDefault();
      if (!e.repeat) doJump();
    });

    document.addEventListener("keyup", function (e) {
      if (playing && (e.code === "Space" || e.key === " ")) {
        e.preventDefault();
      }
    });

    $("jumpBtn").addEventListener("pointerdown", function (e) {
      e.preventDefault();
      doJump();
    });

    // Saisie des lettres
    $("claimOk").addEventListener("click", submitClaim);
    $("claimSkip").addEventListener("click", function () {
      endClaim(false);
    });

    claimInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        submitClaim();
      }
    });

    // Bouton Jouer
    el.btn.addEventListener("click", start);
  }

  function buildLeverTicks() {
    for (var n = 0; n <= 10; n++) {
      var tk = document.createElement("span");
      tk.textContent = n;
      tk.style.top = (1 - n / 10) * 100 + "%";
      ticksEl.appendChild(tk);
    }
  }

  function init() {
    loadProgress();

    buildBoard();
    buildLeverTicks();
    bindEvents();

    applySkin(skinName);
    setSens(sensName);
    setLever(5);
    showMute();
    drawRunner();

    updateXpUi();
    setMode(modeName);
    updateHud(DURATION);
    renderAchievements();
  }

  init();
})();
