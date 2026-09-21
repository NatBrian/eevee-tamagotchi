// casino.js — POKÉ CASINO: Eevee Slots · Eeveelution Roulette · Card Flip
// Board is drawn on the main canvas inside the cabinet's screen recess;
// all randomness goes through the shared seeded PRNG (prng.js).
import { CFG, A } from './config.js';
import { rng } from './prng.js';
import { playGame, changeCoins } from './state.js';
import { setScreen } from './main.js';

const C = CFG.CASINO;
const SCR = C.screen;
const SCR_C = { x: SCR.x + SCR.w / 2, y: SCR.y + SCR.h / 2 };

// 4 unique cards: A♥Fire K♦Water Q♣Grass J♠Thunder (manifest keys)
const CARD_ART = ['card_hearts_A', 'card_diamonds_K', 'card_clubs_Q', 'card_spades_J'];

const rr = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const easeOutCubic = (t) => 1 - Math.pow(1 - rr(t, 0, 1), 3);
const easeOutQuart = (t) => 1 - Math.pow(1 - rr(t, 0, 1), 4);

// slot line definitions: [row0, row1, row2] for col 0,1,2
const SLOT_LINES = [
  [1, 1, 1],
  [0, 1, 2],
  [2, 1, 0],
  [0, 0, 0],
  [2, 2, 2],
];

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export class Casino {
  constructor(G) {
    this.G = G;
    this.visible = false;
    this.game = 'slots';
    this.bet = 2;
    this.spinning = false;
    this.t = 0;

    // slots
    this.grid = null;              // [col][row] -> symbol key
    this.reelT = [0, 0, 0];
    this.reelDone = [true, true, true];
    this.reelBounce = [0, 0, 0];   // s since this reel stopped (0 = not stopping)
    this.blurSeed = [0, 0, 0];
    this.blurT = [0, 0, 0];
    this.blurCells = [[], [], []];
    this.lineWins = null;          // [{rows, key, win, lucky}]
    this.slotsWinT = 0;

    // roulette
    this.wheelAngle = 0;
    this.wheelSpin = null;         // { t, from, to }
    this.ballAngle = 0;
    this.ballSpin = null;          // { t, from, to }
    this.winnerSeg = -1;
    this.rtBets = new Set();       // 'color:i' | 'form:i' | 'slot:i'
    this.rtWin = null;             // [{bet, win}]
    this.rtWinT = 0;

    // cards
    this.cards = null;             // [rankIdx x4]
    this.cardPick = -1;
    this.cardSpinT = 0;
    this.cardWin = null;           // { pick, win, push }
    this.cardWinT = 0;
    this._flipped = {};            // card flip sfx dedupe (M7)

    this.freeSpin = false;         // jackpot bonus

    // baked art
    this.sevenImg = null;
  }

  // ---------------- lifecycle ----------------
  open(game) {
    if (game) this.game = game;
    this.visible = true;
    this.resetRound();
    setScreen('casino');
    this.syncDom();
  }

  close() {
    this.visible = false;
    setScreen('main');
  }

  switchGame(game) {
    if (this.spinning) return;
    this.game = game;
    this.resetRound();
    this.syncDom();
  }

  resetRound() {
    this.spinning = false;
    this.lineWins = null;
    this.rtWin = null;
    this.cardWin = null;
    this.winnerSeg = -1;
    if (this.game === 'slots') {
      this.grid = null;
      this.reelDone = [true, true, true];
      this.reelBounce = [0, 0, 0];
      this.slotsWinT = 0;
      this.msg('');
    } else if (this.game === 'roulette') {
      this.wheelSpin = null; this.ballSpin = null;
      this.rtWinT = 0;
      this.msg(this.rtBets.size ? '' : 'PICK A BET ON THE WHEEL');
    } else {
      this.cards = rng.shuffle([0, 1, 2, 3]);
      this.cardPick = -1;
      this.cardSpinT = 0;
      this.cardWinT = 0;
      this.msg('PICK A CARD, THEN SPIN');
    }
  }

  setBet(b) {
    this.bet = rr(b, 1, 3);
    this.syncDom();
    this.G.events.push('cas:pick'); // M7: chip-lay sfx
  }

  toggleRtBet(id) {
    if (this.spinning) return;
    if (this.rtBets.has(id)) this.rtBets.delete(id);
    else this.rtBets.add(id);
    this.syncDom();
    this.msg(this.rtBets.size ? '' : 'PICK A BET ON THE WHEEL');
    this.G.events.push('cas:pick'); // M7: chip-lay sfx
  }

  msg(m) {
    const el = document.getElementById('casino-msg');
    if (el) el.textContent = m || '';
  }

  syncDom() {
    document.querySelectorAll('#casino-tabs .ctab').forEach((el) =>
      el.classList.toggle('active', el.dataset.game === this.game));
    document.querySelectorAll('#casino-bet .betbtn').forEach((el) =>
      el.classList.toggle('active', Number(el.dataset.bet) === this.bet));
    document.querySelectorAll('#casino-roulette-bet .rtab').forEach((el) =>
      el.classList.toggle('active', this.rtBets.has(el.dataset.rt)));
    const rb = document.getElementById('casino-roulette-bet');
    if (rb) rb.classList.toggle('hidden', this.game !== 'roulette');
  }

  coins() { return this.G.state ? this.G.state.day.coins : 0; }

  // ---------------- spins ----------------
  spin() {
    const s = this.G.state;
    if (!s || this.spinning || s.ended) return;
    if (this.game === 'slots') return this.spinSlots();
    if (this.game === 'roulette') return this.spinRoulette();
    return this.spinCards();
  }

  // personality lucky symbol (M6); falls back to default 'heart'
  luckyKey() {
    const s = this.G.state;
    const p = s && s.pet && s.pet.personality ? CFG.PERSONALITIES[s.pet.personality] : null;
    return (p && p.lucky) || C.slots.lucky;
  }

  spinSlots() {
    const B = this.bet;
    const free = !!this.freeSpin;
    if (!free && this.coins() < B) { this.msg('NOT ENOUGH COINS'); return; }
    this.freeSpin = false;
    if (!free) changeCoins(this.G.state, -B, this.G.events);
    this.G.events.push('cas:spin');
    this.grid = [0, 1, 2].map(() => [0, 1, 2].map(() => rng.weighted(C.slots.symbols, 'w').key));
    if (rng.takeForce('slots') === 'jackpot') this.grid = [['ball', 'seven', 'eevee'], ['heart', 'seven', 'ball'], ['oran', 'seven', 'heart']];
    this.reelT = [0, 0, 0];
    this.reelDone = [false, false, false];
    this.reelBounce = [0, 0, 0];
    this.blurT = [0, 0, 0];
    this.blurCells = [[], [], []];
    this.lineWins = null;
    this.spinning = true;
    const lines = C.slots.lineForBet[B];
    this.msg((free ? 'FREE SPIN · ' : `BET ${B} · `) + `${lines} LINE${lines > 1 ? 'S' : ''}`);
  }

  spinRoulette() {
    const s = this.G.state;
    if (!this.rtBets.size) { this.msg('PICK A BET ON THE WHEEL'); return; }
    const B = this.bet;
    const total = B * this.rtBets.size;
    if (this.coins() < total) { this.msg('NOT ENOUGH COINS'); return; }
    changeCoins(s, -total, this.G.events);
    this.G.events.push('cas:spin');
    const forced = rng.takeForce('roulette');
    this.winnerSeg = (typeof forced === 'number' && forced >= 0 && forced < 12) ? forced : rng.int(0, 11);
    const dur = C.roulette.spinMs / 1000;
    const TAU = Math.PI * 2;
    const top = -Math.PI / 2;
    const segCenter = (i) => i * (TAU / 12) + Math.PI / 12;
    // wheel: spin >= 4 full turns forward, end with winner under the top pointer
    const from = this.wheelAngle;
    let delta = top - segCenter(this.winnerSeg) - from;
    delta = ((delta % TAU) + TAU) % TAU;
    this.wheelSpin = { t: 0, from, to: from + 4 * TAU + delta };
    // ball: pre-rolled opposite direction, settles at the top pointer
    const bFrom = this.ballAngle;
    const bTarget = top + rng.float(-0.1, 0.1);
    let bTo = bFrom - 6 * TAU;
    bTo += ((bTarget - bTo) % TAU + TAU) % TAU;
    this.ballSpin = { t: 0, from: bFrom, to: bTo };
    this.rtWin = null;
    this.rtWinT = 0;
    this.spinning = true;
    this.msg(`BET ${total} · GOOD LUCK!`);
  }

  spinCards() {
    if (this.cardPick < 0) { this.msg('PICK A CARD FIRST!'); return; }
    const B = this.bet;
    if (this.coins() < B) { this.msg('NOT ENOUGH COINS'); return; }
    changeCoins(this.G.state, -B, this.G.events);
    this.G.events.push('cas:spin');
    this.cardSpinT = 0;
    this.cardWin = null;
    this.cardWinT = 0;
    this._flipped = {};
    this.spinning = true;
    this.msg('FLIPPING…');
  }

  // canvas tap (scene coords)
  onTap(x, y) {
    if (!this.visible || this.spinning) return;
    if (this.game === 'cards') {
      for (let i = 0; i < 4; i++) {
        const r = this.cardRect(i);
        if (x >= r.x - 6 && x <= r.x + r.w + 6 && y >= r.y - 6 && y <= r.y + r.h + 6) {
          this.cardPick = i;
          this.msg(`PICKED CARD ${i + 1}`);
          this.G.events.push('cas:pick');
          return;
        }
      }
    } else if (this.game === 'roulette') {
      const dx = x - SCR_C.x, dy = y - SCR_C.y;
      const d = Math.hypot(dx, dy);
      if (d < 82 && d > 20) {
        let a = Math.atan2(dy, dx) - this.wheelAngle;
        while (a < 0) a += Math.PI * 2;
        const i = Math.floor(a / (Math.PI / 6)) % 12;
        const id = 'slot:' + i;
        this.toggleRtBet(id);
      }
    }
  }

  // ---------------- per-game resolution ----------------
  resolveSlots() {
    const s = this.G.state;
    const B = this.bet;
    const L = C.slots.lineForBet[B];
    const stake = B / L;
    const wins = [];
    let total = 0;
    for (let li = 0; li < L; li++) {
      const rows = SLOT_LINES[li];
      const syms = rows.map((r, c) => this.grid[c][r]);
      const counts = {};
      for (const k of syms) counts[k] = (counts[k] || 0) + 1;
      const triple = syms[0] === syms[1] && syms[1] === syms[2];
      const pairKey = Object.keys(counts).find((k) => counts[k] === 2);
      let w = 0;
      if (triple) {
        const def = C.slots.symbols.find((d) => d.key === syms[0]);
        w = def.pay * stake;
      } else if (pairKey) {
        w = C.slots.pairPay * stake;
      }
      if (w > 0) {
        const lucky = syms.some((k) => k === this.luckyKey());
        if (lucky) w *= C.slots.luckyMul;
        wins.push({ rows, key: triple ? syms[0] : pairKey, win: w, lucky, triple });
        total += w;
      }
    }
    const win = Math.round(total);
    this.lineWins = wins;
    this.slotsWinT = 0;
    this.spinning = false;
    if (win > 0) {
      changeCoins(s, win, this.G.events);
      playGame(s, true, this.G.events);
      this.msg(`WIN +${win}${this.lineWins.some((w) => w.lucky) ? ' · LUCKY ×1.2' : ''}!`);
      if (this.lineWins.some((w) => w.triple && w.key === 'seven')) {
        this.G.events.push('cas:jackpot');
        s.life.jackpots = (s.life.jackpots || 0) + 1;
        this.freeSpin = true; // jackpot bonus (S15)
      }
    } else {
      playGame(s, false, this.G.events);
      this.msg('SO CLOSE…');
    }
    this.syncDom();
  }

  resolveRoulette() {
    const s = this.G.state;
    const B = this.bet;
    const w = this.winnerSeg;
    const wColor = w % 3;
    const wForm = Math.floor(w / 3) % 4;
    const wins = [];
    let total = 0;
    for (const b of this.rtBets) {
      const [type, idxS] = b.split(':');
      const idx = Number(idxS);
      let p = 0;
      if (type === 'color' && idx === wColor) p = C.roulette.payColor;
      else if (type === 'form' && idx === wForm) p = C.roulette.payForm;
      else if (type === 'slot' && idx === w) p = C.roulette.paySlot;
      if (p > 0) { wins.push({ bet: b, win: B * p }); total += B * p; }
    }
    this.rtWin = wins;
    this.rtWinT = 0;
    this.spinning = false;
    const win = total;
    if (win > 0) {
      changeCoins(s, win, this.G.events);
      playGame(s, true, this.G.events);
      this.msg(`WIN +${win}!`);
      if (win >= 12 * B) this.G.events.push('cas:jackpot');
    } else {
      playGame(s, false, this.G.events);
      this.msg('THE HOUSE WINS…');
    }
    this.syncDom();
  }

  resolveCards() {
    const s = this.G.state;
    const B = this.bet;
    const vals = this.cards.map((i) => C.cards.ranks[i].v);
    const maxV = Math.max(...vals);
    const top = vals.map((v, i) => (v === maxV ? i : -1)).filter((i) => i >= 0);
    if (top.length > 1) {
      // tie for highest -> push
      changeCoins(s, B, this.G.events);
      this.cardWin = { push: true, cards: top, win: B };
      this.cardWinT = 0;
      this.spinning = false;
      this.msg('TIE · PUSH');
      this.G.events.push('cas:push');
    } else {
      const winner = top[0];
      const win = winner === this.cardPick ? C.cards.pay * B : 0;
      if (win > 0) {
        changeCoins(s, win, this.G.events);
        playGame(s, true, this.G.events);
        this.msg(`WIN +${win}!`);
        this.G.events.push('cas:jackpot');
      } else {
        playGame(s, false, this.G.events);
        this.msg('THE HOUSE WINS…');
      }
      this.cardWin = { push: false, winner, win };
      this.cardWinT = 0;
      this.spinning = false;
    }
    this.syncDom();
  }

  // ---------------- update ----------------
  update(dt) {
    if (!this.visible) return;
    this.t += dt;
    const s = this.G.state;

    if (this.game === 'slots' && this.spinning) {
      for (let i = 0; i < 3; i++) {
        if (this.reelDone[i]) { this.reelBounce[i] += dt; continue; }
        this.reelT[i] += dt;
        this.blurT[i] += dt;
        if (this.blurT[i] > 0.07) {
          this.blurT[i] = 0;
          this.blurCells[i] = [0, 1, 2].map(() => C.slots.symbols[Math.floor(Math.random() * C.slots.symbols.length)].key);
        }
        if (this.reelT[i] >= C.slots.reelStopMs[i] / 1000) {
          this.reelDone[i] = true;
          this.reelBounce[i] = 0.0001;
        }
      }
      if (this.reelDone.every(Boolean)) this.resolveSlots();
    } else if (this.game === 'slots') {
      this.slotsWinT += dt;
    }

    if (this.game === 'roulette') {
      const dur = C.roulette.spinMs / 1000;
      if (this.wheelSpin) {
        this.wheelSpin.t += dt;
        const p = easeOutCubic(this.wheelSpin.t / dur);
        this.wheelAngle = this.wheelSpin.from + (this.wheelSpin.to - this.wheelSpin.from) * p;
      }
      if (this.ballSpin) {
        this.ballSpin.t += dt;
        const p = easeOutQuart(this.ballSpin.t / dur);
        this.ballAngle = this.ballSpin.from + (this.ballSpin.to - this.ballSpin.from) * p;
        if (this.ballSpin.t >= dur) this.ballSpin = null;
      }
      if (this.wheelSpin && this.wheelSpin.t >= dur) this.wheelSpin = null;
      if (this.spinning && !this.wheelSpin && !this.ballSpin) this.resolveRoulette();
      this.rtWinT += dt;
    }

    if (this.game === 'cards') {
      if (this.spinning) {
        this.cardSpinT += dt;
        const start = (i) => 0.12 * i;
        const dur = 0.35;
        for (let i = 0; i < 4; i++) { // M7: flip sfx as each card turns
          const key = 'f' + i;
          if (!this._flipped[key] && this.cardSpinT >= start(i) + dur * 0.5) {
            this._flipped[key] = true;
            if (this.G.audio) this.G.audio.sfx('card', { vol: 0.5, rate: 1 + i * 0.07 });
          }
        }
        if (this.cardSpinT >= start(3) + dur + 0.15) this.resolveCards();
      }
      this.cardWinT += dt;
    }

    const el = document.getElementById('casino-coins-v');
    if (el && s) el.textContent = s.day.coins;
  }

  // ---------------- card geometry ----------------
  cardRect(i) {
    const w = 38, h = 52, gap = 12;
    const x0 = SCR_C.x - (4 * w + 3 * gap) / 2;
    return { x: x0 + i * (w + gap), y: SCR_C.y - h / 2, w, h };
  }

  // ---------------- draw ----------------
  draw(ctx, dt) {
    if (!this.visible) return;
    this.bakeArt(ctx);
    const img = this.G.img.get('cabinet');
    if (img) ctx.drawImage(img, C.cabinet.x, C.cabinet.y);
    // pointer triangle (roulette) / idle sparkle
    ctx.save();
    roundRectPath(ctx, SCR.x, SCR.y, SCR.w, SCR.h, 8);
    ctx.clip();
    if (this.game === 'slots') this.drawSlots(ctx);
    else if (this.game === 'roulette') this.drawRoulette(ctx);
    else this.drawCards(ctx);
    ctx.restore();
  }

  bakeArt(ctx) {
    if (this.sevenImg) return;
    // seven symbol
    const cv = document.createElement('canvas');
    cv.width = 44; cv.height = 44;
    const c = cv.getContext('2d');
    c.font = '26px "Press Start 2P", monospace';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.lineWidth = 5;
    c.strokeStyle = '#3d2b23';
    c.strokeText('7', 22, 26);
    c.fillStyle = '#f7c948';
    c.fillText('7', 22, 26);
    this.sevenImg = cv;
  }

  slotSymbolImg(key) {
    if (key === 'seven') return this.sevenImg;
    const def = C.slots.symbols.find((d) => d.key === key);
    if (!def || !def.art) return null;
    if (def.art.startsWith('chibi:')) return this.G.img.get('chibi_eevee_n');
    return this.G.img.get(def.art.replace(/\.png$/i, ''));
  }

  drawSlots(ctx) {
    const cell = 52;
    const x0 = SCR_C.x - cell * 1.5;
    const y0 = SCR_C.y - cell * 1.5;
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 3; row++) {
        const x = x0 + col * cell, y = y0 + row * cell;
        roundRectPath(ctx, x + 2, y + 2, cell - 4, cell - 4, 6);
        ctx.fillStyle = 'rgba(255,246,227,0.12)';
        ctx.fill();
        let key;
        if (this.spinning && !this.reelDone[col]) {
          key = (this.blurCells[col][row] || C.slots.symbols[0].key);
        } else if (this.grid) {
          key = this.grid[col][row];
        } else {
          key = null;
        }
        if (key) {
          let sc = 1;
          if (this.reelDone[col] && this.reelBounce[col] > 0 && this.reelBounce[col] < 0.25 && this.grid) {
            sc = 1 + 0.25 * Math.sin((this.reelBounce[col] / 0.25) * Math.PI);
          }
          const im = this.slotSymbolImg(key);
          if (im) {
            const sz = 38 * sc;
            ctx.drawImage(im, x + cell / 2 - sz / 2, y + cell / 2 - sz / 2, sz, sz);
          }
        }
      }
    }
    // winning line highlights
    if (this.lineWins && this.lineWins.length) {
      const glow = 0.75 + 0.25 * Math.sin(this.slotsWinT * 6);
      for (const w of this.lineWins) {
        const pts = w.rows.map((r, c) => ({ x: x0 + c * cell + cell / 2, y: y0 + r * cell + cell / 2 }));
        ctx.strokeStyle = `rgba(247,201,72,${glow})`;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[2].x, pts[2].y);
        ctx.stroke();
        for (const p of pts) {
          roundRectPath(ctx, p.x - cell / 2 + 4, p.y - cell / 2 + 4, cell - 8, cell - 8, 8);
          ctx.strokeStyle = `rgba(247,201,72,${glow})`;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }
    }
  }

  drawRoulette(ctx) {
    const cx = SCR_C.x, cy = SCR_C.y, R = 74;
    const N = 12;
    const segA = (Math.PI * 2) / N;
    const colorHex = ['#e05252', '#5272e0', '#52b45a'];
    // wheel
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.wheelAngle);
    for (let i = 0; i < N; i++) {
      const a0 = i * segA, a1 = (i + 1) * segA;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R, a0, a1);
      ctx.closePath();
      ctx.fillStyle = colorHex[i % 3];
      ctx.fill();
      ctx.strokeStyle = '#3d2b23';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    // faces + numbers
    for (let i = 0; i < N; i++) {
      const mid = i * segA + segA / 2;
      const form = C.roulette.forms[Math.floor(i / 3) % 4];
      const chibi = this.G.img.get('chibi_' + form + '_n');
      ctx.save();
      ctx.rotate(mid);
      if (chibi) ctx.drawImage(chibi, 30 - 12, 0 - 12, 24, 24);
      ctx.fillStyle = '#fff';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), 64, 0);
      ctx.restore();
    }
    // hub
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#fff6e3';
    ctx.fill();
    ctx.strokeStyle = '#3d2b23';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // bet indicators (static ring marks)
    for (const b of this.rtBets) {
      const [type, idxS] = b.split(':');
      const idx = Number(idxS);
      ctx.strokeStyle = 'rgba(247,201,72,0.9)';
      ctx.lineWidth = 4;
      if (type === 'slot') {
        const mid = idx * segA + segA / 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(mid + this.wheelAngle) * (R - 6), cy + Math.sin(mid + this.wheelAngle) * (R - 6), 5, 0, Math.PI * 2);
        ctx.fillStyle = '#f7c948';
        ctx.fill();
        ctx.stroke();
      } else if (type === 'color') {
        for (let i = idx; i < N; i += 3) {
          const a0 = i * segA + this.wheelAngle + 0.03;
          const a1 = (i + 1) * segA + this.wheelAngle - 0.03;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a0) * (R + 5), cy + Math.sin(a0) * (R + 5));
          ctx.arc(cx, cy, R + 5, a0, a1);
          ctx.stroke();
        }
      }
    }
    // winning segment pulse
    if (this.rtWin && this.rtWin.length) {
      const glow = 0.5 + 0.5 * Math.sin(this.rtWinT * 6);
      const a0 = this.winnerSeg * segA, a1 = (this.winnerSeg + 1) * segA;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.wheelAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R, a0, a1);
      ctx.closePath();
      ctx.strokeStyle = `rgba(247,201,72,${glow})`;
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.restore();
    }

    // pointer
    ctx.fillStyle = '#f7c948';
    ctx.strokeStyle = '#3d2b23';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - R - 8);
    ctx.lineTo(cx - 8, cy - R - 22);
    ctx.lineTo(cx + 8, cy - R - 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // ball
    const bR = R - 14;
    const bx = cx + Math.cos(this.ballAngle) * bR;
    const by = cy + Math.sin(this.ballAngle) * bR;
    ctx.beginPath();
    ctx.arc(bx, by, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#3d2b23';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(bx - 2, by - 2, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#c9c9c9';
    ctx.fill();
  }

  drawCards(ctx) {
    for (let i = 0; i < 4; i++) {
      const r = this.cardRect(i);
      // flip progress: 1 (down/back) -> 0 (up/face)
      let p = 1;
      if (this.game === 'cards' && this.spinning) {
        const start = 0.12 * i, dur = 0.35;
        p = 1 - easeOutCubic((this.cardSpinT - start) / dur);
      } else if (this.game === 'cards' && this.cardSpinT >= 0.12 * 3 + 0.35) {
        p = 0;
      }
      const scaleX = Math.max(0.06, Math.abs(Math.cos(p * Math.PI)));
      const faceUp = p < 0.5;
      const rankIdx = this.cards ? this.cards[i] : i;
      const faceIm = this.G.img.get(CARD_ART[rankIdx]);
      const backIm = this.G.img.get('card_back');
      ctx.save();
      ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
      ctx.scale(scaleX, 1);
      if (faceUp && faceIm) {
        ctx.drawImage(faceIm, -r.w / 2, -r.h / 2, r.w, r.h);
      } else if (!faceUp && backIm) {
        ctx.drawImage(backIm, -r.w / 2, -r.h / 2, r.w, r.h);
      } else {
        // fallback (art missing)
        roundRectPath(ctx, -r.w / 2, -r.h / 2, r.w, r.h, 6);
        ctx.fillStyle = faceUp ? '#fff6e3' : '#f78fb3';
        ctx.fill();
        ctx.strokeStyle = '#3d2b23';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#3d2b23';
        ctx.font = '11px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(faceUp ? C.cards.ranks[rankIdx].k : '?', 0, 0);
      }
      ctx.restore();
      // pick marker
      if (this.game === 'cards' && i === this.cardPick && !this.spinning) {
        const bob = Math.sin(this.t * 5) * 3;
        ctx.fillStyle = '#f7c948';
        ctx.strokeStyle = '#3d2b23';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(r.x + r.w / 2, r.y - 14 + bob);
        ctx.lineTo(r.x + r.w / 2 - 8, r.y - 24 + bob);
        ctx.lineTo(r.x + r.w / 2 + 8, r.y - 24 + bob);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      // result glow
      if (this.cardWin && !this.spinning) {
        const isWin = this.cardWin.push ? this.cardWin.cards.includes(i) : i === this.cardWin.winner;
        if (isWin) {
          const glow = 0.5 + 0.5 * Math.sin(this.cardWinT * 6);
          roundRectPath(ctx, r.x - 3, r.y - 3, r.w + 6, r.h + 6, 8);
          ctx.strokeStyle = `rgba(247,201,72,${glow})`;
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      }
    }
  }

  // ---------------- instant rounds (dev / RTP harness) ----------------
  spinInstant(game, n = 1, opts = {}) {
    const wasVisible = this.visible;
    this.game = game;
    this.visible = false;
    let totalBet = 0, totalWin = 0;
    const ev = [];
    for (let r = 0; r < n; r++) {
      const s = this.G.state;
      const B = opts.bet || this.bet;
      if (game === 'slots') {
        const L = C.slots.lineForBet[B];
        const stake = B / L;
        let forced = rng.takeForce('slots');
        this.grid = [0, 1, 2].map(() => [0, 1, 2].map(() => rng.weighted(C.slots.symbols, 'w').key));
        // grid[col][row]: middle row = 777, other cells all distinct (clean jackpot)
        if (forced === 'jackpot') this.grid = [['ball', 'seven', 'eevee'], ['heart', 'seven', 'ball'], ['oran', 'seven', 'heart']];
        let win = 0;
        for (let li = 0; li < L; li++) {
          const rows = SLOT_LINES[li];
          const syms = rows.map((rw, c) => this.grid[c][rw]);
          const counts = {};
          for (const k of syms) counts[k] = (counts[k] || 0) + 1;
          const triple = syms[0] === syms[1] && syms[1] === syms[2];
          const pairKey = Object.keys(counts).find((k) => counts[k] === 2);
          let w = 0;
          if (triple) w = C.slots.symbols.find((d) => d.key === syms[0]).pay * stake;
          else if (pairKey) w = C.slots.pairPay * stake;
          if (w > 0 && syms.some((k) => k === this.luckyKey())) w *= C.slots.luckyMul;
          win += w;
        }
        const winR = Math.round(win);
        totalBet += B; totalWin += winR;
        changeCoins(s, -B, ev);
        if (winR > 0) { changeCoins(s, winR, ev); playGame(s, true, ev); }
        else playGame(s, false, ev);
      } else if (game === 'roulette') {
        const bets = opts.bets || ['color:0'];
        const total = B * bets.length;
        const w = rng.int(0, 11);
        const wColor = w % 3, wForm = Math.floor(w / 3) % 4;
        let win = 0;
        for (const b of bets) {
          const [type, idxS] = b.split(':');
          const idx = Number(idxS);
          if (type === 'color' && idx === wColor) win += B * C.roulette.payColor;
          else if (type === 'form' && idx === wForm) win += B * C.roulette.payForm;
          else if (type === 'slot' && idx === w) win += B * C.roulette.paySlot;
        }
        totalBet += total; totalWin += win;
        changeCoins(s, -total, ev);
        if (win > 0) { changeCoins(s, win, ev); playGame(s, true, ev); }
        else playGame(s, false, ev);
      } else if (game === 'cards') {
        this.cards = rng.shuffle([0, 1, 2, 3]);
        const pick = opts.pick !== undefined ? opts.pick : rng.int(0, 3);
        const vals = this.cards.map((i) => C.cards.ranks[i].v);
        const maxV = Math.max(...vals);
        const top = vals.map((v, i) => (v === maxV ? i : -1)).filter((i) => i >= 0);
        let win = 0;
        if (top.length === 1 && top[0] === pick) win = C.cards.pay * B;
        if (top.length > 1) win = B; // push
        totalBet += B; totalWin += win;
        changeCoins(s, -B, ev);
        if (top.length > 1) changeCoins(s, B, ev);
        else if (win > 0) { changeCoins(s, win, ev); playGame(s, true, ev); }
        else playGame(s, false, ev);
      }
    }
    this.visible = wasVisible;
    return { totalBet, totalWin, net: totalWin - totalBet, rtp: totalBet ? totalWin / totalBet : 0 };
  }
}
