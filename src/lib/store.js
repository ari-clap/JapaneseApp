// Simple key/value persistence. Falls back to localStorage in the browser.
// (Later phases will swap this for Supabase so data syncs across devices.)
export const store = {
  async get(key) {
    try { if (window?.storage?.get) { const r = await window.storage.get(key); return r?.value ?? null; } } catch {}
    try { return localStorage.getItem(key); } catch { return null; }
  },
  async set(key, val) {
    try { if (window?.storage?.set) { await window.storage.set(key, val); return; } } catch {}
    try { localStorage.setItem(key, val); } catch {}
  }
};
