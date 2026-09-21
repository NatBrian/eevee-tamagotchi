// state.js — game state machine + tick pipeline (BUILD_PLAN §1, §7)
import { CFG, A } from './config.js';
import { rng } from './prng.js';

// ---------- helpers ----------
export const MIN_PER_DAY = 1440;
export function clockOf(total) {
  const m = ((420 + total) % 1440 + 1440) % 1440; // 420 = 07:00
  return { hour: Math.floor(m / 60), minute: Math.floor(m % 60), day: Math.floor(total / 1440) + 1 };
}
export function absTime(total) { return (420 + total) % 1440; } // minutes since midnight
export function timeLabel(total) {
  const c = clockOf(total);
  return `${String(c.hour).padStart(2, '0')}:${String(c.minute).padStart(2, '0')}`;
}
export function stageOf(total) {
  if (total < CFG.TIME.eggEnd) return 'egg';
  if (total < CFG.TIME.babyEnd) return 'baby';
  if (total < CFG.TIME.childEnd) return 'child';
  return 'adult';
}
export function skyVariantOf(total, theme) {
  if (theme && theme !== 'day') return theme; // shop theme override
  const h = absTime(total) / 60;
  if (h >= 7 && h < 17) return 'day';
  if (h >= 17 && h < 19.5) return 'sunset';
  return 'night';
}
export function isNight(total, theme) {
  const v = skyVariantOf(total, theme);
  if (v === 'night') return true;
  if (v === 'sunset') return absTime(total) / 60 >= 18.5;
  return false;
}
export function dailyEventDay(state) {
  const day = clockOf(state.total).day;
  // month = every 30 game-days
  const dom = ((day - 1) % 30) + 1;      // 1-based day-of-month (sale/shiny)
  const dom0 = (day - 1) % 30;           // 0-based ("15th" = day 16 of the month)
  const month0 = Math.floor((day - 1) / 30); // 0-based month
  const ev = { sale: CFG.EVENTS.sale.includes(dom), shiny: CFG.EVENTS.shiny.includes(dom),
              ghost: dom0 === CFG.EVENTS.ghost && month0 % 2 === 0, dom, month: month0 + 1 };
  return ev;
}

// ---------- state factory ----------
export function freshState() {
  return {
    v: 1,
    screen: 'title',
    total: 0,
    form: 'eevee', shiny: false, stage: 'egg',
    stats: { meal: 80, happy: 80, energy: 80, health: 100 },
    sick: false, sleeping: false,
    zeroH: 0, sickZeroH: 0,
    pet: { name: '', personality: null, affinity: CFG.AFFINITY.start, evolved: false, bornAt: 0 },
    hatchTotal: 0,
    furballs: [], furballIn: 240,
    day: { snacks: 0, coins: 50, coinsDay: 1, petAffinityToday: 0, furAffinityToday: 0 },
    life: { meals: 0, snacks: 0, pets: 0, cleans: 0, games: 0, wins: 0, spins: 0, jackpots: 0, balls: 0,
            sessionNet: 0, sickCount: 0, happySum: 0, happyN: 0, maxHappy: 0, petTimes: [], lastPetAt: 0 },
    allTime: { lives: 0, meals: 0, furballs: 0, firstSeen: Date.now(), allNet: 0 },
    dex: {}, medals: {},
    shop: { owned: [], decor: [], fashion: null, theme: 'day', stones: [] },
    settings: { sound: true, haptics: true },
    away: null,
    ended: null, // 'graduation' | 'death' | null
    _runtime: {},
  };
}

