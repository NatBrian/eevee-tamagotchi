// scene.js — canvas world compositor.
// Static meadow (sky/far/grass/decor) is pre-rendered once per (sky variant, decor set)
// into an offscreen layer; per frame = one big blit + dynamic elements. (BUILD_PLAN §5)
import { CFG, A } from './config.js';
import { skyVariantOf, isNight } from './state.js';

const W = CFG.W, H = CFG.H;
const EXT = 220; // scene extends beyond logical bounds (cover-fit crop)
const Q = 2;     // static layer supersample

// deterministic decorative randomness (independent of game RNG)
function hash2(x, y, seed) {
  let h = seed + x * 374761393 + y * 668265263;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export class Scene {
  constructor(img) {
    this.img = img;
    this.s = 1; this.dpr = 1;
    this.vx0 = -EXT; this.vx1 = W + EXT; this.vy0 = -EXT; this.vy1 = H + EXT;
    this.stars = [];
    for (let i = 0; i < 46; i++) {
      this.stars.push({ x: -EXT + hash2(i, 1, 99) * (W + EXT * 2), y: -40 + hash2(i, 2, 99) * 400, ph: hash2(i, 3, 99) * 6.28, sz: 1 + hash2(i, 4, 99) * 1.6 });
    }
    this.fireflies = [];
    for (let i = 0; i < 7; i++) {
      this.fireflies.push({ x: 40 + hash2(i, 5, 5) * 350, y: 520 + hash2(i, 6, 5) * 320, ph: hash2(i, 7, 5) * 6.28, sp: 0.4 + hash2(i, 8, 5) * 0.7 });
    }
    this._static = null;
    this._staticKey = null;
    this.t = 0;
  }

  setViewport(cssW, cssH, dpr) {
    this.cssW = cssW; this.cssH = cssH; this.dpr = dpr;
    this.s = Math.max(cssW / W, cssH / H);
    const offX = (cssW - W * this.s) / 2, offY = (cssH - H * this.s) / 2;
    this.offX = offX; this.offY = offY;
    this.vx0 = offX / this.s - 4; this.vx1 = (cssW - offX) / this.s + 4;
    this.vy0 = offY / this.s - 4; this.vy1 = (cssH - offY) / this.s + 4;
  }

  begin(ctx) {
    const { s, dpr, offX, offY } = this;
    ctx.setTransform(s * dpr, 0, 0, s * dpr, offX * dpr, offY * dpr);
    ctx.imageSmoothingEnabled = false;
  }

  _img(name) { return this.img.get(String(name).replace(/\.png$/i, '')); }

  // ---------------- static layer ----------------
  buildStatic(variant, state) {
    const decorKey = (state.shop.decor || []).join(',');
    const key = variant + '|' + decorKey;
    if (this._static && this._staticKey === key) return this._static;

    const B = CFG.BANDS;
    const ox = -EXT, oy = -EXT, ow = W + EXT * 2, oh = H + EXT * 2;
    const c = document.createElement('canvas');
    c.width = Math.round(ow * Q); c.height = Math.round(oh * Q);
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.scale(Q, Q);
    g.translate(-ox, -oy);

    const px = (n) => Math.round(n);

    // sky: banded pixel-art gradient + sun/moon + soft cloud tile
    {
      const SKY_BANDS = {
        day: ['#69b7e8', '#86cdf1', '#aee0f8', '#d4effc'],
        sunset: ['#5d77b8', '#9a6f9e', '#e8895c', '#f7c948'],
        night: ['#101638', '#1b2350', '#2b3768', '#40517e'],
      };
      const b = SKY_BANDS[variant] || SKY_BANDS.day;
      const skyTop = oy, skyH = B.far[1] - oy;
      for (let i = 0; i < b.length; i++) {
        g.fillStyle = b[i];
        g.fillRect(ox, skyTop + (skyH / b.length) * i, ow, skyH / b.length + 1);
      }
      // sun / moon
      if (variant === 'day') {
        g.fillStyle = 'rgba(255,240,170,0.5)';
        g.beginPath(); g.arc(330, 130, 46, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#ffe9a0';
        g.beginPath(); g.arc(330, 130, 34, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#fff6d0';
        g.beginPath(); g.arc(330, 130, 24, 0, Math.PI * 2); g.fill();
      } else if (variant === 'night') {
        g.fillStyle = 'rgba(230,238,255,0.25)';
        g.beginPath(); g.arc(330, 130, 42, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#eef2f8';
        g.beginPath(); g.arc(330, 130, 30, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#cdd6e8';
        g.beginPath(); g.arc(320, 122, 7, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.arc(340, 140, 5, 0, Math.PI * 2); g.fill();
      } else {
        g.fillStyle = 'rgba(255,200,120,0.55)';
        g.beginPath(); g.arc(215, 330, 40, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#ffcf7a';
        g.beginPath(); g.arc(215, 330, 30, 0, Math.PI * 2); g.fill();
      }
      // soft clouds from the white cloud tile
      const tile = this._img('sky_' + variant);
      const p = CFG.TILES.sky;
      if (tile) {
        g.globalAlpha = variant === 'night' ? 0.08 : variant === 'sunset' ? 0.18 : 0.30;
        for (let r = Math.floor(oy / p); r * p < B.far[1]; r++)
          for (let col = Math.floor(ox / p); col * p < ox + ow; col++)
            g.drawImage(tile, col * p, r * p, p, p);
        g.globalAlpha = 1;
      }
    }
    // far meadow
    {
      const p = CFG.TILES.far;
      const imgs = [this._img('meadow_far_0'), this._img('meadow_far_1')];
      const rowA = this._farRow(0), rowB = this._farRow(1);
      for (let r = 0; r < 2; r++) {
        const row = r === 0 ? rowA : rowB;
        for (let col = Math.floor(ox / p); col * p < ox + ow; col++) {
          const v = row[((col % 20) + 20) % 20];
          if (imgs[v]) g.drawImage(imgs[v], col * p, B.far[0] + r * p, p, p);
        }
      }
      g.fillStyle = '#7fb75f';
      g.fillRect(ox, B.far[1] - 2, ow, 3);
    }
    // grass — natural meadow: soft depth gradient + organically scattered tufts
    {
      const g0 = B.grass[0];            // 470 (horizon of the field)
      const g1 = oy + oh;               // bottom of the static canvas
      const topC = [94, 198, 108];      // fresh green near the horizon
      const botC = [54, 150, 70];       // richer green toward the viewer
      const NB = 9;
      for (let i = 0; i < NB; i++) {
        const t = i / (NB - 1);
        const r = Math.round(topC[0] + (botC[0] - topC[0]) * t);
        const gg = Math.round(topC[1] + (botC[1] - topC[1]) * t);
        const b = Math.round(topC[2] + (botC[2] - topC[2]) * t);
        g.fillStyle = `rgb(${r},${gg},${b})`;
        g.fillRect(ox, g0 + ((g1 - g0) / NB) * i, ow, (g1 - g0) / NB + 1);
      }
      // gentle light pools (sun-kissed patches) for life
      for (let i = 0; i < 9; i++) {
        const px2 = ox + 20 + hash2(i, 41, 77) * (ow - 40);
        const py2 = g0 + 30 + hash2(i, 42, 77) * (g1 - g0 - 60);
        const pr = 26 + hash2(i, 43, 77) * 46;
        const grd = g.createRadialGradient(px2, py2, 2, px2, py2, pr);
        grd.addColorStop(0, 'rgba(255,255,200,0.10)');
        grd.addColorStop(1, 'rgba(255,255,200,0)');
        g.fillStyle = grd;
        g.beginPath(); g.arc(px2, py2, pr, 0, Math.PI * 2); g.fill();
      }
      // scatter grass tufts (organic, non-grid)
      const tufts = [this._img('tuft_0'), this._img('tuft_1')].filter(Boolean);
      if (tufts.length) {
        const step = 27;
        for (let gy = g0 - 6; gy < g1 - 4; gy += step) {
          for (let gx = ox; gx < ox + ow; gx += step) {
            const cx = Math.round(gx), cy = Math.round(gy);
            if (hash2(cx, cy, 31) >= 0.52) continue;
            const jx = gx + (hash2(cx, cy, 32) - 0.5) * 22;
            const jy = gy + (hash2(cx, cy, 33) - 0.5) * 16;
            const im = tufts[Math.floor(hash2(cx, cy, 34) * tufts.length)];
            const sc = 0.8 + hash2(cx, cy, 35) * 0.85;
            const sz = 18 * sc;
            g.drawImage(im, Math.round(jx - sz / 2), Math.round(jy - sz * 0.92), Math.round(sz), Math.round(sz));
          }
        }
      }
    }
    // decor (defaults + shop), sorted by y
    const decor = [];
    for (const d of CFG.DECOR_DEFAULT) decor.push({ ...d });
    for (const k of (state.shop.decor || [])) {
      if (k === 'bed') continue; // bed has its own aspect-correct renderer below
      const pos = CFG.SHOP_DECOR_POS[k];
      const item = CFG.SHOP.decor.find((i) => i.key === k);
      if (pos && item) decor.push({ art: item.art, x: pos.x, y: pos.y, s: pos.s });
    }
    decor.sort((a, b) => a.y - b.y);
    for (const d of decor) {
      const im = this._img(d.art);
      if (!im) continue;
      const size = (im.naturalWidth || 18) * d.s;
      g.drawImage(im, px(d.x - size / 2), px(d.y - size / 2), size, size);
    }
    // pet bed (when owned)
    if ((state.shop.owned || []).includes('bed') || (state.shop.decor || []).includes('bed')) {
      const im = this._img('petbed');
      if (im) {
        const pos = CFG.SHOP_DECOR_POS.bed;
        g.drawImage(im, pos.x - 75, pos.y - 37, 150, 74);
      }
    }

    this._static = c;
    this._staticKey = key;
    return c;
  }

  _farRow(r) {
    if (!this._farRows) {
      this._farRows = [];
      for (let r = 0; r < 3; r++) { const row = []; for (let c = 0; c < 20; c++) row.push(hash2(c, r, 7) < 0.5 ? 0 : 1); this._farRows.push(row); }
    }
    return this._farRows[((r % 3) + 3) % 3];
  }

  // ---------------- per-frame render ----------------
  render(ctx, state, pet, fx, dt) {
    this.t += dt;
    const B = CFG.BANDS;
    const variant = skyVariantOf(state.total, state.shop.theme);
    const night = isNight(state.total, state.shop.theme);

    // static meadow (one blit)
    const st = this.buildStatic(variant, state);
    ctx.drawImage(
      st,
      (this.vx0 - -EXT) * Q, (this.vy0 - -EXT) * Q,
      (this.vx1 - this.vx0) * Q, (this.vy1 - this.vy0) * Q,
      this.vx0, this.vy0, this.vx1 - this.vx0, this.vy1 - this.vy0
    );

    // night overlay + stars + fireflies
    if (night) {
      ctx.fillStyle = 'rgba(30,40,95,0.30)';
      ctx.fillRect(this.vx0, this.vy0, this.vx1 - this.vx0, this.vy1 - this.vy0);
      for (const s of this.stars) {
        if (s.x < this.vx0 || s.x > this.vx1 || s.y > B.sky[1]) continue;
        const a = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(this.t * 1.6 + s.ph));
        ctx.globalAlpha = a;
        ctx.fillStyle = '#fff8d8';
        ctx.fillRect(Math.round(s.x), Math.round(s.y), Math.round(s.sz), Math.round(s.sz));
      }
      ctx.globalAlpha = 1;
      const starIm = this._img('star_01');
      for (const f of this.fireflies) {
        const fx2 = f.x + Math.sin(this.t * f.sp + f.ph) * 26;
        const fy2 = f.y + Math.cos(this.t * f.sp * 0.8 + f.ph) * 14;
        const a = 0.5 + 0.5 * Math.sin(this.t * 2.2 + f.ph);
        ctx.globalAlpha = 0.16 * a;
        if (starIm) ctx.drawImage(starIm, fx2 - 9, fy2 - 9, 18, 18);
        ctx.globalAlpha = a;
        ctx.fillStyle = '#ffe9a3';
        ctx.fillRect(Math.round(fx2 - 1), Math.round(fy2 - 1), 3, 3);
      }
      ctx.globalAlpha = 1;
    }

    // furballs
    for (const f of state.furballs) {
      const im = f.small ? this._img('furball_small') : this._img('furball');
      if (!im) continue;
      const bob = Math.sin(this.t * 2 + f.x) * 1.5;
      const size = f.small ? 34 : 48;
      ctx.drawImage(im, Math.round(f.x - size / 2), Math.round(f.y - size / 2 + bob), size, size);
    }

    // egg / tombstone / pet
    if (state.stage === 'egg') {
      this.drawEgg(ctx, state);
    } else if (state.ended === 'death') {
      const im = this._img('tombstone');
      if (im) {
        ctx.drawImage(im, 215 - 60, 690 - 110, 120, 146);
        ctx.fillStyle = '#fdf6e3';
        ctx.font = '10px "PressStart2P"';
        ctx.textAlign = 'center';
        ctx.fillText('R.I.P.', 215, 640);
      }
    } else if (pet) {
      pet.draw(ctx);
      if (state.sleeping) this.drawZzz(ctx, pet);
    }

    if (fx) fx.draw(ctx);
  }

  drawZzz(ctx, pet) {
    const m = pet.metrics();
    const bx = pet.x, by = pet.y - m.h + 4;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(46,36,26,0.55)';
    ctx.fillStyle = '#fff8e6';
    const N = 3, speed = 0.45;
    for (let i = 0; i < N; i++) {
      const phase = ((this.t * speed) + i / N) % 1;
      const size = 11 + phase * 13;
      const a = phase < 0.18 ? phase / 0.18 : Math.max(0, 1 - (phase - 0.18) / 0.82);
      const zx = bx + 12 + phase * 24 + Math.sin(phase * 6) * 3;
      const zy = by - 6 - phase * 42;
      ctx.globalAlpha = a;
      ctx.font = Math.round(size) + 'px "PressStart2P"';
      ctx.strokeText('z', zx, zy);
      ctx.fillText('z', zx, zy);
    }
    ctx.restore();
  }

  drawEgg(ctx, state) {
    const prog = Math.min(1, state.total / CFG.TIME.eggEnd);
    const ex = 215, ey = 620;
    const wob = state._runtime?.eggWob || 0;
    const rot = wob > 0 ? Math.sin((1 - wob / 0.35) * 14) * 0.14 * (wob / 0.35) : 0;
    const egg = this._img('egg_colored');
    if (!egg) return;
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(ex, ey + 66, 58, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(ex, ey);
    ctx.rotate(rot);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 4, 78, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
    ctx.stroke();
    const h2 = 120, w2 = 120 * 86 / 81;
    ctx.drawImage(egg, -w2 / 2, -h2 / 2 + 4, w2, h2);
    if (prog > 0.75) { const c2 = this._img('egg_crack2'); if (c2) ctx.drawImage(c2, -w2 / 2, -h2 / 2 + 4, w2, h2); }
    else if (prog > 0.4) { const c1 = this._img('egg_crack1'); if (c1) ctx.drawImage(c1, -w2 / 2, -h2 / 2 + 4, w2, h2); }
    ctx.restore();
  }
}

// ============================================================
// Fx — transient visual effects (not persisted)
// ============================================================
export class Fx {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.emotes = [];
    this.hearts = [];
    this.texts = [];
    this.eat = null;
    this.balls = [];
  }

  // Give Ball: arcing Poké Ball thrown to the pet (M6)
  ball(tx, ty) {
    this.balls.push({ x0: 215, y0: 950, tx, ty, t: 0, dur: 0.55 });
  }

  burst(x, y, kind, n, opts = {}) {
    const names = {
      confetti: ['star_01', 'star_03', 'spark_01', 'circle_01', 'symbol_01'],
      sparkle: ['spark_01', 'spark_02', 'star_01'],
      magic: ['magic_01', 'magic_02', 'star_03'],
      smoke: ['smoke_01'],
      heart: ['heart'],
    }[kind] || ['star_01'];
    // particle sprites are 512px soft glows — render them SMALL (logical px)
    const baseSize = opts.size !== undefined ? opts.size : ({ confetti: 15, sparkle: 13, magic: 20, smoke: 34, heart: 16 }[kind] || 15);
    const blend = (kind === 'sparkle' || kind === 'magic') ? 'lighter' : 'source-over';
    for (let i = 0; i < n; i++) {
      const a = opts.angle !== undefined ? opts.angle + (Math.random() - 0.5) * 0.9 : Math.random() * Math.PI * 2;
      const sp = (opts.speed || 90) * (0.5 + Math.random());
      this.particles.push({
        key: opts.key || names[i % names.length],
        x, y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (opts.up || 60),
        g: opts.g !== undefined ? opts.g : 160,
        life: 0, dur: (opts.dur || 1.2) * (0.7 + Math.random() * 0.6),
        size: baseSize * (0.7 + Math.random() * 0.9),
        blend,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 6,
      });
    }
  }

  emote(x, y, type, bubble, scale) {
    const frames = this.scene.img.getGroup('emote_' + type);
    this.emotes.push({ type, frames, frame: 0, ft: 0, t: 0, dur: 1.9, x, y, scale: scale || CFG.EMOTE_SCALE, bubble });
  }
  heart(x, y) { this.hearts.push({ x: x + (Math.random() - 0.5) * 30, y, t: 0, dur: 1.1, s: Math.random() < 0.3 ? 2 : 1 }); }
  text(x, y, str, color) { this.texts.push({ x, y, str, color: color || '#fff', t: 0, dur: 1.2 }); }
  startEat(x, y, key) {
    const im = this.scene.img.get('item_' + key);
    if (im) this.eat = { im, t: 0, dur: 1.4, x, y };
  }

  update(dt, pet, state) {
    for (const p of this.particles) { p.life += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; }
    this.particles = this.particles.filter((p) => p.life < p.dur);
    for (const e of this.emotes) { e.t += dt; e.ft += dt; if (e.ft > 0.14 && e.frames && e.frames.length > 1) { e.ft = 0; e.frame = (e.frame + 1) % e.frames.length; } }
    this.emotes = this.emotes.filter((e) => e.t < e.dur);
    for (const h of this.hearts) h.t += dt;
    this.hearts = this.hearts.filter((h) => h.t < h.dur);
    for (const t of this.texts) t.t += dt;
    this.texts = this.texts.filter((t) => t.t < t.dur);
    if (this.eat) { this.eat.t += dt; if (this.eat.t > this.eat.dur) this.eat = null; }
    for (const b of this.balls) {
      b.t += dt;
      if (b.t >= b.dur && !b.hit) {
        b.hit = true;
        this.burst(b.tx, b.ty - 8, 'sparkle', 8, { size: 11, speed: 70 });
        this.text(b.tx, b.ty - 40, '+10', '#ffe9a8');
      }
    }
    this.balls = this.balls.filter((b) => b.t < b.dur + 0.1);
    if (state && state._runtime) {
      const rt = state._runtime;
      if (rt.eggWob > 0) rt.eggWob = Math.max(0, rt.eggWob - dt);
      if (rt.eatKey && pet && !this.eat) { this.startEat(pet.x, pet.y - 10, rt.eatKey); rt.eatKey = null; }
    }
  }

  draw(ctx) {
    const g = this.scene.img;
    if (this.eat) {
      const e = this.eat;
      const k = 1 - e.t / e.dur;
      ctx.globalAlpha = Math.min(1, k * 4);
      const bob = Math.sin(e.t * 18) * 4 * (e.t < 0.9 ? 1 : 0);
      ctx.drawImage(e.im, e.x - 16, e.y - 24 + bob, 32, 32);
      ctx.globalAlpha = 1;
    }
    for (const b of this.balls) {
      const im = g.get('item_poke-ball');
      if (!im) continue;
      const k = Math.min(1, b.t / b.dur);
      const x = b.x0 + (b.tx - b.x0) * k;
      const y = b.y0 + (b.ty - b.y0) * k - Math.sin(k * Math.PI) * 170;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(b.t * 14);
      ctx.drawImage(im, -15, -15, 30, 30);
      ctx.restore();
    }
    for (const h of this.hearts) {
      const k = h.t / h.dur;
      const im = g.get(h.s === 2 ? 'heart_2x' : 'heart');
      if (!im) continue;
      ctx.globalAlpha = 1 - k;
      const y = h.y - 30 - k * 46;
      ctx.drawImage(im, h.x - 8, y, 16, 13);
    }
    ctx.globalAlpha = 1;
    for (const e of this.emotes) {
      const k = e.t / e.dur;
      const y = e.y - 26 - k * 22;
      ctx.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1;
      const im = e.frames ? e.frames[e.frame] : null;
      if (im) {
        const w = im.naturalWidth * e.scale, h2 = im.naturalHeight * e.scale;
        ctx.drawImage(im, Math.round(e.x - w / 2), Math.round(y - h2), w, h2);
      }
      if (e.bubble) {
        ctx.font = '16px VT323';
        const tw = ctx.measureText(e.bubble).width;
        const bw = tw + 18, bh = 26;
        const bx = e.x + (im ? im.naturalWidth * e.scale / 2 + 10 : 0), by = y - bh - 4;
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        roundRect(ctx, bx, by, bw, bh, 8);
        ctx.fill();
        ctx.strokeStyle = '#e8b84b'; ctx.lineWidth = 2; roundRect(ctx, bx, by, bw, bh, 8); ctx.stroke();
        ctx.fillStyle = '#7a5b4a';
        ctx.textAlign = 'left';
        ctx.fillText(e.bubble, bx + 9, by + 19);
      }
      ctx.globalAlpha = 1;
    }
    for (const p of this.particles) {
      const k = p.life / p.dur;
      const im = g.get(p.key);
      if (!im) continue;
      ctx.save();
      ctx.globalAlpha = (1 - k * k) * (p.blend === 'lighter' ? 0.85 : 0.95);
      ctx.globalCompositeOperation = p.blend || 'source-over';
      ctx.imageSmoothingEnabled = true; // soft glow (minifying 512px sprites)
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      const s = p.size;
      ctx.drawImage(im, -s / 2, -s / 2, s, s);
      ctx.restore();
    }
    for (const t of this.texts) {
      const k = t.t / t.dur;
      ctx.globalAlpha = 1 - k;
      ctx.font = '12px "PressStart2P"';
      ctx.textAlign = 'center';
      ctx.fillStyle = t.color;
      ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 3;
      ctx.strokeText(t.str, t.x, t.y - k * 40);
      ctx.fillText(t.str, t.x, t.y - k * 40);
      ctx.globalAlpha = 1;
    }
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
