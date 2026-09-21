// main.js — boot, asset preload, rAF loop, input, screen routing
import { CFG, A, STAGE_LABEL } from './config.js';
import {
  freshState, startEgg, tick, doPet, cleanFurball, feedMeal, feedSnack,
  giveStone, skipSleep, careRank, clockOf, checkMedals, buyShop, giveMedicine,
} from './state.js';
import { Scene, Fx } from './scene.js';
import { Pet } from './pet.js';
import { load, save, clearSave } from './save.js';
import { attachDev } from './dev.js';

// ---------------- game container ----------------
export const G = {
  state: null,
  scene: null,
  fx: null,
  pet: null,
  img: null,
  canvas: null,
  ctx: null,
  screen: 'loading',
  lastT: 0,
  frameTimes: [],
  events: [],
  autosaveT: 0,
  hasSave: false,
  booting: true,
};

// ---------------- image bank ----------------
export class ImageBank {
  constructor() { this.map = new Map(); this.missing = []; }
  get(key) { const v = this.map.get(key); return v || null; }
  getGroup(key) { const v = this.map.get(key); return Array.isArray(v) ? v : (v ? [v] : null); }
}

function buildManifest() {
  const m = [];
  const scene = [
    'sky_day.png', 'sky_sunset.png', 'sky_night.png',
    'meadow_far_0.png', 'meadow_far_1.png',
    'grass_top_0.png', 'grass_top_1.png', 'grass_top_2.png', 'grass_top_3.png',
    'dirt.png', 'ground_edge.png', 'tree.png', 'tuft_0.png', 'tuft_1.png',
    'bush.png', 'mushroom.png', 'snowman.png', 'plant.png',
  ];
  for (const f of scene) m.push({ key: f.replace('.png', ''), src: A.scene(f) });
  const fx = ['egg_crack1.png', 'egg_crack2.png', 'furball.png', 'furball_small.png', 'heart.png', 'heart_2x.png', 'petbed.png', 'tombstone.png'];
  for (const f of fx) m.push({ key: f.replace('.png', ''), src: A.fx(f) });
  m.push({ key: 'egg_colored', src: '../serebii/egg_colored.png' });
  const items = CFG.FOOD.meals.concat(CFG.FOOD.snacks);
  const ballItems = ['poke-ball.png', 'great-ball.png', 'ultra-ball.png', 'master-ball.png'];
  for (const f of [...items.map((i) => i.art), ...ballItems]) m.push({ key: 'item_' + f.replace('.png', ''), src: A.items(f) });
  for (const k of Object.keys(CFG.STONE_ART)) m.push({ key: 'stone_' + k, src: A.stones(CFG.STONE_ART[k]) });
  const parts = ['circle_01.png', 'circle_03.png', 'magic_01.png', 'magic_02.png', 'smoke_01.png', 'spark_01.png', 'spark_02.png', 'star_01.png', 'star_03.png', 'symbol_01.png', 'symbol_02.png', 'twirl_01.png'];
  for (const f of parts) m.push({ key: f.replace('.png', ''), src: A.particles(f) });
  const p1 = ['source_food.png', 'source_bathroom.png', 'source_attention.png', 'source_dicipline.png', 'source_game.png', 'source_lights.png', 'source_medicine.png', 'source_status.png'];
  for (const f of p1) m.push({ key: 'p1_' + f.replace('source_').replace('.png', ''), src: A.p1(f) });
  for (const key of CFG.DEX.map((d) => d.key)) {
    m.push({ key: 'chibi_' + key + '_n', src: A.chibi(key, false) });
    m.push({ key: 'chibi_' + key + '_s', src: A.chibi(key, true) });
  }
  for (const form of CFG.PMD_FORMS) {
    for (const dir of CFG.PMD_DIRS) {
      for (const state of ['idle', 'move', 'attack', 'hurt']) {
        const F = CFG.PMD_FRAMES[form];
        const t = dir === 'down' ? F.down : F.side;
        const n = t[state] || 6;
        for (let i = 1; i <= n; i++) {
          m.push({ key: `pmd_${form}_${dir}_${state}`, idx: i - 1, src: `${CFG.PMD_DIR}${form}/${dir}/${state}/${i}.png` });
        }
      }
    }
  }
  for (const [name, n] of Object.entries(CFG.EMOTES)) {
    for (let i = 1; i <= n; i++) m.push({ key: 'emote_' + name, idx: i - 1, src: `${CFG.EMOTE_DIR}${name}/${i}.png` });
  }
  // shop art (fashion / bush / logo)
  m.push({ key: 'fashion_bow', src: A.fashion('fashion_bow.png') });
  m.push({ key: 'fashion_scarf', src: A.fashion('fashion_scarf.png') });
  m.push({ key: 'fashion_leaflow', src: A.fashion('fashion_leaflow.png') });
  m.push({ key: 'fashion_star', src: A.fashion('fashion_star.png') });
  m.push({ key: 'berry_bush', src: A.fashion('berry_bush.png') });
  m.push({ key: 'ghost_eevee', src: A.fashion('ghost_eevee.png') });
  m.push({ key: 'logo_title', src: A.logo('logo_title.png') });
  // boardgame (casino)
  m.push({ key: 'cabinet', src: A.fashion('slot_cabinet.png') });
  const bg = (dir, f) => m.push({ key: 'bg_' + f.replace('.png', ''), src: A.boardgame(dir + '/' + f) });
  bg('Cards', 'cardBack_red1.png');
  bg('Chips', 'chipRedWhite.png'); bg('Chips', 'chipBlueWhite.png'); bg('Chips', 'chipGreenWhite.png'); bg('Chips', 'chipWhiteBlue.png');
  bg('Dice', 'dieRed1.png');
  // tinted cards (M5)
  for (const suit of ['hearts', 'diamonds', 'clubs', 'spades']) {
    for (const r of ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']) {
      m.push({ key: 'card_' + suit + '_' + r, src: A.cardsTint(`card${suit[0].toUpperCase()}${suit.slice(1)}${r}.png`) });
    }
  }
  return m;
}