// ---------- medals ----------
function award(state, key, ev) {
  if (state.medals[key]) return false;
  state.medals[key] = 1;
  ev && ev.push(key);
  return true;
}
export function checkMedals(state, ev) {
  const L = state.life, AT = state.allTime;
  if (state.stage !== 'egg') award(state, 'hatch', ev);
  if (L.meals >= 1) award(state, 'meal1', ev);
  if (L.pets >= 10) award(state, 'pet10', ev);
  if (L.cleans >= 10) award(state, 'clean10', ev);
  if (L.meals >= 50) award(state, 'meals50', ev);
  if (L.games >= 1) award(state, 'game1', ev);
  if (L.spins >= 10) award(state, 'spins10', ev);
  if (AT.allNet >= 100) award(state, 'lucky', ev);
  if (L.sessionNet >= 500) award(state, 'highroller', ev);
  if (L.jackpots >= 1) award(state, 'jackpot', ev);
  if (state.ended === 'death') award(state, 'death1', ev);
  if (state.ended === 'graduation' && state.careRank === 'S') award(state, 'rankS', ev);
  if (state.pet.evolved) { award(state, 'evoothers', ev); award(state, 'evo-' + state.form, ev); }
  if (state.stage === 'adult') award(state, 'adult', ev);
  if (clockOf(state.total).day >= 7) award(state, 'day7', ev);
  if (clockOf(state.total).day >= 30) award(state, 'day30', ev);
  if (AT.lives >= 3) award(state, 'lives3', ev);
  if (state.shiny) award(state, 'shiny1', ev);
  if (state.pet.evolved && state.shiny) award(state, 'sh-' + state.form, ev);
  const forms = CFG.DEX;
  let n = 0, s = 0;
  for (const f of forms) {
    if (state.dex[f.key + 'n']) n++;
    if (state.dex[f.key + 's']) s++;
  }
  if (n >= 9) award(state, 'dex9', ev);
  if (n >= 9 && s >= 9) award(state, 'dex18', ev);
}
export function countDex(state) {
  let n = 0, s = 0;
  for (const f of CFG.DEX) { if (state.dex[f.key + 'n']) n++; if (state.dex[f.key + 's']) s++; }
  return { n, s };
}

// ---------- life events ----------
export function startEgg(state, opts = {}) {
  const prev = state;
  const keep = {
    dex: prev.dex, medals: prev.medals, shop: prev.shop, settings: prev.settings,
    allTime: prev.allTime, dayCoins: prev.day.coins,
  };
  const st = freshState();
  st.dex = keep.dex; st.medals = keep.medals; st.shop = keep.shop; st.settings = keep.settings;
  st.allTime = keep.allTime;
  st.total = 0; st.stage = 'egg'; st.screen = 'egg';
  st.day.coins = opts.coins !== undefined ? opts.coins : keep.dayCoins;
  st.allTime.lives += 1;
  if (opts.seedShiny !== undefined) st._forceShiny = opts.seedShiny;
  if (opts.name) { st.pet.name = opts.name; }
  return st;
}

export function hatch(state, ev) {
  const t = CFG.TIME;
  state.stage = 'baby';
  state.hatchTotal = state.total;
  state.pet.bornAt = state.total;
  state.pet.name = rng.pick(CFG.NAMES);
  state.pet.personality = rng.pick(Object.keys(CFG.PERSONALITIES));
  const evd = dailyEventDay(state);
  const odds = evd.shiny ? CFG.SHINY.shinyDayOdds : CFG.SHINY.odds;
  const forced = rng.takeForce('shiny');
  state.shiny = state._forceShiny !== undefined ? !!state._forceShiny : (forced !== undefined ? !!forced : rng.chance(1 / odds));
  if (state.shiny) state._forceShiny = state.shiny; // lock for this life
  // first dex entry
  state.dex['eeveen'] = 1;
  if (state.shiny) state.dex['eevees'] = 1;
  ev && ev.push('hatch');
}

// ---------- stage/evolve ----------
export function evolveTo(state, form, ev) {
  state.form = form;
  state.pet.evolved = true;
  state.stage = 'adult';
  state.stats.happy = Math.min(100, state.stats.happy + 20);
  state.dex[form + 'n'] = 1;
  if (state.shiny) state.dex[form + 's'] = 1;
  ev && ev.push('evo-' + form);
}

// ---------- actions ----------
const clamp = (v) => Math.max(0, Math.min(100, v));

