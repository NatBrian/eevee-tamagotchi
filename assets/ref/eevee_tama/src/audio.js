// audio.js: Web Audio mixer + haptics (M7)
//
// BGM: day/night loops. CFG.AUDIO.tracks[key] = { file, synth }:
//   file set   -> ogg decoded once + echo-tail seamless loop
//   file null  -> procedural chiptune loop (placeholder until the user picks a track)
// SFX: lazy-decoded Kenney ogg buffers (interface-sounds / rpg-audio / 8-bit jingles).
// Haptics: Vibration API tiers (iOS degrades silently).
// Settings: reads G.state.settings { sound, haptics } live; toggles take effect instantly.
// Unlock: AudioContext is created/resumed inside the first pointer gesture (iOS autoplay).

import { CFG } from './config.js';

// ---------------- SFX files ----------------
const IF = '../prod/audio/interface-sounds/Audio/';
const RPG = '../prod/audio/rpg-audio/Audio/';
const NES = '../prod/audio/music-jingles/Audio/8-Bit jingles/';

export const SFX = {
  tap: IF + 'click_002.ogg',
  tapSoft: IF + 'click_004.ogg',
  open: IF + 'open_001.ogg',
  close: IF + 'close_001.ogg',
  back: IF + 'back_001.ogg',
  toggle: IF + 'toggle_001.ogg',
  select: IF + 'select_001.ogg',
  select2: IF + 'select_003.ogg',
  selectBig: IF + 'select_006.ogg',
  confirm: IF + 'confirmation_001.ogg',
  confirm2: IF + 'confirmation_002.ogg',
  confirm3: IF + 'confirmation_003.ogg',
  confirm4: IF + 'confirmation_004.ogg',
  error: IF + 'error_001.ogg',
  errorLow: IF + 'error_004.ogg',
  errorDeep: IF + 'error_003.ogg',
  glass: IF + 'glass_002.ogg',
  glass2: IF + 'glass_003.ogg',
  glass3: IF + 'glass_005.ogg',
  glass4: IF + 'glass_004.ogg',
  drop: IF + 'drop_001.ogg',
  drop2: IF + 'drop_003.ogg',
  pluck: IF + 'pluck_001.ogg',
  question: IF + 'question_001.ogg',
  question2: IF + 'question_002.ogg',
  question3: IF + 'question_003.ogg',
  scratch: IF + 'scratch_001.ogg',
  scratch2: IF + 'scratch_003.ogg',
  scratch3: IF + 'scratch_004.ogg',
  maximize1: IF + 'maximize_002.ogg',
  maximize2: IF + 'maximize_003.ogg',
  maximize3: IF + 'maximize_005.ogg',
  minimize1: IF + 'minimize_001.ogg',
  minimize2: IF + 'minimize_002.ogg',
  minimize3: IF + 'minimize_006.ogg',
  bong: IF + 'bong_001.ogg',
  chip: RPG + 'metalClick.ogg',
  coin: RPG + 'handleCoins.ogg',
  coin2: RPG + 'handleCoins2.ogg',
  card: RPG + 'bookFlip1.ogg',
  nes01: NES + 'jingles_NES01.ogg',
  nes00: NES + 'jingles_NES00.ogg',
};

