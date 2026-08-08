-- Felix Birthday – Supabase Schema
--
-- Einmal komplett in den Supabase SQL-Editor kopieren und ausführen
-- (Projekt-Dashboard → SQL Editor → New query → einfügen → Run).
--
-- Legt an:
--   1. Tabelle "songs" (Musikwünsche + Likes) inkl. RLS-Policies
--   2. Sichere RPC-Funktion zum Erhöhen der Likes (kein offenes UPDATE nötig)
--   3. Seed-Daten (die ursprünglichen 3 Beispiel-Songs)


/* ---------- SONGS ---------- */

create table if not exists public.songs (
  id bigint generated always as identity primary key,
  text text not null check (char_length(text) between 1 and 200),
  likes integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.songs enable row level security;

drop policy if exists "Songs sind oeffentlich lesbar" on public.songs;
create policy "Songs sind oeffentlich lesbar"
  on public.songs for select
  to anon
  using (true);

drop policy if exists "Jeder darf einen Song vorschlagen" on public.songs;
create policy "Jeder darf einen Song vorschlagen"
  on public.songs for insert
  to anon
  with check (true);

-- Kein offenes UPDATE für die anon-Rolle (sonst könnte jeder auch den
-- Song-Text verändern) – stattdessen eine begrenzte, sichere Funktion:
create or replace function public.increment_song_likes(song_id bigint)
returns void
language sql
security definer
set search_path = public
as $$
  update public.songs set likes = likes + 1 where id = song_id;
$$;

grant execute on function public.increment_song_likes(bigint) to anon;

-- Seed-Daten, damit die Wishlist wie im ursprünglichen Design startet
insert into public.songs (text, likes)
select * from (
  values
    ('The Weeknd – Blinding Lights', 12),
    ('One Dance', 9),
    ('The Business', 7)
) as seed(text, likes)
where not exists (select 1 from public.songs);
