// Carré Rush
// jeu où il faut cliquer sur les carrés avant qu'ils disparaissent

// ----- les réglages -----

var DURATION = 30000; // 30 secondes
var DEFAULT_COLORS = ["#ff5d73", "#3ddbb0", "#5ab0ff"];

// les 3 modes de jeu
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

// niveau pour débloquer chaque mode
var UNLOCK = { facile: 1, normale: 5, difficile: 11 };

// niveau pour débloquer chaque truc
var FEATURE = {
  gold: 2, keys: 3, letter: 4, clock: 6, lever: 7,
  armor: 8, runner: 9, bomb: 9, burst: 10, star: 12, freeze: 13,
  memory: 6, diamond: 10, magnet: 11,
  mystery: 5, hop: 8, shield: 11,
  crown: 14, startShield: 15, multCap: 16,
  freeze8: 17, clock5: 18, star8: 19, multCap6: 20
};

// niveau pour chaque thème
var SKIN_LEVEL = {
  classique: 1, neon: 3, sakura: 4, ocean: 5, foret: 7, desert: 8,
  braise: 10, aurore: 12, glace: 14, or: 16,
  cosmos: 17, rubis: 19, arcenciel: 20
};

// la liste des déblocages
var UNLOCKS = [
  { lvl: 2, name: "Carrés dorés" },
  { lvl: 3, name: "Lettres Z, Q, S, D" },
  { lvl: 3, name: "Thème Néon" },
  { lvl: 4, name: "Lettres cachées" },
  { lvl: 4, name: "Thème Sakura" },
  { lvl: 5, name: "Mode Normale" },
  { lvl: 5, name: "Thème Océan" },
  { lvl: 5, name: "Carrés mystère" },
  { lvl: 5, name: "Boss 1 : Carré Alpha" },
  { lvl: 6, name: "Carrés horloge" },
  { lvl: 6, name: "Défi mémoire" },
  { lvl: 7, name: "Levier" },
  { lvl: 7, name: "Thème Forêt" },
  { lvl: 8, name: "Carrés blindés" },
  { lvl: 8, name: "Carrés sauteurs" },
  { lvl: 8, name: "Thème Désert" },
  { lvl: 9, name: "Personnage" },
  { lvl: 9, name: "Carrés bombe" },
  { lvl: 10, name: "Rafales" },
  { lvl: 10, name: "Thème Braise" },
  { lvl: 10, name: "Carrés diamant" },
  { lvl: 10, name: "Boss 2 : Dame Pique" },
  { lvl: 11, name: "Mode Difficile" },
  { lvl: 11, name: "Carrés aimant" },
  { lvl: 11, name: "Carrés bouclier" },
  { lvl: 12, name: "Carrés étoile" },
  { lvl: 12, name: "Thème Aurore" },
  { lvl: 13, name: "Carrés gel" },
  { lvl: 14, name: "Thème Glace" },
  { lvl: 14, name: "Carrés couronne" },
  { lvl: 15, name: "Départ avec un bouclier" },
  { lvl: 15, name: "Boss 3 : Baron Rouge" },
  { lvl: 16, name: "Série jusqu'à ×5" },
  { lvl: 16, name: "Thème Or" },
  { lvl: 17, name: "Thème Cosmos" },
  { lvl: 17, name: "Gel prolongé (8 s)" },
  { lvl: 18, name: "Horloges : +5 s" },
  { lvl: 19, name: "Thème Rubis" },
  { lvl: 19, name: "Étoiles : série +8" },
  { lvl: 20, name: "Série jusqu'à ×6" },
  { lvl: 20, name: "Thème Arc-en-ciel" },
  { lvl: 20, name: "Boss 4 : Titan Noir" }
];

// le titre de joueur selon le niveau
var TITLES = [
  { lvl: 1, name: "Novice" },
  { lvl: 3, name: "Apprenti" },
  { lvl: 5, name: "Habile" },
  { lvl: 7, name: "Expert" },
  { lvl: 9, name: "Maître" },
  { lvl: 11, name: "Champion" },
  { lvl: 13, name: "Légende" },
  { lvl: 16, name: "Mythique" },
  { lvl: 18, name: "Immortel" },
  { lvl: 20, name: "Divinité" }
];

function titleFor(level) {
  var t = TITLES[0].name;
  for (var i = 0; i < TITLES.length; i++) {
    if (level >= TITLES[i].lvl) {
      t = TITLES[i].name;
    }
  }
  return t;
}

var LETTRES = ["a", "e", "k", "m", "p", "r", "t", "w"];

// chances d'apparition (les carrés rares doivent rester rares)
var CHANCE_DIAMANT = 0.05;
var CHANCE_AIMANT = 0.06;
var CHANCE_MYSTERE = 0.06;
var CHANCE_SAUT = 0.07;
var CHANCE_BOUCLIER = 0.04;
var CHANCE_COURONNE = 0.03;

// défi mémoire
var MEMORY = {
  facile:    { len: 3, bonus: 100 },
  normale:   { len: 4, bonus: 250 },
  difficile: { len: 5, bonus: 500 }
};
var MEM_INPUT = 7000;

var KEYS = ["z", "q", "s", "d"];
var SENS = { basse: 350, normale: 200, haute: 100 };

// le personnage
var RUNNER_CHANCE = 0.15;
var RUNNER_TIME = 20000;
var RUNNER = {
  facile:    { speed: 280, gap: [1.3, 2.2], wide: 18, bonus: 100 },
  normale:   { speed: 340, gap: [1.0, 1.8], wide: 26, bonus: 150 },
  difficile: { speed: 500, gap: [0.8, 1.4], wide: 34, bonus: 200 }
};
var CW = 720;
var GROUND = 112;
var CHAR_X = 90;
var CHAR_W = 30;
var CHAR_H = 38;
var GRAV = 2200;
var JUMP_V = 640;

var CODE = "311314f12";
// code qui débloque le Panthéon (tapé au clavier, majuscules ou minuscules)
var CODE_PAN = "7129105e";
var TOP_LEVEL = 20;

// les succès
var ACHIEVEMENTS = [
  { id: "first",    label: "Première partie",              test: function () { return true; } },
  { id: "score50",  label: "50 points en une partie",      test: function (g) { return g.score >= 50; } },
  { id: "score150", label: "150 points en une partie",     test: function (g) { return g.score >= 150; } },
  { id: "combo20",  label: "Série de 20",                  test: function (g) { return g.maxCombo >= 20; } },
  { id: "precise",  label: "Précision de 90 % (30 clics)", test: function (g) { return g.clicks >= 30 && g.accuracy >= 90; } },
  { id: "letters",  label: "Bonus des lettres gagné",      test: function (g) { return g.claimed; } },
  { id: "runner",   label: "Personnage mené au bout",      test: function (g) { return g.runnerWon; } },
  { id: "boost",    label: "Boost ×5 déclenché",           test: function (g) { return g.boosted; } },
  { id: "hard100",  label: "100 points en difficile",      test: function (g) { return g.mode === "difficile" && g.score >= 100; } },
  { id: "combo40",  label: "Série de 40",                  test: function (g) { return g.maxCombo >= 40; } },
  { id: "score300", label: "300 points en une partie",     test: function (g) { return g.score >= 300; } },
  { id: "perfect",  label: "Sans faute (20 clics)",        test: function (g) { return g.clicks >= 20 && g.accuracy === 100; } },
  { id: "normal150", label: "150 points en normale",       test: function (g) { return g.mode === "normale" && g.score >= 150; } },
  { id: "double",   label: "Personnage et boost dans la même partie", test: function (g) { return g.runnerWon && g.boosted; } },
  { id: "daily",    label: "Défi du jour terminé",         test: function () { return !!window.__carreDaily; } },
  { id: "memory",   label: "Défi mémoire réussi",          test: function (g) { return g.memoryWon; } },
  { id: "diamonds3", label: "3 diamants en une partie",    test: function (g) { return g.diamonds >= 3; } },
  { id: "magnet",   label: "Aimant activé",                test: function (g) { return g.magnet; } },
  { id: "boss1",   label: "Boss 1 vaincu",                test: function () { return bossesBeaten >= 1; } },
  { id: "boss2",   label: "Boss 2 vaincu",                test: function () { return bossesBeaten >= 2; } },
  { id: "boss3",   label: "Boss 3 vaincu",                test: function () { return bossesBeaten >= 3; } },
  { id: "boss4",   label: "Boss 4 vaincu",                test: function () { return bossesBeaten >= 4; } },
  { id: "bosspantheon", label: "Panthéon terminé", test: function () { return panBest > 0; } }
];

// les noms utilisés pour sauvegarder
var KEY = {
  xp: "carre-rush-xp",
  bests: "carre-rush-bests",
  top: "carre-rush-top",
  mode: "carre-rush-mode",
  sens: "carre-rush-sens",
  skin: "carre-rush-skin",
  mute: "carre-rush-mute",
  ach: "carre-rush-ach",
  stats: "carre-rush-stats",
  boss: "carre-rush-boss",
  pan: "carre-rush-pantheon"
};


// ----- on récupère les éléments de la page -----

var board = document.getElementById("board");
var overlay = document.getElementById("overlay");

var elScore = document.getElementById("vScore");
var elTime = document.getElementById("vTime");
var elCombo = document.getElementById("vCombo");
var elComboLabel = document.getElementById("lCombo");
var elBest = document.getElementById("vBest");
var elBar = document.getElementById("bar");
var elTitle = document.getElementById("ovTitle");
var elBig = document.getElementById("ovScore");
var elText = document.getElementById("ovText");
var elLegend = document.getElementById("ovLegend");
var elBtn = document.getElementById("startBtn");

var modeBtns = document.querySelectorAll(".mode");
var skinBtns = document.querySelectorAll(".skin");
var sensBtns = document.querySelectorAll(".sbtn[data-sens]");
var keycaps = document.querySelectorAll(".keycap");

var legTrap = document.getElementById("legTrap");
var legArmor = document.getElementById("legArmor");
var legGold = document.getElementById("legGold");
var legClock = document.getElementById("legClock");
var legBomb = document.getElementById("legBomb");
var legStar = document.getElementById("legStar");
var legFreeze = document.getElementById("legFreeze");
var legDiamond = document.getElementById("legDiamond");
var legMagnet = document.getElementById("legMagnet");
var legMystery = document.getElementById("legMystery");
var legHop = document.getElementById("legHop");
var legShield = document.getElementById("legShield");
var legCrown = document.getElementById("legCrown");