// ---------------- event -> sfx + haptics map ----------------
// s: [ [sfxName, vol, rate?], ... ]   v: vibration pattern (ms | [ms])
const MAP = {
  tap:         { s: [[SFX.tap, 0.5]], v: 6 },
  'sheet:open': { s: [[SFX.open, 0.5]], v: 8 },
  'sheet:close': { s: [[SFX.close, 0.45]], v: 8 },
  back:        { s: [[SFX.back, 0.5]], v: 6 },
  select:      { s: [[SFX.select, 0.5]], v: 6 },
  toggle:      { s: [[SFX.toggle, 0.6]], v: 10 },
  error:       { s: [[SFX.error, 0.5]], v: [10, 30, 10] },
  fed:         { s: [[SFX.confirm, 0.6], [SFX.scratch2, 0.3, 0.95]], v: 12 },
  snack:       { s: [[SFX.confirm, 0.55], [SFX.scratch3, 0.28, 1.05]], v: 10 },
  pet:         { s: [[SFX.pluck, 0.6]], v: 8 },
  clean:       { s: [[SFX.glass, 0.55]], v: 12 },
  furball:     { s: [[SFX.drop2, 0.5]], v: 10 },
  sick:        { s: [[SFX.errorDeep, 0.5]], v: [40, 40, 40] },
  medicine:    { s: [[SFX.glass2, 0.6]], v: 12 },
  sleep:       { s: [[SFX.minimize1, 0.35]], v: 8 },
  rest:        { s: [[SFX.minimize1, 0.35]], v: 8 },
  woke:        { s: [[SFX.question, 0.5]], v: 8 },
  hatch:       { s: [[SFX.maximize2, 0.8], [SFX.confirm, 0.5, 1.3]], v: [30, 40, 30] },
  stage:       { s: [[SFX.maximize1, 0.75]], v: [20, 30, 20] },
  evolve:      { s: [[SFX.nes01, 0.9]], v: [40, 40, 40, 40, 80] },
  evo:         { s: [[SFX.glass4, 0.4]], v: 0 },
  death:       { s: [[SFX.minimize3, 0.7]], v: 120 },
  graduation:  { s: [[SFX.maximize3, 0.85]], v: [30, 40, 60] },
  medal:       { s: [[SFX.confirm4, 0.7]], v: [15, 20, 15] },
  buy:         { s: [[SFX.confirm2, 0.6], [SFX.coin, 0.45]], v: 15 },
  stone:       { s: [[SFX.select2, 0.6]], v: 10 },
  coins:       { s: [[SFX.coin2, 0.4]], v: 6 },
  daily:       { s: [[SFX.coin, 0.35]], v: 6 },
  'game:win':  { s: [[SFX.confirm2, 0.7], [SFX.coin, 0.6]], v: [15, 30, 15] },
  'game:lose': { s: [[SFX.errorLow, 0.35]], v: 12 },
  'cas:spin':  { s: [[SFX.scratch, 0.5], [SFX.selectBig, 0.4]], v: 10 },
  'cas:pick':  { s: [[SFX.chip, 0.55]], v: 8 },
  'cas:jackpot': { s: [[SFX.bong, 0.9], [SFX.nes01, 0.85, 0.98]], v: [50, 60, 50, 60, 100] },
  'cas:push':  { s: [[SFX.question3, 0.45]], v: 8 },
  ball:        { s: [[SFX.drop, 0.55]], v: 10 },
  'ghost:in':  { s: [[SFX.question2, 0.5]], v: 20 },
  'ghost:out': { s: [[SFX.minimize2, 0.4]], v: 8 },
  ghost:       { s: [[SFX.confirm3, 0.7], [SFX.glass3, 0.5]], v: [25, 30, 25] },
};

// ---------------- procedural chiptune (placeholder BGM) ----------------
function noteFreq(n) {
  const m = /^([A-G])(#?)(\d)$/.exec(n);
  if (!m) return 0;
  const semis = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0);
  return 440 * Math.pow(2, (semis - 9 + (Number(m[3]) - 4) * 12) / 12);
}

