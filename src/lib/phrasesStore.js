import { supabase } from "./supabase.js";
import { store } from "./store.js";

const LOCAL_KEY = "jp_custom_phrases";

// ── Local (signed-out) storage ──────────────────────────────────────────────
async function loadLocal() {
  const v = await store.get(LOCAL_KEY);
  if (!v) return [];
  try { return JSON.parse(v); } catch { return []; }
}

async function saveLocal(phrases) {
  await store.set(LOCAL_KEY, JSON.stringify(phrases));
}

// ── Unified API: branches on whether a user is signed in ────────────────────
// A "phrase" is { id, en, segs }.

export async function loadPhrases(session) {
  if (supabase && session) {
    const { data, error } = await supabase
      .from("custom_phrases")
      .select("id, en, segs, created_at")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data.map(r => ({ id: r.id, en: r.en, segs: r.segs }));
  }
  return loadLocal();
}

export async function addPhrase(session, phrase) {
  if (supabase && session) {
    const { data, error } = await supabase
      .from("custom_phrases")
      .insert({ user_id: session.user.id, en: phrase.en, segs: phrase.segs })
      .select("id, en, segs")
      .single();
    if (error) throw error;
    return { id: data.id, en: data.en, segs: data.segs };
  }
  const local = await loadLocal();
  const newPhrase = { ...phrase, id: "c_" + Date.now() };
  await saveLocal([...local, newPhrase]);
  return newPhrase;
}

export async function removePhrase(session, id) {
  if (supabase && session) {
    const { error } = await supabase.from("custom_phrases").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const local = await loadLocal();
  await saveLocal(local.filter(p => p.id !== id));
}

// Runs after sign-in: pushes any phrases saved while signed out up to the cloud,
// then clears local so they aren't migrated twice. No-op if nothing is stored
// locally, so it's safe to call on every session.
export async function migrateLocalToCloud(session) {
  if (!supabase || !session) return;
  const local = await loadLocal();
  if (local.length === 0) return;
  const rows = local.map(p => ({ user_id: session.user.id, en: p.en, segs: p.segs }));
  const { error } = await supabase.from("custom_phrases").insert(rows);
  if (!error) await saveLocal([]);
}
