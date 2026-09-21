// save.js — localStorage persistence (schema v1, BUILD_PLAN §8)
import { freshState } from './state.js';

const KEY = 'eevee_tama_v1';

// session-only fields that must never persist
const STRIP = new Set(['_runtime', 'frozen', 'rate']);

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.v !== 1) return null;
    return hydrate(data);
  } catch (e) { /* corrupted → fresh */ }
  return null;
}

// backfill any fields missing from a fresh-state default so older/partial saves can't break
function hydrate(data) {
  const f = freshState();
  const out = { ...f, ...data, v: 1 };
  for (const k of STRIP) delete out[k];
  for (const k of ['stats', 'pet', 'day', 'life', 'allTime', 'shop', 'settings']) {
    if (data[k] && typeof data[k] === 'object') out[k] = { ...f[k], ...data[k] };
  }
  if (!Array.isArray(out.furballs)) out.furballs = [];
  if (!out.dex || typeof out.dex !== 'object') out.dex = {};
  if (!out.medals || typeof out.medals !== 'object') out.medals = {};
  out._runtime = {};
  return out;
}

export function save(data) {
  try {
    const copy = JSON.parse(JSON.stringify(data));
    copy.v = 1;
    copy.savedAt = Date.now();
    for (const k of STRIP) delete copy[k];
    localStorage.setItem(KEY, JSON.stringify(copy));
  } catch (e) { /* storage full/blocked — non-fatal */ }
}

export function clearSave() {
  try { localStorage.removeItem(KEY); } catch (e) {}
}
