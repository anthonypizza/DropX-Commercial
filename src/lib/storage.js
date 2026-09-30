// Autosave the working deal in this browser (localStorage). Wrapped in try/catch: storage can be blocked.
const KEY = "dropx-presales-v1";
export function loadSaved() {
  try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}
export function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch { return false; }
}
export function clearSaved() { try { localStorage.removeItem(KEY); } catch {} }
