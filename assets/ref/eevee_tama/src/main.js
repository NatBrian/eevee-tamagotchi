// main.js — boot, asset preload, rAF loop, input, screen routing
import { CFG, A, STAGE_LABEL } from './config.js';
import {
  freshState, startEgg, tick, doPet, cleanFurball, feedMeal, feedSnack,
  giveStone, skipSleep, careRank, clockOf, checkMedals, buyShop, giveMedicine,
  buyStone, useStone, giveBall, catchGhost, dailyEventDay, isNight, applyOffline,
} from './state.js';
import { Scene, Fx } from './scene.js';
import { Pet } from './pet.js';
import { load, save, clearSave } from './save.js';
import { attachDev } from './dev.js';
import { Casino } from './casino.js';
import { AudioSys } from './audio.js';

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
  m.push({ key: 'card_back', src: A.cardsTint('cardBack.png') });
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
  document.body.classList.toggle('in-casino', id === 'casino');
}
export function setScreen(id) {
  showScreen(id);
  // force HUD refresh on screen transitions (updateHud is throttled 4Hz)
  lastHud = 0;
  if (G.state) updateHud(performance.now());
}

// ---------------- toast ----------------
export function toast(msg, ms = 2000) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('toasts').appendChild(el);
  setTimeout(() => el.remove(), ms);
}

// ---------------- first-run context tips (M9) ----------------
// Shown once per tip id; state.tips is persisted in the save.
export function tipToast(text, ms = 3200) {
  const el = document.createElement('div');
  el.className = 'toast tip';
  el.innerHTML = '<b>TIP</b><span></span>';
  el.querySelector('span').textContent = text;
  $('toasts').appendChild(el);
  setTimeout(() => el.remove(), ms);
}
function tip(s, id, text) {
  if (!s || s.ended) return;
  if (!Array.isArray(s.tips)) s.tips = [];
  if (s.tips.includes(id)) return;
  s.tips.push(id);
  tipToast(text);
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
    if (G.audio) G.audio.event(e); // M7: every game event has audio + haptic feedback
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
      tip(s, 'furball', 'Tap furballs to clean them up!');
    } else if (e.startsWith('sick:')) {
      G.fx.emote(G.pet.x, G.pet.y - 40, 'worry', 'Ugh…');
      toast(s.pet.name + ' feels sick!');
      tip(s, 'sick', 'Sick? Tap the MEDICINE bottle!');
      G.pet._worryNow = true;
    } else if (e.startsWith('stage:')) {
      toast(s.pet.name + ' grew up!');
      G.fx.burst(G.pet.x, G.pet.y - 40, 'confetti', 16);
      if (e === 'stage:adult') tip(s, 'adult', 'Adult! Try evolving — MENU → EVOLVE');
    } else if (e.startsWith('evolve:')) {
      startEvolveCinematic(e.slice(7));
    } else if (e === 'sleep' || e === 'rest') {
      toast('zzz…');
      if (e === 'sleep') tip(s, 'sleep', `Tap ${s.pet.name} to wake them early!`);
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
        tip(s, 'hatch', `Tap FEED to keep ${s.pet.name} full!`);
      }
    } else if (e.startsWith('death')) {
      showEnd('death');
    } else if (e === 'rankS' || e.startsWith('graduation')) {
      // graduation handled by state.ended check in loop
    } else if (e === 'game:win') {
      if (G.screen === 'casino' && G.pet) {
        G.fx.emote(G.pet.x, G.pet.y - 46, 'cheer', null);
        G.fx.burst(G.pet.x, G.pet.y - 20, 'sparkle', 10);
      }
    } else if (e === 'game:lose') {
      if (G.screen === 'casino' && G.pet) G.fx.emote(G.pet.x, G.pet.y - 46, 'worry', null);
    } else if (e === 'cas:jackpot') {
      if (G.screen === 'casino' && G.pet) {
        G.fx.burst(G.pet.x, G.pet.y - 40, 'confetti', 20, { speed: 140 });
        toast('JACKPOT! +FREE SPIN');
      }
    } else if (e === 'cas:push') {
      if (G.screen === 'casino' && G.pet) G.fx.emote(G.pet.x, G.pet.y - 46, 'chat', null);
    } else if (e === 'ghost:in') {
      toast('A ghost Eevee drifts by… TAP IT!');
    } else if (e === 'ghost:out') {
      toast('The ghost Eevee slipped away…');
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
  $('evo-shiny').classList.toggle('hidden', !s.shiny);
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
  if (G.screen === 'casino') {
    if (G.casino) G.casino.onTap(p.x, p.y);
    return;
  }
  if (G.screen !== 'main') return;

  if (s.sleeping) { skipSleep(s); G.events.push('woke'); return; }
  // ghost Eevee (M6): tap to catch
  const gh = s._runtime && s._runtime.ghost;
  if (gh && !gh.done && !s.ended) {
    const gy = 545;
    if (Math.abs(p.x - gh.x) < 52 && Math.abs(p.y - (gy - 30)) < 58) {
      if (catchGhost(s, G.events)) {
        G.fx.burst(gh.x, gy - 34, 'magic', 16, { speed: 80 });
        toast('GHOST EEVEE! +5 COINS');
      }
      return;
    }
  }
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
  if (G.audio) G.audio.event('sheet:open');
}
export function closeSheet() {
  const sh = $('sheet');
  sh.classList.remove('open');
  setTimeout(() => sh.classList.add('hidden'), 240);
  if (G.audio) G.audio.event('sheet:close');
}