var memPanel = document.getElementById("memPanel");
var memMsg = document.getElementById("memMsg");
var memBar = document.getElementById("memBar");
var memBtns = document.querySelectorAll(".membtn");

var resetBtn = document.getElementById("resetBtn");
var muteBtn = document.getElementById("muteBtn");
var top5El = document.getElementById("top5");

var keysPanel = document.getElementById("keysPanel");
var keyMsg = document.getElementById("keyMsg");
var keyBar = document.getElementById("keyBar");

var leverPanel = document.getElementById("leverPanel");
var leverBody = document.getElementById("leverBody");
var leverHandle = document.getElementById("leverHandle");
var leverVal = document.getElementById("leverVal");
var leverMsg = document.getElementById("leverMsg");
var leverBar = document.getElementById("leverBar");
var ticksEl = document.getElementById("ticks");
var scoreStat = document.getElementById("score");

var runEl = document.getElementById("runner");
var runCanvas = document.getElementById("runCanvas");
var runCtx = runCanvas.getContext("2d");
var runMsg = document.getElementById("runMsg");
var runBar = document.getElementById("runBar");

var claimBox = document.getElementById("claim");
var claimInput = document.getElementById("claimInput");
var claimMsg = document.getElementById("claimMsg");
var modesBox = document.getElementById("modes");

var achList = document.getElementById("achList");
var statsLine = document.getElementById("statsLine");

var bossBtn = document.getElementById("bossBtn");
var bossInfo = document.getElementById("bossInfo");
var panBtn = document.getElementById("panBtn");
var panInfo = document.getElementById("panInfo");
var panBar = document.getElementById("panBar");
var panStep = document.getElementById("panStep");
var panTime = document.getElementById("panTime");
var bossPanel = document.getElementById("bossPanel");
var bossMsg = document.getElementById("bossMsg");
var bossHpEl = document.getElementById("bossHp");
var bossFill = document.getElementById("bossHpFill");


// ----- les variables du jeu -----

// ce qu'on sauvegarde
var xpTotal = 0;
var modeName = "facile";
var mode = MODES.facile;
var bests = { facile: 0, normale: 0, difficile: 0 };
var best = 0;
var skinName = "classique";
var skinColors = DEFAULT_COLORS.slice();
var sensName = "normale";
var muted = false;

// la partie
var playing = false;
var score = 0;
var combo = 0;
var maxCombo = 0;
var startAt = 0;
var endAt = 0;
var tickId = null;
var spawnId = null;
var cells = [];

// lettres cachées
var letterCount = 0;
var letterDone = false;
var letterLog = [];
var claimedBonus = false;
var claimTries = 0;
var claimNeed = 0;

// précision, gel, aimant
var clicks = 0;
var hits = 0;
var freezeUntil = 0;
var freezeId = null;
var magnetUntil = 0;
var magnetId = null;
var shieldOn = false;
var flags = { runnerWon: false, boosted: false, memoryWon: false, diamonds: 0, magnet: false };
var achieved = {};
var stats = { games: 0, clicks: 0, hits: 0, bestCombo: 0 };

// touches
var keyActive = null;
var keyPromptId = null;
var keyExpireId = null;
var keyMsgId = null;

// levier
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
var leverDragging = false;

// personnage
var runner = null;
var runnerUsed = false;
var runRollId = null;
var runRaf = 0;
var runHideId = null;

// défi mémoire
var memSeq = [];
var memPos = 0;
var memPhase = null;
var memTimers = [];
var memRollId = null;
var memHideId = null;

// autres
var actx = null;
var confCanvas = null;
var confRaf = 0;
var resetTimer = null;
var codeBuffer = "";

// boss
var bossesBeaten = 0;
var boss = null;
var pan = null;
var panBest = 0;

// xp qu'il faut pour être au niveau max (pour le code secret)
var MAX_XP = 0;
for (var lv = 1; lv < TOP_LEVEL; lv++) {
  MAX_XP = MAX_XP + xpNeed(lv);
}


// ----- sauvegarde dans le navigateur -----

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
  bossesBeaten = parseInt(load(KEY.boss), 10) || 0;
  panBest = parseInt(load(KEY.pan), 10) || 0;
  achieved = loadJSON(KEY.ach, {});

  var savedStats = loadJSON(KEY.stats, {});
  stats = {
    games: parseInt(savedStats.games, 10) || 0,
    clicks: parseInt(savedStats.clicks, 10) || 0,
    hits: parseInt(savedStats.hits, 10) || 0,
    bestCombo: parseInt(savedStats.bestCombo, 10) || 0
  };
}


// ----- xp et niveaux -----

// xp pour passer le niveau L
function xpNeed(L) {
  return 100 + 40 * (L - 1);
}

function levelInfo(total) {
  var L = 1;
  var rem = total;
  while (rem >= xpNeed(L)) {
    rem = rem - xpNeed(L);
    L = L + 1;
  }
  return { level: L, cur: rem, need: xpNeed(L) };
}

function featureOn(nom) {
  return levelInfo(xpTotal).level >= FEATURE[nom];
}


// ----- affichage -----

function updateLegend() {
  legTrap.hidden = mode.trap === 0;
  legArmor.hidden = mode.armor === 0 || !featureOn("armor");
  legGold.hidden = !featureOn("gold");
  legClock.hidden = !featureOn("clock");
  legBomb.hidden = !featureOn("bomb");
  legStar.hidden = !featureOn("star");
  legFreeze.hidden = !featureOn("freeze");
  legDiamond.hidden = !featureOn("diamond");
  legMagnet.hidden = !featureOn("magnet");
  legMystery.hidden = !featureOn("mystery");
  legHop.hidden = !featureOn("hop");
  legShield.hidden = !featureOn("shield");
  legCrown.hidden = !featureOn("crown");

  // les textes de la légende suivent les bonus débloqués
  if (legClock.lastChild) {
    legClock.lastChild.textContent = "+" + clockMs() / 1000 + " s de temps";
  }
  if (legStar.lastChild) {
    legStar.lastChild.textContent = "étoile : série +" + starBonus();
  }
  if (legFreeze.lastChild) {
    legFreeze.lastChild.textContent = "gel : ralentit " + freezeMs() / 1000 + " s";
  }
}

function readSkinColors() {
  var cs = getComputedStyle(document.documentElement);
  var vars = ["--coral", "--mint", "--sky"];
  var result = [];
  for (var i = 0; i < vars.length; i++) {
    var c = cs.getPropertyValue(vars[i]).trim();
    if (c == "") {
      c = DEFAULT_COLORS[i];
    }
    result.push(c);
  }
  return result;
}

function applySkin(nom) {
  skinName = nom;

  if (nom === "classique") {
    document.documentElement.removeAttribute("data-skin");
  } else {
    document.documentElement.setAttribute("data-skin", nom);
  }

  skinColors = readSkinColors();

  for (var j = 0; j < skinBtns.length; j++) {
    if (skinBtns[j].getAttribute("data-skin") === nom) {
      skinBtns[j].setAttribute("aria-pressed", "true");
    } else {
      skinBtns[j].setAttribute("aria-pressed", "false");
    }
  }

  save(KEY.skin, nom);
}

// grise les thèmes pas encore débloqués
function refreshSkins() {
  var level = levelInfo(xpTotal).level;

  for (var j = 0; j < skinBtns.length; j++) {
    var nom = skinBtns[j].getAttribute("data-skin");
    var locked = level < SKIN_LEVEL[nom];
    var label = skinBtns[j].querySelector(".sl");

    skinBtns[j].disabled = locked;
    if (label) {
      if (locked) {
        label.textContent = "niv. " + SKIN_LEVEL[nom];
      } else {
        label.textContent = "";
      }
    }
  }

  if (level < SKIN_LEVEL[skinName]) {
    applySkin("classique");
  }
}

function setMode(nom) {
  if (levelInfo(xpTotal).level < UNLOCK[nom]) {
    return;
  }

  modeName = nom;
  mode = MODES[nom];
  best = bests[nom];
  elBest.textContent = best;

  updateLegend();
  updateGoalUi();

  for (var j = 0; j < modeBtns.length; j++) {
    if (modeBtns[j].getAttribute("data-mode") === nom) {
      modeBtns[j].setAttribute("aria-pressed", "true");
    } else {
      modeBtns[j].setAttribute("aria-pressed", "false");
    }
  }

  save(KEY.mode, nom);
}

function setSens(nom) {
  sensName = nom;

  for (var j = 0; j < sensBtns.length; j++) {
    if (sensBtns[j].getAttribute("data-sens") === nom) {
      sensBtns[j].setAttribute("aria-pressed", "true");
    } else {
      sensBtns[j].setAttribute("aria-pressed", "false");
    }
  }

  save(KEY.sens, nom);
}

function nextUnlock(level) {
  for (var u = 0; u < UNLOCKS.length; u++) {
    if (UNLOCKS[u].lvl > level) {
      return UNLOCKS[u];
    }
  }
  return null;
}

function updateXpUi() {
  refreshSkins();

  var inf = levelInfo(xpTotal);

  document.getElementById("xpLevel").textContent = "Niv. " + inf.level;
  document.getElementById("xpFill").style.transform = "scaleX(" + inf.cur / inf.need + ")";
  document.getElementById("xpText").textContent = inf.cur + " / " + inf.need + " XP";

  // modes verrouillés
  for (var q = 0; q < modeBtns.length; q++) {
    var nom = modeBtns[q].getAttribute("data-mode");
    var locked = inf.level < UNLOCK[nom];

    modeBtns[q].disabled = locked;
    if (locked) {
      modeBtns[q].querySelector(".ml").textContent = "niv. " + UNLOCK[nom];
    } else {
      modeBtns[q].querySelector(".ml").textContent = "";
    }
  }

  keysPanel.classList.toggle("locked", !featureOn("keys"));
  leverPanel.classList.toggle("locked", !featureOn("lever"));

  var nx = nextUnlock(inf.level);
  if (nx) {
    document.getElementById("nextUnlock").textContent =
      titleFor(inf.level) + " · Prochain déblocage : " + nx.name + " au niveau " + nx.lvl;
  } else {
    document.getElementById("nextUnlock").textContent =
      titleFor(inf.level) + " · Tout est débloqué, prochain boss au niveau " +
      (Math.floor(inf.level / 5) * 5 + 5);
  }

  idleKeyMsg();
  idleLeverMsg();
  updateLegend();
  updateGoalUi();
  refreshBossUi();
}

// bonus des niveaux 17 à 20
function clockMs() {
  if (featureOn("clock5")) {
    return 5000;
  }
  return 3000;
}