function loadOne(src) {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = src;
  });
}

async function preload(manifest, bank, onProgress) {
  const groups = new Map();
  const singles = [];
  for (const e of manifest) {
    if (e.key.startsWith('pmd_') || e.key.startsWith('emote_') || e.key.startsWith('card_') && false) {
      if (!groups.has(e.key)) groups.set(e.key, []);
      groups.get(e.key)[e.idx] = null;
    } else singles.push(e);
  }
  const total = manifest.length;
  let done = 0;
  const queue = manifest.slice();
  const workers = Array.from({ length: 16 }, async () => {
    while (queue.length) {
      const e = queue.shift();
      const im = await loadOne(e.src);
      if (im === null) bank.missing.push(e.key);
      if (groups.has(e.key)) groups.get(e.key)[e.idx] = im;
      else bank.map.set(e.key, im);
      done++;
      if (done % 24 === 0 || done === total) onProgress(done / total);
    }
  });
  await Promise.all(workers);
  for (const [k, arr] of groups) {
    const arr2 = arr.filter(Boolean);
    if (arr2.length) bank.map.set(k, arr2);
  }
}

// ---------------- DOM ----------------
const $ = (id) => document.getElementById(id);
const SCREEN_ELS = {
  title: 'screen-title',
  casino: 'screen-casino',
  evo: 'overlay-evo',
  end: 'overlay-end',
  away: 'overlay-away',
  loading: 'loading',
};
function showScreen(id) {
  G.screen = id;
  // show only the matching overlay; main/egg/... show none
  for (const [name, elId] of Object.entries(SCREEN_ELS)) {
    $(elId).classList.toggle('hidden', id !== name);
  }
  if (id === 'title' || id === 'casino') { $('hud').classList.add('hidden'); $('dock').classList.add('hidden'); }
  else { $('hud').classList.remove('hidden'); $('dock').classList.remove('hidden'); }
}
export function setScreen(id) { showScreen(id); }

// ---------------- toast ----------------
export function toast(msg, ms = 2000) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('toasts').appendChild(el);
  setTimeout(() => el.remove(), ms);
}