export function feedMeal(state, key, ev) {
  if (state.stage === 'egg' || state.ended) return false;
  const st = state.stats;
  const fave = state.pet.personality && CFG.PERSONALITIES[state.pet.personality].meal === key;
  let gain;
  if (key === 'rawst') {
    st.meal = clamp(st.meal + CFG.STATS.rawstMeal);
    st.health = clamp(st.health + CFG.STATS.rawstHealth);
    if (state.sick) { state.sick = false; state.zeroH = 0; state.sickZeroH = 0; }
  } else {
    const p = state.pet.personality ? CFG.PERSONALITIES[state.pet.personality] : null;
    const disliked = p && p.dislike === key;
    gain = fave ? CFG.STATS.mealFave : disliked ? CFG.STATS.mealDisliked : CFG.STATS.mealNeutral;
    st.meal = clamp(st.meal + gain);
  }
  if (key !== 'rawst' && st.meal >= CFG.AFFINITY.mealReq) state.pet.affinity = clampAff(state.pet.affinity + CFG.AFFINITY.meal);
  state.life.meals++; state.allTime.meals++;
  state.day.petTimes = state.day.petTimes || [];
  ev && ev.push('fed:' + key);
  return true;
}

// snack: also the Espeon/Umbreon evolution trigger
export function feedSnack(state, key, ev) {
  if (state.stage === 'egg' || state.ended) return false;
  const st = state.stats;
  st.meal = clamp(st.meal + CFG.STATS.snackMeal);
  st.happy = clamp(st.happy + CFG.STATS.snackHappy);
  state.day.snacks++;
  state.life.snacks++;
  // tummy ache from over-snacking
  if (state.day.snacks >= CFG.STATS.snackAcheFrom) {
    st.health = clamp(st.health - CFG.STATS.snackAcheHealth);
    if (rng.chance(0.25)) { setSick(state, 'tummy', ev); }
  }
  // evolution windows (adult eevee, not yet evolved)
  if (state.stage === 'adult' && state.form === 'eevee' && !state.pet.evolved) {
    const m = absTime(state.total);
    const A_ = CFG.AFFINITY;
    if (m >= CFG.EVOLUTIONS.espeon.from && m < CFG.EVOLUTIONS.espeon.to && state.pet.affinity >= A_.espeonReq) {
      queueEvolve(state, 'espeon', ev); return true;
    }
    if (m >= CFG.EVOLUTIONS.umbreon.from && m < CFG.EVOLUTIONS.umbreon.to && state.pet.affinity >= A_.umbreonReq) {
      queueEvolve(state, 'umbreon', ev); return true;
    }
  }
  ev && ev.push('snack:' + key);
  return true;
}

function clampAff(v) { return Math.max(CFG.AFFINITY.min, Math.min(CFG.AFFINITY.max, v)); }
export function setSick(state, reason, ev) {
  if (state.sick || state.ended) return;
  state.sick = true;
  state.sickZeroH = state.zeroH;
  state.pet.affinity = clampAff(state.pet.affinity + CFG.AFFINITY.sick);
  state.life.sickCount++;
  ev && ev.push('sick:' + reason);
}

export function doPet(state, ev) {
  if (state.stage === 'egg' || state.ended || state.sleeping) return false;
  const st = state.stats;
  const now = state.total;
  const L = state.life;
  L.pets++;
  L.petTimes = L.petTimes.filter((t) => now - t < 30);
  const rapid = L.petTimes.length > 10;
  L.petTimes.push(now);
  st.happy = clamp(st.happy + (rapid ? CFG.STATS.petDiminishing : CFG.STATS.petGain));
  if (state.day.petAffinityToday < CFG.AFFINITY.petCapDay) {
    state.pet.affinity = clampAff(state.pet.affinity + CFG.AFFINITY.pet);
    state.day.petAffinityToday += CFG.AFFINITY.pet;
  }
  ev && ev.push('pet');
  return true;
}

export function cleanFurball(state, idx, ev) {
  if (idx === undefined) idx = state.furballs.length - 1;
  if (idx < 0 || idx >= state.furballs.length) return false;
  state.furballs.splice(idx, 1);
  state.stats.happy = clamp(state.stats.happy + CFG.STATS.cleanGain);
  state.life.cleans++;
  ev && ev.push('clean');
  return true;
}

export function buyShop(state, key, ev) {
  if (state.ended) return false;
  const groups = { decor: CFG.SHOP.decor, fashion: CFG.SHOP.fashion, themes: CFG.SHOP.themes };
  let group = null, item = null;
  for (const gk of Object.keys(groups)) {
    const it = groups[gk].find((i) => i.key === key);
    if (it) { group = gk; item = it; break; }
  }
  if (!item || state.shop.owned.includes(key)) return false;
  const price = dailyEventDay(state).sale ? Math.ceil(item.price / 2) : item.price;
  if (state.day.coins < price) return false;
  state.day.coins -= price;
  state.shop.owned.push(key);
  if (group === 'decor') state.shop.decor.push(key);
  else if (group === 'fashion') state.shop.fashion = key;
  else if (group === 'themes') state.shop.theme = key;
  ev && ev.push('buy:' + key);
  return true;
}