// placeholder menu/profile sheets (fleshed out in M2/M6)
export function openMenuSheet(which) {
  const s = G.state;
  if (which === 'menu') {
    openSheet('MENU', `
      <div class="rowgrid">
        <div class="row" data-go="profile"><img src="../prod/fx/heart_2x.png" alt=""><div class="rmain"><div class="rname">PROFILE</div><div class="rsub">name, personality, care rank</div></div></div>
        <div class="row" data-go="dex"><img src="../prod/items/poke-ball.png" alt=""><div class="rmain"><div class="rname">POKÉDEX</div><div class="rsub">18 Eeveelutions to find</div></div></div>
        <div class="row" data-go="evolve"><img src="../prod/stones/water_stone.png" alt=""><div class="rmain"><div class="rname">EVOLVE</div><div class="rsub">stones · day/night windows</div></div></div>
        <div class="row" data-go="medals"><img src="prod_art/medal_star.png" alt=""><div class="rmain"><div class="rname">MEDALS</div><div class="rsub">your achievements</div></div></div>
        <div class="row" data-go="shop"><img src="../prod/kenney/boardgame-pack/PNG/Chips/chipRedWhite.png" alt=""><div class="rmain"><div class="rname">SHOP</div><div class="rsub">decor, fashion, skies</div></div></div>
        <div class="row" data-go="settings"><img src="../tamagotchi_original/source_lights.png" alt=""><div class="rmain"><div class="rname">SETTINGS</div><div class="rsub">sound, haptics, reset</div></div></div>
      </div>`);
    bindSheetNav();
  } else if (which === 'profile') {
    const esc = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    openSheet('PROFILE', `
      <div class="profile-card">
        <img class="profile-face" src="${A.cafe('eevee_full.webp')}" alt="">
        <div class="profile-name">${esc(s.pet.name || '???')} <span class="edit" id="rename-btn">edit</span></div>
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
    const rb = $('rename-btn');
    rb.onclick = () => {
      rb.parentElement.innerHTML =
        '<div class="rename-row"><input id="rename-input" class="pxinput" maxlength="12" value="' + esc(s.pet.name || '') + '">' +
        '<button class="btn-pixel" id="rename-save">SAVE</button></div>';
      const inp = $('rename-input');
      const doSave = () => {
        const v = inp.value.trim();
        if (v) { s.pet.name = v; save(s); }
        openMenuSheet('profile');
      };
      $('rename-save').onclick = doSave;
      inp.onkeydown = (e) => { if (e.key === 'Enter') doSave(); };
      setTimeout(() => inp.focus(), 60);
    };
  } else if (which === 'dex') {
    openDexSheet();
  } else if (which === 'evolve') {
    openEvolveSheet();
  } else if (which === 'medals') {
    openMedalsSheet();
  } else if (which === 'shop') {
    openShopSheet();
  } else if (which === 'settings') {
    openSettingsSheet();
  }
}

export function openEvolveSheet() {
  const s = G.state;
  const aff = Math.round(s.pet.affinity);
  const evolved = s.pet.evolved;
  const coin = '<img src="../prod/kenney/boardgame-pack/PNG/Chips/chipRedWhite.png" alt="">';
  let html = `<div class="affchip"><img src="../prod/fx/heart_2x.png" alt="">AFFINITY<b>${aff}/100</b></div>`;
  if (evolved) {
    const dex = CFG.DEX.find((d) => d.key === s.form);
    html += `<div class="evolved-note">${dex ? dex.name : s.form} — fully evolved this life</div>`;
  }
  html += '<div class="sheet-sec">EVOLUTION STONES</div><div class="shopgrid">';
  for (const st of CFG.SHOP_STONES) {
    const owned = s.shop.stones.includes(st.key);
    const afford = s.day.coins >= st.price;
    html += `<div class="shopcell ${owned ? 'owned' : ''} ${!owned && !afford ? 'poor' : ''}" data-stone="${st.key}">
      <img src="${A.stones(CFG.STONE_ART[st.key])}" alt="">
      <div class="sname">${st.name}</div>
      <div class="sprice">${owned ? '<span class="sold use">USE</span>' : coin + '<b>' + st.price + '</b>'}</div>
    </div>`;
  }
  html += '</div>';
  if (!evolved) {
    html += `
      <div class="sheet-sec">TIME WINDOWS</div>
      <div class="winrow"><div class="rmain"><div class="rname">ESPEON</div><div class="rsub">snack 07:00–12:00 · affinity ≥ 70</div></div></div>
      <div class="winrow"><div class="rmain"><div class="rname">UMBREON</div><div class="rsub">snack 18:00–20:00 · affinity ≥ 70</div></div></div>
      <div class="winrow"><div class="rmain"><div class="rname">SYLVEON</div><div class="rsub">day 3 · 22:00 · affinity ≥ 80 (auto)</div></div></div>`;
  }
  openSheet('EVOLVE', html);
  document.querySelectorAll('#sheet-body [data-stone]').forEach((el) => {
    el.onclick = () => {
      const k = el.dataset.stone;
      const s = G.state;
      if (s.shop.stones.includes(k)) {
        if (useStone(s, k, G.events)) { closeSheet(); toast('Evolution begins!'); }
        else if (s.stage !== 'adult') toast('Eevee must reach ADULT stage!');
        else toast('Already evolved this life!');
      } else if (buyStone(s, k, G.events)) {
        toast('Bought ' + stoneName(k) + '!');
        G.fx.burst(215, 700, 'sparkle', 10);
        openEvolveSheet();
      } else {
        toast('Not enough coins');
      }
    };
  });
}
function stoneName(key) {
  const it = CFG.SHOP_STONES.find((i) => i.key === key);
  return it ? it.name : key;
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
  const sale = dailyEventDay(s).sale;
  const coin = '<img class="scoin" src="../prod/kenney/boardgame-pack/PNG/Chips/chipRedWhite.png" alt="">';
  const cell = (it, group) => {
    const owned = s.shop.owned.includes(it.key);
    const price = sale ? Math.ceil(it.price / 2) : it.price;
    const afford = s.day.coins >= price;
    return `<div class="shopcell ${owned ? 'owned' : ''} ${afford || owned ? '' : 'poor'}" data-shop="${it.key}">
      <img src="${shopArt(it)}" data-fallback="prod_art/item_crate.png" onerror="this.onerror=null;this.src=this.dataset.fallback" alt="">
      <div class="sname">${it.name}</div>
      <div class="sprice">${owned ? '<span class="sold">OWNED</span>' : coin + (sale ? '<s>' + it.price + '</s> ' : '') + '<b>' + price + '</b>' + (sale ? ' <span class="salebadge">SALE</span>' : '')}</div>
    </div>`;
  };
  let html = (sale ? '<div class="sale-banner">★ SALE · 50% OFF TODAY ★</div>' : '') +
    `<div class="coinline">${coin}<b id="shop-coins">${Math.round(s.day.coins)}</b><span>coins</span></div>
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
  const installRow = G.deferredInstall
    ? `<div class="setrow"><div class="rmain"><div class="rname">INSTALL APP</div><div class="rsub">add to your home screen</div></div><button class="btn-pixel" id="install-btn">INSTALL</button></div>`
    : `<div class="setrow"><div class="rmain"><div class="rname">INSTALL APP</div><div class="rsub">iOS: Share → “Add to Home Screen”</div></div></div>`;
  let html = `
    <div class="setrow"><div class="rmain"><div class="rname">SOUND</div><div class="rsub">music &amp; sfx</div></div>${on(s.settings.sound)}</div>
    <div class="setrow"><div class="rmain"><div class="rname">HAPTICS</div><div class="rsub">vibration on touch</div></div>${onh(s.settings.haptics)}</div>
    ${installRow}
    <div class="setrow"><div class="rmain"><div class="rname">ABOUT</div><div class="rsub">Eevee-Tama v1.0 · CC0 audio &amp; fonts (Kenney)</div></div></div>
    <div class="setrow danger"><div class="rmain"><div class="rname">RESET SAVE</div><div class="rsub">start a new egg (unlocks nothing)</div></div><button class="btn-danger" id="reset-btn">RESET</button></div>`;
  openSheet('SETTINGS', html);
  document.querySelectorAll('#sheet-body [data-sett]').forEach((el) => {
    el.onclick = () => {
      const k = el.dataset.sett;
      s.settings[k] = !s.settings[k];
      el.classList.toggle('on', s.settings[k]);
      el.textContent = s.settings[k] ? 'ON' : 'OFF';
      save(G.state);
      G.audio.event('toggle');
      if (k === 'sound') G.audio.setSound(s.settings.sound);
      else if (s.settings.haptics) G.audio.thump(20); // test buzz
    };
  });
  const ib = document.getElementById('install-btn');
  if (ib) ib.onclick = () => {
    if (G.deferredInstall) { G.deferredInstall.prompt(); G.deferredInstall = null; }
  };
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
  // casino
  const cas = G.casino;
  if (cas) {
    $('casino-back').onclick = () => cas.close();
    document.querySelectorAll('#casino-tabs .ctab').forEach((el) => { el.onclick = () => cas.switchGame(el.dataset.game); });
    document.querySelectorAll('#casino-bet .betbtn').forEach((el) => { el.onclick = () => cas.setBet(Number(el.dataset.bet)); });
    document.querySelectorAll('#casino-roulette-bet .rtab').forEach((el) => { el.onclick = () => cas.toggleRtBet(el.dataset.rt); });
    $('casino-spin').onclick = () => cas.spin();
  }
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
      <div class="row" data-ball="1"><img src="../prod/items/poke-ball.png" alt=""><div class="rmain"><div class="rname">GIVE BALL</div><div class="rsub">throw a ball to play · +Happy</div></div><div class="rcta">FREE</div></div>
    </div>`);
  document.querySelectorAll('#sheet-body [data-casino]').forEach((el) => {
    el.onclick = () => {
      closeSheet();
      if (G.casino) { tip(G.state, 'casino', 'Spend coins at the POKÉ CASINO!'); G.casino.open(el.dataset.casino); }
    };
  });
  document.querySelectorAll('#sheet-body [data-ball]').forEach((el) => {
    el.onclick = () => {
      closeSheet();
      if (G.pet && giveBall(G.state, G.events)) {
        G.fx.ball(G.pet.x, G.pet.y - 6);
        G.fx.emote(G.pet.x, G.pet.y - 46, 'cheer', null);
      }
    };
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
  if (G.state._runtime === undefined) G.state._runtime = {};
  // M8: offline catch-up — elapsed real s × 2 game-min, cap 72 game-hrs, meters floor 10.
  // Scratch event array: the S_AWAY report tells the story (no toast/FX spam on resume).
  let report = null;
  const elapsed = Math.max(0, (Date.now() - (saved.savedAt || Date.now())) / 1000);
  if (elapsed >= 60) report = applyOffline(G.state, elapsed, []);
  G.pet.sync(G.state);
  G.fx = new Fx(G.scene);
  G.state.screen = G.state.stage === 'egg' && !G.state.ended ? 'egg' : 'main';
  setScreen(G.state.screen);
  save(G.state);
  if (report) showAway(report);
}

// S_AWAY — "While You Were Away" report
export function showAway(report) {
  const list = $('away-list');
  list.innerHTML = '';
  const items = (report.items && report.items.length)
    ? report.items
    : [{ text: 'Nothing much happened — ' + (G.state.pet.name || 'your pet') + ' is glad you’re back!' }];
  for (const it of items) {
    const li = document.createElement('li');
    li.textContent = it.text;
    list.appendChild(li);
  }
  const c = clockOf(G.state.total);
  const hrs = Math.floor(report.mins / 60), mns = Math.round(report.mins % 60);
  const away = hrs ? `${hrs}h ${mns}m` : `${mns}m`;
  $('away-now').textContent =
    `Away ${away} game-time · Now Day ${c.day} ${String(c.hour).padStart(2, '0')}:${String(c.minute).padStart(2, '0')}`;
  $('away-ok').onclick = () => setScreen(G.state.stage === 'egg' ? 'egg' : 'main');
  setScreen('away');
  if (G.audio) G.audio.event('sheet:open');
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
          if (G.audio) G.audio.event('medal');
        }
      }
    }
    // audio: BGM mood (title/sleep/casino ducking) + day/night track (M7)
    if (G.audio && s.shop) {
      const mood = G.screen === 'title' ? 0.55 : s.sleeping ? 0.35 : G.screen === 'casino' ? 0.6 : 1;
      if (Math.abs(mood - (G._bgmMood || 0)) > 0.01) { G._bgmMood = mood; G.audio.setMood(mood); }
      const tk = isNight(s.total, s.shop.theme) ? 'night' : 'day';
      if (tk !== G._bgmTrack) { G._bgmTrack = tk; G.audio.setTrack(tk); }
    }
    G.pet.sync(s);
    G.pet.update(dt, s);
    G.fx.update(dt, G.pet, s);
    // casino: advance board + pet takes a spot at the machine
    if (G.casino) G.casino.update(dt);
    if (G.casino && G.casino.visible && s.stage !== 'egg' && !s.ended) {
      const px = CFG.CASINO.petSpot.x, py = CFG.CASINO.petSpot.y;
      const dx = px - G.pet.x, dy = py - G.pet.y;
      const d = Math.hypot(dx, dy);
      if (d > 4) {
        const sp = 130 * dt;
        G.pet.x += dx / d * Math.min(sp, d);
        G.pet.y += dy / d * Math.min(sp, d);
        G.pet.dir = G.pet.dirFrom(dx, dy);
        G.pet.state = 'move';
      } else { G.pet.state = 'idle'; G.pet.frame = 0; }
    }

    // sick worry emote
    if (G.pet._worryNow) { G.pet._worryNow = false; G.fx.emote(G.pet.x, G.pet.y - 40, 'worry', null); }
    // idle chatter — occasional personality emote bubble while the pet idles
    if (s.stage !== 'egg' && !s.ended && !s.sleeping && !s.sick && G.pet.state === 'idle' && (G.screen === 'main' || G.screen === 'casino')) {
      G._chatterT = (G._chatterT === undefined ? 15 + Math.random() * 15 : G._chatterT - dt);
      if (G._chatterT <= 0) {
        G._chatterT = 22 + Math.random() * 24;
        const per = CFG.PERSONALITIES[s.pet.personality];
        if (per) G.fx.emote(G.pet.x, G.pet.y - 40, per.emote, per.bubble);
      }
    } else {
      G._chatterT = 15 + Math.random() * 15;
    }
    // ghost Eevee monthly event (night, even month 15th) — M6
    // ended check
    if (s.ended && G.screen === 'main') showEnd(s.ended);
    // egg hatched → main screen
    if (s.stage !== 'egg' && G.screen === 'egg') setScreen('main');
    // autosave — never save the title backdrop (would clobber a real save)
    G.autosaveT += dt;
    if (G.autosaveT > 5) { G.autosaveT = 0; if (G.screen !== 'title' && G.screen !== 'loading') save(s); }
    if (G.screen === 'main' || G.screen === 'casino' || G.screen === 'egg') updateHud(t);
    handleEvents();
  }

  // render
  if (G.ctx && G.scene) {
    G.scene.begin(G.ctx);
    G.scene.render(G.ctx, s || freshState(), G.pet, G.fx, dt);
    // ghost Eevee (M6): spectral visitor drifting across the meadow
    if (s && !s.ended && G.screen !== 'casino') {
      const g = s._runtime && s._runtime.ghost;
      if (g && !g.done) {
        const gIm = G.img.get('ghost_eevee');
        if (gIm) {
          const gy = 545 + Math.sin(g.t * 2.2) * 9;
          G.ctx.globalAlpha = 0.95;
          G.ctx.drawImage(gIm, Math.round(g.x - 36), Math.round(gy - 78), 72, 66);
          G.ctx.globalAlpha = 1;
        }
      }
    }
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
  G.pet.fx = G.fx; // chibi walk foot-dust bursts
  G.casino = new Casino(G);
  G.audio = new AudioSys(G);
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
  else $('title-hint').textContent = 'a new egg is waiting — tap to hatch'; // M9: first-run hint
  G.state = freshState(); // backdrop state (title screen meadow, no pet)
  G.state.screen = 'title';
  setScreen('title');

  G.booting = false;
  $('loading').classList.add('hidden');
  attachDev(G);
  requestAnimationFrame(loop);
  console.log(`Eevee-Tama ready in ${((performance.now() - t0) / 1000).toFixed(1)}s, ${G.img.map.size} images, missing: ${G.img.missing.length}`);

  // pagehide / hidden save (skip the title backdrop)
  window.addEventListener('pagehide', () => { if (G.state && G.screen !== 'title' && G.screen !== 'loading') save(G.state); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.state && G.screen !== 'title' && G.screen !== 'loading') save(G.state); });

  // M8: PWA — service worker (offline shell) + install prompt
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('../sw.js').catch(() => {});
    });
  }
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); G.deferredInstall = e; });
  window.addEventListener('appinstalled', () => { G.deferredInstall = null; });
  G.canvas.addEventListener('pointerdown', onDown);
  G.canvas.addEventListener('pointerup', onUp);
  // M7: audio unlock (iOS autoplay) + universal tap feedback (sfx + light haptic)
  window.addEventListener('pointerdown', () => { G.audio.unlock(); }, { capture: true, passive: true });
  window.addEventListener('pointerdown', (e) => {
    if (!G.audio.ctx) return;
    const t = e.target && e.target.closest ? e.target.closest('button, .cell, .row, .shopcell, .rtab, .dexcell, .stoggle, .ctab, .betbtn') : null;
    if (t) G.audio.event('tap');
    else if (e.target === G.canvas) G.audio.sfx('tapSoft', { vol: 0.22 });
  }, { capture: true, passive: true });
  window.__G = G; // debug hook
  window.__CFG = CFG; // debug/test data hook (M9 scenario suite)
}

boot().catch((e) => {
  console.error(e);
  $('loadlabel').textContent = 'LOAD ERROR — CHECK CONSOLE';
});