const CHIPTUNES = {
  // bright cozy day loop, C major pentatonic, 92 bpm, square lead + triangle bass
  day: {
    bpm: 92, bars: 8, leadType: 'square', leadVol: 0.04, bassVol: 0.085, filterHz: 2200, hat: true,
    melody: [
      [0, 0, 'E4', 2], [0, 4, 'G4', 2], [0, 8, 'A4', 2], [0, 12, 'G4', 2],
      [1, 0, 'E4', 2], [1, 4, 'D4', 2], [1, 8, 'C4', 2], [1, 12, 'D4', 2],
      [2, 0, 'E4', 2], [2, 4, 'G4', 2], [2, 8, 'A4', 2], [2, 12, 'C5', 2],
      [3, 0, 'A4', 2], [3, 4, 'G4', 2], [3, 8, 'E4', 2], [3, 12, 'D4', 2],
      [4, 0, 'E4', 2], [4, 4, 'G4', 2], [4, 8, 'A4', 2], [4, 12, 'C5', 2],
      [5, 0, 'D5', 2], [5, 4, 'C5', 2], [5, 8, 'A4', 2], [5, 12, 'G4', 2],
      [6, 0, 'E4', 2], [6, 4, 'G4', 2], [6, 8, 'A4', 2], [6, 12, 'G4', 2],
      [7, 0, 'E4', 2], [7, 4, 'D4', 2], [7, 8, 'C4', 3], [7, 13, 'G3', 2],
    ],
    bass: [
      [0, 0, 'C3', 7], [0, 8, 'C3', 7], [1, 0, 'G2', 7], [1, 8, 'G2', 7],
      [2, 0, 'A2', 7], [2, 8, 'A2', 7], [3, 0, 'F2', 7], [3, 8, 'F2', 7],
      [4, 0, 'C3', 7], [4, 8, 'C3', 7], [5, 0, 'G2', 7], [5, 8, 'G2', 7],
      [6, 0, 'C3', 7], [6, 8, 'C3', 7], [7, 0, 'G2', 7], [7, 8, 'G2', 7],
    ],
  },
  // dreamy night loop, A minor music-box, 64 bpm, sine pings + echo
  night: {
    bpm: 64, bars: 8, leadType: 'sine', leadVol: 0.075, bassVol: 0.07, filterHz: 3200,
    staccato: true, delay: true, hat: false,
    melody: [
      [0, 0, 'A4', 4], [0, 10, 'C5', 3],
      [1, 2, 'G4', 3], [1, 10, 'E4', 3],
      [2, 0, 'C5', 4], [2, 10, 'D5', 3],
      [3, 2, 'B4', 3], [3, 10, 'G4', 3],
      [4, 0, 'A4', 4], [4, 10, 'C5', 3],
      [5, 2, 'D5', 3], [5, 10, 'B4', 3],
      [6, 0, 'C5', 4], [6, 10, 'A4', 3],
      [7, 2, 'G4', 4], [7, 12, 'A4', 3],
    ],
    bass: [
      [0, 0, 'A2', 14], [1, 0, 'A2', 14], [2, 0, 'F2', 14], [3, 0, 'F2', 14],
      [4, 0, 'C3', 14], [5, 0, 'C3', 14], [6, 0, 'G2', 14], [7, 0, 'G2', 14],
    ],
  },
};

class Chiptune {
  constructor(ctx, dest, pattern) {
    this.ctx = ctx; this.p = pattern;
    this.gain = ctx.createGain();
    this.gain.gain.value = 1;
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = pattern.filterHz || 2400;
    this.leadBus = ctx.createGain();
    this.bassBus = ctx.createGain();
    this.leadBus.connect(this.filter);
    this.bassBus.connect(this.gain);
    this.filter.connect(this.gain);
    this.gain.connect(dest);
    if (pattern.delay) {
      this.stepDur = 60 / pattern.bpm / 4;
      const d = ctx.createDelay(1);
      d.delayTime.value = this.stepDur * 3;
      const fb = ctx.createGain(); fb.gain.value = 0.32;
      const wet = ctx.createGain(); wet.gain.value = 0.35;
      this.leadBus.connect(d); d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(this.gain);
    }
    this.stepDur = 60 / pattern.bpm / 4;
    this.total = pattern.bars * 16;
    this.step = 0; this.nextT = 0; this.timer = null; this.running = false;
    // short noise burst for hats
    const nb = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.06), ctx.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * (1 - i / nd.length);
    this.noise = nb;
  }

  blip(f, t, dur, bus, lead) {
    const o = this.ctx.createOscillator();
    o.type = lead ? (this.p.leadType || 'square') : 'triangle';
    o.frequency.value = f;
    const v = lead ? (this.p.leadVol || 0.05) : (this.p.bassVol || 0.09);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.012);
    if (this.p.staccato) {
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    } else {
      g.gain.setValueAtTime(v, Math.max(t + 0.02, t + dur - 0.05));
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    }
    o.connect(g); g.connect(bus);
    o.start(t); o.stop(t + dur + 0.06);
  }

  scheduleStep(step, t) {
    const b = Math.floor(step / 16), s = step % 16;
    for (const [nb, ns, note, len] of this.p.melody)
      if (nb === b && ns === s) this.blip(noteFreq(note), t, this.stepDur * len * 0.92, this.leadBus, true);
    for (const [nb, ns, note, len] of this.p.bass)
      if (nb === b && ns === s) this.blip(noteFreq(note), t, this.stepDur * len * 0.92, this.bassBus, false);
    if (this.p.hat && (s === 4 || s === 12)) {
      const src = this.ctx.createBufferSource(); src.buffer = this.noise;
      const g = this.ctx.createGain(); g.gain.value = 0.028;
      src.connect(g); g.connect(this.gain);
      src.start(t);
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.step = 0;
    this.nextT = this.ctx.currentTime + 0.08;
    const tick = () => {
      if (!this.running) return;
      while (this.nextT < this.ctx.currentTime + 0.4) {
        this.scheduleStep(this.step, this.nextT);
        this.nextT += this.stepDur;
        this.step = (this.step + 1) % this.total;
      }
    };
    tick();
    this.timer = setInterval(tick, 100);
  }

  stop() {
    this.running = false;
    if (this.timer) clearInterval(this.timer);
  }
}