export function buyStone(state, key, ev) {
  if (state.ended) return false;
  const it = CFG.SHOP_STONES.find((i) => i.key === key);
  if (!it || state.shop.stones.includes(key)) return false;
  if (state.day.coins < it.price) return false;
  state.day.coins -= it.price;
  state.shop.stones.push(key);
  ev && ev.push('stone:' + key);
  return true;
}

export function useStone(state, key, ev) {
  if (state.ended) return false;
  const i = state.shop.stones.indexOf(key);
  if (i < 0) return false;
  if (state.stage !== 'adult' || state.form !== 'eevee' || state.pet.evolved) return false;
  state.shop.stones.splice(i, 1);
  return giveStone(state, key, ev);
}

export function giveMedicine(state, ev) {
  if (state.ended) return false;
  state.stats.health = 100;
  if (state.sick) { state.sick = false; state.zeroH = 0; state.sickZeroH = 0; }
  ev && ev.push('medicine');
  return true;
}

export function giveBall(state, ev) {
  if (state.stage === 'egg' || state.ended) return false;
  state.stats.happy = clamp(state.stats.happy + CFG.STATS.ballHappy);
  state.pet.affinity = clampAff(state.pet.affinity + CFG.STATS.ballAffinity);
  state.life.balls = (state.life.balls || 0) + 1;
  ev && ev.push('ball');
  return true;
}

export function catchGhost(state, ev) {
  const g = state._runtime && state._runtime.ghost;
  if (!g || g.done || state.ended) return false;
  g.done = true;
  state._runtime.ghostDone = true;
  changeCoins(state, CFG.EVENTS.ghostCoins, ev);
  ev && ev.push('ghost');
  return true;
}

export function giveStone(state, stone, ev) {
  if (state.stage !== 'adult' || state.form !== 'eevee' || state.pet.evolved || state.ended) return false;
  const form = CFG.STONES[stone];
  if (!form) return false;
  queueEvolve(state, form, ev);
  return true;
}

export function playGame(state, won, ev) {
  if (state.stage === 'egg' || state.ended) return false;
  state.life.games++;
  state.stats.happy = clamp(state.stats.happy + (won ? CFG.STATS.gameWin : CFG.STATS.gameLose));
  if (won) { state.life.wins++; state.pet.affinity = clampAff(state.pet.affinity + CFG.AFFINITY.gameWin); }
  ev && ev.push(won ? 'game:win' : 'game:lose');
  return true;
}

export function changeCoins(state, delta, ev) {
  state.day.coins = Math.max(0, state.day.coins + delta);
  state.life.sessionNet += delta;
  state.allTime.allNet += delta;
  ev && ev.push('coins:' + delta);
}

export function skipSleep(state) {
  if (!state.sleeping) return;
  // jump to next 07:00
  const m = absTime(state.total);
  const target = m < 420 ? 420 : 1860; // 07:00 today, else 07:00 tomorrow (420 + 1440)
  state.total += (target - m);
  wakeUp(state);
}

function wakeUp(state) {
  state.sleeping = false;
  state.stats.energy = 100;
}

// ---------- evolve queue (cinematic handled by UI) ----------
export function queueEvolve(state, form, ev) {
  state._pendingEvolve = form;
}
export function consumeEvolve(state) {
  const f = state._pendingEvolve;
  state._pendingEvolve = null;
  return f;
}

