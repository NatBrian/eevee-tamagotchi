// dev.js — window.TamaGame: test/dev API + time-mock harness (BUILD_PLAN §12.1)
import { A, CFG, STAGE_LABEL } from './config.js';
import {
  clockOf, absTime, stageOf, careRank, countDex, applyOffline,
  feedMeal, feedSnack, doPet, cleanFurball, giveMedicine, giveStone,
  playGame, changeCoins, skipSleep, startEgg, evolveTo, hatch, freshState,
} from './state.js';
import { rng } from './prng.js';
import { toast, setScreen, openMenuSheet, openFoodSheet, openPlaySheet } from './main.js';

export function attachDev(G) {
  const S = () => G.state;

  function setTotalAbs(minOfDay) {
    const s = S();
    const cur = absTime(s.total);
    let delta = minOfDay - cur;
    if (delta <= -60) delta += 1440; // wrap to next day if we'd go backwards across midnight
    s.total += delta;
  }

  window.TamaGame = {
    // ---- readouts ----
    get() {
      const s = S();
      return {
        screen: G.screen,
        total: Math.round(s.total * 10) / 10,
        clock: clockOf(s.total),
        stage: s.stage, form: s.form, shiny: s.shiny,
        stats: { ...s.stats },
        sick: s.sick, sleeping: s.sleeping, zeroH: s.zeroH, sickZeroH: s.sickZeroH,
        name: s.pet.name, personality: s.pet.personality, affinity: Math.round(s.pet.affinity * 10) / 10,
        evolved: s.pet.evolved,
        furballs: s.furballs.length,
        day: { ...s.day },
        careRank: careRank(s),
        dex: countDex(s),
        medals: Object.keys(s.medals).length,
        ended: s.ended,
        coins: s.day.coins,
        frozen: !!s.frozen,
        rate: s.rate || 1,
        missingAssets: G.img ? G.img.missing.length : -1,
        missingList: G.img ? G.img.missing : [],
        imagesLoaded: G.img ? G.img.map.size : -1,
      };
    },
    state() { return S(); },          // raw access for advanced tests
    fps() {
      const ft = G.frameTimes;
      const now = performance.now();
      const recent = ft.filter((t) => t > now - 2000);
      if (recent.length < 5) return { avg: 0, p95: 0, frames: recent.length };
      const dts = [];
      for (let i = 1; i < recent.length; i++) dts.push(recent[i] - recent[i - 1]);
      dts.sort((a, b) => a - b);
      const avg = dts.reduce((a, b) => a + b, 0) / dts.length;
      return {
        avg: Math.round(1000 / avg),
        p95: Math.round(dts[Math.floor(dts.length * 0.95)] * 10) / 10,
        min: Math.round(1000 / dts[dts.length - 1]),
        frames: recent.length,
      };
    },

    // ---- clock (time mocking) ----
    warp(hhmm) {
      const [h, m] = String(hhmm).split(':').map(Number);
      setTotalAbs(h * 60 + m);
      return this.get();
    },
    warpTo(absGameMin) { S().total = absGameMin; return this.get(); },
    addMinutes(min) { S().total += min; return this.get(); },
    setDay(n) {
      // jump so the calendar day becomes n (keep current time-of-day)
      const s = S();
      const c = clockOf(s.total);
      s.total = (n - 1) * 1440 + (c.hour * 60 + c.minute - 420);
      return this.get();
    },
    rate(x) { S().rate = Math.max(1, Math.min(1000, x)); },
    freeze() { S().frozen = true; },
    unfreeze() { S().frozen = false; },

    // ---- state setters ----
    setStats(meal, happy, energy, health) {
      const st = S().stats;
      if (meal !== undefined) st.meal = meal;
      if (happy !== undefined) st.happy = happy;
      if (energy !== undefined) st.energy = energy;
      if (health !== undefined) st.health = health;
      return this.get();
    },
    setSick(b) { S().sick = !!b; S().sickZeroH = b ? S().zeroH : 0; return this.get(); },
    setSleeping(b) { S().sleeping = !!b; if (!b) S().stats.energy = 100; return this.get(); },
    setStage(stage) { S().total = { egg: 10, baby: 600, child: 2000, adult: 3200 }[stage] ?? S().total; S().stage = stageOf(S().total); return this.get(); },
    setForm(form) { S().form = form; S().pet.evolved = form !== 'eevee'; return this.get(); },
    forceShiny(b) { S().shiny = !!b; S()._forceShiny = b ? true : undefined; return this.get(); },
    setAffinity(v) { S().pet.affinity = v; return this.get(); },
    setName(name) { S().pet.name = name; return this.get(); },
    setPersonality(k) { S().pet.personality = k; return this.get(); },
    setCoins(v) { S().day.coins = v; return this.get(); },
    addPoop(n) {
      const s = S();
      for (let i = 0; i < n; i++) s.furballs.push({ x: 100 + i * 70, y: 700, small: i % 2 === 0 });
      return this.get();
    },
    setDex(captured) {
      const s = S();
      if (captured) for (const d of CFG.DEX) { s.dex[d.key + 'n'] = 1; s.dex[d.key + 's'] = 1; }
      else s.dex = {};
      return this.get();
    },
    grantShop(items) { for (const k of items) { S().shop.owned.push(k); if (CFG.SHOP.decor.find((d) => d.key === k)) S().shop.decor.push(k); } return this.get(); },
    setTheme(theme) { S().shop.theme = theme; return this.get(); },

    // ---- RNG ----
    seed(n) { rng.seed(n); return this.get(); },
    forceNext(entry) { rng.forceNext(entry); },

    // ---- actions ----
    feedMeal(key) { feedMeal(S(), key, G.events); return this.get(); },
    snack(key) { return feedSnack(S(), key || 'honey', G.events) && this.get(); },
    pet() { doPet(S(), G.events); return this.get(); },
    clean() { let n = 0; while (cleanFurball(S(), 0, G.events)) n++; return { cleaned: n }; },
    medicine() { giveMedicine(S(), G.events); return this.get(); },
    giveStone(k) { giveStone(S(), k, G.events); return this.get(); },
    evolveTo(form) { evolveTo(S(), form, G.events); G.pet && G.pet.sync(S()); return this.get(); },
    play(won) { playGame(S(), won, G.events); return this.get(); },
    coins(delta) { changeCoins(S(), delta, G.events); return this.get(); },
    // casino harness: run n instant rounds (RTP tests) — opts: { bet, bets, pick }
    casinoSpin(game, n = 1, opts = {}) {
      if (!G.casino) return { error: 'no casino' };
      return G.casino.spinInstant(game, n, opts);
    },
    skipSleep() { skipSleep(S()); return this.get(); },
    newEgg(opts) {
      const s = S();
      G.state = startEgg(s, opts || {});
      G.pet.sync(G.state); G.pet.x = 215; G.pet.y = 700;
      setScreen('egg');
      return this.get();
    },
    hatchNow() { if (S().stage === 'egg') hatch(S(), G.events); return this.get(); },
    newLife(opts) { return this.newEgg(opts); },

    // ---- offline catch-up (S14) ----
    simulateOffline(realSeconds) {
      const s = S();
      s.savedAt = Date.now() - realSeconds * 1000;
      const report = applyOffline(s, realSeconds, G.events);
      return { report, state: this.get() };
    },

    // ---- navigation / fx (for screenshots) ----
    show(screen) { setScreen(screen); return this.get(); },
    openMenu() { openMenuSheet('menu'); },
    openProfile() { openMenuSheet('profile'); },
    openFood() { openFoodSheet(); },
    openPlay() { openPlaySheet(); },
    emote(type, bubble) {
      const s = S();
      if (G.pet && G.fx) G.fx.emote(G.pet.x, G.pet.y - 40, type, bubble);
      return this.get();
    },
    burst(kind, n) { if (G.fx) G.fx.burst(215, 600, kind, n); },
    toast(msg) { toast(msg); },
    reset() {
      G.state = freshState();
      G.state.screen = 'title';
      G.pet.sync(G.state);
      setScreen('title');
      return this.get();
    },
  };
}
