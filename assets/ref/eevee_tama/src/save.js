// save.js — localStorage persistence (schema v1, BUILD_PLAN §8)
const KEY = 'eevee_tama_v1';

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && data.v === 1) return data;
  } catch (e) { /* corrupted → fresh */ }
  return null;
}

export function save(data) {
  try {
    const copy = JSON.parse(JSON.stringify(data));
    copy.savedAt = Date.now();
    // strip runtime-only fields
    delete copy._runtime;
    localStorage.setItem(KEY, JSON.stringify(copy));
  } catch (e) { /* storage full/blocked — non-fatal */ }
}

export function clearSave() {
  try { localStorage.removeItem(KEY); } catch (e) {}
}