// ---------- offline catch-up ----------
export function applyOffline(state, elapsedSec, ev) {
  const cap = CFG.TIME.offlineCapMin;
  let mins = Math.min(elapsedSec * CFG.TIME.minPerSec, cap);
  const before = { day: clockOf(state.total).day, stage: state.stage, coins: state.day.coins };
  const report = { items: [], before, after: null, mins: Math.round(mins) };
  const step = 30; // 30 game-min steps for coarse simulation
  while (mins > 0) {
    const d = Math.min(step, mins); mins -= d;
    advance(state, d, ev, true);
  }
  // floor meters (no death while away)
  const F = CFG.TIME.offlineFloor;
  for (const k of ['meal', 'happy', 'energy']) state.stats[k] = Math.max(F, state.stats[k]);
  state.sick = false; state.zeroH = 0; state.sickZeroH = 0;
  if (state.ended) { // ended away → settle at the ending screen
    report.items.push({ type: 'ended', text: state.ended === 'graduation' ? 'Your pet graduated!' : 'Your pet passed away…' });
  } else {
    if (before.stage !== state.stage) report.items.push({ type: 'stage', text: 'Your pet grew into ' + state.stage + '!' });
    if (state.form !== before.form) report.items.push({ type: 'evo', text: 'Your pet evolved!' });
    if (state.furballs.length) report.items.push({ type: 'furball', text: state.furballs.length + ' furballs appeared' });
    if (state.day.snacks >= 4) report.items.push({ type: 'snack', text: 'Tummy got full of snacks' });
  }
  report.after = { day: clockOf(state.total).day, stage: state.stage, coins: state.day.coins };
  return report;
}

// ---------- daily rollover ----------
function dailyRoll(state, ev) {
  const c = clockOf(state.total);
  if (c.day > state.day.coinsDay) {
    state.day.coinsDay = c.day;
    state.day.coins = CFG.CASINO.dailyFree;
    state.day.snacks = 0;
    state.day.petAffinityToday = 0;
    state.day.furAffinityToday = 0;
    ev && ev.push('daily:coins');
  }
}

// ---------- main advance (pure simulation, dt in game-minutes) ----------
export function advance(state, dtMin, ev) {
  if (state.frozen || state.ended) return;
  const T = CFG.TIME, S = CFG.STATS;
  const prevTotal = state.total;
  state.total += dtMin;
  dailyRoll(state, ev);

  // egg hatch
  if (state.stage === 'egg' && state.total >= T.eggEnd) {
    hatch(state, ev);
    state.furballIn = rng.float(S.furballMinHrs, S.furballMaxHrs) * 60;
  }

  if (state.stage === 'egg') return;

  // sleep
  if (!state.sleeping && !state.ended) {
    const prevM = absTime(prevTotal), m = absTime(state.total);
    const crossed = (h) => (prevM < m ? m >= h * 60 && prevM < h * 60 : m < h * 60);
    if (crossed(T.sleepHour) && state.stats.energy < 40) startSleep(state, ev);
    else if (crossed(T.forceRestHour)) startSleep(state, ev, true);
  }
  if (state.sleeping && absTime(state.total) >= T.wakeHour * 60 && absTime(prevTotal) < T.wakeHour * 60) {
    wakeUp(state); ev && ev.push('woke');
  }

  // ghost Eevee (qualifying nights, once per day) — drifts across the meadow
  if (!state.ended) {
    if (!state._runtime) state._runtime = {};
    const evd = dailyEventDay(state);
    if (evd.ghost && isNight(state.total, state.shop.theme) && !state._runtime.ghostDone && !state._runtime.ghost) {
      const fromLeft = rng.next() < 0.5;
      state._runtime.ghost = { x: fromLeft ? -45 : 475, dir: fromLeft ? 1 : -1, t: 0 };
      ev && ev.push('ghost:in');
    }
    if (state._runtime.ghost) {
      const g = state._runtime.ghost;
      if (!g.done) {
        const dtS = dtMin / (CFG.TIME.minPerSec * (state.rate || 1)); // back to real seconds
        g.t += dtS;
        g.x += g.dir * CFG.EVENTS.ghostSpeed * dtS;
        if (g.x < -60 || g.x > 490) { state._runtime.ghostDone = true; ev && ev.push('ghost:out'); }
      } else if (state._runtime.ghostDone) {
        delete state._runtime.ghost;
      }
    }
  }

  if (state.sleeping) return; // no decay/furballs while asleep

  // decay (per game-hour)
  const h = dtMin / 60;
  const st = state.stats;
  st.meal = Math.max(0, st.meal - S.meal.decay * h);
  st.energy = Math.max(0, st.energy - S.energy.decay * h);
  const happyDecay = S.happy.decay * (state.sick ? S.happy.decaySick / S.happy.decay : 1)
    * (state.furballs.length >= S.furballMax ? S.dirtyDecayMul : 1);
  st.happy = Math.max(0, st.happy - happyDecay * h);

  // health + sickness
  const anyZero = st.meal <= 0 || st.happy <= 0 || st.energy <= 0;
  if (anyZero) {
    state.zeroH += h;
    st.health = Math.max(0, st.health - S.health.decayZero * h);
    if (!state.sick && state.zeroH >= S.sickZeroHrs) setSick(state, 'neglect', ev);
  } else {
    state.zeroH = 0;
  }
  if (state.sick) {
    state.sickZeroH += h;
    if (state.sickZeroH >= S.deathZeroHrs || st.health <= 0) {
      return endLife(state, 'death', ev);
    }
  }

  // furballs
  if (state.total - state.hatchTotal > S.furballGraceHrs * 60) {
    state.furballIn -= dtMin;
    if (state.furballIn <= 0 && state.furballs.length < S.furballMax) {
      spawnFurball(state, ev);
      state.furballIn = rng.float(S.furballMinHrs, S.furballMaxHrs) * 60;
    } else if (state.furballIn <= 0) {
      state.furballIn = rng.float(60, 180);
    }
  }

  // happy sampling for rank
  if (!state._sampleAt) state._sampleAt = state.total;
  if (state.total - state._sampleAt >= 30) {
    state._sampleAt = state.total;
    state.life.happySum += st.happy; state.life.happyN++;
    state.life.maxHappy = Math.max(state.life.maxHappy, st.happy);
  }

  // stage
  const ns = stageOf(state.total);
  if (ns !== state.stage) { state.stage = ns; ev && ev.push('stage:' + ns); }

  // auto evolutions
  if (state.stage === 'adult' && state.form === 'eevee' && !state.pet.evolved) {
    const syl = CFG.EVOLUTIONS.sylveon;
    if (state.total >= syl.clock && state.pet.affinity >= syl.req) {
      queueEvolve(state, 'sylveon', ev);
    }
  }

  // graduation
  if (state.total >= T.grad) endLife(state, 'graduation', ev);
}

