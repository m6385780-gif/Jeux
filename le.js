(function () {
  var DURATION = 30000;
  var COLORS = ["#ff5d73", "#3ddbb0", "#5ab0ff"];
  var board = document.getElementById("board");
  var overlay = document.getElementById("overlay");
  var el = {
    score: document.getElementById("vScore"), time: document.getElementById("vTime"),
    combo: document.getElementById("vCombo"), best: document.getElementById("vBest"),
    bar: document.getElementById("bar"), title: document.getElementById("ovTitle"),
    big: document.getElementById("ovScore"), text: document.getElementById("ovText"),
    legend: document.getElementById("ovLegend"), btn: document.getElementById("startBtn")
  };

  var MODES = {
    facile:    { life: [2300, 1400], gap: [1200, 800], trap: 0, trapFrom: 0, gold: 0.12, burst: 0, armor: 0, miss: 0, clock: 0.06, bomb: 0.03, letter: 0.20, letterGoal: 3, letterMax: 3, letterBonus: 50, key: { every: 10000, win: 3000 }, lever: { win: 5000, boost: 8000 } },
    normale:   { life: [1500, 750], gap: [900, 380], trap: 0.14, trapFrom: 4000, gold: 0.10, burst: 0.15, armor: 0.08, miss: 0, clock: 0.05, bomb: 0.04, letter: 0.20, letterGoal: 5, letterMax: 6, letterBonus: 100, key: { every: 8000, win: 2200 }, lever: { win: 4000, boost: 7000 } },
    difficile: { life: [1000, 480], gap: [650, 300], trap: 0.24, trapFrom: 2000, gold: 0.08, burst: 0.3, armor: 0.16, miss: 1, clock: 0.04, bomb: 0.04, letter: 0.25, letterGoal: 10, letterMax: 11, letterBonus: 500, key: { every: 6000, win: 1600 }, lever: { win: 3000, boost: 6000 } }
  };

  var UNLOCK = { facile: 1, normale: 5, difficile: 11 };
  var MODE_LABEL = { facile: "Facile", normale: "Normale", difficile: "Difficile" };
  var FEATURE = { gold: 2, keys: 3, letter: 4, clock: 6, lever: 7, armor: 8, runner: 9, burst: 10, bomb: 9 };
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
    { lvl: 11, name: "Mode Difficile" }
  ];

  function featureOn(f) {
    return levelInfo(xpTotal).level >= FEATURE[f];
  }

  function xpNeed(L) {
    return 100 + 40 * (L - 1);
  }

  function levelInfo(total) {
    var L = 1, rem = total;
    while (rem >= xpNeed(L)) {
      rem -= xpNeed(L);
      L++;
    }
    return { level: L, cur: rem, need: xpNeed(L) };
  }

  var xpTotal = 0;

  try {
    xpTotal = parseInt(localStorage.getItem("carre-rush-xp"), 10) || 0;
  } catch (e) {}

  var modeName = "facile";
  var mode = MODES.facile;

  var bests = {
    facile: 0,
    normale: 0,
    difficile: 0
  };

  try {
    var saved = JSON.parse(localStorage.getItem("carre-rush-bests") || "{}");

    for (var k in bests) {
      bests[k] = parseInt(saved[k], 10) || 0;
    }

    var m = localStorage.getItem("carre-rush-mode");

    if (MODES[m] && levelInfo(xpTotal).level >= UNLOCK[m]) {
      modeName = m;
      mode = MODES[m];
    }
  } catch (e) {}

  var best = bests[modeName];
  el.best.textContent = best;

  var modeBtns = document.querySelectorAll(".mode");

  var legTrap = document.getElementById("legTrap");
  var legArmor = document.getElementById("legArmor");
  var legGold = document.getElementById("legGold");
  var legClock = document.getElementById("legClock");
  var legBomb = document.getElementById("legBomb");

  function updateLegend() {
    legTrap.hidden = mode.trap === 0;
    legArmor.hidden = mode.armor === 0 || !featureOn("armor");
    legGold.hidden = !featureOn("gold");
    legClock.hidden = !featureOn("clock");
    legBomb.hidden = !featureOn("bomb");
  }

  var SKIN_LEVEL = {
    classique: 1,
    neon: 3,
    foret: 7,
    braise: 10
  };

  var SKIN_COLORS = ["#ff5d73", "#3ddbb0", "#5ab0ff"];
  var skinName = "classique";

  try {
    var sk = localStorage.getItem("carre-rush-skin");

    if (SKIN_LEVEL[sk] && levelInfo(xpTotal).level >= SKIN_LEVEL[sk]) {
      skinName = sk;
    }
  } catch (e) {}

  var skinBtns = document.querySelectorAll(".skin");

  function applySkin(name) {
    skinName = name;

    if (name === "classique") {
      document.documentElement.removeAttribute("data-skin");
    } else {
      document.documentElement.setAttribute("data-skin", name);
    }

    var cs = getComputedStyle(document.documentElement);

    SKIN_COLORS = ["--coral", "--mint", "--sky"].map(function (v) {
      return cs.getPropertyValue(v).trim();
    });

    for (var j = 0; j < skinBtns.length; j++) {
      skinBtns[j].setAttribute(
        "aria-pressed",
        skinBtns[j].getAttribute("data-skin") === name ? "true" : "false"
      );
    }

    try {
      localStorage.setItem("carre-rush-skin", name);
    } catch (e) {}
  }

  function refreshSkins() {
    var lv = levelInfo(xpTotal).level;

    for (var j = 0; j < skinBtns.length; j++) {
      var nm = skinBtns[j].getAttribute("data-skin");
      var locked = lv < SKIN_LEVEL[nm];

      skinBtns[j].disabled = locked;

      var sl = skinBtns[j].querySelector(".sl");

      if (sl) {
        sl.textContent = locked ? "niv. " + SKIN_LEVEL[nm] : "";
      }
    }

    if (lv < SKIN_LEVEL[skinName]) {
      applySkin("classique");
    }
  }

  for (var sj = 0; sj < skinBtns.length; sj++) {
    skinBtns[sj].addEventListener("click", function () {
      applySkin(this.getAttribute("data-skin"));
    });
  }

  applySkin(skinName);

  function updateXpUi() {
    refreshSkins();

    var inf = levelInfo(xpTotal);

    document.getElementById("xpLevel").textContent = "Niv. " + inf.level;

    document.getElementById("xpFill").style.transform =
      "scaleX(" + (inf.cur / inf.need) + ")";

    document.getElementById("xpText").textContent =
      inf.cur + " / " + inf.need + " XP";

    for (var q = 0; q < modeBtns.length; q++) {
      var nm = modeBtns[q].getAttribute("data-mode");
      var locked = inf.level < UNLOCK[nm];

      modeBtns[q].disabled = locked;

      modeBtns[q].querySelector(".ml").textContent =
        locked ? "niv. " + UNLOCK[nm] : "";
    }

    var kp = document.getElementById("keysPanel");
    var lp = document.getElementById("leverPanel");

    if (kp) {
      kp.classList.toggle("locked", !featureOn("keys"));
    }

    if (lp) {
      lp.classList.toggle("locked", !featureOn("lever"));
    }

    var nx = null;

    for (var u = 0; u < UNLOCKS.length; u++) {
      if (UNLOCKS[u].lvl > inf.level) {
        nx = UNLOCKS[u];
        break;
      }
    }

    document.getElementById("nextUnlock").textContent =
      nx
        ? "Prochain déblocage : " + nx.name + " au niveau " + nx.lvl
        : "Tout est débloqué";

    if (keyMsg && leverMsg) {
      idleKeyMsg();
      idleLeverMsg();
    }

    if (typeof legGold !== "undefined" && legGold && mode) {
      updateLegend();
    }

    updateGoalUi();
  }

  function setMode(name) {
    if (levelInfo(xpTotal).level < UNLOCK[name]) {
      return;
    }

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

    try {
      localStorage.setItem("carre-rush-mode", name);
    } catch (e) {}
  }

  for (var j = 0; j < modeBtns.length; j++) {
    modeBtns[j].addEventListener("click", function () {
      setMode(this.getAttribute("data-mode"));
    });
  }

  updateXpUi();
  setMode(modeName);

  var resetBtn = document.getElementById("resetBtn");
  var resetTimer = null;

  function disarmReset() {
    clearTimeout(resetTimer);
    resetBtn.classList.remove("arm");
    resetBtn.textContent = "Tout redémarrer";
  }

  resetBtn.addEventListener("click", function () {
    if (playing) {
      resetBtn.textContent = "Impossible pendant la partie";

      clearTimeout(resetTimer);

      resetTimer = setTimeout(disarmReset, 1800);
      return;
    }

    if (!resetBtn.classList.contains("arm")) {
      resetBtn.classList.add("arm");
      resetBtn.textContent = "Confirmer : tout effacer ?";

      clearTimeout(resetTimer);

      resetTimer = setTimeout(disarmReset, 4000);
      return;
    }

    disarmReset();

    [
      "carre-rush-xp",
      "carre-rush-bests",
      "carre-rush-top",
      "carre-rush-mode",
      "carre-rush-sens",
      "carre-rush-skin"
    ].forEach(function (key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    });

    xpTotal = 0;

    bests = {
      facile: 0,
      normale: 0,
      difficile: 0
    };

    updateXpUi();
    setMode("facile");
    applySkin("classique");
    setSens("normale");

    document.getElementById("top5").hidden = true;

    el.title.textContent = "Appuie sur les carrés";
    el.big.hidden = true;

    el.text.textContent =
      "30 secondes pour marquer. Chaque point devient de l'XP, qui débloque peu à peu des carrés spéciaux, les lettres, le levier, le personnage, les rafales et les modes de difficulté.";

    el.legend.hidden = false;
    el.btn.textContent = "Jouer";

    resetBtn.textContent = "Tout est remis à zéro";

    resetTimer = setTimeout(disarmReset, 1800);
  });

  var CODE = "311314f12";
  var typed = "";
  var MAX_XP = 0;

  for (var lv = 1; lv < 11; lv++) {
    MAX_XP += xpNeed(lv);
  }

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) {
      return;
    }

    typed = (typed + e.key.toLowerCase()).slice(-CODE.length);

    if (typed !== CODE) {
      return;
    }

    typed = "";

    if (xpTotal < MAX_XP) {
      xpTotal = MAX_XP;
    }

    try {
      localStorage.setItem("carre-rush-xp", String(xpTotal));
    } catch (err) {}

    updateXpUi();

    document.getElementById("nextUnlock").textContent =
      "Code accepté : niveau maximum, tout est débloqué";
  });

  var actx = null;
  var muted = false;

  try {
    muted = localStorage.getItem("carre-rush-mute") === "1";
  } catch (e) {}

  var muteBtn = document.getElementById("muteBtn");

  function showMute() {
    muteBtn.textContent = muted ? "Son coupé" : "Son activé";

    muteBtn.setAttribute(
      "aria-pressed",
      muted ? "true" : "false"
    );
  }

  muteBtn.addEventListener("click", function () {
    muted = !muted;

    try {
      localStorage.setItem(
        "carre-rush-mute",
        muted ? "1" : "0"
      );
    } catch (e) {}

    showMute();
  });

  showMute();

  function tone(f, d, type, v, delay) {
    if (muted) return;

    try {
      if (!actx) {
        actx = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (actx.state === "suspended") {
        actx.resume();
      }

      var o = actx.createOscillator();
      var g = actx.createGain();

      var t = actx.currentTime + (delay || 0);

      o.type = type || "sine";
      o.frequency.setValueAtTime(f, t);

      g.gain.setValueAtTime(v || 0.06, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);

      o.connect(g);
      g.connect(actx.destination);

      o.start(t);
      o.stop(t + d + 0.02);
    } catch (e) {}
  }

  function sfx(name) {
    switch (name) {
      case "pop":
        tone(520, 0.07, "triangle");
        break;

      case "hit":
        tone(330, 0.06, "square", 0.04);
        break;

      case "gold":
        tone(784, 0.09, "square", 0.05);
        tone(1175, 0.14, "square", 0.05, 0.08);
        break;

      case "clock":
        tone(660, 0.1, "sine", 0.08);
        tone(990, 0.18, "sine", 0.08, 0.09);
        break;

      case "trap":
        tone(150, 0.25, "sawtooth", 0.07);
        break;

      case "miss":
        tone(200, 0.08, "square", 0.03);
        break;

      case "good":
        tone(600, 0.08, "triangle");
        tone(900, 0.12, "triangle", 0.06, 0.07);
        break;

      case "bad":
        tone(180, 0.3, "sawtooth", 0.06);
        break;

      case "boost":
        tone(440, 0.1, "square", 0.05);
        tone(660, 0.1, "square", 0.05, 0.1);
        tone(880, 0.2, "square", 0.05, 0.2);
        break;

      case "level":
        [523, 659, 784, 1047].forEach(function (f, i) {
          tone(f, 0.16, "triangle", 0.07, i * 0.11);
        });
        break;

      case "win":
        tone(784, 0.12, "triangle", 0.07);
        tone(988, 0.12, "triangle", 0.07, 0.12);
        tone(1319, 0.3, "triangle", 0.07, 0.24);
        break;

      case "end":
        tone(400, 0.15, "triangle", 0.06);
        tone(300, 0.3, "triangle", 0.06, 0.15);
        break;
    }
  }

  var confCanvas = null;
  var confRaf = 0;

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

    var W = confCanvas.width = window.innerWidth;
    var H = confCanvas.height = window.innerHeight;

    var cx = confCanvas.getContext("2d");

    var cols = [
      "#ff5d73",
      "#3ddbb0",
      "#5ab0ff",
      "#ffc233"
    ];

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

    (function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);

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
        cx.fillRect(
          -q.w / 2,
          -q.h / 2,
          q.w,
          q.h
        );
        cx.restore();
      }

      if (now - t0 < 2400) {
        confRaf = requestAnimationFrame(frame);
      } else {
        cx.clearRect(0, 0, W, H);
      }
    })(t0);
  }

  var cells = [];

  for (var i = 0; i < 16; i++) {
    var btn = document.createElement("button");

    btn.type = "button";
    btn.className = "cell";
    btn.setAttribute("aria-label", "Case " + (i + 1));

    var sq = document.createElement("span");

    sq.className = "sq";

    btn.appendChild(sq);
    board.appendChild(btn);

    cells.push({
      btn: btn,
      sq: sq,
      type: null,
      timer: null
    });

    btn.addEventListener("click", onCell.bind(null, i));
  }

  var maxCombo = 0;
  var letterCount = 0;
  var letterDone = false;
  var letterLog = [];
  var claimedBonus = false;
  var claimTries = 0;
  var claimNeed = 0;

  var playing = false;
  var score = 0;
  var combo = 0;
  var endAt = 0;
  var tickId = null;
  var spawnId = null;

  function mult() {
    return Math.min(4, 1 + Math.floor(combo / 5));
  }

  function updateGoalUi() {
    var g = document.getElementById("letterGoal");

    if (!g) return;

    g.hidden = !featureOn("letter");
    g.classList.toggle("done", !!letterDone);

    var n = letterCount || 0;

    g.textContent = letterDone
      ? "Objectif atteint : entre tes lettres à la fin pour +" +
        mode.letterBonus +
        " points"
      : "Lettres cachées trouvées : " +
        n +
        " / " +
        mode.letterGoal +
        (mode.letterMax > mode.letterGoal
          ? " ou " + mode.letterMax
          : "") +
        " pour +" +
        mode.letterBonus +
        " points (lettres à entrer à la fin)";
  }

  function updateHud(remaining) {
    if (combo > maxCombo) {
      maxCombo = combo;
    }

    el.score.textContent = score;
    el.combo.textContent = "x" + mult();

    var s = Math.max(
      0,
      Math.ceil(remaining / 1000)
    );

    el.time.textContent = s;

    var f = Math.min(
      1,
      Math.max(0, remaining / DURATION)
    );

    el.bar.style.transform =
      "scaleX(" + f + ")";

    el.bar.classList.toggle(
      "low",
      remaining < 8000
    );
  }

  function clearCell(c) {
    clearTimeout(c.timer);

    c.type = null;

    c.sq.className = "sq";
    c.sq.style.background = "";
  }

  var SQ_LETTERS = [
    "a",
    "e",
    "k",
    "m",
    "p",
    "r",
    "t",
    "w"
  ];

  function placeOne(elapsed, p) {
    var free = [];

    for (var i = 0; i < cells.length; i++) {
      if (!cells[i].type) {
        free.push(i);
      }
    }

    if (!free.length) return;

    var c = cells[
      free[Math.floor(Math.random() * free.length)]
    ];

    var r = Math.random();
    var type = "normal";

    if (
      mode.trap &&
      elapsed > mode.trapFrom &&
      r < mode.trap
    ) {
      type = "trap";
    } else if (
      featureOn("gold") &&
      r > 1 - mode.gold
    ) {
      type = "gold";
    } else if (
      mode.armor &&
      featureOn("armor") &&
      elapsed > 3000 &&
      Math.random() < mode.armor
    ) {
      type = "armor";
    } else if (
      featureOn("letter") &&
      elapsed > 3000 &&
      Math.random() < mode.letter
    ) {
      type = "letter";
    } else if (
      featureOn("bomb") &&
      elapsed > 6000 &&
      Math.random() < mode.bomb
    ) {
      type = "bomb";
    } else if (
      featureOn("clock") &&
      elapsed > 5000 &&
      Math.random() < mode.clock
    ) {
      type = "clock";
    }

    var life =
      (
        mode.life[0] +
        (mode.life[1] - mode.life[0]) * p
      ) *
      (
        type === "gold"
          ? 0.7
          : type === "armor"
            ? 1.3
            : 1
      );

    c.type = type;
    c.hp = type === "armor" ? 2 : 1;

    if (type === "letter") {
      c.letter =
        SQ_LETTERS[
          Math.floor(
            Math.random() * SQ_LETTERS.length
          )
        ];
    }

    c.sq.className =
      "sq on" +
      (type === "normal" ? "" : " " + type);

    c.sq.style.background =
      type === "normal" || type === "letter"
        ? SKIN_COLORS[
            Math.floor(
              Math.random() * SKIN_COLORS.length
            )
          ]
        : "";

    c.sq.style.setProperty(
      "--life",
      life + "ms"
    );

    c.sq.style.animation = "none";

    void c.sq.offsetWidth;

    c.sq.style.animation = "";

    c.timer = setTimeout(function () {
      clearCell(c);
    }, life);
  }

  function spawn() {
    if (!playing) return;

    var elapsed =
      DURATION -
      (endAt - performance.now());

    var p = Math.min(
      1,
      Math.max(0, elapsed / DURATION)
    );

    placeOne(elapsed, p);

    if (
      mode.burst &&
      featureOn("burst") &&
      elapsed > 2000 &&
      Math.random() < mode.burst
    ) {
      placeOne(elapsed, p);

      if (
        p > 0.5 &&
        Math.random() < 0.5
      ) {
        placeOne(elapsed, p);
      }
    }

    spawnId = setTimeout(
      spawn,
      mode.gap[0] +
        (mode.gap[1] - mode.gap[0]) * p
    );
  }

  function popText(c, txt, neg) {
    var s = document.createElement("span");

    s.className = "pop" + (neg ? " neg" : "");
    s.textContent = txt;

    c.btn.appendChild(s);

    s.addEventListener(
      "animationend",
      function () {
        s.remove();
      }
    );

    setTimeout(function () {
      if (s.parentNode) {
        s.remove();
      }
    }, 800);
  }

  function onCell(i) {
    if (!playing) return;

    var c = cells[i];

    if (!c.type) {
      combo = 0;

      if (mode.miss) {
        score = Math.max(
          0,
          score - mode.miss
        );

        popText(
          c,
          "−" + mode.miss,
          true
        );
      }

      c.btn.classList.remove("miss");

      void c.btn.offsetWidth;

      c.btn.classList.add("miss");

      sfx("miss");
    } else if (c.type === "letter") {
      combo++;

      var lgain =
        mult() *
        (boostOn() ? 5 : 1);

      score += lgain;

      var lt = c.letter;

      popText(
        c,
        lt.toUpperCase(),
        false
      );

      sfx("gold");

      letterCount++;
      letterLog.push(lt);

      if (
        !letterDone &&
        letterCount >= mode.letterGoal
      ) {
        letterDone = true;
        sfx("level");
      }

      updateGoalUi();
      clearCell(c);
    } else if (c.type === "bomb") {
      var btot = 0;

      for (var bi = 0; bi < cells.length; bi++) {
        var oc = cells[bi];

        if (oc === c || !oc.type) {
          continue;
        }

        if (oc.type === "gold") {
          btot += 5;
        } else if (oc.type === "armor") {
          btot += 3;
        } else if (oc.type === "clock") {
          endAt += 3000;
        } else if (
          oc.type !== "trap" &&
          oc.type !== "bomb"
        ) {
          btot += 1;
        }

        clearCell(oc);
      }

      btot *= boostOn() ? 5 : 1;

      combo++;
      score += btot;

      popText(
        c,
        "+" + btot,
        false
      );

      sfx("level");
      clearCell(c);
    } else if (
      c.type === "armor" &&
      c.hp > 1
    ) {
      c.hp--;

      c.sq.classList.add("hit");

      popText(
        c,
        "1/2",
        false
      );

      sfx("hit");
    } else if (c.type === "trap") {
      score = Math.max(
        0,
        score - 3
      );

      combo = 0;

      popText(
        c,
        "−3",
        true
      );

      sfx("trap");
      clearCell(c);
    } else if (c.type === "clock") {
      endAt += 3000;

      combo++;

      popText(
        c,
        "+3 s",
        false
      );

      sfx("clock");
      clearCell(c);
    } else {
      var base =
        c.type === "gold"
          ? 5
          : c.type === "armor"
            ? 3
            : 1;

      combo++;

      var gain =
        base *
        mult() *
        (boostOn() ? 5 : 1);

      score += gain;

      popText(
        c,
        "+" + gain,
        false
      );

      sfx(
        c.type === "gold"
          ? "gold"
          : "pop"
      );

      clearCell(c);
    }

    updateHud(
      endAt - performance.now()
    );
  }

  var KEYS = ["z", "q", "s", "d"];

  var keyActive = null;
  var keyPromptId = null;
  var keyExpireId = null;
  var keyMsgId = null;

  var keyMsg =
    document.getElementById("keyMsg");

  var keyBar =
    document.getElementById("keyBar");

  var keycaps =
    document.querySelectorAll(".keycap");

  function setKeyMsg(text, cls) {
    keyMsg.textContent = text;
    keyMsg.className =
      "keys-msg " + (cls || "");
  }

  function idleKeyMsg() {
    if (!featureOn("keys")) {
      setKeyMsg(
        "Verrouillé : niveau " +
          FEATURE.keys,
        ""
      );
      return;
    }

    setKeyMsg(
      playing
        ? "Attends la prochaine lettre"
        : "Une lettre s'allumera pendant la partie",
      ""
    );
  }

  function flashMsg(text, cls) {
    setKeyMsg(text, cls);

    clearTimeout(keyMsgId);

    keyMsgId = setTimeout(
      idleKeyMsg,
      1200
    );
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
    if (!featureOn("keys")) return;

    keyPromptId = setTimeout(
      promptKey,
      mode.key.every
    );
  }

  function promptKey() {
    if (!playing) return;

    var letter =
      KEYS[
        Math.floor(
          Math.random() * KEYS.length
        )
      ];

    keyActive = letter;

    for (var j = 0; j < keycaps.length; j++) {
      keycaps[j].classList.toggle(
        "on",
        keycaps[j].getAttribute("data-key") ===
          letter
      );
    }

    keyBar.style.setProperty(
      "--win",
      mode.key.win + "ms"
    );

    keyBar.classList.remove("run");

    void keyBar.offsetWidth;

    keyBar.classList.add("run");

    clearTimeout(keyMsgId);

    setKeyMsg(
      "Appuie sur " +
        letter.toUpperCase() +
        " !",
      "go"
    );

    keyExpireId = setTimeout(
      function () {
        failKey("Trop lent");
      },
      mode.key.win
    );
  }

  function failKey(why) {
    endKey();

    score = Math.max(
      0,
      score - 5
    );

    combo = 0;

    flashMsg(
      why + " −5",
      "bad"
    );

    sfx("bad");

    updateHud(
      endAt - performance.now()
    );

    scheduleKey();
  }

  function pressKey(letter) {
    if (!playing || !keyActive) return;

    if (letter === keyActive) {
      endKey();

      var kgain =
        10 *
        (boostOn() ? 5 : 1);

      score += kgain;

      flashMsg(
        "Bien joué +" + kgain,
        "ok"
      );

      sfx("good");

      updateHud(
        endAt - performance.now()
      );

      scheduleKey();
    } else {
      failKey("Mauvaise touche");
    }
  }

  document.addEventListener(
    "keydown",
    function (e) {
      if (
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.repeat
      ) {
        return;
      }

      var k =
        (e.key || "").toLowerCase();

      if (KEYS.indexOf(k) > -1) {
        pressKey(k);
      }
    }
  );

  for (var j = 0; j < keycaps.length; j++) {
    keycaps[j].addEventListener(
      "click",
      function () {
        pressKey(
          this.getAttribute("data-key")
        );
      }
    );
  }

  var leverBody =
    document.getElementById("leverBody");

  var leverHandle =
    document.getElementById("leverHandle");

  var leverValue = 5;

  var leverVal =
    document.getElementById("leverVal");

  var leverMsg =
    document.getElementById("leverMsg");

  var leverBar =
    document.getElementById("leverBar");

  var leverPanel =
    document.getElementById("leverPanel");

  var ticksEl =
    document.getElementById("ticks");

  var scoreStat =
    document.getElementById("score");

  var leverTarget = null;
  var leverPromptId = null;
  var leverExpireId = null;
  var leverMsgId = null;
  var boostId = null;
  var boostUntil = 0;

  for (var t0 = 0; t0 <= 10; t0++) {
    var tk = document.createElement("span");

    tk.textContent = t0;

    tk.style.top =
      ((1 - t0 / 10) * 100) + "%";

    ticksEl.appendChild(tk);
  }

  function boostOn() {
    return boostUntil >
      performance.now();
  }

  function setLeverMsg(text, cls) {
    leverMsg.textContent = text;

    leverMsg.className =
      "keys-msg " + (cls || "");
  }

  function idleLeverMsg() {
    if (!featureOn("lever")) {
      setLeverMsg(
        "Niveau " +
          FEATURE.lever,
        ""
      );
      return;
    }

    if (boostOn()) return;

    setLeverMsg(
      playing
        ? "Attends le signal"
        : "Molette de la souris",
      ""
    );
  }

  function flashLever(text, cls) {
    setLeverMsg(text, cls);

    clearTimeout(leverMsgId);

    leverMsgId = setTimeout(
      idleLeverMsg,
      1200
    );
  }

  function markTarget(n) {
    for (
      var j = 0;
      j < ticksEl.children.length;
      j++
    ) {
      ticksEl.children[j].classList.toggle(
        "t",
        j === n
      );
    }
  }

  function clearTarget() {
    leverTarget = null;
    markTarget(-1);
  }

  function scheduleLever() {
    clearTimeout(leverPromptId);

    if (!featureOn("lever")) return;

    leverPromptId = setTimeout(
      promptLever,
      5000 + Math.random() * 7000
    );
  }

  function promptLever() {
    if (!playing) return;

    var cur = leverValue;
    var t;

    do {
      t = Math.floor(
        Math.random() * 11
      );
    } while (
      Math.abs(t - cur) < 3
    );

    leverTarget = t;

    markTarget(t);

    leverBar.className = "";

    leverBar.style.setProperty(
      "--win",
      mode.lever.win + "ms"
    );

    void leverBar.offsetWidth;

    leverBar.className = "run";

    clearTimeout(leverMsgId);

    setLeverMsg(
      "Mets sur " + t + " !",
      "go"
    );

    leverExpireId = setTimeout(
      function () {
        clearTarget();

        leverBar.className = "";

        flashLever(
          "Raté",
          "bad"
        );

        scheduleLever();
      },
      mode.lever.win
    );
  }

  function startBoost() {
    var dur = mode.lever.boost;

    sfx("boost");

    boostUntil =
      performance.now() + dur;

    leverBar.className = "";

    leverBar.style.setProperty(
      "--win",
      dur + "ms"
    );

    void leverBar.offsetWidth;

    leverBar.className =
      "run boosting";

    leverPanel.classList.add("boost");
    scoreStat.classList.add("boost");

    clearTimeout(leverMsgId);

    setLeverMsg(
      "×5 : " +
        Math.ceil(dur / 1000) +
        " s",
      "ok"
    );

    boostId = setTimeout(
      endBoost,
      dur
    );
  }

  function endBoost() {
    boostUntil = 0;

    leverBar.className = "";

    leverPanel.classList.remove(
      "boost"
    );

    scoreStat.classList.remove(
      "boost"
    );

    idleLeverMsg();

    if (playing) {
      scheduleLever();
    }
  }

  function clearLever() {
    clearTimeout(leverPromptId);
    clearTimeout(leverExpireId);
    clearTimeout(leverMsgId);
    clearTimeout(boostId);

    boostUntil = 0;

    clearTarget();

    leverBar.className = "";

    leverPanel.classList.remove(
      "boost"
    );

    scoreStat.classList.remove(
      "boost"
    );
  }

  function setLever(v) {
    leverValue = Math.max(
      0,
      Math.min(10, v)
    );

    leverVal.textContent =
      leverValue;

    leverHandle.style.setProperty(
      "--p",
      String(1 - leverValue / 10)
    );

    leverBody.setAttribute(
      "aria-valuenow",
      String(leverValue)
    );
  }

  function commitLever() {
    if (
      !playing ||
      leverTarget === null
    ) {
      return;
    }

    if (leverValue === leverTarget) {
      clearTimeout(leverExpireId);

      clearTarget();

      startBoost();
    }
  }

  var SENS = {
    basse: 350,
    normale: 200,
    haute: 100
  };

  var sensName = "normale";

  try {
    var sv =
      localStorage.getItem(
        "carre-rush-sens"
      );

    if (SENS[sv]) {
      sensName = sv;
    }
  } catch (e) {}

  var sensBtns =
    document.querySelectorAll(".sbtn");

  function setSens(name) {
    sensName = name;

    for (
      var j = 0;
      j < sensBtns.length;
      j++
    ) {
      sensBtns[j].setAttribute(
        "aria-pressed",
        sensBtns[j].getAttribute(
          "data-sens"
        ) === name
          ? "true"
          : "false"
      );
    }

    try {
      localStorage.setItem(
        "carre-rush-sens",
        name
      );
    } catch (e) {}
  }

  for (var sj = 0; sj < sensBtns.length; sj++) {
    sensBtns[sj].addEventListener(
      "click",
      function () {
        setSens(
          this.getAttribute("data-sens")
        );
      }
    );
  }

  setSens(sensName);

  var wheelAcc = 0;
  var lastEvt = 0;
  var lastStep = 0;
  var commitId = null;

  document.querySelector(".play").addEventListener(
    "wheel",
    function (e) {
      if (!playing) return;

      e.preventDefault();

      var d = e.deltaY;

      if (e.deltaMode === 1) {
        d *= 40;
      } else if (e.deltaMode === 2) {
        d *= 400;
      }

      var now = performance.now();

      if (now - lastEvt > 250) {
        wheelAcc = 0;
      }

      lastEvt = now;

      if (now - lastStep < 90) {
        return;
      }

      wheelAcc += d;

      if (
        Math.abs(wheelAcc) <
        SENS[sensName]
      ) {
        return;
      }

      var dir =
        wheelAcc > 0 ? 1 : -1;

      wheelAcc = 0;
      lastStep = now;

      setLever(
        leverValue - dir
      );

      clearTimeout(commitId);

      commitId = setTimeout(
        commitLever,
        350
      );
    },
    {
      passive: false
    }
  );

  var RUNNER_CHANCE = 0.15;
  var RUNNER_TIME = 20000;

  var RUNNER = {
    facile: {
      speed: 280,
      gap: [1.3, 2.2],
      wide: 18,
      bonus: 100
    },

    normale: {
      speed: 340,
      gap: [1.0, 1.8],
      wide: 26,
      bonus: 150
    },

    difficile: {
      speed: 420,
      gap: [0.8, 1.4],
      wide: 34,
      bonus: 200
    }
  };

  var CW = 720;
  var GROUND = 112;
  var CHAR_X = 90;
  var CHAR_W = 30;
  var CHAR_H = 38;
  var GRAV = 2200;
  var JUMP_V = 640;

  var runEl =
    document.getElementById("runner");

  var runCanvas =
    document.getElementById("runCanvas");

  var runCtx =
    runCanvas.getContext("2d");

  var runMsg =
    document.getElementById("runMsg");

  var runBar =
    document.getElementById("runBar");

  var runner = null;
  var runnerUsed = false;
  var runRollId = null;
  var runRaf = 0;
  var runHideId = null;

  function rr(x, y, w, h, r) {
    runCtx.beginPath();

    runCtx.moveTo(
      x + r,
      y
    );

    runCtx.arcTo(
      x + w,
      y,
      x + w,
      y + h,
      r
    );

    runCtx.arcTo(
      x + w,
      y + h,
      x,
      y + h,
      r
    );

    runCtx.arcTo(
      x,
      y + h,
      x,
      y,
      r
    );

    runCtx.arcTo(
      x,
      y,
      x + w,
      y,
      r
    );

    runCtx.closePath();
    runCtx.fill();
  }

  function drawRunner() {
    var c = runCtx;

    c.clearRect(
      0,
      0,
      CW,
      runCanvas.height
    );

    var st =
      runner || {
        h: 0,
        t: 0,
        scroll: 0,
        obstacles: []
      };

    c.fillStyle = "#9aa0cf";

    c.fillRect(
      0,
      GROUND,
      CW,
      3
    );

    for (
      var x = -st.scroll;
      x < CW;
      x += 40
    ) {
      c.fillRect(
        x,
        GROUND + 9,
        18,
        3
      );
    }

    c.fillStyle = "#ff5d73";

    for (
      var i = 0;
      i < st.obstacles.length;
      i++
    ) {
      var o = st.obstacles[i];

      rr(
        o.x,
        GROUND - o.h,
        o.w,
        o.h,
        5
      );
    }

    var top =
      GROUND -
      st.h -
      CHAR_H;

    c.fillStyle = "#ffc233";

    rr(
      CHAR_X,
      top,
      CHAR_W,
      CHAR_H - 8,
      8
    );

    var step =
      st.h > 0
        ? 0
        : Math.floor(st.t * 10) % 2;

    rr(
      CHAR_X + 4,
      top + CHAR_H - 10,
      8,
      10,
      3
    );

    rr(
      CHAR_X + CHAR_W - 12,
      top +
        CHAR_H -
        10 -
        (step ? 4 : 0),
      8,
      10 -
        (step ? 0 : 0),
      3
    );

    c.fillStyle = "#1a1530";

    c.fillRect(
      CHAR_X + 17,
      top + 8,
      5,
      7
    );

    c.fillRect(
      CHAR_X + 8,
      top + 8,
      5,
      7
    );
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
    if (!featureOn("runner")) {
      return;
    }

    runRollId = setTimeout(
      rollRunner,
      1000
    );
  }

  function rollRunner() {
    if (!playing || runnerUsed) {
      return;
    }

    if (
      endAt - performance.now() <
      RUNNER_TIME + 500
    ) {
      return;
    }

    if (
      Math.random() <
      RUNNER_CHANCE
    ) {
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
      "Un personnage ! Espace pour sauter, tiens 20 s : +" +
      cfg.bonus;

    runMsg.className =
      "keys-msg go";

    runBar.className = "";

    runBar.style.setProperty(
      "--win",
      RUNNER_TIME + "ms"
    );

    void runBar.offsetWidth;

    runBar.className = "run";

    runRaf =
      requestAnimationFrame(
        runLoop
      );
  }

  function endRunner(ok) {
    cancelAnimationFrame(runRaf);

    drawRunner();

    var cfg = runner.cfg;

    runner = null;

    runBar.className = "";

    if (ok) {
      score += cfg.bonus;

      sfx("win");

      updateHud(
        endAt - performance.now()
      );

      runMsg.textContent =
        "Bravo ! +" +
        cfg.bonus +
        " points";

      runMsg.className =
        "keys-msg ok";
    } else {
      runMsg.textContent =
        "Touché ! Pas de bonus";

      sfx("trap");

      runMsg.className =
        "keys-msg bad";
    }

    runHideId = setTimeout(
      function () {
        runEl.hidden = true;
      },
      2200
    );
  }

  function runLoop(now) {
    if (!runner) return;

    var dt = Math.min(
      0.05,
      (now - runner.last) / 1000
    );

    runner.last = now;
    runner.t += dt;

    if (
      runner.vy !== 0 ||
      runner.h > 0
    ) {
      runner.vy -= GRAV * dt;
      runner.h += runner.vy * dt;

      if (runner.h <= 0) {
        runner.h = 0;
        runner.vy = 0;
      }
    }

    var sp = runner.cfg.speed;

    runner.scroll =
      (runner.scroll + sp * dt) %
      40;

    for (
      var i =
        runner.obstacles.length - 1;
      i >= 0;
      i--
    ) {
      runner.obstacles[i].x -=
        sp * dt;

      if (
        runner.obstacles[i].x +
          runner.obstacles[i].w <
        0
      ) {
        runner.obstacles.splice(
          i,
          1
        );
      }
    }

    if (
      runner.t >=
      runner.nextAt
    ) {
      runner.obstacles.push({
        x: CW + 10,
        w:
          18 +
          Math.random() *
            (runner.cfg.wide - 6),
        h:
          26 +
          Math.random() * 26
      });

      var g = runner.cfg.gap;

      runner.nextAt =
        runner.t +
        g[0] +
        (g[1] - g[0]) *
          Math.random();
    }

    for (
      var k = 0;
      k < runner.obstacles.length;
      k++
    ) {
      var o =
        runner.obstacles[k];

      if (
        o.x <
          CHAR_X +
            CHAR_W -
            6 &&
        o.x + o.w >
          CHAR_X + 6 &&
        runner.h <
          o.h - 4
      ) {
        endRunner(false);
        return;
      }
    }

    if (
      runner.t * 1000 >=
      RUNNER_TIME
    ) {
      endRunner(true);
      return;
    }

    drawRunner();

    runRaf =
      requestAnimationFrame(
        runLoop
      );
  }

  function doJump() {
    if (
      runner &&
      runner.h === 0 &&
      runner.vy === 0
    ) {
      runner.vy = JUMP_V;
    }
  }

  document.addEventListener(
    "keydown",
    function (e) {
      if (
        !playing ||
        (
          e.code !== "Space" &&
          e.key !== " "
        )
      ) {
        return;
      }

      e.preventDefault();

      if (!e.repeat) {
        doJump();
      }
    }
  );

  document.addEventListener(
    "keyup",
    function (e) {
      if (
        playing &&
        (
          e.code === "Space" ||
          e.key === " "
        )
      ) {
        e.preventDefault();
      }
    }
  );

  document
    .getElementById("jumpBtn")
    .addEventListener(
      "pointerdown",
      function (e) {
        e.preventDefault();
        doJump();
      }
    );

  drawRunner();

  function tick() {
    var remaining =
      endAt - performance.now();

    if (remaining <= 0) {
      finish();
      return;
    }

    if (boostOn()) {
      setLeverMsg(
        "×5 : " +
          Math.ceil(
            (boostUntil -
              performance.now()) /
              1000
          ) +
          " s",
        "ok"
      );
    }

    updateHud(remaining);
  }

  function start() {
    score = 0;
    combo = 0;
    maxCombo = 0;
    letterCount = 0;
    letterDone = false;
    letterLog = [];
    claimedBonus = false;
    playing = true;

    updateGoalUi();

    cells.forEach(clearCell);

    endAt =
      performance.now() +
      DURATION;

    overlay.hidden = true;

    updateHud(DURATION);

    clearInterval(tickId);

    tickId = setInterval(
      tick,
      100
    );

    clearTimeout(spawnId);

    spawnId = setTimeout(
      spawn,
      300
    );

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

    updateHud(0);

    if (
      letterDone &&
      letterLog.length >=
        mode.letterGoal
    ) {
      startClaim();
      return;
    }

    finalize();
  }

  var claimBox =
    document.getElementById("claim");

  var claimInput =
    document.getElementById(
      "claimInput"
    );

  var claimMsg =
    document.getElementById(
      "claimMsg"
    );

  var modesBox =
    document.getElementById(
      "modes"
    );

  function startClaim() {
    claimTries = 2;

    claimNeed = Math.min(
      letterLog.length,
      mode.letterMax
    );

    el.title.textContent =
      "Entre tes lettres";

    el.big.hidden = true;
    el.legend.hidden = true;

    modesBox.hidden = true;
    el.btn.hidden = true;

    document.getElementById(
      "top5"
    ).hidden = true;

    el.text.textContent =
      "Tu as trouvé " +
      letterCount +
      " lettres cachées. Tape les " +
      claimNeed +
      " premières lettres que tu as trouvées, dans n'importe quel ordre, pour gagner +" +
      mode.letterBonus +
      " points.";

    claimInput.value = "";

    claimInput.maxLength =
      claimNeed;

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

      el.score.textContent =
        score;

      sfx("level");
    }

    finalize();
  }

  function submitClaim() {
    var typed =
      claimInput.value
        .toLowerCase()
        .replace(/[^a-z]/g, "")
        .split("")
        .sort()
        .join("");

    var want =
      letterLog
        .slice(0, claimNeed)
        .slice()
        .sort()
        .join("");

    if (typed === want) {
      endClaim(true);
      return;
    }

    claimTries--;

    sfx("bad");

    if (claimTries <= 0) {
      endClaim(false);
      return;
    }

    claimMsg.textContent =
      "Ce n'est pas ça. Il te reste 1 essai.";

    claimInput.select();
  }

  document
    .getElementById("claimOk")
    .addEventListener(
      "click",
      submitClaim
    );

  document
    .getElementById("claimSkip")
    .addEventListener(
      "click",
      function () {
        endClaim(false);
      }
    );

  claimInput.addEventListener(
    "keydown",
    function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        submitClaim();
      }
    }
  );

  function finalize() {
    var record =
      score > best;

    if (record) {
      best = score;

      bests[modeName] =
        best;

      el.best.textContent =
        best;

      try {
        localStorage.setItem(
          "carre-rush-bests",
          JSON.stringify(bests)
        );
      } catch (e) {}
    }

    el.title.textContent =
      record
        ? "Nouveau record !"
        : "Temps écoulé";

    sfx(
      record
        ? "win"
        : "end"
    );

    if (
      record &&
      score > 0
    ) {
      confetti();
    }

    el.big.hidden = false;
    el.big.textContent = score;

    el.text.textContent =
      record
        ? "Nouveau record en mode " +
          modeName +
          ". Tu peux faire mieux ?"
        : "Ton record en mode " +
          modeName +
          " est de " +
          best +
          " points.";

    var lvBefore =
      levelInfo(xpTotal).level;

    xpTotal += score;

    try {
      localStorage.setItem(
        "carre-rush-xp",
        String(xpTotal)
      );
    } catch (e) {}

    var lvAfter =
      levelInfo(xpTotal).level;

    updateXpUi();

    var note =
      "+" + score + " XP";

    for (
      var ui = 0;
      ui < UNLOCKS.length;
      ui++
    ) {
      if (
        UNLOCKS[ui].lvl >
          lvBefore &&
        UNLOCKS[ui].lvl <=
          lvAfter
      ) {
        note +=
          ". " +
          UNLOCKS[ui].name +
          " débloqué !";
      }
    }

    if (
      lvAfter > lvBefore
    ) {
      note =
        "Niveau " +
        lvAfter +
        " ! " +
        note;

      setTimeout(
        function () {
          sfx("level");
          confetti();
        },
        700
      );
    }

    el.text.textContent +=
      " " +
      note +
      " Meilleure série : " +
      maxCombo +
      "." +
      (
        claimedBonus
          ? " Bonus lettres : +" +
            mode.letterBonus +
            "."
          : (
              letterDone
                ? " Bonus lettres perdu."
                : ""
            )
      );

    var tops = {};

    try {
      tops =
        JSON.parse(
          localStorage.getItem(
            "carre-rush-top"
          ) || "{}"
        ) || {};
    } catch (e) {
      tops = {};
    }

    var list =
      tops[modeName] || [];

    if (score > 0) {
      list.push(score);

      list.sort(
        function (a, b) {
          return b - a;
        }
      );

      list =
        list.slice(0, 5);

      tops[modeName] =
        list;

      try {
        localStorage.setItem(
          "carre-rush-top",
          JSON.stringify(tops)
        );
      } catch (e) {}
    }

    var top5 =
      document.getElementById(
        "top5"
      );

    top5.textContent =
      "Top 5 " +
      MODE_LABEL[modeName] +
      " : " +
      (
        list.length
          ? list.join(" · ")
          : "aucun score"
      );

    top5.hidden = false;

    el.legend.hidden = true;

    el.btn.textContent =
      "Rejouer";

    overlay.hidden = false;

    el.btn.focus();
  }

  el.btn.addEventListener(
    "click",
    start
  );

  updateHud(DURATION);
  updateXpUi();
})();