// ---------------- HUD update (called each frame, cheap) ----------------
let lastHud = 0;
export function updateHud(now) {
  if (now - lastHud < 250) return;
  lastHud = now;
  const s = G.state;
  if (!s) return;
  const c = clockOf(s.total);
  $('chip-day').textContent = 'DAY ' + c.day;
  $('chip-clock').textContent = `${String(c.hour).padStart(2, '0')}:${String(c.minute).padStart(2, '0')}`;
  $('chip-stage').textContent = s.pet.evolved ? s.form.toUpperCase() : STAGE_LABEL[s.stage];
  const set = (id, v) => { $(id).textContent = Math.round(v); $(id).parentElement.classList.toggle('low', v < 25); };
  set('pip-meal-v', s.stats.meal);
  set('pip-happy-v', s.stats.happy);
  set('pip-energy-v', s.stats.energy);
  $('badge-fur').classList.toggle('hidden', s.furballs.length === 0);
  $('badge-fur').textContent = s.furballs.length;
  $('badge-sick').classList.toggle('hidden', !s.sick);
  const med = document.getElementById('med-btn');
  if (med) med.classList.toggle('hidden', !(s.sick && G.screen === 'main' && !s.ended));
}

// ---------------- event reactions (visual/audio hooks) ----------------
export function handleEvents() {
  const evs = G.events; G.events = [];
  const s = G.state;
  for (const e of evs) {
    if (e.startsWith('fed:')) {
      G.fx.startEat(G.pet.x, G.pet.y - 10, e.slice(4));
      G.fx.burst(G.pet.x, G.pet.y - 30, 'sparkle', 6);
      const p = s.pet.personality && CFG.PERSONALITIES[s.pet.personality];
      G.fx.emote(G.pet.x, G.pet.y - 40, p ? p.emote : 'cheer', e.slice(4) === 'rawst' ? null : (p ? p.bubble : null));
    } else if (e.startsWith('snack:')) {
      G.fx.startEat(G.pet.x, G.pet.y - 10, e.slice(6));
      G.fx.burst(G.pet.x, G.pet.y - 30, 'sparkle', 6);
    } else if (e === 'pet') {
      G.fx.heart(G.pet.x, G.pet.y - 40);
      const p = s.pet.personality && CFG.PERSONALITIES[s.pet.personality];
      G.fx.emote(G.pet.x, G.pet.y - 40, p ? p.emote : 'cheer', p ? p.bubble : null);
    } else if (e === 'clean') {
      G.fx.burst(G.pet.x, G.pet.y, 'sparkle', 10);
    } else if (e === 'furball') {
      const f = s.furballs[s.furballs.length - 1];
      if (f) G.fx.burst(f.x, f.y, 'smoke', 6, { speed: 40, up: 20 });
      toast('A furball appeared!');
    } else if (e.startsWith('sick:')) {
      G.fx.emote(G.pet.x, G.pet.y - 40, 'worry', 'Ugh…');
      toast(s.pet.name + ' feels sick!');
      G.pet._worryNow = true;
    } else if (e.startsWith('stage:')) {
      toast(s.pet.name + ' grew up!');
      G.fx.burst(G.pet.x, G.pet.y - 40, 'confetti', 16);
    } else if (e.startsWith('evolve:')) {
      startEvolveCinematic(e.slice(8));
    } else if (e === 'sleep' || e === 'rest') {
      toast('zzz…');
    } else if (e === 'woke') {
      toast('Good morning!');
    } else if (e === 'medicine') {
      G.fx.burst(G.pet.x, G.pet.y - 30, 'sparkle', 12);
      toast('All better!');
    } else if (e === 'hatch') {
      if (s.stage !== 'egg' && !s._runtime?.hatchedToast) {
        s._runtime = s._runtime || {};
        s._runtime.hatchedToast = true;
        G.fx.burst(215, 620, 'confetti', 24);
        toast('It’s ' + s.pet.name + '!');
      }
    } else if (e.startsWith('death')) {
      showEnd('death');
    } else if (e === 'rankS' || e.startsWith('graduation')) {
      // graduation handled by state.ended check in loop
    }
  }
}

