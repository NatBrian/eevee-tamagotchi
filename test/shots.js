// ============================================================
// test/shots.js: Eevee-Tama showcase screenshots (M9)
//
// Captures key game states at the native 430×932 @3x (iPhone 15 Pro Max)
// using the dev API for exact states. Output: showcase/m9_*.png
//
// Run (repo root, server on :8734):
//   $env:NODE_PATH = "<npx cache dir>\node_modules"; node test\shots.js
// ============================================================
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.TAMA_URL || 'http://localhost:8734/eevee_tama/index.html';
const OUT = path.join(__dirname, '..', 'showcase');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('pageerror:', e.message));

  const T = (m, ...a) => page.evaluate(([mm, aa]) => window.TamaGame[mm](...aa), [m, a]);
  const G = (expr) => page.evaluate(expr);
  const shot = async (name) => {
    await page.screenshot({ path: path.join(OUT, name) });
    console.log('  shot:', name);
  };

  await page.goto(BASE, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => window.TamaGame && window.__G && !window.__G.booting && window.__G.img.missing.length === 0, null, { timeout: 45000 });
  await G(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload({ waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => window.TamaGame && !window.__G.booting && window.__G.img.missing.length === 0, null, { timeout: 45000 });

  // 01: first-run title
  await sleep(2200);
  await shot('m9_01_title_first.png');

  // 02: egg
  await T('newEgg'); await sleep(900);
  await shot('m9_02_egg.png');

  // 03: hatch confetti (fresh baby)
  await T('hatchNow'); await T('warpTo', 130); await sleep(1500);
  await shot('m9_03_hatch.png');

  // 04: main day
  await T('warp', '12:00'); await sleep(900);
  await shot('m9_04_main_day.png');

  // 05: FEED sheet
  await T('openFood'); await sleep(550);
  await shot('m9_05_feed_sheet.png');
  await T('openMenu'); await sleep(300); // close by switching? no, use sheet close
  await page.evaluate(() => { document.getElementById('sheet-close').click(); }); await sleep(400);

  // 06: MENU sheet
  await T('openMenu'); await sleep(550);
  await shot('m9_06_menu_sheet.png');

  // 07: dex (full)
  await T('setDex', true);
  await T('openSheet', 'dex'); await sleep(900);
  await shot('m9_07_dex.png');

  // 08: profile
  await T('openSheet', 'profile'); await sleep(700);
  await shot('m9_08_profile.png');

  // 09: medals
  await T('openSheet', 'medals'); await sleep(700);
  await shot('m9_09_medals.png');

  // 10: shop
  await T('openSheet', 'shop'); await sleep(700);
  await shot('m9_10_shop.png');

  // 11: sunset sky
  await page.evaluate(() => { document.getElementById('sheet-close').click(); }); await sleep(300);
  await G(() => { window.__G.state.shop.theme = 'sunset'; window.__G.scene && window.__G.scene.rebuild && window.__G.scene.rebuild(); });
  await T('warp', '16:30'); await sleep(1200);
  await shot('m9_11_sunset.png');

  // 12: night + ghost Eevee
  await G(() => { window.__G.state.shop.theme = 'day'; });
  await T('warp', '21:30'); await T('forceGhost', true); await sleep(2200);
  await shot('m9_12_ghost.png');

  // 13: night sleep
  await T('forceGhost', false);
  await G(() => { const s = window.__G.state; s.stats.energy = 30; s._runtime.ghostDone = true; });
  await T('warp', '19:58'); await sleep(3200); // crosses 20:00 → asleep
  await shot('m9_13_sleep.png');

  // 14: sickness
  await T('skipSleep'); await T('setSick', true); await sleep(900);
  await shot('m9_14_sick.png');

  // 15: casino slots (777)
  await T('medicine');
  await G(() => { const s = window.__G.state; s.day.coins = 200; });
  await G(() => { window.__G.casino.open('slots'); window.__G.casino.setBet(2); window.__G.state.day.coins = 200; });
  await page.evaluate(() => window.TamaGame.forceNext({ slots: 'jackpot' }));
  await G(() => window.__G.casino.spin()); await sleep(2100);
  await shot('m9_15_casino_777.png');

  // 16: roulette mid-spin
  await sleep(1800);
  await G(() => { const cas = window.__G.casino; cas.switchGame('roulette'); cas.setBet(2); cas.rtBets = new Set(['color:0', 'form:0']); window.__G.state.day.coins = 200; });
  await sleep(300);
  await G(() => window.__G.casino.spin()); await sleep(1600);
  await shot('m9_16_roulette.png');

  // 17: card flip
  await sleep(2200);
  await G(() => { const cas = window.__G.casino; cas.switchGame('cards'); cas.setBet(2); window.__G.state.day.coins = 200; });
  await sleep(900);
  await shot('m9_17_cards.png');
  await page.evaluate(() => { document.getElementById('casino-back').click(); }); await sleep(600);

  // 18: evolution cinematic (Vaporeon name card)
  await G(() => { const s = window.__G.state; s.total = 3000; s.stats = { meal: 90, happy: 90, energy: 90, health: 100 }; });
  await sleep(200); // let the tick update stage → adult
  await T('giveStone', 'water'); await sleep(2400);
  await shot('m9_18_evolve_vaporeon.png');
  await page.evaluate(() => { document.getElementById('evo-ok').click(); }); await sleep(800);

  // 19: shiny evolution (Glaceon)
  await T('newEgg'); await T('hatchNow'); await T('warpTo', 3000); await sleep(200);
  await T('forceShiny', true);
  await T('giveStone', 'ice'); await sleep(2600);
  await shot('m9_19_evolve_shiny_glaceon.png');
  await page.evaluate(() => { document.getElementById('evo-ok').click(); }); await sleep(500);

  // 20: while-you-were-away
  await G(() => { const s = window.__G.state; s.furballs.push({ x: 140, y: 720, small: true }, { x: 320, y: 780, small: false }); });
  const away = await T('simulateOffline', 400); // ~8.3h: healthy catch-up
  await T('showAway', away.report); await sleep(700);
  await shot('m9_20_away.png');
  await page.evaluate(() => { document.getElementById('away-ok').click(); }); await sleep(400);

  // 21: graduation card (wake the pet first, a sleeping pet early-returns in
  // advance() before the live graduation check, so the card would be missing)
  await G(() => { const s = window.__G.state; s.sleeping = false; s.stats.energy = 100; });
  await T('warpTo', 4322); await sleep(1300);
  await shot('m9_21_graduation.png');

  // 22: new egg (fresh cycle)
  await page.evaluate(() => { document.getElementById('end-new').click(); }); await sleep(900);
  await shot('m9_22_new_egg.png');

  await ctx.close();
  await browser.close();
  console.log('DONE, shots in showcase/');
})().catch((e) => { console.error('SHOTS ERROR:', e); process.exit(1); });
