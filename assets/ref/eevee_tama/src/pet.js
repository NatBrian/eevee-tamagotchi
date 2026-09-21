// pet.js — PMD/chibi sprite rendering, 8-dir wander AI, depth scaling
import { CFG, A, STAGE_SCALE } from './config.js';

const DIRS = ['down', 'up', 'left', 'right', 'down left', 'down right', 'up left', 'up right'];

export class Pet {
  constructor(img) {
    this.img = img;
    this.x = 215; this.y = 700;
    this.tx = 215; this.ty = 700;
    this.mode = 'idle';       // idle | move
    this.state = 'idle';      // idle | move | attack | hurt
    this.timer = 1.5;
    this.dir = 'down';
    this.frame = 0; this.ft = 0;
    this.form = 'eevee';
    this.shiny = false;
    this.stage = 'baby';
    this.sleeping = false;
    this.sick = false;
    this.fashion = null;      // 'bow' | 'scarf' | ...
    this.restX = 215; this.restY = 785;
    this.hasBed = false;
    this.bob = 0;
    this.sickTimer = 0;
    this._tintCache = new Map(); // shiny PMD frames, tinted once (ctx.filter is costly per-frame)
  }

  // cached hue-shifted version of a PMD frame (shiny)
  tinted(im) {
    let out = this._tintCache.get(im);
    if (!out) {
      out = document.createElement('canvas');
      out.width = im.naturalWidth; out.height = im.naturalHeight;
      const g = out.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.filter = CFG.SHINY.filter;
      g.drawImage(im, 0, 0);
      g.filter = 'none';
      this._tintCache.set(im, out);
    }
    return out;
  }

  sync(state) {
    this.form = state.form;
    this.shiny = state.shiny;
    this.stage = state.stage;
    this.sleeping = state.sleeping;
    this.sick = state.sick;
    this.fashion = state.shop.fashion;
    this.hasBed = state.shop.owned.includes('bed') || state.shop.decor.includes('bed');
    if (this.hasBed) { this.restX = 195; this.restY = 800; } else { this.restX = 215; this.restY = 785; }
  }

  // 8-way dir from velocity
  dirFrom(dx, dy) {
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (ay > ax * 1.6) return dy > 0 ? 'down' : 'up';
    if (ax > ay * 1.6) return dx > 0 ? 'right' : 'left';
    return (dy > 0 ? 'down ' : 'up ') + (dx > 0 ? 'right' : 'left');
  }

  pickTarget() {
    const P = CFG.PET;
    for (let i = 0; i < 8; i++) {
      const tx = P.x0 + Math.random() * (P.x1 - P.x0);
      const ty = P.y0 + Math.random() * (P.y1 - P.y0);
      const d = Math.hypot(tx - this.x, ty - this.y);
      if (d > 50 && d < 320) { this.tx = tx; this.ty = ty; return; }
    }
    this.tx = (P.x0 + P.x1) / 2; this.ty = (P.y0 + P.y1) / 2;
  }

  update(dt, state) {
    if (state.stage === 'egg' || state.ended) { this.state = 'idle'; return; }
    if (this.sleeping) {
      // drift to rest spot
      const dx = this.restX - this.x, dy = this.restY - this.y;
      const d = Math.hypot(dx, dy);
      if (d > 4) {
        const sp = 50 * dt;
        this.x += dx / d * Math.min(sp, d);
        this.y += dy / d * Math.min(sp, d);
        this.dir = this.dirFrom(dx, dy);
        this.state = 'move';
      } else {
        this.state = 'idle';
        this.frame = 0;
      }
      return;
    }
    this.ft += dt;
    const fps = this.state === 'move' ? 6 : 3;
    const maxF = this.frameCount(this.dir, this.state);
    if (this.ft >= 1 / fps) {
      this.ft = 0;
      this.frame = (this.frame + 1) % Math.max(1, maxF);
    }
    if (this.state === 'idle') {
      this.timer -= dt;
      if (this.timer <= 0) { this.pickTarget(); this.state = 'move'; }
    } else {
      const dx = this.tx - this.x, dy = this.ty - this.y;
      const d = Math.hypot(dx, dy);
      if (d < 6) { this.state = 'idle'; this.timer = 1.5 + Math.random() * 3; this.frame = 0; return; }
      const speed = CFG.PET.speed * (this.stage === 'baby' ? 0.7 : this.stage === 'child' ? 0.85 : 1);
      const sp = speed * dt;
      this.x += dx / d * Math.min(sp, d);
      this.y += dy / d * Math.min(sp, d);
      this.dir = this.dirFrom(dx, dy);
      this.bob = Math.sin(this.ft * 40) * 0.6;
    }
    // sick: occasional worry emote flag (UI polls)
    if (this.sick) {
      this.sickTimer -= dt;
      if (this.sickTimer <= 0) { this.sickTimer = 7 + Math.random() * 6; this._worryNow = true; }
    }
  }

  frameCount(dir, state) {
    const F = CFG.PMD_FRAMES[this.form];
    if (!F) return 6;
    const t = dir === 'down' ? F.down : F.side;
    return t[state] || 6;
  }

  depthScale() {
    const P = CFG.PET;
    const k = Math.max(0, Math.min(1, (this.y - P.y0) / (P.y1 - P.y0)));
    return P.scale0 + (P.scale1 - P.scale0) * k;
  }

  metrics() {
    const scale = STAGE_SCALE[this.stage] || 1;
    const ds = this.depthScale();
    const total = scale * ds;
    if (CFG.PMD_FORMS.includes(this.form)) {
      const h = CFG.PET.pmdPx * total;
      return { w: h, h };
    }
    const h = CFG.PET.chibiPx * total;
    return { w: h * 300 / 273, h };
  }

  frameImage() {
    if (CFG.PMD_FORMS.includes(this.form)) {
      const frames = this.img.getGroup(`pmd_${this.form}_${this.dir}_${this.state}`);
      if (!frames || !frames.length) return null;
      return frames[this.frame % frames.length];
    }
    const key = `chibi_${this.form}_${this.shiny ? 's' : 'n'}`;
    return this.img.get(key);
  }

  draw(ctx) {
    const m = this.metrics();
    const x = Math.round(this.x), feetY = Math.round(this.y + this.bob);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.20)';
    ctx.beginPath();
    ctx.ellipse(x, Math.round(this.y) + 2, m.w * 0.32, m.w * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();

    const im = this.frameImage();
    if (im) {
      const w = Math.round(m.w), h = Math.round(m.h);
      const src = (this.shiny && CFG.PMD_FORMS.includes(this.form)) ? this.tinted(im) : im;
      ctx.drawImage(src, x - w / 2, feetY - h, w, h);
    }
    // fashion
    if (this.fashion) {
      const im2 = this.img.get('fashion_' + this.fashion);
      if (im2) {
        const s = Math.max(0.5, m.w / 100);
        const fw = im2.naturalWidth * s, fh = im2.naturalHeight * s;
        const pos = {
          bow:     [0, -h * 0.92],
          scarf:   [0, -h * 0.5],
          leaflow: [0, -h * 0.95],
          star:    [w * 0.22, -h * 0.88],
        }[this.fashion] || [0, -h * 0.9];
        ctx.drawImage(im2, x + pos[0] - fw / 2, feetY + pos[1] - fh / 2, fw, fh);
      }
    }
  }
}