function freezeMs() {
  if (featureOn("freeze8")) {
    return 8000;
  }
  return 5000;
}

function starBonus() {
  if (featureOn("star8")) {
    return 8;
  }
  return 5;
}

// multiplicateur de la série
function mult() {
  var cap = 4;
  if (featureOn("multCap6")) {
    cap = 6;
  } else if (featureOn("multCap")) {
    cap = 5;
  }
  return Math.min(cap, 1 + Math.floor(combo / 5));
}

function boostOn() {
  return boostUntil > performance.now();
}

function magnetOn() {
  return magnetUntil > performance.now();
}

function freezeOn() {
  return freezeUntil > performance.now();
}

// x5 du levier et x2 de l'aimant, ça se multiplie
function boostFactor() {
  var f = 1;
  if (boostOn()) {
    f = f * 5;
  }
  if (magnetOn()) {
    f = f * 2;
  }
  return f;
}

function updateGoalUi() {
  var g = document.getElementById("letterGoal");

  g.hidden = !featureOn("letter");
  g.classList.toggle("done", !!letterDone);

  if (letterDone) {
    g.textContent =
      "Objectif atteint : entre tes lettres à la fin pour +" +
      mode.letterBonus + " points";
    return;
  }

  var texte = "Lettres cachées trouvées : " + letterCount + " / " + mode.letterGoal;
  if (mode.letterMax > mode.letterGoal) {
    texte = texte + " ou " + mode.letterMax;
  }
  texte = texte + " pour +" + mode.letterBonus + " points (lettres à entrer à la fin)";
  g.textContent = texte;
}

function updateHud(remaining) {
  if (combo > maxCombo) {
    maxCombo = combo;
  }

  elScore.textContent = score;
  elCombo.textContent = "x" + mult();

  // on affiche aussi la longueur de la série en cours
  if (combo > 0) {
    elComboLabel.textContent = "Série " + combo;
  } else {
    elComboLabel.textContent = "Série";
  }

  elTime.textContent = Math.max(0, Math.ceil(remaining / 1000));

  // la barre prend en compte le temps gagné avec les horloges
  var total = Math.max(DURATION, endAt - startAt);
  var f = Math.min(1, Math.max(0, remaining / total));

  elBar.style.transform = "scaleX(" + f + ")";
  elBar.classList.toggle("low", remaining < 8000);
}

function refreshHud() {
  updateHud(endAt - performance.now());
}


// ----- les sons -----

// chaque note : [fréquence, durée, forme, volume, délai]
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

// durée de vibration (en ms) pour les mauvais événements, sur téléphone
var BUZZ = { trap: 120, bad: 150, miss: 25 };