// ---------------- evolve cinematic ----------------
let evoBusy = false;
export function startEvolveCinematic(form) {
  if (evoBusy) return;
  evoBusy = true;
  setScreen('evo');
  const s = G.state;
  const img = $('evo-img');
  const dex = CFG.DEX.find((d) => d.key === form);
  img.src = A.dex(dex[(s.shiny ? 1 : 0) ? 'shiny' : 'normal']);
  $('evo-name').textContent = dex.name.toUpperCase();
  $('evo-card').classList.add('hidden');
  const flash = $('evo-flash');
  flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
  G.fx.burst(215, 460, 'confetti', 30, { speed: 160 });
  G.fx.burst(215, 460, 'magic', 16);
  setTimeout(() => {
    $('evo-card').classList.remove('hidden');
    $('evo-ok').onclick = () => {
      $('evo-card').classList.add('hidden');
      setScreen('main');
      evoBusy = false;
      G.pet.sync(G.state);
      G.pet.x = 215; G.pet.y = 700; G.pet.state = 'idle';
      G.fx.burst(215, 660, 'confetti', 20);
    };
  }, 900);
}

function showEnd(kind) {
  setScreen('end');
  const s = G.state;
  if (kind === 'death') {
    $('end-title').textContent = 'R.I.P. ' + s.pet.name.toUpperCase();
    $('end-sub').textContent = `Day ${clockOf(s.total).day} · thanks for the memories`;
  } else {
    $('end-title').textContent = 'GRADUATION!';
    $('end-sub').textContent = `${s.pet.name} sets off to chase dreams · Care rank ${careRank(s)}`;
  }
  $('end-new').onclick = () => {
    G.state = startEgg(G.state);
    G.pet.sync(G.state);
    G.pet.x = 215; G.pet.y = 700;
    G.fx = new Fx(G.scene);
    setScreen('egg');
    save(G.state);
  };
}

// ---------------- resize (cover fit) ----------------
function resize() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, CFG.DPR_CAP);
  G.canvas.width = Math.round(vw * dpr);
  G.canvas.height = Math.round(vh * dpr);
  G.scene.setViewport(vw, vh, dpr);
  // rotate hint
  const land = vw > vh;
  $('rotate-hint').classList.toggle('hidden', !land || $('rotate-hint').dataset.dismissed === '1');
}

// ---------------- input ----------------
let downInfo = null;
function canvasPoint(ev) {
  const r = G.canvas.getBoundingClientRect();
  const s = G.scene.s;
  const x = (ev.clientX - r.left - G.scene.offX) / s;
  const y = (ev.clientY - r.top - G.scene.offY) / s;
  return { x, y };
}
function hitPet(p) {
  const m = G.pet.metrics();
  return Math.abs(p.x - G.pet.x) < m.w / 2 + 8 && p.y > G.pet.y - m.h - 10 && p.y < G.pet.y + 12;
}
function hitFurball(p) {
  for (let i = G.state.furballs.length - 1; i >= 0; i--) {
    const f = G.state.furballs[i];
    if (Math.hypot(p.x - f.x, p.y - f.y) < 34) return i;
  }
  return -1;
}

function onDown(ev) {
  if (G.booting) return;
  const p = canvasPoint(ev);
  downInfo = { p, t: performance.now() };
}
function onUp(ev) {
  if (G.booting || !downInfo) return;
  const held = performance.now() - downInfo.t;
  const p = downInfo.p;
  downInfo = null;
  const s = G.state;
  if (!s) return;

  if (G.screen === 'egg') {
    if (Math.hypot(p.x - 215, p.y - 620) < 90) s._runtime.eggWob = 0.35;
    return;
  }
  if (G.screen !== 'main') return;

  if (s.sleeping) { skipSleep(s); G.events.push('woke'); return; }
  const fi = hitFurball(p);
  if (fi >= 0) {
    const f = s.furballs[fi];
    cleanFurball(s, fi, G.events);
    G.fx.burst(f.x, f.y, 'sparkle', 10);
    return;
  }
  if (hitPet(p)) {
    if (held >= 350) { openMenuSheet('profile'); return; }
    if (doPet(s, G.events)) G.fx.heart(G.pet.x, G.pet.y - 40);
    return;
  }
}

// ---------------- sheet system ----------------
export function openSheet(title, bodyHtml) {
  $('sheet-title').textContent = title;
  const body = $('sheet-body');
  body.innerHTML = bodyHtml;
  const sh = $('sheet');
  sh.classList.remove('hidden');
  requestAnimationFrame(() => sh.classList.add('open'));
}
export function closeSheet() {
  const sh = $('sheet');
  sh.classList.remove('open');
  setTimeout(() => sh.classList.add('hidden'), 240);
}

