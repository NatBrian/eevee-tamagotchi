// prng.js: one seeded PRNG (mulberry32) for ALL game randomness.
// Every scenario is reproducible via TamaGame.seed(n).
let _state = 123456789 >>> 0;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let rand = mulberry32(_state);

// forced-outcome queue (casino / shiny), consumed in order
const forceQueue = [];

export const rng = {
  seed(n) { _state = (n >>> 0) || 1; rand = mulberry32(_state); forceQueue.length = 0; },
  get seedValue() { return _state; },
  next() { return rand(); },
  int(lo, hi) { return lo + Math.floor(rand() * (hi - lo + 1)); },
  float(lo, hi) { return lo + rand() * (hi - lo); },
  chance(p) { return rand() < p; },
  pick(arr) { return arr[Math.floor(rand() * arr.length)]; },
  weighted(items, wKey) {
    let total = 0; for (const it of items) total += it[wKey];
    let r = rand() * total;
    for (const it of items) { r -= it[wKey]; if (r < 0) return it; }
    return items[items.length - 1];
  },
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  forceNext(entry) { forceQueue.push(entry); },
  takeForce(key) {
    for (let i = 0; i < forceQueue.length; i++) {
      const f = forceQueue[i];
      if (f[key] !== undefined) { forceQueue.splice(i, 1); return f[key]; }
    }
    return undefined;
  },
};