function tone(freq, dur, type, vol, delay) {
  if (muted) {
    return;
  }

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

function sfx(nom) {
  var notes = SOUNDS[nom] || [];
  for (var i = 0; i < notes.length; i++) {
    tone(notes[i][0], notes[i][1], notes[i][2], notes[i][3], notes[i][4]);
  }

  // petite vibration quand ça se passe mal
  if (BUZZ[nom] && !muted && navigator.vibrate) {
    try {
      navigator.vibrate(BUZZ[nom]);
    } catch (e) {}
  }
}

function showMute() {
  if (muted) {
    muteBtn.textContent = "Son coupé";
    muteBtn.setAttribute("aria-pressed", "true");
  } else {
    muteBtn.textContent = "Son activé";
    muteBtn.setAttribute("aria-pressed", "false");
  }
}


// ----- confettis -----

function confetti() {
  // pas de confettis si la personne ne veut pas d'animations
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  if (!confCanvas) {
    confCanvas = document.createElement("canvas");
    confCanvas.style.cssText =
      "position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:50";
    confCanvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(confCanvas);
  }

  var W = window.innerWidth;
  var H = window.innerHeight;
  confCanvas.width = W;
  confCanvas.height = H;

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

      q.vy = q.vy + 1400 * dt;
      q.vx = q.vx * 0.99;
      q.x = q.x + q.vx * dt;
      q.y = q.y + q.vy * dt;
      q.r = q.r + q.vr * dt;

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


// ----- le plateau et les carrés -----

// crée les 16 cases
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

// enlève le carré d'une case
function clearCell(c) {
  clearTimeout(c.timer);
  clearTimeout(c.hopId);
  c.sq.textContent = "";
  c.type = null;
  c.sq.className = "sq";
  c.sq.style.background = "";
}

function addTime(ms) {
  endAt = endAt + ms;
}

// choisit quel genre de carré va apparaître
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
  if (featureOn("diamond") && elapsed > 5000 && Math.random() < CHANCE_DIAMANT) {
    return "diamond";
  }
  if (featureOn("magnet") && elapsed > 7000 && Math.random() < CHANCE_AIMANT) {
    return "magnet";
  }
  if (featureOn("mystery") && elapsed > 4000 && Math.random() < CHANCE_MYSTERE) {
    return "mystery";
  }
  if (featureOn("hop") && elapsed > 3000 && Math.random() < CHANCE_SAUT) {
    return "hop";
  }
  if (featureOn("shield") && !shieldOn && elapsed > 8000 && Math.random() < CHANCE_BOUCLIER) {
    return "shield";
  }
  if (featureOn("crown") && elapsed > 6000 && Math.random() < CHANCE_COURONNE) {
    return "crown";
  }
  return "normal";
}

// met un carré dans une case libre
function placeOne(elapsed, p) {
  var free = [];
  for (var i = 0; i < cells.length; i++) {
    if (!cells[i].type) {
      free.push(i);
    }
  }
  if (free.length == 0) {
    return;
  }

  var c = cells[free[Math.floor(Math.random() * free.length)]];
  var type = pickType(elapsed);

  var lifeFactor = 1;
  if (type === "gold") {
    lifeFactor = 0.7;
  } else if (type === "diamond") {
    lifeFactor = 0.6;
  } else if (type === "armor") {
    lifeFactor = 1.3;
  } else if (type === "hop") {
    lifeFactor = 1.3;
  } else if (type === "crown") {
    lifeFactor = 0.5;
  }

  // durée de vie du carré (plus longue pendant le gel)
  var life = (mode.life[0] + (mode.life[1] - mode.life[0]) * p) * lifeFactor;
  if (freezeOn()) {
    life = life * 1.5;
  }

  fillCell(c, type, life, false);
}

// remplit une case avec un carré qui reste "life" millisecondes
function fillCell(c, type, life, moved) {
  c.type = type;
  c.moved = !!moved;
  if (type === "armor") {
    c.hp = 2;
  } else {
    c.hp = 1;
  }

  if (type === "letter") {
    c.letter = LETTRES[Math.floor(Math.random() * LETTRES.length)];
  }

  if (type === "normal") {
    c.sq.className = "sq on";
  } else {
    c.sq.className = "sq on " + type;
  }

  if (type === "normal" || type === "letter") {
    c.sq.style.background = skinColors[Math.floor(Math.random() * skinColors.length)];
  } else {
    c.sq.style.background = "";
  }

  c.sq.style.setProperty("--life", life + "ms");

  // pour relancer l'animation
  c.sq.style.animation = "none";
  void c.sq.offsetWidth;
  c.sq.style.animation = "";

  c.timer = setTimeout(function () {
    clearCell(c);
  }, life);

  // le carré sauteur change de case une seule fois
  if (type === "hop" && !moved) {
    c.hopId = setTimeout(function () {
      hopCell(c, life * 0.55);
    }, life * 0.45);
  }
}

// déplace un carré sauteur vers une autre case libre
function hopCell(c, left) {
  if (!playing || c.type !== "hop") {
    return;
  }

  var free = [];
  for (var i = 0; i < cells.length; i++) {
    if (!cells[i].type && cells[i] !== c) {
      free.push(i);
    }
  }
  if (free.length == 0) {
    return;
  }

  var dest = cells[free[Math.floor(Math.random() * free.length)]];
  clearCell(c);
  fillCell(dest, "hop", Math.max(left, 450), true);
}

function spawn() {
  if (!playing) {
    return;
  }

  // temps vraiment écoulé (le temps gagné ne rend pas le jeu plus facile)
  var elapsed = performance.now() - startAt;
  var p = Math.min(1, Math.max(0, elapsed / DURATION));

  placeOne(elapsed, p);

  // des fois il y a des rafales
  if (mode.burst && featureOn("burst") && elapsed > 2000 && Math.random() < mode.burst) {
    placeOne(elapsed, p);
    if (p > 0.5 && Math.random() < 0.5) {
      placeOne(elapsed, p);
    }
  }

  // prochain carré (plus lent pendant le gel)
  var delai = mode.gap[0] + (mode.gap[1] - mode.gap[0]) * p;
  if (freezeOn()) {
    delai = delai * 1.8;
  }
  spawnId = setTimeout(spawn, delai);
}

// affiche le petit texte qui monte (+1, -3...)
function popText(c, txt, neg) {
  var s = document.createElement("span");

  if (neg) {
    s.className = "pop neg";
  } else {
    s.className = "pop";
  }
  s.textContent = txt;
  c.btn.appendChild(s);

  s.addEventListener("animationend", function () {
    s.remove();
  });

  // au cas où l'animation ne se finit pas
  setTimeout(function () {
    if (s.parentNode) {
      s.remove();
    }
  }, 800);
}

// ----- ce qui se passe quand on clique -----

// clic dans le vide
function hitEmpty(c) {
  if (absorbPenalty(c)) {
    return;
  }

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
  combo = combo + 1;

  score = score + mult() * boostFactor();

  letterCount = letterCount + 1;
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

// la bombe enlève tous les autres carrés et donne leurs points
function hitBomb(c) {
  var total = 0;

  for (var i = 0; i < cells.length; i++) {
    var other = cells[i];
    if (other === c || !other.type) {
      continue;
    }

    if (other.type === "gold") {
      total = total + 5;
    } else if (other.type === "armor") {
      total = total + 3;
    } else if (other.type === "diamond") {
      total = total + 10;
    } else if (other.type === "hop") {
      total = total + 6;
    } else if (other.type === "crown") {
      total = total + 25;
    } else if (other.type === "mystery") {
      total = total + 3;
    } else if (other.type === "clock") {
      addTime(clockMs());
    } else if (other.type !== "trap" && other.type !== "bomb") {
      total = total + 1;
    }

    clearCell(other);
  }

  total = total * boostFactor();

  combo = combo + 1;
  score = score + total;

  popText(c, "+" + total, false);
  sfx("level");
  clearCell(c);
}

// premier clic sur un carré blindé
function hitArmorFirst(c) {
  c.hp = c.hp - 1;
  c.sq.classList.add("hit");
  popText(c, "1/2", false);
  sfx("hit");
}

function hitTrap(c) {
  if (absorbPenalty(c)) {
    clearCell(c);
    return;
  }

  score = Math.max(0, score - 3);
  combo = 0;

  popText(c, "−3", true);
  sfx("trap");
  clearCell(c);
}

function hitClock(c) {
  addTime(clockMs());
  combo = combo + 1;

  popText(c, "+" + clockMs() / 1000 + " s", false);
  sfx("clock");
  clearCell(c);
}

function clearFreeze() {
  clearTimeout(freezeId);
  freezeUntil = 0;
  board.classList.remove("frozen");
}

// l'étoile
function hitStar(c) {
  combo = combo + starBonus();

  var gain = 2 * mult() * boostFactor();
  score = score + gain;

  popText(c, "Série +" + starBonus(), false);
  sfx("good");
  clearCell(c);
}

// le gel
function hitFreeze(c) {
  var dur = freezeMs();

  combo = combo + 1;
  score = score + mult() * boostFactor();

  freezeUntil = performance.now() + dur;
  board.classList.add("frozen");

  clearTimeout(freezeId);
  freezeId = setTimeout(clearFreeze, dur);

  popText(c, "Gel " + dur / 1000 + " s", false);
  sfx("clock");
  clearCell(c);
}

function clearMagnet() {
  clearTimeout(magnetId);
  magnetUntil = 0;
  scoreStat.classList.remove("magnet");
}

// l'aimant double les gains pendant 6 secondes
function hitMagnet(c) {
  var dur = 6000;

  combo = combo + 1;
  score = score + mult() * boostFactor();
  flags.magnet = true;

  magnetUntil = performance.now() + dur;
  scoreStat.classList.add("magnet");

  clearTimeout(magnetId);
  magnetId = setTimeout(clearMagnet, dur);

  popText(c, "×2 · 6 s", false);
  sfx("boost");
  clearCell(c);
}

// le bouclier annule la prochaine pénalité
function updateShieldUi() {
  elCombo.parentNode.classList.toggle("shield", shieldOn);
}

// renvoie true si le bouclier a bloqué la pénalité
function absorbPenalty(c) {
  if (!shieldOn) {
    return false;
  }

  shieldOn = false;
  updateShieldUi();
  sfx("good");

  if (c) {
    popText(c, "Bloqué", false);
  }
  return true;
}

function hitShield(c) {
  combo = combo + 1;
  score = score + mult() * boostFactor();

  shieldOn = true;
  updateShieldUi();

  popText(c, "Bouclier", false);
  sfx("boost");
  clearCell(c);
}

// le carré mystère cache une surprise (presque toujours bonne)
function hitMystery(c) {
  combo = combo + 1;

  var r = Math.random();
  var txt = "";

  if (r < 0.35) {
    var gain = 8 * mult() * boostFactor();
    score = score + gain;
    txt = "+" + gain;
    sfx("gold");
  } else if (r < 0.55) {
    addTime(2000);
    txt = "+2 s";
    sfx("clock");
  } else if (r < 0.75) {
    combo = combo + 3;
    txt = "Série +3";
    sfx("good");
  } else if (r < 0.9) {
    shieldOn = true;
    updateShieldUi();
    txt = "Bouclier";
    sfx("boost");
  } else if (!absorbPenalty(c)) {
    score = Math.max(0, score - 4);
    combo = 0;
    popText(c, "−4", true);
    sfx("trap");
  }

  if (txt !== "") {
    popText(c, txt, false);
  }
  clearCell(c);
}

// carré normal, doré, diamant, sauteur, ou blindé
function hitNormal(c) {
  var base = 1;
  if (c.type === "gold") {
    base = 5;
  } else if (c.type === "diamond") {
    base = 10;
    flags.diamonds = flags.diamonds + 1;
  } else if (c.type === "armor") {
    base = 3;
  } else if (c.type === "hop") {
    base = 6;
  } else if (c.type === "crown") {
    base = 25;
  }

  combo = combo + 1;

  var gain = base * mult() * boostFactor();
  score = score + gain;

  popText(c, "+" + gain, false);
  if (c.type === "gold" || c.type === "diamond" || c.type === "hop" || c.type === "crown") {
    sfx("gold");
  } else {
    sfx("pop");
  }
  clearCell(c);
}

// quand on clique sur une case
function onCell(i) {
  if (boss) {
    onBossCell(i);
    return;
  }

  if (!playing) {
    return;
  }

  var c = cells[i];

  // un clic dans le vide ou sur un piège = clic raté
  clicks = clicks + 1;
  if (c.type && c.type !== "trap") {
    hits = hits + 1;
  }

  if (c.type === null) {
    hitEmpty(c);
  } else if (c.type === "letter") {
    hitLetter(c);
  } else if (c.type === "bomb") {
    hitBomb(c);
  } else if (c.type === "trap") {
    hitTrap(c);
  } else if (c.type === "clock") {
    hitClock(c);
  } else if (c.type === "star") {
    hitStar(c);
  } else if (c.type === "freeze") {
    hitFreeze(c);
  } else if (c.type === "magnet") {
    hitMagnet(c);
  } else if (c.type === "mystery") {
    hitMystery(c);
  } else if (c.type === "shield") {
    hitShield(c);
  } else if (c.type === "armor") {
    if (c.hp > 1) {
      hitArmorFirst(c);
    } else {
      hitNormal(c);
    }
  } else {
    hitNormal(c);
  }

  refreshHud();
}


// ----- défi des touches Z Q S D -----

function setKeyMsg(text, cls) {
  keyMsg.textContent = text;
  keyMsg.className = "keys-msg " + (cls || "");
}

function idleKeyMsg() {
  if (!featureOn("keys")) {
    setKeyMsg("Verrouillé : niveau " + FEATURE.keys, "");
    return;
  }

  if (playing) {
    setKeyMsg("Attends la prochaine lettre", "");
  } else {
    setKeyMsg("Une lettre s'allumera pendant la partie", "");
  }
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
  if (!featureOn("keys")) {
    return;
  }
  keyPromptId = setTimeout(promptKey, mode.key.every);
}

// allume une lettre au hasard
function promptKey() {
  if (!playing) {
    return;
  }

  var letter = KEYS[Math.floor(Math.random() * KEYS.length)];
  keyActive = letter;

  for (var j = 0; j < keycaps.length; j++) {
    keycaps[j].classList.toggle("on", keycaps[j].getAttribute("data-key") === letter);
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

  if (absorbPenalty()) {
    flashKeyMsg(why + " : bloqué", "ok");
    scheduleKey();
    return;
  }

  score = Math.max(0, score - 5);
  combo = 0;

  flashKeyMsg(why + " −5", "bad");
  sfx("bad");
  refreshHud();
  scheduleKey();
}

function pressKey(letter) {
  if (!playing || !keyActive) {
    return;
  }

  if (letter !== keyActive) {
    failKey("Mauvaise touche");
    return;
  }

  endKey();

  var gain = 10 * boostFactor();
  score = score + gain;

  flashKeyMsg("Bien joué +" + gain, "ok");
  sfx("good");
  refreshHud();
  scheduleKey();
}


// ----- le levier avec la molette (ou au doigt) -----

function setLeverMsg(text, cls) {
  leverMsg.textContent = text;
  leverMsg.className = "keys-msg lever-msg " + (cls || "");
}

function idleLeverMsg() {
  if (!featureOn("lever")) {
    setLeverMsg("Niveau " + FEATURE.lever, "");
    return;
  }

  if (boostOn()) {
    return;
  }

  if (playing) {
    setLeverMsg("Attends le signal", "");
  } else {
    setLeverMsg("Molette ou glisser", "");
  }
}

function flashLever(text, cls) {
  setLeverMsg(text, cls);
  clearTimeout(leverMsgId);
  leverMsgId = setTimeout(idleLeverMsg, 1200);
}

// met en jaune le chiffre à atteindre
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
  if (!featureOn("lever")) {
    return;
  }
  leverPromptId = setTimeout(promptLever, 5000 + Math.random() * 7000);
}

function promptLever() {
  if (!playing) {
    return;
  }

  // la cible doit être à au moins 3 crans du levier
  var t = Math.floor(Math.random() * 11);
  while (Math.abs(t - leverValue) < 3) {
    t = Math.floor(Math.random() * 11);
  }

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

  if (playing) {
    scheduleLever();
  }
}

function clearLever() {
  clearTimeout(leverPromptId);
  clearTimeout(leverExpireId);
  clearTimeout(leverMsgId);
  clearTimeout(boostId);
  clearTimeout(commitId);

  boostUntil = 0;
  leverDragging = false;
  clearTarget();

  leverBar.className = "";
  leverPanel.classList.remove("boost");
  scoreStat.classList.remove("boost");
}

// on regarde si le levier est sur la bonne valeur
function commitLever() {
  if (!playing || leverTarget === null) {
    return;
  }

  if (leverValue === leverTarget) {
    clearTimeout(leverExpireId);
    clearTarget();
    startBoost();
  }
}

function onWheel(e) {
  if (!playing || !featureOn("lever")) {
    return;
  }

  e.preventDefault();

  var d = e.deltaY;
  if (e.deltaMode === 1) {
    d = d * 40;
  } else if (e.deltaMode === 2) {
    d = d * 400;
  }

  var now = performance.now();

  if (now - lastWheelEvt > 250) {
    wheelAcc = 0;
  }
  lastWheelEvt = now;

  if (now - lastWheelStep < 90) {
    return;
  }

  wheelAcc = wheelAcc + d;
  if (Math.abs(wheelAcc) < SENS[sensName]) {
    return;
  }

  var dir = 1;
  if (wheelAcc < 0) {
    dir = -1;
  }
  wheelAcc = 0;
  lastWheelStep = now;

  setLever(leverValue - dir);

  clearTimeout(commitId);
  commitId = setTimeout(commitLever, 350);
}

// glisser le levier au doigt ou à la souris (utile sur téléphone)
function leverFromPointer(e) {
  var r = leverBody.getBoundingClientRect();
  var top = 16;
  var h = r.height - 32;
  if (h <= 0) {
    return;
  }

  var p = (e.clientY - r.top - top) / h;
  p = Math.min(1, Math.max(0, p));

  var v = Math.round((1 - p) * 10);
  if (v !== leverValue) {
    setLever(v);
  }

  clearTimeout(commitId);
  commitId = setTimeout(commitLever, 350);
}

function bindLeverDrag() {
  leverBody.addEventListener("pointerdown", function (e) {
    if (!playing || !featureOn("lever")) {
      return;
    }

    leverDragging = true;
    try {
      leverBody.setPointerCapture(e.pointerId);
    } catch (err) {}

    e.preventDefault();
    leverFromPointer(e);
  });

  leverBody.addEventListener("pointermove", function (e) {
    if (!leverDragging || !playing) {
      return;
    }
    leverFromPointer(e);
  });

  function stopDrag() {
    leverDragging = false;
  }

  leverBody.addEventListener("pointerup", stopDrag);
  leverBody.addEventListener("pointercancel", stopDrag);
}


// ----- le personnage qui saute -----

// dessine un rectangle avec les coins ronds
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

  // le sol
  c.fillStyle = "#9aa0cf";
  c.fillRect(0, GROUND, CW, 3);
  for (var x = -st.scroll; x < CW; x = x + 40) {
    c.fillRect(x, GROUND + 9, 18, 3);
  }

  // les obstacles
  c.fillStyle = "#ff5d73";
  for (var i = 0; i < st.obstacles.length; i++) {
    var o = st.obstacles[i];
    fillRoundRect(o.x, GROUND - o.h, o.w, o.h, 5);
  }

  // le personnage
  var haut = GROUND - st.h - CHAR_H;
  var step = 0;
  if (st.h == 0) {
    step = Math.floor(st.t * 10) % 2;
  }

  c.fillStyle = "#ffc233";
  fillRoundRect(CHAR_X, haut, CHAR_W, CHAR_H - 8, 8);
  fillRoundRect(CHAR_X + 4, haut + CHAR_H - 10, 8, 10, 3);
  if (step) {
    fillRoundRect(CHAR_X + CHAR_W - 12, haut + CHAR_H - 14, 8, 10, 3);
  } else {
    fillRoundRect(CHAR_X + CHAR_W - 12, haut + CHAR_H - 10, 8, 10, 3);
  }

  // les yeux
  c.fillStyle = "#1a1530";
  c.fillRect(CHAR_X + 17, haut + 8, 5, 7);
  c.fillRect(CHAR_X + 8, haut + 8, 5, 7);
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
  if (!featureOn("runner")) {
    return;
  }
  runRollId = setTimeout(rollRunner, 1000);
}

// le personnage apparaît
function rollRunner() {
  if (!playing || runnerUsed) {
    return;
  }
  if (endAt - performance.now() < RUNNER_TIME + 500) {
    return;
  }

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

  runMsg.textContent = "Un personnage ! Espace pour sauter, tiens 20 s : +" + cfg.bonus;
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
    score = score + cfg.bonus;
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

// boucle d'animation du personnage
function runLoop(now) {
  if (!runner) {
    return;
  }

  var dt = Math.min(0.05, Math.max(0, (now - runner.last) / 1000));
  runner.last = now;
  runner.t = runner.t + dt;

  // saut et gravité
  if (runner.vy !== 0 || runner.h > 0) {
    runner.vy = runner.vy - GRAV * dt;
    runner.h = runner.h + runner.vy * dt;

    if (runner.h <= 0) {
      runner.h = 0;
      runner.vy = 0;
    }
  }

  // le sol et les obstacles avancent
  var sp = runner.cfg.speed;
  runner.scroll = (runner.scroll + sp * dt) % 40;

  for (var i = runner.obstacles.length - 1; i >= 0; i--) {
    runner.obstacles[i].x = runner.obstacles[i].x - sp * dt;

    // on enlève ceux qui sont sortis de l'écran
    if (runner.obstacles[i].x + runner.obstacles[i].w < 0) {
      runner.obstacles.splice(i, 1);
    }
  }

  // nouvel obstacle
  if (runner.t >= runner.nextAt) {
    runner.obstacles.push({
      x: CW + 10,
      w: 18 + Math.random() * (runner.cfg.wide - 6),
      h: 26 + Math.random() * 26
    });

    var g = runner.cfg.gap;
    runner.nextAt = runner.t + g[0] + (g[1] - g[0]) * Math.random();
  }

  // on regarde si on touche un obstacle
  for (var k = 0; k < runner.obstacles.length; k++) {
    var o = runner.obstacles[k];

    if (o.x < CHAR_X + CHAR_W - 6 && o.x + o.w > CHAR_X + 6 && runner.h < o.h - 4) {
      endRunner(false);
      return;
    }
  }

  // gagné si on tient 20 secondes
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


// ----- défi mémoire -----

function memLater(fn, ms) {
  memTimers.push(setTimeout(fn, ms));
}

function memClearTimers() {
  for (var i = 0; i < memTimers.length; i++) {
    clearTimeout(memTimers[i]);
  }
  memTimers = [];
}

function memLight(i, on) {
  memBtns[i].classList.toggle("on", on);
}

function memLightsOff() {
  for (var i = 0; i < memBtns.length; i++) {
    memLight(i, false);
  }
}

function abortMemory() {
  memClearTimers();
  clearTimeout(memRollId);
  clearTimeout(memHideId);

  memPhase = null;
  memPanel.hidden = true;
  memBar.className = "";
  memLightsOff();
}

function scheduleMemory(delay) {
  clearTimeout(memRollId);
  if (!featureOn("memory")) {
    return;
  }
  memRollId = setTimeout(startMemory, delay || 9000 + Math.random() * 6000);
}

function startMemory() {
  if (!playing || memPhase) {
    return;
  }

  // pas assez de temps : on ne lance plus de défi
  if (endAt - performance.now() < 12000) {
    return;
  }

  // si le personnage est en cours on attend un peu
  if (runner) {
    scheduleMemory(3000);
    return;
  }

  var cfg = MEMORY[modeName];

  memSeq = [];
  for (var i = 0; i < cfg.len; i++) {
    memSeq.push(Math.floor(Math.random() * 4));
  }
  memPos = 0;
  memPhase = "show";

  clearTimeout(memHideId);
  memPanel.hidden = false;
  memMsg.textContent = "Retiens la suite de couleurs…";
  memMsg.className = "keys-msg go";
  memBar.className = "";

  // on montre les couleurs une par une
  var t = 500;
  for (var n = 0; n < memSeq.length; n++) {
    (function (couleur, temps) {
      memLater(function () { memLight(couleur, true); }, temps);
      memLater(function () { memLight(couleur, false); }, temps + 450);
    })(memSeq[n], t);
    t = t + 750;
  }

  // puis c'est au joueur
  memLater(function () {
    memPhase = "input";
    memMsg.textContent = "À toi ! " + cfg.len + " couleurs, dans l'ordre";

    memBar.style.setProperty("--win", MEM_INPUT + "ms");
    memBar.className = "";
    void memBar.offsetWidth;
    memBar.className = "run";

    memLater(function () {
      endMemory(false, "Trop lent");
    }, MEM_INPUT);
  }, t + 200);
}

function endMemory(ok, why) {
  if (!memPhase) {
    return;
  }

  memPhase = null;
  memClearTimers();
  memBar.className = "";
  memLightsOff();

  if (ok) {
    var bonus = MEMORY[modeName].bonus;

    score = score + bonus;
    flags.memoryWon = true;
    sfx("win");

    memMsg.textContent = "Bravo ! +" + bonus + " points";
    memMsg.className = "keys-msg ok";
  } else if (absorbPenalty()) {
    memMsg.textContent = why + " : bloqué";
    memMsg.className = "keys-msg ok";
  } else {
    score = Math.max(0, score - 5);
    combo = 0;
    sfx("bad");

    memMsg.textContent = why + " −5";
    memMsg.className = "keys-msg bad";
  }

  refreshHud();

  memHideId = setTimeout(function () {
    memPanel.hidden = true;
  }, 1600);

  scheduleMemory();
}

function pressMem(c) {
  if (!playing || memPhase !== "input") {
    return;
  }

  memLight(c, true);
  setTimeout(function () { memLight(c, false); }, 160);

  if (c !== memSeq[memPos]) {
    endMemory(false, "Mauvaise couleur");
    return;
  }

  sfx("pop");
  memPos = memPos + 1;

  if (memPos >= memSeq.length) {
    endMemory(true);
  }
}


// ----- les combats de boss (tous les 5 niveaux) -----

var BOSS_NAMES = ["Carré Alpha", "Dame Pique", "Baron Rouge", "Titan Noir", "Seigneur du Chaos", "Empereur Prisme"];
var BOSS_TIME = 30000;

// une mécanique particulière par boss (elles se répètent à partir du boss 6)
var BOSS_MECHS = [
  { id: "shield", name: "Bouclier", desc: "une apparition sur trois, il est protégé : ne le touche pas (il se soigne de 1 PV)" },
  { id: "heal", name: "Fuite", desc: "s'il t'échappe sans être touché, il récupère 1 PV" },
  { id: "dodge", name: "Esquive", desc: "il saute ailleurs dès que tu le touches" },
  { id: "fog", name: "Brouillard", desc: "il devient invisible peu après être apparu" },
  { id: "chaos", name: "Chaos", desc: "par moments le toucher le soigne : attends la fin" },
  { id: "speed", name: "Accélération", desc: "plus tu le blesses, plus il saute vite" }
];

function bossMech(n) {
  return BOSS_MECHS[(n - 1) % BOSS_MECHS.length];
}

function bossName(n) {
  return BOSS_NAMES[n - 1] || "Boss " + n;
}

function bossLevel(n) {
  return n * 5;
}

// plus le boss est loin, plus il est difficile
function bossConfig(n) {
  var fakes = 0;
  if (n >= 3) {
    fakes = Math.min(3, n - 2);
  }

  var cfg = {
    n: n,
    hp: 20 + 14 * (n - 1),
    hop: Math.max(450, 1500 - 220 * (n - 1)),
    traps: Math.min(4, 1 + Math.floor((n - 1) / 2)),
    fakes: fakes
  };

  // boss 3 à 5 assouplis (ils étaient trop durs) : moins de PV, saut plus lent, moins de pièges et de leurres
  var easier = {
    3: { hp: 38, hop: 1200, traps: 1, fakes: 0 },
    4: { hp: 44, hop: 1100, traps: 1, fakes: 1 },
    5: { hp: 52, hop: 950, traps: 2, fakes: 1 },
    6: { hp: 60, hop: 850, traps: 2, fakes: 2 }
  };
  if (easier[n]) {
    cfg.hp = easier[n].hp;
    cfg.hop = easier[n].hop;
    cfg.traps = easier[n].traps;
    cfg.fakes = easier[n].fakes;
  }

  return cfg;
}

// quel boss le joueur peut combattre (0 = aucun)
function bossTarget() {
  var maxN = Math.floor(levelInfo(xpTotal).level / 5);
  if (maxN < 1) {
    return 0;
  }
  return Math.min(bossesBeaten + 1, maxN);
}

// met à jour le bouton et le texte du boss sur l'écran de départ
function refreshBossUi() {
  refreshPanUi();
  var level = levelInfo(xpTotal).level;
  var maxN = Math.floor(level / 5);
  var next = bossesBeaten + 1;

  if (maxN < 1) {
    bossBtn.disabled = true;
    bossBtn.textContent = "Combat de boss";
    bossInfo.textContent = "Un premier boss t'attend au niveau 5";
    return;
  }

  var n = bossTarget();
  var cfg = bossConfig(n);
  bossBtn.disabled = false;

  if (next > maxN) {
    bossBtn.textContent = "Revanche : " + bossName(n);
    bossInfo.textContent =
      "Tous les boss disponibles sont vaincus. Prochain boss : niveau " + bossLevel(next) +
      ". Mécanique : " + bossMech(n).name + " (" + bossMech(n).desc + ")";
  } else {
    bossBtn.textContent = "Boss " + n + " : " + bossName(n);
    bossInfo.textContent =
      cfg.hp + " points de vie, sans limite de temps. Récompense : +" + (150 * n) + " XP. Mécanique : " +
      bossMech(n).name + " (" + bossMech(n).desc + ")";
  }
}

function setBossMsg(text, cls) {
  bossMsg.textContent = text;
  bossMsg.className = "keys-msg " + (cls || "");
}

function updateBossUi() {
  var hp = Math.max(0, boss.hp);
  bossFill.style.transform = "scaleX(" + hp / boss.cfg.hp + ")";
  bossHpEl.textContent = hp + " / " + boss.cfg.hp;
}

function bossHopMs() {
  var h = boss.cfg.hop;
  if (boss.mech === "speed") {
    h = h * (0.55 + 0.45 * Math.max(0, boss.hp) / boss.cfg.hp);
  }
  if (boss.enraged) {
    h = Math.max(380, h * 0.7);
  }
  return h;
}

function startBoss(forceN) {
  if (playing || boss) {
    return;
  }

  var n = forceN || bossTarget();
  if (n < 1) {
    return;
  }

  var cfg = bossConfig(n);
  var now = performance.now();

  score = 0;
  combo = 0;
  maxCombo = 0;

  clearFreeze();
  clearMagnet();
  shieldOn = featureOn("startShield");
  updateShieldUi();

  for (var i = 0; i < cells.length; i++) {
    clearCell(cells[i]);
  }

  boss = {
    cfg: cfg, hp: cfg.hp, enraged: false, hopId: null, tickId: null,
    mech: bossMech(n).id, placeCount: 0, hitThis: false,
    shielded: false, inverted: false, cell: null, ghostId: null, chaosId: null
  };

  startAt = now;
  endAt = now + BOSS_TIME;

  overlay.hidden = true;
  bossPanel.hidden = false;
  panBar.hidden = !pan;
  if (pan) {
    panStep.textContent = "Panthéon " + pan.i + "/" + PAN_COUNT;
  }
  setBossMsg(bossName(n) + " : " + bossMech(n).name + " (" + bossMech(n).desc + ")", "go");
  updateBossUi();
  updateHud(BOSS_TIME);

  boss.tickId = setInterval(bossTick, 100);
  boss.hopId = setTimeout(bossHop, 600);

  if (boss.mech === "chaos") {
    boss.chaosId = setTimeout(chaosOn, 5000);
  }
}

function bossTick() {
  if (!boss) {
    return;
  }

  // pas de limite : le temps affiché monte, c'est juste un chrono
  updateHud(BOSS_TIME);
  elTime.textContent = Math.floor((performance.now() - startAt) / 1000);
  elBar.classList.remove("low");
}

// le boss change de case, avec des pièges et des leurres autour
function bossHop() {
  if (!boss) {
    return;
  }

  // mécanique "Fuite" : un boss non touché se soigne
  if (boss.mech === "heal" && boss.placeCount > 0 && !boss.hitThis && boss.hp < boss.cfg.hp) {
    boss.hp = boss.hp + 1;
    updateBossUi();
    setBossMsg("Il t'a échappé : +1 PV", "bad");
  }

  bossPlace();
  boss.hopId = setTimeout(bossHop, bossHopMs());
}

// mécanique "Chaos" : pendant 2 s, toucher le boss le soigne
function chaosOn() {
  if (!boss) {
    return;
  }

  boss.inverted = true;
  if (boss.cell && boss.cell.type === "boss") {
    boss.cell.sq.classList.add("chaos");
  }
  setBossMsg("CHAOS ! Ne touche pas le boss", "bad");
  sfx("trap");

  boss.chaosId = setTimeout(chaosOff, 2000);
}

function chaosOff() {
  if (!boss) {
    return;
  }

  boss.inverted = false;
  if (boss.cell && boss.cell.type === "boss") {
    boss.cell.sq.classList.remove("chaos");
  }
  setBossMsg("Le chaos retombe : frappe !", "go");

  boss.chaosId = setTimeout(chaosOn, 4000);
}

function bossPlace() {
  for (var i = 0; i < cells.length; i++) {
    clearCell(cells[i]);
  }

  var hopMs = bossHopMs();

  var order = [];
  for (var a = 0; a < cells.length; a++) {
    order.push(a);
  }
  for (var j = order.length - 1; j > 0; j--) {
    var k = Math.floor(Math.random() * (j + 1));
    var tmp = order[j];
    order[j] = order[k];
    order[k] = tmp;
  }

  var pos = 0;

  var c = cells[order[pos]];
  pos = pos + 1;
  c.type = "boss";
  c.sq.className = "sq boss";
  c.sq.style.background = "";
  c.sq.textContent = boss.hp;

  boss.cell = c;
  boss.placeCount = boss.placeCount + 1;
  boss.hitThis = false;

  // Bouclier : une apparition sur trois
  boss.shielded = boss.mech === "shield" && boss.placeCount % 3 === 0;
  if (boss.shielded) {
    c.sq.classList.add("shielded");
  }

  // Chaos : le boss garde son aspect inversé jusqu'à la fin de la phase
  if (boss.inverted) {
    c.sq.classList.add("chaos");
  }

  // Brouillard : le boss disparaît après la moitié de son temps de présence
  clearTimeout(boss.ghostId);
  if (boss.mech === "fog") {
    boss.ghostId = setTimeout(function () {
      if (boss && boss.cell === c && c.type === "boss") {
        c.sq.classList.add("ghost");
      }
    }, hopMs * 0.5);
  }

  var traps = boss.cfg.traps;
  if (boss.enraged) {
    traps = traps + 1;
  }

  for (var t = 0; t < traps; t++) {
    fillCell(cells[order[pos]], "trap", hopMs - 50, false);
    pos = pos + 1;
  }
  for (var f = 0; f < boss.cfg.fakes; f++) {
    fillCell(cells[order[pos]], "bossfake", hopMs - 50, false);
    pos = pos + 1;
  }
}

// un clic pendant le combat
function onBossCell(i) {
  var c = cells[i];

  if (c.type === "boss") {
    // Bouclier : le toucher protégé coûte du temps
    if (boss.shielded) {
      if (absorbPenalty(c)) {
        return;
      }
      boss.hp = Math.min(boss.cfg.hp, boss.hp + 1);
      c.sq.textContent = boss.hp;
      popText(c, "Protégé +1 PV", true);
      sfx("trap");
      updateBossUi();
      return;
    }

    // Chaos : le toucher soigne
    if (boss.inverted) {
      boss.hp = Math.min(boss.cfg.hp, boss.hp + 1);
      c.sq.textContent = boss.hp;
      popText(c, "+1 PV", true);
      sfx("bad");
      updateBossUi();
      return;
    }

    boss.hitThis = true;
    boss.hp = boss.hp - 1;
    c.sq.textContent = Math.max(0, boss.hp);
    popText(c, "−1", false);
    sfx("pop");

    c.btn.classList.remove("miss");
    void c.btn.offsetWidth;
    c.btn.classList.add("miss");

    updateBossUi();

    if (boss.hp <= 0) {
      endBoss(true);
      return;
    }

    if (!boss.enraged && boss.hp <= boss.cfg.hp / 2) {
      boss.enraged = true;
      setBossMsg(bossName(boss.cfg.n) + " est furieux !", "bad");
      sfx("trap");
    }

    // Esquive : il saute ailleurs tout de suite
    if (boss.mech === "dodge") {
      clearTimeout(boss.hopId);
      bossPlace();
      boss.hopId = setTimeout(bossHop, bossHopMs());
    }
  } else if (c.type === "trap" || c.type === "bossfake") {
    if (absorbPenalty(c)) {
      clearCell(c);
      return;
    }

    boss.hp = Math.min(boss.cfg.hp, boss.hp + 2);
    popText(c, "+2 PV au boss", true);
    sfx("trap");
    clearCell(c);
    updateBossUi();
    if (boss.cell && boss.cell.type === "boss") {
      boss.cell.sq.textContent = boss.hp;
    }
  } else {
    sfx("miss");
  }
}

function unlockBossAchievements() {
  var fresh = [];

  for (var i = 0; i < ACHIEVEMENTS.length; i++) {
    var a = ACHIEVEMENTS[i];
    if (a.id.indexOf("boss") === 0 && !achieved[a.id] && a.test()) {
      achieved[a.id] = true;
      fresh.push(a.label);
    }
  }

  if (fresh.length > 0) {
    save(KEY.ach, JSON.stringify(achieved));
  }
  renderAchievements();
  return fresh;
}

function endBoss(win) {
  var b = boss;
  boss = null;

  clearTimeout(b.hopId);
  clearTimeout(b.ghostId);
  clearTimeout(b.chaosId);
  clearInterval(b.tickId);

  for (var i = 0; i < cells.length; i++) {
    clearCell(cells[i]);
  }

  bossPanel.hidden = true;
  shieldOn = false;
  updateShieldUi();
  updateHud(0);

  if (pan) {
    panAfterBoss(win, b);
    return;
  }

  var n = b.cfg.n;
  var gain = 0;
  var first = false;

  if (win) {
    if (n > bossesBeaten) {
      first = true;
      bossesBeaten = n;
      save(KEY.boss, bossesBeaten);
      gain = 150 * n;
    } else {
      gain = 30 * n;
    }
  } else {
    gain = Math.round((b.cfg.hp - b.hp) / 2);
  }

  // l'xp se calcule à partir de "score"
  score = gain;
  var note = addXp();
  var fresh = unlockBossAchievements();

  var texte = "";
  if (win) {
    sfx("win");
    confetti();

    if (first) {
      elTitle.textContent = "Boss vaincu !";
      texte = bossName(n) + " est à terre. " + note + " (prime de victoire incluse).";
    } else {
      elTitle.textContent = "Revanche gagnée !";
      texte = bossName(n) + " est encore tombé. " + note + ".";
    }
  } else {
    sfx("end");
    elTitle.textContent = "Combat abandonné";
    texte = bossName(n) + " avait encore " + Math.max(0, b.hp) + " points de vie sur " +
      b.cfg.hp + ". " + note + ". Réessaie !";
  }

  if (fresh.length > 0) {
    texte = texte + " Succès débloqué : " + fresh.join(", ") + ".";
  }

  score = 0;

  elBig.hidden = false;
  elBig.textContent = gain;
  elText.textContent = texte;
  elLegend.hidden = true;
  top5El.hidden = true;
  elBtn.textContent = "Jouer";
  overlay.hidden = false;
  elBtn.focus();
}


// ----- le Panthéon : les 6 boss à la suite, avec un chrono -----

var PAN_COUNT = 6;
var PAN_UNLOCK = 5;
var PAN_PAUSE = 2500;
var PAN_REWARD_FIRST = 600;
var PAN_REWARD_AGAIN = 150;

// 83400 -> "01:23.4"
function fmtTime(ms) {
  var t = Math.max(0, Math.round(ms / 100) / 10);
  var m = Math.floor(t / 60);
  var sec = t - m * 60;
  return (m < 10 ? "0" : "") + m + ":" + (sec < 10 ? "0" : "") + sec.toFixed(1);
}

function refreshPanUi() {
  var unlocked = bossesBeaten >= PAN_UNLOCK;

  panBtn.hidden = !unlocked;
  panInfo.hidden = false;

  if (!unlocked) {
    panInfo.textContent = "Bats le Seigneur du Chaos pour enchaîner les " + PAN_COUNT + " boss";
  } else if (panBest > 0) {
    panInfo.textContent = "Les " + PAN_COUNT + " boss à la suite. Record : " + fmtTime(panBest);
  } else {
    panInfo.textContent = "Les " + PAN_COUNT + " boss à la suite, chrono total. Récompense : +" + PAN_REWARD_FIRST + " XP";
  }
}

function panTick() {
  if (pan) {
    panTime.textContent = fmtTime(performance.now() - pan.t0);
  }
}

function startPantheon() {
  if (playing || boss || pan || bossesBeaten < PAN_UNLOCK) {
    return;
  }

  pan = { i: 1, t0: performance.now(), tickId: null, nextId: null };
  pan.tickId = setInterval(panTick, 100);
  panTick();
  startBoss(1);
}

// appelé à la fin de chaque boss du Panthéon
function panAfterBoss(win, b) {
  var total = performance.now() - pan.t0;

  // un boss tombé : pause courte puis le suivant
  if (win && pan.i < PAN_COUNT) {
    var nextN = pan.i + 1;

    sfx("win");
    bossPanel.hidden = false;
    setBossMsg(bossName(b.cfg.n) + " est à terre ! Prochain : " + bossName(nextN), "ok");

    pan.nextId = setTimeout(function () {
      if (!pan) {
        return;
      }
      pan.i = nextN;
      startBoss(nextN);
    }, PAN_PAUSE);
    return;
  }

  // fin de la série (victoire ou défaite)
  var reached = pan.i;
  clearInterval(pan.tickId);
  clearTimeout(pan.nextId);
  pan = null;
  panBar.hidden = true;
  bossPanel.hidden = true;

  var gain = 0;
  var record = false;

  if (win) {
    gain = panBest > 0 ? PAN_REWARD_AGAIN : PAN_REWARD_FIRST;
    if (panBest === 0 || total < panBest) {
      record = true;
      panBest = Math.round(total);
      save(KEY.pan, panBest);
    }
    sfx("win");
    confetti();
  } else {
    sfx("end");
  }

  score = gain;
  var note = addXp();
  var fresh = unlockBossAchievements();
  score = 0;

  var texte;
  if (win) {
    elTitle.textContent = record ? "Nouveau record du Panthéon !" : "Panthéon terminé !";
    texte = "Les " + PAN_COUNT + " boss sont tombés en " + fmtTime(total) + ". " +
      (record ? "C'est ton meilleur temps. " : "Record : " + fmtTime(panBest) + ". ") + note + ".";
    elBig.textContent = fmtTime(total);
  } else {
    elTitle.textContent = "Panthéon abandonné";
    texte = bossName(reached) + " (boss " + reached + "/" + PAN_COUNT + ") : tu as abandonné après " +
      fmtTime(total) + ". " + (panBest > 0 ? "Record : " + fmtTime(panBest) + ". " : "") + "Réessaie !";
    elBig.textContent = reached + "/" + PAN_COUNT;
  }

  if (fresh.length > 0) {
    texte = texte + " Succès débloqué : " + fresh.join(", ") + ".";
  }

  elBig.hidden = false;
  elText.textContent = texte;
  elLegend.hidden = true;
  top5El.hidden = true;
  elBtn.textContent = "Jouer";
  overlay.hidden = false;
  refreshBossUi();
  elBtn.focus();
}


// ----- début et fin de partie -----

function start() {
  // on remet tout à zéro
  score = 0;
  combo = 0;
  maxCombo = 0;
  letterCount = 0;
  letterDone = false;
  letterLog = [];
  claimedBonus = false;
  clicks = 0;
  hits = 0;
  flags = { runnerWon: false, boosted: false, memoryWon: false, diamonds: 0, magnet: false };
  clearFreeze();
  shieldOn = featureOn("startShield");
  updateShieldUi();
  playing = true;

  updateGoalUi();
  for (var i = 0; i < cells.length; i++) {
    clearCell(cells[i]);
  }

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

  abortMemory();
  clearMagnet();
  scheduleMemory();
}

function tick() {
  var remaining = endAt - performance.now();

  if (remaining <= 0) {
    finish();
    return;
  }

  if (boostOn()) {
    setLeverMsg("×5 : " + Math.ceil((boostUntil - performance.now()) / 1000) + " s", "ok");
  }

  updateHud(remaining);
}

function finish() {
  playing = false;

  clearInterval(tickId);
  clearTimeout(spawnId);

  for (var i = 0; i < cells.length; i++) {
    clearCell(cells[i]);
  }

  clearKey();
  idleKeyMsg();

  clearLever();
  idleLeverMsg();

  abortRunner();
  abortMemory();
  clearMagnet();
  clearFreeze();
  shieldOn = false;
  updateShieldUi();
  updateHud(0);

  // il doit les retaper les lettres
  if (letterDone && letterLog.length >= mode.letterGoal) {
    startClaim();
    return;
  }

  finalize();
}

// ----- retaper les lettres cachées -----

function startClaim() {
  claimTries = 2;
  claimNeed = Math.min(letterLog.length, mode.letterMax);

  elTitle.textContent = "Entre tes lettres";
  elBig.hidden = true;
  elLegend.hidden = true;
  modesBox.hidden = true;
  elBtn.hidden = true;
  top5El.hidden = true;
  bossBtn.hidden = true;
  bossInfo.hidden = true;
  panBtn.hidden = true;
  panInfo.hidden = true;

  elText.textContent =
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
  elBtn.hidden = false;
  bossBtn.hidden = false;
  bossInfo.hidden = false;
  refreshPanUi();

  if (ok) {
    claimedBonus = true;
    score = score + mode.letterBonus;
    elScore.textContent = score;
    sfx("level");
  }

  finalize();
}

// trie les lettres pour comparer sans l'ordre
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

  claimTries = claimTries - 1;
  sfx("bad");

  if (claimTries <= 0) {
    endClaim(false);
    return;
  }

  claimMsg.textContent = "Ce n'est pas ça. Il te reste 1 essai.";
  claimInput.select();
}

// ----- écran de fin -----

function saveRecord() {
  var record = score > best;

  if (record) {
    best = score;
    bests[modeName] = best;
    elBest.textContent = best;
    save(KEY.bests, JSON.stringify(bests));
  }

  return record;
}

// ajoute l'xp
function addXp() {
  var before = levelInfo(xpTotal).level;

  xpTotal = xpTotal + score;
  save(KEY.xp, xpTotal);

  var after = levelInfo(xpTotal).level;
  updateXpUi();

  var note = "+" + score + " XP";

  for (var u = 0; u < UNLOCKS.length; u++) {
    if (UNLOCKS[u].lvl > before && UNLOCKS[u].lvl <= after) {
      note = note + ". " + UNLOCKS[u].name + " débloqué !";
    }
  }

  if (after > before) {
    note = "Niveau " + after + " (" + titleFor(after) + ") ! " + note;

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

  if (list.length > 0) {
    top5El.textContent = "Top 5 " + MODE_LABEL[modeName] + " : " + list.join(" · ");
  } else {
    top5El.textContent = "Top 5 " + MODE_LABEL[modeName] + " : aucun score";
  }
  top5El.hidden = false;
}

// ----- statistiques et succès -----

function accuracyPercent(h, c) {
  if (c == 0) {
    return 0;
  }
  return Math.round((h / c) * 100);
}

// met à jour les stats
function recordStats() {
  var previousBest = stats.bestCombo;

  stats.games = stats.games + 1;
  stats.clicks = stats.clicks + clicks;
  stats.hits = stats.hits + hits;
  if (maxCombo > stats.bestCombo) {
    stats.bestCombo = maxCombo;
  }

  save(KEY.stats, JSON.stringify(stats));
  return previousBest;
}

// débloque les succès
function unlockAchievements() {
  var report = {
    score: score,
    maxCombo: maxCombo,
    clicks: clicks,
    accuracy: accuracyPercent(hits, clicks),
    mode: modeName,
    claimed: claimedBonus,
    runnerWon: flags.runnerWon,
    boosted: flags.boosted,
    memoryWon: flags.memoryWon,
    diamonds: flags.diamonds,
    magnet: flags.magnet
  };

  var fresh = [];

  for (var i = 0; i < ACHIEVEMENTS.length; i++) {
    var a = ACHIEVEMENTS[i];
    if (!achieved[a.id] && a.test(report)) {
      achieved[a.id] = true;
      fresh.push(a.label);
    }
  }

  if (fresh.length > 0) {
    save(KEY.ach, JSON.stringify(achieved));
  }
  return fresh;
}

function renderAchievements() {
  achList.innerHTML = "";

  for (var i = 0; i < ACHIEVEMENTS.length; i++) {
    var a = ACHIEVEMENTS[i];
    var done = !!achieved[a.id];
    var li = document.createElement("li");

    if (done) {
      li.className = "done";
      li.textContent = "✓ " + a.label;
    } else {
      li.className = "";
      li.textContent = "○ " + a.label;
    }
    achList.appendChild(li);
  }

  statsLine.textContent =
    "Parties : " + stats.games +
    " · Précision moyenne : " + accuracyPercent(stats.hits, stats.clicks) + " %" +
    " · Meilleure série : " + stats.bestCombo;
}

// texte de fin : précision, record de série, succès
function progressNote() {
  var previousBest = recordStats();
  var fresh = unlockAchievements();

  var text = " Précision : " + accuracyPercent(hits, clicks) + " %.";

  if (previousBest > 0 && maxCombo > previousBest) {
    text = text + " Nouveau record de série !";
  }
  if (fresh.length > 0) {
    text = text + " Succès débloqué : " + fresh.join(", ") + ".";
  }

  renderAchievements();
  return text;
}

function finalize() {
  var record = saveRecord();

  if (record) {
    elTitle.textContent = "Nouveau record !";
    sfx("win");
  } else {
    elTitle.textContent = "Temps écoulé";
    sfx("end");
  }

  if (record && score > 0) {
    confetti();
  }

  elBig.hidden = false;
  elBig.textContent = score;

  if (record) {
    elText.textContent = "Nouveau record en mode " + modeName + ". Tu peux faire mieux ?";
  } else {
    elText.textContent = "Ton record en mode " + modeName + " est de " + best + " points.";
  }

  var note = addXp();

  var bonusNote = "";
  if (claimedBonus) {
    bonusNote = " Bonus lettres : +" + mode.letterBonus + ".";
  } else if (letterDone) {
    bonusNote = " Bonus lettres perdu.";
  }

  elText.textContent =
    elText.textContent + " " + note + " Meilleure série : " + maxCombo + "." + bonusNote + progressNote();

  updateTop5();

  elLegend.hidden = true;
  elBtn.textContent = "Rejouer";
  overlay.hidden = false;
  elBtn.focus();
}


// ----- reset et code secret -----

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
  for (var nom in KEY) {
    forget(KEY[nom]);
  }
  // on garde quand même le réglage du son
  save(KEY.mute, muted ? "1" : "0");

  xpTotal = 0;
  bossesBeaten = 0;
  panBest = 0;
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

  elTitle.textContent = "Appuie sur les carrés";
  elBig.hidden = true;
  elText.textContent =
    "30 secondes pour marquer. Chaque point devient de l'XP, qui débloque peu à peu des carrés spéciaux, les lettres, le levier, le personnage, les rafales et les modes de difficulté.";
  elLegend.hidden = false;
  elBtn.textContent = "Jouer";
}

function onResetClick() {
  // on ne peut pas reset pendant la partie
  if (playing || boss || pan || !claimBox.hidden) {
    flashReset("Impossible pendant la partie", 1800);
    return;
  }

  // premier clic : on demande confirmation
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

// si on tape le code, tout est débloqué
function onSecretCode(e) {
  if (playing || boss || pan || isTyping(e)) {
    return;
  }
  if (e.ctrlKey || e.metaKey || e.altKey || !e.key || e.key.length !== 1) {
    return;
  }

  codeBuffer = (codeBuffer + e.key.toLowerCase()).slice(-Math.max(CODE.length, CODE_PAN.length));

  // code du Panthéon
  if (codeBuffer.slice(-CODE_PAN.length) === CODE_PAN) {
    codeBuffer = "";

    if (bossesBeaten < PAN_UNLOCK) {
      bossesBeaten = PAN_UNLOCK;
      save(KEY.boss, bossesBeaten);
    }

    refreshBossUi();
    document.getElementById("nextUnlock").textContent = "Code accepté : le Panthéon est débloqué";
    return;
  }

  if (codeBuffer.slice(-CODE.length) !== CODE) {
    return;
  }

  codeBuffer = "";

  if (xpTotal < MAX_XP) {
    xpTotal = MAX_XP;
  }
  save(KEY.xp, xpTotal);

  updateXpUi();
  document.getElementById("nextUnlock").textContent =
    "Code accepté : niveau maximum, tout est débloqué";
}


// ----- les événements -----

function bindEvents() {
  var i;

  // boutons des modes
  for (i = 0; i < modeBtns.length; i++) {
    modeBtns[i].addEventListener("click", function () {
      setMode(this.getAttribute("data-mode"));
    });
  }

  // boutons des thèmes
  for (i = 0; i < skinBtns.length; i++) {
    skinBtns[i].addEventListener("click", function () {
      applySkin(this.getAttribute("data-skin"));
    });
  }

  // boutons de la sensibilité
  for (i = 0; i < sensBtns.length; i++) {
    sensBtns[i].addEventListener("click", function () {
      setSens(this.getAttribute("data-sens"));
    });
  }

  // bouton du son
  muteBtn.addEventListener("click", function () {
    muted = !muted;
    save(KEY.mute, muted ? "1" : "0");
    showMute();
  });

  resetBtn.addEventListener("click", onResetClick);

  // touches Z Q S D au clavier
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || isTyping(e)) {
      return;
    }

    var k = (e.key || "").toLowerCase();
    if (KEYS.indexOf(k) > -1) {
      pressKey(k);
    }
  });

  // touches Z Q S D avec la souris
  for (i = 0; i < keycaps.length; i++) {
    keycaps[i].addEventListener("click", function () {
      pressKey(this.getAttribute("data-key"));
    });
  }

  document.addEventListener("keydown", onSecretCode);

  // molette
  document.querySelector(".play").addEventListener("wheel", onWheel, { passive: false });

  // glisser sur le levier
  bindLeverDrag();

  // espace pour sauter
  document.addEventListener("keydown", function (e) {
    if (!playing || (e.code !== "Space" && e.key !== " ")) {
      return;
    }

    e.preventDefault();
    if (!e.repeat) {
      doJump();
    }
  });

  document.addEventListener("keyup", function (e) {
    if (playing && (e.code === "Space" || e.key === " ")) {
      e.preventDefault();
    }
  });

  document.getElementById("jumpBtn").addEventListener("pointerdown", function (e) {
    e.preventDefault();
    doJump();
  });

  // les lettres à retaper
  document.getElementById("claimOk").addEventListener("click", submitClaim);
  document.getElementById("claimSkip").addEventListener("click", function () {
    endClaim(false);
  });

  claimInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      submitClaim();
    }
  });

  // défi mémoire
  for (i = 0; i < memBtns.length; i++) {
    memBtns[i].addEventListener("click", function () {
      pressMem(parseInt(this.getAttribute("data-c"), 10));
    });
  }

  // bouton jouer
  elBtn.addEventListener("click", start);

  // bouton du combat de boss
  bossBtn.addEventListener("click", function () {
    startBoss();
  });
  panBtn.addEventListener("click", startPantheon);
  document.getElementById("bossQuit").addEventListener("click", function () {
    if (boss) {
      endBoss(false);
    }
  });
}

