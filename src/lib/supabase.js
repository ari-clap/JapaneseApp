import { createClient } from "@supabase/supabase-js";

// These come from your .env file (and from Vercel's env vars in production).
// They are safe to expose to the browser: the anon key only grants access that
// your Row Level Security policies allow.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If the keys aren't set yet, `supabase` is null and the app falls back to
// localStorage — so nothing breaks before Supabase is configured.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseConfigured = () => supabase !== null;
