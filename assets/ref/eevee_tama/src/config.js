// ============================================================
// config.js — ALL game data tables (single source of truth)
// Numbers locked by BUILD_PLAN.md §1–§4
// ============================================================

export const CFG = {
  W: 430,            // logical scene width
  H: 932,            // logical scene height
  DPR_CAP: 3,

  // ---------- time ----------
  TIME: {
    minPerSec: 2,          // 1 game-hour = 30 real seconds
    eggEnd: 120,           // egg hatches at 120 game-min (60 s)
    babyEnd: 1440,         // end of day 1
    childEnd: 2880,        // adult at 24 real-min
    sylveonAge: 2880,      // adult gate for Sylveon
    sylveonClock: 2880 + 15 * 60, // day 3 22:00 (GAME_DESIGN line 74/100)
    grad: 4320,            // graduation: day 4 07:00 (life ≈ 36 real min)
    startHour: 7,          // day 1 starts 07:00
    sleepHour: 20,         // auto sleep 20:00 (if energy < 40)
    forceRestHour: 3,      // forced rest 03:00 if still awake
    wakeHour: 7,
    offlineCapMin: 72 * 60,   // 72 game-hours max catch-up
    offlineFloor: 10,         // meters never below 10 while away
  },

  // ---------- stats ----------
  STATS: {
    meal:   { decay: 4,  label: 'MEAL' },
    happy:  { decay: 3,  decaySick: 6, label: 'HAPPY' },
    energy: { decay: 5,  label: 'ENERGY' },
    health: { decayZero: 2, label: 'HEALTH' },
    mealFave: 42, mealNeutral: 34, mealDisliked: 17,
    rawstMeal: 20, rawstHealth: 25,
    snackMeal: 12, snackHappy: 4,
    petGain: 6, petDiminishing: 2,      // >10 pets in 30 s → +2 each
    petCooldown: 1.5,                   // s
    gameWin: 15, gameLose: 8,
    cleanGain: 4,
    chestoEnergy: 10,
    ballHappy: 10, ballAffinity: 2,
    sickZeroHrs: 6,                     // 6 zero-hours → sick
    deathZeroHrs: 14,                   // sick + 14 zero-hours → death
    furballMinHrs: 4, furballMaxHrs: 8, furballMax: 5,
    furballGraceHrs: 10,
    dirtyDecayMul: 2,                   // 5 furballs → happy decay ×2
    snackAcheFrom: 4,                   // snack #4+ of the day
    snackAcheHealth: 3,
  },

  // ---------- affinity / evolution ----------
  AFFINITY: {
    start: 50,
    meal: 1, mealReq: 30,               // +1 when meal stat ≥ 30 after feeding
    pet: 0.5, petCapDay: 10,
    gameWin: 2,
    sick: -3,
    furball: -1, furballCapDay: 5,
    min: 0, max: 100,
    espeonReq: 70, umbreonReq: 70, sylveonReq: 80,
  },
  EVOLUTIONS: {
    espeon:  { from: 7 * 60, to: 12 * 60, how: 'snack', req: 70 },   // 07:00–12:00
    umbreon: { from: 18 * 60, to: 20 * 60, how: 'snack', req: 70 },  // 18:00–20:00
    sylveon: { clock: 2880 + 15 * 60, how: 'auto', req: 80, age: 2880 },
  },
  STONES: { water: 'vaporeon', thunder: 'jolteon', fire: 'flareon', leaf: 'leafeon', ice: 'glaceon' },
  SHOP_STONES: [
    { key: 'water',   name: 'Water Stone',   price: 100 },
    { key: 'thunder', name: 'Thunder Stone', price: 100 },
    { key: 'fire',    name: 'Fire Stone',    price: 100 },
    { key: 'leaf',    name: 'Leaf Stone',    price: 100 },
    { key: 'ice',     name: 'Ice Stone',     price: 100 },
  ],

  // ---------- shiny ----------
  SHINY: { odds: 50, shinyDayOdds: 25, filter: 'hue-rotate(150deg) saturate(1.35)' },

  // ---------- personalities ----------
  PERSONALITIES: {
    cheerful: { label: 'CHEERFUL', meal: 'sitrus',  dislike: 'pecha',  snack: 'sweet-heart',    lucky: 'heart', emote: 'cheer',   bubble: 'Eevee!' },
    mellow:   { label: 'MELLOW',   meal: 'oran',    dislike: 'cheri',  snack: 'honey',          lucky: 'ball',  emote: 'chat',    bubble: 'Eeve~' },
    feisty:   { label: 'FEISTY',   meal: 'cheri',   dislike: 'sitrus', snack: 'rage-candy-bar', lucky: 'seven', emote: 'shock',   bubble: 'Bark!' },
    sleepy:   { label: 'SLEEPY',   meal: 'chesto',  dislike: 'cheri',  snack: 'honey',          lucky: 'ball',  emote: 'worry',   bubble: 'Zzz…' },
    sweet:    { label: 'SWEET',    meal: 'pecha',   dislike: 'chesto', snack: 'sweet-heart',    lucky: 'ball',  emote: 'cheer',   bubble: 'Moe!' },
  },
  NAMES: ['Mochi','Biscuit','Coco','Pudding','Sakura','Tofu','Fluffy','Ash','Pepper','Maple',
          'Cocoa','Clover','Dango','Honey','Miso','Piko','Riko','Tama','Yuki','Zephyr'],

  // ---------- food ----------
  FOOD: {
    meals: [
      { key: 'cheri',   name: 'Cheri Berry',  art: 'cheri-berry.png',  tag: '' },
      { key: 'chesto',  name: 'Chesto Berry', art: 'chesto-berry.png', tag: '' },
      { key: 'oran',    name: 'Oran Berry',   art: 'oran-berry.png',   tag: '' },
      { key: 'pecha',   name: 'Pecha Berry',  art: 'pecha-berry.png',  tag: '' },
      { key: 'rawst',   name: 'Rawst Berry',  art: 'rawst-berry.png',  tag: 'HEALTH' },
      { key: 'sitrus',  name: 'Sitrus Berry', art: 'sitrus-berry.png', tag: '' },
    ],
    snacks: [
      { key: 'honey',          name: 'Honey',          art: 'honey.png' },
      { key: 'rage-candy-bar', name: 'Rage Candy Bar', art: 'rage-candy-bar.png' },
      { key: 'rare-candy',     name: 'Rare Candy',     art: 'rare-candy.png' },
      { key: 'sweet-heart',    name: 'Sweet Heart',    art: 'sweet-heart.png' },
    ],
  },
  FOOD_DIR: 'items/',

  // ---------- dex ----------
  DEX: [
    { id: 133, key: 'eevee',    name: 'Eevee',    normal: '133.gif',        shiny: 'shiny_133.gif' },
    { id: 134, key: 'vaporeon', name: 'Vaporeon', normal: '134.gif',        shiny: 'shiny_134.gif' },
    { id: 135, key: 'jolteon',  name: 'Jolteon',  normal: '135.gif',        shiny: 'shiny_135.gif' },
    { id: 136, key: 'flareon',  name: 'Flareon',  normal: '136.gif',        shiny: 'shiny_136.gif' },
    { id: 196, key: 'espeon',   name: 'Espeon',   normal: '196.gif',        shiny: 'shiny_196.gif' },
    { id: 197, key: 'umbreon',  name: 'Umbreon',  normal: '197.gif',        shiny: 'shiny_197.gif' },
    { id: 470, key: 'leafeon',  name: 'Leafeon',  normal: '470.gif',        shiny: 'shiny_470.gif' },
    { id: 471, key: 'glaceon',  name: 'Glaceon',  normal: '471.gif',        shiny: 'shiny_471.gif' },
    { id: 700, key: 'sylveon',  name: 'Sylveon',  normal: '700.gif',        shiny: 'shiny_700.gif' },
  ],
  DEX_DIR: 'dex_anim/',
  CHIBI_DIR: '../pokemonsleep/',        // <key>_normal.png / <key>_shiny.png

  // ---------- PMD sprites ----------
  PMD_DIR: '../eeveelution-assets/eeveelution_sprites/',
  PMD_FORMS: ['eevee', 'vaporeon', 'jolteon', 'flareon'],
  PMD_DIRS: ['down', 'up', 'left', 'right', 'down left', 'down right', 'up left', 'up right'],
  PMD_DIRKEYS: { 'down': 'down', 'up': 'up', 'left': 'left', 'right': 'right',
                 'down left': 'dl', 'down right': 'dr', 'up left': 'ul', 'up right': 'ur' },
  // frame counts (probed from disk — .png only, excludes Godot .import files)
  PMD_FRAMES: {
    eevee:    { down: { idle: 2, move: 3, attack: 2, hurt: 1 }, side: { idle: 2, move: 3, attack: 2, hurt: 1 } },
    vaporeon: { down: { idle: 2, move: 3, attack: 2, hurt: 1 }, side: { idle: 2, move: 3, attack: 2, hurt: 1 } },
    jolteon:  { down: { idle: 2, move: 3, attack: 2, hurt: 1 }, side: { idle: 2, move: 3, attack: 2, hurt: 1 } },
    flareon:  { down: { idle: 3, move: 3, attack: 1, hurt: 1 }, side: { idle: 3, move: 3, attack: 1, hurt: 1 } },
  },
  // per-form procedural gaits for the chibi forms (single-sprite art brought to
  // life at runtime — each form walks and idles differently).
  // style: float | lope | flutter | skitter | sway
  CHIBI_ANIM: {
    espeon:  { style: 'float',   hopHz: 1.9, hopAmp: 4.0, lean: 0.05, waddle: 0.04, squash: 0.05, breathHz: 1.1, breathAmp: 1.1, twEvery: [4, 9]   },
    umbreon: { style: 'lope',    hopHz: 2.4, hopAmp: 6.5, lean: 0.13, waddle: 0.09, squash: 0.08, breathHz: 1.3, breathAmp: 1.4, twEvery: [3, 8]   },
    leafeon: { style: 'flutter', hopHz: 2.9, hopAmp: 5.0, lean: 0.09, waddle: 0.06, squash: 0.06, breathHz: 1.5, breathAmp: 1.3, twEvery: [3, 8]   },
    glaceon: { style: 'skitter', hopHz: 3.7, hopAmp: 3.4, lean: 0.07, waddle: 0.04, squash: 0.05, breathHz: 1.7, breathAmp: 1.1, twEvery: [2.5, 7] },
    sylveon: { style: 'sway',    hopHz: 1.7, hopAmp: 4.5, lean: 0.04, waddle: 0.12, squash: 0.05, breathHz: 1.0, breathAmp: 1.2, twEvery: [5, 10]  },
  },
  EMOTE_DIR: '../eeveelution-assets/pmd_effects/',
  EMOTES: { cheer: 2, chat: 3, confused: 10, shock: 2, surprise: 5, water: 3, worry: 2 },
  EMOTE_SCALE: 3,

  STONES_DIR: 'stones/',
  STONE_ART: { water: 'water_stone.png', thunder: 'thunder_stone.png', fire: 'fire_stone.png', leaf: 'leaf_stone.png', ice: 'ice_stone.png' },

  // ---------- scene ----------
  SCENE_DIR: 'scene/',
  BANDS: { sky: [0, 390], far: [390, 470], grass: [470, 932] },
  TILES: { sky: 72, far: 72, grass: 54 },          // logical px per tile (3x / 3x / 3x)
  PET: { x0: 60, x1: 370, y0: 540, y1: 840, scale0: 0.85, scale1: 1.15,
         pmdPx: 92, chibiPx: 90, speed: 62 },     // display heights @ scale 1
  DECOR_DEFAULT: [
    { art: 'tree.png',     x: 260, y: 480, s: 4 },
    { art: 'tuft_0.png',   x: 52,  y: 520, s: 3 },
    { art: 'tuft_1.png',   x: 352, y: 545, s: 3 },
    { art: 'tuft_0.png',   x: 140, y: 610, s: 3 },
    { art: 'tuft_1.png',   x: 300, y: 700, s: 3 },
    { art: 'plant.png',    x: 70,  y: 700, s: 3 },
    { art: 'plant.png',    x: 392, y: 600, s: 3 },
    { art: 'bush.png',     x: 90,  y: 640, s: 3 },
  ],

  // ---------- casino ----------
  CASINO: {
    dailyFree: 50,
    cabinet: { x: 85, y: 300, w: 260, h: 322 },   // slot_cabinet.png placement (scene units)
    screen: { x: 117, y: 372, w: 196, h: 160 },   // dark recess = drawable board area
    petSpot: { x: 362, y: 722 },
    slots: {
      symbols: [
        { key: 'seven', w: 8,  pay: 30, art: null },
        { key: 'ball',  w: 16, pay: 10, art: 'poke-ball.png' },
        { key: 'oran',  w: 24, pay: 5,  art: 'oran-berry.png' },
        { key: 'heart', w: 24, pay: 4,  art: 'sweet-heart.png' },
        { key: 'eevee', w: 28, pay: 3,  art: 'chibi:eevee' },
      ],
      pairPay: 1.2,                 // x1.2 (M9 balance: base RTP ~86.4%; 88.4-94.7% across lucky symbols - S15 band 85-98%)
      luckyMul: 1.2,
      lucky: 'heart',               // M6: per-personality lucky symbol
      reelStopMs: [500, 900, 1300],
      lines: 5,                     // bet 1→1 line, 2→3 lines, 3→5 lines
      lineForBet: { 1: 1, 2: 3, 3: 5 },
    },
    roulette: { slots: 12, spinMs: 3000, payColor: 2, payForm: 4, paySlot: 12,
      forms: ['vaporeon', 'jolteon', 'flareon', 'espeon'], colors: ['red', 'blue', 'green'] },
    cards: {
      count: 4, pay: 4,
      // 4 unique cards — one rank per suit (♥Fire ♦Water ♣Grass ♠Thunder)
      ranks: [
        { k: 'A', v: 4, suit: 'fire' },
        { k: 'K', v: 3, suit: 'water' },
        { k: 'Q', v: 2, suit: 'grass' },
        { k: 'J', v: 1, suit: 'thunder' },
      ],
    },
  },

  // ---------- shop ----------
  SHOP: {
    decor: [
      { key: 'bed',      name: 'Pet Bed',       price: 90,  art: 'petbed.png' },
      { key: 'snowman',  name: 'Snowman',       price: 100, art: 'snowman.png' },
      { key: 'mushroom', name: 'Mushroom Patch', price: 80, art: 'mushroom.png' },
      { key: 'flowers',  name: 'Flower Patch',  price: 80,  art: 'plant.png' },
      { key: 'tree2',    name: 'Second Tree',   price: 120, art: 'tree.png' },
      { key: 'bush',     name: 'Berry Bush',    price: 150, art: 'berry_bush.png' },
    ],
    fashion: [
      { key: 'bow',     name: 'Red Bow',     price: 100, art: 'fashion_bow.png' },
      { key: 'scarf',   name: 'Blue Scarf',  price: 120, art: 'fashion_scarf.png' },
      { key: 'leaflow', name: 'Leaf Hat',    price: 150, art: 'fashion_leaflow.png' },
      { key: 'star',    name: 'Star Clip',   price: 200, art: 'fashion_star.png' },
    ],
    themes: [
      { key: 'night',  name: 'Twilight Sky', price: 100, art: 'sky_night.png' },
      { key: 'sunset', name: 'Sunset Sky',   price: 100, art: 'sky_sunset.png' },
    ],
  },
  SHOP_DECOR_POS: {
    bed: { x: 120, y: 780, s: 1 }, snowman: { x: 370, y: 800, s: 3 },
    mushroom: { x: 330, y: 700, s: 3 }, flowers: { x: 390, y: 745, s: 3 },
    tree2: { x: 70, y: 485, s: 4 }, bush: { x: 385, y: 640, s: 3 },
  },

  // ---------- medals ----------
  MEDALS: [
    { key: 'hatch',    name: 'New Life',      desc: 'Hatch an egg' },
    { key: 'meal1',    name: 'First Bite',    desc: 'Serve a meal' },
    { key: 'pet10',    name: 'Best Friends',  desc: 'Pet 10 times' },
    { key: 'clean10',  name: 'Clean Freak',   desc: 'Clean 10 furballs' },
    { key: 'meals50',  name: 'Foodie',        desc: 'Serve 50 meals' },
    { key: 'game1',    name: 'Player',        desc: 'Play a minigame' },
    { key: 'spins10',  name: 'Casino Novice', desc: 'Spin 10 slots' },
    { key: 'lucky',    name: 'Lucky Eevee',   desc: 'Net +100 coins all-time' },
    { key: 'jackpot',  name: 'JACKPOT',       desc: 'Hit 777' },
    { key: 'highroller', name: 'High Roller', desc: 'Net +500 in one session' },
    { key: 'evoothers', name: 'Evolved!',     desc: 'Any evolution' },
    { key: 'evo-vaporeon', name: 'Vaporeon',  desc: 'Evolve into Vaporeon' },
    { key: 'evo-jolteon',  name: 'Jolteon',   desc: 'Evolve into Jolteon' },
    { key: 'evo-flareon',  name: 'Flareon',   desc: 'Evolve into Flareon' },
    { key: 'evo-espeon',   name: 'Espeon',    desc: 'Evolve into Espeon' },
    { key: 'evo-umbreon',  name: 'Umbreon',   desc: 'Evolve into Umbreon' },
    { key: 'evo-leafeon',  name: 'Leafeon',   desc: 'Evolve into Leafeon' },
    { key: 'evo-glaceon',  name: 'Glaceon',   desc: 'Evolve into Glaceon' },
    { key: 'evo-sylveon',  name: 'Sylveon',   desc: 'Evolve into Sylveon' },
    { key: 'shiny1',   name: 'Shiny',         desc: 'Get a shiny' },
    { key: 'sh-vaporeon', name: 'Shiny Vaporeon', desc: 'Catch a shiny Vaporeon' },
    { key: 'sh-jolteon',  name: 'Shiny Jolteon',  desc: 'Catch a shiny Jolteon' },
    { key: 'sh-flareon',  name: 'Shiny Flareon',  desc: 'Catch a shiny Flareon' },
    { key: 'sh-espeon',   name: 'Shiny Espeon',   desc: 'Catch a shiny Espeon' },
    { key: 'sh-umbreon',  name: 'Shiny Umbreon',  desc: 'Catch a shiny Umbreon' },
    { key: 'sh-leafeon',  name: 'Shiny Leafeon',  desc: 'Catch a shiny Leafeon' },
    { key: 'sh-glaceon',  name: 'Shiny Glaceon',  desc: 'Catch a shiny Glaceon' },
    { key: 'sh-sylveon',  name: 'Shiny Sylveon',  desc: 'Catch a shiny Sylveon' },
    { key: 'dex9',     name: 'Dex 9/9',       desc: 'Fill the Pokedex' },
    { key: 'dex18',    name: 'Eevee Master',  desc: '9/9 normal + 9/9 shiny' },
    { key: 'adult',    name: 'Grown Up',      desc: 'Reach the adult stage' },
    { key: 'death1',   name: 'Farewell',      desc: 'Lose a pet' },
    { key: 'lives3',   name: 'Veteran',       desc: 'Raise 3 pets' },
    { key: 'rankS',    name: 'S-Rank Care',   desc: 'S rank at graduation' },
    { key: 'day7',     name: 'Week One',      desc: 'Reach day 7' },
    { key: 'day30',    name: 'Month One',     desc: 'Reach day 30' },
  ],

  // ---------- monthly events ----------
  // sale/shiny use 1-based day-of-month; ghost uses 0-based (S18: setDay(16) = ghost night)
  EVENTS: { sale: [5, 15, 25], shiny: [10, 20, 30], ghost: 15, ghostCoins: 5, ghostSpeed: 26 },

  // ---------- audio (M7) ----------
  // tracks: file null -> procedural chiptune loop (placeholder until the user's
  // ogg pick from preview_audio.html; set file to the ogg path to swap it in)
  AUDIO: {
    bgmVol: 0.55,
    tracks: {
      day: { file: null, synth: 'day' },
      night: { file: null, synth: 'night' },
    },
  },
};