// append a fading echo of the tail so any finite jingle loops without a click
function withEchoTail(buf, tailSec = 0.5) {
  const sr = buf.sampleRate, ch = buf.numberOfChannels, f = Math.floor(tailSec * sr);
  if (f <= 0 || f * 2 > buf.length) return buf;
  const out = new AudioBuffer({ length: buf.length + f, numberOfChannels: ch, sampleRate: sr });
  for (let c = 0; c < ch; c++) {
    const d = buf.getChannelData(c), o = out.getChannelData(c);
    o.set(d, 0);
    for (let j = 0; j < f; j++) o[buf.length + j] = d[buf.length - f + j] * (1 - j / f);
  }
  return out;
}

// ---------------- the mixer ----------------
export class AudioSys {
  constructor(game) {
    this.G = game;
    this.ctx = null;
    this.master = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.sfxCache = {};
    this.sfxPending = {};
    this.bgmCache = {};
    this.bgmVoice = null;
    this.bgmTrack = null;
    this.bgmSeq = 0;
    this.mood = 1;
    this.playing = 0;
    this.unlocked = false;
  }

  get settings() {
    return (this.G.state && this.G.state.settings) || { sound: true, haptics: true };
  }

  // ---------- lifecycle / unlock ----------
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 6;
      comp.attack.value = 0.004; comp.release.value = 0.18;
      comp.connect(this.ctx.destination);
      this.master = this.ctx.createGain();
      this.master.gain.value = this.settings.sound ? 1 : 0;
      this.master.connect(comp);
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 1;
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.9;
      this.bgmGain.connect(this.master);
      this.sfxGain.connect(this.master);
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      this.unlocked = true;
      this.prefetch();
      this.setTrack(this.bgmTrack || 'day');
    } catch (e) { this.ctx = null; }
  }

  // ---------- SFX ----------
  loadSfx(url) {
    if (this.sfxCache[url]) return Promise.resolve(this.sfxCache[url]);
    if (this.sfxPending[url]) return this.sfxPending[url];
    const pr = fetch(url)
      .then((r) => r.arrayBuffer())
      .then((ab) => this.ctx.decodeAudioData(ab))
      .then((b) => { this.sfxCache[url] = b; return b; });
    this.sfxPending[url] = pr;
    pr.catch(() => { delete this.sfxPending[url]; });
    return pr;
  }

  prefetch() {
    for (const n of Object.keys(SFX)) this.loadSfx(SFX[n]).catch(() => {});
  }

  sfx(name, opts = {}) {
    if (!this.ctx || !this.settings.sound) return;
    const url = SFX[name];
    if (!url) return;
    this.loadSfx(url).then((buf) => {
      if (!buf || !this.ctx || this.ctx.state !== 'running') return;
      if (!this.settings.sound) return;
      if (this.playing > 16) return; // keep polyphony sane
      this.playing++;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = opts.rate || 1 + (Math.random() - 0.5) * 0.05;
      const g = this.ctx.createGain();
      g.gain.value = opts.vol !== undefined ? opts.vol : 0.6;
      src.connect(g); g.connect(this.sfxGain);
      src.onended = () => { this.playing--; };
      src.start();
    }).catch(() => {});
  }

  // map a game event ('fed:oran', 'cas:jackpot', 'medal', ...) to sfx + haptics
  event(e) {
    if (!e) return;
    let key = e;
    for (const p of ['fed:', 'snack:', 'sick:', 'stage:', 'evolve:', 'evo-', 'buy:', 'stone:', 'coins:', 'daily:']) {
      if (e.startsWith(p)) { key = p.slice(0, -1); break; }
    }
    const m = MAP[key];
    if (!m) return;
    for (const [n, vol, rate] of m.s) this.sfx(n, { vol, rate });
    if (m.v) this.thump(m.v);
  }

  // ---------- haptics ----------
  thump(pattern) {
    if (!this.settings.haptics) return;
    if (typeof navigator.vibrate !== 'function') return; // iOS: degrade silently
    try { navigator.vibrate(pattern); } catch (e) { /* ignore */ }
  }

  // ---------- settings ----------
  setSound(on) {
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.05);
  }

  // ---------- BGM ----------
  bgmTarget() { return (this.mood || 1) * ((CFG.AUDIO && CFG.AUDIO.bgmVol) || 0.55); }

  setMood(m) {
    this.mood = m;
    if (this.ctx && this.bgmVoice) this.bgmVoice.gain.gain.setTargetAtTime(this.bgmTarget(), this.ctx.currentTime, 0.4);
  }

  async setTrack(key) {
    this.bgmTrack = key;
    if (!this.ctx) return; // started on unlock
    if (this.bgmVoice && this.bgmVoice.track === key) return;
    const cfg = (CFG.AUDIO && CFG.AUDIO.tracks && CFG.AUDIO.tracks[key]) || null;
    if (!cfg) return;
    const seq = ++this.bgmSeq;
    let voice;
    if (cfg.file) {
      const buf = await this.loadBgmFile(cfg.file);
      if (seq !== this.bgmSeq) return;
      voice = this.oggbVoice(buf);
    } else {
      voice = this.synthVoice(cfg.synth || key);
    }
    if (seq !== this.bgmSeq) { voice.stop(); return; }
    const t = this.ctx.currentTime;
    const g = this.ctx.createGain();
    g.gain.value = 0;
    voice.out.connect(g);
    g.connect(this.bgmGain);
    voice.start();
    g.gain.setTargetAtTime(this.bgmTarget(), t, 0.7);
    const old = this.bgmVoice;
    if (old) {
      old.gain.gain.setTargetAtTime(0, t, 0.9);
      setTimeout(() => { try { old.voice.stop(); } catch (e) { /* ignore */ } }, 3500);
    }
    this.bgmVoice = { voice, gain: g, track: key };
  }

  async loadBgmFile(file) {
    const k = 'bgm:' + file;
    if (this.bgmCache[k]) return this.bgmCache[k];
    const r = await fetch(file);
    const buf = await this.ctx.decodeAudioData(await r.arrayBuffer());
    this.bgmCache[k] = withEchoTail(buf, 0.5);
    return this.bgmCache[k];
  }

  oggbVoice(buf) {
    const src = this.ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const out = this.ctx.createGain(); out.gain.value = 1;
    src.connect(out);
    return {
      out,
      start() { src.start(); },
      stop() { try { src.stop(); } catch (e) { /* ignore */ } },
    };
  }

  synthVoice(name) {
    const pat = CHIPTUNES[name] || CHIPTUNES.day;
    const chip = new Chiptune(this.ctx, this.bgmGain, pat);
    return {
      out: chip.gain,
      start() { chip.start(); },
      stop() { chip.stop(); },
    };
  }
}
