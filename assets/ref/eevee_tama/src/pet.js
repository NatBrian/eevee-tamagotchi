// pet.js: PMD/chibi sprite rendering, 8-dir wander AI, depth scaling
//   · PMD forms (CFG.PMD_FORMS): true 8-direction animated sprites.
//   · Chibi forms (all others): a single detailed sprite brought to life at
//     runtime with a PER-FORM procedural gait (CFG.CHIBI_ANIM), each form
//     has its own walk cycle (hop rhythm/height, lean, waddle, squash &
//     stretch, foot dust), its own breathing, and idle ear twitches, so no
//     form ever renders as a static sliding image.
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
    this._animT = 0;      // continuous anim clock (chibi hop/breathe)
    this.facing = 1;      // chibi horizontal facing: 1 = right, -1 = left
    this.form = 'eevee';
    this.shiny = false;
    this.stage = 'baby';
    this.sleeping = false;
    this.sick = false;
    this.fashion = null;      // 'bow' | 'scarf' | ...
    this.restX = 215; this.restY = 785;
    this.hasBed = false;
    this.bob = 0;
    this._walkT = 0; this._prevAir = 0;             // chibi walk cycle
    this._chRot = 0; this._chSx = 1; this._chSy = 1; this._chX = 0;  // chibi frame transform
    this._twT = 3 + Math.random() * 5; this._twP = 0; this._twSign = 1; // idle twitch
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
    if (this._syncForm !== this.form) { this._syncForm = this.form; this.resetChibi(); }
  }

  // reset the chibi gait state (form change / egg / ended)
  resetChibi() {
    this._walkT = 0; this._prevAir = 0;
    this._chRot = 0; this._chSx = 1; this._chSy = 1; this._chX = 0;
    this.bob = 0;
  }

  // -1 left, 0 up/down, 1 right
  _dirSign() {
    return this.dir.includes('left') ? -1 : this.dir.includes('right') ? 1 : 0;
  }

  // chibi walk cycle, per-form gait from CFG.CHIBI_ANIM
  walkChibi(dt, P) {
    const ds = this.depthScale();
    this._walkT += dt;
    const th = 6.2832 * P.hopHz * this._walkT;
    const air = (1 - Math.cos(th)) / 2;            // 0 = grounded, 1 = apex
    const sign = this._dirSign();
    let bob = -P.hopAmp * ds * air;
    let rot = (P.lean + P.waddle * Math.sin(th)) * sign;
    let xoff = 0;
    let sy = 1 + P.squash * (2 * air - 1);         // squash on contact, stretch at apex
    let sx = 1 - 0.5 * (sy - 1);
    switch (P.style) {
      case 'float':   bob -= 1.6 * ds; break;                                          // espeon: glides
      case 'lope':    bob *= 1.12; break;                                              // umbreon: deep bouncy lope
      case 'flutter': rot += 0.04 * Math.sin(2 * th); break;                           // leafeon: leafy wobble
      case 'skitter': rot += 0.035 * Math.sin(th + 1.5708) * sign; break;              // glaceon: quick pattering pitch
      case 'sway':    xoff = 7 * ds * Math.sin(th / 2 + 1.5708) * sign;                // sylveon: sidling sway
                sx *= 1 + 0.02 * Math.sin(2 * th); break;                              //     + ribbon shimmer
    }
    this.bob = bob;
    this._chRot = rot; this._chX = xoff; this._chSx = sx; this._chSy = sy;
    this.facing = this.dir.includes('left') ? -1 : this.dir.includes('right') ? 1 : this.facing;
    // foot dust on landing
    if (this._prevAir > 0.3 && air <= 0.3 && this.fx) {
      this.fx.burst(Math.round(this.x), Math.round(this.y) + 2, 'smoke', 2, { size: 8, speed: 12, up: 6, g: 26, dur: 0.38 });
    }
    this._prevAir = air;
  }

  // chibi idle, per-form breathing + occasional ear/head twitch
  idleChibi(dt, P) {
    const br = 6.2832 * P.breathHz * this._animT;
    this.bob = Math.sin(br) * P.breathAmp;
    this._chSy = 1 + 0.018 * Math.sin(br + 1.5708);
    this._chSx = 1 - 0.5 * (this._chSy - 1);
    this._chX = 0;
    this._twT -= dt;
    if (this._twT <= 0) {
      this._twT = P.twEvery[0] + Math.random() * (P.twEvery[1] - P.twEvery[0]);
      this._twP = 0.16;
      this._twSign = Math.random() < 0.5 ? -1 : 1;
    }
    if (this._twP > 0) {
      this._twP -= dt;
      const k = Math.max(0, this._twP) / 0.16;
      this._chRot = 0.07 * Math.sin(Math.PI * k) * this._twSign;
    } else {
      this._chRot = 0;
    }
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
    if (state.stage === 'egg' || state.ended) {
      this.state = 'idle';
      if (!CFG.PMD_FORMS.includes(this.form)) this.resetChibi();
      return;
    }
    this._animT += dt;
    // per-form gait params (null for PMD forms, they use real sprite frames)
    const P = CFG.PMD_FORMS.includes(this.form) ? null : (CFG.CHIBI_ANIM[this.form] || CFG.CHIBI_ANIM.espeon);
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
      if (P) { // gentle sleep breath (per-form rate)
        const br = 6.2832 * P.breathHz * this._animT;
        this.bob = Math.sin(br) * P.breathAmp * 0.8;
        this._chSy = 1 + 0.015 * Math.sin(br + 1.5708);
        this._chSx = 1 - 0.5 * (this._chSy - 1);
        this._chRot = 0; this._chX = 0;
      } else {
        this.bob = 0;
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
      if (this.timer <= 0) { this.pickTarget(); this.state = 'move'; this._walkT = 0; this._prevAir = 0; }
      if (P) this.idleChibi(dt, P); else this.bob = 0;
    } else {
      const dx = this.tx - this.x, dy = this.ty - this.y;
      const d = Math.hypot(dx, dy);
      if (d < 6) {
        this.state = 'idle'; this.timer = 1.5 + Math.random() * 3; this.frame = 0;
        if (P) this.idleChibi(dt, P); else this.bob = 0;
      } else {
        const speed = CFG.PET.speed * (this.stage === 'baby' ? 0.7 : this.stage === 'child' ? 0.85 : 1);
        const sp = speed * dt;
        this.x += dx / d * Math.min(sp, d);
        this.y += dy / d * Math.min(sp, d);
        this.dir = this.dirFrom(dx, dy);
        if (P) this.walkChibi(dt, P);
        else this.bob = Math.sin(this.ft * 40) * 0.6;
      }
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
    const w = Math.round(m.w), h = Math.round(m.h);
    const isChibi = !CFG.PMD_FORMS.includes(this.form);
    // shadow, shrinks as the pet lifts off the ground
    const lift = isChibi ? Math.min(1, Math.max(0, -this.bob) / 9) : 0;
    const shs = 1 - 0.16 * lift;
    ctx.fillStyle = 'rgba(0,0,0,0.20)';
    ctx.beginPath();
    ctx.ellipse(x, Math.round(this.y) + 2, m.w * 0.32 * shs, m.w * 0.09 * shs, 0, 0, Math.PI * 2);
    ctx.fill();

    const im = this.frameImage();
    if (!im) return;
    const src = (this.shiny && !isChibi) ? this.tinted(im) : im;
    let fyBase; // local y of the pet's feet
    ctx.save();
    if (isChibi) {
      // chibi: pivot at the feet so hop/lean/squash stay grounded; mirror to
      // face travel direction
      ctx.translate(x + Math.round(this._chX), feetY);
      if (this.facing < 0) ctx.scale(-1, 1);
      if (this._chRot) ctx.rotate(this._chRot);
      if (this._chSx !== 1 || this._chSy !== 1) ctx.scale(this._chSx, this._chSy);
      ctx.drawImage(src, -w / 2, -h, w, h);
      fyBase = 0; // local origin is already at the feet
    } else {
      ctx.translate(x, 0);
      ctx.drawImage(src, -w / 2, feetY - h, w, h);
      fyBase = feetY;
    }
    // fashion (rides the body transform for chibi forms)
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
        ctx.drawImage(im2, pos[0] - fw / 2, fyBase + pos[1] - fh / 2, fw, fh);
      }
    }
    ctx.restore();
  }
}