// écrit les chiffres 0 à 10 à côté du levier
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


// défi du jour
(function () {
  var KEY = "carre-rush-daily";
  var LABEL = { facile: "Facile", normale: "Normale", difficile: "Difficile" };

  var startBtn = document.getElementById("startBtn");
  var dailyBtn = document.getElementById("dailyBtn");
  var info = document.getElementById("dailyInfo");
  var ovScore = document.getElementById("ovScore");
  var overlay = document.getElementById("overlay");
  if (!startBtn || !dailyBtn || !info) {
    return;
  }

  var realRandom = Math.random;
  var pending = false;
  var ended = true;
  window.__carreDaily = false;

  // la date d'aujourd'hui
  function today() {
    var d = new Date();
    var mois = String(d.getMonth() + 1).padStart(2, "0");
    var jour = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mois + "-" + jour;
  }

  function currentMode() {
    var b = document.querySelector(".mode[aria-pressed='true']");
    if (b) {
      return b.getAttribute("data-mode");
    }
    return "facile";
  }

  // transforme un texte en nombre
  function hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // générateur de nombres au hasard avec une graine
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function loadDaily() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY));
      if (d && d.date === today() && d.scores) {
        return d;
      }
    } catch (e) {}
    return { date: today(), scores: {} };
  }

  function refresh(extra) {
    var m = currentMode();
    var b = loadDaily().scores[m];
    var texte = "Défi du jour (" + LABEL[m] + ") : ";

    if (b != null) {
      texte = texte + "ton meilleur score est " + b;
    } else {
      texte = texte + "pas encore tenté";
    }
    if (extra) {
      texte = texte + ". " + extra;
    }
    info.textContent = texte;
  }

  dailyBtn.addEventListener("click", function () {
    pending = true;
    startBtn.click();
  });

  // en capture pour passer avant le démarrage de la partie
  document.addEventListener("click", function (e) {
    if (e.target !== startBtn) {
      return;
    }
    ended = false;
    if (pending) {
      pending = false;
      window.__carreDaily = true;
      Math.random = mulberry32(hash(today() + currentMode()));
    } else {
      window.__carreDaily = false;
      Math.random = realRandom;
    }
  }, true);

  // #ovScore devient visible avec le score
  new MutationObserver(function () {
    if (ended || !window.__carreDaily) {
      return;
    }
    if (ovScore.hidden || overlay.hidden) {
      return;
    }
    ended = true;
    Math.random = realRandom;

    var s = parseInt(ovScore.textContent, 10) || 0;
    var m = currentMode();
    var d = loadDaily();
    var prev = d.scores[m];
    var msg = "";

    if (prev == null || s > prev) {
      d.scores[m] = s;
      try {
        localStorage.setItem(KEY, JSON.stringify(d));
      } catch (err) {}
      if (prev == null) {
        msg = "Score du jour enregistré";
      } else {
        msg = "Nouveau meilleur score du jour !";
      }
    }
    refresh(msg);
  }).observe(ovScore, { attributes: true, attributeFilter: ["hidden"], childList: true, characterData: true, subtree: true });

  // cache le bouton du défi quand « Jouer » est caché
  new MutationObserver(function () {
    dailyBtn.hidden = startBtn.hidden;
  }).observe(startBtn, { attributes: true, attributeFilter: ["hidden"] });

  document.getElementById("modes").addEventListener("click", function () {
    setTimeout(refresh, 0);
  });

  refresh();
})();
