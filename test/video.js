// ============================================================
// test/video.js: Eevee-Tama FULL PLAYTHROUGH showcase video (FINAL)
//
// One continuous mobile playthrough covering the ENTIRE game:
//
//  ACT 1 · LIFE 1 (main pet)
//   title → egg → hatch → meal → snack → pet → ball →
//   furball tap-clean + dock-clean → night sleep + wake (child) →
//   sickness + medicine → adult → POKÉ CASINO (forced LOSS → small
//   WIN → bet 3 → 777 JACKPOT + free spin · roulette win · card flip) →
//   Vaporeon evolution cinematic → tour of all remaining forms
//   (Jolteon, Flareon, Espeon, Umbreon, Leafeon, SHINY Glaceon, Sylveon) →
//   Pokédex 9/18 → long-press profile + RENAME → medals → ghost Eevee →
//   shop (decor + fashion + sky) → "While you were away" → GRADUATION
//
//  ACT 2 · LIFE 2 (the other ending)
//   new egg → hatch → neglect → SICK → DEATH (tombstone + R.I.P. card)
//
//  ACT 3 · LIFE 3 (wrap-up)
//   new egg → hatch + adult cascade → final Pokédex → SETTINGS
//   (sound toggle) → reset → title outro
//
// Run (repo root, needs the local server on :8734):
//   $env:NODE_PATH = "<npx cache dir with playwright>\node_modules"; node test\video.js
//
// Output: showcase/video/<page>.webm  (convert with ffmpeg → mp4, see README)
// ============================================================
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.TAMA_URL || 'http://localhost:8734/eevee_tama/index.html';
const OUT_DIR = path.join(__dirname, '..', 'showcase', 'video');

// ---------- tiny helpers ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(page, fn, timeoutMs, label) {
  const t0 = Date.now();
  for (;;) {
    const v = await page.evaluate(fn);
    if (v) return v;
    if (Date.now() - t0 > timeoutMs) throw new Error('waitFor timeout: ' + label);
    await sleep(80);
  }
}
// tap the center of a DOM element
async function tapEl(page, selector) {
  const box = await page.locator(selector).boundingBox();
  if (!box) throw new Error('no box for ' + selector);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}