// placeholder menu/profile sheets (fleshed out in M2/M6)
export function openMenuSheet(which) {
  const s = G.state;
  if (which === 'menu') {
    openSheet('MENU', `
      <div class="rowgrid">
        <div class="row" data-go="profile"><img src="../prod/fx/heart_2x.png" alt=""><div class="rmain"><div class="rname">PROFILE</div><div class="rsub">name, personality, care rank</div></div></div>
        <div class="row" data-go="dex"><img src="../prod/items/poke-ball.png" alt=""><div class="rmain"><div class="rname">POKÉDEX</div><div class="rsub">18 Eeveelutions to find</div></div></div>
        <div class="row" data-go="medals"><img src="prod_art/medal_star.png" alt=""><div class="rmain"><div class="rname">MEDALS</div><div class="rsub">your achievements</div></div></div>
        <div class="row" data-go="shop"><img src="../prod/kenney/boardgame-pack/PNG/Chips/chipRedWhite.png" alt=""><div class="rmain"><div class="rname">SHOP</div><div class="rsub">decor, fashion, skies</div></div></div>
        <div class="row" data-go="settings"><img src="../tamagotchi_original/source_lights.png" alt=""><div class="rmain"><div class="rname">SETTINGS</div><div class="rsub">sound, haptics, reset</div></div></div>
      </div>`);
    bindSheetNav();
  } else if (which === 'profile') {
    openSheet('PROFILE', `
      <div class="profile-card">
        <img class="profile-face" src="${A.chibi(s.form, s.shiny)}" alt="">
        <div class="profile-name">${s.pet.name || '???'} <span class="edit" id="rename-btn">edit</span></div>
        <div class="profile-meta">
          <span class="tagchip">${s.pet.personality ? CFG.PERSONALITIES[s.pet.personality].label : '…'}</span>
          <span class="tagchip">${STAGE_LABEL[s.stage]}</span>
          <span class="tagchip rank-${careRank(s)}">RANK ${careRank(s)}</span>
        </div>
        <div class="statbar-row"><label>MEAL</label><div class="statbar"><div class="sb-meal" style="width:${s.stats.meal}%"></div></div></div>
        <div class="statbar-row"><label>HAPPY</label><div class="statbar"><div class="sb-happy" style="width:${s.stats.happy}%"></div></div></div>
        <div class="statbar-row"><label>ENERGY</label><div class="statbar"><div class="sb-energy" style="width:${s.stats.energy}%"></div></div></div>
        <div class="statbar-row"><label>BOND</label><div class="statbar"><div class="sb-aff" style="width:${s.pet.affinity}%"></div></div></div>
      </div>`);
  } else if (which === 'dex') {
    openDexSheet();
  } else if (which === 'medals') {
    openMedalsSheet();
  } else if (which === 'shop') {
    openShopSheet();
  } else if (which === 'settings') {
    openSettingsSheet();
  }
}

export function openMedalsSheet() {
  const s = G.state;
  const n = Object.keys(s.medals).length;
  const coin = '<img class="mcoin" src="prod_art/medal_star.png" alt="">';
  let html = '<div class="medalgrid">';
  for (const m of CFG.MEDALS) {
    const got = !!s.medals[m.key];
    html += `<div class="medal ${got ? 'got' : 'lock'}">
      <img src="prod_art/medal_star.png" alt="" class="${got ? '' : 'lockimg'}">
      <div class="mmain"><div class="mname">${m.name}</div><div class="mdesc">${m.desc}</div></div>
    </div>`;
  }
  html += '</div>';
  openSheet(`MEDALS ${n}/${CFG.MEDALS.length}`, html);
}

