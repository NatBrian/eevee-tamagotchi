// ============================================================
// test/chibi_anim.js: per-form chibi gait vision-verification (M9.1)
//
// For each of the 5 chibi forms (espeon/umbreon/leafeon/glaceon/sylveon):
//   · 10 frames across a rightward walk (hop/lean/squash/dust per form)
//   · 2 idle frames (per-form breathing)
//   · 1 forced ear-twitch frame
// then builds one contact sheet (5 rows) for vision-verification.
//
// Run (repo root, needs the local server on :8734):
//   $env:NODE_PATH = "<npx cache dir with playwright>\node_modules"; node test\chibi_anim.js
// Output: C:\Users\Admin\AppData\Local\Temp\opencode\chibi_anim\gait_sheet.png
// ============================================================
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.TAMA_URL || 'http://localhost:8734/eevee_tama/index.html';
const OUT = 'C:\\Users\\Admin\\AppData\\Local\\Temp\\opencode\\chibi_anim';
const FORMS = ['espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'];

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

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(OUT)) if (f.endsWith('.png')) fs.unlinkSync(path.join(OUT, f));

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  const T = (m, ...a) => page.evaluate(([mm, aa]) => window.TamaGame[mm](...aa), [m, a]);
  const G = (fn) => page.evaluate(fn);

  console.log('boot…');
  await page.goto(BASE, { waitUntil: 'load', timeout: 90000 });
  await waitFor(page, () => window.TamaGame && window.__G && !window.__G.booting && window.__G.img.missing.length === 0, 45000, 'boot');
  await G(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload({ waitUntil: 'load', timeout: 90000 });
  await waitFor(page, () => window.TamaGame && !window.__G.booting && window.__G.img.missing.length === 0, 45000, 'boot2');
  await sleep(500);

  const files = [];
  let n = 0;
  for (const form of FORMS) {
    // healthy adult of this form, standing center, walking right
    await T('show', 'main');
    await T('setStage', 'adult');
    await T('setSleeping', false);
    await T('setForm', form);
    await T('setStats', 80, 80, 80, 100);
    await G(() => {
      const p = window.__G.pet;
      p.x = 200; p.y = 700; p.tx = 355; p.ty = 700;
      p.state = 'move'; p.timer = 0; p.facing = 1;
      p._walkT = 0; p._prevAir = 0;
    });
    // 10 walk frames @ 200 ms
    for (let i = 0; i < 10; i++) {
      const nm = `f${String(n++).padStart(2, '0')}_${form}_${i}.png`;
      await page.screenshot({ path: path.join(OUT, nm) });
      files.push(nm);
      await sleep(200);
    }
    // 2 idle frames (walk target reached -> idle breathing)
    for (let i = 0; i < 2; i++) {
      const nm = `f${String(n++).padStart(2, '0')}_${form}_idle${i}.png`;
      await page.screenshot({ path: path.join(OUT, nm) });
      files.push(nm);
      await sleep(420);
    }
    // 1 forced ear-twitch frame
    await G(() => { const p = window.__G.pet; p._twP = 0.1; p._twSign = 1; });
    await sleep(70);
    const nmt = `f${String(n++).padStart(2, '0')}_${form}_twitch.png`;
    await page.screenshot({ path: path.join(OUT, nmt) });
    files.push(nmt);
    const st = await G(() => ({ state: window.__G.pet.state, form: window.__G.state.form }));
    console.log(`${form}: walked + idled (final state=${st.state})`);
  }

  // fps sample (one form idle for 2 s)
  await sleep(2000);
  const fps = await page.evaluate(() => window.TamaGame.fps());
  console.log('fps sample:', JSON.stringify(fps));
  console.log('errors:', errors.length ? errors.join(' | ') : 'none');

  // contact sheet: 13 per row x 5 rows, 215x466 cells
  fs.writeFileSync(path.join(OUT, 'list.txt'), files.map((f) => `file '${f}'`).join('\n'));
  ctx.close();
  await browser.close();
  console.log('OK, frames:', files.length, 'at', OUT);
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
