-- ============================================================================
-- JapaneseApp database schema
-- Run this in the Supabase dashboard:  SQL Editor → New query → paste → Run
-- Safe to run more than once (uses "if not exists" / "drop policy if exists").
-- ============================================================================

-- Table holding each user's saved custom phrases.
create table if not exists public.custom_phrases (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users (id) on delete cascade,
  en          text        not null,                 -- English meaning
  segs        jsonb       not null,                 -- phrase segments [{t, r}]
  created_at  timestamptz not null default now()
);

-- Speeds up "give me this user's phrases" lookups.
create index if not exists custom_phrases_user_id_idx
  on public.custom_phrases (user_id);

-- ----------------------------------------------------------------------------
-- Row Level Security: each user can only see and modify their OWN rows.
-- Without this, the anon key could read everyone's data. This is the key
-- safety mechanism that makes it OK to use the anon key in the browser.
-- ----------------------------------------------------------------------------
alter table public.custom_phrases enable row level security;

drop policy if exists "select own phrases" on public.custom_phrases;
create policy "select own phrases"
  on public.custom_phrases for select
  using (auth.uid() = user_id);

drop policy if exists "insert own phrases" on public.custom_phrases;
create policy "insert own phrases"
  on public.custom_phrases for insert
  with check (auth.uid() = user_id);

drop policy if exists "delete own phrases" on public.custom_phrases;
create policy "delete own phrases"
  on public.custom_phrases for delete
  using (auth.uid() = user_id);
