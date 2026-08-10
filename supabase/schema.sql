-- Felix Birthday – Supabase Schema
--
-- Einmal komplett in den Supabase SQL-Editor kopieren und ausführen
-- (Projekt-Dashboard → SQL Editor → New query → einfügen → Run).
--
-- Legt an:
--   1. Tabelle "songs" (Musikwünsche + Likes) inkl. RLS-Policies
--   2. Sichere RPC-Funktion zum Erhöhen der Likes (kein offenes UPDATE nötig)
--   3. Seed-Daten (die ursprünglichen 3 Beispiel-Songs)
--   4. Tabelle "birthday_wishes" (Geburtstagswünsche) inkl. RLS-Policies
--   5. Storage-Bucket "photos" (öffentlich) inkl. Policies für Upload/Lesen

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


/* ---------- GEBURTSTAGSWÜNSCHE ---------- */

create table if not exists public.birthday_wishes (
  id bigint generated always as identity primary key,
  guest_name text check (
    guest_name is null
    or char_length(btrim(guest_name)) between 1 and 60
  ),
  message text not null check (
    char_length(btrim(message)) between 1 and 600
  ),
  created_at timestamptz not null default now()
);

alter table public.birthday_wishes enable row level security;

-- Die Birthday-Wall auf der Webseite darf Wünsche lesen.
drop policy if exists "Geburtstagswuensche sind oeffentlich lesbar"
  on public.birthday_wishes;
create policy "Geburtstagswuensche sind oeffentlich lesbar"
on public.birthday_wishes for select
to anon
using (true);

-- Besucher dürfen neue Wünsche absenden, aber bestehende Einträge
-- nicht bearbeiten oder löschen.
drop policy if exists "Jeder darf einen Geburtstagswunsch senden"
  on public.birthday_wishes;
create policy "Jeder darf einen Geburtstagswunsch senden"
on public.birthday_wishes for insert
to anon
with check (
  char_length(btrim(message)) between 1 and 600
  and (
    guest_name is null
    or char_length(btrim(guest_name)) between 1 and 60
  )
);


/* ---------- FOTOS (Storage) ---------- */

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "Fotos sind oeffentlich sichtbar" on storage.objects;
create policy "Fotos sind oeffentlich sichtbar"
on storage.objects for select
to anon
using (bucket_id = 'photos');

drop policy if exists "Jeder darf Fotos hochladen" on storage.objects;
create policy "Jeder darf Fotos hochladen"
on storage.objects for insert
to anon
with check (bucket_id = 'photos');
