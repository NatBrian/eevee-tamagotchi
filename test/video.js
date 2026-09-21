// ============================================================
// test/video.js — Eevee-Tama FULL PLAYTHROUGH showcase video
//
// Records one continuous mobile playthrough of the entire game:
//   title → egg → hatch → care loop (feed/pet/ball/clean) →
//   night + sleep → sickness + medicine → stage-ups →
//   POKÉ CASINO (slots + 777 jackpot + free spin, roulette, card flip) →
//   Vaporeon evolution cinematic → Eeveelution tour (all 8 + shiny Glaceon) →
//   Dex 9/9 → profile → medals → ghost Eevee → shop (fashion + sky) →
//   "While you were away" report → GRADUATION → new egg → final Dex → title.
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
// tap a point in scene (logical) coordinates — viewport == scene (430x932 cover fit, scale 1)
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
  console.log('ready — recording starts');

  // ============ 1 · TITLE (first run) ============
  await sleep(2600); // logo + first-run hint "a new egg is waiting — tap to hatch"
  await tapEl(page, '#btn-hatch');
  await sleep(1400);

  // ============ 2 · EGG ============
  for (let i = 0; i < 3; i++) { await tapScene(page, 215, 620); await sleep(380); } // wobble taps
  await T('rate', 8); // 120 game-min → 7.5 s real
  await waitFor(page, () => window.TamaGame.get().stage === 'baby', 15000, 'hatch');
  await T('rate', 1);
  await sleep(2600); // confetti + "It's Mochi!" + first-run FEED tip

  // ============ 3 · FEED ============
  await tapEl(page, '#dock-feed');
  await sleep(1000);
  await tapEl(page, '#sheet-body [data-food="meal:oran"]');
  await sleep(3000); // eat anim + emote bubble

  // ============ 4 · PET ============
  await tapEl(page, '#dock-pet');
  await sleep(1800); // heart burst + emote

  // ============ 5 · GIVE BALL ============
  await tapEl(page, '#dock-play');
  await sleep(900);
  await tapEl(page, '#sheet-body [data-ball="1"]');
  await sleep(2600); // ball arc + cheer

  // ============ 6 · FURBALL ============
  await T('addPoop', 1);
  await sleep(1600); // "A furball appeared!" + tip
  const fb = await G(() => window.__G.state.furballs[0]);
  if (fb) { await tapScene(page, fb.x, fb.y); }
  await sleep(1600); // clean sparkle

  // ============ 7 · TIME-LAPSE → NIGHT → SLEEP → WAKE (day 2, child) ============
  // top up meters so the 12h lapse stays healthy (auto-sleep still needs energy < 40 at 20:00)
  await G(() => { const s = window.__G.state; s.stats = { meal: 100, happy: 100, energy: 100, health: 100 }; s.zeroH = 0; s.sickZeroH = 0; s.sick = false; });
  const totalNow = (await S()).total;
  const toNight = 1200 - totalNow; // 20:00 day 1
  await T('rate', 64);
  await sleep(Math.min(30000, (toNight / 128) * 1000) + 400);
  await T('rate', 1);
  await sleep(1200); // 20:00: auto-sleep (energy<40) — Zzz + sleep tip
  await sleep(1600);
  // tap pet to wake (skip to 07:00 → crosses 1440 → CHILD stage-up)
  const petPos = await G(() => ({ x: window.__G.pet.x, y: window.__G.pet.y }));
  await tapScene(page, petPos.x, petPos.y - 30);
  await sleep(3200); // "Good morning!" + "grew up!" confetti (child)

  // ============ 8 · SICKNESS + MEDICINE ============
  await T('setSick', true);
  await sleep(2000); // SICK badge + MEDICINE button + tip
  await tapEl(page, '#med-btn');
  await sleep(2200); // "All better!" sparkle

  // ============ 9 · TIME-LAPSE → ADULT (day 3 07:00) ============
  {
    const t0 = (await S()).total;
    await T('rate', 64);
    await sleep(Math.min(30000, ((2880 - t0) / 128) * 1000) + 400);
    await T('rate', 1);
    await sleep(3000); // "grew up!" → ADULT + evolve tip
  }
  // keep the pet healthy for the rest of the playthrough (clears any zero-hour buildup)
  await G(() => { const s = window.__G.state; s.stats = { meal: 100, happy: 100, energy: 100, health: 100 }; s.zeroH = 0; s.sickZeroH = 0; s.sick = false; });

  // ============ 10 · POKÉ CASINO ============
  await tapEl(page, '#dock-play');
  await sleep(900);
  await tapEl(page, '#sheet-body [data-casino="slots"]'); // casino tip toast
  await sleep(1600); // cabinet + pet walks to machine
  await tapEl(page, '#casino-spin');
  await sleep(2600); // reels
  await tapEl(page, '#casino-spin');
  await sleep(2600);
  // 777 JACKPOT
  await T('forceNext', { slots: 'jackpot' });
  await G(() => { window.__G.state.day.coins = Math.max(window.__G.state.day.coins, 30); });
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
  await sleep(3600); // wheel spin (3 s) + "WIN +6!"
  await sleep(1200);
  // CARD FLIP
  await tapEl(page, '#casino-tabs .ctab[data-game="cards"]');
  await T('forceNext', { cards: [1, 2, 3, 0] }); // A♥Fire (top) on card 4
  await G(() => window.__G.casino.switchGame('cards')); // re-deal consumes force
  await sleep(1400); // 4 face-down cards
  const rect = await G(() => { const r = window.__G.casino.cardRect(3); return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; });
  await tapScene(page, rect.x, rect.y); // pick card 4
  await sleep(600);
  await tapEl(page, '#casino-spin');
  await sleep(2600); // staggered 3D flips → "WIN +4!"
  await sleep(1200);
  await tapEl(page, '#casino-back');
  await sleep(1000);

  // ============ 11 · EVOLUTION — Vaporeon (full cinematic) ============
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
  await sleep(2600); // back to meadow — Vaporeon idle + confetti

  // ============ 12 · EVOLUTION TOUR (all remaining forms, quick cuts) ============
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
    await sleep(1300); // hold on the new form
  }

  // ============ 13 · POKÉDEX (9/9 + shiny) ============
  await tapEl(page, '#dock-menu');
  await sleep(700);
  await tapEl(page, '#sheet-body [data-go="dex"]');
  await sleep(3200);

  // ============ 14 · PROFILE ============
  await tapEl(page, '#sheet-close');
  await sleep(500);
  await tapEl(page, '#dock-menu');
  await sleep(700);
  await tapEl(page, '#sheet-body [data-go="profile"]');
  await sleep(3200); // face, name, chips, stat bars

  // ============ 15 · MEDALS ============
  await tapEl(page, '#sheet-close');
  await sleep(500);
  await tapEl(page, '#dock-menu');
  await sleep(700);
  await tapEl(page, '#sheet-body [data-go="medals"]');
  await sleep(3200);

  // ============ 16 · GHOST EEVEE (night) ============
  await tapEl(page, '#sheet-close');
  await sleep(500);
  // warpTo (absolute, forward) — the tour + dex/profile/medals leave the clock at
  // ~22:35, so warping to 21:30 would be a visible BACKWARD jump; 23:30 keeps it
  // forward, still night, with 450 game-min of margin before graduation (4320)
  // so the away beat below crosses it cleanly.
  await T('warpTo', 3870); // Day 3 23:30, night (3870 < 4320 — alive)
  await sleep(600);
  await T('forceGhost', true);
  await sleep(2200); // "A ghost Eevee drifts by… TAP IT!" + drift in
  const gh = await G(() => { const g = window.__G.state._runtime.ghost; return g ? { x: g.x, y: 515 } : null; });
  if (gh) await tapScene(page, gh.x, gh.y);
  await sleep(2400); // "GHOST EEVEE! +5 COINS" magic burst

  // ============ 17 · SHOP (fashion + sky) ============
  await tapEl(page, '#dock-menu');
  await sleep(700);
  await tapEl(page, '#sheet-body [data-go="shop"]');
  await sleep(1600); // shop grid
  await tapEl(page, '#sheet-body [data-shop="scarf"]'); // Blue Scarf → equipped
  await sleep(1800); // pet wears it
  await tapEl(page, '#sheet-body [data-shop="sunset"]'); // Sunset Sky → sky changes
  await sleep(2600); // sky shift
  await tapEl(page, '#sheet-close');
  await sleep(800);

  // ============ 18 · WHILE YOU WERE AWAY (→ graduation) ============
  await G(() => { const s = window.__G.state; s.stats = { meal: 100, happy: 100, energy: 100, health: 100 }; s.zeroH = 0; s.sickZeroH = 0; s.sick = false; s.day.snacks = 4; s.furballs.push({ x: 140, y: 720, small: true }, { x: 320, y: 780, small: false }); });
  const away = await T('simulateOffline', 360); // 12 game-hrs → crosses day 4 07:00
  await T('showAway', away.report);
  await sleep(3800); // report card: graduated + furballs + snacks
  await tapEl(page, '#away-ok');
  await sleep(3600); // GRADUATION! farewell card + care rank

  // ============ 19 · NEW EGG ============
  await tapEl(page, '#end-new');
  await sleep(2000);

  // ============ 20 · FINAL DEX + TITLE OUTRO ============
  await T('hatchNow');
  await T('warpTo', 2900);
  await sleep(400);
  await tapEl(page, '#dock-menu');
  await sleep(700);
  await tapEl(page, '#sheet-body [data-go="dex"]');
  await sleep(3400); // full 9/9 dex + shiny badge
  await tapEl(page, '#sheet-close');
  await sleep(900);
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