// ---------- asset URL roots ----------
export const ROOT = (p) => p;   // relative to eevee_tama/
export const A = {
  scene: (f) => `../prod/scene/${f}`,
  fx: (f) => `../prod/fx/${f}`,
  items: (f) => `../prod/items/${f}`,
  stones: (f) => `../prod/stones/${f}`,
  dex: (f) => `../prod/dex_anim/${f}`,
  particles: (f) => `../prod/particles/${f}`,
  chibi: (key, shiny) => `../pokemonsleep/${key}_${shiny ? 'shiny' : 'normal'}.png`,
  cafe: (f) => `../cafemix/${f}`,
  p1: (f) => `../tamagotchi_original/${f}`,
  boardgame: (f) => `../prod/kenney/boardgame-pack/PNG/${f}`,
  cardsTint: (f) => `cards/${f}`,
  fashion: (f) => `prod_art/${f}`,
  audio: (f) => `../prod/audio/${f}`,
  logo: (f) => `prod_art/${f}`,
  icon: (f) => `icon/${f}`,
};

// stage display scale
export const STAGE_SCALE = { egg: 1, baby: 0.6, child: 0.8, adult: 1.0 };
export const STAGE_LABEL = { egg: 'EGG', baby: 'BABY', child: 'CHILD', adult: 'ADULT' };