export function openShopSheet() {
  const s = G.state;
  const coin = '<img class="scoin" src="../prod/kenney/boardgame-pack/PNG/Chips/chipRedWhite.png" alt="">';
  const cell = (it, group) => {
    const owned = s.shop.owned.includes(it.key);
    const afford = s.day.coins >= it.price;
    return `<div class="shopcell ${owned ? 'owned' : ''} ${afford || owned ? '' : 'poor'}" data-shop="${it.key}">
      <img src="${shopArt(it)}" data-fallback="prod_art/item_crate.png" onerror="this.onerror=null;this.src=this.dataset.fallback" alt="">
      <div class="sname">${it.name}</div>
      <div class="sprice">${owned ? '<span class="sold">OWNED</span>' : coin + '<b>' + it.price + '</b>'}</div>
    </div>`;
  };
  let html = `<div class="coinline">${coin}<b id="shop-coins">${s.day.coins}</b><span>coins</span></div>
    <div class="sheet-sec">DECOR</div><div class="shopgrid">${CFG.SHOP.decor.map((i) => cell(i, 'decor')).join('')}</div>
    <div class="sheet-sec">FASHION</div><div class="shopgrid">${CFG.SHOP.fashion.map((i) => cell(i, 'fashion')).join('')}</div>
    <div class="sheet-sec">SKIES</div><div class="shopgrid">${CFG.SHOP.themes.map((i) => cell(i, 'themes')).join('')}</div>`;
  openSheet('SHOP', html);
  document.querySelectorAll('#sheet-body [data-shop]').forEach((el) => {
    el.onclick = () => {
      if (buyShop(G.state, el.dataset.shop, G.events)) {
        G.fx.burst(215, 700, 'sparkle', 14);
        toast('Purchased ' + shopItemName(el.dataset.shop) + '!');
        openShopSheet(); // refresh
      } else {
        toast('Not enough coins');
      }
    };
  });
}
function shopArt(it) {
  switch (it.key) {
    case 'bed': return A.fx(it.art); // petbed.png lives under fx/
    case 'bow': case 'scarf': case 'leaflow': case 'star': case 'bush': return A.fashion(it.art);
    default: return A.scene(it.art); // snowman, mushroom, flowers, tree2, night, sunset
  }
}
function shopItemName(key) {
  for (const g of Object.keys(CFG.SHOP)) { const it = CFG.SHOP[g].find((i) => i.key === key); if (it) return it.name; }
  return key;
}

export function openSettingsSheet() {
  const s = G.state;
  const on = (b) => `<div class="stoggle ${b ? 'on' : ''}" data-sett="sound">${b ? 'ON' : 'OFF'}</div>`;
  const onh = (b) => `<div class="stoggle ${b ? 'on' : ''}" data-sett="haptics">${b ? 'ON' : 'OFF'}</div>`;
  let html = `
    <div class="setrow"><div class="rmain"><div class="rname">SOUND</div><div class="rsub">music &amp; sfx</div></div>${on(s.settings.sound)}</div>
    <div class="setrow"><div class="rmain"><div class="rname">HAPTICS</div><div class="rsub">vibration on touch</div></div>${onh(s.settings.haptics)}</div>
    <div class="setrow danger"><div class="rmain"><div class="rname">RESET SAVE</div><div class="rsub">start a new egg (unlocks nothing)</div></div><button class="btn-danger" id="reset-btn">RESET</button></div>`;
  openSheet('SETTINGS', html);
  document.querySelectorAll('#sheet-body [data-sett]').forEach((el) => {
    el.onclick = () => {
      const k = el.dataset.sett;
      s.settings[k] = !s.settings[k];
      el.classList.toggle('on', s.settings[k]);
      el.textContent = s.settings[k] ? 'ON' : 'OFF';
      save(G.state);
    };
  });
  const rb = document.getElementById('reset-btn');
  if (rb) rb.onclick = () => {
    if (confirm('Reset your save and start a new egg?')) { clearSave(); location.reload(); }
  };
}

export function openDexSheet() {
  const s = G.state;
  let html = '<div class="dexgrid">';
  for (const d of CFG.DEX) {
    const has = !!s.dex[d.key + 'n'];
    const sh = !!s.dex[d.key + 's'];
    html += `<div class="dexcell ${has ? '' : 'locked'}" data-dex="${d.key}">
      ${sh ? '<div class="dshiny"></div>' : ''}
      <img src="${A.dex(has ? (sh && s.shiny ? d.shiny : d.normal) : d.normal)}" alt="">
      <div class="dnum">#${d.id}</div>
      <div class="dname">${has ? d.name : '???'}</div>
    </div>`;
  }
  html += '</div>';
  openSheet('POKÉDEX ' + dexCount(s) + '/18', html);
}
function dexCount(s) { let n = 0; for (const d of CFG.DEX) if (s.dex[d.key + 'n']) n++; return n; }