// tap a point in scene (logical) coordinates, viewport == scene (430x932 cover fit, scale 1)
const tapScene = (page, x, y) => page.mouse.click(x, y);

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  // remove previous recordings
  for (const f of fs.readdirSync(OUT_DIR)) if (f.endsWith('.webm')) fs.unlinkSync(path.join(OUT_DIR, f));

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 932 }, // iPhone 15 Pro Max = game's native logical size
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    recordVideo: { dir: OUT_DIR, size: { width: 430, height: 932 } },
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });

  const T = (m, ...a) => page.evaluate(([mm, aa]) => window.TamaGame[mm](...aa), [m, a]);
  const G = (expr) => page.evaluate(expr);
  const S = () => page.evaluate(() => window.TamaGame.get());

  console.log('boot…');
  await page.goto(BASE, { waitUntil: 'load', timeout: 90000 });
  await waitFor(page, () => window.TamaGame && window.__G && !window.__G.booting && window.__G.img.missing.length === 0, 45000, 'boot');
  await G(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload({ waitUntil: 'load', timeout: 90000 });
  await waitFor(page, () => window.TamaGame && !window.__G.booting && window.__G.img.missing.length === 0, 45000, 'boot2');
  console.log('ready, recording starts');

  // ============ 1 · TITLE (first run) ============
  await sleep(2600); // logo + first-run hint "a new egg is waiting, tap to hatch"
  await tapEl(page, '#btn-hatch');
  await sleep(1400);

  // ============ 2 · EGG ============
  for (let i = 0; i < 3; i++) { await tapScene(page, 215, 620); await sleep(380); } // wobble taps
  await T('rate', 8); // 120 game-min → 7.5 s real
  await waitFor(page, () => window.TamaGame.get().stage === 'baby', 15000, 'hatch');
  await T('rate', 1);
  await sleep(2600); // confetti + "It's <name>!" + first-run FEED tip

  // ============ 3 · FEED (meal) ============
  await tapEl(page, '#dock-feed');
  await sleep(1000);
  await tapEl(page, '#sheet-body [data-food="meal:oran"]');
  await sleep(3000); // eat anim + emote bubble

  // ============ 4 · FEED (snack) ============
  await tapEl(page, '#dock-feed');
  await sleep(900);
  await tapEl(page, '#sheet-body [data-food="snack:honey"]');
  await sleep(2400); // snack emote + happy bump

  // ============ 5 · PET ============
  await tapEl(page, '#dock-pet');
  await sleep(1800); // heart burst + emote

  // ============ 6 · GIVE BALL ============
  await tapEl(page, '#dock-play');
  await sleep(900);
  await tapEl(page, '#sheet-body [data-ball="1"]');
  await sleep(2600); // ball arc + cheer

  // ============ 7 · FURBALLS (tap-clean + dock clean) ============
  await T('addPoop', 2);
  await sleep(1600); // "A furball appeared!" + tip
  const fb = await G(() => window.__G.state.furballs[0]);
  if (fb) await tapScene(page, fb.x, fb.y);
  await sleep(1600); // clean sparkle
  await tapEl(page, '#dock-clean'); // dock button cleans the rest
  await sleep(1600); // sparkle burst

  // ============ 8 · TIME-LAPSE → NIGHT → SLEEP → WAKE (day 2, child) ============
  // top up meters so the 13h lapse stays healthy (auto-sleep still needs energy < 40 at 20:00)
  await G(() => { const s = window.__G.state; s.stats = { meal: 100, happy: 100, energy: 100, health: 100 }; s.zeroH = 0; s.sickZeroH = 0; s.sick = false; });
  const totalNow = (await S()).total;
  const toNight = 1200 - totalNow; // 20:00 day 1
  await T('rate', 64);
  await sleep(Math.min(30000, (toNight / 128) * 1000) + 400);
  await T('rate', 1);
  await sleep(1200); // 20:00: auto-sleep (energy<40), Zzz + sleep tip
  await sleep(1600);
  // tap pet to wake (skip to 07:00 → crosses 1440 → CHILD stage-up)
  const petPos = await G(() => ({ x: window.__G.pet.x, y: window.__G.pet.y }));
  await tapScene(page, petPos.x, petPos.y - 30);
  await sleep(3200); // "Good morning!" + "grew up!" confetti (child)

  // ============ 9 · SICKNESS + MEDICINE ============
  await T('setSick', true);
  await sleep(2000); // SICK badge + MEDICINE button + tip
  await tapEl(page, '#med-btn');
  await sleep(2200); // "All better!" sparkle

  // ============ 10 · TIME-LAPSE → ADULT (day 3 07:00) ============
  {
    const t0 = (await S()).total;
    await T('rate', 64);
    await sleep(Math.min(30000, ((2880 - t0) / 128) * 1000) + 400);
    await T('rate', 1);
    await sleep(3000); // "grew up!" → ADULT + evolve tip
  }
  // keep the pet healthy for the rest of the playthrough (clears any zero-hour buildup)
  await G(() => { const s = window.__G.state; s.stats = { meal: 100, happy: 100, energy: 100, health: 100 }; s.zeroH = 0; s.sickZeroH = 0; s.sick = false; });

  // ============ 11 · POKÉ CASINO (loss → win → JACKPOT → roulette → cards) ============
  await tapEl(page, '#dock-play');
  await sleep(900);
  await tapEl(page, '#sheet-body [data-casino="slots"]'); // casino tip toast
  await sleep(1600); // cabinet + pet walks to machine
  // deterministic casino: find a PRNG seed whose spin 1 is a clean loss and spin 2 a small win
  // (spinInstant parity: same 9 weighted draws per round as the live reels)
  const probe = await G(() => {
    const G2 = window.__G, c = G2.casino;
    let found = null;
    for (let n = 1; n <= 500000 && found === null; n++) {
      window.TamaGame.seed(n);
      const r1 = c.spinInstant('slots', 1, { bet: 2 });
      if (r1.totalWin !== 0) continue;
      const r2 = c.spinInstant('slots', 1, { bet: 2 });
      if (r2.totalWin > 0 && r2.totalWin < 10) found = n;
    }
    if (found !== null) window.TamaGame.seed(found);
    G2.state.day.coins = 200;
    return found;
  });
  console.log('casino loss seed:', probe);
  await tapEl(page, '#casino-spin');
  await sleep(2600); // reels → LOSS (pet worries)
  await tapEl(page, '#casino-spin');
  await sleep(2600); // reels → small WIN (pet cheers)
  // 777 JACKPOT at max bet (3 chips → 5 lines)
  await tapEl(page, '#casino-bet .betbtn[data-bet="3"]');
  await sleep(400);
  await T('forceNext', { slots: 'jackpot' });
  await tapEl(page, '#casino-spin');
  await sleep(3600); // 777 + confetti + "JACKPOT! +FREE SPIN"
  await tapEl(page, '#casino-spin'); // bonus free spin
  await sleep(2600);
  // ROULETTE
  await tapEl(page, '#casino-tabs .ctab[data-game="roulette"]');
  await sleep(900); // wheel
  await tapEl(page, '#casino-roulette-bet .rtab[data-rt="color:0"]'); // RED ×2
  await tapEl(page, '#casino-roulette-bet .rtab[data-rt="form:0"]'); // Vaporeon ×4
  await sleep(500);
  await T('forceNext', { roulette: 0 }); // seg 0: red + vaporeon → win 2+4
  await tapEl(page, '#casino-spin');
  await sleep(3600); // wheel spin (3 s) + "WIN +12!"
  await sleep(1200);
  // CARD FLIP
  await tapEl(page, '#casino-tabs .ctab[data-game="cards"]');
  await T('forceNext', { cards: [1, 2, 3, 0] }); // A♥Fire (top) on card 4
  await G(() => { window.__G.casino.switchGame('cards'); }); // re-deal consumes force
  await sleep(1400); // 4 face-down cards
  const rect = await G(() => { const r = window.__G.casino.cardRect(3); return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; });
  await tapScene(page, rect.x, rect.y); // pick card 4
  await sleep(600);
  await tapEl(page, '#casino-spin');
  await sleep(2600); // staggered 3D flips → "WIN +8!"
  await sleep(1200);
  await tapEl(page, '#casino-back');
  await sleep(1000);

  // ============ 12 · EVOLUTION, Vaporeon (full cinematic) ============
  await tapEl(page, '#dock-menu');
  await sleep(800);
  await tapEl(page, '#sheet-body [data-go="evolve"]');
  await sleep(1800); // stones + time windows
  await G(() => { window.__G.state.day.coins = Math.max(window.__G.state.day.coins, 100); });
  await tapEl(page, '#sheet-body [data-stone="water"]'); // buy Water Stone
  await sleep(1400); // "Bought Water Stone!" + sheet refresh (USE)
  await tapEl(page, '#sheet-body [data-stone="water"]'); // USE → "Evolution begins!"
  await sleep(1200); // white flash + sparkles
  await sleep(2200); // dex GIF + name card VAPORGEON… VAPORGEON
  await tapEl(page, '#evo-ok');
  await sleep(2600); // back to meadow, Vaporeon idle + confetti

  // ============ 13 · EVOLUTION TOUR (all remaining forms, quick cuts) ============
  const tour = [
    { form: 'jolteon',  stone: 'thunder' },
    { form: 'flareon',  stone: 'fire' },
    { form: 'espeon',  affinity: 70, time: '10:05', snack: 'honey' },
    { form: 'umbreon', affinity: 70, time: '19:00', snack: 'honey' },
    { form: 'leafeon',  stone: 'leaf' },
    { form: 'glaceon',  stone: 'ice', shiny: true },
    { form: 'sylveon', affinity: 80, auto: true },
  ];
  for (const t of tour) {
    await T('newEgg');
    await sleep(700); // egg beat
    await T('hatchNow');
    if (t.shiny) await T('forceShiny', true);
    await T('warpTo', 2900); // adult, day 3
    await sleep(200);
    if (t.affinity !== undefined) await T('setAffinity', t.affinity);
    if (t.time) { await T('warp', t.time); await sleep(120); }
    if (t.snack) await T('snack', t.snack);
    if (t.stone) await T('giveStone', t.stone);
    if (t.auto) { await T('warpTo', 3780); await sleep(300); }
    await waitFor(page, () => window.TamaGame.get().screen === 'evo', 8000, 'evo screen ' + t.form);
    await sleep(1500); // flash + GIF
    await sleep(1600); // name card (+ SHINY! banner for glaceon)
    await tapEl(page, '#evo-ok');
    await sleep(1300); // hold on the new form (each walks its own gait)
  }

  // ============ 14 · POKÉDEX (9/18 + shiny) ============
  await tapEl(page, '#dock-menu');
  await sleep(700);
  await tapEl(page, '#sheet-body [data-go="dex"]');
  await sleep(3200);

  // ============ 15 · PROFILE (long-press pet) + RENAME ============
  await tapEl(page, '#sheet-close');
  await sleep(500);
  await G(() => { window.__G.state.furballs.length = 0; }); // no stray furball steals the hit
  const pp = await G(() => ({ x: window.__G.pet.x, y: window.__G.pet.y }));
  await page.mouse.move(pp.x, pp.y - 30);
  await page.mouse.down();
  await sleep(700); // long-press (350 ms threshold) → profile
  await page.mouse.up();
  await sleep(900); // profile sheet slides up
  const newName = await G(() => {
    const cur = window.__G.state.pet.name;
    return ['Biscuit', 'Dango', 'Yuki', 'Zephyr'].find((n) => n !== cur) || 'Dango';
  });
  await tapEl(page, '#rename-btn');
  await sleep(400);
  await page.fill('#rename-input', newName);
  await tapEl(page, '#rename-save');
  await sleep(3200); // renamed profile: face, name, personality, rank, stat bars

  // ============ 16 · MEDALS ============
  await tapEl(page, '#sheet-close');
  await sleep(500);
  await tapEl(page, '#dock-menu');
  await sleep(700);
  await tapEl(page, '#sheet-body [data-go="medals"]');
  await sleep(3200);

  // ============ 17 · GHOST EEVEE (night) ============
  await tapEl(page, '#sheet-close');
  await sleep(500);
  // warpTo (absolute, forward), the tour + dex/profile/medals leave the clock at
  // ~22:35, so warping to 21:30 would be a visible BACKWARD jump; 23:30 keeps it
  // forward, still night, with 450 game-min of margin before graduation (4320)
  // so the away beat below crosses it cleanly.
  await T('warpTo', 3870); // Day 3 23:30, night (3870 < 4320, alive)
  await sleep(600);
  await T('forceGhost', true);
  await sleep(2200); // "A ghost Eevee drifts by… TAP IT!" + drift in
  const gh = await G(() => { const g = window.__G.state._runtime.ghost; return g ? { x: g.x, y: 515 } : null; });
  if (gh) await tapScene(page, gh.x, gh.y);
  await sleep(2400); // "GHOST EEVEE! +5 COINS" magic burst

  // ============ 18 · SHOP (decor + fashion + sky) ============
  await G(() => { window.__G.state.day.coins = 350; }); // fund the beat: snowman 100 + scarf 120 + sunset sky 100
  await tapEl(page, '#dock-menu');
  await sleep(700);
  await tapEl(page, '#sheet-body [data-go="shop"]');
  await sleep(1600); // shop grid
  await tapEl(page, '#sheet-body [data-shop="snowman"]'); // DECOR section, snowman pops into the meadow
  await sleep(1800); // purchase sparkle + new scene decor
  await G(() => { document.querySelector('#sheet-body [data-shop="scarf"]').scrollIntoView({ block: 'center' }); });
  await sleep(400);
  await tapEl(page, '#sheet-body [data-shop="scarf"]'); // Blue Scarf → equipped
  await sleep(1800); // pet wears it
  await G(() => { document.querySelector('#sheet-body [data-shop="sunset"]').scrollIntoView({ block: 'center' }); }); // SKIES is below the sheet fold
  await sleep(400);
  await tapEl(page, '#sheet-body [data-shop="sunset"]'); // Sunset Sky → sky changes
  await sleep(2600); // sky shift
  await tapEl(page, '#sheet-close');
  await sleep(800);

  // ============ 19 · WHILE YOU WERE AWAY (→ graduation) ============
  await G(() => { const s = window.__G.state; s.stats = { meal: 100, happy: 100, energy: 100, health: 100 }; s.zeroH = 0; s.sickZeroH = 0; s.sick = false; s.day.snacks = 4; s.furballs.push({ x: 140, y: 720, small: true }, { x: 320, y: 780, small: false }); });
  const away = await T('simulateOffline', 360); // 12 game-hrs → crosses day 4 07:00
  await T('showAway', away.report);
  await sleep(3800); // report card: graduated + furballs + snacks
  await tapEl(page, '#away-ok');
  await sleep(3600); // GRADUATION! farewell card + care rank

  // ============ 20 · NEW EGG (life 2) ============
  await tapEl(page, '#end-new');
  await sleep(2000);

  // ============ 21 · NEGLECT → SICK → DEATH (the other ending) ============
  await T('hatchNow');
  await sleep(1800); // "It's <name>!" + confetti + FEED tip
  // starve + sicken: SICK badge shows for ~5.5 game-hrs, then health 0 → death
  await G(() => { const s = window.__G.state; s.stats = { meal: 0, happy: 0, energy: 0, health: 30 }; s.zeroH = 6; s.sickZeroH = 6; s.sick = true; s.furballIn = 1e9; });
  await T('rate', 64);
  await sleep(2600); // sick badge + medicine button + sad pet (sickZeroH 6 → 11.6, alive)
  await G(() => { window.__G.state.stats.health = 0; });
  await sleep(600); // next tick: sick + health 0 → DEATH
  await T('rate', 1);
  await sleep(4200); // tombstone + "R.I.P. <NAME>" card

  // ============ 22 · NEW EGG (life 3) ============
  await tapEl(page, '#end-new');
  await sleep(1200);

  // ============ 23 · HATCH + ADULT CASCADE (single name) ============
  await T('hatchNow');
  await T('warpTo', 2900);
  await sleep(400);

  // ============ 24 · FINAL DEX ============
  await tapEl(page, '#dock-menu');
  await sleep(700);
  await tapEl(page, '#sheet-body [data-go="dex"]');
  await sleep(3400); // full 9/18 dex + shiny badge

  // ============ 25 · SETTINGS (sound toggle) ============
  await tapEl(page, '#sheet-close');
  await sleep(500);
  await tapEl(page, '#dock-menu');
  await sleep(700);
  await tapEl(page, '#sheet-body [data-go="settings"]');
  await sleep(1800); // SOUND / HAPTICS / INSTALL / ABOUT / RESET rows
  await tapEl(page, '#sheet-body [data-sett="sound"]');
  await sleep(700); // OFF
  await tapEl(page, '#sheet-body [data-sett="sound"]');
  await sleep(700); // ON
  await tapEl(page, '#sheet-close');
  await sleep(800);

  // ============ 26 · TITLE OUTRO ============
  await T('reset'); // title outro
  await sleep(3200); // logo

  // ============ finalize ============
  await ctx.close(); // flushes the video
  await browser.close();
  const file = fs.readdirSync(OUT_DIR).find((f) => f.endsWith('.webm'));
  console.log('VIDEO:', file ? path.join(OUT_DIR, file) : 'NONE');
  if (errors.length) { console.log('ERRORS:'); errors.forEach((e) => console.log('  -', e.slice(0, 200))); }
  else console.log('no console errors');
  process.exit(errors.length ? 3 : 0);
})().catch((e) => { console.error('VIDEO ERROR:', e); process.exit(1); });