function startSleep(state, ev, forced) {
  state.sleeping = true;
  ev && ev.push(forced ? 'rest' : 'sleep');
}

function spawnFurball(state, ev) {
  const P = CFG.PET;
  state.furballs.push({ x: rng.int(P.x0, P.x1), y: rng.int(P.y0 + 20, P.y1), small: rng.chance(0.4) });
  state.allTime.furballs++;
  state.stats.health = Math.max(0, state.stats.health - 2);
  state.stats.happy = Math.max(0, state.stats.happy - 2);
  if (state.day.furAffinityToday < 5) {
    state.pet.affinity = Math.max(0, state.pet.affinity - 1);
    state.day.furAffinityToday += 1;
  }
  ev && ev.push('furball');
}

function endLife(state, kind, ev) {
  if (state.ended) return;
  state.ended = kind;
  if (kind === 'death') ev && ev.push('death');
  if (kind === 'graduation') {
    const L = state.life;
    const avg = L.happyN ? L.happySum / L.happyN : 100;
    state.careRank = L.sickCount === 0 && avg >= 85 ? 'S' : L.sickCount === 0 ? 'A' : L.sickCount <= 1 ? 'B' : 'C';
    if (state.careRank === 'S') ev && ev.push('rankS');
  }
}

// care rank live (for profile)
export function careRank(state) {
  if (state.careRank) return state.careRank;
  const L = state.life;
  const avg = L.happyN ? L.happySum / L.happyN : 100;
  return L.sickCount === 0 && avg >= 85 ? 'S' : L.sickCount === 0 ? 'A' : L.sickCount <= 1 ? 'B' : 'C';
}

// ---------- top-level tick ----------
export function tick(state, dtSec, events) {
  if (state.frozen || state.screen === 'title') return;
  const dtMin = dtSec * CFG.TIME.minPerSec * (state.rate || 1);
  advance(state, dtMin, events);
  if (state._pendingEvolve && !state._evolving) {
    const f = state._pendingEvolve;
    state._pendingEvolve = null;
    state._evolving = true;
    evolveTo(state, f, events); // apply form + dex entry
    events.push('evolve:' + f); // UI: cinematic
  }
}