function bindSheetNav() {
  document.querySelectorAll('#sheet-body [data-go]').forEach((el) => {
    el.onclick = () => openMenuSheet(el.dataset.go);
  });
}

// ---------------- dock wiring ----------------
function wireDock() {
  $('dock-feed').onclick = () => openFoodSheet();
  $('dock-play').onclick = () => openPlaySheet();
  $('dock-pet').onclick = () => { if (doPet(G.state, G.events)) G.fx.heart(G.pet.x, G.pet.y - 40); };
  $('dock-clean').onclick = () => {
    let n = 0;
    while (G.state.furballs.length && cleanFurball(G.state, 0, G.events)) { n++; }
    if (n) G.fx.burst(G.pet.x, G.pet.y, 'sparkle', 12);
  };
  $('dock-menu').onclick = () => openMenuSheet('menu');
  $('med-btn').onclick = () => { if (G.state && G.state.sick) giveMedicine(G.state, G.events); };
  $('sheet-close').onclick = closeSheet;
  $('btn-hatch').onclick = newGame;
  $('btn-continue').onclick = () => resumeGame();
  $('rotate-tap').onclick = () => { $('rotate-hint').dataset.dismissed = '1'; $('rotate-hint').classList.add('hidden'); };
}

export function openFoodSheet() {
  const s = G.state;
  const p = s.pet.personality ? CFG.PERSONALITIES[s.pet.personality] : null;
  const cell = (f, kind) => {
    const fav = p && ((kind === 'meal' && p.meal === f.key) || (kind === 'snack' && p.snack === f.key));
    const tag = f.tag ? `<span class="ctag">${f.tag}</span>` : '';
    return `<div class="cell" data-food="${kind}:${f.key}">
      ${fav ? '<div class="fav"></div>' : ''}
      <img src="${A.items(f.art)}" alt="">
      <div class="cname">${f.name}</div>${tag}
    </div>`;
  };
  openSheet('FEED ' + (s.pet.name || 'EEVEE'),
    `<div class="sheet-sec">MEALS</div><div class="cellgrid">${CFG.FOOD.meals.map((f) => cell(f, 'meal')).join('')}</div>
     <div class="sheet-sec">SNACKS</div><div class="cellgrid">${CFG.FOOD.snacks.map((f) => cell(f, 'snack')).join('')}</div>`);
  document.querySelectorAll('#sheet-body [data-food]').forEach((el) => {
    el.onclick = () => {
      const [kind, key] = el.dataset.food.split(':');
      if (kind === 'meal') feedMeal(G.state, key, G.events);
      else feedSnack(G.state, key, G.events);
      closeSheet();
    };
  });
}

export function openPlaySheet() {
  const s = G.state;
  openSheet('PLAY · POKÉ CASINO', `
    <div class="rowgrid">
      <div class="row" data-casino="slots"><img src="../prod/items/poke-ball.png" alt=""><div class="rmain"><div class="rname">EEVEE SLOTS</div><div class="rsub">hit 777 for the jackpot</div></div><div class="rcta">1 COIN</div></div>
      <div class="row" data-casino="roulette"><img src="../prod/items/great-ball.png" alt=""><div class="rmain"><div class="rname">ROULETTE</div><div class="rsub">guess the Eeveelution</div></div><div class="rcta">1 COIN</div></div>
      <div class="row" data-casino="cards"><img src="../prod/items/ultra-ball.png" alt=""><div class="rmain"><div class="rname">CARD FLIP</div><div class="rsub">highest card wins ×4</div></div><div class="rcta">1 COIN</div></div>
    </div>`);
  document.querySelectorAll('#sheet-body [data-casino]').forEach((el) => {
    el.onclick = () => { closeSheet(); G.casino && G.casino.open(el.dataset.casino); };
  });
}

// ---------------- game flow ----------------
function newGame() {
  G.state = startEgg(freshState());
  G.pet.sync(G.state);
  G.pet.x = 215; G.pet.y = 700;
  G.fx = new Fx(G.scene);
  setScreen('egg');
  save(G.state);
}
function resumeGame() {
  const saved = load();
  if (!saved) { newGame(); return; }
  G.state = saved;
  G.state.screen = 'main';
  G.pet.sync(G.state);
  G.fx = new Fx(G.scene);
  setScreen(G.state.ended ? 'main' : 'main');
  if (G.state._runtime === undefined) G.state._runtime = {};
  save(G.state);
}

// ---------------- main loop ----------------
function loop(t) {
  const dt = Math.min(0.05, (t - (G.lastT || t)) / 1000);
  G.lastT = t;
  // fps meter
  G.frameTimes.push(t);
  while (G.frameTimes.length && G.frameTimes[0] < t - 2000) G.frameTimes.shift();

  const s = G.state;
  if (s && !G.booting) {
    const medalKeysBefore = new Set(Object.keys(s.medals));
    tick(s, dt, G.events);
    if (G.screen !== 'title') {
      checkMedals(s, G.events);
      for (const k of Object.keys(s.medals)) {
        if (!medalKeysBefore.has(k)) {
          const m = CFG.MEDALS.find((mm) => mm.key === k);
          toast('MEDAL · ' + (m ? m.name : k));
          if (G.pet) G.fx.burst(G.pet.x, G.pet.y - 60, 'sparkle', 14);
        }
      }
    }
    G.pet.sync(s);
    G.pet.update(dt, s);
    G.fx.update(dt, G.pet, s);

    // sick worry emote
    if (G.pet._worryNow) { G.pet._worryNow = false; G.fx.emote(G.pet.x, G.pet.y - 40, 'worry', null); }
    // ghost Eevee monthly event (night, even month 15th) — M6
    // ended check
    if (s.ended && G.screen === 'main') showEnd(s.ended);
    // egg hatched → main screen
    if (s.stage !== 'egg' && G.screen === 'egg') setScreen('main');
    if (s._pendingEvolve && !s._evolving) {
      s._evolving = true;
      G.events.push('evolve:' + s._pendingEvolve);
    }
    // autosave
    G.autosaveT += dt;
    if (G.autosaveT > 5) { G.autosaveT = 0; save(s); }
    if (G.screen === 'main' || G.screen === 'casino' || G.screen === 'egg') updateHud(t);
    handleEvents();
  }

  // render
  if (G.ctx && G.scene) {
    G.scene.begin(G.ctx);
    G.scene.render(G.ctx, s || freshState(), G.pet, G.fx, dt);
    if (G.casino && G.screen === 'casino' && G.casino.visible) G.casino.draw(G.ctx, dt);
  }
  requestAnimationFrame(loop);
}

// ---------------- boot ----------------
async function boot() {
  G.canvas = $('game');
  G.ctx = G.canvas.getContext('2d');
  G.img = new ImageBank();
  G.scene = new Scene(G.img);
  G.fx = new Fx(G.scene);
  G.pet = new Pet(G.img);
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));

  const manifest = buildManifest();
  const t0 = performance.now();
  await preload(manifest, G.img, (k) => {
    $('loadfill').style.width = (k * 100).toFixed(1) + '%';
    $('loadlabel').textContent = k > 0.5 ? 'MEETING YOUR EEVEE…' : 'GATHERING THE MEADOW…';
  });
  if (G.img.missing.length) console.warn('missing assets:', G.img.missing);

  wireDock();

  // save?
  G.hasSave = !!load();
  if (G.hasSave) $('btn-continue').classList.remove('hidden');
  G.state = freshState(); // backdrop state (title screen meadow, no pet)
  G.state.screen = 'title';
  setScreen('title');

  G.booting = false;
  $('loading').classList.add('hidden');
  attachDev(G);
  requestAnimationFrame(loop);
  console.log(`Eevee-Tama ready in ${((performance.now() - t0) / 1000).toFixed(1)}s, ${G.img.map.size} images, missing: ${G.img.missing.length}`);

  // pagehide save
  window.addEventListener('pagehide', () => { if (G.state && G.state.screen !== 'title') save(G.state); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.state && G.state.screen !== 'title') save(G.state); });
  G.canvas.addEventListener('pointerdown', onDown);
  G.canvas.addEventListener('pointerup', onUp);
  window.__G = G; // debug hook
}

boot().catch((e) => {
  console.error(e);
  $('loadlabel').textContent = 'LOAD ERROR — CHECK CONSOLE';
});
